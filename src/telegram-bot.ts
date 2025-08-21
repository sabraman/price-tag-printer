// Complete TypeScript Telegram bot with proper typing

import {
	type ConversationFlavor,
	conversations,
	createConversation,
} from "@grammyjs/conversations";
import {
	Bot,
	type Context,
	InlineKeyboard,
	InputFile,
	type SessionFlavor,
	session,
} from "grammy";
import { botEnv } from "./bot-env";
import { fetchGoogleSheetsData } from "./lib/googleSheets";
import {
	extractSheetIdFromUrl,
	type GoogleSheetsResponse,
} from "./lib/telegram/dataProcessor";
import {
	sendPreviewWithKeyboard,
	updatePreviewMessage,
	updatePreviewWithCaption,
} from "./lib/telegram/previewGenerator";
import { logger } from "./logger";
import { usePriceTagsStore } from "./store/priceTagsStore";

// Types for Grammy operations
type EditMessageOptions = {
	reply_markup?: InlineKeyboard;
	parse_mode?: "HTML" | "Markdown" | "MarkdownV2";
	disable_web_page_preview?: boolean;
};
type Conversation = {
	wait: () => Promise<MyContext>;
	external: <T>(fn: (ctx: MyContext) => T) => Promise<T>;
};

// Session data interface
interface SessionData {
	mode:
		| "main"
		| "edit_items"
		| "edit_themes"
		| "edit_settings"
		| "awaiting_excel"
		| "awaiting_google_sheets";
	items: Array<{
		id: number;
		data: string | number;
		price: number;
		discountPrice: number;
		designType?: string;
		hasDiscount?: boolean;
		priceFor2?: number;
		priceFrom3?: number;
	}>;
	design: boolean;
	designType: string;
	discountAmount: number;
	maxDiscountPercent: number;
	themes: {
		default: { start: string; end: string; textColor: string };
		new: { start: string; end: string; textColor: string };
		sale: { start: string; end: string; textColor: string };
		white: { start: string; end: string; textColor: string };
		black: { start: string; end: string; textColor: string };
		sunset: { start: string; end: string; textColor: string };
		ocean: { start: string; end: string; textColor: string };
		forest: { start: string; end: string; textColor: string };
		royal: { start: string; end: string; textColor: string };
		vintage: { start: string; end: string; textColor: string };
		neon: { start: string; end: string; textColor: string };
		monochrome: { start: string; end: string; textColor: string };
		silver: { start: string; end: string; textColor: string };
		charcoal: { start: string; end: string; textColor: string };
		paper: { start: string; end: string; textColor: string };
		ink: { start: string; end: string; textColor: string };
		snow: { start: string; end: string; textColor: string };
	};
	currentFont: string;
	discountText: string;
	hasTableDesigns: boolean;
	hasTableDiscounts: boolean;
	showThemeLabels: boolean;
	cuttingLineColor: string;
	editingItemId?: number;
	awaitingInput?: boolean;
}

// Item type
type Item = SessionData["items"][number];

// Custom context type
type MyContext = Context &
	SessionFlavor<SessionData> &
	ConversationFlavor<Context & SessionFlavor<SessionData>>;

// Export types for use in other modules
export type { SessionData, MyContext };

// Create bot instance
const bot = new Bot<MyContext>(botEnv.TELEGRAM_BOT_TOKEN);

logger.info("Bot instance created", undefined, {
	tokenLength: botEnv.TELEGRAM_BOT_TOKEN.length,
	environment: botEnv.NODE_ENV,
});

// Session setup with proper initialization
bot.use(
	session({
		initial: (): SessionData => {
			// Get themes from web app store
			const store = usePriceTagsStore.getState();
			return {
				mode: "main",
				items: [],
				design: false,
				designType: "default",
				discountAmount: 500,
				maxDiscountPercent: 5,
				themes: {
					default: store.themes.default,
					new: store.themes.new,
					sale: store.themes.sale,
					white: store.themes.white,
					black: store.themes.black,
					sunset: store.themes.sunset,
					ocean: store.themes.ocean,
					forest: store.themes.forest,
					royal: store.themes.royal,
					vintage: store.themes.vintage,
					neon: store.themes.neon,
					monochrome: store.themes.monochrome,
					silver: store.themes.silver,
					charcoal: store.themes.charcoal,
					paper: store.themes.paper,
					ink: store.themes.ink,
					snow: store.themes.snow,
				},
				currentFont: "montserrat",
				discountText: "цена при подписке\nна телеграм канал",
				hasTableDesigns: false,
				hasTableDiscounts: false,
				showThemeLabels: true,
				cuttingLineColor: "#cccccc",
			};
		},
	}),
);

// Add conversations middleware
bot.use(conversations());

// Utility function for safe message editing
async function safeEditMessage(
	ctx: MyContext,
	text: string,
	options: EditMessageOptions = {},
) {
	try {
		await ctx.editMessageText(text, options);
	} catch (error: unknown) {
		// Ignore "message not modified" errors - they're harmless
		if (
			error &&
			typeof error === "object" &&
			"description" in error &&
			typeof error.description === "string" &&
			error.description.includes("message is not modified")
		) {
			return;
		}

		// If there's no text in the message to edit (e.g., it's a photo/document),
		// send a new message instead
		if (
			error &&
			typeof error === "object" &&
			"description" in error &&
			typeof error.description === "string" &&
			error.description.includes("there is no text in the message to edit")
		) {
			logger.debug(
				"Cannot edit message with no text, sending new message instead",
				ctx,
			);
			await ctx.reply(text, options);
			return;
		}

		// Re-throw other errors
		throw error;
	}
}

// Helper functions for keyboards
function createMainMenuKeyboard(): InlineKeyboard {
	return new InlineKeyboard()
		.text("📦 Товары", "menu_items")
		.text("🎨 Дизайн", "menu_design")
		.row()
		.text("📄 Создать PDF", "generate_pdf")
		.text("⚙️ Настройки", "menu_settings");
}

function createItemsMenuKeyboard(itemsCount: number): InlineKeyboard {
	const keyboard = new InlineKeyboard();

	if (itemsCount > 0) {
		keyboard
			.text(`📋 Список товаров (${itemsCount})`, "items_list")
			.text("✏️ Режим редактирования", "items_edit_mode")
			.row()
			.text("🗑️ Очистить все", "items_clear")
			.row();
	} else {
		keyboard.text("➕ Добавить первый товар", "items_add_first").row();
	}

	keyboard
		.text("📁 Загрузить Excel", "items_upload_excel")
		.text("📊 Google Таблицы", "items_upload_sheets")
		.row()
		.text("🔙 Назад", "back_to_main");

	return keyboard;
}

function createDesignMenuKeyboard(): InlineKeyboard {
	return new InlineKeyboard()
		.text("🎨 Темы", "design_themes")
		.text("💰 Скидки", "design_discounts")
		.row()
		.text("🔤 Шрифт", "design_font")
		.text("🏷️ Метки", "design_labels")
		.row()
		.text("📏 Линии отреза", "design_cutting_lines")
		.text("🔙 Назад", "back_to_main");
}

function createThemeSelectionKeyboard(_currentTheme: string): InlineKeyboard {
	const keyboard = new InlineKeyboard();

	// Theme categories like in web app
	keyboard.text("🌙 Темные темы", "theme_category_dark").row();
	keyboard.text("☀️ Светлые темы", "theme_category_light").row();
	keyboard.text("⚪ Светлые монохром", "theme_category_light_mono").row();
	keyboard.text("⚫ Темные монохром", "theme_category_dark_mono").row();

	keyboard.text("🔙 Назад", "menu_design");
	return keyboard;
}

function createThemeCategoryKeyboard(
	category: string,
	currentTheme: string,
): InlineKeyboard {
	const keyboard = new InlineKeyboard();

	let themes: { key: string; name: string; desc: string }[] = [];

	switch (category) {
		case "dark":
			themes = [
				{ key: "default", name: "🎨 Стандартный", desc: "Базовый градиент" },
				{ key: "new", name: "🆕 Новинка", desc: "Зеленые акценты" },
				{ key: "sale", name: "🔥 Распродажа", desc: "Красные акценты" },
				{ key: "sunset", name: "🌅 Закат", desc: "Теплые тона" },
				{ key: "ocean", name: "🌊 Океан", desc: "Синие оттенки" },
				{ key: "forest", name: "🌲 Лес", desc: "Зеленая гамма" },
				{ key: "royal", name: "👑 Королевский", desc: "Фиолетовые тона" },
				{ key: "vintage", name: "📜 Винтаж", desc: "Ретро стиль" },
			];
			break;
		case "light":
			themes = [{ key: "neon", name: "💫 Неон", desc: "Яркие цвета" }];
			break;
		case "light_mono":
			themes = [
				{ key: "white", name: "⚪ Белый", desc: "Минимализм" },
				{ key: "snow", name: "❄️ Снег", desc: "Чистый белый" },
				{ key: "paper", name: "📄 Бумага", desc: "Офисный стиль" },
				{ key: "silver", name: "🔘 Серебро", desc: "Металлик" },
			];
			break;
		case "dark_mono":
			themes = [
				{ key: "black", name: "⚫ Черный", desc: "Элегантность" },
				{ key: "ink", name: "🖋️ Чернила", desc: "Глубокий черный" },
				{ key: "charcoal", name: "⬛ Уголь", desc: "Темно-серый" },
				{ key: "monochrome", name: "🔳 Монохром", desc: "Серые тона" },
			];
			break;
	}

	// Add themes in rows of 2
	for (let i = 0; i < themes.length; i += 2) {
		const theme1 = themes[i];
		const theme2 = themes[i + 1];

		const button1Text =
			theme1.key === currentTheme ? `✅ ${theme1.name}` : theme1.name;

		if (theme2) {
			const button2Text =
				theme2.key === currentTheme ? `✅ ${theme2.name}` : theme2.name;
			keyboard
				.text(button1Text, `theme_select_${theme1.key}`)
				.text(button2Text, `theme_select_${theme2.key}`)
				.row();
		} else {
			keyboard.text(button1Text, `theme_select_${theme1.key}`).row();
		}
	}

	keyboard.text("🔙 К категориям", "design_themes");
	return keyboard;
}

