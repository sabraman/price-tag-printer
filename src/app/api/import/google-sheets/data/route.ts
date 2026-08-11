import { NextRequest, NextResponse } from "next/server";
import { fetchGoogleSheetsData } from "@/lib/googleSheets";
import type { GoogleSheetsConfig } from "@/lib/googleSheetsTypes";

export const runtime = "nodejs";
export const maxDuration = 30;

interface ImportRequest {
	configs: GoogleSheetsConfig[];
}

function isRecord(value: unknown): value is Record<string, unknown> {
	return Boolean(value) && typeof value === "object";
}

function isGoogleSheetsConfig(value: unknown): value is GoogleSheetsConfig {
	if (!value || typeof value !== "object") {
		return false;
	}

	const config = value as Partial<GoogleSheetsConfig>;
	return (
		typeof config.sheetId === "string" &&
		config.sheetId.length > 0 &&
		Array.isArray(config.subSheetsIds) &&
		config.subSheetsIds.every((id) => typeof id === "string")
	);
}

function isImportRequest(value: unknown): value is ImportRequest {
	return (
		isRecord(value) &&
		Array.isArray(value.configs) &&
		value.configs.length > 0 &&
		value.configs.every(isGoogleSheetsConfig)
	);
}

export async function POST(request: NextRequest) {
	try {
		const body: unknown = await request.json();

		if (!isImportRequest(body)) {
			return NextResponse.json(
				{ success: false, error: "Invalid Google Sheets configuration" },
				{ status: 400 },
			);
		}

		const data = await fetchGoogleSheetsData(body.configs);
		return NextResponse.json({ success: true, data });
	} catch (error) {
		console.error("Google Sheets data API error:", error);
		return NextResponse.json(
			{
				success: false,
				error: error instanceof Error ? error.message : "Unknown error",
			},
			{ status: 500 },
		);
	}
}
