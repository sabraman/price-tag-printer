"use client";

import { FileDown, Printer } from "lucide-react";
import type React from "react";
import { Button } from "@/components/ui/button";
import { usePrintTags } from "@/hooks/usePrintTags";
import { type Item, usePriceTagsStore } from "@/store/priceTagsStore";

interface SmartPrintButtonProps {
	items: Item[];
	onError?: (error: string) => void;
	onSuccess?: () => void;
	isEditMode?: boolean;
	componentRef?: React.RefObject<HTMLDivElement | null>;
}

export function SmartPrintButton({
	items,
	onError,
	onSuccess,
	isEditMode = false,
	componentRef,
}: SmartPrintButtonProps) {
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

	const { handlePrint, isGenerating, browserInfo } = usePrintTags({
		onError: (error) => onError?.(error.message),
		onSuccess,
		componentRef,
	});

	if (items.length === 0 || isEditMode) return null;

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

	const handleSmartPrint = () => {
		handlePrint(printData);
	};

	const primaryButtonText =
		browserInfo.recommendedMethod === "browser" ? "Печать" : "Скачать PDF";

	const primaryButtonIcon =
		browserInfo.recommendedMethod === "browser" ? (
			<Printer className="h-4 w-4" />
		) : (
			<FileDown className="h-4 w-4" />
		);

	return (
		<Button
			onClick={handleSmartPrint}
			disabled={isGenerating || isEditMode}
			variant="default"
			className="flex-1"
		>
			{isGenerating ? (
				<>
					<div className="animate-spin h-4 w-4 mr-2 border-2 border-white border-t-transparent rounded-full" />
					<span>Генерация...</span>
				</>
			) : (
				<>
					{primaryButtonIcon}
					<span className="ml-2">{primaryButtonText}</span>
				</>
			)}
		</Button>
	);
}