function createDiscountSettingsKeyboard(
	design: boolean,
	discountAmount: number,
	maxPercent: number,
): InlineKeyboard {
	return new InlineKeyboard()
		.text(
			design ? "✅ Скидки включены" : "❌ Скидки выключены",
			"toggle_discount",
		)
		.row()
		.text(`💰 Размер скидки: ${discountAmount}₽`, "set_discount_amount")
		.row()
		.text(`📊 Макс. процент: ${maxPercent}%`, "set_max_percent")
		.row()
		.text("📝 Текст скидки", "set_discount_text")
		.row()
		.text("🔙 Назад", "menu_design");
}

function createFontSelectionKeyboard(currentFont: string): InlineKeyboard {
	const fonts = [
		{ key: "Montserrat", name: "🔤 Montserrat", desc: "Современный" },
		{ key: "Nunito", name: "📝 Nunito", desc: "Дружелюбный" },
		{ key: "Inter", name: "💼 Inter", desc: "Профессиональный" },
		{ key: "Mont", name: "🎨 Mont", desc: "Стильный" },
	];

	const keyboard = new InlineKeyboard();

	// Add fonts in rows of 2
	for (let i = 0; i < fonts.length; i += 2) {
		const font1 = fonts[i];
		const font2 = fonts[i + 1];

		const button1Text =
			font1.key === currentFont ? `✅ ${font1.name}` : font1.name;

		if (font2) {
			const button2Text =
				font2.key === currentFont ? `✅ ${font2.name}` : font2.name;
			keyboard
				.text(button1Text, `font_select_${font1.key}`)
				.text(button2Text, `font_select_${font2.key}`)
				.row();
		} else {
			keyboard.text(button1Text, `font_select_${font1.key}`).row();
		}
	}

	keyboard.text("🔙 Назад", "menu_design");
	return keyboard;
}

// Generate unique ID
let uniqueIdCounter = 0;
let lastTimestamp = 0;

function generateUniqueId(): number {
	let timestamp = Date.now();
	if (timestamp <= lastTimestamp) {
		timestamp = lastTimestamp + 1;
	}
	lastTimestamp = timestamp;
	const uniqueId = timestamp * 1000 + ++uniqueIdCounter;
	if (uniqueIdCounter > 999) {
		uniqueIdCounter = 0;
	}
	return uniqueId;
}

// Helper function to calculate discount price matching web app logic
function calculateDiscountPrice(
	price: number,
	discountAmount: number,
	maxDiscountPercent: number,
): number {
	const discountedPrice = price - discountAmount;
	const discountPercent = ((price - discountedPrice) / price) * 100;

	// Apply max discount percent if needed
	if (discountPercent > maxDiscountPercent) {
		return Math.round(price - (price * maxDiscountPercent) / 100);
	}

	return Math.round(discountedPrice);
}

// Helper function to update discount prices for all items (matching web app logic exactly)
function updateItemDiscountPrices(ctx: MyContext) {
	if (!ctx.session?.items) return;

	const { design, discountAmount, maxDiscountPercent, hasTableDiscounts } =
		ctx.session;
	const designType = "table"; // Assuming table mode when hasTableDiscounts is true
	const useTableDiscounts = hasTableDiscounts && designType === "table";

	logger.debug("Updating item discount prices", ctx, {
		design,
		discountAmount,
		maxDiscountPercent,
		hasTableDiscounts,
		useTableDiscounts,
		itemCount: ctx.session.items.length,
	});

	let updatedCount = 0;

	ctx.session.items.forEach((item) => {
		const oldDiscountPrice = item.discountPrice;

		// First calculate the potential discount price (regardless of whether it's shown)
		const potentialDiscountPrice = calculateDiscountPrice(
			item.price,
			discountAmount,
			maxDiscountPercent,
		);

		// Then determine whether to apply it based on settings

		// Case 1: Table discounts enabled + item has specific discount setting
		if (useTableDiscounts && item.hasDiscount !== undefined) {
			item.discountPrice = item.hasDiscount
				? potentialDiscountPrice
				: item.price;
		}
		// Case 2: Table discounts enabled + item has NO specific setting
		else if (useTableDiscounts) {
			// For items without table setting, use the global design flag
			item.discountPrice = design ? potentialDiscountPrice : item.price;
		}
		// Case 3: Normal global discount mode
		else {
			item.discountPrice = design ? potentialDiscountPrice : item.price;
		}

		if (oldDiscountPrice !== item.discountPrice) {
			updatedCount++;
		}
	});

	logger.success("Item prices updated", ctx, {
		totalItems: ctx.session.items.length,
		updatedItems: updatedCount,
	});
}

// Error handler
bot.catch((err) => {
	const ctx = err.ctx;
	console.error(`❌ Error for user ${ctx.from?.id}:`, err.error);

	// Check if it's a "message not modified" error (safe to ignore)
	if (
		err.error &&
		typeof err.error === "object" &&
		"description" in err.error &&
		typeof err.error.description === "string" &&
		err.error.description.includes("message is not modified")
	) {
		console.log("ℹ️ Message not modified - this is normal behavior");
		return;
	}

	// Try to send error message to user for other errors
	ctx
		.reply(
			"❌ Произошла ошибка. Попробуйте еще раз или вернитесь в главное меню.",
			{
				reply_markup: createMainMenuKeyboard(),
			},
		)
		.catch(console.error);
});

// Start command
bot.command("start", async (ctx: MyContext) => {
	logger.command("start", ctx);
	logger.session("User started bot", ctx, {
		itemsCount: ctx.session?.items?.length || 0,
		mode: ctx.session?.mode || "new",
	});

	const welcomeMessage = `🏷️ <b>Добро пожаловать в генератор ценников!</b>

Этот бот поможет вам создавать красивые ценники для товаров.

<i>Возможности:</i>
• 📦 Управление товарами
• 🎨 Настройка дизайна и тем
• 📄 Генерация PDF для печати
• 📁 Загрузка Excel файлов
• 💰 Система скидок

Выберите действие:`;

	await ctx.reply(welcomeMessage, {
		reply_markup: createMainMenuKeyboard(),
		parse_mode: "HTML",
	});

	logger.success("Start message sent", ctx);
});

// Back to main menu
bot.callbackQuery("back_to_main", async (ctx: MyContext) => {
	logger.callback("back_to_main", ctx);
	await ctx.answerCallbackQuery();

	ctx.session.mode = "main";
	logger.session("Mode changed to main", ctx);

	const mainMessage = `🏠 <b>Главное меню</b>

Выберите действие:`;

	// Show preview if we have items
	if (ctx.session.items && ctx.session.items.length > 0) {
		try {
			await updatePreviewWithCaption(
				ctx,
				ctx.session,
				mainMessage,
				createMainMenuKeyboard(),
			);
			logger.success("Main menu with preview displayed (message edited)", ctx);
		} catch (_error) {
			// Fallback to text message if preview fails
			await safeEditMessage(ctx, mainMessage, {
				reply_markup: createMainMenuKeyboard(),
				parse_mode: "HTML",
			});
			logger.success("Main menu displayed (no preview)", ctx);
		}
	} else {
		// No items - just show text menu
		await safeEditMessage(ctx, mainMessage, {
			reply_markup: createMainMenuKeyboard(),
			parse_mode: "HTML",
		});
		logger.success("Main menu displayed", ctx);
	}
});

// Items menu
bot.callbackQuery("menu_items", async (ctx: MyContext) => {
	await ctx.answerCallbackQuery();
	ctx.session.mode = "edit_items";
	const itemsCount = ctx.session.items.length;

	const itemsMessage = `📦 <b>Управление товарами</b>

${itemsCount > 0 ? `Товаров в списке: ${itemsCount}` : "Список товаров пуст"}

${
	itemsCount > 0
		? "Вы можете просмотреть список, войти в режим редактирования или очистить все товары."
		: "Добавьте первый товар или загрузите Excel файл с товарами."
}`;

	// Show preview if we have items
	if (itemsCount > 0) {
		try {
			await updatePreviewWithCaption(
				ctx,
				ctx.session,
				itemsMessage,
				createItemsMenuKeyboard(itemsCount),
			);
			logger.success("Items menu with preview displayed (message edited)", ctx);
		} catch (_error) {
			// Fallback to text message if preview fails
			await safeEditMessage(ctx, itemsMessage, {
				reply_markup: createItemsMenuKeyboard(itemsCount),
				parse_mode: "HTML",
			});
			logger.success("Items menu displayed (no preview)", ctx);
		}
	} else {
		// No items - just show text menu
		await safeEditMessage(ctx, itemsMessage, {
			reply_markup: createItemsMenuKeyboard(itemsCount),
			parse_mode: "HTML",
		});
		logger.success("Items menu displayed", ctx);
	}
});

