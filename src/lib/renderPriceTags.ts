// Client-side HTML generation for price tags
import type { Item, ThemeSet } from "@/store/priceTagsStore";

// Helper function to get proper font family for SVG
function getFontFamily(fontName: string): string {
	switch (fontName) {
		case "Montserrat":
			return "'Montserrat', sans-serif";
		case "Nunito":
			return "'Nunito', sans-serif";
		case "Inter":
			return "'Inter', sans-serif";
		case "Mont":
			return "'Mont', 'Montserrat', sans-serif";
		default:
			return "'Montserrat', sans-serif";
	}
}

interface RenderOptions {
	items: Item[];
	design: boolean;
	designType: string;
	themes: ThemeSet;
	font: string;
	discountText: string;
	useTableDesigns?: boolean;
	useTableDiscounts?: boolean;
	showThemeLabels?: boolean;
	cuttingLineColor?: string;
}

export function renderPriceTagsHTML(options: RenderOptions): string {
	const {
		items,
		design,
		designType,
		themes,
		font,
		discountText,
		useTableDesigns = false,
		useTableDiscounts = false,
		showThemeLabels = false,
		cuttingLineColor = "#e5e5e5",
	} = options;

	// Group items into pages (18 items per page: 3 columns × 6 rows)
	const itemsPerPage = 18;
	const pages: string[] = [];

	for (let i = 0; i < items.length; i += itemsPerPage) {
		const pageItems = items.slice(i, i + itemsPerPage);

		// Skip empty pages
		if (pageItems.length === 0) continue;

		const pageSVGs = pageItems
			.map((item, _index) => {
				const itemDesignType = useTableDesigns
					? item.designType || designType
					: designType;
				const itemHasDiscount = useTableDiscounts
					? (item.hasDiscount ?? design)
					: design;

				return generatePriceTagSVG({
					item,
					designType: itemDesignType,
					hasDiscount: itemHasDiscount,
					themes,
					font,
					discountText,
					showThemeLabels,
					cuttingLineColor,
				});
			})
			.join("");

		pages.push(`
			<div class="print-page">
				${pageSVGs}
			</div>
		`);
	}

	// Add font adjustment scripts that use the same logic as the React hook
	const scriptSection =
		items.length > 0
			? `
		<script>
			// Universal font adjustment function (same logic as useFontSizeAdjustment hook)
			function adjustFontSizeForElement(elementId, initialFontSize = 16, minFontSize = 4, adjustmentStep = 0.5, maxIterations = 20) {
				const element = document.getElementById(elementId);
				if (!element) return;
				
				let fontSize = initialFontSize;
				let iterations = 0;
				
				element.style.fontSize = fontSize + 'px';
				
				const performAdjustment = () => {
					if (iterations >= maxIterations) {
						return;
					}
					
					// Force a reflow to ensure accurate measurements
					element.offsetWidth;
					
					// Check only horizontal overflow for single-line text
					const isOverflown = element.scrollWidth > element.clientWidth;
					
					if (isOverflown) {
						if (fontSize > minFontSize) {
							fontSize = Math.max(fontSize - adjustmentStep, minFontSize);
							element.style.fontSize = fontSize + 'px';
							iterations++;
							
							// Continue checking regardless of font size - keep going until no overflow
							performAdjustment();
						}
					}
				};
				
				// Start adjustment immediately
				performAdjustment();
			}
			
			// Apply font adjustments to all price tag elements
			${items.map((item) => `adjustFontSizeForElement('product-name-${item.id}');`).join("\n\t\t\t")}
			
			// Also adjust on font load
			if (document.fonts && document.fonts.ready) {
				document.fonts.ready.then(() => {
					${items.map((item) => `adjustFontSizeForElement('product-name-${item.id}');`).join("\n\t\t\t\t")}
				});
			}
		</script>
		`
			: "";

	return pages.join("") + scriptSection;
}

