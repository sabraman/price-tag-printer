import { type NextRequest, NextResponse } from "next/server";
export const runtime = "nodejs";
import { renderPriceTagsHTML } from "@/lib/renderPriceTags";
import { DEFAULT_THEMES } from "@/lib/themes";
import type {
	ApiResponse,
	GeneratePDFRequest,
	Item,
	PriceTagSettings,
} from "@/types/api";
export const maxDuration = 60; // 60 seconds

// Default settings
const defaultSettings: PriceTagSettings = {
	design: false,
	designType: "default",
	discountAmount: 500,
	maxDiscountPercent: 5,
	themes: { ...DEFAULT_THEMES },
	currentFont: "montserrat",
	discountText: "цена при подписке\nна телеграм канал",
	hasTableDesigns: false,
	hasTableDiscounts: false,
	showThemeLabels: true,
	cuttingLineColor: "#cccccc",
};

// Helper function to calculate discount price
function calculateDiscountPrice(
	price: number,
	discountAmount: number = 500,
	maxDiscountPercent: number = 5,
): number {
	const discountedPrice = price - discountAmount;
	const discountPercent = ((price - discountedPrice) / price) * 100;

	if (discountPercent > maxDiscountPercent) {
		return Math.round(price - (price * maxDiscountPercent) / 100);
	}

	return Math.round(discountedPrice);
}

// Helper function to process items and ensure they have all required fields
function processItems(items: Item[], settings: PriceTagSettings): Item[] {
	return items.map((item) => ({
		...item,
		// Ensure discountPrice is calculated if not provided
		discountPrice:
			item.discountPrice ||
			calculateDiscountPrice(
				item.price,
				settings.discountAmount,
				settings.maxDiscountPercent,
			),
	}));
}

// Validate items array
function validateItems(items: unknown[]): string | null {
	if (!Array.isArray(items)) {
		return "Items must be an array";
	}

	if (items.length === 0) {
		return "Items array cannot be empty";
	}

	for (const [index, item] of items.entries()) {
		if (!item || typeof item !== "object") {
			return `Item ${index + 1}: Must be an object`;
		}

		const typedItem = item as Record<string, unknown>;

		if (!typedItem.data && typedItem.data !== 0) {
			return `Item ${index + 1}: Data field is required`;
		}

		if (
			!typedItem.price ||
			typeof typedItem.price !== "number" ||
			typedItem.price <= 0
		) {
			return `Item ${index + 1}: Price must be a positive number`;
		}

		if (!typedItem.id || typeof typedItem.id !== "number") {
			return `Item ${index + 1}: ID must be a number`;
		}
	}

	return null;
}

// POST /api/generate-pdf-v2 - Enhanced PDF generation with full validation and settings
export async function POST(request: NextRequest): Promise<Response> {
	try {
		const requestData = (await request.json()) as GeneratePDFRequest;

		// Validate request structure
		if (!requestData.items) {
			return NextResponse.json(
				{
					success: false,
					error: "Items are required",
				},
				{ status: 400 },
			);
		}

		// Validate items
		const itemsValidationError = validateItems(requestData.items);
		if (itemsValidationError) {
			return NextResponse.json(
				{
					success: false,
					error: itemsValidationError,
				},
				{ status: 400 },
			);
		}

		// Merge settings with defaults
		const settings: PriceTagSettings = {
			...defaultSettings,
			...requestData.settings,
		};

		// Process items to ensure all required fields
		const processedItems = processItems(requestData.items, settings);

		// Validate format
		const format = requestData.format || "A4";
		if (!["A4", "A3", "Letter"].includes(format)) {
			return NextResponse.json(
				{
					success: false,
					error: "Invalid format. Must be A4, A3, or Letter",
				},
				{ status: 400 },
			);
		}

		// Set default margins
		const margin = {
			top: "0",
			right: "0",
			bottom: "0",
			left: "0",
			...requestData.margin,
		};

		// Generate HTML
		const html = renderPriceTagsHTML({
			items: processedItems,
			design: settings.design,
			designType: settings.designType,
			themes: settings.themes,
			font: settings.currentFont,
			discountText: settings.discountText,
			useTableDesigns: settings.hasTableDesigns,
			useTableDiscounts: settings.hasTableDiscounts,
			showThemeLabels: settings.showThemeLabels,
			cuttingLineColor: settings.cuttingLineColor,
		});

		if (!html) {
			return NextResponse.json(
				{
					success: false,
					error: "Failed to generate HTML",
				},
				{ status: 500 },
			);
		}

		// Generate PDF
		const { generatePDF, createPrintableHTML } = await import(
			"@/lib/puppeteer"
		);

		const printableHTML = createPrintableHTML(html);
		const pdfBuffer = await generatePDF({
			html: printableHTML,
			format: format as "A4" | "A3" | "Letter",
			margin,
		});

		// Return PDF with standardized filename
		const { buildPriceTagsFilename } = await import("@/lib/utils");
		return new Response(pdfBuffer, {
			headers: {
				"Content-Type": "application/pdf",
				"Content-Disposition": `attachment; filename=${buildPriceTagsFilename("pdf")}`,
				"Content-Length": pdfBuffer.length.toString(),
			},
		});
	} catch (error) {
		console.error("Enhanced PDF generation error:", error);
		return NextResponse.json(
			{
				success: false,
				error:
					error instanceof Error ? error.message : "Unknown error occurred",
			},
			{ status: 500 },
		);
	}
}

interface PDFGenerationInfo {
	supportedFormats: string[];
	defaultFormat: string;
	defaultMargin: {
		top: string;
		right: string;
		bottom: string;
		left: string;
	};
	supportedFonts: string[];
	supportedDesignTypes: string[];
	maxItemsPerRequest: number;
	version: string;
}

export async function GET(): Promise<
	NextResponse<ApiResponse<PDFGenerationInfo>>
> {
	return NextResponse.json({
		success: true,
		data: {
			supportedFormats: ["A4", "A3", "Letter"],
			defaultFormat: "A4",
			defaultMargin: {
				top: "0",
				right: "0",
				bottom: "0",
				left: "0",
			},
			supportedFonts: ["montserrat", "nunito", "inter", "mont"],
			supportedDesignTypes: [
				"default",
				"new",
				"sale",
				"white",
				"black",
				"sunset",
				"ocean",
				"forest",
				"royal",
				"vintage",
				"neon",
				"monochrome",
				"silver",
				"charcoal",
				"paper",
				"ink",
				"snow",
			],
			maxItemsPerRequest: 1000,
			version: "2.0",
		},
		message: "PDF generation service v2 is ready",
	});
}
