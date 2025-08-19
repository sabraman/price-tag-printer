import { bold, fmt, italic } from "@grammyjs/parse-mode";
import { bot } from "../bot";
import { createMainMenuKeyboard } from "../keyboards";

// Start command - показывает главное меню
bot.command("start", async (ctx) => {
	const welcomeMessage = fmt`
${bold}🏷️ Добро пожаловать в генератор ценников!${bold}

Этот бот поможет вам создавать красивые ценники для товаров.

${italic}Возможности:${italic}
• 📦 Управление товарами
• 🎨 Настройка дизайна и тем
• 📄 Генерация PDF для печати
• 📁 Загрузка Excel файлов
• 💰 Система скидок

Выберите действие:
	`;

	await ctx.reply(welcomeMessage.toString(), {
		reply_markup: createMainMenuKeyboard(),
		parse_mode: "MarkdownV2",
	});
});

// Help command
bot.command("help", async (ctx) => {
	const helpMessage = fmt`
${bold}📚 Справка по использованию${bold}

${bold}🏠 Главное меню${bold}
• Доступно всегда через кнопку "Главное меню"

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

	await ctx.reply(helpMessage.toString(), {
		reply_markup: createMainMenuKeyboard(),
		parse_mode: "MarkdownV2",
	});
});
