// PriceTagSVG.tsx
import type React from "react";
import { useState, useEffect } from "react";
import "../App.css";

interface PriceTagSVGProps {
  id: number;
  data: string | number;
  price: number;
  discountPrice: number;
  design: boolean;
  designType?: string;
}

const PriceTagSVG: React.FC<PriceTagSVGProps> = ({
  id,
  data,
  price,
  discountPrice,
  design,
  designType = "default",
}) => {
  const [fontSize, setFontSize] = useState<number>(16);
  const [lineHeight, setLineHeight] = useState<number>(20);
  const [key, setKey] = useState<number>(0);

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

  const getGradientDef = () => {
    if (designType === "sale") {
      return (
        <linearGradient id={`linear-gradient-${id}`} x1="13.75" y1="108.41" x2="148.83" y2="10.42" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#ee4a61" />
          <stop offset="1" stopColor="#ff8c8c" />
        </linearGradient>
      );
    }
    return (
      <linearGradient id={`linear-gradient-${id}`} x1="13.75" y1="108.41" x2="148.83" y2="10.42" gradientUnits="userSpaceOnUse">
        <stop offset="0" stopColor="#dd4c9b" />
        <stop offset="1" stopColor="#f6989a" />
      </linearGradient>
    );
  };

  return (
    <div className="relative m-0 p-0 box-border w-[171px] h-[114px] overflow-hidden">
      <div className="relative m-0 p-0">
        <svg width="171" height="114" viewBox="0 0 171 114" xmlns="http://www.w3.org/2000/svg">
          <defs>
            {getGradientDef()}
          </defs>
          <rect width="171" height="114" fill={`url(#linear-gradient-${id})`} />
        </svg>
        <div className="absolute top-0 text-white">
          {designType === "new" ? (
            <div className="absolute -right-[52px] bottom-[-14px] rotate-[-90deg] font-['Mont'] text-[#EE4A9A] text-[52px] font-black whitespace-nowrap overflow-hidden w-[118px]">
              NEW
            </div>
          ) : designType === "sale" ? (
            <div className="absolute -right-[50px] bottom-[-14px] rotate-[-90deg] font-['Mont'] text-[#ee4a61] text-[52px] font-black whitespace-nowrap overflow-hidden w-[118px]">
              SALE
            </div>
          ) : null}
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
          {design && (
            <div className="absolute bottom-[-13px] left-[65px] font-['Montserrat'] text-[#f8bfd8] text-[8px] font-light leading-[0px]">
              <div>цена при регистрации</div>
              <div className="mt-[8.14px]">в приложении</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PriceTagSVG;
