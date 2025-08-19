// Dynamic import for Google Sheets functionality to avoid SSR issues
import { AlertCircle, Edit2, Eye, FileSpreadsheet } from "lucide-react";
import type React from "react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import * as XLSX from "xlsx";
import { BrowserWarning } from "@/components/common/BrowserWarning";
import { BackupPrintButtons } from "@/components/features/price-tags/BackupPrintButtons";
import ExcelUploader from "@/components/features/price-tags/ExcelUploader";
import GoogleSheetsForm from "@/components/features/price-tags/GoogleSheetsForm";
import { OptimizedEditTable } from "@/components/features/price-tags/OptimizedEditTable";
import { PriceTagCustomizer } from "@/components/features/price-tags/PriceTagCustomizer";
import PriceTagList from "@/components/features/price-tags/PriceTagList";
import { SmartPrintButton } from "@/components/features/price-tags/SmartPrintButton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useNewItemDraft } from "@/hooks/useNewItemDraft";
import { fetchGoogleSheetsData } from "@/lib/googleSheets";

import type { Item } from "@/store/priceTagsStore";
import { usePriceTagsStore } from "@/store/priceTagsStore";
import Link from "next/link";

interface GoogleSheetsResponse {
	[columnKey: string]: {
		id: string;
		label: string;
		type: string;
		rows: {
			[rowKey: string]: { id: number; data: string | number };
		};
	};
}

// Function to consistently parse discount values from various formats
const parseDiscountValue = (
	value: string | number | null | undefined,
): boolean | undefined => {
	if (value === null || value === undefined) return undefined;

	const strValue = String(value).trim().toLowerCase();

	// Empty string means no value
	if (strValue === "") return undefined;

	// Check for positive values
	if (
		["да", "true", "yes", "1", "истина", "y", "д", "+", "т", "true1"].includes(
			strValue,
		)
	) {
		return true;
	}

	// Check for negative values
	if (
		["нет", "false", "no", "0", "ложь", "n", "н", "-", "ф", "false0"].includes(
			strValue,
		)
	) {
		return false;
	}

	// For any other values, return undefined
	return undefined;
};

