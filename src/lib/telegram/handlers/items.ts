import { createConversation } from "@grammyjs/conversations";
import { bold, fmt } from "@grammyjs/parse-mode";
import { InlineKeyboard } from "grammy";
import type { MyContext } from "../bot";
import { bot, generateUniqueId } from "../bot";
import {
	createConfirmationKeyboard,
	createEditModeKeyboard,
	createItemSelectionKeyboard,
	createItemsMenuKeyboard,
	createMainMenuKeyboard,
	createNumberInputKeyboard,
} from "../keyboards";
import { escapeMarkdown } from "../utils/markdown";

// Type for conversation - this matches the Grammy conversations type
type Conversation = {
	wait: () => Promise<MyContext>;
	external: <T>(fn: (ctx: MyContext) => T) => Promise<T>;
};

// Item type matching the SessionData interface
type Item = {
	id: number;
	data: string | number;
	price: number;
	discountPrice: number;
	designType?: string;
	hasDiscount?: boolean;
	priceFor2?: number;
	priceFrom3?: number;
};

// Items list handler
bot.callbackQuery("items_list", async (ctx) => {
	await ctx.answerCallbackQuery();

	const items = ctx.session.items;

	if (items.length === 0) {
		await ctx.editMessageText("📦 Список товаров пуст", {
			reply_markup: createItemsMenuKeyboard(0),
		});
		return;
	}

	// Create items list message
	let itemsList = fmt`${bold}📋 Список товаров${bold}\n\n`;

	items.slice(0, 10).forEach((item: Item, index: number) => {
		const price =
			item.discountPrice !== item.price
				? `${item.price}₽ → ${item.discountPrice}₽`
				: `${item.price}₽`;

		itemsList = fmt`${itemsList}${index + 1}. ${item.data} - ${price}\n`;
	});

	if (items.length > 10) {
		itemsList = fmt`${itemsList}\n... и еще ${items.length - 10} товаров`;
	}

	await ctx.editMessageText(itemsList.toString(), {
		reply_markup: createItemsMenuKeyboard(items.length),
		parse_mode: "MarkdownV2",
	});
});

// Edit mode handler
bot.callbackQuery("items_edit_mode", async (ctx) => {
	await ctx.answerCallbackQuery();

	ctx.session.mode = "edit_items";

	const editMessage = fmt`
${bold}✏️ Режим редактирования${bold}

В этом режиме вы можете:
• Добавлять новые товары
• Редактировать существующие
• Удалять ненужные товары

${
	ctx.session.items.length > 0
		? "Выберите товар для редактирования или добавьте новый:"
		: "Начните с добавления первого товара:"
}
	`;

	await ctx.editMessageText(editMessage.toString(), {
		reply_markup: createEditModeKeyboard(
			ctx.session.items,
			ctx.session.editingItemId,
		),
		parse_mode: "MarkdownV2",
	});
});

// Add item handler - starts conversation
async function addItemConversation(conversation: Conversation, ctx: MyContext) {
	await ctx.reply("📝 Введите название товара:");

	const nameCtx = await conversation.wait();
	const itemName = nameCtx.message?.text;

	if (!itemName) {
		await ctx.reply("❌ Некорректное название. Попробуйте еще раз.", {
			reply_markup: createEditModeKeyboard(
				ctx.session.items,
				ctx.session.editingItemId,
			),
		});
		return;
	}

	await ctx.reply("💰 Введите цену товара (только число):");

	const priceCtx = await conversation.wait();
	const priceText = priceCtx.message?.text;
	const price = Number(priceText);

	if (!priceText || Number.isNaN(price) || price <= 0) {
		await ctx.reply("❌ Некорректная цена. Введите положительное число.", {
			reply_markup: createEditModeKeyboard(
				ctx.session.items,
				ctx.session.editingItemId,
			),
		});
		return;
	}

	// Create new item
	const newItem = {
		id: generateUniqueId(),
		data: itemName,
		price: price,
		discountPrice: price, // Will be recalculated
	};

	// Add to session
	ctx.session.items.push(newItem);

	// Recalculate discount prices
	updateItemDiscountPrices(ctx);

	await ctx.reply(
		fmt`✅ Товар добавлен: ${bold}${itemName}${bold} - ${price}₽`.toString(),
		{
			reply_markup: createEditModeKeyboard(ctx.session.items, newItem.id),
			parse_mode: "MarkdownV2",
		},
	);
}