// Design menu
bot.callbackQuery("menu_design", async (ctx: MyContext) => {
	logger.callback("menu_design", ctx);
	await ctx.answerCallbackQuery();

	ctx.session.mode = "edit_themes";
	logger.session("Mode changed to edit_themes", ctx);

	const designMessage = `🎨 <b>Настройка дизайна</b>

Текущие настройки:
• Тема: ${ctx.session.designType}
• Скидки: ${ctx.session.design ? "включены" : "выключены"}
• Размер скидки: ${ctx.session.discountAmount}₽
• Максимальный процент: ${ctx.session.maxDiscountPercent}%
• Шрифт: ${ctx.session.currentFont}

Настройте внешний вид ваших ценников:`;

	// Update preview with design menu
	try {
		await updatePreviewWithCaption(
			ctx,
			ctx.session,
			designMessage,
			createDesignMenuKeyboard(),
		);
		logger.success("Design menu with preview displayed (message edited)", ctx);
	} catch (_error) {
		// Fallback to text message if preview fails
		await safeEditMessage(ctx, designMessage, {
			reply_markup: createDesignMenuKeyboard(),
			parse_mode: "HTML",
		});
		logger.success("Design menu displayed (no preview)", ctx);
	}
});

// Theme selection
bot.callbackQuery("design_themes", async (ctx: MyContext) => {
	logger.callback("design_themes", ctx);
	await ctx.answerCallbackQuery();

	const themesMessage = `🎨 <b>Выбор темы</b>

Выберите тему для ваших ценников:

Текущая тема: <b>${ctx.session.designType}</b>

📝 <b>Товар:</b> ${ctx.session.items[0]?.data || "ТОВАР ПРИМЕР"}
💰 <b>Цена:</b> ${ctx.session.items[0]?.price || 1000}₽
🔤 <b>Шрифт:</b> ${ctx.session.currentFont}
${ctx.session.design ? "🏷️ <b>Скидка:</b> включена" : ""}`;

	// Update preview with theme selection keyboard
	try {
		await updatePreviewWithCaption(
			ctx,
			ctx.session,
			themesMessage,
			createThemeSelectionKeyboard(ctx.session.designType),
			{ designType: ctx.session.designType },
		);
		logger.success(
			"Theme selection with preview displayed (message edited)",
			ctx,
			{ theme: ctx.session.designType },
		);
	} catch (_error) {
		logger.error("Failed to update theme selection with preview", _error, ctx);
		// Fallback to text-only menu
		await safeEditMessage(ctx, themesMessage, {
			reply_markup: createThemeSelectionKeyboard(ctx.session.designType),
			parse_mode: "HTML",
		});
	}
});

// Theme category handlers
bot.callbackQuery(/theme_category_(.+)/, async (ctx: MyContext) => {
	const category = ctx.match?.[1];
	if (!category) {
		await ctx.answerCallbackQuery("❌ Ошибка: не удалось определить категорию");
		return;
	}
	logger.callback(`theme_category_${category}`, ctx);
	await ctx.answerCallbackQuery();

	let categoryName = "";
	switch (category) {
		case "dark":
			categoryName = "Темные темы";
			break;
		case "light":
			categoryName = "Светлые темы";
			break;
		case "light_mono":
			categoryName = "Светлые монохром";
			break;
		case "dark_mono":
			categoryName = "Темные монохром";
			break;
	}

	const categoryMessage = `🎨 <b>${categoryName}</b>

Выберите тему из категории:

Текущая тема: <b>${ctx.session.designType}</b>`;

	try {
		await updatePreviewWithCaption(
			ctx,
			ctx.session,
			categoryMessage,
			createThemeCategoryKeyboard(category, ctx.session.designType),
		);
		logger.success(
			`Theme category ${category} displayed (message edited)`,
			ctx,
		);
	} catch (_error) {
		await safeEditMessage(ctx, categoryMessage, {
			reply_markup: createThemeCategoryKeyboard(
				category,
				ctx.session.designType,
			),
			parse_mode: "HTML",
		});
		logger.success(`Theme category ${category} displayed (no preview)`, ctx);
	}
});

// Theme selection handler
bot.callbackQuery(/theme_select_(.+)/, async (ctx: MyContext) => {
	const themeKey = ctx.match?.[1];
	if (!themeKey) {
		await ctx.answerCallbackQuery("❌ Ошибка: не удалось определить тему");
		return;
	}
	logger.callback(`theme_select_${themeKey}`, ctx);
	await ctx.answerCallbackQuery(`Тема изменена на ${themeKey}`);

	const oldTheme = ctx.session.designType;
	ctx.session.designType = themeKey;

	logger.session("Theme changed", ctx, {
		oldTheme,
		newTheme: themeKey,
	});

	// Update the preview image with new theme and updated keyboard
	try {
		await updatePreviewMessage(
			ctx,
			ctx.session,
			createThemeSelectionKeyboard(themeKey),
			{ designType: themeKey },
		);
		logger.success("Theme preview updated successfully", ctx, {
			theme: themeKey,
		});
	} catch (error) {
		logger.error("Failed to update theme preview", error, ctx);
		// Fallback - send new message
		const confirmMessage = `✅ <b>Тема изменена!</b>

Новая тема: <b>${themeKey}</b>

📝 <b>Товар:</b> ${ctx.session.items[0]?.data || "ТОВАР ПРИМЕР"}
💰 <b>Цена:</b> ${ctx.session.items[0]?.price || 1000}₽
🔤 <b>Шрифт:</b> ${ctx.session.currentFont}
${ctx.session.design ? "🏷️ <b>Скидка:</b> включена" : ""}`;

		await sendPreviewWithKeyboard(
			ctx,
			ctx.session,
			confirmMessage,
			createThemeSelectionKeyboard(themeKey),
			{ designType: themeKey },
		);
	}

	logger.success("Theme updated", ctx, { theme: themeKey });
});

// Discount settings
bot.callbackQuery("design_discounts", async (ctx: MyContext) => {
	logger.callback("design_discounts", ctx);
	await ctx.answerCallbackQuery();

	const discountMessage = `💰 <b>Настройки скидок</b>

Управление системой скидок:

Статус: ${ctx.session.design ? "✅ Включены" : "❌ Выключены"}
Размер скидки: ${ctx.session.discountAmount}₽
Максимальный процент: ${ctx.session.maxDiscountPercent}%

Скидочный текст:
"${ctx.session.discountText}"`;

	// Update preview with discount settings
	try {
		await updatePreviewWithCaption(
			ctx,
			ctx.session,
			discountMessage,
			createDiscountSettingsKeyboard(
				ctx.session.design,
				ctx.session.discountAmount,
				ctx.session.maxDiscountPercent,
			),
		);
		logger.success("Discount settings with preview displayed", ctx);
	} catch (_error) {
		// Fallback to text message if preview fails
		await safeEditMessage(ctx, discountMessage, {
			reply_markup: createDiscountSettingsKeyboard(
				ctx.session.design,
				ctx.session.discountAmount,
				ctx.session.maxDiscountPercent,
			),
			parse_mode: "HTML",
		});
		logger.success("Discount settings displayed (no preview)", ctx);
	}

	logger.success("Discount settings displayed", ctx);
});

// Toggle discount
bot.callbackQuery("toggle_discount", async (ctx: MyContext) => {
	logger.callback("toggle_discount", ctx);
	await ctx.answerCallbackQuery();

	const oldStatus = ctx.session.design;
	ctx.session.design = !ctx.session.design;

	logger.session("Discount toggled", ctx, {
		oldStatus,
		newStatus: ctx.session.design,
	});

	// Update discount prices for all items
	updateItemDiscountPrices(ctx);

	const toggleMessage = `💰 <b>Скидки ${ctx.session.design ? "включены" : "выключены"}</b>

${
	ctx.session.design
		? "✅ Скидки теперь применяются ко всем товарам!"
		: "❌ Скидки отключены. Показываются только основные цены."
}

Товаров с обновленными ценами: ${ctx.session.items.length}`;

	// Update existing preview with new discount status
	try {
		await updatePreviewWithCaption(
			ctx,
			ctx.session,
			toggleMessage,
			createDiscountSettingsKeyboard(
				ctx.session.design,
				ctx.session.discountAmount,
				ctx.session.maxDiscountPercent,
			),
		);
		logger.success(
			"Discount status updated with preview (message edited)",
			ctx,
			{
				status: ctx.session.design,
			},
		);
	} catch (_error) {
		// Fallback to text message if preview fails
		await safeEditMessage(ctx, toggleMessage, {
			reply_markup: createDiscountSettingsKeyboard(
				ctx.session.design,
				ctx.session.discountAmount,
				ctx.session.maxDiscountPercent,
			),
			parse_mode: "HTML",
		});
		logger.success("Discount status updated (no preview)", ctx, {
			status: ctx.session.design,
		});
	}

	logger.success("Discount status updated", ctx, {
		enabled: ctx.session.design,
		itemsUpdated: ctx.session.items.length,
	});
});

// Font selection
bot.callbackQuery("design_font", async (ctx: MyContext) => {
	logger.callback("design_font", ctx);
	await ctx.answerCallbackQuery();

	const fontMessage = `🔤 <b>Выбор шрифта</b>

Выберите шрифт для ваших ценников:

Текущий шрифт: <b>${ctx.session.currentFont}</b>`;

	// Update preview with font selection
	try {
		await updatePreviewWithCaption(
			ctx,
			ctx.session,
			fontMessage,
			createFontSelectionKeyboard(ctx.session.currentFont),
		);
		logger.success(
			"Font selection with preview displayed (message edited)",
			ctx,
		);
	} catch (_error) {
		// Fallback to text message if preview fails
		await safeEditMessage(ctx, fontMessage, {
			reply_markup: createFontSelectionKeyboard(ctx.session.currentFont),
			parse_mode: "HTML",
		});
		logger.success("Font selection displayed (no preview)", ctx);
	}
});

