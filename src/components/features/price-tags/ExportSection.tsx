import type React from "react";
import { useState } from "react";
import { toast } from "sonner";
import { PDFGeneratorLazy } from "./PDFGeneratorLazy";
import GenerateButton from "./GenerateButton";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { usePrintTags } from "@/hooks/usePrintTags";
import type { Item } from "@/store/itemsStore";
import type { ThemeSet } from "@/store/priceTagsStore";

interface ExportSectionProps {
	items: Item[];
	themes: ThemeSet;
	currentFont: string;
	discountText: string;
	design: boolean;
	designType: string;
}

export const ExportSection: React.FC<ExportSectionProps> = ({
	items,
	themes,
	currentFont,
	discountText,
	design,
	designType,
}) => {
	const [isExporting, setIsExporting] = useState(false);
	const [exportProgress, setExportProgress] = useState(0);
	const { handlePrint } = usePrintTags();

	const handlePrintTags = () => {
		if (items.length === 0) {
			toast.error("Нет элементов для печати");
			return;
		}

		try {
			setIsExporting(true);
			setExportProgress(0);

			// Simulate progress for print preparation
			const progressInterval = setInterval(() => {
				setExportProgress(prev => {
					if (prev >= 90) {
						clearInterval(progressInterval);
						return 90;
					}
					return prev + 10;
				});
			}, 100);

			handlePrint();
			
			setTimeout(() => {
				setExportProgress(100);
				toast.success("Печать запущена");
				setTimeout(() => {
					setIsExporting(false);
					setExportProgress(0);
				}, 1000);
			}, 1500);

		} catch (error) {
			setIsExporting(false);
			setExportProgress(0);
			toast.error("Ошибка при печати");
		}
	};

	return (
		<div className="space-y-4">
			<div className="flex flex-wrap gap-4">
				<PDFGeneratorLazy
					items={items}
					themes={themes}
					currentFont={currentFont}
					discountText={discountText}
					design={design}
					designType={designType}
					onGenerateStart={() => {
						setIsExporting(true);
						setExportProgress(0);
					}}
					onGenerateComplete={() => {
						setIsExporting(false);
						setExportProgress(0);
					}}
					onError={(error) => {
						setIsExporting(false);
						setExportProgress(0);
						toast.error(error);
					}}
				/>

				<Button 
					onClick={handlePrintTags}
					disabled={isExporting || items.length === 0}
					variant="outline"
				>
					{isExporting ? "Подготовка к печати..." : "Печать"}
				</Button>

				<GenerateButton 
					items={items}
					onGenerate={() => {}} 
					isEditMode={false}
				/>
			</div>

			{isExporting && (
				<div className="space-y-2">
					<div className="text-sm text-muted-foreground">
						Экспорт... {Math.round(exportProgress)}%
					</div>
					<Progress value={exportProgress} className="w-full" />
				</div>
			)}

			<div className="text-sm text-muted-foreground">
				Доступно элементов для экспорта: <span className="font-medium">{items.length}</span>
			</div>
		</div>
	);
};