export const PriceTagsPage: React.FC = () => {
	const {
		items,
		loading,
		error,
		design,
		designType,
		isEditMode,
		themes,
		currentFont,
		discountText,
		hasTableDesigns,
		hasTableDiscounts,
		showThemeLabels,
		cuttingLineColor,
		setItems,
		setLoading,
		setError,
		setColumnLabels,
		setIsEditMode,
		setThemes,
		setCurrentFont,
		setDiscountText,
		setDesignType,
		setShowThemeLabels,
		addItem,
		updateItemPrices,
	} = usePriceTagsStore();

	const [filteredItems, setFilteredItems] = useState<Item[]>([]);
	const [currentFilter, setCurrentFilter] = useState<string>("all");
	const [currentSort, setCurrentSort] = useState<string>("nameAsc");
	const [currentSearchQuery, setCurrentSearchQuery] = useState<string>("");
	const [selectedItems, setSelectedItems] = useState<number[]>([]);
	const [lastDuplicationTime, setLastDuplicationTime] = useState(0);

	// Create componentRef for react-to-print
	const componentRef = useRef<HTMLDivElement | null>(null);

	// Memoized filtered IDs for stable reference
	const filteredItemIds = useMemo(
		() => filteredItems.map((item) => item.id),
		[filteredItems],
	);

	// Handle selection changes with validation
	const handleSelectionChange = useCallback(
		(newSelection: number[] | ((prev: number[]) => number[])) => {
			const processSelection = (selection: number[]) => {
				// Always validate against filtered items
				const validSelection = selection.filter((id) =>
					filteredItemIds.includes(id),
				);
				setSelectedItems(validSelection);
			};

			if (typeof newSelection === "function") {
				const result = newSelection(selectedItems);
				processSelection(result);
			} else {
				processSelection(newSelection);
			}
		},
		[selectedItems, filteredItemIds],
	);

	// Auto-cleanup selection when filtered items change
	useEffect(() => {
		const hasInvalidSelections = selectedItems.some(
			(id) => !filteredItemIds.includes(id),
		);

		if (hasInvalidSelections) {
			const cleanedSelection = selectedItems.filter((id) =>
				filteredItemIds.includes(id),
			);
			setSelectedItems(cleanedSelection);
		}
	}, [filteredItemIds, selectedItems]);

	// Update prices when design type changes
	useEffect(() => {
		if (items.length > 0) {
			updateItemPrices();
		}
	}, [updateItemPrices, items.length]);

	useEffect(() => {
		const searchQuery = currentSearchQuery.toLowerCase();

		const updatedItems = items.filter((item) => {
			// Apply search filter
			const matchesSearch =
				searchQuery === "" ||
				String(item.data).toLowerCase().includes(searchQuery) ||
				String(item.price).includes(searchQuery);

			// Apply type filter
			let matchesFilter = true;
			if (currentFilter === "withDiscount") {
				matchesFilter = item.hasDiscount === true;
			} else if (currentFilter === "withoutDiscount") {
				matchesFilter = item.hasDiscount !== true;
			} else if (["default", "new", "sale"].includes(currentFilter)) {
				matchesFilter = (item.designType || "default") === currentFilter;
			}

			return matchesSearch && matchesFilter;
		});

		// Apply sorting
		updatedItems.sort((a, b) => {
			switch (currentSort) {
				case "nameAsc":
					return String(a.data).localeCompare(String(b.data));
				case "nameDesc":
					return String(b.data).localeCompare(String(a.data));
				case "priceAsc":
					return a.price - b.price;
				case "priceDesc":
					return b.price - a.price;
				default:
					return 0;
			}
		});

		setFilteredItems(updatedItems);
	}, [items, currentFilter, currentSort, currentSearchQuery]);

	// Enhanced duplication with comprehensive UX
	const handleDuplicate = () => {
		if (selectedItems.length === 0) {
			toast.error("Выберите товары для дублирования");
			return;
		}

		// Prevent rapid duplication
		const now = Date.now();
		if (now - lastDuplicationTime < 1000) {
			toast.warning("Пожалуйста, подождите перед следующим дублированием");
			return;
		}

		try {
			// Show loading state
			toast.loading("Дублирование товаров...", { id: "duplication" });

			// Use the store's proper duplication method
			const { duplicateItems } = usePriceTagsStore.getState();
			duplicateItems(selectedItems);

			// Clear selection after successful duplication
			setSelectedItems([]);
			setLastDuplicationTime(now);

			// Dismiss loading and show success
			toast.dismiss("duplication");
			toast.success(`✅ Продуктов скопировано: ${selectedItems.length}`, {
				duration: 3000,
				description: "Копии добавлены в конец списка",
			});
		} catch {
			toast.error("Ошибка при дублировании товара");
		}
	};

	const handleUndo = () => {
		usePriceTagsStore.getState().undo();
	};

	const handleRedo = () => {
		usePriceTagsStore.getState().redo();
	};

	const handleFilterChange = (filter: string) => {
		setCurrentFilter(filter);
	};

	const handleSortChange = (sort: string) => {
		setCurrentSort(sort);
	};

	const handleSearch = (query: string) => {
		setCurrentSearchQuery(query);
	};

	const handleClearAll = () => {
		setItems([]);
		setSelectedItems([]);
	};

	const handleExport = (type: "csv" | "pdf" | "xlsx") => {
		switch (type) {
			case "csv":
				exportToCsv(filteredItems);
				break;
			case "pdf":
				exportToPdf(filteredItems);
				break;
			case "xlsx":
				exportToXlsx(filteredItems);
				break;
			default:
				break;
		}
	};

	const exportToCsv = (items: Item[]) => {
		const csvContent =
			"data:text/csv;charset=utf-8," +
			[
				"Название,Цена,Дизайн,Скидка,Цена за 2,Цена от 3",
				...items.map(
					(item) =>
						`${item.data},${item.price},${item.designType || ""},${item.hasDiscount || ""},${item.priceFor2 || ""},${item.priceFrom3 || ""}`,
				),
			].join("\n");
		const encodedUri = encodeURI(csvContent);
		const link = document.createElement("a");
		link.setAttribute("href", encodedUri);
		link.setAttribute("download", "price_tags.csv");
		document.body.appendChild(link);
		link.click();
		document.body.removeChild(link);
	};

	const exportToPdf = (items: Item[]) => {
		// Parameter is required by interface
		void items;
		// PDF export functionality has been moved to SmartPrintButton component
		// This is kept for compatibility but users should use the print functionality instead
		toast.info("PDF export is now handled by the Print button");
	};

	const exportToXlsx = (items: Item[]) => {
		const ws_data = [
			["Название", "Цена", "Дизайн", "Скидка", "Цена за 2", "Цена от 3"],
			...items.map((item) => [
				String(item.data),
				String(item.price),
				item.designType || "",
				String(item.hasDiscount || ""),
				String(item.priceFor2 || ""),
				String(item.priceFrom3 || ""),
			]),
		];
		const ws = XLSX.utils.aoa_to_sheet(ws_data);
		const wb = XLSX.utils.book_new();
		XLSX.utils.book_append_sheet(wb, ws, "Price Tags");
		XLSX.writeFile(wb, "price_tags.xlsx");
	};

	// Note: Print functionality now handled by SmartPrintButton component

	const extractSheetIdFromUrl = useCallback((url: string): string => {
		const parts = url.split("/");
		const sheetIdIndex = parts.indexOf("d") + 1;
		return parts[sheetIdIndex];
	}, []);

	const fetchData = useCallback(
		async (url: string) => {
			setLoading(true);
			try {
				const sheetId = extractSheetIdFromUrl(url);

				const data: GoogleSheetsResponse = await fetchGoogleSheetsData([
					{
						sheetId: sheetId,
						subSheetsIds: ["0"],
					},
				]);

				if (data) {
					const columnKeys = Object.keys(data);
					const columnKey = columnKeys.length > 0 ? columnKeys[0] : "";

					if (columnKey && data[columnKey].rows) {
						let hasDesignColumn = false;
						let designColumnKey = "";
						let hasDiscountColumn = false;
						let discountColumnKey = "";
						let hasPriceFor2Column = false;
						let priceFor2ColumnKey = "";
						let hasPriceFrom3Column = false;
						let priceFrom3ColumnKey = "";

						for (const key of columnKeys) {
							if (data[key]?.label?.toLowerCase() === "дизайн") {
								hasDesignColumn = true;
								designColumnKey = key;
							}
							if (data[key]?.label?.toLowerCase() === "скидка") {
								hasDiscountColumn = true;
								discountColumnKey = key;
							}
							if (data[key]?.label?.toLowerCase() === "цена за 2") {
								hasPriceFor2Column = true;
								priceFor2ColumnKey = key;
							}
							if (data[key]?.label?.toLowerCase() === "цена от 3") {
								hasPriceFrom3Column = true;
								priceFrom3ColumnKey = key;
							}
						}

						const hasDesignRow = !hasDesignColumn && data.C?.rows?.[3]?.data;
						if (hasDesignRow) {
							const designValue = String(data.C.rows[3].data).toLowerCase();
							if (["default", "new", "sale"].includes(designValue)) {
								designColumnKey = "C";
							}
						}

						const receivedItems = Object.values(data[columnKey].rows).map(
							(row: { id: number; data: string | number }) => {
								const price = Number(
									data[columnKey === "A" ? "B" : "A"].rows[row.id].data,
								);

								const designType =
									(hasDesignColumn || hasDesignRow) &&
									data[designColumnKey]?.rows?.[row.id]?.data
										? ["default", "new", "sale"].includes(
												String(
													data[designColumnKey].rows[row.id].data,
												).toLowerCase(),
											)
											? String(
													data[designColumnKey].rows[row.id].data,
												).toLowerCase()
											: undefined
										: undefined;

								const hasDiscount =
									hasDiscountColumn &&
									data[discountColumnKey]?.rows?.[row.id]?.data
										? parseDiscountValue(
												data[discountColumnKey].rows[row.id].data,
											)
										: undefined;

								const priceFor2 =
									hasPriceFor2Column &&
									data[priceFor2ColumnKey]?.rows?.[row.id]?.data
										? Number(data[priceFor2ColumnKey].rows[row.id].data)
										: undefined;

								const priceFrom3 =
									hasPriceFrom3Column &&
									data[priceFrom3ColumnKey]?.rows?.[row.id]?.data
										? Number(data[priceFrom3ColumnKey].rows[row.id].data)
										: undefined;

								return {
									...row,
									data: row.data,
									price,
									discountPrice: price,
									designType,
									hasDiscount,
									priceFor2,
									priceFrom3,
								};
							},
						) as Item[];

						setItems(receivedItems);

						const labels = [data.A.label, data.B.label];
						if (hasDesignColumn) {
							labels.push(data[designColumnKey].label);
						}
						if (hasDiscountColumn) {
							labels.push(data[discountColumnKey].label);
						}
						if (hasPriceFor2Column) {
							labels.push(data[priceFor2ColumnKey].label);
						}
						if (hasPriceFrom3Column) {
							labels.push(data[priceFrom3ColumnKey].label);
						}
						setColumnLabels(labels);

						if (hasDesignColumn || hasDesignRow) {
							usePriceTagsStore.getState().setHasTableDesigns(true);
						} else {
							usePriceTagsStore.getState().setHasTableDesigns(false);
						}

						if (hasDiscountColumn) {
							usePriceTagsStore.getState().setHasTableDiscounts(true);
						} else {
							usePriceTagsStore.getState().setHasTableDiscounts(false);
						}

						// --- REPLACE THIS BLOCK ---
						if ((hasDesignColumn || hasDesignRow) && hasDiscountColumn) {
							usePriceTagsStore.getState().setDesign(false); // Reset global discount flag
							usePriceTagsStore.getState().setDesignType("table");
						}
						// --- END OF BLOCK ---

						setError(null);
					} else {
						setError("Неверная ссылка");
					}
				} else {
					setError(
						"Неверная структура данных, полученная от API Google Таблиц:",
					);
				}
			} catch (error) {
				setError(error instanceof Error ? error.message : "Произошла ошибка");
			} finally {
				setLoading(false);
			}
		},
		[setItems, setColumnLabels, setError, setLoading, extractSheetIdFromUrl],
	);

	useEffect(() => {
		const savedUrl = localStorage.getItem("lastUrl");
		if (savedUrl) {
			fetchData(savedUrl);
		}
	}, [fetchData]);

	useEffect(() => {
		updateItemPrices();
	}, [updateItemPrices]);

	const handleGoogleSheetsSubmit = (submittedUrl: string) => {
		fetchData(submittedUrl);
	};

	interface ExcelData {
		Sheets: {
			[key: string]: {
				[cell: string]: {
					v: string | number;
				};
			};
		};
		SheetNames: string[];
	}

	const handleExcelUpload = (data: ExcelData) => {
		const sheetData = data.Sheets[data.SheetNames[0]];
		const parsedData: GoogleSheetsResponse = {
			A: { id: "1", label: "Название", type: "string", rows: {} },
			B: { id: "2", label: "Цена", type: "number", rows: {} },
			C: { id: "3", label: "Дизайн", type: "string", rows: {} },
			D: { id: "4", label: "Скидка", type: "string", rows: {} },
			E: { id: "5", label: "Цена за 2", type: "number", rows: {} },
			F: { id: "6", label: "Цена от 3", type: "number", rows: {} },
		};

		let hasDesignColumn = false;
		if (sheetData.C1 && String(sheetData.C1.v).toLowerCase() === "дизайн") {
			hasDesignColumn = true;
			parsedData.C.label = String(sheetData.C1.v);
		}

		let hasDiscountColumn = false;
		if (sheetData.D1 && String(sheetData.D1.v).toLowerCase() === "скидка") {
			hasDiscountColumn = true;
			parsedData.D.label = String(sheetData.D1.v);
		}

		let hasPriceFor2Column = false;
		if (sheetData.E1 && String(sheetData.E1.v).toLowerCase() === "цена за 2") {
			hasPriceFor2Column = true;
			parsedData.E.label = String(sheetData.E1.v);
		}

		let hasPriceFrom3Column = false;
		if (sheetData.F1 && String(sheetData.F1.v).toLowerCase() === "цена от 3") {
			hasPriceFrom3Column = true;
			parsedData.F.label = String(sheetData.F1.v);
		}

		let hasDesignRow = false;

		if (!hasDesignColumn && sheetData.C3) {
			const designValue = String(sheetData.C3.v).toLowerCase();
			if (["default", "new", "sale"].includes(designValue)) {
				hasDesignRow = true;
			}
		}

		for (const cell of Object.keys(sheetData)) {
			const col = cell.charAt(0);
			const row = Number.parseInt(cell.substring(1));

			if (row > 1) {
				if (parsedData[col]) {
					parsedData[col].rows[row] = {
						id: row,
						data: sheetData[cell].v,
					};
				}
			}
		}

		const receivedItems = Object.values(parsedData.A.rows).map(
			(row: { id: number; data: string | number }) => {
				const designType =
					(hasDesignColumn || hasDesignRow) && parsedData.C.rows[row.id]
						? ["default", "new", "sale"].includes(
								String(parsedData.C.rows[row.id].data).toLowerCase(),
							)
							? String(parsedData.C.rows[row.id].data).toLowerCase()
							: undefined
						: undefined;

				const hasDiscount =
					hasDiscountColumn && parsedData.D.rows[row.id]
						? parseDiscountValue(parsedData.D.rows[row.id].data)
						: undefined;

				return {
					...row,
					data: row.data,
					price: Number(parsedData.B.rows[row.id].data),
					discountPrice: Number(parsedData.B.rows[row.id].data),
					designType,
					hasDiscount,
					priceFor2:
						hasPriceFor2Column && parsedData.E.rows[row.id]
							? Number(parsedData.E.rows[row.id].data)
							: undefined,
					priceFrom3:
						hasPriceFrom3Column && parsedData.F.rows[row.id]
							? Number(parsedData.F.rows[row.id].data)
							: undefined,
				};
			},
		) as Item[];

		setItems(receivedItems);

		const labels = [parsedData.A.label, parsedData.B.label];
		if (hasDesignColumn) {
			labels.push(parsedData.C.label);
		}
		if (hasDiscountColumn) {
			labels.push(parsedData.D.label);
		}
		if (hasPriceFor2Column) {
			labels.push(parsedData.E.label);
		}
		if (hasPriceFrom3Column) {
			labels.push(parsedData.F.label);
		}
		setColumnLabels(labels);

		if (hasDesignColumn || hasDesignRow) {
			usePriceTagsStore.getState().setHasTableDesigns(true);
		} else {
			usePriceTagsStore.getState().setHasTableDesigns(false);
		}

		if (hasDiscountColumn) {
			usePriceTagsStore.getState().setHasTableDiscounts(true);
		} else {
			usePriceTagsStore.getState().setHasTableDiscounts(false);
		}

		// --- REPLACE THIS BLOCK ---
		if ((hasDesignColumn || hasDesignRow) && hasDiscountColumn) {
			usePriceTagsStore.getState().setDesign(false); // Reset global discount flag
			usePriceTagsStore.getState().setDesignType("table");
		}
		// --- END OF BLOCK ---

		setError(null);
	};

	const handleManualEntry = () => {
		const newItem: Item = {
			id: Date.now(),
			data: "Новый товар",
			price: 0,
			discountPrice: 0,
			hasDiscount: false,
		};
		addItem(newItem);
		setIsEditMode(true);
		setError(null);
	};

	// Use the draft hook to preserve new item state when switching modes
	useNewItemDraft(isEditMode);

	return (
		<div className="min-h-screen bg-background">
			{/* Main Container */}
			<div className="container mx-auto px-6 py-8">
				<div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
					{/* Left Sidebar - Always maintain grid structure */}
					<div className="lg:col-span-6 space-y-6">
						{/* Import Section */}
						<div className="space-y-4">
							{/* Bot Info */}
							<Link
								href="https://t.me/PriceTagPrinterBot"
								target="_blank"
								rel="noopener noreferrer"
								className="block border border-border/50 rounded-xl p-4 bg-gradient-to-br from-card/80 to-card/40 backdrop-blur-sm transition-shadow hover:shadow-md focus:outline-none focus:ring-2 focus:ring-primary/40"
								style={{ textDecoration: "none" }}
							>
								<div className="flex items-center justify-between">
									<div className="flex items-center gap-3">
										<div className="p-2 rounded-full bg-primary/10">
											<svg className="w-5 h-5 text-primary" fill="currentColor" viewBox="0 0 512 512" aria-label="Telegram Logo" role="img">
												<title>Telegram Logo</title>
												<path d="M248,8C111.033,8,0,119.033,0,256S111.033,504,248,504,496,392.967,496,256,384.967,8,248,8ZM362.952,176.66c-3.732,39.215-19.881,134.378-28.1,178.3-3.476,18.584-10.322,24.816-16.948,25.425-14.4,1.326-25.338-9.517-39.287-18.661-21.827-14.308-34.158-23.215-55.346-37.177-24.485-16.135-8.612-25,5.342-39.5,3.652-3.793,67.107-61.51,68.335-66.746.153-.655.3-3.1-1.154-4.384s-3.59-.849-5.135-.5q-3.283.746-104.608,69.142-14.845,10.194-26.894,9.934c-8.855-.191-25.888-5.006-38.551-9.123-15.531-5.048-27.875-7.717-26.8-16.291q.84-6.7,18.45-13.7,108.446-47.248,144.628-62.3c68.872-28.647,83.183-33.623,92.511-33.789,2.052-.034,6.639.474,9.61,2.885a10.452,10.452,0,0,1,3.53,6.716A43.765,43.765,0,0,1,362.952,176.66Z"/>
											</svg>
										</div>
										<div>
											<h3 className="text-base font-semibold text-foreground">
												У нас появился бот
											</h3>
											<p className="text-sm text-muted-foreground">
												Создавайте ценники прямо в Телеге
											</p>
										</div>
									</div>
									<span className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-primary hover:text-primary/80 transition-colors">
										Перейти
										<svg
											className="w-3 h-3"
											fill="none"
											stroke="currentColor"
											viewBox="0 0 24 24"
											aria-label="Переход по ссылке"
											role="img"
										>
											<title>Переход по ссылке</title>
											<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
										</svg>
									</span>
								</div>
							</Link>
							
							<ExcelUploader onUpload={handleExcelUpload} />
							<div className="relative">
								<div className="absolute inset-0 flex items-center">
									<div className="w-full border-t border-border/30" />
								</div>
								<div className="relative flex justify-center text-xs">
									<span className="bg-background px-3 text-muted-foreground">
										или
									</span>
								</div>
							</div>
							<GoogleSheetsForm onSubmit={handleGoogleSheetsSubmit} />
							{!items.length && (
								<Button
									onClick={handleManualEntry}
									variant="outline"
									className="w-full"
								>
									<FileSpreadsheet className="w-4 h-4 mr-2" />
									Создать вручную
								</Button>
							)}
						</div>

						{/* Loading State */}
						{loading && (
							<div className="space-y-2">
								<Progress value={33} className="w-full" />
								<p className="text-sm text-muted-foreground text-center">
									Загрузка данных...
								</p>
							</div>
						)}

						{/* Error State */}
						{error && (
							<Alert variant="destructive">
								<AlertCircle className="h-4 w-4" />
								<AlertDescription>{error}</AlertDescription>
							</Alert>
						)}

						<BrowserWarning />

						{/* Customization Panel - Now wider with more space */}
						{items.length > 0 && (
							<div className="space-y-6">
								{/* Control Buttons */}
								<div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
									<Button
										onClick={() => setIsEditMode(!isEditMode)}
										variant="outline"
										className="flex-1"
									>
										{isEditMode ? (
											<>
												<Eye className="w-4 h-4 mr-2" />
												Просмотр
											</>
										) : (
											<>
												<Edit2 className="w-4 h-4 mr-2" />
												Редактировать
											</>
										)}
									</Button>
									<SmartPrintButton
										items={items}
										isEditMode={isEditMode}
										onError={(error) => setError(error)}
										onSuccess={() => setError(null)}
										componentRef={componentRef}
									/>
								</div>

								{/* Expanded Customizer */}
								<div className="border border-border rounded-lg p-4 bg-card/50">
									<h3 className="text-sm font-medium text-foreground mb-4">
										Настройки дизайна
									</h3>
									<PriceTagCustomizer
										themes={themes}
										currentFont={currentFont}
										discountText={discountText}
										designType={designType}
										showThemeLabels={showThemeLabels}
										onThemeChange={setThemes}
										onFontChange={setCurrentFont}
										onDiscountTextChange={setDiscountText}
										onDesignTypeChange={(type) => {
											console.log("Setting design type to:", type);
											setDesignType(type);
										}}
										onShowThemeLabelsChange={setShowThemeLabels}
									/>
								</div>

								{/* Backup print buttons */}
								<div className="border border-border rounded-lg p-4 bg-card/50">
									<h3 className="text-sm font-medium text-foreground mb-4">
										Дополнительная печать
									</h3>
									<BackupPrintButtons
										items={items}
										onError={(error) => setError(error)}
										onSuccess={() => setError(null)}
										componentRef={componentRef}
									/>
								</div>
							</div>
						)}
					</div>

					{/* Main Content Area - Always show to maintain grid structure */}
					<div className="lg:col-span-6">
						{items.length > 0 ? (
							<div className="space-y-4">
								{isEditMode && (
									<div className="flex items-center justify-between">
										<h2 className="text-lg font-semibold text-foreground">
											Редактор ценников
										</h2>
										<div className="flex items-center gap-2">
											<Button onClick={handleUndo} variant="ghost" size="sm">
												Отменить
											</Button>
											<Button onClick={handleRedo} variant="ghost" size="sm">
												Повторить
											</Button>
										</div>
									</div>
								)}

								{isEditMode ? (
									<OptimizedEditTable
										items={filteredItems}
										selectedItems={selectedItems}
										onSelectionChange={handleSelectionChange}
										onDuplicate={handleDuplicate}
										onUndo={handleUndo}
										onRedo={handleRedo}
										onFilterChange={handleFilterChange}
										onSortChange={handleSortChange}
										onSearch={handleSearch}
										onClearAll={handleClearAll}
										onExport={handleExport}
									/>
								) : (
									<div className="sticky top-4 flex justify-center">
										<PriceTagList
											items={items}
											design={design}
											designType={designType}
											themes={themes}
											font={currentFont}
											discountText={discountText}
											useTableDesigns={
												hasTableDesigns && designType === "table"
											}
											useTableDiscounts={
												hasTableDiscounts && designType === "table"
											}
											showThemeLabels={showThemeLabels}
											cuttingLineColor={cuttingLineColor}
											printRef={componentRef}
										/>
									</div>
								)}
							</div>
						) : (
							/* Empty State in Main Content Area */
							<div className="text-center py-16">
								<div className="flex justify-center mb-6">
									<div className="w-20 h-20 rounded-full bg-muted/50 flex items-center justify-center">
										<FileSpreadsheet className="w-10 h-10 text-muted-foreground" />
									</div>
								</div>
								<h2 className="text-2xl font-semibold text-foreground mb-3">
									Здесь будут ваши ценники
								</h2>
								<p className="text-muted-foreground mb-6 max-w-md mx-auto text-lg">
									Загрузите файл Excel, подключите Google Sheets или создайте
									ценники вручную, чтобы начать работу
								</p>
								<div className="flex flex-col sm:flex-row gap-3 justify-center">
									<Button
										onClick={handleManualEntry}
										variant="default"
										size="lg"
										className="px-8"
									>
										<FileSpreadsheet className="w-5 h-5 mr-2" />
										Создать вручную
									</Button>
								</div>
							</div>
						)}
					</div>
				</div>


			</div>
		</div>
	);
};
