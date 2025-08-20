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
			// Production/Vercel configuration - optimized for speed
			const chromium = (await import("@sparticuz/chromium")).default;
			puppeteer = await import("puppeteer-core");
			launchOptions = {
				...launchOptions,
				args: [
					...chromium.args,
					// Additional optimization flags
					"--disable-web-security",
					"--disable-features=VizDisplayCompositor",
					"--disable-ipc-flooding-protection",
					"--disable-backgrounding-occluded-windows",
					"--disable-background-timer-throttling",
					"--disable-renderer-backgrounding",
					"--disable-background-networking",
					"--disable-component-extensions-with-background-pages",
					"--hide-scrollbars",
					"--mute-audio",
					"--no-first-run",
					"--disable-default-apps",
					"--disable-extensions",
				],
				executablePath: await chromium.executablePath(),
				// Reduce memory usage
				pipe: true,
			};
		} else {
			// Local development configuration - also optimized
			puppeteer = await import("puppeteer");
			launchOptions = {
				...launchOptions,
				args: [
					"--no-sandbox",
					"--disable-setuid-sandbox",
					"--disable-dev-shm-usage",
					"--disable-gpu",
					"--disable-web-security",
					"--disable-features=VizDisplayCompositor",
					"--hide-scrollbars",
					"--mute-audio",
					"--no-first-run",
					"--disable-extensions",
				],
				// Use pipe to reduce overhead
				pipe: true,
			};
		}

		browser = await puppeteer.launch(launchOptions);
		if (!browser) {
			throw new Error("Failed to launch browser");
		}

		const page = await browser.newPage();

		// Optimize page settings
		await page.setViewport({
			width,
			height,
			deviceScaleFactor: 1, // Reduced from 2 for speed
		});

		// Set content with faster options
		await page.setContent(html, {
			waitUntil: ["domcontentloaded"], // Faster than networkidle0
			timeout: 10000, // Reasonable timeout
		});

		// Wait for fonts to load - give more time for font loading
		try {
			// First, wait for DOM to be ready
			await page.waitForLoadState("domcontentloaded");

			// Then wait for fonts to load with longer timeout
			await page.evaluate(() => {
				return new Promise<void>((resolve) => {
					if (document.fonts?.ready) {
						document.fonts.ready.then(() => {
							console.log("All fonts loaded successfully");
							resolve();
						});
					} else {
						// Fallback if document.fonts is not supported
						setTimeout(() => {
							console.log("Font loading fallback timeout");
							resolve();
						}, 3000);
					}
				});
			});

			// Check font test element and log computed styles
			const fontInfo = await page.evaluate(() => {
				const testElement = document.getElementById("font-test");
				if (testElement) {
					const computedStyle = window.getComputedStyle(testElement);
					const fontFamily = computedStyle.fontFamily;
					const fontSize = computedStyle.fontSize;

					console.log("🔤 Font test element:", { fontFamily, fontSize });
					return { fontFamily, fontSize, elementExists: true };
				}
				return { elementExists: false };
			});

			console.log("🔤 Font loading check completed", fontInfo);

			// Additional wait for fonts to fully render
			await new Promise((resolve) => setTimeout(resolve, 3000));
			console.log("Font loading completed with extended wait");
		} catch (error) {
			// Ignore font loading errors but still wait a bit
			console.warn("Font loading timeout, proceeding anyway", error);
			await new Promise((resolve) => setTimeout(resolve, 2000));
		}

		// Take screenshot with optimized settings
		const screenshot = await page.screenshot({
			type: "png",
			clip: {
				x: 0,
				y: 0,
				width,
				height,
			},
			omitBackground: false,
			// PNG doesn't support quality parameter - only JPEG does
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
