// PriceTagSVG.tsx
import "@/App.css";
import type React from "react";
import { useEffect, useState } from "react";
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
}) => {
	const [fontSize, setFontSize] = useState<number>(16);
	const [lineHeight, setLineHeight] = useState<number>(20);
	const [key, setKey] = useState<number>(0);

	// Make sure we use a valid theme, or fall back to default
	const safeDesignType =
		designType && ["default", "new", "sale"].includes(designType)
			? (designType as keyof ThemeSet)
			: "default";
	const currentTheme = themes[safeDesignType];
	const discountLines = discountText.split("\n");

	// Check if we have multi-tier pricing
	const hasMultiTierPricing = priceFor2 && priceFrom3;

	useEffect(() => {
		setFontSize(16);
		setKey(0);
	}, []);

	useEffect(() => {
		setLineHeight(design ? 60 : 75);

		const adjustFontSize = () => {
			const element = document.getElementById(`product-name-${id}`);
			if (element) {
				const isOverflown = element.scrollHeight > element.clientHeight;
				if (isOverflown) {
					setKey((prevKey) => prevKey + 1);
					setFontSize((prevFontSize) => Math.max(prevFontSize - 0.4, 2));
					return setTimeout(adjustFontSize, 50);
				}
			}
		};

		const timeoutId = adjustFontSize();

		return () => {
			if (timeoutId) clearTimeout(timeoutId);
		};
	}, [id, design]);

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
					<rect width="160" height="110" fill={`url(#linear-gradient-${id})`} />

					{/* Линии для вырезания - более длинные штрихи с небольшими промежутками, 
            подходят для печати и будут заметны даже при наложении друг на друга в сетке */}
					<line
						x1="0"
						y1="0"
						x2="160"
						y2="0"
						stroke="white"
						strokeWidth="0.75"
						strokeDasharray="12,3"
					/>
					<line
						x1="0"
						y1="110"
						x2="160"
						y2="110"
						stroke="white"
						strokeWidth="0.75"
						strokeDasharray="12,3"
					/>
					<line
						x1="0"
						y1="0"
						x2="0"
						y2="110"
						stroke="white"
						strokeWidth="0.75"
						strokeDasharray="8,3"
					/>
					<line
						x1="160"
						y1="0"
						x2="160"
						y2="110"
						stroke="white"
						strokeWidth="0.75"
						strokeDasharray="8,3"
					/>
				</svg>
				<div
					className="absolute top-0"
					style={{ color: currentTheme.textColor }}
				>
					{safeDesignType === "new" ? (
						<div
							className="absolute -right-[52px] bottom-[-14px] rotate-[-90deg] text-[52px] font-black whitespace-nowrap overflow-hidden w-[118px]"
							style={{
								fontFamily: font,
								color: themes.new.start,
							}}
						>
							NEW
						</div>
					) : safeDesignType === "sale" ? (
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
						id={`product-name-${id}`}
						className="w-[146px] h-6 overflow-hidden relative top-2 left-2.5 text-left text-base leading-6 font-medium uppercase"
						style={{ fontSize: `${fontSize}mm`, fontFamily: font }}
						key={key}
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
							style={{ lineHeight: `${lineHeight}px`, fontFamily: font }}
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
			</div>
		</div>
	);
};

export default PriceTagSVG;
