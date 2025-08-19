// Simple test to check if bot token works
import { Bot } from "grammy";

const bot = new Bot("your_bot_token");

try {
	const me = await bot.api.getMe();
	console.log("✅ Bot token is valid!");
	console.log(`Bot username: @${me.username}`);
	console.log(`Bot ID: ${me.id}`);
} catch (error) {
	console.error("❌ Bot token error:", error.message);
}

process.exit(0);
