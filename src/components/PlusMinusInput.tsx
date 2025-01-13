"use client";

import { Minus, Plus } from "lucide-react";
import { Button, Group, Input, Label, NumberField } from "react-aria-components";

interface PlusMinusInputProps {
  defaultValue?: number;
  minValue?: number;
  label: string;
  step?: number;
  onChange?: (value: number) => void;
}

export default function PlusMinusInput({ defaultValue, minValue, label, step = 1, onChange }: PlusMinusInputProps ) {
  return (
    <NumberField 
      defaultValue={defaultValue} 
      minValue={minValue} 
      onChange={onChange}
      step={step}
    >
      <div className="flex flex-col gap-2">
        <Label className="text-sm font-medium text-foreground">
          {label}
        </Label>
        <Group className="relative inline-flex h-9 w-full items-center overflow-hidden whitespace-nowrap rounded-lg border border-input text-sm shadow-sm shadow-black/5 transition-shadow data-[focus-within]:border-ring data-[disabled]:opacity-50 data-[focus-within]:outline-none data-[focus-within]:ring-[3px] data-[focus-within]:ring-ring/20">
          <Button
            slot="decrement"
            className="-ms-px flex aspect-square h-[inherit] items-center justify-center rounded-s-lg border border-input bg-background text-sm text-muted-foreground/80 transition-shadow hover:bg-accent hover:text-foreground disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Minus size={16} strokeWidth={2} aria-hidden="true" />
          </Button>
          <Input 
            className="w-full grow bg-background px-3 py-2 text-center tabular-nums text-foreground focus:outline-none" 
          />
          <Button
            slot="increment"
            className="-me-px flex aspect-square h-[inherit] items-center justify-center rounded-e-lg border border-input bg-background text-sm text-muted-foreground/80 transition-shadow hover:bg-accent hover:text-foreground disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Plus size={16} strokeWidth={2} aria-hidden="true" />
          </Button>
        </Group>
      </div>
    </NumberField>
  );
}