// Font selection handler
bot.callbackQuery(/font_select_(.+)/, async (ctx: MyContext) => {
	const fontKey = ctx.match?.[1];
	if (!fontKey) {
		await ctx.answerCallbackQuery("❌ Ошибка: не удалось определить шрифт");
		return;
	}
	logger.callback(`font_select_${fontKey}`, ctx);
	await ctx.answerCallbackQuery();

	const oldFont = ctx.session.currentFont;
	ctx.session.currentFont = fontKey;

	logger.session("Font changed", ctx, {
		oldFont,
		newFont: fontKey,
	});

	const fontMessage = `🔤 <b>Выбор шрифта</b>

Выберите шрифт для ваших ценников:

Текущий шрифт: <b>${fontKey}</b>`;

	// Update existing preview message with new font
	try {
		await updatePreviewWithCaption(
			ctx,
			ctx.session,
			fontMessage,
			createFontSelectionKeyboard(fontKey),
			{ font: fontKey }, // Override font for preview
		);
		logger.success("Font updated with preview (message edited)", ctx, {
			font: fontKey,
		});
	} catch (_error) {
		// Fallback to text message if preview fails
		await safeEditMessage(ctx, fontMessage, {
			reply_markup: createFontSelectionKeyboard(fontKey),
			parse_mode: "HTML",
		});
		logger.success("Font updated (no preview, message edited)", ctx, {
			font: fontKey,
		});
	}
});

// Add item conversation with proper session handling for Grammy v2
async function addItemConversation(conversation: Conversation, ctx: MyContext) {
	try {
		logger.conversation("Starting add item conversation", ctx, "name_input");
		await ctx.reply("📝 Введите название товара:");

		const nameCtx = await conversation.wait();
		const itemName = nameCtx.message?.text;

		if (!itemName?.trim()) {
			// Get current items count using conversation.external
			const itemsLength = await conversation.external(
				(ctx: MyContext) => ctx.session?.items?.length || 0,
			);

			await ctx.reply("❌ Некорректное название. Попробуйте еще раз.", {
				reply_markup: createItemsMenuKeyboard(itemsLength),
			});
			return;
		}

		await ctx.reply("💰 Введите цену товара (только число):");

		const priceCtx = await conversation.wait();
		const priceText = priceCtx.message?.text;
		const price = Number(priceText);

		if (!priceText || Number.isNaN(price) || price <= 0) {
			// Get current items count using conversation.external
			const itemsLength = await conversation.external(
				(ctx: MyContext) => ctx.session?.items?.length || 0,
			);

			await ctx.reply("❌ Некорректная цена. Введите положительное число.", {
				reply_markup: createItemsMenuKeyboard(itemsLength),
			});
			return;
		}

		// Create new item
		const newItem = {
			id: generateUniqueId(),
			data: itemName.trim(),
			price: price,
			discountPrice: price,
		};

		// Add to session using conversation.external
		const itemsLength = await conversation.external((ctx: MyContext) => {
			// Ensure session exists and items array is initialized
			if (!ctx.session) {
				throw new Error("Session is undefined");
			}

			if (!ctx.session.items) {
				ctx.session.items = [];
			}

			// Add the new item
			ctx.session.items.push(newItem);

			return ctx.session.items.length;
		});

		await ctx.reply(`✅ Товар добавлен: <b>${itemName}</b> - ${price}₽`, {
			reply_markup: createItemsMenuKeyboard(itemsLength),
			parse_mode: "HTML",
		});
	} catch (error) {
		console.error("Error in addItemConversation:", error);
		await ctx.reply("❌ Произошла ошибка при добавлении товара.", {
			reply_markup: createMainMenuKeyboard(),
		});
	}
}

bot.use(createConversation(addItemConversation));

// Excel upload handler
bot.callbackQuery("items_upload_excel", async (ctx: MyContext) => {
	logger.callback("items_upload_excel", ctx);
	await ctx.answerCallbackQuery();

	ctx.session.mode = "awaiting_excel";
	ctx.session.awaitingInput = true;

	const uploadMessage = `📁 <b>Загрузка Excel файла</b>

📋 <b>Поддерживаемая структура:</b>
• Колонка A: Название товара
• Колонка B: Цена
• Колонка C: Дизайн (default/new/sale) - необязательно
• Колонка D: Скидка (да/нет) - необязательно  
• Колонка E: Цена за 2 шт - необязательно
• Колонка F: Цена от 3 шт - необязательно

📤 Отправьте Excel файл (.xlsx, .xls, .csv)`;

	await safeEditMessage(ctx, uploadMessage, {
		reply_markup: new InlineKeyboard().text("🔙 Отменить", "menu_items"),
		parse_mode: "HTML",
	});

	logger.success("Excel upload mode enabled", ctx);
});

// Google Sheets handler
bot.callbackQuery("items_upload_sheets", async (ctx: MyContext) => {
	logger.callback("items_upload_sheets", ctx);
	await ctx.answerCallbackQuery();

	ctx.session.mode = "awaiting_google_sheets";
	ctx.session.awaitingInput = true;

	const sheetsMessage = `📊 <b>Импорт из Google Таблиц</b>

📋 <b>Поддерживаемая структура:</b>
• Колонка A: Название товара
• Колонка B: Цена
• Колонка C: Дизайн (default/new/sale) - необязательно
• Колонка D: Скидка (да/нет) - необязательно
• Колонка E: Цена за 2 шт - необязательно
• Колонка F: Цена от 3 шт - необязательно

🔗 <b>Пример таблицы:</b>
https://docs.google.com/spreadsheets/d/1hib1AcPemuxn3_8JIn9lcMTsXBGSpC7b-vEBbHgvQw8/edit

📝 Отправьте ссылку на Google Таблицу`;

	await safeEditMessage(ctx, sheetsMessage, {
		reply_markup: new InlineKeyboard().text("🔙 Отменить", "menu_items"),
		parse_mode: "HTML",
	});

	logger.success("Google Sheets upload mode enabled", ctx);
});

// Edit item name conversation
async function editItemNameConversation(
	conversation: Conversation,
	ctx: MyContext,
) {
	try {
		const itemId = ctx.session.editingItemId;
		if (!itemId) {
			logger.warn("Edit name conversation started without editingItemId", ctx);
			return;
		}

		const item = ctx.session.items.find((i) => i.id === itemId);
		if (!item) {
			logger.warn("Item not found for name editing", ctx, { itemId });
			await ctx.reply("❌ Товар не найден");
			return;
		}

		logger.conversation("Starting edit name conversation", ctx, "name_input");

		await ctx.reply(
			`📝 Введите новое название для товара:\n\n<b>Текущее название:</b> ${item.data}`,
			{
				parse_mode: "HTML",
			},
		);

		const nameCtx = await conversation.wait();
		const newName = nameCtx.message?.text;

		if (!newName?.trim()) {
			await ctx.reply("❌ Некорректное название. Операция отменена.", {
				reply_markup: createItemEditMenuKeyboard(itemId),
			});
			return;
		}

		// Update item name using conversation.external
		await conversation.external((ctx: MyContext) => {
			const item = ctx.session.items.find((i) => i.id === itemId);
			if (item) {
				const oldName = item.data;
				item.data = newName.trim();

				logger.session("Item name updated", ctx, {
					itemId,
					oldName,
					newName: newName.trim(),
				});
			}
		});

		await ctx.reply(
			`✅ <b>Название изменено!</b>\n\nНовое название: <b>${newName.trim()}</b>`,
			{
				reply_markup: createItemEditMenuKeyboard(itemId),
				parse_mode: "HTML",
			},
		);

		logger.success("Item name updated via conversation", ctx, {
			itemId,
			newName: newName.trim(),
		});
	} catch (error) {
		logger.error("Error in edit name conversation", error, ctx);
		await ctx.reply("❌ Произошла ошибка при изменении названия.", {
			reply_markup: createMainMenuKeyboard(),
		});
	}
}

