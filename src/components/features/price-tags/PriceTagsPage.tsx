// Dynamic import for Google Sheets functionality to avoid SSR issues
import { AlertCircle, Edit2, Eye } from "lucide-react";
import type React from "react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import * as XLSX from "xlsx";
import { BrowserWarning } from "@/components/common/BrowserWarning";
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
import type { Item } from "@/store/priceTagsStore";
import { usePriceTagsStore } from "@/store/priceTagsStore";

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
	// Enhanced selection state management with filtering support
	const [selectedItems, setSelectedItems] = useState<number[]>([]);
	const [lastDuplicationTime, setLastDuplicationTime] = useState<number>(0);

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
		let updatedItems = [...items];

		// Apply search
		if (currentSearchQuery) {
			updatedItems = updatedItems.filter((item) =>
				String(item.data)
					.toLowerCase()
					.includes(currentSearchQuery.toLowerCase()),
			);
		}

		// Apply filter
		switch (currentFilter) {
			case "hasDiscount":
				updatedItems = updatedItems.filter((item) => item.hasDiscount === true);
				break;
			case "noDiscount":
				updatedItems = updatedItems.filter(
					(item) => item.hasDiscount === false,
				);
				break;
			case "defaultDesign":
				updatedItems = updatedItems.filter(
					(item) => item.designType === "default",
				);
				break;
			case "newDesign":
				updatedItems = updatedItems.filter((item) => item.designType === "new");
				break;
			case "saleDesign":
				updatedItems = updatedItems.filter(
					(item) => item.designType === "sale",
				);
				break;
			default:
				// 'all' or unknown filter, no change
				break;
		}

		// Apply sort
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
		} catch (_error) {
			toast.dismiss("duplication");
			toast.error("Ошибка при дублировании товаров");
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
		const doc = new jsPDF();
		autoTable(doc, {
			head: [
				["Название", "Цена", "Дизайн", "Скидка", "Цена за 2", "Цена от 3"],
			],
			body: items.map((item) => [
				String(item.data),
				String(item.price),
				item.designType || "",
				String(item.hasDiscount || ""),
				String(item.priceFor2 || ""),
				String(item.priceFrom3 || ""),
			]),
		});
		doc.save("price_tags.pdf");
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

				const data: GoogleSheetsResponse = await fetchGoogleSheetsData(
					[
						{
							sheetId: sheetId,
							subSheetsIds: ["0"],
						},
					],
					["JSON_COLUMNS"],
				);

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
		<div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
			{/* Left Column - Controls */}
			<div className="lg:col-span-4 space-y-4">
				<div className="space-y-4">
					<ExcelUploader onUpload={handleExcelUpload} />
					<GoogleSheetsForm onSubmit={handleGoogleSheetsSubmit} />
					{!items.length ? (
						<Button
							onClick={handleManualEntry}
							variant="outline"
							className="w-full"
						>
							Добавить самому
						</Button>
					) : null}
				</div>

				{loading && (
					<div className="w-full">
						<Progress value={33} className="w-full" />
						<p className="text-sm text-muted-foreground mt-2">
							Загрузка данных...
						</p>
					</div>
				)}

				{error && (
					<Alert variant="destructive">
						<AlertCircle className="h-4 w-4" />
						<AlertDescription>{error}</AlertDescription>
					</Alert>
				)}

				<BrowserWarning />

				{items.length > 0 && (
					<div className="space-y-4">
						<div className="flex gap-2">
							<Button
								onClick={() => setIsEditMode(!isEditMode)}
								variant="outline"
								className="flex-1"
							>
								{isEditMode ? (
									<>
										<Eye className="h-4 w-4 mr-2" />
										Просмотр
									</>
								) : (
									<>
										<Edit2 className="h-4 w-4 mr-2" />
										Редактировать
									</>
								)}
							</Button>
							<SmartPrintButton
								items={items}
								isEditMode={isEditMode}
								onError={(error) => setError(error)}
								onSuccess={() => setError(null)}
							/>
						</div>
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
				)}
			</div>

			{/* Right Column - Preview/Edit */}
			{items.length > 0 && (
				<div className="lg:col-span-8">
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
						<div className="sticky top-4">
							<PriceTagList
								items={items}
								design={design}
								designType={designType}
								themes={themes}
								font={currentFont}
								discountText={discountText}
								useTableDesigns={hasTableDesigns && designType === "table"}
								useTableDiscounts={hasTableDiscounts && designType === "table"}
								showThemeLabels={showThemeLabels}
								cuttingLineColor={cuttingLineColor}
							/>
						</div>
					)}
				</div>
			)}
		</div>
	);
};
