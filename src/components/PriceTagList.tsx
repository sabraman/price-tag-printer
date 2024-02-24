// src/components/PriceTagList.tsx
import React, { useState } from "react";
import PriceTagSVG from "./PriceTagSVG";
import Switcher from "./Switcher";

interface PriceTagListProps {
  items: {
    id: number;
    data: string | number;
    price: number;
    discountPrice: number;
  }[];
}

const PriceTagList: React.FC<PriceTagListProps> = ({ items }) => {
  const [design, setDesign] = useState<"new" | "old" | "noDiscount">("new"); // State for design

  const handleDesignChange = (selectedDesign: "new" | "old" | "noDiscount") => {
    setDesign(selectedDesign);
  };

  return (
    <>
      <Switcher onChange={handleDesignChange} />{" "}
      {/* Pass handleDesignChange as onChange prop */}
      <div className="price-tags">
        {items.map((item) => (
          <div key={item.id} className="price-tag">
            <PriceTagSVG
              data={item.data}
              price={item.price}
              discountPrice={item.discountPrice}
              design={design}
            />
          </div>
        ))}
      </div>
    </>
  );
};

export default PriceTagList;