// Edit item price conversation
async function editItemPriceConversation(
	conversation: Conversation,
	ctx: MyContext,
) {
	try {
		const itemId = ctx.session.editingItemId;
		if (!itemId) {
			logger.warn("Edit price conversation started without editingItemId", ctx);
			return;
		}

		const item = ctx.session.items.find((i) => i.id === itemId);
		if (!item) {
			logger.warn("Item not found for price editing", ctx, { itemId });
			await ctx.reply("❌ Товар не найден");
			return;
		}

		logger.conversation("Starting edit price conversation", ctx, "price_input");

		await ctx.reply(
			`💰 Введите новую цену для товара "<b>${item.data}</b>":\n\n<b>Текущая цена:</b> ${item.price}₽`,
			{
				parse_mode: "HTML",
			},
		);

		const priceCtx = await conversation.wait();
		const priceText = priceCtx.message?.text;
		const newPrice = Number(priceText);

		if (!priceText || Number.isNaN(newPrice) || newPrice <= 0) {
			await ctx.reply(
				"❌ Некорректная цена. Введите положительное число.\n\nОперация отменена.",
				{
					reply_markup: createItemEditMenuKeyboard(itemId),
				},
			);
			return;
		}

		// Update item price using conversation.external
		await conversation.external((ctx: MyContext) => {
			const item = ctx.session.items.find((i) => i.id === itemId);
			if (item) {
				const oldPrice = item.price;
				item.price = newPrice;

				// Recalculate discount price
				updateItemDiscountPrices(ctx);

				logger.session("Item price updated", ctx, {
					itemId,
					oldPrice,
					newPrice,
					newDiscountPrice: item.discountPrice,
				});
			}
		});

		// Get updated item for display
		const updatedItem = await conversation.external((ctx: MyContext) =>
			ctx.session.items.find((i) => i.id === itemId),
		);

		const priceDisplay =
			updatedItem && updatedItem.discountPrice !== updatedItem.price
				? `${updatedItem.price}₽ (скидочная: ${updatedItem.discountPrice}₽)`
				: `${newPrice}₽`;

		await ctx.reply(
			`✅ <b>Цена изменена!</b>\n\nНовая цена: <b>${priceDisplay}</b>`,
			{
				reply_markup: createItemEditMenuKeyboard(itemId),
				parse_mode: "HTML",
			},
		);

		logger.success("Item price updated via conversation", ctx, {
			itemId,
			newPrice,
		});
	} catch (error) {
		logger.error("Error in edit price conversation", error, ctx);
		await ctx.reply("❌ Произошла ошибка при изменении цены.", {
			reply_markup: createMainMenuKeyboard(),
		});
	}
}

bot.use(createConversation(editItemNameConversation));
bot.use(createConversation(editItemPriceConversation));

bot.callbackQuery("items_add_first", (ctx: MyContext) => {
	logger.callback("items_add_first", ctx);
	return ctx.conversation.enter("addItemConversation");
});

// Edit mode for items
bot.callbackQuery("items_edit_mode", async (ctx: MyContext) => {
	logger.callback("items_edit_mode", ctx);
	await ctx.answerCallbackQuery();

	if (ctx.session.items.length === 0) {
		await safeEditMessage(
			ctx,
			"📦 Список товаров пуст.\n\nСначала добавьте товары.",
			{
				reply_markup: createItemsMenuKeyboard(0),
			},
		);
		return;
	}

	ctx.session.mode = "edit_items";

	const editMessage = `✏️ <b>Режим редактирования</b>

Товаров в списке: ${ctx.session.items.length}

Выберите товар для редактирования:`;

	await safeEditMessage(ctx, editMessage, {
		reply_markup: createItemEditSelectionKeyboard(ctx.session.items),
		parse_mode: "HTML",
	});

	logger.success("Edit mode displayed", ctx, {
		itemsCount: ctx.session.items.length,
	});
});

function createItemEditSelectionKeyboard(
	items: Item[],
	page = 0,
	perPage = 6,
): InlineKeyboard {
	const keyboard = new InlineKeyboard();
	const start = page * perPage;
	const end = start + perPage;
	const pageItems = items.slice(start, end);

	// Add items in rows of 2
	for (let i = 0; i < pageItems.length; i += 2) {
		const item1 = pageItems[i];
		const item2 = pageItems[i + 1];

		const price1 =
			item1.discountPrice !== item1.price
				? `${item1.price}₽→${item1.discountPrice}₽`
				: `${item1.price}₽`;

		if (item2) {
			const price2 =
				item2.discountPrice !== item2.price
					? `${item2.price}₽→${item2.discountPrice}₽`
					: `${item2.price}₽`;

			keyboard
				.text(`${item1.data} (${price1})`, `edit_item_${item1.id}`)
				.text(`${item2.data} (${price2})`, `edit_item_${item2.id}`)
				.row();
		} else {
			keyboard.text(`${item1.data} (${price1})`, `edit_item_${item1.id}`).row();
		}
	}

	// Pagination
	const navButtons = [];
	if (page > 0) {
		navButtons.push(["⬅️", `edit_items_page_${page - 1}`]);
	}
	if (end < items.length) {
		navButtons.push(["➡️", `edit_items_page_${page + 1}`]);
	}

	if (navButtons.length > 0) {
		navButtons.forEach(([text, data]) => {
			keyboard.text(text, data);
		});
		keyboard.row();
	}

	keyboard
		.text("➕ Добавить товар", "items_add_first")
		.row()
		.text("🔙 Назад", "menu_items");

	return keyboard;
}

// Individual item editing
bot.callbackQuery(/edit_item_(\d+)/, async (ctx: MyContext) => {
	const itemId = Number(ctx.match?.[1]);
	if (!ctx.match?.[1]) {
		await ctx.answerCallbackQuery("❌ Ошибка: не удалось определить ID товара");
		return;
	}
	logger.callback(`edit_item_${itemId}`, ctx);
	await ctx.answerCallbackQuery();

	const item = ctx.session.items.find((i) => i.id === itemId);
	if (!item) {
		logger.warn("Item not found for editing", ctx, { itemId });
		await ctx.reply("❌ Товар не найден", {
			reply_markup: createItemsMenuKeyboard(ctx.session.items.length),
		});
		return;
	}

	ctx.session.editingItemId = itemId;

	const priceDisplay =
		item.discountPrice !== item.price
			? `Цена: ${item.price}₽ → ${item.discountPrice}₽ (со скидкой)`
			: `Цена: ${item.price}₽`;

	const itemMessage = `✏️ <b>Редактирование товара</b>

<b>Название:</b> ${item.data}
<b>${priceDisplay}</b>
${item.priceFor2 ? `<b>Цена за 2 шт:</b> ${item.priceFor2}₽\n` : ""}${item.priceFrom3 ? `<b>Цена от 3 шт:</b> ${item.priceFrom3}₽\n` : ""}
Что хотите изменить?`;

	await safeEditMessage(ctx, itemMessage, {
		reply_markup: createItemEditMenuKeyboard(itemId),
		parse_mode: "HTML",
	});

	logger.success("Item editing menu displayed", ctx, {
		itemId,
		itemName: item.data,
	});
});

function createItemEditMenuKeyboard(itemId: number): InlineKeyboard {
	return new InlineKeyboard()
		.text("📝 Изменить название", `edit_name_${itemId}`)
		.text("💰 Изменить цену", `edit_price_${itemId}`)
		.row()
		.text("📊 Цены опт", `edit_bulk_${itemId}`)
		.text("🎨 Дизайн", `edit_design_${itemId}`)
		.row()
		.text("🗑️ Удалить товар", `delete_item_${itemId}`)
		.row()
		.text("🔙 К списку", "items_edit_mode");
}

// Edit item name handler
bot.callbackQuery(/edit_name_(\d+)/, async (ctx: MyContext) => {
	const itemId = Number(ctx.match?.[1]);
	logger.callback(`edit_name_${itemId}`, ctx);
	await ctx.answerCallbackQuery();

	ctx.session.editingItemId = itemId;
	return ctx.conversation.enter("editItemNameConversation");
});

// Edit item price handler
bot.callbackQuery(/edit_price_(\d+)/, async (ctx: MyContext) => {
	const itemId = Number(ctx.match?.[1]);
	logger.callback(`edit_price_${itemId}`, ctx);
	await ctx.answerCallbackQuery();

	ctx.session.editingItemId = itemId;
	return ctx.conversation.enter("editItemPriceConversation");
});

// Delete item handler
bot.callbackQuery(/delete_item_(\d+)/, async (ctx: MyContext) => {
	const itemId = Number(ctx.match?.[1]);
	logger.callback(`delete_item_${itemId}`, ctx);
	await ctx.answerCallbackQuery();

	const item = ctx.session.items.find((i) => i.id === itemId);
	if (!item) {
		logger.warn("Item not found for deletion", ctx, { itemId });
		return;
	}

	const confirmMessage = `🗑️ <b>Удаление товара</b>

Вы действительно хотите удалить товар:
<b>"${item.data}"</b> - ${item.price}₽

⚠️ Это действие нельзя отменить!`;

	await safeEditMessage(ctx, confirmMessage, {
		reply_markup: new InlineKeyboard()
			.text("✅ Да, удалить", `confirm_delete_${itemId}`)
			.text("❌ Отмена", `edit_item_${itemId}`),
		parse_mode: "HTML",
	});

	logger.info("Delete confirmation shown", ctx, {
		itemId,
		itemName: item.data,
	});
});

// Confirm delete item
bot.callbackQuery(/confirm_delete_(\d+)/, async (ctx: MyContext) => {
	const itemId = Number(ctx.match?.[1]);
	logger.callback(`confirm_delete_${itemId}`, ctx);
	await ctx.answerCallbackQuery();

	const itemIndex = ctx.session.items.findIndex((i) => i.id === itemId);
	if (itemIndex === -1) {
		logger.warn("Item not found for confirmed deletion", ctx, { itemId });
		return;
	}

	const deletedItem = ctx.session.items[itemIndex];
	ctx.session.items.splice(itemIndex, 1);

	// Clear editing item ID if it was the deleted item
	if (ctx.session.editingItemId === itemId) {
		ctx.session.editingItemId = undefined;
	}

	const confirmMessage = `✅ <b>Товар удален</b>

Удален: "${deletedItem.data}" - ${deletedItem.price}₽

Осталось товаров: ${ctx.session.items.length}`;

	if (ctx.session.items.length > 0) {
		await safeEditMessage(ctx, confirmMessage, {
			reply_markup: createItemEditSelectionKeyboard(ctx.session.items),
			parse_mode: "HTML",
		});
	} else {
		await safeEditMessage(ctx, `${confirmMessage}\n\nСписок товаров пуст.`, {
			reply_markup: createItemsMenuKeyboard(0),
			parse_mode: "HTML",
		});
	}

	logger.success("Item deleted", ctx, {
		itemId,
		itemName: deletedItem.data,
		remainingItems: ctx.session.items.length,
	});
});

