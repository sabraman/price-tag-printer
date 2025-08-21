import type { HTTPRequest } from "puppeteer-core";

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

		// Optimize page settings for faster rendering
		await Promise.all([
			page.setViewport({
				width,
				height,
				deviceScaleFactor: 1, // Reduced from 2 for speed
			}),
			// Disable JavaScript for screenshots if not needed (faster rendering)
			// page.setJavaScriptEnabled(false), // Uncomment if JS not needed
			// Block unnecessary resources for faster loading
			page.setRequestInterception(true),
		]);

		// Block unnecessary requests to speed up loading
		page.on("request", (request: HTTPRequest) => {
			const resourceType = request.resourceType();
			const url = request.url();

			// Allow essential resources for font rendering
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
				// Block unnecessary resources
				request.abort();
			} else {
				request.continue();
			}
		});

		// Set content with faster options
		await page.setContent(html, {
			waitUntil: ["domcontentloaded"], // Faster than networkidle0
			timeout: 10000, // Reasonable timeout
		});

		// Optimized font loading with proper Promise-based waiting
		try {
			// Use Promise.race to ensure we don't wait forever
			await Promise.race([
				// Primary strategy: Wait for fonts to be ready
				page.waitForFunction(
					() => {
						// Check if document.fonts API is available
						if (!document.fonts) {
							console.log("document.fonts API not available, proceeding");
							return true;
						}

						// Wait for fonts to be ready
						return document.fonts.ready
							.then(() => {
								console.log("All fonts loaded via document.fonts.ready");
								return true;
							})
							.catch(() => {
								console.log("Font loading promise rejected, proceeding");
								return true;
							});
					},
					{ timeout: 5000 }, // 5 second timeout
				),

				// Fallback timeout using Promise
				new Promise<void>((resolve) => setTimeout(resolve, 4000)), // 4 second fallback
			]);

			// Check font test element in parallel with font loading
			const fontCheckPromise = page.evaluate(() => {
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

			const fontInfo = await fontCheckPromise;
			console.log("🔤 Font loading optimized check completed", fontInfo);
		} catch (error) {
			console.warn(
				"Font loading optimization failed, proceeding anyway",
				error,
			);
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
