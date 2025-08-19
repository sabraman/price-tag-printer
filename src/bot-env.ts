// Simple environment validation for bot
import { config } from "dotenv";

// Load environment variables first
config({ path: ".env.local" });

// Simple validation without t3-env
const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;

if (!TELEGRAM_BOT_TOKEN) {
	throw new Error("❌ TELEGRAM_BOT_TOKEN не найден в .env.local файле!");
}

export const botEnv = {
	TELEGRAM_BOT_TOKEN,
	NODE_ENV: process.env.NODE_ENV || "development",
	NEXTJS_API_URL: process.env.NEXTJS_API_URL || "http://localhost:3000",
} as const;
