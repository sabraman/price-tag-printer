import chromium from "@sparticuz/chromium";
import puppeteer from "puppeteer-core";

export interface PDFGenerationOptions {
	html: string;
	filename?: string;
	format?: "A4" | "Letter";
	margin?: {
		top?: string;
		right?: string;
		bottom?: string;
		left?: string;
	};
}

export async function generatePDF(
	options: PDFGenerationOptions,
): Promise<Buffer> {
	const {
		html,
		format = "A4",
		margin = { top: "0", right: "0", bottom: "0", left: "0" },
	} = options;

	let browser: puppeteer.Browser | null = null;

	try {
		// Configure for different environments
		const isProduction = process.env.NODE_ENV === "production";
		const isVercel = process.env.VERCEL === "1";

		if (isVercel || isProduction) {
			// Vercel/Production configuration with @sparticuz/chromium
			browser = await puppeteer.launch({
				args: chromium.args,
				defaultViewport: chromium.defaultViewport,
				executablePath: await chromium.executablePath(),
				headless: chromium.headless,
			});
		} else {
			// Local development configuration
			browser = await puppeteer.launch({
				headless: true,
				args: [
					"--no-sandbox",
					"--disable-setuid-sandbox",
					"--disable-dev-shm-usage",
					"--disable-gpu",
				],
			});
		}

		const page = await browser.newPage();

		// Set viewport for consistent rendering
		await page.setViewport({
			width: 1200,
			height: 800,
			deviceScaleFactor: 1,
		});

		// Set content with proper CSS for print
		await page.setContent(html, {
			waitUntil: ["networkidle0", "domcontentloaded"],
		});

		// Wait for any fonts to load
		await page.evaluateHandle("document.fonts.ready");

		// Generate PDF
		const pdf = await page.pdf({
			format,
			printBackground: true,
			margin,
			preferCSSPageSize: true,
		});

		return Buffer.from(pdf);
	} catch (error) {
		console.error("PDF generation error:", error);
		throw new Error(
			`Failed to generate PDF: ${error instanceof Error ? error.message : "Unknown error"}`,
		);
	} finally {
		if (browser) {
			await browser.close();
		}
	}
}

export function createPrintableHTML(content: string): string {
	return `
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Price Tags</title>
        <style>
          @page {
            size: A4 portrait;
            margin: 0;
          }
          
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
            background: white;
          }
          
          .print-page {
            page-break-after: always;
            padding-top: 36px;
            height: 100vh;
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            grid-template-rows: repeat(6, 1fr);
            gap: 0;
            align-items: center;
            justify-items: center;
            transform: scale(1.4);
            transform-origin: top center;
          }
          
          .print-page:last-child {
            page-break-after: auto;
          }
          
          .price-tag {
            margin: 0;
          }
          
          /* SVG styles */
          svg {
            display: block;
          }
        </style>
      </head>
      <body>
        ${content}
      </body>
    </html>
  `;
}
