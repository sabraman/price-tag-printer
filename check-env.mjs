import { config } from "dotenv";

// Load environment variables
config({ path: ".env.local" });

// Determine the correct API URL based on environment
const getApiUrl = () => {
	// In development, always use localhost
	if (process.env.NODE_ENV === "development" || !process.env.NODE_ENV) {
		return "http://localhost:3000";
	}
	
	// In production, use the environment variable or a default
	return process.env.NEXTJS_API_URL || "https://your-domain.vercel.app";
};

const apiUrl = getApiUrl();
const isProduction = process.env.NODE_ENV === "production";

console.log("🔍 Environment Check");
console.log("==================");

console.log("TELEGRAM_BOT_TOKEN:", process.env.TELEGRAM_BOT_TOKEN ? "✅ Set" : "❌ Missing");
console.log("NODE_ENV:", process.env.NODE_ENV || "development (default)");
console.log("API URL:", apiUrl);
console.log("Environment:", isProduction ? "🚀 Production" : "🛠️ Development");

if (isProduction) {
	console.log("NEXTJS_API_URL (production):", process.env.NEXTJS_API_URL || "❌ Not set for production!");
} else {
	console.log("Using localhost for development ✅");
}

console.log("\n🤖 Bot Deployment Guide");
console.log("======================");
console.log("✅ For FULL bot with Google Sheets: pnpm bot:prod");
console.log("❌ Do NOT use simple-bot.mjs in production!");
console.log("❌ Do NOT use bot-dev.mjs in production!");

if (!process.env.TELEGRAM_BOT_TOKEN) {
	console.log("\n❌ TELEGRAM_BOT_TOKEN is missing!");
	console.log("Set it in .env.local or your environment");
}

if (isProduction && !process.env.NEXTJS_API_URL) {
	console.log("\n⚠️  WARNING: NEXTJS_API_URL not set for production!");
	console.log("Set it to your production domain (e.g., https://your-app.vercel.app)");
}
