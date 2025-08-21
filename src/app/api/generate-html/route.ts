import { type NextRequest, NextResponse } from "next/server";
import { renderPriceTagsHTML } from "@/lib/renderPriceTags";
import type {
	ApiResponse,
	GenerateHTMLRequest,
	Item,
	PriceTagSettings,
} from "@/types/api";

// Default settings (same as PDF generation)
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

// Validate items array (same as PDF generation)
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

// Helper function to create full HTML document
function createFullHTMLDocument(
	priceTagsHTML: string,
	settings: PriceTagSettings,
): string {
	return `
<!DOCTYPE html>
<html lang="en">
<head>
	<meta charset="UTF-8">
	<meta name="viewport" content="width=device-width, initial-scale=1.0">
	<title>Price Tags</title>
	<link rel="preconnect" href="https://fonts.googleapis.com">
	<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
	<link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@100;200;300;400;500;600;700;800;900&family=Nunito:wght@200;300;400;500;600;700;800;900&family=Inter:wght@100;200;300;400;500;600;700;800;900&display=swap" rel="stylesheet">
	<style>
		* {
			margin: 0;
			padding: 0;
			box-sizing: border-box;
		}
		
		body {
			font-family: '${settings.currentFont}', sans-serif;
			background: #f5f5f5;
			padding: 20px;
		}
		
		.container {
			max-width: 1200px;
			margin: 0 auto;
			background: white;
			padding: 20px;
			border-radius: 8px;
			box-shadow: 0 2px 10px rgba(0,0,0,0.1);
		}
		
		.header {
			text-align: center;
			margin-bottom: 30px;
			padding-bottom: 20px;
			border-bottom: 2px solid #e5e5e5;
		}
		
		.header h1 {
			color: #333;
			font-size: 2rem;
			margin-bottom: 10px;
		}
		
		.header .meta {
			color: #666;
			font-size: 0.9rem;
		}
		
		.print-page {
			display: grid;
			grid-template-columns: repeat(3, 200px);
			gap: 10px;
			justify-content: center;
			margin-bottom: 40px;
		}
		
		.print-page-last {
			margin-bottom: 0;
		}
		
		.controls {
			position: fixed;
			top: 20px;
			right: 20px;
			background: white;
			padding: 15px;
			border-radius: 8px;
			box-shadow: 0 2px 10px rgba(0,0,0,0.1);
			border: 1px solid #e5e5e5;
		}
		
		.controls button {
			background: #007bff;
			color: white;
			border: none;
			padding: 10px 20px;
			border-radius: 5px;
			cursor: pointer;
			font-size: 14px;
			margin: 5px;
		}
		
		.controls button:hover {
			background: #0056b3;
		}
		
		@media print {
			body {
				background: white;
				padding: 0;
			}
			
			.container {
				max-width: none;
				margin: 0;
				padding: 0;
				box-shadow: none;
				border-radius: 0;
			}
			
			.header,
			.controls {
				display: none;
			}
			
			.print-page {
				page-break-after: always;
				margin-bottom: 0;
			}
			
			.print-page-last {
				page-break-after: avoid;
			}
		}
	</style>
</head>
<body>
	<div class="container">
		<div class="header">
			<h1>Price Tags</h1>
			<div class="meta">
				Generated on ${new Date().toLocaleString()} | 
				Design: ${settings.designType} | 
				Font: ${settings.currentFont}
			</div>
		</div>
		
		<div class="controls">
			<button onclick="window.print()">Print</button>
			<button onclick="downloadPDF()">Download PDF</button>
		</div>
		
		${priceTagsHTML}
	</div>
	
	<script>
		function downloadPDF() {
			// This would require integration with the PDF generation API
			const confirmed = confirm('This will redirect you to download the PDF. Continue?');
			if (confirmed) {
				// You can implement PDF download here by calling the PDF generation API
				alert('PDF download functionality can be implemented by calling /api/generate-pdf-v2');
			}
		}
	</script>
</body>
</html>
	`.trim();
}

// POST /api/generate-html - Generate HTML for price tags
export async function POST(
	request: NextRequest,
): Promise<NextResponse<ApiResponse<{ html: string; itemCount: number }>>> {
	try {
		const requestData = (await request.json()) as GenerateHTMLRequest;

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

		// Generate price tags HTML
		const priceTagsHTML = renderPriceTagsHTML({
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

		if (!priceTagsHTML) {
			return NextResponse.json(
				{
					success: false,
					error: "Failed to generate HTML",
				},
				{ status: 500 },
			);
		}

		// Create full HTML document
		const fullHTML = createFullHTMLDocument(priceTagsHTML, settings);

		return NextResponse.json({
			success: true,
			data: {
				html: fullHTML,
				itemCount: processedItems.length,
			},
			message: `HTML generated successfully for ${processedItems.length} items`,
		});
	} catch (error) {
		console.error("HTML generation error:", error);
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

interface HTMLGenerationInfo {
	supportedFonts: string[];
	supportedDesignTypes: string[];
	maxItemsPerRequest: number;
	outputFormats: string[];
	version: string;
}

export async function GET(): Promise<
	NextResponse<ApiResponse<HTMLGenerationInfo>>
> {
	return NextResponse.json({
		success: true,
		data: {
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
			outputFormats: ["full-document", "fragments-only"],
			version: "1.0",
		},
		message: "HTML generation service is ready",
	});
}
