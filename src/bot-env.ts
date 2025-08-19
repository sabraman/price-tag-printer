// Simple environment validation for bot
import { config } from "dotenv";

// Load environment variables first (only in development)
if (process.env.NODE_ENV !== "production") {
	config({ path: ".env.local" });
}

// Get environment variables without validation during build
const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;

// Validation function that can be called at runtime
export function validateBotEnv() {
	if (!TELEGRAM_BOT_TOKEN) {
		throw new Error("❌ TELEGRAM_BOT_TOKEN не найден в переменных окружения!");
	}
}

export const botEnv = {
	TELEGRAM_BOT_TOKEN: TELEGRAM_BOT_TOKEN || "",
	NODE_ENV: process.env.NODE_ENV || "development",
	NEXTJS_API_URL: process.env.NEXTJS_API_URL || "http://localhost:3000",
} as const;