bot.use(createConversation(addItemConversation));

bot.callbackQuery("edit_add_item", (ctx) =>
	ctx.conversation.enter("addItemConversation"),
);
bot.callbackQuery("items_add_first", (ctx) =>
	ctx.conversation.enter("addItemConversation"),
);

// Select item for editing
bot.callbackQuery("edit_select_item", async (ctx) => {
	await ctx.answerCallbackQuery();

	await ctx.editMessageText(
		fmt`${bold}📋 Выберите товар для редактирования:${bold}`.toString(),
		{
			reply_markup: createItemSelectionKeyboard(ctx.session.items),
			parse_mode: "MarkdownV2",
		},
	);
});

// Handle item selection
bot.callbackQuery(/select_item_(\d+)/, async (ctx) => {
	await ctx.answerCallbackQuery();

	const itemId = Number(ctx.match?.[1]);
	const item = ctx.session.items.find((i) => i.id === itemId);

	if (!item) {
		await ctx.editMessageText("❌ Товар не найден", {
			reply_markup: createEditModeKeyboard(ctx.session.items),
		});
		return;
	}

	ctx.session.editingItemId = itemId;

	await ctx.editMessageText(
		fmt`
${bold}✏️ Редактирование товара${bold}

${bold}Название:${bold} ${item.data}
${bold}Цена:${bold} ${item.price}₽
${
	item.discountPrice !== item.price
		? fmt`${bold}Цена со скидкой:${bold} ${item.discountPrice}₽`
		: ""
}
${item.priceFor2 ? fmt`${bold}Цена за 2 шт:${bold} ${item.priceFor2}₽` : ""}
${item.priceFrom3 ? fmt`${bold}Цена от 3 шт:${bold} ${item.priceFrom3}₽` : ""}

Выберите что хотите изменить:
		`.toString(),
		{
			reply_markup: createEditModeKeyboard(ctx.session.items, itemId),
			parse_mode: "MarkdownV2",
		},
	);
});

// Edit item price
bot.callbackQuery(/edit_item_price_(\d+)/, async (ctx) => {
	await ctx.answerCallbackQuery();

	const itemId = Number(ctx.match?.[1]);
	const item = ctx.session.items.find((i) => i.id === itemId);

	if (!item) {
		return;
	}

	await ctx.editMessageText(
		fmt`${bold}💰 Изменение цены${bold} для ${item.data}\n\nТекущая цена: ${item.price}₽\n\nВыберите новую цену:`.toString(),
		{
			reply_markup: createNumberInputKeyboard("price", item.price),
			parse_mode: "MarkdownV2",
		},
	);
});

// Handle price selection
bot.callbackQuery(/set_price_(\d+)/, async (ctx) => {
	await ctx.answerCallbackQuery();

	const newPrice = Number(ctx.match?.[1]);
	const itemId = ctx.session.editingItemId;

	if (!itemId) return;

	const item = ctx.session.items.find((i) => i.id === itemId);
	if (!item) return;

	item.price = newPrice;
	updateItemDiscountPrices(ctx);

	await ctx.editMessageText(fmt`✅ Цена изменена на ${newPrice}₽`.toString(), {
		reply_markup: createEditModeKeyboard(ctx.session.items, itemId),
		parse_mode: "MarkdownV2",
	});
});

// Clear all items
bot.callbackQuery("items_clear", async (ctx) => {
	await ctx.answerCallbackQuery();

	await ctx.editMessageText(
		"🗑️ Вы уверены, что хотите удалить все товары?\n\nЭто действие нельзя отменить.",
		{
			reply_markup: createConfirmationKeyboard("clear_all"),
		},
	);
});

