import { type NextRequest, NextResponse } from "next/server";
export const runtime = "nodejs";
import { renderPriceTagsHTML } from "@/lib/renderPriceTags";
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
	themes: {
		default: { start: "#222222", end: "#dd4c9b", textColor: "#ffffff" },
		new: { start: "#222222", end: "#9cdd4c", textColor: "#ffffff" },
		sale: { start: "#222222", end: "#dd4c54", textColor: "#ffffff" },
		white: { start: "#ffffff", end: "#ffffff", textColor: "#000000" },
		black: { start: "#000000", end: "#000000", textColor: "#ffffff" },
		sunset: { start: "#ff7e5f", end: "#feb47b", textColor: "#ffffff" },
		ocean: { start: "#667eea", end: "#764ba2", textColor: "#ffffff" },
		forest: { start: "#134e5e", end: "#71b280", textColor: "#ffffff" },
		royal: { start: "#4c63d2", end: "#9c27b0", textColor: "#ffffff" },
		vintage: { start: "#8b4513", end: "#d2b48c", textColor: "#ffffff" },
		neon: { start: "#00ff00", end: "#ff00ff", textColor: "#000000" },
		monochrome: { start: "#4a4a4a", end: "#888888", textColor: "#ffffff" },
		silver: { start: "#c0c0c0", end: "#e8e8e8", textColor: "#000000" },
		charcoal: { start: "#2c2c2c", end: "#2c2c2c", textColor: "#ffffff" },
		paper: { start: "#f8f8f8", end: "#f0f0f0", textColor: "#333333" },
		ink: { start: "#1a1a1a", end: "#1a1a1a", textColor: "#ffffff" },
		snow: { start: "#ffffff", end: "#f5f5f5", textColor: "#000000" },
	},
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
