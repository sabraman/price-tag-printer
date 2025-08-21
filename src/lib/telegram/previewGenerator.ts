// Preview generation utilities for Telegram bot
import { type InlineKeyboard, InputFile, InputMediaBuilder } from "grammy";
import { logger } from "../../logger";
import { usePriceTagsStore } from "../../store/priceTagsStore";
import type { MyContext, SessionData } from "../../telegram-bot";

// Generate preview URL for current settings
export function generatePreviewUrl(
	sessionData: SessionData,
	baseUrl: string,
	overrides: { [key: string]: string | boolean | number } = {},
): string {
	const designType = overrides.designType?.toString() || sessionData.designType;
	const currentTheme = (
		sessionData.themes as Record<
			string,
			{ start: string; end: string; textColor: string }
		>
	)[designType];

	const params = new URLSearchParams({
		type: "theme",
		designType: designType,
		font: overrides.font?.toString() || sessionData.currentFont,
		hasDiscount: (overrides.hasDiscount !== undefined
			? overrides.hasDiscount
			: sessionData.design
		).toString(),
		discountText:
			overrides.discountText?.toString() || sessionData.discountText,
		productName:
			overrides.productName?.toString() ||
			sessionData.items[0]?.data?.toString() ||
			"ТОВАР ПРИМЕР",
		price:
			overrides.price?.toString() ||
			sessionData.items[0]?.price?.toString() ||
			"1000",
		discountPrice:
			overrides.discountPrice?.toString() ||
			sessionData.items[0]?.discountPrice?.toString() ||
			"800",
		showThemeLabels: (overrides.showThemeLabels !== undefined
			? overrides.showThemeLabels
			: sessionData.showThemeLabels
		).toString(),
		// Pass theme colors
		themeStart: currentTheme?.start || "#222222",
		themeEnd: currentTheme?.end || "#dd4c9b",
		themeTextColor: currentTheme?.textColor || "#ffffff",
	});

	// Only add multi-tier pricing if they exist
	const item = sessionData.items[0];
	if (item?.priceFor2 && item?.priceFrom3) {
		params.set("priceFor2", item.priceFor2.toString());
		params.set("priceFrom3", item.priceFrom3.toString());
	}

	let url = `${baseUrl}/api/preview-puppeteer?${params.toString()}`;

	// Append Vercel protection bypass if available
	const token = process.env.VERCEL_PROTECTION_BYPASS || process.env.VERCEL_BYPASS_TOKEN;
	if (token && baseUrl.includes("vercel.app")) {
		const join = url.includes("?") ? "&" : "?";
		url = `${url}${join}x-vercel-set-bypass-cookie=true&x-vercel-protection-bypass=${encodeURIComponent(
			token,
		)}`;
	}

	return url;
}

// Get preview image as buffer
export async function getPreviewImage(
	sessionData: SessionData,
	ctx: MyContext,
	overrides: { [key: string]: string | boolean | number } = {},
): Promise<Buffer> {
	try {
		const { botEnv } = await import("../../../bot-env");
		const previewUrl = generatePreviewUrl(
			sessionData,
			botEnv.NEXTJS_API_URL,
			overrides,
		);

		logger.debug("Fetching preview image", ctx, {
			previewUrl: `${previewUrl.substring(0, 100)}...`,
			overrides,
			apiUrl: botEnv.NEXTJS_API_URL,
		});

		let response: Response;
		const startTime = Date.now();

		try {
			logger.debug("Starting preview API request", ctx, { url: previewUrl });

			response = await fetch(previewUrl, {
				method: "GET",
				headers: {
					Accept: "image/png, image/svg+xml, */*",
					"User-Agent": "TelegramBot/1.0",
				},
				// Keep reasonable timeout for images
				signal: AbortSignal.timeout(15000), // 15 seconds - enough time for generation
			});

			const fetchTime = Date.now() - startTime;
			logger.debug("Preview API response received", ctx, {
				status: response.status,
				fetchTime: `${fetchTime}ms`,
				contentType: response.headers.get("content-type"),
			});

			if (!response.ok) {
				const errorText = await response.text().catch(() => "No error details");
				logger.error("Preview API error response", null, ctx, {
					status: response.status,
					statusText: response.statusText,
					errorText: errorText.substring(0, 200),
				});
				throw new Error(`Preview API error: ${response.status} - ${errorText}`);
			}
		} catch (fetchError) {
			const fetchTime = Date.now() - startTime;
			logger.warn("Preview API unavailable, using fallback", ctx, {
				fetchTime: `${fetchTime}ms`,
				error:
					fetchError instanceof Error ? fetchError.message : String(fetchError),
			});

			// Use a tiny valid PNG fallback to avoid Telegram IMAGE_PROCESS_FAILED on edit
			const tinyPngBase64 =
				"iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR4nGMAAQAABQABDQottAAAAABJRU5ErkJggg==";
			return Buffer.from(tinyPngBase64, "base64");
		}

		const buffer = Buffer.from(await response.arrayBuffer());
		const totalTime = Date.now() - startTime;

		logger.debug("Preview image processed successfully", ctx, {
			imageSize: buffer.length,
			totalTime: `${totalTime}ms`,
			contentType: response.headers.get("content-type"),
		});

		// Validate image size (Telegram has limits)
		if (buffer.length > 10 * 1024 * 1024) {
			// 10MB limit
			logger.warn("Preview image too large, using fallback", ctx, {
				size: buffer.length,
				limit: "10MB",
			});
			throw new Error("Image too large");
		}

		return buffer;
	} catch (error) {
		logger.error("Failed to generate preview image", error, ctx);

		// Final fallback: tiny valid PNG
		const tinyPngBase64 =
			"iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR4nGMAAQAABQABDQottAAAAABJRU5ErkJggg==";
		return Buffer.from(tinyPngBase64, "base64");
	}
}

