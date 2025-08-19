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

	return `${baseUrl}/api/preview-puppeteer?${params.toString()}`;
}

// Get preview image as buffer
export async function getPreviewImage(
	sessionData: SessionData,
	ctx: MyContext,
	overrides: { [key: string]: string | boolean | number } = {},
): Promise<Buffer> {
	try {
		const { botEnv } = await import("../../bot-env");
		const previewUrl = generatePreviewUrl(
			sessionData,
			botEnv.NEXTJS_API_URL,
			overrides,
		);

		logger.debug("Fetching preview image", ctx, {
			previewUrl: `${previewUrl.substring(0, 100)}...`,
			overrides,
		});

		let response: Response;
		try {
			response = await fetch(previewUrl, {
				method: "GET",
				headers: {
					Accept: "image/svg+xml, image/png, */*",
					"User-Agent": "TelegramBot/1.0",
				},
				// Add timeout
				signal: AbortSignal.timeout(10000), // 10 second timeout
			});

			if (!response.ok) {
				const errorText = await response.text().catch(() => "No error details");
				throw new Error(`Preview API error: ${response.status} - ${errorText}`);
			}
		} catch (_fetchError) {
			logger.warn("Preview API unavailable, using fallback", ctx);

			// Generate a simple colored rectangle as fallback
			const fallbackSvg = `<svg width="400" height="275" xmlns="http://www.w3.org/2000/svg">
        <rect width="400" height="275" fill="#3b82f6"/>
        <text x="200" y="140" font-family="Arial" font-size="24" fill="white" text-anchor="middle">ПРЕВЬЮ НЕДОСТУПНО</text>
      </svg>`;

			return Buffer.from(fallbackSvg);
		}

		const buffer = Buffer.from(await response.arrayBuffer());

		// If response is SVG, keep it as is (Telegram can handle SVG)
		if (response.headers.get("content-type")?.includes("svg")) {
			logger.debug("Received SVG preview", ctx, { size: buffer.length });
		}

		logger.debug("Preview image generated", ctx, {
			imageSize: buffer.length,
		});

		return buffer;
	} catch (error) {
		logger.error("Failed to generate preview image", error, ctx);
		throw error;
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

		// Send photo with inline keyboard
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
		const media = InputMediaBuilder.photo(
			new InputFile(imageBuffer, "preview.png"),
			{
				caption: caption,
				parse_mode: "HTML",
			},
		);

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
		// If editing fails, send new message
		await ctx.reply("❌ Не удалось обновить превью.");
	}
}
