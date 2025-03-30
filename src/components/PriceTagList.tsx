// src/components/PriceTagList.tsx
import type React from "react";
import PriceTagSVG from "./PriceTagSVG";
import type { ThemeSet } from "@/store/priceTagsStore";
import "../App.css";

interface PriceTagListProps {
  items: {
    id: number;
    data: string | number;
    price: number;
    discountPrice: number;
    designType?: string;
    hasDiscount?: boolean;
  }[];
  design: boolean;
  designType: string;
  themes: ThemeSet;
  font: string;
  discountText: string;
  useTableDesigns?: boolean;
  useTableDiscounts?: boolean;
}

const PriceTagList: React.FC<PriceTagListProps> = ({
  items,
  design,
  designType,
  themes,
  font,
  discountText,
  useTableDesigns = false,
  useTableDiscounts = false
}) => {
  // Create chunks of 9 items for each page
  const chunkedItems = items.reduce((acc, item, i) => {
    const chunkIndex = Math.floor(i / 18);
    if (!acc[chunkIndex]) {
      acc[chunkIndex] = [];
    }
    acc[chunkIndex].push(item);
    return acc;
  }, [] as typeof items[]);

  return (
    <div className="w-full flex flex-col items-center">
      {chunkedItems.map((chunk, pageIndex) => (
        <div
          key={chunk.map(item => item.id).join('-')}
          className="grid grid-cols-3 w-fit print-page"
          style={{ pageBreakAfter: pageIndex < chunkedItems.length - 1 ? 'always' : 'auto' }}
        >
          {chunk.map((item) => {
            // Determine if this item should show a discount
            let showDiscount = design;
            if (useTableDiscounts && item.hasDiscount !== undefined) {
              // If we're using table discounts and this item has a setting, use that
              showDiscount = item.hasDiscount;
            }
            
            // Debug log with more detailed information about pricing
            console.log(`Item ${item.id} (${item.data}): 
              hasDiscount=${item.hasDiscount}, 
              useTableDiscounts=${useTableDiscounts}, 
              showDiscount=${showDiscount},
              price=${item.price}, 
              discountPrice=${item.discountPrice}
            `);
            
            return (
              <div key={item.id} className="price-tag">
                <PriceTagSVG
                  id={item.id}
                  data={item.data}
                  price={item.price}
                  discountPrice={item.discountPrice}
                  design={showDiscount}
                  designType={useTableDesigns && item.designType ? item.designType : designType}
                  themes={themes}
                  font={font}
                  discountText={discountText}
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
