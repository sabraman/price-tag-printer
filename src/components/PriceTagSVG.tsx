// PriceTagSVG.tsx
import type React from "react";
import { useState, useEffect } from "react";
import noDiscountSVG from "../assets/price-tag-gradient-bg.svg";
import priceTagSVG from "../assets/price-tag-gradient.svg";
import "../App.css";

interface PriceTagSVGProps {
  id: number;
  data: string | number;
  price: number;
  discountPrice: number;
  design: boolean;
}

const PriceTagSVG: React.FC<PriceTagSVGProps> = ({
  id,
  data,
  price,
  discountPrice,
  design,
}) => {
  const [fontSize, setFontSize] = useState<number>(16);
  const [lineHeight, setLineHeight] = useState<number>(20);
  const [key, setKey] = useState<number>(0);
  // Reset font size when data changes
  useEffect(() => {
    setFontSize(16);
    setKey(0);
  }, []); // Remove unnecessary data dependency since we only want this to run once

  useEffect(() => {
    setLineHeight(design ? 60 : 75);
    const element = document.getElementById(`product-name-${id}`);
    if (element) {
      const isOverflown = element.scrollHeight > element.clientHeight;

      if (isOverflown) {
        setKey((prevKey) => prevKey + 1);
        setFontSize((prevFontSize) => Math.max(prevFontSize - 0.4, 2));
      }
    }

    // Check again after a short delay to ensure DOM has updated
    const timeoutId = setTimeout(() => {
      const element = document.getElementById(`product-name-${id}`);
      if (element) {
        const isOverflown = element.scrollHeight > element.clientHeight;
        if (isOverflown) {
          setKey((prevKey) => prevKey + 1);
          setFontSize((prevFontSize) => Math.max(prevFontSize - 0.4, 2));
        }
      }
    }, 100);

    return () => clearTimeout(timeoutId);
  }, [id, design]);

  const getImageSource = () => {
    return design ? priceTagSVG : noDiscountSVG;
  };

  return (
    <div className="relative m-0 p-0 box-border w-[171px] h-[114px]">
      <div className="relative m-0 p-0">
        <img src={getImageSource()} alt="Price Tag" />
        <div className="absolute top-0 text-white">
          <div
            id={`product-name-${id}`}
            className="w-[162px] h-6 overflow-hidden relative top-2 left-2.5 text-left text-base leading-6 font-medium uppercase font-['Montserrat'] text-white"
            style={{ fontSize: `${fontSize}mm` }}
            key={key}
          >
            {data}
          </div>
          <div
            className="pt-[5px] font-['Montserrat'] font-bold w-[171px] h-[60px] text-[52px] text-center"
            style={{ lineHeight: `${lineHeight}px` }}
          >
            <span className="relative">
              {new Intl.NumberFormat("ru-RU").format(price)}
            </span>
            <br />
            <span className="absolute bottom-[3px] left-2.5 w-[70px] h-[18px] font-['Montserrat'] font-normal text-[18px] text-left text-[var(--discount-text-color)]">
              {design
                ? new Intl.NumberFormat("ru-RU").format(discountPrice)
                : ""}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PriceTagSVG;
