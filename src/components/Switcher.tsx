import type React from "react";
import { Label } from "@/components/ui/label";
import { Switch } from "./ui/switch";
import PlusMinusInput from "./PlusMinusInput";
import RadioGroupSwitcher from "./RadioGroupSwitcher";
import { usePriceTagsStore } from "@/store/priceTagsStore";

const Switcher: React.FC = () => {
  const {
    design,
    discountAmount,
    maxDiscountPercent,
    designType,
    setDesign,
    setDiscountAmount,
    setMaxDiscountPercent,
    setDesignType,
    updateItemPrices
  } = usePriceTagsStore();

  const designItems = [
    { value: "default", label: "Обычный" },
    { value: "new", label: "Новинка" },
    { value: "sale", label: "Распродажа" },
  ];

  const handleChange = (checked: boolean) => {
    setDesign(checked);
    updateItemPrices();
  };

  const handleDiscountChange = (value: number) => {
    setDiscountAmount(value);
    if (design) {
      updateItemPrices();
    }
  };

  const handleMaxPercentChange = (value: number) => {
    setMaxDiscountPercent(value);
    if (design) {
      updateItemPrices();
    }
  };

  const handleDesignTypeChange = (value: string) => {
    setDesignType(value);
    updateItemPrices();
  };

  return (
    <div className="border flex flex-col gap-4 p-4 border-secondary w-full rounded-lg">
      <RadioGroupSwitcher
        items={designItems}
        defaultValue={designType}
        onChange={handleDesignTypeChange}
        className="w-full"
      />
      <div className="flex justify-between items-center">
        <Label htmlFor="discount" className="leading-normal">
          Использовать ценник со скидкой
        </Label>
        <Switch
          id="discount"
          onCheckedChange={handleChange}
          checked={design}
        />
      </div>
      {design && (
        <div className="flex flex-col gap-4">
          <PlusMinusInput
            label="Размер скидки"
            defaultValue={discountAmount}
            minValue={0}
            step={5}
            onChange={handleDiscountChange}
          />
          <PlusMinusInput
            label="Макс. процент скидки"
            defaultValue={maxDiscountPercent}
            minValue={0}
            step={1}
            onChange={handleMaxPercentChange}
          />
        </div>
      )}
    </div>
  );
};

export default Switcher;
