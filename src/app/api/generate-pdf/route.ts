import { type NextRequest, NextResponse } from "next/server";
import { renderPriceTagsHTML } from "@/lib/renderPriceTags";
import { buildPriceTagsFilename } from "@/lib/utils";

export async function POST(request: NextRequest) {
	try {
		const requestData = await request.json();

		// Handle two API modes: legacy (items + settings) and new (html directly)
		if (requestData.html) {
			// New mode: HTML already generated, just convert to PDF
			const { generatePDF, createPrintableHTML } = await import(
				"@/lib/puppeteer"
			);

			const printableHTML = createPrintableHTML(requestData.html);
			const pdfBuffer = await generatePDF({
				html: printableHTML,
				format: "A4",
				margin: { top: "0", right: "0", bottom: "0", left: "0" },
			});

            return new Response(pdfBuffer, {
                headers: {
                    "Content-Type": "application/pdf",
                    "Content-Disposition": `attachment; filename=${buildPriceTagsFilename("pdf")}`,
                },
            });
		}

		// Legacy mode: Generate HTML from items and settings
		const { items, settings } = requestData;

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

		// Convert HTML to PDF using our optimized Puppeteer function
		const { generatePDF, createPrintableHTML } = await import(
			"@/lib/puppeteer"
		);

		const printableHTML = createPrintableHTML(html);
		const pdfBuffer = await generatePDF({
			html: printableHTML,
			format: "A4",
			margin: { top: "0", right: "0", bottom: "0", left: "0" },
		});

    return new Response(pdfBuffer, {
        headers: {
            "Content-Type": "application/pdf",
            "Content-Disposition": `attachment; filename=${buildPriceTagsFilename("pdf")}`,
        },
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
