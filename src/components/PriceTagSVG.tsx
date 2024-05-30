// PriceTagSVG.tsx
import React, { useState, useEffect } from "react";
// import priceTagSVG from "../assets/price-tag-new.svg";
import noDiscountSVG from "../assets/price-tag-gradient-bg.svg";
// import oldDesignSVG from "../assets/price-tag-old.svg";
import priceTagSVG from "../assets/price-tag-gradient.svg";
import "../App.css";

interface PriceTagSVGProps {
  data: string | number;
  price: number;
  discountPrice: number;
  design: "new" | "noDiscount"; // Add design prop
}

const PriceTagSVG: React.FC<PriceTagSVGProps> = ({
  data,
  price,
  discountPrice,
  design, // Receive design prop
}) => {
  const [fontSize, setFontSize] = useState<number>(16);
  const [lineHeight, setLineHeight] = useState<number>(20);
  const [key, setKey] = useState<number>(0);

  useEffect(() => {
    setLineHeight(design === "noDiscount" ? 75 : 60);
    const element = document.getElementById(`product-name-${data}`);
    if (element) {
      const isOverflown =
        element.scrollHeight > element.clientHeight ||
        element.scrollWidth > element.clientWidth;

      if (isOverflown) {
        setFontSize((prevFontSize) => Math.max(prevFontSize - 1, 2));
        setKey((prevKey) => prevKey + 1);
      }
    }
  }, [data, design, key]);

  // Define image source based on design prop
  const getImageSource = () => {
    switch (design) {
      case "new":
        return priceTagSVG;
      case "noDiscount":
        return noDiscountSVG;
      default:
        return priceTagSVG;
    }
  };

  return (
    <div className="price-tag-svg">
      <div className="price-tag-image">
        <img src={getImageSource()} alt="Price Tag" />
        <div className="product-details">
          <div
            id={`product-name-${data}`}
            className="product-name"
            style={{ fontSize: `${fontSize - 1}px` }}
            key={key}
          >
            {data}
          </div>
          <div
            className="product-price"
            style={{ lineHeight: `${lineHeight}px` }}
          >
            <span className="original-price">
              {/* {design === "old" || design === "noDiscount" */}
              {new Intl.NumberFormat("ru-RU").format(price)}
              {/* {design === "noDiscount"
                ? new Intl.NumberFormat("ru-RU").format(price)
                : new Intl.NumberFormat("ru-RU").format(discountPrice)} */}
            </span>
            <br />
            <span className="discounted-price">
              {design === "new"
                ? new Intl.NumberFormat("ru-RU").format(discountPrice)
                : ""}
              {/* {design === "old"
                ? new Intl.NumberFormat("ru-RU").format(discountPrice) + ` ₽`
                : design === "new"
                  ? new Intl.NumberFormat("ru-RU").format(price) + ` ₽`
                  : ""} */}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PriceTagSVG;
