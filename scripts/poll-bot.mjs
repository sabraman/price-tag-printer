// Script for local bot development using polling
// Run with: tsx scripts/poll-bot.js

import { config } from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
config({ path: path.join(__dirname, "..", ".env.local") });

async function startBot() {
	try {
		console.log("🤖 Загрузка бота...");

		// Import the bot after env vars are loaded - this will also register all handlers
		const { bot } = await import("../dist/lib/telegram/bot.js");

		// Import all handlers to register them
		await import("../dist/lib/telegram/commands/start.js");
		await import("../dist/lib/telegram/handlers/main-menu.js");
		await import("../dist/lib/telegram/handlers/items.js");

		console.log("✅ Обработчики загружены");

		// Start bot with polling
		console.log("🚀 Запуск бота в режиме polling...");
		console.log("Нажмите Ctrl+C для остановки");

		// Graceful shutdown
		process.once("SIGINT", () => {
			console.log("\n🛑 Остановка бота...");
			bot.stop();
			process.exit(0);
		});

		process.once("SIGTERM", () => {
			console.log("\n🛑 Остановка бота...");
			bot.stop();
			process.exit(0);
		});

		// Start polling
		await bot.start({
			onStart: (botInfo) => {
				console.log(`✅ Бот @${botInfo.username} запущен успешно!`);
				console.log(`👤 ID бота: ${botInfo.id}`);
				console.log("💬 Отправьте /start боту для проверки");
			},
		});
	} catch (error) {
		console.error("❌ Ошибка запуска бота:", error);

		if (error.message.includes("401")) {
			console.error(
				"🔑 Проверьте правильность TELEGRAM_BOT_TOKEN в .env.local",
			);
		}

		process.exit(1);
	}
}

startBot();