bot.callbackQuery("confirm_clear_all", async (ctx) => {
	await ctx.answerCallbackQuery();

	ctx.session.items = [];
	ctx.session.editingItemId = undefined;

	await ctx.editMessageText("✅ Все товары удалены", {
		reply_markup: createMainMenuKeyboard(),
	});
});

bot.callbackQuery("cancel_action", async (ctx) => {
	await ctx.answerCallbackQuery();

	await ctx.editMessageText("❌ Действие отменено", {
		reply_markup: createItemsMenuKeyboard(ctx.session.items.length),
	});
});

// Excel upload handler
bot.callbackQuery("items_upload", async (ctx) => {
	await ctx.answerCallbackQuery();

	const uploadMessage = fmt`
${bold}📁 Загрузка файлов${bold}

Выберите способ импорта данных:
	`;

	await ctx.editMessageText(escapeMarkdown(uploadMessage.toString()), {
		reply_markup: new InlineKeyboard()
			.text("📊 Excel файл", "items_upload_excel")
			.text("📋 Google Таблицы", "items_upload_sheets")
			.row()
			.text("🔙 Назад", "menu_items"),
		parse_mode: "MarkdownV2",
	});
});

// Excel upload handler
bot.callbackQuery("items_upload_excel", async (ctx) => {
	await ctx.answerCallbackQuery();

	ctx.session.mode = "awaiting_excel";
	ctx.session.awaitingInput = true;

	const uploadMessage = fmt`
${bold}📁 Загрузка Excel файла${bold}

${bold}📋 Поддерживаемая структура:${bold}
• Колонка A: Название товара
• Колонка B: Цена
• Колонка C: Дизайн \\(default/new/sale\\) \\- необязательно
• Колонка D: Скидка \\(да/нет\\) \\- необязательно  
• Колонка E: Цена за 2 шт \\- необязательно
• Колонка F: Цена от 3 шт \\- необязательно

📤 Отправьте Excel файл \\(\\.xlsx, \\.xls, \\.csv\\)
	`;

	await ctx.editMessageText(escapeMarkdown(uploadMessage.toString()), {
		reply_markup: new InlineKeyboard().text("🔙 Отменить", "menu_items"),
		parse_mode: "MarkdownV2",
	});
});

// Google Sheets handler
bot.callbackQuery("items_upload_sheets", async (ctx) => {
	await ctx.answerCallbackQuery();

	ctx.session.mode = "awaiting_google_sheets";
	ctx.session.awaitingInput = true;

	const sheetsMessage = fmt`
${bold}📊 Импорт из Google Таблиц${bold}

${bold}📋 Поддерживаемая структура:${bold}
• Колонка A: Название товара
• Колонка B: Цена
• Колонка C: Дизайн \\(default/new/sale\\) \\- необязательно
• Колонка D: Скидка \\(да/нет\\) \\- необязательно
• Колонка E: Цена за 2 шт \\- необязательно
• Колонка F: Цена от 3 шт \\- необязательно

🔗 ${bold}Пример таблицы:${bold}
https://docs\\.google\\.com/spreadsheets/d/1hib1AcPemuxn3\\_8JIn9lcMTsXBGSpC7b\\-vEBbHgvQw8/edit

📝 Отправьте ссылку на Google Таблицу
	`;

	await ctx.editMessageText(escapeMarkdown(sheetsMessage.toString()), {
		reply_markup: new InlineKeyboard().text("🔙 Отменить", "menu_items"),
		parse_mode: "MarkdownV2",
	});
});

