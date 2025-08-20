import { webhookCallback } from "grammy";
import { NextResponse } from "next/server";
import { env } from "@/env";
import { bot } from "@/lib/telegram/bot";

// Import all handlers
import "@/lib/telegram/commands/start";
import "@/lib/telegram/handlers/main-menu";
import "@/lib/telegram/handlers/items";

export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";

// Validate environment at runtime
function validateEnvironment() {
	if (!env.TELEGRAM_BOT_TOKEN) {
		throw new Error("TELEGRAM_BOT_TOKEN is required but not provided");
	}
}

export async function POST(request: Request) {
	try {
		// Validate environment before processing webhook
		validateEnvironment();

		// Use the webhook callback
		const webhookHandler = webhookCallback(bot, "std/http");
		return await webhookHandler(request);
	} catch (error) {
		console.error("Bot webhook error:", error);
		return NextResponse.json(
			{ error: "Bot configuration error" },
			{ status: 500 },
		);
	}
}
