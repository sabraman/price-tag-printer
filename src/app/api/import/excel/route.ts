import { NextRequest, NextResponse } from "next/server";
import axios from "axios";
import * as xlsx from "xlsx";

export const runtime = "nodejs";
export const maxDuration = 30;

interface ImportRequest {
	fileUrl: string;
	fileName: string;
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
		const { fileUrl, fileName } = body;

		if (!fileUrl || !fileName) {
			return NextResponse.json(
				{ error: "Missing fileUrl or fileName" },
				{ status: 400 },
			);
		}

		// Download file from Telegram
		const response = await axios.get(fileUrl, {
			responseType: "arraybuffer",
			timeout: 10000,
		});

		// Parse Excel file
		const workbook = xlsx.read(response.data, { type: "buffer" });
		const sheetName = workbook.SheetNames[0];
		const worksheet = workbook.Sheets[sheetName];
		const jsonData = xlsx.utils.sheet_to_json(worksheet);

		// Convert to our format
		const items: Item[] = [];
		jsonData.forEach((row: any, index: number) => {
			const name =
				row["Название"] ||
				row["name"] ||
				row["Name"] ||
				row["Товар"] ||
				row["Товар/Услуга"] ||
				"";
			const price = parseFloat(
				row["Цена"] || row["price"] || row["Price"] || row["Стоимость"] || "0",
			);

			if (name && !isNaN(price) && price > 0) {
				items.push({
					id: Date.now().toString() + index,
					data: name.toString(),
					price: price,
					discountPrice: 0,
					designType: "default",
					hasDiscount: false,
				});
			}
		});

		return NextResponse.json({
			success: true,
			items: items,
			total: items.length,
		});
	} catch (error) {
		console.error("Error processing Excel file:", error);
		return NextResponse.json(
			{ error: "Failed to process Excel file" },
			{ status: 500 },
		);
	}
}