// File upload processing
bot.on("message:document", async (ctx) => {
	if (ctx.session.mode !== "awaiting_excel" || !ctx.session.awaitingInput) {
		return;
	}

	try {
		const document = ctx.message.document;
		const fileName = document.file_name || "";
		const fileSize = document.file_size || 0;

		// Validate file type
		if (!fileName.match(/\.(xlsx|xls|csv)$/i)) {
			await ctx.reply(
				"❌ Неподдерживаемый формат файла.\n\nПоддерживаются: .xlsx, .xls, .csv",
				{
					reply_markup: new InlineKeyboard().text("🔙 Назад", "menu_items"),
				},
			);
			return;
		}

		// Validate file size (10MB limit)
		if (fileSize > 10 * 1024 * 1024) {
			await ctx.reply(
				"❌ Файл слишком большой (максимум 10MB).\n\nПопробуйте загрузить файл меньшего размера.",
				{
					reply_markup: new InlineKeyboard().text("🔙 Назад", "menu_items"),
				},
			);
			return;
		}

		// Show processing message
		const processingMsg = await ctx.reply(
			"⏳ Обрабатываю файл...\n\nПодождите, пожалуйста.",
		);

		try {
			// Get file
			const file = await ctx.getFile();
			const fileUrl = `https://api.telegram.org/file/bot${ctx.api.token}/${file.file_path}`;

			// Download and process file
			const response = await fetch(fileUrl);
			if (!response.ok) {
				throw new Error("Не удалось загрузить файл");
			}

			const arrayBuffer = await response.arrayBuffer();

			// Process Excel file using web app API
			const processResponse = await fetch(
				`${process.env.NEXT_PUBLIC_APP_URL || process.env.VERCEL_URL || "http://localhost:3000"}/api/process-excel`,
				{
					method: "POST",
					headers: {
						"Content-Type": "application/json",
					},
					body: JSON.stringify({
						fileData: Array.from(new Uint8Array(arrayBuffer)),
						fileName: fileName,
					}),
				},
			);

			if (!processResponse.ok) {
				throw new Error("Ошибка обработки файла на сервере");
			}

			const result = await processResponse.json();

			if (!result.success || !result.items || result.items.length === 0) {
				throw new Error(
					"Файл не содержит данных или имеет неправильный формат",
				);
			}

					// Add items to session
		const newItems = result.items.map((item: { data?: string; name?: string; price?: number; designType?: string; hasDiscount?: boolean; priceFor2?: number; priceFrom3?: number }) => ({
				id: generateUniqueId(),
				data: String(item.data || item.name || ""),
				price: Number(item.price || 0),
				discountPrice: Number(item.price || 0),
				designType: item.designType || "default",
				hasDiscount: item.hasDiscount || false,
				priceFor2: item.priceFor2 ? Number(item.priceFor2) : undefined,
				priceFrom3: item.priceFrom3 ? Number(item.priceFrom3) : undefined,
			}));

			ctx.session.items.push(...newItems);
			updateItemDiscountPrices(ctx);

			// Reset mode
			ctx.session.mode = "main";
			ctx.session.awaitingInput = false;

			// Delete processing message
			try {
				await ctx.api.deleteMessage(ctx.chat.id, processingMsg.message_id);
			} catch (deleteError) {
				// Ignore delete errors - message might already be deleted
				console.warn("Failed to delete processing message:", deleteError);
			}

			// Show success message
			await ctx.reply(
				fmt`✅ ${bold}Файл успешно обработан!${bold}\n\nДобавлено товаров: ${newItems.length}`.toString(),
				{
					reply_markup: createItemsMenuKeyboard(ctx.session.items.length),
					parse_mode: "MarkdownV2",
				},
			);
		} catch (error) {
			// Delete processing message
			try {
				await ctx.api.deleteMessage(ctx.chat.id, processingMsg.message_id);
			} catch (deleteError) {
				// Ignore delete errors - message might already be deleted
				console.warn("Failed to delete processing message:", deleteError);
			}

			console.error("Excel processing error:", error);
			await ctx.reply(
				`❌ Ошибка обработки файла:\n\n${error instanceof Error ? error.message : "Неизвестная ошибка"}`,
				{
					reply_markup: new InlineKeyboard().text("🔙 Назад", "menu_items"),
				},
			);
		}
	} catch (error) {
		console.error("File upload error:", error);
		await ctx.reply(
			"❌ Произошла ошибка при загрузке файла.\n\nПопробуйте еще раз или обратитесь к администратору.",
			{
				reply_markup: new InlineKeyboard().text("🔙 Назад", "menu_items"),
			},
		);
	}
});

