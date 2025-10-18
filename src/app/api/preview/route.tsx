import { ImageResponse } from "@vercel/og";
import type { NextRequest } from "next/server";

// Transliterate Cyrillic characters to Latin for @vercel/og compatibility
const transliterateCyrillic = (text: string): string => {
	const cyrillicToLatin: { [key: string]: string } = {
		А: "A",
		Б: "B",
		В: "V",
		Г: "G",
		Д: "D",
		Е: "E",
		Ё: "E",
		Ж: "ZH",
		З: "Z",
		И: "I",
		Й: "Y",
		К: "K",
		Л: "L",
		М: "M",
		Н: "N",
		О: "O",
		П: "P",
		Р: "R",
		С: "S",
		Т: "T",
		У: "U",
		Ф: "F",
		Х: "KH",
		Ц: "TS",
		Ч: "CH",
		Ш: "SH",
		Щ: "SCH",
		Ъ: "",
		Ы: "Y",
		Ь: "",
		Э: "E",
		Ю: "YU",
		Я: "YA",
		а: "a",
		б: "b",
		в: "v",
		г: "g",
		д: "d",
		е: "e",
		ё: "e",
		ж: "zh",
		з: "z",
		и: "i",
		й: "y",
		к: "k",
		л: "l",
		м: "m",
		н: "n",
		о: "o",
		п: "p",
		р: "r",
		с: "s",
		т: "t",
		у: "u",
		ф: "f",
		х: "kh",
		ц: "ts",
		ч: "ch",
		ш: "sh",
		щ: "sch",
		ъ: "",
		ы: "y",
		ь: "",
		э: "e",
		ю: "yu",
		я: "ya",
	};

	return text.replace(/[А-Яа-яЁё]/g, (char) => cyrillicToLatin[char] || char);
};

// Default themes matching the web app (from settingsStore.ts)
const defaultThemes: Record<
	string,
	{ start: string; end: string; textColor: string }
> = {
	default: { start: "#222222", end: "#dd4c9b", textColor: "#ffffff" },
	new: { start: "#222222", end: "#9cdd4c", textColor: "#ffffff" },
	sale: { start: "#222222", end: "#dd4c54", textColor: "#ffffff" },
	white: { start: "#ffffff", end: "#ffffff", textColor: "#000000" },
	black: { start: "#000000", end: "#000000", textColor: "#ffffff" },
	sunset: { start: "#ff7e5f", end: "#feb47b", textColor: "#ffffff" },
	ocean: { start: "#667eea", end: "#764ba2", textColor: "#ffffff" },
	forest: { start: "#134e5e", end: "#71b280", textColor: "#ffffff" },
	royal: { start: "#4c63d2", end: "#9c27b0", textColor: "#ffffff" },
	vintage: { start: "#8b4513", end: "#d2b48c", textColor: "#ffffff" },
	neon: { start: "#00ff00", end: "#ff00ff", textColor: "#000000" },
	monochrome: { start: "#4a4a4a", end: "#888888", textColor: "#ffffff" },
	silver: { start: "#c0c0c0", end: "#e8e8e8", textColor: "#000000" },
	charcoal: { start: "#2c2c2c", end: "#2c2c2c", textColor: "#ffffff" },
	paper: { start: "#f8f8f8", end: "#f0f0f0", textColor: "#333333" },
	ink: { start: "#1a1a1a", end: "#1a1a1a", textColor: "#ffffff" },
	snow: { start: "#ffffff", end: "#f5f5f5", textColor: "#000000" },
};

