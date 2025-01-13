// src/components/PriceTagList.tsx
import type React from "react";
import PriceTagSVG from "./PriceTagSVG";
import "../App.css";

interface PriceTagListProps {
  items: {
    id: number;
    data: string | number;
    price: number;
    discountPrice: number;
  }[];
  design: boolean;
}

const PriceTagList: React.FC<PriceTagListProps> = ({ items, design }) => {
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
          key={pageIndex} 
          className="grid grid-cols-3 w-[513px] print-page"
          style={{ pageBreakAfter: pageIndex < chunkedItems.length - 1 ? 'always' : 'auto' }}
        >
          {chunk.map((item) => (
            <div key={item.id} className="price-tag">
              <PriceTagSVG
                id={item.id}
                data={item.data}
                price={item.price}
                discountPrice={item.discountPrice}
                design={design}
              />
            </div>
          ))}
        </div>
      ))}
    </div>
  );
};

export default PriceTagList;
