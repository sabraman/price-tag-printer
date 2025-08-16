"use client";

import { Download, Printer } from "lucide-react";
import type React from "react";
import { Button } from "@/components/ui/button";
import { usePrintTags } from "@/hooks/usePrintTags";
import { type Item, usePriceTagsStore } from "@/store/priceTagsStore";

interface BackupPrintButtonsProps {
	items: Item[];
	onError?: (error: string) => void;
	onSuccess?: () => void;
	componentRef?: React.RefObject<HTMLDivElement>;
}

export function BackupPrintButtons({
	items,
	onError,
	onSuccess,
	componentRef,
}: BackupPrintButtonsProps) {
	const {
		design,
		designType,
		themes,
		currentFont,
		discountText,
		hasTableDesigns,
		hasTableDiscounts,
		showThemeLabels,
		cuttingLineColor,
	} = usePriceTagsStore();

	const { handleBrowserPrint, handlePDFDownload, isGenerating } = usePrintTags({
		onError: (error) => onError?.(error.message),
		onSuccess,
		componentRef,
	});

	if (items.length === 0) return null;

	const printData = {
		items,
		design,
		designType,
		themes,
		font: currentFont,
		discountText,
		useTableDesigns: hasTableDesigns && designType === "table",
		useTableDiscounts: hasTableDiscounts && designType === "table",
		showThemeLabels,
		cuttingLineColor,
	};

	const handleForceBrowser = () => {
		handleBrowserPrint();
	};

	const handleForcePDF = () => {
		handlePDFDownload(printData);
	};

	return (
		<div className="mt-8 pt-6 border-t border-gray-200">
			<div className="flex gap-3 justify-center">
				<Button
					onClick={handleForceBrowser}
					disabled={isGenerating}
					variant="outline"
					size="sm"
				>
					<Printer className="h-4 w-4 mr-2" />
					Печать в браузере
				</Button>
				<Button
					onClick={handleForcePDF}
					disabled={isGenerating}
					variant="outline"
					size="sm"
				>
					<Download className="h-4 w-4 mr-2" />
					Скачать PDF
				</Button>
			</div>
		</div>
	);
}
