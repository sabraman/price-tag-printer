// Simple environment validation for bot
import { config } from "dotenv";

// Load environment variables first (only in development)
if (process.env.NODE_ENV !== "production") {
	config({ path: ".env.local" });
}

// Get environment variables without validation during build
const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;

// Determine the correct API URL based on environment
const getApiUrl = (): string => {
	// In development, always use localhost
	if (process.env.NODE_ENV === "development") {
		return "http://localhost:3000";
	}

	// In production, use the environment variable or a default
	return process.env.NEXTJS_API_URL || "https://your-domain.vercel.app";
};

const NEXTJS_API_URL = getApiUrl();

// Validation function that can be called at runtime
export function validateBotEnv() {
	console.log("🔍 Validating bot environment...");

	if (!TELEGRAM_BOT_TOKEN) {
		console.error("❌ TELEGRAM_BOT_TOKEN не найден в переменных окружения!");
		throw new Error("❌ TELEGRAM_BOT_TOKEN не найден в переменных окружения!");
	}

	console.log("✅ Environment validation passed", {
		hasToken: !!TELEGRAM_BOT_TOKEN,
		apiUrl: NEXTJS_API_URL,
		nodeEnv: process.env.NODE_ENV,
		isProduction: process.env.NODE_ENV === "production",
	});
}

export const botEnv = {
	TELEGRAM_BOT_TOKEN: TELEGRAM_BOT_TOKEN || "",
	NODE_ENV: process.env.NODE_ENV || "development",
	NEXTJS_API_URL: NEXTJS_API_URL,
} as const;

// Log environment on import
console.log("🔧 Bot environment loaded", {
	hasToken: !!botEnv.TELEGRAM_BOT_TOKEN,
	apiUrl: botEnv.NEXTJS_API_URL,
	nodeEnv: botEnv.NODE_ENV,
	isProduction: botEnv.NODE_ENV === "production",
});