interface SVGOptions {
	item: Item;
	designType: string;
	hasDiscount: boolean;
	themes: ThemeSet;
	font: string;
	discountText: string;
	showThemeLabels: boolean;
	cuttingLineColor: string;
}

function generatePriceTagSVG({
	item,
	designType,
	hasDiscount,
	themes,
	font,
	discountText,
	showThemeLabels,
	cuttingLineColor,
}: SVGOptions): string {
	const theme = themes[designType as keyof ThemeSet] || themes.default;
	if (!theme) return "";

	const id = item.id;
	const originalPrice = item.price;
	const discountPrice = hasDiscount ? item.discountPrice : originalPrice;
	const hasMultiTierPricing = item.priceFor2 && item.priceFrom3;

	// Determine border settings (same logic as React component)
	const needsBorder =
		designType === "white" ||
		designType === "black" ||
		theme.start === theme.end;
	const borderColor = designType === "white" ? "#e5e5e5" : "#333333";

	// Smart cutting line color logic (same as React component)
	const isLightTheme = theme.textColor !== "#ffffff";
	const automaticCutLineColor = isLightTheme ? "#000000" : "#ffffff";
	const cutLineColor =
		!cuttingLineColor || cuttingLineColor === "#cccccc"
			? automaticCutLineColor
			: cuttingLineColor;

	// Generate gradient definition (matching React component exactly)
	const gradientId = `linear-gradient-${id}`;

	const fontFamily = getFontFamily(font);
	const shouldShowLabel =
		showThemeLabels && (designType === "new" || designType === "sale");

	// Structure exactly like React component: div > svg (background) + div (content) + svg (cutting lines)
	return `
		<div style="position: relative; width: 160px; height: 110px; overflow: hidden; display: inline-block;">
			<div style="position: absolute; inset: 0;">
				<!-- Background SVG (same as React component) -->
				<svg width="160" height="110" viewBox="0 0 160 110" xmlns="http://www.w3.org/2000/svg">
					<defs>
						<linearGradient id="${gradientId}" x1="13.75" y1="108.41" x2="148.83" y2="10.42" gradientUnits="userSpaceOnUse">
							<stop offset="0" stop-color="${theme.start}" />
							<stop offset="1" stop-color="${theme.end}" />
						</linearGradient>
					</defs>
					<rect width="160" height="110" 
					      fill="${theme.start === theme.end ? theme.start : `url(#${gradientId})`}"
					      ${needsBorder ? `stroke="${borderColor}" stroke-width="${designType === "white" ? "1.5" : "1"}"` : ""} />
				</svg>
				
				<!-- Content overlay (same structure as React component) -->
				<div style="position: absolute; top: 0; color: ${theme.textColor};">
					${
						shouldShowLabel && designType === "new"
							? `
						<div style="position: absolute; right: -52px; bottom: -4px; transform: rotate(-90deg); font-size: 52px; font-weight: 900; white-space: nowrap; overflow: hidden; width: 118px; font-family: ${fontFamily}; color: ${themes.new.start};">
							NEW
						</div>
					`
							: shouldShowLabel && designType === "sale"
								? `
						<div style="position: absolute; right: -48px; bottom: -4px; transform: rotate(-90deg); font-size: 48px; font-weight: 900; white-space: nowrap; overflow: hidden; width: 124px; font-family: ${fontFamily}; color: ${themes.sale.start};">
							SALE
						</div>
					`
								: ""
					}
					
					<!-- Product name -->
					<div id="product-name-${id}" style="width: 146px; height: 24px; overflow: hidden; position: relative; top: 8px; left: 10px; text-align: left; font-size: 16px; line-height: 1.2; font-weight: 500; text-transform: uppercase; font-family: ${fontFamily}; white-space: nowrap; display: flex; align-items: center;">
						${String(item.data)}
					</div>

					${
						hasMultiTierPricing
							? `
						<!-- Multi-tier pricing layout -->
				<div style="width: 168px; height: 60px; position: relative; font-family: ${fontFamily};">
					<div style="display: flex; flex-direction: column; gap: 0px; padding-left: 10px; padding-right: 14px; padding-top: 4px; line-height: normal;">
						<div style="display: flex; justify-content: space-between; align-items: center; padding-top: -12px;">
							<div style="display: flex; flex-direction: column; gap: -3px; width: 100%;">
								<span style="font-size: 6px; text-align: left; width: 100%; font-family: ${fontFamily};">
									При покупке:
								</span>
								<span style="font-size: 10px; width: 100%; font-family: ${fontFamily};">
									от 3 шт.
								</span>
							</div>
								<span style="font-size: 26px; font-weight: bold; text-align: right; width: 100%; font-family: ${fontFamily};">
									${item.priceFrom3 !== undefined ? new Intl.NumberFormat("ru-RU").format(item.priceFrom3) : ""}
								</span>
							</div>
							<div style="display: flex; justify-content: space-between; align-items: center; gap: 4px;">
								<span style="font-size: 10px; width: 100%; font-family: ${fontFamily};">
									2 шт.
								</span>
								<span style="font-size: 20px; font-weight: bold; text-align: right; width: 100%; font-family: ${fontFamily};">
									${item.priceFor2 !== undefined ? new Intl.NumberFormat("ru-RU").format(item.priceFor2) : ""}
								</span>
							</div>
							<div style="display: flex; justify-content: space-between; align-items: center; gap: 4px;">
								<span style="font-size: 10px; width: 100%; font-family: ${fontFamily};">
									1 шт.
								</span>
								<span style="font-size: 16px; font-weight: bold; text-align: right; width: 100%; font-family: ${fontFamily};">
									${originalPrice !== undefined ? new Intl.NumberFormat("ru-RU").format(originalPrice) : ""}
								</span>
							</div>
						</div>
					</div>
					`
							: `
						<!-- Single price layout -->
						<div style="padding-top: 5px; font-weight: bold; width: 160px; height: 60px; font-size: 52px; text-align: center; line-height: ${hasDiscount ? "60px" : "75px"}; font-family: ${fontFamily};">
							<span style="position: relative;">
								${new Intl.NumberFormat("ru-RU").format(originalPrice)}
							</span>
							${
								hasDiscount && discountPrice !== originalPrice
									? `
								<br>
								<span style="position: absolute; bottom: 3px; left: 10px; width: 70px; height: 18px; font-weight: normal; font-size: 18px; text-align: left; opacity: 0.8; font-family: ${fontFamily};">
									${new Intl.NumberFormat("ru-RU").format(discountPrice)}
								</span>
							`
									: ""
							}
					</div>
					`
					}

					${
						hasDiscount && !hasMultiTierPricing && discountText
							? `
						<!-- Discount text -->
						<div style="position: absolute; bottom: -16px; left: 65px; font-size: 8px; font-weight: 500; line-height: 1; max-width: 100px; display: flex; flex-direction: column; opacity: 0.8; font-family: ${fontFamily};">
							${discountText
								.split("\n")
								.slice(0, 2)
								.map((line) => `<div>${line}</div>`)
								.join("")}
						</div>
					`
							: ""
					}
				</div>

				<!-- Cutting lines SVG (same as React component) -->
				<svg style="position: absolute; inset: 0; pointer-events: none;" width="160" height="110" viewBox="0 0 160 110" xmlns="http://www.w3.org/2000/svg">
					<line x1="0" y1="0" x2="160" y2="0" stroke="${cutLineColor}" stroke-width="0.75" stroke-dasharray="12,3"/>
					<line x1="0" y1="110" x2="160" y2="110" stroke="${cutLineColor}" stroke-width="0.75" stroke-dasharray="12,3"/>
					<line x1="0" y1="0" x2="0" y2="110" stroke="${cutLineColor}" stroke-width="0.75" stroke-dasharray="8,3"/>
					<line x1="160" y1="0" x2="160" y2="110" stroke="${cutLineColor}" stroke-width="0.75" stroke-dasharray="8,3"/>
				</svg>
			</div>
		</div>
	`;
}
