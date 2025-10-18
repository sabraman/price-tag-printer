"use client";

import { useRef, useState } from "react";
import { useReactToPrint } from "react-to-print";
import { detectBrowser } from "@/lib/browser-detection";
import { buildPriceTagsFilename } from "@/lib/utils";
import { renderPriceTagsHTML } from "@/lib/renderPriceTags";
import type { Item, ThemeSet } from "@/store/priceTagsStore";

interface UsePrintTagsOptions {
	onError?: (error: Error) => void;
	onSuccess?: () => void;
	componentRef?: React.RefObject<HTMLDivElement | null>;
}

interface PrintTagsData {
	items: Item[];
	design: boolean;
	designType: string;
	themes: ThemeSet;
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
	componentRef: externalRef,
}: UsePrintTagsOptions = {}) => {
	const internalRef = useRef<HTMLDivElement | null>(null);
	const componentRef = externalRef || internalRef;
	const [isGenerating, setIsGenerating] = useState(false);

	const handleBrowserPrint = useReactToPrint({
		contentRef: componentRef,
		documentTitle: buildPriceTagsFilename("pdf").replace(/\.pdf$/, ""),
		onPrintError: (_errorLocation: "onBeforePrint" | "print", error: Error) => {
			console.error("Print error:", error);
			onError?.(error);
		},
		onAfterPrint: () => {
			onSuccess?.();
		},
		pageStyle: `
			@page {
				size: A4 portrait;
				margin: 0;
			}
			
			@media print {
				html, body {
					height: 100%;
					margin: 0;
					padding: 0;
					-webkit-print-color-adjust: exact;
					print-color-adjust: exact;
					color-adjust: exact;
				}
				
				.print-page {
					break-inside: avoid;
					page-break-after: always;
					margin: 0;
					padding-top: 36px;
					height: 100%;
					display: grid !important;
					grid-template-columns: repeat(3, 160px) !important;
					grid-template-rows: repeat(6, 110px) !important;
					gap: 0 !important;
					align-items: center !important;
					justify-items: center !important;
					justify-content: center !important;
					transform: scale(1.4) !important;
					transform-origin: top center !important;
				}
				
				.print-page:last-child {
					page-break-after: auto;
				}
				
				.price-tag {
					margin: 0;
					padding: 0;
				}
				
				svg {
					display: block;
					shape-rendering: geometricPrecision;
					text-rendering: geometricPrecision;
				}
				
				svg text {
					font-family: inherit;
				}
			}
		`,
	});

	const handlePuppeteerPDF = async (data: PrintTagsData) => {
		setIsGenerating(true);
		try {
			// Generate HTML content from the price tags data
			const htmlContent = renderPriceTagsHTML({
				items: data.items,
				design: data.design,
				designType: data.designType,
				themes: data.themes,
				font: data.font,
				discountText: data.discountText,
				useTableDesigns: data.useTableDesigns,
				useTableDiscounts: data.useTableDiscounts,
				showThemeLabels: data.showThemeLabels,
				cuttingLineColor: data.cuttingLineColor,
			});

			// Send to PDF generation API
			const response = await fetch("/api/generate-pdf", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({ html: htmlContent }),
			});

			if (!response.ok) {
				const errorData = await response
					.json()
					.catch(() => ({ error: "Unknown error" }));
				throw new Error(
					`PDF generation failed: ${errorData.error || response.statusText}`,
				);
			}

			const blob = await response.blob();
			const url = window.URL.createObjectURL(blob);
			const a = document.createElement("a");
			a.style.display = "none";
			a.href = url;
			a.download = buildPriceTagsFilename("pdf");
			document.body.appendChild(a);
			a.click();
			window.URL.revokeObjectURL(url);
			document.body.removeChild(a);

			onSuccess?.();
		} catch (error) {
			console.error("PDF generation error:", error);
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
