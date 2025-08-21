// PDF generation integration for Telegram bot using existing renderPriceTags
import { logger } from "../../logger";
import type { MyContext, SessionData } from "../../telegram-bot";
import { renderPriceTagsHTML } from "../renderPriceTags";

// Convert bot session data to renderPriceTags format
function sessionDataToRenderOptions(sessionData: SessionData) {
	const {
		items,
		design,
		designType,
		themes,
		currentFont,
		discountText,
		hasTableDesigns,
		hasTableDiscounts,
		showThemeLabels,
		cuttingLineColor,
	} = sessionData;

	return {
		items,
		design,
		designType,
		themes,
		font: currentFont,
		discountText,
		useTableDesigns: hasTableDesigns,
		useTableDiscounts: hasTableDiscounts,
		showThemeLabels,
		cuttingLineColor,
	};
}

// Generate HTML for price tags using the existing renderPriceTags function
export function generatePriceTagsHTML(sessionData: SessionData): string {
	const { items } = sessionData;

	if (!items || items.length === 0) {
		throw new Error("No items to generate PDF for");
	}

	logger.debug("Generating HTML using renderPriceTags", undefined, {
		itemCount: items.length,
		theme: sessionData.designType,
		font: sessionData.currentFont,
	});

	// Use the existing renderPriceTags function
	const renderOptions = sessionDataToRenderOptions(sessionData);
	const priceTagsHTML = renderPriceTagsHTML(renderOptions);

	// Create complete HTML document with the same styling as the web app
	const completeHTML = `
<!DOCTYPE html>
<html lang="ru">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Price Tags</title>
    <link href="https://fonts.googleapis.com/css2?family=Montserrat:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,100;1,200;1,300;1,400;1,500;1,600;1,700;1,800;1,900&display=swap" rel="stylesheet">
    <link href="https://fonts.googleapis.com/css2?family=Nunito:ital,wght@0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,200;1,300;1,400;1,500;1,600;1,700;1,800;1,900&display=swap" rel="stylesheet">
    <link href="https://fonts.googleapis.com/css2?family=Inter:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,100;1,200;1,300;1,400;1,500;1,600;1,700;1,800;1,900&display=swap" rel="stylesheet">
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            background: white;
            font-family: 'Montserrat', sans-serif;
        }
        
        .print-page {
            width: 210mm;
            margin: 0 auto;
            padding: 12mm;
            background: white;
            page-break-after: always;
            box-sizing: border-box;
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 8mm;
            justify-items: center;
            align-items: start;
            align-content: start;
        }
        
        .print-page-last {
            page-break-after: auto;
        }
        
        @media print {
            body {
                margin: 0;
                padding: 0;
                background: white;
            }
            
            .print-page {
                margin: 0;
                width: 210mm;
                page-break-after: always;
                box-sizing: border-box;
                display: grid;
                grid-template-columns: repeat(3, 1fr);
                gap: 8mm;
                justify-items: center;
                align-items: start;
                align-content: start;
                padding: 12mm;
            }
            
            .print-page-last {
                page-break-after: auto;
            }
            
            * {
                -webkit-print-color-adjust: exact !important;
                color-adjust: exact !important;
                print-color-adjust: exact !important;
            }
        }
        
        @page {
            margin: 0;
            size: A4;
        }
    </style>
</head>
<body>
    ${priceTagsHTML}
</body>
</html>`;

	logger.debug("Complete HTML document created", undefined, {
		htmlLength: completeHTML.length,
	});

	return completeHTML;
}

// Call the PDF generation API
export async function generatePDF(
	sessionData: SessionData,
	ctx: MyContext,
): Promise<Buffer> {
	logger.info("Starting PDF generation", ctx, {
		itemCount: sessionData.items.length,
		theme: sessionData.designType,
	});

	try {
		const html = generatePriceTagsHTML(sessionData);

		logger.debug("HTML generated, calling API", ctx, {
			htmlLength: html.length,
		});

		// Call the existing PDF generation API
		const { botEnv } = await import("@/bot-env");
		let url = `${botEnv.NEXTJS_API_URL}/api/generate-pdf`;
		const headers: Record<string, string> = { "Content-Type": "application/json" };
		if (botEnv.VERCEL_PROTECTION_BYPASS && url.includes("vercel.app")) {
			headers["x-vercel-protection-bypass"] = botEnv.VERCEL_PROTECTION_BYPASS;
			headers["x-vercel-set-bypass-cookie"] = "true";
		}
		const response = await fetch(url, {
			method: "POST",
			headers,
			body: JSON.stringify({ html }),
		});

		if (!response.ok) {
			const errorText = await response.text();
			throw new Error(`PDF API error: ${response.status} - ${errorText}`);
		}

		const pdfBuffer = Buffer.from(await response.arrayBuffer());

		logger.success("PDF generated successfully", ctx, {
			pdfSize: pdfBuffer.length,
			itemCount: sessionData.items.length,
		});

		return pdfBuffer;
	} catch (error) {
		logger.error("PDF generation failed", error, ctx);
		throw error;
	}
}
