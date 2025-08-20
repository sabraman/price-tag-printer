import { bold, fmt } from "@grammyjs/parse-mode";
import { bot } from "../bot";
import {
	createDesignMenuKeyboard,
	createItemsMenuKeyboard,
	createMainMenuKeyboard,
	createSettingsMenuKeyboard,
} from "../keyboards";
import { escapeMarkdown } from "../utils/markdown";

// Back to main menu handler
bot.callbackQuery("back_to_main", async (ctx) => {
	await ctx.answerCallbackQuery();

	// Reset session mode
	ctx.session.mode = "main";
	ctx.session.editingItemId = undefined;
	ctx.session.awaitingInput = false;

	const mainMessage = fmt`
${bold}🏠 Главное меню${bold}

Выберите действие:
	`;

	await ctx.editMessageText(escapeMarkdown(mainMessage.toString()), {
		reply_markup: createMainMenuKeyboard(),
		parse_mode: "MarkdownV2",
	});
});

// Items menu handler
bot.callbackQuery("menu_items", async (ctx) => {
	await ctx.answerCallbackQuery();

	ctx.session.mode = "edit_items";
	const itemsCount = ctx.session.items.length;

	const itemsMessage = fmt`
${bold}📦 Управление товарами${bold}

${itemsCount > 0 ? `Товаров в списке: ${itemsCount}` : "Список товаров пуст"}

${
	itemsCount > 0
		? "Вы можете просмотреть список, войти в режим редактирования или очистить все товары."
		: "Добавьте первый товар или загрузите Excel файл с товарами."
}
	`;

	await ctx.editMessageText(escapeMarkdown(itemsMessage.toString()), {
		reply_markup: createItemsMenuKeyboard(itemsCount),
		parse_mode: "MarkdownV2",
	});
});

// Design menu handler
bot.callbackQuery("menu_design", async (ctx) => {
	await ctx.answerCallbackQuery();

	ctx.session.mode = "edit_themes";

	const designMessage = fmt`
${bold}🎨 Настройка дизайна${bold}

Текущие настройки:
• Тема: ${ctx.session.designType}
• Скидки: ${ctx.session.design ? "включены" : "выключены"}
• Размер скидки: ${ctx.session.discountAmount}₽
• Максимальный процент: ${ctx.session.maxDiscountPercent}%
• Шрифт: ${ctx.session.currentFont}

Настройте внешний вид ваших ценников:
	`;

	await ctx.editMessageText(escapeMarkdown(designMessage.toString()), {
		reply_markup: createDesignMenuKeyboard(),
		parse_mode: "MarkdownV2",
	});
});

// Settings menu handler
bot.callbackQuery("menu_settings", async (ctx) => {
	await ctx.answerCallbackQuery();

	ctx.session.mode = "edit_settings";

	const settingsMessage = fmt`
${bold}⚙️ Настройки${bold}

Общие настройки приложения:

• Товаров: ${ctx.session.items.length}
• Режим дизайна: ${ctx.session.designType}
• Показывать метки: ${ctx.session.showThemeLabels ? "да" : "нет"}
• Цвет линий отреза: ${ctx.session.cuttingLineColor}
	`;

	await ctx.editMessageText(escapeMarkdown(settingsMessage.toString()), {
		reply_markup: createSettingsMenuKeyboard(),
		parse_mode: "MarkdownV2",
	});
});

// PDF generation handler
bot.callbackQuery("generate_pdf", async (ctx) => {
	await ctx.answerCallbackQuery();

	if (ctx.session.items.length === 0) {
		await ctx.editMessageText(
			'❌ Невозможно создать PDF: список товаров пуст.\n\nСначала добавьте товары через меню "📦 Товары".',
			{
				reply_markup: createMainMenuKeyboard(),
			},
		);
		return;
	}

	// Show progress message
	const progressMsg = await ctx.editMessageText(
		"⏳ Генерирую PDF файл...\n\nПожалуйста, подождите.",
	);

	try {
		// Generate PDF using web app API
		const response = await fetch(
			`${process.env.NEXT_PUBLIC_APP_URL || process.env.VERCEL_URL || "http://localhost:3000"}/api/generate-pdf`,
			{
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					items: ctx.session.items,
					settings: {
						design: ctx.session.design,
						designType: ctx.session.designType,
						discountAmount: ctx.session.discountAmount,
						maxDiscountPercent: ctx.session.maxDiscountPercent,
						themes: ctx.session.themes,
						currentFont: ctx.session.currentFont,
						discountText: ctx.session.discountText,
						showThemeLabels: ctx.session.showThemeLabels,
						cuttingLineColor: ctx.session.cuttingLineColor,
					},
				}),
			},
		);

		if (!response.ok) {
			throw new Error("Ошибка генерации PDF на сервере");
		}

		const result = await response.json();

		if (!result.success) {
			throw new Error(result.error || "Не удалось создать PDF файл");
		}

		// For now, send a success message since we don't have actual PDF file yet
		await ctx.editMessageText(
			escapeMarkdown(
				fmt`
✅ ${bold}PDF функция активирована!${bold}

📄 Обработано товаров: ${result.itemCount || ctx.session.items.length}
🎨 Тема: ${ctx.session.designType}
💰 Скидки: ${ctx.session.design ? "включены" : "выключены"}

💡 PDF генерация находится в разработке
Скоро будет доступна отправка готовых PDF файлов
				`.toString(),
			),
			{
				reply_markup: createMainMenuKeyboard(),
				parse_mode: "MarkdownV2",
			},
		);
	} catch (error) {
		console.error("PDF generation error:", error);

		// Delete progress message
		try {
			if (
				ctx.chat?.id &&
				typeof progressMsg !== "boolean" &&
				progressMsg.message_id
			) {
				await ctx.api.deleteMessage(ctx.chat.id, progressMsg.message_id);
			}
		} catch {}

		await ctx.reply(
			`❌ Ошибка при создании PDF:\n\n${error instanceof Error ? error.message : "Неизвестная ошибка"}\n\nПопробуйте еще раз или обратитесь к администратору.`,
			{
				reply_markup: createMainMenuKeyboard(),
			},
		);
	}
});
