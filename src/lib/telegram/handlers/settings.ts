import { bold, fmt } from "@grammyjs/parse-mode";
import { bot } from "../bot";
import {
	createConfirmationKeyboard,
	createMainMenuKeyboard,
	createSettingsMenuKeyboard,
} from "../keyboards";
import { escapeMarkdown } from "../utils/markdown";

// Reset settings handler
bot.callbackQuery("settings_reset", async (ctx) => {
	await ctx.answerCallbackQuery();

	const resetMessage = fmt`
${bold}🔄 Сброс настроек${bold}

Вы уверены, что хотите сбросить все настройки к значениям по умолчанию?

${bold}Это действие:${bold}
• Сбросит все темы
• Отключит скидки
• Очистит все товары
• Вернет настройки дизайна к исходным

${bold}Это действие необратимо!${bold}
	`;

	await ctx.editMessageText(escapeMarkdown(resetMessage.toString()), {
		reply_markup: createConfirmationKeyboard("reset_all"),
		parse_mode: "MarkdownV2",
	});
});

// Confirm reset handler
bot.callbackQuery("confirm_reset_all", async (ctx) => {
	await ctx.answerCallbackQuery();

	// Reset all session data to defaults
	ctx.session.items = [];
	ctx.session.design = false;
	ctx.session.designType = "default";
	ctx.session.discountAmount = 500;
	ctx.session.maxDiscountPercent = 5;
	ctx.session.themes = {
		default: {
			start: "#222222",
			end: "#dd4c9b",
			textColor: "#ffffff",
		},
		new: {
			start: "#222222",
			end: "#9cdd4c",
			textColor: "#ffffff",
		},
		sale: {
			start: "#222222",
			end: "#dd4c54",
			textColor: "#ffffff",
		},
		white: {
			start: "#ffffff",
			end: "#ffffff",
			textColor: "#000000",
		},
		black: {
			start: "#000000",
			end: "#000000",
			textColor: "#ffffff",
		},
		sunset: {
			start: "#ff7e5f",
			end: "#feb47b",
			textColor: "#ffffff",
		},
		ocean: {
			start: "#667eea",
			end: "#764ba2",
			textColor: "#ffffff",
		},
		forest: {
			start: "#134e5e",
			end: "#71b280",
			textColor: "#ffffff",
		},
		royal: {
			start: "#4c63d2",
			end: "#9c27b0",
			textColor: "#ffffff",
		},
		vintage: {
			start: "#8b4513",
			end: "#d2b48c",
			textColor: "#ffffff",
		},
		neon: {
			start: "#00ff00",
			end: "#ff00ff",
			textColor: "#000000",
		},
		monochrome: {
			start: "#4a4a4a",
			end: "#888888",
			textColor: "#ffffff",
		},
		silver: {
			start: "#c0c0c0",
			end: "#e8e8e8",
			textColor: "#000000",
		},
		charcoal: {
			start: "#2c2c2c",
			end: "#2c2c2c",
			textColor: "#ffffff",
		},
		paper: {
			start: "#f8f8f8",
			end: "#f0f0f0",
			textColor: "#333333",
		},
		ink: {
			start: "#1a1a1a",
			end: "#1a1a1a",
			textColor: "#ffffff",
		},
		snow: {
			start: "#ffffff",
			end: "#f5f5f5",
			textColor: "#000000",
		},
	};
	ctx.session.currentFont = "montserrat";
	ctx.session.discountText = "цена при подписке\nна телеграм канал";
	ctx.session.hasTableDesigns = false;
	ctx.session.hasTableDiscounts = false;
	ctx.session.showThemeLabels = true;
	ctx.session.cuttingLineColor = "#cccccc";
	ctx.session.editingItemId = undefined;
	ctx.session.awaitingInput = false;
	ctx.session.mode = "main";
	ctx.session.navigationStack = [];
	ctx.session.tempData = undefined;

	await ctx.editMessageText(
		fmt`✅ ${bold}Настройки сброшены!${bold}\n\nВсе настройки возвращены к значениям по умолчанию\\.`.toString(),
		{
			reply_markup: createMainMenuKeyboard(),
			parse_mode: "MarkdownV2",
		},
	);
});

// Statistics handler
bot.callbackQuery("settings_stats", async (ctx) => {
	await ctx.answerCallbackQuery();

	const itemsCount = ctx.session.items.length;
	const hasDiscount = ctx.session.design;
	const currentTheme = ctx.session.designType;
	const currentFont = ctx.session.currentFont;

	const statsMessage = fmt`
${bold}📊 Статистика${bold}

${bold}Товары:${bold}
• Всего товаров: ${itemsCount}
• Скидки: ${hasDiscount ? "включены" : "выключены"}

${bold}Дизайн:${bold}
• Текущая тема: ${currentTheme}
• Шрифт: ${currentFont}
• Метки: ${ctx.session.showThemeLabels ? "показывать" : "скрыть"}

${bold}Настройки скидок:${bold}
• Размер скидки: ${ctx.session.discountAmount}₽
• Максимальный процент: ${ctx.session.maxDiscountPercent}%

${bold}Дополнительно:${bold}
• Режим: ${ctx.session.mode}
• Редактируемый товар: ${ctx.session.editingItemId ? "есть" : "нет"}
	`;

	await ctx.editMessageText(escapeMarkdown(statsMessage.toString()), {
		reply_markup: createSettingsMenuKeyboard(),
		parse_mode: "MarkdownV2",
	});
});

// Help handler
bot.callbackQuery("settings_help", async (ctx) => {
	await ctx.answerCallbackQuery();

	const helpMessage = fmt`
${bold}ℹ️ Справка${bold}

${bold}🏠 Главное меню${bold}
Доступно всегда через кнопку "Главное меню"

${bold}📦 Управление товарами${bold}
• Добавляйте товары через режим редактирования
• Загружайте Excel файлы с товарами
• Редактируйте цены, названия, настройки

${bold}🎨 Настройка дизайна${bold}
• Выбирайте из 17 готовых тем
• Настраивайте скидки и проценты
• Меняйте шрифты и стили

${bold}📄 Создание PDF${bold}
• Генерируйте готовые файлы для печати
• Формат A4 с оптимальным размещением
• Поддержка градиентов и кастомных цветов

${bold}💡 Советы:${bold}
• Используйте режим редактирования для быстрых изменений
• Сохраняйте настройки дизайна для повторного использования
• Проверяйте предпросмотр перед генерацией PDF
	`;

	await ctx.editMessageText(escapeMarkdown(helpMessage.toString()), {
		reply_markup: createSettingsMenuKeyboard(),
		parse_mode: "MarkdownV2",
	});
});
