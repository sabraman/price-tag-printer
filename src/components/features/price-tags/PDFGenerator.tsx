import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { Download } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import type { Item, ThemeSet } from "@/store/priceTagsStore";

interface PDFGeneratorProps {
	items: Item[];
	themes: ThemeSet;
	currentFont: string;
	discountText: string;
	design: boolean;
	designType: string;
	onGenerateStart?: () => void;
	onGenerateComplete?: () => void;
	onError?: (error: string) => void;
}

export const PDFGenerator: React.FC<PDFGeneratorProps> = ({
	items,
	themes,
	currentFont,
	discountText,
	design,
	designType,
	onGenerateStart,
	onGenerateComplete,
	onError,
}) => {
	const [isGenerating, setIsGenerating] = useState(false);
	const [progress, setProgress] = useState(0);

	const generatePDF = async () => {
		try {
			setIsGenerating(true);
			setProgress(0);
			onGenerateStart?.();

			const doc = new jsPDF();
			const tableData = items.map((item, index) => {
				setProgress((index / items.length) * 100);
				
				return [
					item.data,
					item.price,
					design ? item.discountPrice : '',
					item.priceFor2 || '',
					item.priceFrom3 || '',
				];
			});

			autoTable(doc, {
				head: [['Название', 'Цена', 'Цена со скидкой', 'Цена за 2', 'Цена от 3']],
				body: tableData,
				theme: 'striped',
			});

			setProgress(100);
			doc.save('price-tags.pdf');
			onGenerateComplete?.();
		} catch (error) {
			onError?.(error instanceof Error ? error.message : 'Ошибка генерации PDF');
		} finally {
			setIsGenerating(false);
			setProgress(0);
		}
	};

	return (
		<div className="flex flex-col gap-2">
			<Button 
				onClick={generatePDF} 
				disabled={isGenerating || items.length === 0}
				className="flex items-center gap-2"
			>
				<Download className="h-4 w-4" />
				{isGenerating ? 'Генерация...' : 'Скачать PDF'}
			</Button>
			{isGenerating && (
				<Progress value={progress} className="w-full h-2" />
			)}
		</div>
	);
};