// Send preview image with caption
export async function sendPreviewImage(
	ctx: MyContext,
	sessionData: SessionData,
	caption: string,
	overrides: { [key: string]: string | boolean | number } = {},
): Promise<void> {
	try {
		const imageBuffer = await getPreviewImage(sessionData, ctx, overrides);

		// Create InputFile for Grammy with proper buffer formatting
		await ctx.replyWithPhoto(new InputFile(imageBuffer, "preview.png"), {
			caption,
			parse_mode: "HTML",
		});

		logger.success("Preview image sent successfully", ctx, {
			captionLength: caption.length,
			overrides,
		});
	} catch (error) {
		logger.error("Failed to send preview image", error, ctx);
		await ctx.reply("❌ Не удалось создать превью. Попробуйте позже.");
	}
}

// Generate theme preview with current settings
export async function sendThemePreview(
	ctx: MyContext,
	sessionData: SessionData,
	themeName: string,
): Promise<void> {
	const caption =
		`🎨 <b>Превью темы:</b> <i>${getThemeDisplayName(themeName)}</i>\n\n` +
		`📝 <b>Товар:</b> ${sessionData.items[0]?.data || "ТОВАР ПРИМЕР"}\n` +
		`💰 <b>Цена:</b> ${sessionData.items[0]?.price || 1000}₽\n` +
		`🔤 <b>Шрифт:</b> ${sessionData.currentFont}\n` +
		`${sessionData.design ? "🏷️ <b>Скидка:</b> включена" : ""}`;

	await sendPreviewImage(ctx, sessionData, caption, { designType: themeName });
}

// Generate font preview with current settings
export async function sendFontPreview(
	ctx: MyContext,
	sessionData: SessionData,
	fontName: string,
): Promise<void> {
	const caption =
		`🔤 <b>Превью шрифта:</b> <i>${fontName}</i>\n\n` +
		`🎨 <b>Тема:</b> ${getThemeDisplayName(sessionData.designType)}\n` +
		`📝 <b>Товар:</b> ${sessionData.items[0]?.data || "ТОВАР ПРИМЕР"}\n` +
		`💰 <b>Цена:</b> ${sessionData.items[0]?.price || 1000}₽\n` +
		`${sessionData.design ? "🏷️ <b>Скидка:</b> включена" : ""}`;

	await sendPreviewImage(ctx, sessionData, caption, { font: fontName });
}

// Generate discount preview with current settings
export async function sendDiscountPreview(
	ctx: MyContext,
	sessionData: SessionData,
	hasDiscount: boolean,
	discountText?: string,
): Promise<void> {
	const caption =
		`🏷️ <b>Превью скидки:</b> <i>${hasDiscount ? "включена" : "выключена"}</i>\n\n` +
		`🎨 <b>Тема:</b> ${getThemeDisplayName(sessionData.designType)}\n` +
		`📝 <b>Товар:</b> ${sessionData.items[0]?.data || "ТОВАР ПРИМЕР"}\n` +
		`💰 <b>Цена:</b> ${sessionData.items[0]?.price || 1000}₽\n` +
		`🔤 <b>Шрифт:</b> ${sessionData.currentFont}\n` +
		`${hasDiscount && discountText ? `📄 <b>Текст скидки:</b> ${discountText}` : ""}`;

	const overrides: { [key: string]: string | boolean | number } = {
		hasDiscount,
	};

	if (discountText) {
		overrides.discountText = discountText;
	}

	await sendPreviewImage(ctx, sessionData, caption, overrides);
}

