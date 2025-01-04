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
  return (
    <div className="w-full flex flex-col items-center">
      <div className="price-tags flex flex-wrap w-[513px] justify-center">
        {items.map((item) => (
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
    </div>
  );
};

export default PriceTagList;
