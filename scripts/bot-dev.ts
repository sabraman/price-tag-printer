// TypeScript bot development script
// Run with: pnpm tsx scripts/bot-dev.ts

import { config } from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables from .env.local
config({ path: path.join(__dirname, "..", ".env.local") });

console.log("🔧 Environment loaded:");
console.log("- NODE_ENV:", process.env.NODE_ENV);
console.log(
	"- TELEGRAM_BOT_TOKEN:",
	process.env.TELEGRAM_BOT_TOKEN ? "Present" : "Missing",
);

// Import bot and handlers
import { bot } from "../src/lib/telegram/bot.js";
import "../src/lib/telegram/commands/start.js";
import "../src/lib/telegram/handlers/main-menu.js";
import "../src/lib/telegram/handlers/items.js";

async function startBot() {
	try {
		console.log("🤖 Запуск Telegram бота...");
		console.log("Нажмите Ctrl+C для остановки\n");

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

		// Start bot with polling
		await bot.start({
			onStart: (botInfo) => {
				console.log(`✅ Бот @${botInfo.username} запущен успешно!`);
				console.log(`👤 ID бота: ${botInfo.id}`);
				console.log("💬 Отправьте /start боту для проверки\n");
			},
		});
	} catch (error) {
		console.error("❌ Ошибка запуска бота:", error);

		if (error && typeof error === 'object' && 'message' in error && typeof error.message === 'string' && error.message.includes("401")) {
			console.error(
				"🔑 Проверьте правильность TELEGRAM_BOT_TOKEN в .env.local",
			);
		}

		process.exit(1);
	}
}

startBot();
