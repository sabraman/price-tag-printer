// Script for local bot development using polling
// Run with: node --env-file=.env.local scripts/poll-bot.mjs

import { config } from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
config({ path: path.join(__dirname, "..", ".env.local") });

// Ensure polling flag is set
process.env.BOT_POLLING = process.env.BOT_POLLING || "true";

async function startBot() {
	try {
		console.log("🤖 Loading unified bot (TypeScript)...");

		// Import the unified TypeScript bot (compiled path in dist)
		const { bot } = await import("../dist/telegram-bot.js");

		console.log("🚀 Starting bot in polling mode...");
		console.log("Press Ctrl+C to stop");

		process.once("SIGINT", () => {
			console.log("\n🛑 Stopping bot...");
			bot.stop();
			process.exit(0);
		});

		process.once("SIGTERM", () => {
			console.log("\n🛑 Stopping bot...");
			bot.stop();
			process.exit(0);
		});

		await bot.start({
			onStart: (botInfo) => {
				console.log(`✅ Bot @${botInfo.username} started!`);
				console.log(`👤 Bot ID: ${botInfo.id}`);
			},
		});
	} catch (error) {
		console.error("❌ Failed to start bot:", error);
		if (error.message?.includes("401")) {
			console.error("🔑 Check TELEGRAM_BOT_TOKEN in .env.local");
		}
		process.exit(1);
	}
}

startBot();
