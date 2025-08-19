import { createConversation } from "@grammyjs/conversations";
import { bold, fmt } from "@grammyjs/parse-mode";
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

	items.slice(0, 10).forEach((item: any, index: number) => {
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
async function addItemConversation(conversation: any, ctx: MyContext) {
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
