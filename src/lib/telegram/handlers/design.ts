import { bold, fmt } from "@grammyjs/parse-mode";
import { InlineKeyboard } from "grammy";
import { bot } from "../bot";
import {
	createDesignMenuKeyboard,
	createDiscountSettingsKeyboard,
	createFontSelectionKeyboard,
	createNumberInputKeyboard,
	createThemeCategoryKeyboard,
	createThemeSelectionKeyboard,
} from "../keyboards";
import { escapeMarkdown } from "../utils/markdown";

// Theme selection handler
bot.callbackQuery("design_themes", async (ctx) => {
	await ctx.answerCallbackQuery();

	const themesMessage = fmt`
${bold}🎨 Выбор темы${bold}

Текущая тема: ${ctx.session.designType}

Выберите категорию тем:
	`;

	await ctx.editMessageText(escapeMarkdown(themesMessage.toString()), {
		reply_markup: createThemeSelectionKeyboard(ctx.session.designType, ""),
		parse_mode: "MarkdownV2",
	});
});

// Theme category handlers
bot.callbackQuery("theme_category_dark", async (ctx) => {
	await ctx.answerCallbackQuery();

	const categoryMessage = fmt`
${bold}🌙 Темные темы${bold}

Выберите тему:
	`;

	await ctx.editMessageText(escapeMarkdown(categoryMessage.toString()), {
		reply_markup: createThemeCategoryKeyboard("dark", ctx.session.designType),
		parse_mode: "MarkdownV2",
	});
});

bot.callbackQuery("theme_category_light", async (ctx) => {
	await ctx.answerCallbackQuery();

	const categoryMessage = fmt`
${bold}☀️ Светлые темы${bold}

Выберите тему:
	`;

	await ctx.editMessageText(escapeMarkdown(categoryMessage.toString()), {
		reply_markup: createThemeCategoryKeyboard("light", ctx.session.designType),
		parse_mode: "MarkdownV2",
	});
});

bot.callbackQuery("theme_category_light_mono", async (ctx) => {
	await ctx.answerCallbackQuery();

	const categoryMessage = fmt`
${bold}⚪ Светлые монохром${bold}

Выберите тему:
	`;

	await ctx.editMessageText(escapeMarkdown(categoryMessage.toString()), {
		reply_markup: createThemeCategoryKeyboard(
			"light_mono",
			ctx.session.designType,
		),
		parse_mode: "MarkdownV2",
	});
});

bot.callbackQuery("theme_category_dark_mono", async (ctx) => {
	await ctx.answerCallbackQuery();

	const categoryMessage = fmt`
${bold}⚫ Темные монохром${bold}

Выберите тему:
	`;

	await ctx.editMessageText(escapeMarkdown(categoryMessage.toString()), {
		reply_markup: createThemeCategoryKeyboard(
			"dark_mono",
			ctx.session.designType,
		),
		parse_mode: "MarkdownV2",
	});
});

// Theme selection handler
bot.callbackQuery(/theme_select_(.+)/, async (ctx) => {
	await ctx.answerCallbackQuery();

	const themeKey = ctx.match?.[1];
	if (!themeKey) return;

	ctx.session.designType = themeKey;

	await ctx.editMessageText(
		fmt`✅ ${bold}Тема изменена!${bold}\n\nВыбранная тема: ${themeKey}`.toString(),
		{
			reply_markup: createDesignMenuKeyboard(),
			parse_mode: "MarkdownV2",
		},
	);
});

// Discount settings handler
bot.callbackQuery("design_discounts", async (ctx) => {
	await ctx.answerCallbackQuery();

	const discountMessage = fmt`
${bold}💰 Настройки скидок${bold}

Текущие настройки:
• Статус: ${ctx.session.design ? "включены" : "выключены"}
• Размер скидки: ${ctx.session.discountAmount}₽
• Максимальный процент: ${ctx.session.maxDiscountPercent}%

Настройте скидки для ваших ценников:
	`;

	await ctx.editMessageText(escapeMarkdown(discountMessage.toString()), {
		reply_markup: createDiscountSettingsKeyboard(
			ctx.session.design,
			ctx.session.discountAmount,
			ctx.session.maxDiscountPercent,
		),
		parse_mode: "MarkdownV2",
	});
});

// Toggle discount handler
bot.callbackQuery("toggle_discount", async (ctx) => {
	await ctx.answerCallbackQuery();

	ctx.session.design = !ctx.session.design;

	const status = ctx.session.design ? "включены" : "выключены";

	await ctx.editMessageText(
		fmt`✅ ${bold}Скидки ${status}!${bold}`.toString(),
		{
			reply_markup: createDiscountSettingsKeyboard(
				ctx.session.design,
				ctx.session.discountAmount,
				ctx.session.maxDiscountPercent,
			),
			parse_mode: "MarkdownV2",
		},
	);
});

