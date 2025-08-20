import { NextResponse } from "next/server";

export async function GET() {
	const healthData = {
		status: "healthy",
		timestamp: new Date().toISOString(),
		uptime: process.uptime(),
		version: "0.0.1",
		environment: process.env.NODE_ENV || "development",
		services: {
			telegram_bot: process.env.TELEGRAM_BOT_TOKEN
				? "configured"
				: "not_configured",
			google_sheets: process.env.GOOGLE_SHEETS_API_KEY
				? "configured"
				: "not_configured",
		},
	};

	return NextResponse.json(healthData, {
		status: 200,
		headers: {
			"Cache-Control": "no-cache, no-store, must-revalidate",
		},
	});
}
