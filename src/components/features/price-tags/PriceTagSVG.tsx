// PriceTagSVG.tsx
import "@/App.css";
import type React from "react";
import { useEffect } from "react";
import { useFontSizeAdjustment } from "@/hooks/useFontSizeAdjustment";
import type { ThemeSet } from "@/store/priceTagsStore";

interface PriceTagSVGProps {
	id: number;
	data: string | number;
	price: number;
	discountPrice: number;
	priceFor2?: number;
	priceFrom3?: number;
	design: boolean;
	designType?: string;
	themes: ThemeSet;
	font: string;
	discountText: string;
	showThemeLabels?: boolean;
	cuttingLineColor?: string;
}

const PriceTagSVG: React.FC<PriceTagSVGProps> = ({
	id,
	data,
	price,
	discountPrice,
	priceFor2,
	priceFrom3,
	design,
	designType = "default",
	themes,
	font,
	discountText,
	showThemeLabels = true,
	cuttingLineColor,
}) => {
	// Make sure we use a valid theme, or fall back to default
	const validThemeTypes = [
		"default",
		"new",
		"sale",
		"white",
		"black",
		"sunset",
		"ocean",
		"forest",
		"royal",
		"vintage",
		"neon",
		"monochrome",
		"silver",
		"charcoal",
		"paper",
		"ink",
		"snow",
	];
	const safeDesignType =
		designType && validThemeTypes.includes(designType)
			? (designType as keyof ThemeSet)
			: "default";
	const currentTheme = themes[safeDesignType];
	const discountLines = discountText.split("\n");

	// Check if we have multi-tier pricing
	const hasMultiTierPricing = priceFor2 && priceFrom3;

	// Determine if this is a solid color theme that needs a border
	const needsBorder =
		safeDesignType === "white" ||
		safeDesignType === "black" ||
		currentTheme.start === currentTheme.end;
	const borderColor = safeDesignType === "white" ? "#e5e5e5" : "#333333";
	// Smart cutting line color logic
	const isLightTheme = currentTheme.textColor !== "#ffffff";
	const automaticCutLineColor = isLightTheme ? "#000000" : "#ffffff";

	// Use automatic color if cuttingLineColor is default gray or not provided
	const cutLineColor =
		!cuttingLineColor || cuttingLineColor === "#cccccc"
			? automaticCutLineColor
			: cuttingLineColor;

	// Theme label logic
	const shouldShowLabel =
		showThemeLabels && (safeDesignType === "new" || safeDesignType === "sale");

	// Universal font size adjustment using optimized DOM measurement
	const productNameElementId = `product-name-${id}`;
	const { fontSize: calculatedFontSize, adjustFontSize } =
		useFontSizeAdjustment({
			elementId: productNameElementId,
			initialFontSize: 16,
			minFontSize: 4,
			adjustmentStep: 0.5,
			maxIterations: 20,
			debounceMs: 10, // Faster response
		});

	// Trigger font adjustment when data or font changes, and on mount
	useEffect(() => {
		adjustFontSize();
	}, [adjustFontSize]);

	return (
		<div className="relative w-[160px] h-[110px] overflow-hidden">
			<div className="absolute inset-0">
				<svg
					width="160"
					height="110"
					viewBox="0 0 160 110"
					xmlns="http://www.w3.org/2000/svg"
					aria-labelledby={`price-tag-title-${id}`}
				>
					<title id={`price-tag-title-${id}`}>Ценник</title>
					<defs>
						<linearGradient
							id={`linear-gradient-${id}`}
							x1="13.75"
							y1="108.41"
							x2="148.83"
							y2="10.42"
							gradientUnits="userSpaceOnUse"
						>
							<stop offset="0" stopColor={currentTheme.start} />
							<stop offset="1" stopColor={currentTheme.end} />
						</linearGradient>
					</defs>
					{/* Фоновый градиент */}
					<rect
						width="160"
						height="110"
						fill={
							currentTheme.start === currentTheme.end
								? currentTheme.start
								: `url(#linear-gradient-${id})`
						}
						{...(needsBorder && {
							stroke: borderColor,
							strokeWidth: safeDesignType === "white" ? "1.5" : "1",
						})}
					/>
				</svg>
				<div
					className="absolute top-0"
					style={{ color: currentTheme.textColor }}
				>
					{shouldShowLabel && safeDesignType === "new" ? (
						<div
							className="absolute -right-[52px] bottom-[-14px] rotate-[-90deg] text-[52px] font-black whitespace-nowrap overflow-hidden w-[118px]"
							style={{
								fontFamily: font,
								color: themes.new.start,
							}}
						>
							NEW
						</div>
					) : shouldShowLabel && safeDesignType === "sale" ? (
						<div
							className="absolute -right-[48px] bottom-[-14px] rotate-[-90deg] text-[48px] font-black whitespace-nowrap overflow-hidden w-[124px]"
							style={{
								fontFamily: font,
								color: themes.sale.start,
							}}
						>
							SALE
						</div>
					) : null}
					<div
						id={productNameElementId}
						className="w-[146px] h-6 overflow-hidden relative top-2 left-2.5 text-left font-medium uppercase flex items-center"
						style={{
							fontSize: `${calculatedFontSize}px`,
							fontFamily: font,
							lineHeight: "1.2",
							whiteSpace: "nowrap", // Force single line
						}}
					>
						{data}
					</div>

					{hasMultiTierPricing ? (
						// Multi-tier pricing layout (like in the picture)
						<div
							className="w-[160px] h-[60px] relative"
							style={{ fontFamily: font }}
						>
							{/* Main price - largest and on the right */}
							{/* <div 
                className="absolute top-0 right-[12px] font-bold text-[24px]" 
                style={{ fontFamily: font }}
              >
                {new Intl.NumberFormat("ru-RU").format(priceFrom3 || price)}
              </div> */}

							{/* Price tiers as a list on the left */}
							<div className="flex flex-col pl-[10px] pr-[14px] pt-[10px]">
								<span
									className="text-[6px] text-left w-full"
									style={{ fontFamily: font }}
								>
									При покупке:
								</span>
								<div className="flex justify-between items-end mt-[-18px]">
									<span
										className="text-[10px] w-full mb-[7px]"
										style={{ fontFamily: font }}
									>
										от 3 шт.
									</span>
									<span
										className="text-[26px] font-bold text-right w-full"
										style={{ fontFamily: font }}
									>
										{new Intl.NumberFormat("ru-RU").format(priceFrom3)}
									</span>
								</div>

								<div className="flex justify-between items-center mt-[-10px]">
									<span
										className="text-[10px] w-full"
										style={{ fontFamily: font }}
									>
										2 шт.
									</span>
									<span
										className="text-[20px] font-bold text-right w-full"
										style={{ fontFamily: font }}
									>
										{new Intl.NumberFormat("ru-RU").format(priceFor2)}
									</span>
								</div>

								<div className="flex justify-between items-center mt-[-6px]">
									<span
										className="text-[10px] w-full"
										style={{ fontFamily: font }}
									>
										1 шт.
									</span>
									<span
										className="text-[16px] font-bold text-right w-full"
										style={{ fontFamily: font }}
									>
										{new Intl.NumberFormat("ru-RU").format(price)}
									</span>
								</div>
							</div>
						</div>
					) : (
						// Original layout for single price
						<div
							className="pt-[5px] font-bold w-[160px] h-[60px] text-[52px] text-center"
							style={{ lineHeight: design ? "60px" : "75px", fontFamily: font }}
						>
							<span className="relative">
								{new Intl.NumberFormat("ru-RU").format(price)}
							</span>
							<br />
							<span
								className="absolute bottom-[3px] left-2.5 w-[70px] h-[18px] font-normal text-[18px] text-left"
								style={{ fontFamily: font, opacity: 0.8 }}
							>
								{design
									? new Intl.NumberFormat("ru-RU").format(discountPrice)
									: ""}
							</span>
						</div>
					)}

					{design && !hasMultiTierPricing && (
						<div
							className="absolute bottom-[-16px] left-[65px] text-[8px] font-medium leading-none max-w-[100px] flex flex-col"
							style={{ fontFamily: font, opacity: 0.8 }}
						>
							{discountLines[0] && (
								<div key={`discount-line-1-${id}`}>{discountLines[0]}</div>
							)}
							{discountLines[1] && (
								<div key={`discount-line-2-${id}`}>{discountLines[1]}</div>
							)}
						</div>
					)}
				</div>

				{/* Cutting lines - positioned above everything else for proper z-index */}
				<svg
					className="absolute inset-0 pointer-events-none"
					width="160"
					height="110"
					viewBox="0 0 160 110"
					xmlns="http://www.w3.org/2000/svg"
				>
					<title>Линии для вырезания</title>
					{/* Линии для вырезания - более длинные штрихи с небольшими промежутками, 
            подходят для печати и будут заметны даже при наложении друг на друга в сетке */}
					<line
						x1="0"
						y1="0"
						x2="160"
						y2="0"
						stroke={cutLineColor}
						strokeWidth="0.75"
						strokeDasharray="12,3"
					/>
					<line
						x1="0"
						y1="110"
						x2="160"
						y2="110"
						stroke={cutLineColor}
						strokeWidth="0.75"
						strokeDasharray="12,3"
					/>
					<line
						x1="0"
						y1="0"
						x2="0"
						y2="110"
						stroke={cutLineColor}
						strokeWidth="0.75"
						strokeDasharray="8,3"
					/>
					<line
						x1="160"
						y1="0"
						x2="160"
						y2="110"
						stroke={cutLineColor}
						strokeWidth="0.75"
						strokeDasharray="8,3"
					/>
				</svg>
			</div>
		</div>
	);
};

export default PriceTagSVG;
