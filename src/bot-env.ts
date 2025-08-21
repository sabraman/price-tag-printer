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

	// In production/serverless, prefer explicit public app URL if provided
	if (process.env.NEXT_PUBLIC_APP_URL) {
		return process.env.NEXT_PUBLIC_APP_URL.replace(/\/$/, "");
	}

	// Otherwise, fallback to VERCEL_URL
	if (process.env.VERCEL_URL) {
		return `https://${process.env.VERCEL_URL}`;
	}

	// Or NEXTJS_API_URL (legacy)
	if (process.env.NEXTJS_API_URL) {
		return process.env.NEXTJS_API_URL.replace(/\/$/, "");
	}

	// Fallback (must be replaced in env)
	return "https://your-domain.vercel.app";
};

const NEXTJS_API_URL = getApiUrl();

const VERCEL_PROTECTION_BYPASS =
	process.env.VERCEL_PROTECTION_BYPASS || process.env.VERCEL_BYPASS_TOKEN || "";

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
		hasBypassToken: !!VERCEL_PROTECTION_BYPASS,
	});
}

export const botEnv = {
	TELEGRAM_BOT_TOKEN: TELEGRAM_BOT_TOKEN || "",
	NODE_ENV: process.env.NODE_ENV || "development",
	NEXTJS_API_URL: NEXTJS_API_URL,
	VERCEL_PROTECTION_BYPASS,
} as const;

// Log environment on import
console.log("🔧 Bot environment loaded", {
	hasToken: !!botEnv.TELEGRAM_BOT_TOKEN,
	apiUrl: botEnv.NEXTJS_API_URL,
	nodeEnv: botEnv.NODE_ENV,
	isProduction: botEnv.NODE_ENV === "production",
	hasBypassToken: !!botEnv.VERCEL_PROTECTION_BYPASS,
});
