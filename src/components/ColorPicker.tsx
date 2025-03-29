import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Palette } from "lucide-react";

interface ColorPickerProps {
    color: string;
    onChange: (color: string) => void;
}

export const ColorPicker: React.FC<ColorPickerProps> = ({ color, onChange }) => {
    return (
        <Popover>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    className="w-full justify-start text-left font-normal"
                >
                    <div className="w-full flex items-center gap-2">
                        <div
                            className="h-4 w-4 rounded-full border"
                            style={{ backgroundColor: color }}
                        />
                        <div className="flex-1">{color}</div>
                        <Palette className="h-4 w-4" />
                    </div>
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-64">
                <div className="space-y-2">
                    <div
                        className="h-24 rounded-md"
                        style={{ backgroundColor: color }}
                    />
                    <div className="grid gap-2">
                        <Label>Значение</Label>
                        <Input
                            value={color}
                            onChange={(e) => onChange(e.target.value)}
                            className="h-8"
                        />
                    </div>
                    <input
                        type="color"
                        value={color}
                        onChange={(e) => onChange(e.target.value)}
                        className="w-full h-8"
                    />
                </div>
            </PopoverContent>
        </Popover>
    );
}; 