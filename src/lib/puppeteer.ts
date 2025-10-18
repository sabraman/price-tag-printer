import type { HTTPRequest } from "puppeteer-core";
import { readFileSync } from "node:fs";
import { join } from "node:path";

export interface PDFGenerationOptions {
	html: string;
	filename?: string;
	format?: "A4" | "A3" | "Letter";
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

	// biome-ignore lint/suspicious/noExplicitAny: Dynamic import requires any type
	let browser: any | null = null;

	try {
		// Configure for different environments based on Vercel's official guide
		const isVercel = !!process.env.VERCEL_ENV;
		// biome-ignore lint/suspicious/noExplicitAny: Dynamic import requires any type
		let puppeteer: any;
		// biome-ignore lint/suspicious/noExplicitAny: Dynamic import requires any type
		let launchOptions: any = { headless: true };

		if (isVercel) {
			// Production/Vercel configuration
			const chromium = (await import("@sparticuz/chromium")).default;
			puppeteer = await import("puppeteer-core");
			launchOptions = {
				...launchOptions,
				args: chromium.args,
				executablePath: await chromium.executablePath(),
			};
		} else {
			// Local development configuration
			puppeteer = await import("puppeteer");
			launchOptions = {
				...launchOptions,
				args: [
					"--no-sandbox",
					"--disable-setuid-sandbox",
					"--disable-dev-shm-usage",
					"--disable-gpu",
				],
			};
		}

		browser = await puppeteer.launch(launchOptions);
		if (!browser) {
			throw new Error("Failed to launch browser");
		}

		const page = await browser.newPage();

		// Optimize page settings for faster PDF generation
		await Promise.all([
			page.setViewport({
				width: 1200,
				height: 800,
				deviceScaleFactor: 1,
			}),
			// Enable request interception for optimization
			page.setRequestInterception(true),
		]);

		// Block unnecessary requests for PDF generation
		page.on("request", (request: HTTPRequest) => {
			const resourceType = request.resourceType();
			const url = request.url();

			// Allow essential resources for PDF rendering
			if (
				resourceType === "document" ||
				resourceType === "stylesheet" ||
				resourceType === "font" ||
				url.includes("font") ||
				url.includes(".woff") ||
				url.includes(".ttf") ||
				url.includes("fonts.googleapis.com") ||
				url.includes("fonts.gstatic.com")
			) {
				request.continue();
			} else if (
				["image", "media", "script", "xhr", "fetch"].includes(resourceType)
			) {
				// Block unnecessary resources for faster PDF generation
				request.abort();
			} else {
				request.continue();
			}
		});

		// Set content with optimized waiting strategy
		await page.setContent(html, {
			waitUntil: ["domcontentloaded"], // Faster than networkidle0 for PDF generation
			timeout: 15000, // Reasonable timeout
		});

		// Optimized font loading for PDF generation
		try {
			// Use Promise.race for timeout protection
			await Promise.race([
				// Primary strategy: Wait for fonts via waitForFunction
				page.waitForFunction(
					() => {
						if (!document.fonts) return true;
						return document.fonts.ready
							.then(() => {
								console.log("PDF: All fonts loaded successfully");
								return true;
							})
							.catch(() => true);
					},
					{ timeout: 6000 }, // Longer timeout for PDF generation
				),

				// Fallback timeout using Promise
				new Promise<void>((resolve) => setTimeout(resolve, 5000)),
			]);
		} catch (error) {
			console.warn("PDF font loading timeout, proceeding", error);
		}

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

function getFontBase64Safe(path: string): string | null {
	try {
		return readFileSync(path).toString("base64");
	} catch {
		return null;
	}
}

export function createPrintableHTML(content: string): string {
	const fontsDir = join(process.cwd(), "public", "fonts");
	const nunitoB64 = getFontBase64Safe(
		join(fontsDir, "Nunito-VariableFont_wght.ttf"),
	);
	const interB64 = getFontBase64Safe(
		join(fontsDir, "Inter-VariableFont_opsz,wght.ttf"),
	);
	const montserratB64 = getFontBase64Safe(
		join(fontsDir, "Montserrat-VariableFont_wght.ttf"),
	);
	const montB64 = getFontBase64Safe(join(fontsDir, "mont_heavydemo.ttf"));

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
          
          @media print {
            html, body {
              margin: 0;
              padding: 0;
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
              color-adjust: exact;
            }
            
            .print-page {
              break-inside: avoid;
              margin: 0;
              padding: 0;
              padding-top: 40px;
              min-height: auto;
              display: grid !important;
              grid-template-columns: repeat(3, 200px) !important;
              grid-template-rows: repeat(6, 140px) !important;
              gap: 0 !important;
              align-items: center !important;
              justify-items: center !important;
              justify-content: center !important;
              width: 100% !important;
              max-width: 600px !important;
              margin: 0 auto !important;
              box-sizing: border-box !important;
              transform: scale(1.13) !important;
              transform-origin: top center !important;
            }
            
            .print-page-last {
              /* No special handling needed */
            }
          }
          
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          
          html, body {
            margin: 0;
            padding: 0;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
            color-adjust: exact;
            background: white;
            font-family: 'Montserrat', 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          }
          
          /* Local variable font fallbacks (base64 if available) */
          @font-face {
            font-family: 'Montserrat';
            src: ${montserratB64 ? `url("data:font/truetype;base64,${montserratB64}") format("truetype")` : `url("/fonts/Montserrat-VariableFont_wght.ttf") format("truetype")`};
            font-weight: 100 900;
            font-style: normal;
            font-display: block;
          }
          @font-face {
            font-family: 'Nunito';
            src: ${nunitoB64 ? `url("data:font/truetype;base64,${nunitoB64}") format("truetype")` : `url("/fonts/Nunito-VariableFont_wght.ttf") format("truetype")`};
            font-weight: 200 1000;
            font-style: normal;
            font-display: block;
          }
          @font-face {
            font-family: 'Inter';
            src: ${interB64 ? `url("data:font/truetype;base64,${interB64}") format("truetype")` : `url("/fonts/Inter-VariableFont_opsz,wght.ttf") format("truetype")`};
            font-weight: 100 900;
            font-style: normal;
            font-display: block;
          }
          @font-face {
            font-family: 'Mont';
            src: ${montB64 ? `url("data:font/truetype;base64,${montB64}") format("truetype")` : `url("/fonts/mont_heavydemo.ttf") format("truetype")`};
            font-weight: 900;
            font-style: normal;
            font-display: block;
          }
          
          .print-page {
            break-inside: avoid;
            margin: 0;
            padding: 0;
            padding-top: 40px;
            min-height: auto;
            display: grid;
            grid-template-columns: repeat(3, 200px);
            grid-template-rows: repeat(6, 140px);
            gap: 0;
            align-items: center;
            justify-items: center;
            justify-content: center;
            width: 100%;
            max-width: 600px;
            margin: 0 auto;
            box-sizing: border-box;
            transform: scale(1.13);
            transform-origin: top center;
          }
          
          .print-page-last {
            /* No special handling needed */
          }
          
          .price-tag {
            margin: 0;
            padding: 0;
          }
          
          /* SVG styles */
          svg {
            display: block;
            shape-rendering: geometricPrecision;
            text-rendering: geometricPrecision;
          }
          
          svg text {
            font-family: inherit;
          }
        </style>
        <script>
          // Dynamic grid layout based on content
          document.addEventListener('DOMContentLoaded', function() {
            const pages = document.querySelectorAll('.print-page');
            pages.forEach(page => {
              const rows = parseInt(page.getAttribute('data-rows') || '6');
              const isLast = page.getAttribute('data-is-last') === 'true';
              
              // Set dynamic grid rows based on actual content
              page.style.gridTemplateRows = \`repeat(\${rows}, 140px)\`;
              
              // Remove page break after for the last page
              if (isLast) {
                page.style.pageBreakAfter = 'auto';
                page.style.breakAfter = 'auto';
                page.classList.add('print-page-last');
              }
            });
          });
        </script>
      </head>
      <body>
        ${content}
      </body>
    </html>
  `;
}
