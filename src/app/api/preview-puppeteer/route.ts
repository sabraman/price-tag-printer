import type { NextRequest } from "next/server";
import { generateScreenshot } from "../../../lib/screenshot";

export async function GET(request: NextRequest) {
	console.log("Puppeteer preview API called");

	try {
		const { searchParams } = new URL(request.url);

		const designType = searchParams.get("designType") || "default";
		const font = searchParams.get("font") || "montserrat";
		const productName = searchParams.get("productName") || "ТОВАР ПРИМЕР";
		const price = parseInt(searchParams.get("price") || "1000");
		const discountPrice = parseInt(searchParams.get("discountPrice") || "800");
		const hasDiscount = searchParams.get("hasDiscount") === "true";

		// Theme colors
		const themeStart = searchParams.get("themeStart") || "#3b82f6";
		const themeEnd = searchParams.get("themeEnd") || "#1d4ed8";
		const themeTextColor = searchParams.get("themeTextColor") || "#ffffff";

		// Format price function
		const formatNumber = (num: number) => {
			return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");
		};

		const formattedPrice = formatNumber(price);
		const formattedDiscountPrice = formatNumber(discountPrice);

		// Определяем нужен ли бордер (из PriceTagSVG.tsx)
		const needsBorder =
			designType === "white" ||
			designType === "black" ||
			themeStart === themeEnd;
		const borderColor = designType === "white" ? "#e5e5e5" : "#333333";
		const borderWidth = designType === "white" ? "1.5" : "1";

		// Smart cutting line color (из PriceTagSVG.tsx)
		const isLightTheme = themeTextColor !== "#ffffff";
		const cutLineColor = isLightTheme ? "#000000" : "#ffffff";

		// Theme label logic (из PriceTagSVG.tsx)
		const showThemeLabels = searchParams.get("showThemeLabels") !== "false";
		const shouldShowLabel =
			showThemeLabels && (designType === "new" || designType === "sale");

		// Multi-tier pricing
		const priceFor2 = searchParams.get("priceFor2");
		const priceFrom3 = searchParams.get("priceFrom3");
		const hasMultiTierPricing =
			priceFor2 && priceFrom3 && priceFor2 !== "null" && priceFrom3 !== "null";

		// Форматируем multi-tier цены
		const formattedPriceFor2 = priceFor2
			? formatNumber(parseInt(priceFor2))
			: "";
		const formattedPriceFrom3 = priceFrom3
			? formatNumber(parseInt(priceFrom3))
			: "";

		// Discount text
		const discountText =
			searchParams.get("discountText") ||
			"цена при подписке\nна телеграм канал";
		const discountLines = discountText.split("\n").slice(0, 2);

		// Font family mapping (matching PriceTagSVG.tsx)
		const getFontFamily = (fontName: string): string => {
			const normalizedFont = fontName.toLowerCase();
			switch (normalizedFont) {
				case "montserrat":
					return "'Montserrat', sans-serif";
				case "nunito":
					return "'Nunito', sans-serif";
				case "inter":
					return "'Inter', sans-serif";
				case "mont":
					return "'Mont', 'Montserrat', sans-serif";
				default:
					return "'Montserrat', sans-serif";
			}
		};

		const fontFamily = getFontFamily(font);

		// Создаем HTML ТОЧНО как PriceTagSVG.tsx (160x110 размер, масштабируем до 400x275)
		const html = `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@300;400;500;600;700;900&display=swap" rel="stylesheet">
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
        <link href="https://fonts.googleapis.com/css2?family=Nunito:wght@300;400;500;600;700;900&display=swap" rel="stylesheet">
        <style>
            body { 
                margin: 0; 
                padding: 0;
                background: white;
                font-family: ${fontFamily};
            }
            
            /* ТОЧНО как PriceTagSVG.tsx - масштабируем 160x110 до 400x275 (x2.5) */
            .price-tag {
                position: relative;
                width: 400px; /* 160 * 2.5 */
                height: 275px; /* 110 * 2.5 */
                overflow: hidden;
            }
            
            .background-svg {
                position: absolute;
                top: 0;
                left: 0;
            }
            
            .content-overlay {
                position: absolute;
                top: 0;
                left: 0;
                color: ${themeTextColor};
            }
            
            /* Product name - ТОЧНО как PriceTagSVG.tsx */
            .product-name {
                width: 365px; /* 146 * 2.5 */
                height: 60px; /* 24 * 2.5 */
                overflow: hidden;
                position: relative;
                top: 12.5px; /* 8 * 2.5 / 1.6 (из top-2) */
                left: 25px; /* 10 * 2.5 */
                text-align: left;
                font-size: 40px; /* 16 * 2.5 (base font size) */
                line-height: 1.2;
                font-weight: 500;
                text-transform: uppercase;
                white-space: nowrap;
                display: flex;
                align-items: center;
                font-family: ${fontFamily};
            }
            
            /* Single price layout - ТОЧНО как PriceTagSVG.tsx */
            .single-price {
                padding-top: 12.5px; /* 5 * 2.5 */
                font-weight: bold;
                width: 400px; /* 160 * 2.5 */
                height: 150px; /* 60 * 2.5 */
                font-size: 130px; /* 52 * 2.5 */
                text-align: center;
                line-height: ${hasDiscount ? "150px" : "187.5px"}; /* 60px / 75px * 2.5 */
                font-family: ${fontFamily};
            }
            
            .discount-price {
                position: absolute;
                bottom: 7.5px; /* 3 * 2.5 */
                left: 25px; /* 10 * 2.5 */
                width: 175px; /* 70 * 2.5 */
                height: 45px; /* 18 * 2.5 */
                font-weight: normal;
                font-size: 45px; /* 18 * 2.5 */
                text-align: left;
                opacity: 0.8;
                font-family: ${fontFamily};
            }
            
            /* Theme labels - ТОЧНО как PriceTagSVG.tsx */
            .theme-label-new {
                position: absolute;
                right: -130px; /* -52 * 2.5 */
                bottom: -5px; /* -14 * 2.5 */
                transform: rotate(-90deg);
                font-size: 130px; /* 52 * 2.5 */
                font-weight: 900;
                white-space: nowrap;
                overflow: hidden;
                width: 295px; /* 118 * 2.5 */
                color: #10b981; /* themes.new.start equivalent */
                font-family: ${fontFamily};
            }
            
            .theme-label-sale {
                position: absolute;
                right: -120px; /* -48 * 2.5 */
                bottom: -5px; /* -14 * 2.5 */
                transform: rotate(-90deg);
                font-size: 120px; /* 48 * 2.5 */
                font-weight: 900;
                white-space: nowrap;
                overflow: hidden;
                width: 310px; /* 124 * 2.5 */
                color: #ef4444; /* themes.sale.start equivalent */
                font-family: ${fontFamily};
            }
            
            /* Discount text - ТОЧНО как PriceTagSVG.tsx */
            .discount-text {
                position: absolute;
                bottom: -40px; /* -16 * 2.5 */
                left: 162.5px; /* 65 * 2.5 */
                font-size: 20px; /* 8 * 2.5 */
                font-weight: 500;
                line-height: 1;
                max-width: 250px; /* 100 * 2.5 */
                display: flex;
                flex-direction: column;
                opacity: 0.8;
                font-family: ${fontFamily};
            }
            
            /* Multi-tier pricing - ТОЧНО как PriceTagSVG.tsx */
            .multi-tier {
                width: 400px; /* 160 * 2.5 */
                height: 150px; /* 60 * 2.5 */
                position: relative;
                padding-left: 25px; /* 10 * 2.5 */
                padding-right: 35px; /* 14 * 2.5 */
                padding-top: 25px; /* 10 * 2.5 */
                display: flex;
                flex-direction: column;
                font-family: ${fontFamily};
            }
            
            .multi-tier .label {
                font-size: 15px; /* 6 * 2.5 */
                text-align: left;
                width: 100%;
                margin-bottom: 5px;
                font-family: ${fontFamily};
            }
            
            .multi-tier .tier {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 8px;
            }
            
            .multi-tier .tier-label {
                font-size: 25px; /* 10 * 2.5 */
                width: 50%;
                font-family: ${fontFamily};
            }
            
            .multi-tier .tier-price-large {
                font-size: 65px; /* 26 * 2.5 */
                font-weight: bold;
                text-align: right;
                width: 50%;
                font-family: ${fontFamily};
            }
            
            .multi-tier .tier-price-medium {
                font-size: 50px; /* 20 * 2.5 */
                font-weight: bold;
                text-align: right;
                width: 50%;
                font-family: ${fontFamily};
            }
            
            .multi-tier .tier-price-small {
                font-size: 40px; /* 16 * 2.5 */
                font-weight: bold;
                text-align: right;
                width: 50%;
                font-family: ${fontFamily};
            }
        </style>
    </head>
    <body>
        <div class="price-tag">
            <!-- Background SVG - ТОЧНО как PriceTagSVG.tsx -->
            <svg class="background-svg" width="400" height="275" viewBox="0 0 160 110" xmlns="http://www.w3.org/2000/svg">
                <defs>
                    <linearGradient id="linear-gradient" x1="13.75" y1="108.41" x2="148.83" y2="10.42" gradientUnits="userSpaceOnUse">
                        <stop offset="0" stop-color="${themeStart}" />
                        <stop offset="1" stop-color="${themeEnd}" />
                    </linearGradient>
                </defs>
                <rect width="160" height="110" 
                      fill="${themeStart === themeEnd ? themeStart : "url(#linear-gradient)"}"
                      ${needsBorder ? `stroke="${borderColor}" stroke-width="${borderWidth}"` : ""} />
            </svg>
            
            <div class="content-overlay">
                ${
									shouldShowLabel && designType === "new"
										? `<div class="theme-label-new">NEW</div>`
										: shouldShowLabel && designType === "sale"
											? `<div class="theme-label-sale">SALE</div>`
											: ""
								}
                
                <!-- Product name -->
                <div class="product-name">${productName}</div>
                
                ${
									hasMultiTierPricing
										? `
                <!-- Multi-tier pricing layout -->
                <div class="multi-tier">
                    <div class="label">При покупке:</div>
                    <div class="tier">
                        <span class="tier-label">от 3 шт.</span>
                        <span class="tier-price-large">${formattedPriceFrom3}</span>
                    </div>
                    <div class="tier">
                        <span class="tier-label">2 шт.</span>
                        <span class="tier-price-medium">${formattedPriceFor2}</span>
                    </div>
                    <div class="tier">
                        <span class="tier-label">1 шт.</span>
                        <span class="tier-price-small">${formattedPrice}</span>
                    </div>
                </div>
                `
										: `
                <!-- Single price layout -->
                <div class="single-price">
                    <span style="position: relative;">${formattedPrice}</span>
                    ${
											hasDiscount && discountPrice !== price
												? `<span class="discount-price">${formattedDiscountPrice}</span>`
												: ""
										}
                </div>
                `
								}
                
                ${
									hasDiscount &&
									!hasMultiTierPricing &&
									discountLines.length > 0
										? `
                <!-- Discount text -->
                <div class="discount-text">
                    ${discountLines.map((line) => `<div>${line}</div>`).join("")}
                </div>
                `
										: ""
								}
            </div>
            
            <!-- Cutting lines SVG - ТОЧНО как PriceTagSVG.tsx -->
            <svg style="position: absolute; top: 0; left: 0; pointer-events: none;" 
                 width="400" height="275" viewBox="0 0 160 110" xmlns="http://www.w3.org/2000/svg">
                <line x1="0" y1="0" x2="160" y2="0" stroke="${cutLineColor}" stroke-width="0.75" stroke-dasharray="12,3"/>
                <line x1="0" y1="110" x2="160" y2="110" stroke="${cutLineColor}" stroke-width="0.75" stroke-dasharray="12,3"/>
                <line x1="0" y1="0" x2="0" y2="110" stroke="${cutLineColor}" stroke-width="0.75" stroke-dasharray="8,3"/>
                <line x1="160" y1="0" x2="160" y2="110" stroke="${cutLineColor}" stroke-width="0.75" stroke-dasharray="8,3"/>
            </svg>
        </div>
    </body>
    </html>
    `;

		// Generate PNG using puppeteer screenshot
		const pngBuffer = await generateScreenshot({
			html,
			width: 400,
			height: 275,
		});

		console.log("Puppeteer PNG generated successfully");

		return new Response(pngBuffer, {
			status: 200,
			headers: {
				"Content-Type": "image/png",
				"Cache-Control": "no-cache, no-store, must-revalidate",
			},
		});
	} catch (error) {
		console.error("Puppeteer preview error:", error);

		return new Response("Error generating preview", {
			status: 500,
			headers: { "Content-Type": "text/plain" },
		});
	}
}
