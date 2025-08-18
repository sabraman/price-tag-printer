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
        <link rel="preconnect" href="https://fonts.googleapis.com">
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
        <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@300;400;500;600;700;900&family=Inter:wght@400;500;600;700&family=Nunito:wght@300;400;500;600;700;900&display=block" rel="stylesheet">
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
          
          /* Ensure fonts are loaded */
          @font-face {
            font-family: 'Montserrat';
            font-style: normal;
            font-weight: 400;
            font-display: block;
            src: url('https://fonts.gstatic.com/s/montserrat/v26/JTUHjIg1_i6t8kCHKm4532VJOt5-QNFgpCtr6Ew-.woff2') format('woff2');
          }
          
          @font-face {
            font-family: 'Montserrat';
            font-style: normal;
            font-weight: 500;
            font-display: block;
            src: url('https://fonts.gstatic.com/s/montserrat/v26/JTUHjIg1_i6t8kCHKm4532VJOt5-QNFgpCtZ6Ew-.woff2') format('woff2');
          }
          
          @font-face {
            font-family: 'Montserrat';
            font-style: normal;
            font-weight: 600;
            font-display: block;
            src: url('https://fonts.gstatic.com/s/montserrat/v26/JTUHjIg1_i6t8kCHKm4532VJOt5-QNFgpCuM61Ew-.woff2') format('woff2');
          }
          
          @font-face {
            font-family: 'Montserrat';
            font-style: normal;
            font-weight: 700;
            font-display: block;
            src: url('https://fonts.gstatic.com/s/montserrat/v26/JTUHjIg1_i6t8kCHKm4532VJOt5-QNFgpCuN61Ew-.woff2') format('woff2');
          }
          
          @font-face {
            font-family: 'Montserrat';
            font-style: normal;
            font-weight: 900;
            font-display: block;
            src: url('https://fonts.gstatic.com/s/montserrat/v26/JTUHjIg1_i6t8kCHKm4532VJOt5-QNFgpCvr61Ew-.woff2') format('woff2');
          }
          
          /* Additional font weights for better rendering */
          @font-face {
            font-family: 'Montserrat';
            font-style: normal;
            font-weight: 800;
            font-display: block;
            src: url('https://fonts.gstatic.com/s/montserrat/v26/JTUHjIg1_i6t8kCHKm4532VJOt5-QNFgpCur61Ew-.woff2') format('woff2');
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
