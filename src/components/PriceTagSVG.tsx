// PriceTagSVG.tsx
import type React from "react";
import { useState, useEffect } from "react";
import type { Theme, ThemeSet } from "@/store/priceTagsStore";
import "../App.css";

interface PriceTagSVGProps {
  id: number;
  data: string | number;
  price: number;
  discountPrice: number;
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
  design,
  designType = "default",
  themes,
  font,
  discountText
}) => {
  const [fontSize, setFontSize] = useState<number>(16);
  const [lineHeight, setLineHeight] = useState<number>(20);
  const [key, setKey] = useState<number>(0);

  const currentTheme = themes[designType as keyof ThemeSet];
  const discountLines = discountText.split('\n');

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
    <div className="relative m-0 p-0 box-border w-[171px] h-[114px] overflow-hidden">
      <div className="relative m-0 p-0">
        <svg width="171" height="114" viewBox="0 0 171 114" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id={`linear-gradient-${id}`} x1="13.75" y1="108.41" x2="148.83" y2="10.42" gradientUnits="userSpaceOnUse">
              <stop offset="0" stopColor={currentTheme.start} />
              <stop offset="1" stopColor={currentTheme.end} />
            </linearGradient>
          </defs>
          <rect width="171" height="114" fill={`url(#linear-gradient-${id})`} />
        </svg>
        <div className="absolute top-0" style={{ color: currentTheme.textColor }}>
          {designType === "new" ? (
            <div
              className="absolute -right-[52px] bottom-[-14px] rotate-[-90deg] text-[52px] font-black whitespace-nowrap overflow-hidden w-[118px]"
              style={{
                fontFamily: font,
                color: themes.new.start
              }}
            >
              NEW
            </div>
          ) : designType === "sale" ? (
            <div
              className="absolute -right-[50px] bottom-[-14px] rotate-[-90deg] text-[52px] font-black whitespace-nowrap overflow-hidden w-[118px]"
              style={{
                fontFamily: font,
                color: themes.sale.start
              }}
            >
              SALE
            </div>
          ) : null}
          <div
            id={`product-name-${id}`}
            className="w-[162px] h-6 overflow-hidden relative top-2 left-2.5 text-left text-base leading-6 font-medium uppercase"
            style={{ fontSize: `${fontSize}mm`, fontFamily: font }}
            key={key}
          >
            {data}
          </div>
          <div
            className="pt-[5px] font-bold w-[171px] h-[60px] text-[52px] text-center"
            style={{ lineHeight: `${lineHeight}px`, fontFamily: font }}
          >
            <span className="relative">
              {new Intl.NumberFormat("ru-RU").format(price)}
            </span>
            <br />
            <span className="absolute bottom-[3px] left-2.5 w-[70px] h-[18px] font-normal text-[18px] text-left" style={{ fontFamily: font, opacity: 0.8 }}>
              {design
                ? new Intl.NumberFormat("ru-RU").format(discountPrice)
                : ""}
            </span>
          </div>
          {design && (
            <div
              className="absolute bottom-[-16px] left-[65px]  text-[8px] font-light leading-none max-w-[100px]"
              style={{ fontFamily: font, opacity: 0.8 }}
            >
              {discountText}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PriceTagSVG;
