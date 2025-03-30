import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useId } from "react";

interface RadioGroupSwitcherProps {
  title?: string;
  items: { value: string; label: string }[];
  defaultValue: string;
  onChange?: (value: string) => void;
  className?: string;
}

export default function  RadioGroupSwitcher({
  title,
  items,
  defaultValue,
  onChange,
  className = ""
}: RadioGroupSwitcherProps) {
  const id = useId();

  return (
    <fieldset className={className}>
      {title && (
        <legend className="text-sm font-medium leading-none text-foreground mb-4">{title}</legend>
      )}
      <RadioGroup className="flex flex-wrap gap-2" defaultValue={defaultValue} onValueChange={onChange}>
        {items.map((item) => (
          <div
            key={`${id}-${item.value}`}
            className="relative flex flex-1 flex-col items-start gap-4 rounded-lg border border-input p-3 shadow-sm shadow-black/5 has-[[data-state=checked]]:border-ring"
          >
            <div className="flex items-center gap-2">
              <RadioGroupItem
                id={`${id}-${item.value}`}
                value={item.value}
                className="after:absolute after:inset-0"
              />
              <Label htmlFor={`${id}-${item.value}`}>{item.label}</Label>
            </div>
          </div>
        ))}
      </RadioGroup>
    </fieldset>
  );
}
