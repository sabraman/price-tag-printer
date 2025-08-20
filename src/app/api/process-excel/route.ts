import { type NextRequest, NextResponse } from "next/server";
import * as XLSX from "xlsx";

export async function POST(request: NextRequest) {
	try {
		const { fileData, fileName: _fileName } = await request.json();

		if (!fileData || !Array.isArray(fileData)) {
			return NextResponse.json(
				{ success: false, error: "Invalid file data" },
				{ status: 400 },
			);
		}

		// Convert array back to buffer
		const buffer = new Uint8Array(fileData);

		// Parse Excel file
		const workbook = XLSX.read(buffer, {
			type: "array",
			cellDates: true,
			cellNF: false,
			cellText: false,
		});

		// Get first sheet
		const sheetName = workbook.SheetNames[0];
		if (!sheetName) {
			return NextResponse.json(
				{ success: false, error: "No sheets found in file" },
				{ status: 400 },
			);
		}

		const worksheet = workbook.Sheets[sheetName];
		const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

		if (!jsonData || jsonData.length === 0) {
			return NextResponse.json(
				{ success: false, error: "File is empty" },
				{ status: 400 },
			);
		}

		// Skip header row and process data
		const rows = jsonData.slice(1) as any[][];
		const items = [];

		for (let i = 0; i < rows.length; i++) {
			const row = rows[i];

			// Skip empty rows
			if (!row || row.length === 0 || !row[0] || !row[1]) {
				continue;
			}

			const item: any = {
				data: String(row[0] || "").trim(),
				price: Number(row[1]) || 0,
			};

			// Skip if price is 0 or negative
			if (item.price <= 0) {
				continue;
			}

			// Optional columns
			if (row[2]) {
				const designType = String(row[2]).toLowerCase();
				if (["default", "new", "sale"].includes(designType)) {
					item.designType = designType;
				}
			}

			if (row[3]) {
				const discountValue = String(row[3]).toLowerCase();
				if (["да", "yes", "true", "1"].includes(discountValue)) {
					item.hasDiscount = true;
				} else if (["нет", "no", "false", "0"].includes(discountValue)) {
					item.hasDiscount = false;
				}
			}

			if (row[4]) {
				const priceFor2 = Number(row[4]);
				if (!Number.isNaN(priceFor2) && priceFor2 > 0) {
					item.priceFor2 = priceFor2;
				}
			}

			if (row[5]) {
				const priceFrom3 = Number(row[5]);
				if (!Number.isNaN(priceFrom3) && priceFrom3 > 0) {
					item.priceFrom3 = priceFrom3;
				}
			}

			items.push(item);
		}

		if (items.length === 0) {
			return NextResponse.json(
				{ success: false, error: "No valid items found in file" },
				{ status: 400 },
			);
		}

		return NextResponse.json({
			success: true,
			items: items,
			count: items.length,
		});
	} catch (error) {
		console.error("Excel processing error:", error);
		return NextResponse.json(
			{
				success: false,
				error: error instanceof Error ? error.message : "Unknown error",
			},
			{ status: 500 },
		);
	}
}
