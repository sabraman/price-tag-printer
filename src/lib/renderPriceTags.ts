// Client-side HTML generation for price tags
import type { Item, ThemeSet } from "@/store/priceTagsStore";

// Helper function to get proper font family for SVG (case-insensitive)
function getFontFamily(fontName: string): string {
	const normalized = (fontName || "").trim().toLowerCase();
	switch (normalized) {
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

	// Group items into pages (more flexible layout)
	const itemsPerPage = 18; // Maximum items per page, but we'll be flexible
	const pages: string[] = [];

	// Only create pages if there are items
	if (items.length === 0) {
		return "";
	}

	// Calculate total pages needed
	const _totalPages = Math.ceil(items.length / itemsPerPage);

	for (let i = 0; i < items.length; i += itemsPerPage) {
		const pageItems = items.slice(i, i + itemsPerPage);

		// Skip empty pages
		if (pageItems.length === 0) continue;

		// Calculate the exact number of rows needed for this page (3 columns)
		const rowsNeeded = Math.ceil(pageItems.length / 3);
		const isLastPage = i + itemsPerPage >= items.length;

		const pageSVGs = pageItems
			.map((item, index) => {
				void index;
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

		// Only add page break if this is not the last page
		const pageBreakClass = isLastPage
			? "print-page print-page-last"
			: "print-page";

		pages.push(`
			<div class="${pageBreakClass}" data-rows="${rowsNeeded}" data-is-last="${isLastPage}">
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
			function adjustFontSizeForElement(elementId, initialFontSize = 20, minFontSize = 4, adjustmentStep = 0.5, maxIterations = 20) {
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
					
					// Use the actual container width (178px) instead of clientWidth
					const containerWidth = 178;
					const isOverflown = element.scrollWidth > containerWidth;
					
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

	// Name display guard: blank when sentinel '$$$' is provided
	const rawName = String(item.data ?? "");
	const displayName = rawName.trim() === "$$$" ? "" : rawName;

	// Visibility guards: blank output for NaN or non-finite
	const showBasePrice =
		Number.isFinite(originalPrice) && (originalPrice as number) > 0;
	const showDiscountPrice =
		Number.isFinite(discountPrice) && (discountPrice as number) > 0;
	const showPriceFor2 =
		Number.isFinite(item.priceFor2 as number) && (item.priceFor2 as number) > 0;
	const showPriceFrom3 =
		Number.isFinite(item.priceFrom3 as number) &&
		(item.priceFrom3 as number) > 0;
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
		<div style="position: relative; width: 200px; height: 140px; overflow: hidden; display: inline-block;">
			<div style="position: absolute; inset: 0;">
				<!-- Background SVG (same as React component) -->
				<svg width="200" height="140" viewBox="0 0 200 140" xmlns="http://www.w3.org/2000/svg">
					<defs>
						<linearGradient id="${gradientId}" x1="17.5" y1="138" x2="186" y2="13.3" gradientUnits="userSpaceOnUse">
							<stop offset="0" stop-color="${theme.start}" />
							<stop offset="1" stop-color="${theme.end}" />
						</linearGradient>
					</defs>
					<rect width="200" height="140" 
					      fill="${theme.start === theme.end ? theme.start : `url(#${gradientId})`}"
					      ${needsBorder ? `stroke="${borderColor}" stroke-width="${designType === "white" ? "2" : "1.5"}"` : ""} />
				</svg>
				
				<!-- Content overlay (same structure as React component) -->
				<div style="position: absolute; top: 0; color: ${theme.textColor};">
					${
						shouldShowLabel && designType === "new"
							? `
						<div style="position: absolute; right: -65px; bottom: -5px; transform: rotate(-90deg); font-size: 65px; font-weight: 900; white-space: nowrap; overflow: hidden; width: 148px; font-family: ${fontFamily}; color: ${themes.new.start};">
							NEW
						</div>
					`
							: shouldShowLabel && designType === "sale"
								? `
						<div style="position: absolute; right: -60px; bottom: -5px; transform: rotate(-90deg); font-size: 60px; font-weight: 900; white-space: nowrap; overflow: hidden; width: 155px; font-family: ${fontFamily}; color: ${themes.sale.start};">
							SALE
						</div>
					`
								: ""
					}
					
					<!-- Product name -->
					<div id="product-name-${id}" style="width: 178px; height: 30px; overflow: hidden; position: relative; top: 10px; left: 12px; text-align: left; font-size: 20px; line-height: 1.2; font-weight: 500; text-transform: uppercase; font-family: ${fontFamily}; white-space: nowrap; display: flex; align-items: center;">
						${displayName}
					</div>

					${
						hasMultiTierPricing
							? `
						<!-- Multi-tier pricing layout -->
				<div style="width: 210px; height: 76px; position: relative; font-family: ${fontFamily};">
					<div style="display: flex; flex-direction: column; gap: 0px; padding-left: 12px; padding-right: 18px; padding-top: 5px; line-height: normal;">
						<div style="display: flex; justify-content: space-between; align-items: center; padding-top: -15px;">
							<div style="display: flex; flex-direction: column; gap: -4px; width: 100%;">
								<span style="font-size: 8px; text-align: left; width: 100%; font-family: ${fontFamily};">
									При покупке:
								</span>
								<span style="font-size: 12px; width: 100%; font-family: ${fontFamily};">
									от 3 шт.
								</span>
							</div>
								<span style="font-size: 32px; font-weight: bold; text-align: right; width: 100%; font-family: ${fontFamily};">
							${showPriceFrom3 ? new Intl.NumberFormat("ru-RU").format(item.priceFrom3 as number) : ""}
								</span>
							</div>
							<div style="display: flex; justify-content: space-between; align-items: center; gap: 5px;">
								<span style="font-size: 12px; width: 100%; font-family: ${fontFamily};">
									2 шт.
								</span>
								<span style="font-size: 24px; font-weight: bold; text-align: right; width: 100%; font-family: ${fontFamily};">
							${showPriceFor2 ? new Intl.NumberFormat("ru-RU").format(item.priceFor2 as number) : ""}
								</span>
							</div>
							<div style="display: flex; justify-content: space-between; align-items: center; gap: 5px;">
								<span style="font-size: 12px; width: 100%; font-family: ${fontFamily};">
									1 шт.
								</span>
								<span style="font-size: 20px; font-weight: bold; text-align: right; width: 100%; font-family: ${fontFamily};">
							${showBasePrice ? new Intl.NumberFormat("ru-RU").format(originalPrice as number) : ""}
								</span>
							</div>
						</div>
					</div>
					`
							: `
						<!-- Single price layout -->
						<div style="padding-top: 6px; font-weight: bold; width: 200px; height: 76px; font-size: 65px; text-align: center; line-height: ${hasDiscount ? "76px" : "95px"}; font-family: ${fontFamily};">
							<span style="position: relative;">
							${showBasePrice ? new Intl.NumberFormat("ru-RU").format(originalPrice as number) : ""}
							</span>
							${
								hasDiscount && discountPrice !== originalPrice
									? `
								<br>
								<span style="position: absolute; bottom: 4px; left: 12px; width: 88px; height: 22px; font-weight: normal; font-size: 22px; text-align: left; opacity: 0.8; font-family: ${fontFamily};">
							${showDiscountPrice ? new Intl.NumberFormat("ru-RU").format(discountPrice as number) : ""}
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
						<div style="position: absolute; bottom: -20px; left: 81px; font-size: 10px; font-weight: 500; line-height: 1; max-width: 125px; display: flex; flex-direction: column; opacity: 0.8; font-family: ${fontFamily};">
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
				<svg style="position: absolute; inset: 0; pointer-events: none;" width="200" height="140" viewBox="0 0 200 140" xmlns="http://www.w3.org/2000/svg">
					<line x1="0" y1="0" x2="200" y2="0" stroke="${cutLineColor}" stroke-width="1" stroke-dasharray="15,4"/>
					<line x1="0" y1="140" x2="200" y2="140" stroke="${cutLineColor}" stroke-width="1" stroke-dasharray="15,4"/>
					<line x1="0" y1="0" x2="0" y2="140" stroke="${cutLineColor}" stroke-width="1" stroke-dasharray="10,4"/>
					<line x1="200" y1="0" x2="200" y2="140" stroke="${cutLineColor}" stroke-width="1" stroke-dasharray="10,4"/>
				</svg>
			</div>
		</div>
	`;
}
