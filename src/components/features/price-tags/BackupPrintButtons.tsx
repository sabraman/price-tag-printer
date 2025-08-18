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
	componentRef?: React.RefObject<HTMLDivElement | null>;
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
		<div className="flex flex-col gap-3">
			<Button
				onClick={handleForceBrowser}
				disabled={isGenerating || items.length === 0}
				variant="outline"
				className="w-full"
			>
				<Printer className="h-4 w-4 mr-2" />
				Печать в браузере
			</Button>
			<Button
				onClick={handleForcePDF}
				disabled={isGenerating || items.length === 0}
				variant="outline"
				className="w-full"
			>
				<Download className="h-4 w-4 mr-2" />
				Скачать PDF
			</Button>
		</div>
	);
}
