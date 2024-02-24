import React, { useState } from "react";

interface FancyCheckboxProps {
  onChange: (isChecked: boolean) => void;
}

const FancyCheckbox: React.FC<FancyCheckboxProps> = ({ onChange }) => {
  const [checked, setChecked] = useState(false);

  const handleChange = () => {
    const newCheckedState = !checked;
    setChecked(newCheckedState);
    onChange(newCheckedState);
  };

  return (
    <label className="fancy-checkbox">
      <input type="checkbox" checked={checked} onChange={handleChange} />
      <span className="checkbox-text">без скидки</span>
    </label>
  );
};

export default FancyCheckbox;
