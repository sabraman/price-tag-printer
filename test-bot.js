// Test bot environment and basic functionality
import { config } from "dotenv";

// Load environment variables
config({ path: ".env.local" });

// Import bot environment to test configuration
import("./src/bot-env.ts").then(({ botEnv, validateBotEnv }) => {
	console.log("🧪 Testing bot environment configuration...");
	
	try {
		// Validate environment
		validateBotEnv();
		
		console.log("📋 Bot Configuration:");
		console.log("- Token:", botEnv.TELEGRAM_BOT_TOKEN ? "✅ Present" : "❌ Missing");
		console.log("- API URL:", botEnv.NEXTJS_API_URL);
		console.log("- Environment:", botEnv.NODE_ENV);
		
		// Test if API URL is correctly set for development
		if (botEnv.NODE_ENV !== "production" && botEnv.NEXTJS_API_URL.includes("localhost")) {
			console.log("✅ Development environment correctly configured");
		} else if (botEnv.NODE_ENV === "production" && !botEnv.NEXTJS_API_URL.includes("localhost")) {
			console.log("✅ Production environment correctly configured");
		} else {
			console.log("⚠️  Environment configuration may need review");
		}
		
		console.log("\n🎯 Next steps:");
		console.log("1. Run: pnpm bot:dev (for development)");
		console.log("2. Or: pnpm bot:prod (for production)");
		
	} catch (error) {
		console.error("❌ Environment validation failed:", error.message);
	}
}).catch(error => {
	console.error("❌ Failed to load bot environment:", error);
});
