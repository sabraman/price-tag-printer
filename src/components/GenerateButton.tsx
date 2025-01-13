import type React from "react";
import { Button } from "@/components/ui/button";
import { FileDown } from "lucide-react";

interface GenerateButtonProps {
  items: {
    id: number;
    data: string | number;
    price: number;
    discountPrice: number;
  }[];
  onGenerate: () => void;
  isEditMode: boolean;
}

const GenerateButton: React.FC<GenerateButtonProps> = ({
  items,
  onGenerate,
  isEditMode,
}) => {
  if (items.length === 0 || isEditMode) return null;

  return (
    <Button onClick={onGenerate} className="w-full mb-4" variant="default">
      <FileDown className="h-4 w-4 mr-2" />
      Распечатать
    </Button>
  );
};

export default GenerateButton;
