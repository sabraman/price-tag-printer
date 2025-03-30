import { useId, useRef } from "react"
import { CircleXIcon } from "lucide-react"
import type { ChangeEvent } from "react"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface InputWithClearButtonProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
  label?: string;
  value: string;
  onChange: (event: ChangeEvent<HTMLInputElement> | string) => void;
}

export default function InputWithClearButton({ 
  label, 
  value, 
  onChange,
  placeholder,
  className,
  ...props
}: InputWithClearButtonProps) {
  const id = useId()
  const inputRef = useRef<HTMLInputElement>(null)

  const handleClearInput = () => {
    onChange("")
    if (inputRef.current) {
      inputRef.current.focus()
    }
  }

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    onChange(e)
  }

  return (
    <div className="*:not-first:mt-2">
      {label && <Label htmlFor={id}>{label}</Label>}
      <div className="relative">
        <Input
          id={id}
          ref={inputRef}
          className={`pe-9 ${className || ""}`}
          placeholder={placeholder || "Введите текст..."}
          type="text"
          value={value}
          onChange={handleChange}
          {...props}
        />
        {value && (
          <button
            type="button"
            className="text-muted-foreground/80 hover:text-foreground focus-visible:border-ring focus-visible:ring-ring/50 absolute inset-y-0 end-0 flex h-full w-9 items-center justify-center rounded-e-md transition-[color,box-shadow] outline-none focus:z-10 focus-visible:ring-[3px] disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50"
            aria-label="Очистить поле"
            onClick={handleClearInput}
          >
            <CircleXIcon size={16} aria-hidden="true" />
          </button>
        )}
      </div>
    </div>
  )
}
