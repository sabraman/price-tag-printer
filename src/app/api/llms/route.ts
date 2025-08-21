import { readFileSync } from "node:fs";
import { join } from "node:path";
import { NextResponse } from "next/server";

export async function GET() {
	try {
		const llmsPath = join(process.cwd(), "public", "llms.txt");
		const llmsContent = readFileSync(llmsPath, "utf8");

		return new NextResponse(llmsContent, {
			headers: {
				"Content-Type": "text/plain; charset=utf-8",
				"Access-Control-Allow-Origin": "*",
				"Access-Control-Allow-Methods": "GET",
				"Access-Control-Allow-Headers": "Content-Type",
				"Cache-Control": "public, max-age=3600", // Cache for 1 hour
			},
		});
	} catch (error) {
		console.error("Failed to serve llms.txt:", error);

		// Fallback content if file read fails
		const fallbackContent = `# Price Tag API - LLM Documentation

## OVERVIEW
The Price Tag API is a comprehensive REST API for creating, managing, and generating professional price tags with PDF export capabilities.

## BASE_URL
/api

## CORE_FUNCTIONS
- create_price_tag: POST /api/price-tags
- generate_pdf: POST /api/generate-pdf-v2
- list_price_tags: GET /api/price-tags
- check_health: GET /api/health

For complete documentation, visit /api-docs
`;

		return new NextResponse(fallbackContent, {
			headers: {
				"Content-Type": "text/plain; charset=utf-8",
				"Access-Control-Allow-Origin": "*",
			},
		});
	}
}
