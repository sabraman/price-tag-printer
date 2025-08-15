"use client";

import { ChevronDown, Download, FileDown, Printer } from "lucide-react";
import React from "react";
import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { usePrintTags } from "@/hooks/usePrintTags";
import { usePriceTagsStore } from "@/store/priceTagsStore";

interface SmartPrintButtonProps {
	items: any[];
	onError?: (error: string) => void;
	onSuccess?: () => void;
	isEditMode?: boolean;
}

export function SmartPrintButton({
	items,
	onError,
	onSuccess,
	isEditMode = false,
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

	const {
		handlePrint,
		handleBrowserPrint,
		handlePDFDownload,
		isGenerating,
		browserInfo,
	} = usePrintTags({
		onError: (error) => onError?.(error.message),
		onSuccess,
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

	const handleForceBrowser = () => {
		handleBrowserPrint();
	};

	const handleForcePDF = () => {
		handlePDFDownload(printData);
	};

	const primaryButtonText =
		browserInfo.recommendedMethod === "browser" ? "Распечатать" : "Скачать PDF";

	const primaryButtonIcon =
		browserInfo.recommendedMethod === "browser" ? (
			<Printer className="h-4 w-4 mr-2" />
		) : (
			<FileDown className="h-4 w-4 mr-2" />
		);

	return (
		<div className="flex w-full mb-4">
			<Button
				onClick={handleSmartPrint}
				disabled={isGenerating}
				className="flex-1 mr-1"
				variant="default"
			>
				{isGenerating ? (
					<>
						<div className="animate-spin h-4 w-4 mr-2 border-2 border-white border-t-transparent rounded-full" />
						Генерация...
					</>
				) : (
					<>
						{primaryButtonIcon}
						{primaryButtonText}
					</>
				)}
			</Button>

			<DropdownMenu>
				<DropdownMenuTrigger asChild>
					<Button
						variant="default"
						size="icon"
						className="ml-1"
						disabled={isGenerating}
					>
						<ChevronDown className="h-4 w-4" />
					</Button>
				</DropdownMenuTrigger>
				<DropdownMenuContent align="end">
					<DropdownMenuItem onClick={handleForceBrowser}>
						<Printer className="h-4 w-4 mr-2" />
						Печать в браузере
					</DropdownMenuItem>
					<DropdownMenuItem onClick={handleForcePDF}>
						<Download className="h-4 w-4 mr-2" />
						Скачать PDF
					</DropdownMenuItem>
					<DropdownMenuSeparator />
					<DropdownMenuItem disabled>
						<div className="text-sm text-muted-foreground">
							Браузер: {browserInfo.name}
							{browserInfo.recommendedMethod === "browser" && (
								<span className="text-green-600 ml-1">✓ Поддерживается</span>
							)}
							{browserInfo.recommendedMethod === "pdf" && (
								<span className="text-yellow-600 ml-1">⚠ PDF режим</span>
							)}
						</div>
					</DropdownMenuItem>
				</DropdownMenuContent>
			</DropdownMenu>
		</div>
	);
}
