import { type NextRequest, NextResponse } from "next/server";
import { renderPriceTagsHTML } from "@/lib/renderPriceTags";

export async function POST(request: NextRequest) {
	try {
		const { items, settings } = await request.json();

		if (!items || !Array.isArray(items) || items.length === 0) {
			return NextResponse.json(
				{ success: false, error: "No items provided" },
				{ status: 400 },
			);
		}

		// Validate items format
		const validItems = items.filter(
			(item) =>
				item &&
				typeof item.data === "string" &&
				typeof item.price === "number" &&
				item.price > 0,
		);

		if (validItems.length === 0) {
			return NextResponse.json(
				{ success: false, error: "No valid items found" },
				{ status: 400 },
			);
		}

		// Apply settings defaults
		const pdfSettings = {
			design: settings?.design || false,
			designType: settings?.designType || "default",
			discountAmount: settings?.discountAmount || 500,
			maxDiscountPercent: settings?.maxDiscountPercent || 5,
			themes: settings?.themes || {
				default: { start: "#222222", end: "#dd4c9b", textColor: "#ffffff" },
			},
			currentFont: settings?.currentFont || "montserrat",
			discountText:
				settings?.discountText || "цена при подписке\nна телеграм канал",
			showThemeLabels: settings?.showThemeLabels !== false,
			cuttingLineColor: settings?.cuttingLineColor || "#cccccc",
		};

		// Generate HTML first
		const html = renderPriceTagsHTML({
			items: validItems,
			design: pdfSettings.design,
			designType: pdfSettings.designType,
			themes: pdfSettings.themes,
			font: pdfSettings.currentFont,
			discountText: pdfSettings.discountText,
			showThemeLabels: pdfSettings.showThemeLabels,
			cuttingLineColor: pdfSettings.cuttingLineColor,
		});

		if (!html) {
			throw new Error("Failed to generate HTML");
		}

		// For now, return success with a note that PDF generation needs to be implemented
		// In a real implementation, you would convert the HTML to PDF here
		return NextResponse.json({
			success: true,
			message: "PDF generation initiated",
			itemCount: validItems.length,
			// For now, we'll just indicate success
			// In a real implementation, you would return the PDF URL or buffer
		});
	} catch (error) {
		console.error("PDF generation error:", error);
		return NextResponse.json(
			{
				success: false,
				error: error instanceof Error ? error.message : "Unknown error",
			},
			{ status: 500 },
		);
	}
}