// Set discount amount handler
bot.callbackQuery("set_discount_amount", async (ctx) => {
	await ctx.answerCallbackQuery();

	const amountMessage = fmt`
${bold}💰 Размер скидки${bold}

Текущий размер: ${ctx.session.discountAmount}₽

Выберите новый размер скидки:
	`;

	await ctx.editMessageText(escapeMarkdown(amountMessage.toString()), {
		reply_markup: createNumberInputKeyboard(
			"discount",
			ctx.session.discountAmount,
		),
		parse_mode: "MarkdownV2",
	});
});

// Set max percent handler
bot.callbackQuery("set_max_percent", async (ctx) => {
	await ctx.answerCallbackQuery();

	const percentMessage = fmt`
${bold}📊 Максимальный процент скидки${bold}

Текущий процент: ${ctx.session.maxDiscountPercent}%

Выберите максимальный процент скидки:
	`;

	await ctx.editMessageText(escapeMarkdown(percentMessage.toString()), {
		reply_markup: createNumberInputKeyboard(
			"percent",
			ctx.session.maxDiscountPercent,
		),
		parse_mode: "MarkdownV2",
	});
});

// Handle discount amount selection
bot.callbackQuery(/set_discount_(\d+)/, async (ctx) => {
	await ctx.answerCallbackQuery();

	const amount = Number(ctx.match?.[1]);
	if (amount) {
		ctx.session.discountAmount = amount;

		await ctx.editMessageText(
			fmt`✅ ${bold}Размер скидки изменен!${bold}\n\nНовый размер: ${amount}₽`.toString(),
			{
				reply_markup: createDiscountSettingsKeyboard(
					ctx.session.design,
					ctx.session.discountAmount,
					ctx.session.maxDiscountPercent,
				),
				parse_mode: "MarkdownV2",
			},
		);
	}
});

// Handle percent selection
bot.callbackQuery(/set_percent_(\d+)/, async (ctx) => {
	await ctx.answerCallbackQuery();

	const percent = Number(ctx.match?.[1]);
	if (percent) {
		ctx.session.maxDiscountPercent = percent;

		await ctx.editMessageText(
			fmt`✅ ${bold}Максимальный процент изменен!${bold}\n\nНовый процент: ${percent}%`.toString(),
			{
				reply_markup: createDiscountSettingsKeyboard(
					ctx.session.design,
					ctx.session.discountAmount,
					ctx.session.maxDiscountPercent,
				),
				parse_mode: "MarkdownV2",
			},
		);
	}
});

// Font selection handler
bot.callbackQuery("design_font", async (ctx) => {
	await ctx.answerCallbackQuery();

	const fontMessage = fmt`
${bold}🔤 Выбор шрифта${bold}

Текущий шрифт: ${ctx.session.currentFont}

Выберите шрифт для ценников:
	`;

	await ctx.editMessageText(escapeMarkdown(fontMessage.toString()), {
		reply_markup: createFontSelectionKeyboard(ctx.session.currentFont),
		parse_mode: "MarkdownV2",
	});
});

// Font selection handler
bot.callbackQuery(/font_select_(.+)/, async (ctx) => {
	await ctx.answerCallbackQuery();

	const fontKey = ctx.match?.[1];
	if (!fontKey) return;

	ctx.session.currentFont = fontKey;

	await ctx.editMessageText(
		fmt`✅ ${bold}Шрифт изменен!${bold}\n\nВыбранный шрифт: ${fontKey}`.toString(),
		{
			reply_markup: createDesignMenuKeyboard(),
			parse_mode: "MarkdownV2",
		},
	);
});

// Labels toggle handler
bot.callbackQuery("design_labels", async (ctx) => {
	await ctx.answerCallbackQuery();

	ctx.session.showThemeLabels = !ctx.session.showThemeLabels;

	const status = ctx.session.showThemeLabels ? "включены" : "выключены";

	await ctx.editMessageText(
		fmt`✅ ${bold}Метки ${status}!${bold}\n\nПоказ меток NEW/SALE на ценниках: ${status}`.toString(),
		{
			reply_markup: createDesignMenuKeyboard(),
			parse_mode: "MarkdownV2",
		},
	);
});

// Cutting lines handler
bot.callbackQuery("design_cutting_lines", async (ctx) => {
	await ctx.answerCallbackQuery();

	const linesMessage = fmt`
${bold}📏 Линии отреза${bold}

Текущий цвет: ${ctx.session.cuttingLineColor}

Эта функция позволяет настроить цвет линий отреза на ценниках\\.

Для изменения цвета используйте веб\\-приложение\\.
	`;

	await ctx.editMessageText(escapeMarkdown(linesMessage.toString()), {
		reply_markup: new InlineKeyboard().text("🔙 Назад", "menu_design"),
		parse_mode: "MarkdownV2",
	});
});

// Discount text handler
bot.callbackQuery("set_discount_text", async (ctx) => {
	await ctx.answerCallbackQuery();

	const textMessage = fmt`
${bold}📝 Текст скидки${bold}

Текущий текст:
${ctx.session.discountText}

Для изменения текста скидки используйте веб\\-приложение\\.
	`;

	await ctx.editMessageText(escapeMarkdown(textMessage.toString()), {
		reply_markup: new InlineKeyboard().text("🔙 Назад", "design_discounts"),
		parse_mode: "MarkdownV2",
	});
});