// Google Sheets URL processing
bot.on("message:text", async (ctx) => {
	if (
		ctx.session.mode !== "awaiting_google_sheets" ||
		!ctx.session.awaitingInput
	) {
		return;
	}

	const text = ctx.message.text;

	// Check if it's a Google Sheets URL
	if (!text.includes("docs.google.com/spreadsheets")) {
		await ctx.reply(
			"❌ Это не ссылка на Google Таблицу.\n\nПожалуйста, отправьте корректную ссылку.",
			{
				reply_markup: new InlineKeyboard().text("🔙 Отменить", "menu_items"),
			},
		);
		return;
	}

	try {
		// Show processing message
		const processingMsg = await ctx.reply(
			"⏳ Загружаю данные из Google Таблиц...\n\nПодождите, пожалуйста.",
		);

		// Process Google Sheets using web app API
		const response = await fetch(
			`${process.env.NEXT_PUBLIC_APP_URL || process.env.VERCEL_URL || "http://localhost:3000"}/api/process-google-sheets`,
			{
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					url: text,
				}),
			},
		);

		if (!response.ok) {
			throw new Error("Ошибка обработки Google Таблицы");
		}

		const result = await response.json();

		if (!result.success || !result.items || result.items.length === 0) {
			throw new Error("Таблица не содержит данных или недоступна");
		}

		// Add items to session
		const newItems = result.items.map((item: { data?: string; name?: string; price?: number; designType?: string; hasDiscount?: boolean; priceFor2?: number; priceFrom3?: number }) => ({
			id: generateUniqueId(),
			data: String(item.data || item.name || ""),
			price: Number(item.price || 0),
			discountPrice: Number(item.price || 0),
			designType: item.designType || "default",
			hasDiscount: item.hasDiscount || false,
			priceFor2: item.priceFor2 ? Number(item.priceFor2) : undefined,
			priceFrom3: item.priceFrom3 ? Number(item.priceFrom3) : undefined,
		}));

		ctx.session.items.push(...newItems);
		updateItemDiscountPrices(ctx);

		// Reset mode
		ctx.session.mode = "main";
		ctx.session.awaitingInput = false;

		// Delete processing message
		await ctx.api.deleteMessage(ctx.chat.id, processingMsg.message_id);

		// Show success message
		await ctx.reply(
			fmt`✅ ${bold}Google Таблица успешно загружена!${bold}\n\nДобавлено товаров: ${newItems.length}`.toString(),
			{
				reply_markup: createItemsMenuKeyboard(ctx.session.items.length),
				parse_mode: "MarkdownV2",
			},
		);
	} catch (error) {
		console.error("Google Sheets processing error:", error);
		await ctx.reply(
			`❌ Ошибка загрузки Google Таблицы:\n\n${error instanceof Error ? error.message : "Неизвестная ошибка"}`,
			{
				reply_markup: new InlineKeyboard().text("🔙 Назад", "menu_items"),
			},
		);
	}
});

// Helper function to update discount prices
function updateItemDiscountPrices(ctx: MyContext) {
	const { design, discountAmount, maxDiscountPercent } = ctx.session;

	if (!design) return;

	ctx.session.items.forEach((item) => {
		const discountedPrice = item.price - discountAmount;
		const discountPercent = ((item.price - discountedPrice) / item.price) * 100;

		if (discountPercent > maxDiscountPercent) {
			item.discountPrice = Math.round(
				item.price - (item.price * maxDiscountPercent) / 100,
			);
		} else {
			item.discountPrice = Math.round(discountedPrice);
		}

		// Ensure discount price is not negative
		if (item.discountPrice < 0) {
			item.discountPrice = item.price;
		}
	});
}
