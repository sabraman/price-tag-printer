/* eslint-disable @typescript-eslint/no-explicit-any */
import { type NextRequest, NextResponse } from "next/server";
import { createPrintableHTML } from "@/lib/puppeteer";

export async function POST(request: NextRequest) {
	try {
		const { html } = await request.json();

		if (!html) {
			return NextResponse.json(
				{ error: "HTML content is required" },
				{ status: 400 },
			);
		}

		// Create printable HTML with proper styling
		const printableHTML = createPrintableHTML(html);

		let browser: any;
		try {
			const isVercel = !!process.env.VERCEL_ENV;
			let puppeteer: any,
				launchOptions: any = {
					headless: true,
				};

			if (isVercel) {
				const chromium = (await import("@sparticuz/chromium")).default;
				puppeteer = await import("puppeteer-core");
				launchOptions = {
					...launchOptions,
					args: chromium.args,
					executablePath: await chromium.executablePath(),
				};
			} else {
				puppeteer = await import("puppeteer");
			}

			browser = await puppeteer.launch(launchOptions);
			const page = await browser.newPage();

			// Set viewport for consistent rendering
			await page.setViewport({
				width: 1200,
				height: 800,
				deviceScaleFactor: 1,
			});

			// Set content with proper CSS for print
			await page.setContent(printableHTML, {
				waitUntil: ["domcontentloaded"],
				timeout: 15000,
			});

			// Wait for fonts to load
			try {
				await page.evaluateHandle("document.fonts.ready");
				await new Promise((resolve) => setTimeout(resolve, 1000));
			} catch (error) {
				console.warn("Font loading timeout, proceeding anyway:", error);
			}

			// Generate PDF
			const pdf = await page.pdf({
				format: "A4",
				printBackground: true,
				margin: {
					top: "0",
					right: "0",
					bottom: "0",
					left: "0",
				},
				preferCSSPageSize: true,
			});

			return new NextResponse(pdf, {
				headers: {
					"Content-Type": "application/pdf",
					"Content-Disposition": 'attachment; filename="price-tags.pdf"',
					"Content-Length": pdf.length.toString(),
				},
			});
		} catch (error) {
			console.error("PDF generation error:", error);
			throw error;
		} finally {
			if (browser) {
				await browser.close();
			}
		}
	} catch (error) {
		console.error("PDF API error:", error);
		return NextResponse.json(
			{
				error: "Failed to generate PDF",
				details: error instanceof Error ? error.message : "Unknown error",
			},
			{ status: 500 },
		);
	}
}
