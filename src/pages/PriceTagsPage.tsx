import { fetchGoogleSheetsData } from "google-sheets-data-fetcher";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { AlertCircle, Edit2, Eye } from "lucide-react";
import type React from "react";
import { useCallback, useEffect, useState } from "react";
import * as XLSX from "xlsx";
import { EditTable } from "@/components/EditTable";
import EditTableEnhancements from "@/components/EditTableEnhancements";
import ExcelUploader from "@/components/ExcelUploader";
import GenerateButton from "@/components/GenerateButton";
import GoogleSheetsForm from "@/components/GoogleSheetsForm";
import { PriceTagCustomizer } from "@/components/PriceTagCustomizer";
import PriceTagList from "@/components/PriceTagList";
import Switcher from "@/components/Switcher";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { usePrintTags } from "@/hooks/usePrintTags";
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

	// For any other values, log and return undefined
	console.log(`Unknown discount value: ${value}`);
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
		setItems,
		setLoading,
		setError,
		setColumnLabels,
		setIsEditMode,
		setThemes,
		setCurrentFont,
		setDiscountText,
		addItem,
		updateItemPrices,
	} = usePriceTagsStore();

	const [filteredItems, setFilteredItems] = useState<Item[]>([]);
	const [currentFilter, setCurrentFilter] = useState<string>("all");
	const [currentSort, setCurrentSort] = useState<string>("nameAsc");
	const [currentSearchQuery, setCurrentSearchQuery] = useState<string>("");
	const [selectedItems, setSelectedItems] = useState<number[]>([]);

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

	const handleDuplicate = () => {
		if (selectedItems.length > 0) {
			const itemsToDuplicate = items.filter((item) =>
				selectedItems.includes(item.id),
			);
			const newItems = [...items];
			itemsToDuplicate.forEach((item) => {
				newItems.push({ ...item, id: Date.now() });
			});
			setItems(newItems);
			setSelectedItems([]); // Clear selection after duplication
		}
	};

	const handleBatchEdit = (field: string, value: string | boolean) => {
		console.log("handleBatchEdit - field:", field, "value:", value);
		const updatedItems = items.map((item) => {
			if (selectedItems.includes(item.id)) {
				if (field === "designType") {
					return { ...item, designType: value };
				} else if (field === "hasDiscount") {
					return { ...item, hasDiscount: value };
				}
			}
			return item;
		});
		setItems(updatedItems);
		setSelectedItems([]); // Clear selection after batch edit
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
		usePriceTagsStore.getState().setHistory([[]]);
		usePriceTagsStore.getState().setHistoryIndex(0);
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

	const { componentRef, handlePrint } = usePrintTags({
		onError: (error) => setError(error.message),
	});

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

	const handleGenerate = () => {
		handlePrint();
	};

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
							<GenerateButton
								items={items}
								isEditMode={isEditMode}
								onGenerate={handleGenerate}
							/>
						</div>
						<Switcher />
						<PriceTagCustomizer
							themes={themes}
							currentFont={currentFont}
							discountText={discountText}
							onThemeChange={setThemes}
							onFontChange={setCurrentFont}
							onDiscountTextChange={setDiscountText}
						/>
					</div>
				)}
			</div>

			{/* Right Column - Preview/Edit */}
			{items.length > 0 && (
				<div className="lg:col-span-8">
					{isEditMode ? (
						<>
							<EditTableEnhancements
								onDuplicate={handleDuplicate}
								onBatchEdit={handleBatchEdit}
								onUndo={handleUndo}
								onRedo={handleRedo}
								onFilterChange={handleFilterChange}
								onSortChange={handleSortChange}
								onSearch={handleSearch}
								onClearAll={handleClearAll}
								onExport={handleExport}
							/>
							<EditTable
								items={filteredItems}
								onChange={setItems}
								onSelectionChange={setSelectedItems}
								selectedItems={selectedItems}
							/>
						</>
					) : (
						<div ref={componentRef}>
							<PriceTagList
								items={items}
								design={design}
								designType={designType}
								themes={themes}
								font={currentFont}
								discountText={discountText}
								useTableDesigns={hasTableDesigns && designType === "table"}
								useTableDiscounts={hasTableDiscounts && designType === "table"}
							/>
						</div>
					)}
				</div>
			)}
		</div>
	);
};
