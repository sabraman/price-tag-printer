import { NextRequest, NextResponse } from "next/server";
import { fetchGoogleSheetsData } from "@/lib/googleSheets";

export const runtime = "nodejs";
export const maxDuration = 30;

interface ImportRequest {
	url: string;
}

interface Item {
	id: string;
	data: string;
	price: number;
	discountPrice: number;
	designType: string;
	hasDiscount: boolean;
}

export async function POST(req: NextRequest) {
	try {
		const body: ImportRequest = await req.json();
		const { url } = body;

		if (!url) {
			return NextResponse.json(
				{ error: "Missing Google Sheets URL" },
				{ status: 400 },
			);
		}

		// Extract spreadsheet ID from URL
		const match = url.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
		if (!match) {
			return NextResponse.json(
				{ error: "Invalid Google Sheets URL" },
				{ status: 400 },
			);
		}

		const spreadsheetId = match[1];

		// Use existing Google Sheets integration
		const data = await fetchGoogleSheetsData([
			{
				sheetId: spreadsheetId,
				subSheetsIds: ["0"],
			},
		]);

		if (!data || typeof data !== "object") {
			return NextResponse.json(
				{ error: "Invalid data from Google Sheets" },
				{ status: 400 },
			);
		}

		const columnKeys = Object.keys(data);

		if (columnKeys.length === 0) {
			return NextResponse.json(
				{ error: "Google Sheets is empty" },
				{ status: 400 },
			);
		}

		const firstColumn = data[columnKeys[0]];
		const rowKeys = Object.keys(firstColumn.rows);

		// Convert to our format
		const items: Item[] = rowKeys
			.map((rowKey, index) => {
				const item: Item = {
					id: Date.now().toString() + index,
					data: String(data[columnKeys[0]].rows[rowKey]?.data || ""),
					price: Number(data[columnKeys[1]]?.rows[rowKey]?.data || 0),
					discountPrice: 0,
					designType: "default",
					hasDiscount: false,
				};

				// Handle design type column (3rd column)
				if (columnKeys[2]) {
					const designValue = data[columnKeys[2]]?.rows[rowKey]?.data;
					if (designValue && typeof designValue === "string") {
						item.designType = designValue;
					}
				}

				return item;
			})
			.filter((item) => item.data && item.price > 0); // Filter out empty rows

		return NextResponse.json({
			success: true,
			items: items,
			total: items.length,
		});
	} catch (error) {
		console.error("Error fetching Google Sheets data:", error);
		return NextResponse.json(
			{
				error: `Failed to fetch Google Sheets data: ${error instanceof Error ? error.message : "Unknown error"}`,
			},
			{ status: 500 },
		);
	}
}
