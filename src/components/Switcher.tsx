import type React from "react";
import { Label } from "@/components/ui/label";
import { Switch } from "./ui/switch";
import { useState } from "react";
import PlusMinusInput from "./PlusMinusInput";
import RadioGroupSwitcher from "./RadioGroupSwitcher";

interface SwitcherProps {
  onChange: (design: boolean, discountAmount: number, maxDiscountPercent: number, designType: string) => void;
}

const Switcher: React.FC<SwitcherProps> = ({ onChange }) => {
  const [isChecked, setIsChecked] = useState(true);
  const [discountAmount, setDiscountAmount] = useState(100);
  const [maxDiscountPercent, setMaxDiscountPercent] = useState(15);
  const [designType, setDesignType] = useState("default");

  const designItems = [
    { value: "default", label: "Обычный" },
    { value: "new", label: "Новинка" },
    { value: "sale", label: "Распродажа" },
  ];

  const handleChange = (checked: boolean) => {
    setIsChecked(checked);
    onChange(checked, discountAmount, maxDiscountPercent, designType);
  };

  const handleDiscountChange = (value: number) => {
    setDiscountAmount(value);
    if (isChecked) {
      onChange(isChecked, value, maxDiscountPercent, designType);
    }
  };

  const handleMaxPercentChange = (value: number) => {
    setMaxDiscountPercent(value);
    if (isChecked) {
      onChange(isChecked, discountAmount, value, designType);
    }
  };

  const handleDesignTypeChange = (value: string) => {
    setDesignType(value);
    onChange(isChecked, discountAmount, maxDiscountPercent, value);
  };

  return (
    <div className="border flex flex-col gap-4 p-4 border-secondary w-full rounded-lg">
      <RadioGroupSwitcher
        items={designItems}
        defaultValue="default"
        onChange={handleDesignTypeChange}
        className="w-full"
      />
      <div className="flex justify-between items-center">
        <Label htmlFor="discount" className="leading-normal">
          Использовать ценник со скидкой
        </Label>
        <Switch id="discount" onCheckedChange={handleChange} defaultChecked />
      </div>
      {isChecked && (
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
