import React from "react";
import { Label } from "@/components/ui/label";
import { Switch } from "./ui/switch";

interface SwitcherProps {
  onChange: (design: boolean) => void;
}

const Switcher: React.FC<SwitcherProps> = ({ onChange }) => {
  return (
    <div className="border flex flex-row gap-4 p-4 border-secondary w-full justify-between rounded-lg">
      <Label htmlFor="discount" className="leading-normal">
        Использовать ценник со скидкой
      </Label>
      <Switch id="discount" onCheckedChange={onChange} defaultChecked />
    </div>
  );
};

export default Switcher;
