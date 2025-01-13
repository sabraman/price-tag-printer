import type React from "react";
import { Label } from "@/components/ui/label";
import { Switch } from "./ui/switch";
import { useState } from "react";
import PlusMinusInput from "./PlusMinusInput";

interface SwitcherProps {
  onChange: (design: boolean, discountAmount: number, maxDiscountPercent: number) => void;
}

const Switcher: React.FC<SwitcherProps> = ({ onChange }) => {
  const [isChecked, setIsChecked] = useState(true);
  const [discountAmount, setDiscountAmount] = useState(100);
  const [maxDiscountPercent, setMaxDiscountPercent] = useState(15);

  const handleChange = (checked: boolean) => {
    setIsChecked(checked);
    onChange(checked, discountAmount, maxDiscountPercent);
  };

  const handleDiscountChange = (value: number) => {
    setDiscountAmount(value);
    if (isChecked) {
      onChange(isChecked, value, maxDiscountPercent);
    }
  };

  const handleMaxPercentChange = (value: number) => {
    setMaxDiscountPercent(value);
    if (isChecked) {
      onChange(isChecked, discountAmount, value);
    }
  };

  return (
    <div className="border flex flex-col gap-4 p-4 border-secondary w-full rounded-lg">
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