export async function GET(request: NextRequest) {
	console.log("Preview API called with URL:", request.url);

	try {
		const { searchParams } = new URL(request.url);

		console.log(
			"Raw search params:",
			Object.fromEntries(searchParams.entries()),
		);

		// Preview parameters with logging - add safe handling for all params
		const designType = String(searchParams.get("designType") || "default");
		const font = String(searchParams.get("font") || "montserrat");
		const hasDiscount = searchParams.get("hasDiscount") === "true";

		// Safe handling for discountText - sanitize for @vercel/og compatibility
		const rawDiscountText = searchParams.get("discountText");
		console.log("Raw discount text:", {
			rawDiscountText,
			type: typeof rawDiscountText,
		});

		let discountText =
			rawDiscountText || "цена при подписке\nна телеграм канал";

		// Sanitize discount text for @vercel/og
		try {
			// Ensure discountText is always a string first
			discountText = String(
				discountText || "цена при подписке\nна телеграм канал",
			);

			if (discountText.length > 0) {
				discountText = discountText.trim();

				// Transliterate Cyrillic in discount text too
				if (/[А-Яа-яЁё]/.test(discountText)) {
					console.log("Transliterating discount text:", discountText);
					discountText = transliterateCyrillic(discountText);
					console.log("Transliterated discount text to:", discountText);
				}
			} else {
				discountText = "tsena pri podpiske\nna telegram kanal"; // Latin fallback
			}
		} catch (e) {
			console.warn(
				"Discount text sanitization failed, using Latin fallback:",
				e,
			);
			discountText = "tsena pri podpiske\nna telegram kanal";
		}

		// Safe handling for productName - sanitize for @vercel/og compatibility
		const rawProductName = searchParams.get("productName");
		console.log("Raw product name:", {
			rawProductName,
			type: typeof rawProductName,
		});

		// Sanitize product name for @vercel/og - transliterate Cyrillic to avoid font issues
		let productName = rawProductName || "ТОВАР ПРИМЕР";

		try {
			// Ensure productName is always a string first
			productName = String(productName || "ТОВАР ПРИМЕР").trim();

			// For @vercel/og compatibility, transliterate Cyrillic text
			if (/[А-Яа-яЁё]/.test(productName)) {
				console.log("Transliterating Cyrillic text:", productName);
				productName = transliterateCyrillic(productName);
				console.log("Transliterated to:", productName);
			}

			if (productName.length === 0) {
				productName = "TOVAR PRIMER"; // Latin fallback
			}
		} catch (e) {
			console.warn("Product name processing failed, using Latin fallback:", e);
			productName = "TOVAR PRIMER";
		}

		const price = parseInt(searchParams.get("price") || "1000");
		const discountPrice = parseInt(searchParams.get("discountPrice") || "800");

		// Get theme colors from URL params (sent by bot with actual web app themes)
		const themeStart = searchParams.get("themeStart");
		const themeEnd = searchParams.get("themeEnd");
		const themeTextColor = searchParams.get("themeTextColor");

		// Multi-tier pricing - safely check for values
		const priceFor2 = searchParams.get("priceFor2");
		const priceFrom3 = searchParams.get("priceFrom3");

		// Check if both values exist and are valid (comprehensive null/undefined checks)
		const hasValidPriceFor2 =
			priceFor2 !== null &&
			priceFor2 !== "null" &&
			priceFor2 !== "undefined" &&
			typeof priceFor2 === "string" &&
			priceFor2.length > 0 &&
			String(priceFor2 || "").trim() !== "";

		const hasValidPriceFrom3 =
			priceFrom3 !== null &&
			priceFrom3 !== "null" &&
			priceFrom3 !== "undefined" &&
			typeof priceFrom3 === "string" &&
			priceFrom3.length > 0 &&
			String(priceFrom3 || "").trim() !== "";

		const hasMultiTierPricing = hasValidPriceFor2 && hasValidPriceFrom3;

		console.log("Preview parameters:", {
			designType,
			font,
			hasDiscount,
			discountText,
			productName,
			price,
			discountPrice,
			themeColors: { themeStart, themeEnd, themeTextColor },
			multiTier: { priceFor2, priceFrom3, hasMultiTierPricing },
		});

		// Use passed theme colors or fallback to defaults - БЕЗОПАСНО
		const theme = {
			start: String(
				themeStart ||
					defaultThemes[designType]?.start ||
					defaultThemes.default.start,
			),
			end: String(
				themeEnd || defaultThemes[designType]?.end || defaultThemes.default.end,
			),
			textColor: String(
				themeTextColor ||
					defaultThemes[designType]?.textColor ||
					defaultThemes.default.textColor,
			),
		};

		// Price tag dimensions matching PriceTagSVG exactly: 160x110, scaled 2.5x for resolution
		const _tagWidth = 400;
		const _tagHeight = 275;

		// Theme label logic matching PriceTagSVG
		const showThemeLabels = searchParams.get("showThemeLabels") !== "false";
		const shouldShowLabel =
			showThemeLabels && (designType === "new" || designType === "sale");

		// Border logic for solid colors (matching PriceTagSVG) - БЕЗОПАСНО
		const needsBorder =
			designType === "white" ||
			designType === "black" ||
			theme.start === theme.end;
		const borderColor = String(designType === "white" ? "#e5e5e5" : "#333333");
		const borderWidth = String(designType === "white" ? "3.75px" : "2.5px");

		// Smart cutting line color (matching PriceTagSVG) - БЕЗОПАСНО
		const isLightTheme = theme.textColor !== "#ffffff";
		const cutLineColor = String(isLightTheme ? "#000000" : "#ffffff");

		// Font family mapping (matching PriceTagSVG)
		const _getFontFamily = (fontName: string): string => {
			switch (fontName) {
				case "montserrat":
					return "Montserrat, sans-serif";
				case "nunito":
					return "Inter, sans-serif";
				case "inter":
					return "Inter, sans-serif";
				case "mont":
					return "Mont, Montserrat, sans-serif";
				default:
					return "Montserrat, sans-serif";
			}
		};

		console.log(
			"About to generate ImageResponse with @vercel/og compatible approach",
		);

		// КЛЮЧЕВОЕ ИСПРАВЛЕНИЕ: предварительно форматируем все данные ДО ImageResponse
		// Intl.NumberFormat не работает внутри @vercel/og JSX
		const formatNumber = (num: number) => {
			return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");
		};

		const formattedPrice = formatNumber(price || 0);
		const formattedDiscountPrice = formatNumber(discountPrice || 0);
		const formattedPriceFor2 = hasValidPriceFor2
			? formatNumber(parseInt(priceFor2 || "0"))
			: "0";
		const formattedPriceFrom3 = hasValidPriceFrom3
			? formatNumber(parseInt(priceFrom3 || "0"))
			: "0";

		// Предварительно обрабатываем все строки - ПОЛНОСТЬЮ БЕЗОПАСНО
		const safeProductName = String(productName || "TOVAR PRIMER");
		const safeDiscountText = String(discountText || "");

		// Безопасная обработка массива строк
		let discountLines: string[] = [];
		try {
			if (safeDiscountText && typeof safeDiscountText === "string") {
				discountLines = safeDiscountText
					.split("\n")
					.slice(0, 2)
					.map((line) => String(line || ""));
			}
		} catch (e) {
			console.warn("Error processing discount lines:", e);
			discountLines = [];
		}

		console.log("Pre-processed data:", {
			formattedPrice,
			formattedDiscountPrice,
			safeProductName,
			hasMultiTierPricing,
		});

		// Создаем ImageResponse с предварительно обработанными данными
		// FIX: Не используем кастомные шрифты из-за Windows bug в @vercel/og
		const imageResponse = new ImageResponse(
			<div
				style={{
					width: 400,
					height: 275,
					display: "flex",
					flexDirection: "column",
					justifyContent: "flex-start",
					alignItems: "flex-start",
					color: String(theme.textColor),
					background:
						theme.start === theme.end
							? String(theme.start)
							: `linear-gradient(135deg, ${String(theme.start)}, ${String(theme.end)})`,
					fontFamily: "sans-serif", // Используем только базовый шрифт
					padding: "20px 25px",
					position: "relative",
					border: needsBorder
						? `${String(borderWidth)} solid ${String(borderColor)}`
						: undefined,
				}}
			>
				{/* Product name */}
				<div
					style={{
						fontSize: 40,
						fontWeight: 500,
						textTransform: "uppercase",
						marginBottom: hasMultiTierPricing ? 10 : hasDiscount ? 5 : 20,
						whiteSpace: "nowrap",
						overflow: "hidden",
						width: "350px",
					}}
				>
					{safeProductName}
				</div>

				{/* Price section */}
				{hasMultiTierPricing ? (
					// Multi-tier pricing
					<div
						style={{
							display: "flex",
							flexDirection: "column",
							width: "100%",
							flex: 1,
						}}
					>
						<div style={{ fontSize: 15, marginBottom: 10 }}>Pri pokupke:</div>

						<div
							style={{
								display: "flex",
								justifyContent: "space-between",
								marginBottom: 5,
							}}
						>
							<span style={{ fontSize: 25 }}>ot 3 sht.</span>
							<span style={{ fontSize: 65, fontWeight: "bold" }}>
								{formattedPriceFrom3}
							</span>
						</div>

						<div
							style={{
								display: "flex",
								justifyContent: "space-between",
								marginBottom: 5,
							}}
						>
							<span style={{ fontSize: 25 }}>2 sht.</span>
							<span style={{ fontSize: 50, fontWeight: "bold" }}>
								{formattedPriceFor2}
							</span>
						</div>

						<div style={{ display: "flex", justifyContent: "space-between" }}>
							<span style={{ fontSize: 25 }}>1 sht.</span>
							<span style={{ fontSize: 40, fontWeight: "bold" }}>
								{formattedPrice}
							</span>
						</div>
					</div>
				) : (
					// Single price layout
					<div
						style={{
							display: "flex",
							flexDirection: "column",
							alignItems: "center",
							justifyContent: "center",
							flex: 1,
							width: "100%",
						}}
					>
						<div
							style={{
								fontSize: 130,
								fontWeight: "bold",
								textAlign: "center",
								lineHeight: 1,
							}}
						>
							{formattedPrice}
						</div>

						{hasDiscount && (
							<div
								style={{
									fontSize: 45,
									fontWeight: 400,
									opacity: 0.8,
									marginTop: -20,
									alignSelf: "flex-start",
									marginLeft: 25,
								}}
							>
								{formattedDiscountPrice}
							</div>
						)}
					</div>
				)}

				{/* Theme labels */}
				{shouldShowLabel && (
					<div
						style={{
							position: "absolute",
							right: -120,
							bottom: -35,
							transform: "rotate(-90deg)",
							fontSize: designType === "new" ? 130 : 120,
							fontWeight: 900,
							color: String(
								designType === "new"
									? defaultThemes.new.start
									: defaultThemes.sale.start,
							),
							whiteSpace: "nowrap",
						}}
					>
						{designType === "new" ? "NEW" : "SALE"}
					</div>
				)}

				{/* Discount text */}
				{hasDiscount && !hasMultiTierPricing && discountLines.length > 0 && (
					<div
						style={{
							position: "absolute",
							bottom: -35,
							left: 160,
							fontSize: 20,
							fontWeight: 500,
							opacity: 0.8,
							display: "flex",
							flexDirection: "column",
						}}
					>
						{discountLines.map((line, index) => (
							<div key={String(index)}>{String(line || "")}</div>
						))}
					</div>
				)}

				{/* Cutting lines */}
				<svg
					style={{
						position: "absolute",
						top: 0,
						left: 0,
						width: "100%",
						height: "100%",
						pointerEvents: "none",
					}}
					width="400"
					height="275"
					viewBox="0 0 400 275"
					role="img"
					aria-label="Cutting lines for price tag"
				>
					<line
						x1="0"
						y1="0"
						x2="400"
						y2="0"
						stroke={String(cutLineColor)}
						strokeWidth="1.5"
						strokeDasharray="30,7.5"
					/>
					<line
						x1="0"
						y1="275"
						x2="400"
						y2="275"
						stroke={String(cutLineColor)}
						strokeWidth="1.5"
						strokeDasharray="30,7.5"
					/>
					<line
						x1="0"
						y1="0"
						x2="0"
						y2="275"
						stroke={String(cutLineColor)}
						strokeWidth="1.5"
						strokeDasharray="20,7.5"
					/>
					<line
						x1="400"
						y1="0"
						x2="400"
						y2="275"
						stroke={String(cutLineColor)}
						strokeWidth="1.5"
						strokeDasharray="20,7.5"
					/>
				</svg>
			</div>,
			{
				width: 400,
				height: 275,
			},
		);

		console.log("ImageResponse created successfully");
		return imageResponse;
	} catch (error) {
		console.error("Preview API Error Details:", {
			error: error instanceof Error ? error.message : error,
			stack: error instanceof Error ? error.stack : undefined,
		});

		return new Response(
			JSON.stringify({
				error: "Preview generation failed",
				details: error instanceof Error ? error.message : "Unknown error",
			}),
			{
				status: 500,
				headers: { "Content-Type": "application/json" },
			},
		);
	}
}
