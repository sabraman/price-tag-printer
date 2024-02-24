import React, { useState } from "react";
import * as ToggleGroup from "@radix-ui/react-toggle-group";

interface SwitcherProps {
  onChange: (design: "new" | "old" | "noDiscount") => void; // Define onChange prop
}

const Switcher: React.FC<SwitcherProps> = ({ onChange }) => {
  const [design, setDesign] = useState<"new" | "old" | "noDiscount">("new"); // State for design

  // Handle design change
  const handleDesignChange = (value: "new" | "old" | "noDiscount") => {
    setDesign(value);
    onChange(value); // Pass the selected design to the parent component
  };

  return (
    <ToggleGroup.Root
      className="ToggleGroup"
      type="single"
      value={design} // Set the value of the ToggleGroup to the current design state
      onValueChange={handleDesignChange} // Handle value change
      aria-label="Design"
    >
      <ToggleGroup.Item
        className="ToggleGroupItem"
        value="old"
        aria-label="Старый дизайн"
      >
        Старый
      </ToggleGroup.Item>
      <ToggleGroup.Item
        className="ToggleGroupItem"
        value="noDiscount"
        aria-label="Без скидки"
      >
        Без скидки
      </ToggleGroup.Item>
      <ToggleGroup.Item
        className="ToggleGroupItem"
        value="new"
        aria-label="Новый дизайн"
      >
        Новый
      </ToggleGroup.Item>
    </ToggleGroup.Root>
  );
};

export default Switcher;
