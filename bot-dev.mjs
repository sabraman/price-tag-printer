// Simple bot development script
import { config } from "dotenv";
import { Bot } from "grammy";

// Load .env.local file
config({ path: ".env.local" });

const bot = new Bot(process.env.TELEGRAM_BOT_TOKEN);

// Simple start command for testing
bot.command("start", (ctx) => {
	ctx.reply("🏷️ Добро пожаловать! Бот работает!");
});

console.log("🤖 Запуск бота...");

bot
	.start({
		onStart: (botInfo) => {
			console.log(`✅ Бот @${botInfo.username} запущен!`);
			console.log("💬 Отправьте /start боту для проверки");
		},
	})
	.catch((error) => {
		console.error("❌ Ошибка:", error);
	});