// Clear all items
bot.callbackQuery("items_clear", async (ctx: MyContext) => {
	logger.callback("items_clear", ctx);
	await ctx.answerCallbackQuery();

	if (ctx.session.items.length === 0) {
		await safeEditMessage(ctx, "📦 Список товаров уже пуст.", {
			reply_markup: createItemsMenuKeyboard(0),
		});
		return;
	}

	const confirmMessage = `🗑️ <b>Очистка всех товаров</b>

Вы действительно хотите удалить ВСЕ товары?

📦 Товаров к удалению: ${ctx.session.items.length}

⚠️ Это действие нельзя отменить!`;

	await safeEditMessage(ctx, confirmMessage, {
		reply_markup: new InlineKeyboard()
			.text("✅ Да, удалить все", "confirm_clear_all")
			.text("❌ Отмена", "menu_items"),
		parse_mode: "HTML",
	});

	logger.info("Clear all confirmation shown", ctx, {
		itemsCount: ctx.session.items.length,
	});
});

// Confirm clear all items
bot.callbackQuery("confirm_clear_all", async (ctx: MyContext) => {
	logger.callback("confirm_clear_all", ctx);
	await ctx.answerCallbackQuery();

	const deletedCount = ctx.session.items.length;
	ctx.session.items = [];
	ctx.session.editingItemId = undefined;

	const confirmMessage = `✅ <b>Все товары удалены</b>

Удалено товаров: ${deletedCount}

Теперь список пуст. Добавьте новые товары.`;

	await safeEditMessage(ctx, confirmMessage, {
		reply_markup: createItemsMenuKeyboard(0),
		parse_mode: "HTML",
	});

	logger.success("All items cleared", ctx, { deletedCount });
});

// Items list
bot.callbackQuery("items_list", async (ctx: MyContext) => {
	await ctx.answerCallbackQuery();

	const items = ctx.session.items || [];

	if (items.length === 0) {
		try {
			await ctx.editMessageText("📦 Список товаров пуст", {
				reply_markup: createItemsMenuKeyboard(0),
			});
		} catch (error: unknown) {
			if (
				error &&
				typeof error === "object" &&
				"description" in error &&
				typeof error.description === "string" &&
				!error.description.includes("message is not modified")
			) {
				throw error;
			}
		}
		return;
	}

	let itemsList = `📋 <b>Список товаров</b>\n\n`;

	items.slice(0, 10).forEach((item, index) => {
		const price =
			item.discountPrice !== item.price
				? `${item.price}₽ → ${item.discountPrice}₽`
				: `${item.price}₽`;

		itemsList += `${index + 1}. ${item.data} - ${price}\n`;
	});

	if (items.length > 10) {
		itemsList += `\n... и еще ${items.length - 10} товаров`;
	}

	try {
		await ctx.editMessageText(itemsList, {
			reply_markup: createItemsMenuKeyboard(items.length),
			parse_mode: "HTML",
		});
	} catch (error: unknown) {
		// Ignore "message not modified" errors - they're harmless
		if (
			error &&
			typeof error === "object" &&
			"description" in error &&
			typeof error.description === "string" &&
			!error.description.includes("message is not modified")
		) {
			throw error;
		}
	}
});

// PDF generation with real API integration
bot.callbackQuery("generate_pdf", async (ctx: MyContext) => {
	logger.callback("generate_pdf", ctx);
	await ctx.answerCallbackQuery();

	const items = ctx.session.items || [];

	if (items.length === 0) {
		await safeEditMessage(
			ctx,
			'❌ Невозможно создать PDF: список товаров пуст.\n\nСначала добавьте товары через меню "📦 Товары".',
			{
				reply_markup: createMainMenuKeyboard(),
			},
		);
		logger.warn("PDF generation attempted with no items", ctx);
		return;
	}

	logger.info("Starting PDF generation process", ctx, {
		itemsCount: items.length,
	});

	await safeEditMessage(
		ctx,
		"⏳ Генерирую PDF файл...\n\nПожалуйста, подождите.",
	);

	try {
		// Import the PDF generator (dynamic import to avoid issues)
		const { generatePDF } = await import("./lib/telegram/pdf-generator");

		// Generate the PDF
		const pdfBuffer = await generatePDF(ctx.session, ctx);

		// Send the PDF file to user
		await ctx.replyWithDocument(
			new InputFile(pdfBuffer, `price-tags-${Date.now()}.pdf`),
			{
				caption: `✅ <b>PDF создан успешно!</b>\n\n📄 Файл содержит ${items.length} ценников\n🎨 Тема: ${ctx.session.designType}\n💰 Скидки: ${ctx.session.design ? "включены" : "выключены"}`,
				parse_mode: "HTML",
				reply_markup: createMainMenuKeyboard(),
			},
		);

		// Update the original message
		await safeEditMessage(
			ctx,
			`✅ <b>PDF отправлен!</b>\n\nФайл с ${items.length} ценниками отправлен выше.`,
			{
				reply_markup: createMainMenuKeyboard(),
				parse_mode: "HTML",
			},
		);

		logger.success("PDF generated and sent", ctx, {
			itemsCount: items.length,
			fileSize: pdfBuffer.length,
			theme: ctx.session.designType,
		});
	} catch (error) {
		logger.error("PDF generation failed", error, ctx);

		await safeEditMessage(
			ctx,
			"❌ Ошибка при создании PDF.\n\nПопробуйте еще раз или обратитесь к администратору.\n\n💡 Возможные причины:\n• Проблемы с сетью\n• Слишком много товаров\n• Технические неполадки",
			{
				reply_markup: createMainMenuKeyboard(),
			},
		);
	}
});

// Handle text messages for Google Sheets URLs
bot.on("message:text", async (ctx: MyContext) => {
	if (
		ctx.session.mode !== "awaiting_google_sheets" ||
		!ctx.session.awaitingInput
	) {
		return; // Ignore if not waiting for Google Sheets URL
	}

	if (!ctx.message?.text) {
		await ctx.reply("❌ Не удалось получить текст сообщения.");
		return;
	}
	const url = ctx.message.text.trim();

	logger.info("Google Sheets URL received", ctx, {
		url: `${url.substring(0, 50)}...`,
	});

	// Validate URL
	if (
		!url.includes("docs.google.com/spreadsheets") &&
		!url.includes("drive.google.com")
	) {
		await ctx.reply(
			"❌ Неверная ссылка на Google Таблицы.\n\nОтправьте корректную ссылку на Google Таблицу.",
			{
				reply_markup: new InlineKeyboard().text("🔙 Отмена", "menu_items"),
			},
		);
		return;
	}

	try {
		await ctx.reply(
			"⏳ Загружаю данные из Google Таблиц...\n\nПожалуйста, подождите.",
		);

		const sheetId = extractSheetIdFromUrl(url);

		if (!sheetId) {
			throw new Error("Не удалось извлечь ID таблицы из URL");
		}

		logger.debug("Fetching Google Sheets data", ctx, { sheetId });

		// Fetch data from Google Sheets
		const { processGoogleSheetsData } = await import(
			"./lib/telegram/dataProcessor"
		);
		const data: GoogleSheetsResponse = await fetchGoogleSheetsData([
			{
				sheetId: sheetId,
				subSheetsIds: ["0"],
			},
		]);

		// Process the data
		const result = processGoogleSheetsData(data);

		if (result.items.length === 0) {
			await ctx.reply(
				"❌ В таблице не найдено валидных товаров.\n\nПроверьте структуру данных и попробуйте снова.",
				{
					reply_markup: createItemsMenuKeyboard(ctx.session.items.length),
				},
			);
			return;
		}

		// Add items to session
		const oldItemCount = ctx.session.items.length;
		ctx.session.items.push(...result.items);

		// Update session settings
		ctx.session.hasTableDesigns = result.hasTableDesigns;
		ctx.session.hasTableDiscounts = result.hasTableDiscounts;

		// Update discount prices
		updateItemDiscountPrices(ctx);

		// Reset state
		ctx.session.awaitingInput = false;
		ctx.session.mode = "main";

		const successMessage = `✅ <b>Google Таблицы обработаны успешно!</b>

📊 <b>Результаты:</b>
• Добавлено товаров: ${result.items.length}
• Всего товаров: ${ctx.session.items.length}
• Дизайны в таблице: ${result.hasTableDesigns ? "✅" : "❌"}
• Скидки в таблице: ${result.hasTableDiscounts ? "✅" : "❌"}

${oldItemCount > 0 ? `\n💡 Новые товары добавлены к существующим ${oldItemCount} товарам.` : ""}`;

		await ctx.reply(successMessage, {
			reply_markup: createItemsMenuKeyboard(ctx.session.items.length),
			parse_mode: "HTML",
		});

		logger.success("Google Sheets processed", ctx, {
			addedItems: result.items.length,
			totalItems: ctx.session.items.length,
			hasTableDesigns: result.hasTableDesigns,
			hasTableDiscounts: result.hasTableDiscounts,
		});
	} catch (error) {
		logger.error("Google Sheets processing failed", error, ctx);

		ctx.session.awaitingInput = false;
		ctx.session.mode = "main";

		await ctx.reply(
			"❌ Ошибка при обработке Google Таблиц.\n\nПроверьте ссылку и доступность таблицы, затем попробуйте снова.",
			{
				reply_markup: createItemsMenuKeyboard(ctx.session.items.length),
			},
		);
	}
});

