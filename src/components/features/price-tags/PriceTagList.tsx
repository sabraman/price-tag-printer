// src/components/PriceTagList.tsx
import "@/App.css";
import type React from "react";
import type { ThemeSet } from "@/store/priceTagsStore";
import PriceTagSVG from "./PriceTagSVG";

interface PriceTagListProps {
	items: {
		id: number;
		data: string | number;
		price: number;
		discountPrice: number;
		designType?: string;
		hasDiscount?: boolean;
		priceFor2?: number;
		priceFrom3?: number;
	}[];
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

const PriceTagList: React.FC<PriceTagListProps> = ({
	items,
	design,
	designType,
	themes,
	font,
	discountText,
	useTableDesigns = false,
	useTableDiscounts = false,
	showThemeLabels = true,
	cuttingLineColor,
}) => {
	// Create chunks of 9 items for each page
	const chunkedItems = items.reduce(
		(acc, item, i) => {
			const chunkIndex = Math.floor(i / 18);
			if (!acc[chunkIndex]) {
				acc[chunkIndex] = [];
			}
			acc[chunkIndex].push(item);
			return acc;
		},
		[] as (typeof items)[],
	);

	return (
		<div className="w-full flex flex-col items-center">
			{chunkedItems.map((chunk, pageIndex) => (
				<div
					key={chunk.map((item) => item.id).join("-")}
					className="grid grid-cols-3 w-fit print-page"
					style={{
						pageBreakAfter:
							pageIndex < chunkedItems.length - 1 ? "always" : "auto",
					}}
				>
					{chunk.map((item) => {
						// Determine if this item should show a discount
						let showDiscount = design;
						if (useTableDiscounts && item.hasDiscount !== undefined) {
							// If we're using table discounts and this item has a setting, use that
							showDiscount = item.hasDiscount;
						}

						return (
							<div key={item.id} className="price-tag">
								<PriceTagSVG
									id={item.id}
									data={item.data}
									price={item.price}
									discountPrice={item.discountPrice}
									design={showDiscount}
									designType={
										useTableDesigns && item.designType
											? item.designType
											: designType
									}
									themes={themes}
									font={font}
									discountText={discountText}
									priceFor2={item.priceFor2}
									priceFrom3={item.priceFrom3}
									showThemeLabels={showThemeLabels}
									cuttingLineColor={cuttingLineColor}
								/>
							</div>
						);
					})}
				</div>
			))}
		</div>
	);
};

export default PriceTagList;