// Helper function to get display name for themes using web app store
function getThemeDisplayName(themeName: string): string {
	const themeNames: { [key: string]: string } = {
		default: "По умолчанию",
		new: "Новинка",
		sale: "Распродажа",
		white: "Белый",
		black: "Черный",
		sunset: "Закат",
		ocean: "Океан",
		forest: "Лес",
		royal: "Королевский",
		vintage: "Винтаж",
		neon: "Неон",
		monochrome: "Монохром",
		silver: "Серебро",
		charcoal: "Уголь",
		paper: "Бумага",
		ink: "Чернила",
		snow: "Снег",
	};

	return themeNames[themeName] || themeName;
}

// Get available themes from web app store
export function getAvailableThemes(): string[] {
	const store = usePriceTagsStore.getState();
	return Object.keys(store.themes);
}

// Send preview image with inline keyboard
export async function sendPreviewWithKeyboard(
	ctx: MyContext,
	sessionData: SessionData,
	caption: string,
	keyboard: InlineKeyboard,
	overrides: { [key: string]: string | boolean | number } = {},
): Promise<void> {
	try {
		const imageBuffer = await getPreviewImage(sessionData, ctx, overrides);

		// Create InputFile for Grammy with proper buffer formatting
		await ctx.replyWithPhoto(new InputFile(imageBuffer, "preview.png"), {
			caption,
			parse_mode: "HTML",
			reply_markup: keyboard,
		});

		logger.success("Preview with keyboard sent successfully", ctx, {
			captionLength: caption.length,
			overrides,
		});
	} catch (error) {
		logger.error("Failed to send preview with keyboard", error, ctx);
		await ctx.reply("❌ Не удалось создать превью. Попробуйте позже.");
	}
}

// Update existing preview message with new image and keyboard
export async function updatePreviewMessage(
	ctx: MyContext,
	sessionData: SessionData,
	keyboard?: InlineKeyboard,
	overrides: { [key: string]: string | boolean | number } = {},
): Promise<void> {
	try {
		const imageBuffer = await getPreviewImage(sessionData, ctx, overrides);

		const media = InputMediaBuilder.photo(
			new InputFile(imageBuffer, "preview.png"),
		);

		logger.debug("Attempting to update preview message", ctx, {
			imageSize: imageBuffer.length,
			hasKeyboard: !!keyboard,
		});

		if (keyboard) {
			// Update both media and keyboard
			await ctx.editMessageMedia(media, {
				reply_markup: keyboard,
			});
		} else {
			// Update only media
			await ctx.editMessageMedia(media);
		}

		logger.success("Preview message updated successfully", ctx, { overrides });
	} catch (error) {
		logger.error("Failed to update preview message", error, ctx);
		// If editing fails, send new message
		await ctx.reply("❌ Не удалось обновить превью.");
	}
}

// Update existing preview message with new image, caption and keyboard
export async function updatePreviewWithCaption(
	ctx: MyContext,
	sessionData: SessionData,
	caption: string,
	keyboard?: InlineKeyboard,
	overrides: { [key: string]: string | boolean | number } = {},
): Promise<void> {
	try {
		const imageBuffer = await getPreviewImage(sessionData, ctx, overrides);

		// Try to edit the message with the image
		const media = InputMediaBuilder.photo(
			new InputFile(imageBuffer, "preview.png"),
			{
				caption: caption,
				parse_mode: "HTML",
			},
		);

		logger.debug("Attempting to edit message with preview image", ctx, {
			imageSize: imageBuffer.length,
			hasKeyboard: !!keyboard,
		});

		if (keyboard) {
			// Update media, caption and keyboard
			await ctx.editMessageMedia(media, {
				reply_markup: keyboard,
			});
		} else {
			// Update media and caption only
			await ctx.editMessageMedia(media);
		}

		logger.success("Preview message with caption updated successfully", ctx, {
			captionLength: caption.length,
			overrides,
		});
	} catch (error) {
		logger.error("Failed to update preview message with caption", error, ctx);

		// Check if it's an IMAGE_PROCESS_FAILED error specifically
		const errorMessage = error instanceof Error ? error.message : String(error);
		if (
			errorMessage.includes("IMAGE_PROCESS_FAILED") ||
			errorMessage.includes("Bad Request")
		) {
			// Try to send a new message instead of editing
			try {
				logger.warn("Attempting to send new message instead of editing", ctx);
				await ctx.reply(caption, {
					reply_markup: keyboard,
					parse_mode: "HTML",
				});
				logger.success("Sent new message as fallback", ctx);
			} catch (fallbackError) {
				logger.error("Fallback message also failed", fallbackError, ctx);
				await ctx.reply("❌ Превью временно недоступно. Попробуйте позже.");
			}
		} else {
			// For other errors, just send error message
			await ctx.reply("❌ Не удалось обновить превью.");
		}
	}
}