// Handle document uploads (Excel files)
bot.on("message:document", async (ctx: MyContext) => {
	if (ctx.session.mode !== "awaiting_excel" || !ctx.session.awaitingInput) {
		return; // Ignore if not waiting for Excel
	}

	if (!ctx.message?.document) {
		await ctx.reply("❌ Не удалось получить документ.");
		return;
	}

	logger.info("Document received", ctx, {
		fileName: ctx.message.document.file_name,
		fileSize: ctx.message.document.file_size,
	});

	const document = ctx.message.document;

	// Check file type
	if (
		!document.file_name?.endsWith(".xlsx") &&
		!document.file_name?.endsWith(".xls") &&
		!document.file_name?.endsWith(".csv")
	) {
		await ctx.reply(
			"❌ Неподдерживаемый формат файла.\n\nПожалуйста, отправьте файл Excel (.xlsx, .xls) или CSV (.csv)",
			{
				reply_markup: new InlineKeyboard().text("🔙 Отмена", "menu_items"),
			},
		);
		return;
	}

	// Check file size (max 10MB)
	if (document.file_size && document.file_size > 10 * 1024 * 1024) {
		await ctx.reply(
			"❌ Файл слишком большой (максимум 10MB).\n\nПожалуйста, используйте файл меньшего размера.",
			{
				reply_markup: new InlineKeyboard().text("🔙 Отмена", "menu_items"),
			},
		);
		return;
	}

	try {
		await ctx.reply("⏳ Обрабатываю Excel файл...\n\nПожалуйста, подождите.");

		// Download file
		const file = await ctx.getFile();
		const fileUrl = `https://api.telegram.org/file/bot${botEnv.TELEGRAM_BOT_TOKEN}/${file.file_path}`;

		logger.debug("Downloading Excel file", ctx, { fileUrl });

		// Download and process file
		const response = await fetch(fileUrl);
		const buffer = Buffer.from(await response.arrayBuffer());

		// Process Excel file using the new processor
		const { processExcelBuffer } = await import("./lib/telegram/dataProcessor");
		const result = processExcelBuffer(buffer);

		if (result.items.length === 0) {
			await ctx.reply(
				"❌ В файле не найдено валидных товаров.\n\nПроверьте формат данных и попробуйте снова.",
				{
					reply_markup: createItemsMenuKeyboard(ctx.session.items.length),
				},
			);
			return;
		}

		// Add items to session
		const oldItemCount = ctx.session.items.length;
		ctx.session.items.push(...result.items);

		// Update session settings
		ctx.session.hasTableDesigns = result.hasTableDesigns;
		ctx.session.hasTableDiscounts = result.hasTableDiscounts;

		// Update discount prices
		updateItemDiscountPrices(ctx);

		// Reset state
		ctx.session.awaitingInput = false;
		ctx.session.mode = "main";

		const successMessage = `✅ <b>Excel файл обработан успешно!</b>

📊 <b>Результаты:</b>
• Добавлено товаров: ${result.items.length}
• Всего товаров: ${ctx.session.items.length}
• Дизайны в таблице: ${result.hasTableDesigns ? "✅" : "❌"}
• Скидки в таблице: ${result.hasTableDiscounts ? "✅" : "❌"}

${oldItemCount > 0 ? `\n💡 Новые товары добавлены к существующим ${oldItemCount} товарам.` : ""}`;

		await ctx.reply(successMessage, {
			reply_markup: createItemsMenuKeyboard(ctx.session.items.length),
			parse_mode: "HTML",
		});

		logger.success("Excel file processed", ctx, {
			fileName: document.file_name,
			addedItems: result.items.length,
			totalItems: ctx.session.items.length,
			hasTableDesigns: result.hasTableDesigns,
			hasTableDiscounts: result.hasTableDiscounts,
		});
	} catch (error) {
		logger.error("Excel processing failed", error, ctx);

		ctx.session.awaitingInput = false;
		ctx.session.mode = "main";

		await ctx.reply(
			"❌ Ошибка при обработке Excel файла.\n\nПроверьте формат файла и попробуйте снова.",
			{
				reply_markup: createItemsMenuKeyboard(ctx.session.items.length),
			},
		);
	}
});

// Settings menu
bot.callbackQuery("menu_settings", async (ctx: MyContext) => {
	logger.callback("menu_settings", ctx);
	await ctx.answerCallbackQuery();

	const settingsMessage = `⚙️ <b>Настройки</b>

Общие настройки приложения:

🔤 <b>Текущий шрифт:</b> ${ctx.session.currentFont}
🏷️ <b>Метки тем:</b> ${ctx.session.showThemeLabels ? "включены" : "выключены"}
📏 <b>Цвет линий отреза:</b> ${ctx.session.cuttingLineColor}

Выберите настройку для изменения:`;

	try {
		await updatePreviewWithCaption(
			ctx,
			ctx.session,
			settingsMessage,
			new InlineKeyboard()
				.text("🔤 Изменить шрифт", "design_font")
				.text("🏷️ Переключить метки", "toggle_theme_labels")
				.row()
				.text("📏 Цвет линий отреза", "design_cutting_lines")
				.row()
				.text("🔙 Назад", "back_to_main"),
		);
		logger.success("Settings menu displayed (message edited)", ctx);
	} catch (_error) {
		await safeEditMessage(ctx, settingsMessage, {
			reply_markup: new InlineKeyboard()
				.text("🔤 Изменить шрифт", "design_font")
				.text("🏷️ Переключить метки", "toggle_theme_labels")
				.row()
				.text("📏 Цвет линий отреза", "design_cutting_lines")
				.row()
				.text("🔙 Назад", "back_to_main"),
			parse_mode: "HTML",
		});
		logger.success("Settings menu displayed (no preview)", ctx);
	}
});

// Theme labels toggle
bot.callbackQuery("toggle_theme_labels", async (ctx: MyContext) => {
	logger.callback("toggle_theme_labels", ctx);
	await ctx.answerCallbackQuery();

	ctx.session.showThemeLabels = !ctx.session.showThemeLabels;

	const settingsMessage = `⚙️ <b>Настройки</b>

Общие настройки приложения:

🔤 <b>Текущий шрифт:</b> ${ctx.session.currentFont}
🏷️ <b>Метки тем:</b> ${ctx.session.showThemeLabels ? "включены" : "выключены"}
📏 <b>Цвет линий отреза:</b> ${ctx.session.cuttingLineColor}

✅ <b>Метки тем ${ctx.session.showThemeLabels ? "включены" : "выключены"}!</b>`;

	try {
		await updatePreviewWithCaption(
			ctx,
			ctx.session,
			settingsMessage,
			new InlineKeyboard()
				.text("🔤 Изменить шрифт", "design_font")
				.text("🏷️ Переключить метки", "toggle_theme_labels")
				.row()
				.text("📏 Цвет линий отреза", "design_cutting_lines")
				.row()
				.text("🔙 Назад", "back_to_main"),
			{ showThemeLabels: ctx.session.showThemeLabels },
		);
		logger.success("Theme labels toggled (message edited)", ctx, {
			showThemeLabels: ctx.session.showThemeLabels,
		});
	} catch (_error) {
		await safeEditMessage(ctx, settingsMessage, {
			reply_markup: new InlineKeyboard()
				.text("🔤 Изменить шрифт", "design_font")
				.text("🏷️ Переключить метки", "toggle_theme_labels")
				.row()
				.text("📏 Цвет линий отреза", "design_cutting_lines")
				.row()
				.text("🔙 Назад", "back_to_main"),
			parse_mode: "HTML",
		});
		logger.success("Theme labels toggled (no preview)", ctx, {
			showThemeLabels: ctx.session.showThemeLabels,
		});
	}
});

// Design labels (redirect to settings)
bot.callbackQuery("design_labels", async (ctx: MyContext) => {
	logger.callback("design_labels", ctx);
	await ctx.answerCallbackQuery();

	// Redirect to theme labels toggle
	const settingsMessage = `🏷️ <b>Метки тем</b>

Метки показывают "NEW" и "SALE" на ценниках соответствующих тем.

Текущий статус: ${ctx.session.showThemeLabels ? "✅ Включены" : "❌ Выключены"}

Хотите переключить отображение меток?`;

	try {
		await updatePreviewWithCaption(
			ctx,
			ctx.session,
			settingsMessage,
			new InlineKeyboard()
				.text(
					ctx.session.showThemeLabels
						? "❌ Выключить метки"
						: "✅ Включить метки",
					"toggle_theme_labels",
				)
				.row()
				.text("🔙 Назад", "menu_design"),
		);
		logger.success("Theme labels settings displayed (message edited)", ctx);
	} catch (_error) {
		await safeEditMessage(ctx, settingsMessage, {
			reply_markup: new InlineKeyboard()
				.text(
					ctx.session.showThemeLabels
						? "❌ Выключить метки"
						: "✅ Включить метки",
					"toggle_theme_labels",
				)
				.row()
				.text("🔙 Назад", "menu_design"),
			parse_mode: "HTML",
		});
		logger.success("Theme labels settings displayed (no preview)", ctx);
	}
});

