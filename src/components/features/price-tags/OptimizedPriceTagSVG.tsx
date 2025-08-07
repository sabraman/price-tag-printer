import "@/App.css";
import type React from "react";
import { memo, useEffect, useState } from "react";
import { useFontSizeAdjustment } from "@/hooks/useFontSizeAdjustment";
import type { ThemeSet } from "@/store/settingsStore";

interface OptimizedPriceTagSVGProps {
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
}

const OptimizedPriceTagSVG: React.FC<OptimizedPriceTagSVGProps> = memo(({
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
}) => {
	const [lineHeight, setLineHeight] = useState<number>(20);
	const [key, setKey] = useState<number>(0);

	// Use optimized font size adjustment hook
	const { fontSize, adjustFontSize, resetFontSize } = useFontSizeAdjustment({
		elementId: `product-name-${id}`,
		initialFontSize: 16,
		minFontSize: 8,
		adjustmentStep: 0.5,
		maxIterations: 20,
		debounceMs: 50,
	});

	// Ensure we use a valid theme
	const safeDesignType =
		designType && ["default", "new", "sale"].includes(designType)
			? (designType as keyof ThemeSet)
			: "default";
	const currentTheme = themes[safeDesignType];
	const discountLines = discountText.split("\n");

	// Check if we have multi-tier pricing
	const hasMultiTierPricing = priceFor2 && priceFrom3;

	// Reset font size when component mounts or data changes
	useEffect(() => {
		resetFontSize();
		setKey(prev => prev + 1);
	}, [data, resetFontSize]);

	// Adjust line height and trigger font size adjustment when design changes
	useEffect(() => {
		setLineHeight(design ? 60 : 75);
		
		// Debounce font size adjustment to avoid excessive calls
		const timeoutId = setTimeout(() => {
			adjustFontSize();
		}, 100);

		return () => clearTimeout(timeoutId);
	}, [id, design, adjustFontSize]);

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
					
					{/* Background gradient */}
					<path
						d="M5,5 L155,5 Q160,5 160,10 L160,100 Q160,105 155,105 L5,105 Q0,105 0,100 L0,10 Q0,5 5,5 Z"
						fill={`url(#linear-gradient-${id})`}
						stroke="none"
					/>
					
					{/* Product name */}
					<foreignObject x="5" y="5" width="150" height={lineHeight}>
						<div
							id={`product-name-${id}`}
							className="text-white font-semibold leading-tight overflow-hidden"
							style={{
								fontSize: `${fontSize}px`,
								fontFamily: font,
								height: `${lineHeight}px`,
								lineHeight: design ? "1.2" : "1.3",
								display: "-webkit-box",
								WebkitLineClamp: design ? 2 : 3,
								WebkitBoxOrient: "vertical",
							}}
							key={key}
						>
							{data}
						</div>
					</foreignObject>

					{/* Price display */}
					{hasMultiTierPricing ? (
						<g>
							{/* Multi-tier pricing display */}
							<text
								x="10"
								y={design ? 85 : 90}
								fill={currentTheme.textColor}
								fontSize="10"
								fontFamily={font}
								fontWeight="600"
							>
								{price}₽
							</text>
							<text
								x="10"
								y={design ? 95 : 100}
								fill={currentTheme.textColor}
								fontSize="8"
								fontFamily={font}
							>
								2+ шт: {priceFor2}₽ | 3+ шт: {priceFrom3}₽
							</text>
						</g>
					) : (
						<g>
							{/* Regular or discount pricing */}
							{design && discountPrice !== price ? (
								<g>
									{/* Original price (crossed out) */}
									<text
										x="10"
										y={design ? 80 : 85}
										fill={currentTheme.textColor}
										fontSize="12"
										fontFamily={font}
										textDecoration="line-through"
										opacity="0.8"
									>
										{price}₽
									</text>
									{/* Discount price */}
									<text
										x="10"
										y={design ? 95 : 100}
										fill={currentTheme.textColor}
										fontSize="14"
										fontFamily={font}
										fontWeight="bold"
									>
										{discountPrice}₽
									</text>
									{/* Discount text */}
									{discountLines.map((line, index) => (
										<text
											key={index}
											x="80"
											y={design ? 82 + index * 8 : 87 + index * 8}
											fill={currentTheme.textColor}
											fontSize="6"
											fontFamily={font}
										>
											{line}
										</text>
									))}
								</g>
							) : (
								<text
									x="10"
									y={design ? 90 : 95}
									fill={currentTheme.textColor}
									fontSize="16"
									fontFamily={font}
									fontWeight="bold"
								>
									{price}₽
								</text>
							)}
						</g>
					)}
				</svg>
			</div>
		</div>
	);
});

OptimizedPriceTagSVG.displayName = "OptimizedPriceTagSVG";

export { OptimizedPriceTagSVG };