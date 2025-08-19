export interface ScreenshotOptions {
	html: string;
	width?: number;
	height?: number;
}

export async function generateScreenshot(
	options: ScreenshotOptions,
): Promise<Buffer> {
	const { html, width = 400, height = 275 } = options;

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

		// Set viewport to exact size
		await page.setViewport({
			width,
			height,
			deviceScaleFactor: 2, // For high quality
		});

		// Set content
		await page.setContent(html, {
			waitUntil: ["networkidle0", "domcontentloaded"],
		});

		// Wait for any fonts to load
		await page.evaluateHandle("document.fonts.ready");

		// Take screenshot of the price tag element or full page
		const screenshot = await page.screenshot({
			type: "png",
			clip: {
				x: 0,
				y: 0,
				width,
				height,
			},
			omitBackground: false,
		});

		return Buffer.from(screenshot);
	} catch (error) {
		console.error("Screenshot generation error:", error);
		throw new Error(
			`Failed to generate screenshot: ${error instanceof Error ? error.message : "Unknown error"}`,
		);
	} finally {
		if (browser) {
			await browser.close();
		}
	}
}
