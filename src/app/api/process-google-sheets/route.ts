import { type NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
	try {
		const { url } = await request.json();

		if (!url || typeof url !== "string") {
			return NextResponse.json(
				{ success: false, error: "Invalid URL" },
				{ status: 400 },
			);
		}

		// Extract spreadsheet ID from URL
		const match = url.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
		if (!match) {
			return NextResponse.json(
				{ success: false, error: "Invalid Google Sheets URL" },
				{ status: 400 },
			);
		}

		const spreadsheetId = match[1];

		// Convert to CSV export URL
		const csvUrl = `https://docs.google.com/spreadsheets/d/${spreadsheetId}/export?format=csv&gid=0`;

		// Fetch CSV data
		const response = await fetch(csvUrl);
		if (!response.ok) {
			throw new Error(
				"Failed to fetch Google Sheets data. Make sure the sheet is publicly accessible.",
			);
		}

		const csvText = await response.text();

		// Parse CSV
		const lines = csvText.split("\n").filter((line) => line.trim());
		if (lines.length <= 1) {
			return NextResponse.json(
				{ success: false, error: "Sheet is empty or has no data" },
				{ status: 400 },
			);
		}

		// Skip header row and process data
		const items = [];
		for (let i = 1; i < lines.length; i++) {
			const line = lines[i];

			// Simple CSV parsing (handles basic cases)
			const columns = line
				.split(",")
				.map((col) => col.replace(/^"|"$/g, "").trim());

			// Skip empty rows
			if (!columns[0] || !columns[1]) {
				continue;
			}

			const item: { data: string; price: number; [key: string]: unknown } = {
				data: columns[0].trim(),
				price: Number(columns[1]) || 0,
			};

			// Skip if price is 0 or negative
			if (item.price <= 0) {
				continue;
			}

			// Optional columns
			if (columns[2]) {
				const designType = columns[2].toLowerCase();
				if (["default", "new", "sale"].includes(designType)) {
					item.designType = designType;
				}
			}

			if (columns[3]) {
				const discountValue = columns[3].toLowerCase();
				if (["да", "yes", "true", "1"].includes(discountValue)) {
					item.hasDiscount = true;
				} else if (["нет", "no", "false", "0"].includes(discountValue)) {
					item.hasDiscount = false;
				}
			}

			if (columns[4]) {
				const priceFor2 = Number(columns[4]);
				if (!Number.isNaN(priceFor2) && priceFor2 > 0) {
					item.priceFor2 = priceFor2;
				}
			}

			if (columns[5]) {
				const priceFrom3 = Number(columns[5]);
				if (!Number.isNaN(priceFrom3) && priceFrom3 > 0) {
					item.priceFrom3 = priceFrom3;
				}
			}

			items.push(item);
		}

		if (items.length === 0) {
			return NextResponse.json(
				{ success: false, error: "No valid items found in the sheet" },
				{ status: 400 },
			);
		}

		return NextResponse.json({
			success: true,
			items: items,
			count: items.length,
		});
	} catch (error) {
		console.error("Google Sheets processing error:", error);
		return NextResponse.json(
			{
				success: false,
				error: error instanceof Error ? error.message : "Unknown error",
			},
			{ status: 500 },
		);
	}
}
