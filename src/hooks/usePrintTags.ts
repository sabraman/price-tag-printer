"use client";

import { useRef, useState } from "react";
import { detectBrowser } from "@/lib/browser-detection";

interface UsePrintTagsOptions {
	onError?: (error: Error) => void;
	onSuccess?: () => void;
}

interface PrintTagsData {
	items: any[];
	design: boolean;
	designType: string;
	themes: any;
	font: string;
	discountText: string;
	useTableDesigns?: boolean;
	useTableDiscounts?: boolean;
	showThemeLabels?: boolean;
	cuttingLineColor?: string;
}

export const usePrintTags = ({
	onError,
	onSuccess,
}: UsePrintTagsOptions = {}) => {
	const componentRef = useRef<HTMLDivElement>(null);
	const [isGenerating, setIsGenerating] = useState(false);

	const handleBrowserPrint = () => {
		try {
			window.print();
			onSuccess?.();
		} catch (error) {
			onError?.(error instanceof Error ? error : new Error("Print failed"));
		}
	};

	const handlePuppeteerPDF = async (data: PrintTagsData) => {
		setIsGenerating(true);
		try {
			const response = await fetch("/api/pdf", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify(data),
			});

			if (!response.ok) {
				throw new Error(`PDF generation failed: ${response.statusText}`);
			}

			const blob = await response.blob();
			const url = window.URL.createObjectURL(blob);
			const a = document.createElement("a");
			a.style.display = "none";
			a.href = url;
			a.download = "price-tags.pdf";
			document.body.appendChild(a);
			a.click();
			window.URL.revokeObjectURL(url);
			document.body.removeChild(a);

			onSuccess?.();
		} catch (error) {
			onError?.(
				error instanceof Error ? error : new Error("PDF generation failed"),
			);
		} finally {
			setIsGenerating(false);
		}
	};

	const handleSmartPrint = (data?: PrintTagsData) => {
		const browserInfo = detectBrowser();

		if (browserInfo.recommendedMethod === "browser") {
			handleBrowserPrint();
		} else if (data) {
			handlePuppeteerPDF(data);
		} else {
			onError?.(new Error("PDF generation requires price tag data"));
		}
	};

	const handleForceBrowserPrint = () => {
		handleBrowserPrint();
	};

	const handleForcePDFDownload = (data: PrintTagsData) => {
		handlePuppeteerPDF(data);
	};

	return {
		componentRef,
		handlePrint: handleSmartPrint,
		handleBrowserPrint: handleForceBrowserPrint,
		handlePDFDownload: handleForcePDFDownload,
		isGenerating,
		browserInfo: detectBrowser(),
	};
};