// Cutting lines settings
bot.callbackQuery("design_cutting_lines", async (ctx: MyContext) => {
	logger.callback("design_cutting_lines", ctx);
	await ctx.answerCallbackQuery();

	const cuttingMessage = `📏 <b>Линии отреза</b>

Настройка цвета линий для вырезания ценников:

Текущий цвет: <b>${ctx.session.cuttingLineColor}</b>

Выберите цвет линий отреза:`;

	const keyboard = new InlineKeyboard()
		.text("🔴 Красный", "cutting_line_color_#ff0000")
		.text("🟠 Оранжевый", "cutting_line_color_#ff8000")
		.row()
		.text("🟡 Желтый", "cutting_line_color_#ffff00")
		.text("🟢 Зеленый", "cutting_line_color_#00ff00")
		.row()
		.text("🔵 Синий", "cutting_line_color_#0000ff")
		.text("🟣 Фиолетовый", "cutting_line_color_#8000ff")
		.row()
		.text("⚫ Черный", "cutting_line_color_#000000")
		.text("⚪ Белый", "cutting_line_color_#ffffff")
		.row()
		.text("🔘 Серый", "cutting_line_color_#cccccc")
		.text("🔄 Авто", "cutting_line_color_auto")
		.row()
		.text("🔙 Назад", "menu_design");

	try {
		await updatePreviewWithCaption(ctx, ctx.session, cuttingMessage, keyboard);
		logger.success("Cutting lines settings displayed (message edited)", ctx);
	} catch (_error) {
		await safeEditMessage(ctx, cuttingMessage, {
			reply_markup: keyboard,
			parse_mode: "HTML",
		});
		logger.success("Cutting lines settings displayed (no preview)", ctx);
	}
});

// Cutting line color selection
bot.callbackQuery(/cutting_line_color_(.+)/, async (ctx: MyContext) => {
	const color = ctx.match?.[1];
	if (!color) {
		await ctx.answerCallbackQuery("❌ Ошибка: не удалось определить цвет");
		return;
	}
	logger.callback(`cutting_line_color_${color}`, ctx);
	await ctx.answerCallbackQuery();

	if (color === "auto") {
		ctx.session.cuttingLineColor = "#cccccc"; // Default auto color
	} else {
		ctx.session.cuttingLineColor = color;
	}

	const cuttingMessage = `📏 <b>Линии отреза</b>

Настройка цвета линий для вырезания ценников:

✅ <b>Цвет изменен на: ${color === "auto" ? "Автоматический" : color}</b>

Выберите цвет линий отреза:`;

	const keyboard = new InlineKeyboard()
		.text("🔴 Красный", "cutting_line_color_#ff0000")
		.text("🟠 Оранжевый", "cutting_line_color_#ff8000")
		.row()
		.text("🟡 Желтый", "cutting_line_color_#ffff00")
		.text("🟢 Зеленый", "cutting_line_color_#00ff00")
		.row()
		.text("🔵 Синий", "cutting_line_color_#0000ff")
		.text("🟣 Фиолетовый", "cutting_line_color_#8000ff")
		.row()
		.text("⚫ Черный", "cutting_line_color_#000000")
		.text("⚪ Белый", "cutting_line_color_#ffffff")
		.row()
		.text("🔘 Серый", "cutting_line_color_#cccccc")
		.text("🔄 Авто", "cutting_line_color_auto")
		.row()
		.text("🔙 Назад", "menu_design");

	try {
		await updatePreviewWithCaption(ctx, ctx.session, cuttingMessage, keyboard, {
			cuttingLineColor: ctx.session.cuttingLineColor,
		});
		logger.success("Cutting line color updated (message edited)", ctx, {
			color,
		});
	} catch (_error) {
		await safeEditMessage(ctx, cuttingMessage, {
			reply_markup: keyboard,
			parse_mode: "HTML",
		});
		logger.success("Cutting line color updated (no preview)", ctx, { color });
	}
});

// Discount amount setting (placeholder)
bot.callbackQuery("set_discount_amount", async (ctx: MyContext) => {
	logger.callback("set_discount_amount", ctx);
	await ctx.answerCallbackQuery(
		"Настройка размера скидки будет добавлена в следующих версиях 🚧",
	);
});

// Max discount percent setting (placeholder)
bot.callbackQuery("set_max_percent", async (ctx: MyContext) => {
	logger.callback("set_max_percent", ctx);
	await ctx.answerCallbackQuery(
		"Настройка максимального процента будет добавлена в следующих версиях 🚧",
	);
});

// Discount text setting
bot.callbackQuery("set_discount_text", async (ctx: MyContext) => {
	logger.callback("set_discount_text", ctx);
	await ctx.answerCallbackQuery();

	const textMessage = `📝 <b>Текст скидки</b>

Выберите готовый текст или установите свой:

Текущий текст:
"${ctx.session.discountText}"

Готовые варианты:`;

	const keyboard = new InlineKeyboard()
		.text("📢 Подписка на канал", "discount_text_channel")
		.row()
		.text("💬 Группа в Telegram", "discount_text_group")
		.row()
		.text("📱 При звонке", "discount_text_call")
		.row()
		.text("🛒 При покупке от N", "discount_text_bulk")
		.row()
		.text("🎯 Акция", "discount_text_promo")
		.row()
		.text("🔙 Назад", "design_discounts");

	try {
		await updatePreviewWithCaption(ctx, ctx.session, textMessage, keyboard);
		logger.success("Discount text settings displayed (message edited)", ctx);
	} catch (_error) {
		await safeEditMessage(ctx, textMessage, {
			reply_markup: keyboard,
			parse_mode: "HTML",
		});
		logger.success("Discount text settings displayed (no preview)", ctx);
	}
});

// Discount text presets
bot.callbackQuery(/discount_text_(.+)/, async (ctx: MyContext) => {
	const preset = ctx.match?.[1];
	logger.callback(`discount_text_${preset}`, ctx);
	await ctx.answerCallbackQuery();

	let newText = "";
	switch (preset) {
		case "channel":
			newText = "цена при подписке\nна телеграм канал";
			break;
		case "group":
			newText = "цена для участников\nнашей группы";
			break;
		case "call":
			newText = "цена при звонке\nпо телефону";
			break;
		case "bulk":
			newText = "цена при покупке\nот 3-х штук";
			break;
		case "promo":
			newText = "акционная цена\nдо конца месяца";
			break;
	}

	ctx.session.discountText = newText;

	const textMessage = `📝 <b>Текст скидки</b>

Выберите готовый текст или установите свой:

✅ <b>Текст изменен!</b>

Текущий текст:
"${ctx.session.discountText}"

Готовые варианты:`;

	const keyboard = new InlineKeyboard()
		.text("📢 Подписка на канал", "discount_text_channel")
		.row()
		.text("💬 Группа в Telegram", "discount_text_group")
		.row()
		.text("📱 При звонке", "discount_text_call")
		.row()
		.text("🛒 При покупке от N", "discount_text_bulk")
		.row()
		.text("🎯 Акция", "discount_text_promo")
		.row()
		.text("🔙 Назад", "design_discounts");

	try {
		await updatePreviewWithCaption(ctx, ctx.session, textMessage, keyboard, {
			discountText: ctx.session.discountText,
		});
		logger.success("Discount text updated (message edited)", ctx, {
			preset,
			newText,
		});
	} catch (_error) {
		await safeEditMessage(ctx, textMessage, {
			reply_markup: keyboard,
			parse_mode: "HTML",
		});
		logger.success("Discount text updated (no preview)", ctx, {
			preset,
			newText,
		});
	}
});

// Catch unhandled callbacks
bot.on("callback_query", async (ctx: MyContext) => {
	logger.callback("unhandled_callback", ctx);
	await ctx.answerCallbackQuery("Функция в разработке 🚧");
});

export { bot };

// Do NOT start polling automatically in production/serverless.
// Polling is started only in dev via scripts/poll-bot.mjs by setting BOT_POLLING=true.
if (process.env.BOT_POLLING === "true" && !process.env.VERCEL) {
	logger.info("🤖 Starting TypeScript bot in polling mode...");
	logger.info("Press Ctrl+C to stop");

	// Graceful shutdown
	process.once("SIGINT", () => {
		logger.info("🛑 Shutting down bot...");
		bot.stop();
		process.exit(0);
	});

	process.once("SIGTERM", () => {
		logger.info("🛑 Shutting down bot...");
		bot.stop();
		process.exit(1);
	});

	bot
		.start({
			onStart: (botInfo) => {
				logger.success(`Bot @${botInfo.username} started successfully!`);
				logger.info(`Bot ID: ${botInfo.id}`);
				logger.info("💬 Send /start to the bot to test");

				console.log("\n🎯 Available functionality:");
				console.log("- ✅ Main menu and navigation");
				console.log("- ✅ Item management (add/edit/delete)");
				console.log("- ✅ Item list display");
				console.log("- ✅ Design themes selection with previews");
				console.log("- ✅ Font selection with previews");
				console.log("- ✅ Discount configuration with previews");
				console.log("- ✅ Excel upload (.xlsx, .xls, .csv)");
				console.log("- ✅ Google Sheets import");
				console.log("- ✅ PDF generation with renderPriceTags");
				console.log("- ✅ Comprehensive logging");
				console.log("- ✅ Full TypeScript typing");
				console.log("- ✅ Error handling");
				console.log();
			},
		})
		.catch((error) => {
			logger.error("Failed to start bot", error);

			if (error.message?.includes("401")) {
				logger.error("Check TELEGRAM_BOT_TOKEN in .env.local file");
			}

			process.exit(1);
		});
}
