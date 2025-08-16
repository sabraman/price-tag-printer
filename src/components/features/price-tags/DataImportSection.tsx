// Note: Google Sheets functionality temporarily disabled due to SSR compatibility issues
import { AlertCircle } from "lucide-react";
import type React from "react";
import { useState } from "react";
import { toast } from "sonner";
import * as XLSX from "xlsx";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { fetchGoogleSheetsData } from "@/lib/googleSheets";
import type { Item } from "@/store/itemsStore";
import ExcelUploaderLazy from "./ExcelUploaderLazy";
import GoogleSheetsForm from "./GoogleSheetsForm";

interface DataImportSectionProps {
	onDataImported: (items: Item[], columnLabels: string[]) => void;
	onError: (error: string) => void;
	onLoadingChange: (loading: boolean) => void;
}

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

// Utility function to parse discount values
const parseDiscountValue = (
	value: string | number | null | undefined,
): boolean | undefined => {
	if (value === null || value === undefined) return undefined;

	const strValue = String(value).trim().toLowerCase();
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

	return undefined;
};

export const DataImportSection: React.FC<DataImportSectionProps> = ({
	onDataImported,
	onError,
	onLoadingChange,
}) => {
	const [importProgress, setImportProgress] = useState(0);
	const [isImporting, setIsImporting] = useState(false);

	const handleExcelUpload = async (workbook: XLSX.WorkBook) => {
		try {
			setIsImporting(true);
			setImportProgress(0);
			onLoadingChange(true);

			const worksheet = workbook.Sheets[workbook.SheetNames[0]];
			const jsonData = XLSX.utils.sheet_to_json(worksheet);

			if (jsonData.length === 0) {
				throw new Error("Excel файл пустой");
			}

			setImportProgress(25);

			const columnLabels = Object.keys(jsonData[0] as Record<string, unknown>);
			const items: Item[] = [];

			for (let i = 0; i < jsonData.length; i++) {
				const row = jsonData[i] as Record<string, unknown>;
				setImportProgress(25 + (i / jsonData.length) * 75);

				const item: Item = {
					id: Date.now() + Math.random(),
					data: String(row[columnLabels[0]] || ""),
					price: Number(row[columnLabels[1]] || 0),
					discountPrice: Number(row[columnLabels[1]] || 0),
				};

				// Handle additional columns
				if (columnLabels.length > 2) {
					const designValue = row[columnLabels[2]];
					if (
						designValue &&
						["default", "new", "sale"].includes(String(designValue))
					) {
						item.designType = String(designValue);
					}
				}

				if (columnLabels.length > 3) {
					const discountValue = parseDiscountValue(
						row[columnLabels[3]] as string | number | null | undefined,
					);
					if (discountValue !== undefined) {
						item.hasDiscount = discountValue;
					}
				}

				if (columnLabels.length > 4) {
					const priceFor2 = Number(row[columnLabels[4]]);
					if (!Number.isNaN(priceFor2) && priceFor2 > 0) {
						item.priceFor2 = priceFor2;
					}
				}

				if (columnLabels.length > 5) {
					const priceFrom3 = Number(row[columnLabels[5]]);
					if (!Number.isNaN(priceFrom3) && priceFrom3 > 0) {
						item.priceFrom3 = priceFrom3;
					}
				}

				items.push(item);
			}

			setImportProgress(100);
			onDataImported(items, columnLabels);
			toast.success(`Импортировано ${items.length} элементов из Excel`);
		} catch (error) {
			const errorMessage =
				error instanceof Error ? error.message : "Ошибка импорта Excel";
			onError(errorMessage);
			toast.error(errorMessage);
		} finally {
			setIsImporting(false);
			setImportProgress(0);
			onLoadingChange(false);
		}
	};

	const handleGoogleSheetsData = async (spreadsheetId: string) => {
		try {
			setIsImporting(true);
			setImportProgress(0);
			onLoadingChange(true);

			const data: GoogleSheetsResponse = await fetchGoogleSheetsData([
				{
					sheetId: spreadsheetId,
					subSheetsIds: ["0"],
				},
			]);
			setImportProgress(50);

			if (!data || typeof data !== "object") {
				throw new Error("Некорректные данные из Google Sheets");
			}

			const columnKeys = Object.keys(data);

			if (columnKeys.length === 0) {
				throw new Error("Google Sheets пустые");
			}

			const columnLabels = columnKeys.map((key) => data[key].label);
			const firstColumn = data[columnKeys[0]];
			const rowKeys = Object.keys(firstColumn.rows);

			const items: Item[] = rowKeys.map((rowKey, index) => {
				setImportProgress(50 + (index / rowKeys.length) * 50);

				const item: Item = {
					id: Date.now() + Math.random() * 1000 + index,
					data: String(data[columnKeys[0]].rows[rowKey]?.data || ""),
					price: Number(data[columnKeys[1]]?.rows[rowKey]?.data || 0),
					discountPrice: Number(data[columnKeys[1]]?.rows[rowKey]?.data || 0),
				};

				// Handle design type column
				if (columnKeys[2]) {
					const designValue = data[columnKeys[2]]?.rows[rowKey]?.data;
					if (
						designValue &&
						["default", "new", "sale"].includes(String(designValue))
					) {
						item.designType = String(designValue);
					}
				}

				// Handle discount column
				if (columnKeys[3]) {
					const discountValue = parseDiscountValue(
						data[columnKeys[3]]?.rows[rowKey]?.data,
					);
					if (discountValue !== undefined) {
						item.hasDiscount = discountValue;
					}
				}

				// Handle multi-tier pricing
				if (columnKeys[4]) {
					const priceFor2 = Number(data[columnKeys[4]]?.rows[rowKey]?.data);
					if (!Number.isNaN(priceFor2) && priceFor2 > 0) {
						item.priceFor2 = priceFor2;
					}
				}

				if (columnKeys[5]) {
					const priceFrom3 = Number(data[columnKeys[5]]?.rows[rowKey]?.data);
					if (!Number.isNaN(priceFrom3) && priceFrom3 > 0) {
						item.priceFrom3 = priceFrom3;
					}
				}

				return item;
			});

			setImportProgress(100);
			onDataImported(items, columnLabels);
			toast.success(`Импортировано ${items.length} элементов из Google Sheets`);
		} catch (error) {
			const errorMessage =
				error instanceof Error ? error.message : "Ошибка импорта Google Sheets";
			onError(errorMessage);
			toast.error(errorMessage);
		} finally {
			setIsImporting(false);
			setImportProgress(0);
			onLoadingChange(false);
		}
	};

	return (
		<div className="space-y-4">
			<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
				<ExcelUploaderLazy onUpload={handleExcelUpload} />
				<GoogleSheetsForm onFetchData={handleGoogleSheetsData} />
			</div>

			{isImporting && (
				<div className="space-y-2">
					<div className="text-sm text-muted-foreground">
						Импорт данных... {Math.round(importProgress)}%
					</div>
					<Progress value={importProgress} className="w-full" />
				</div>
			)}

			{isImporting && (
				<Alert>
					<AlertCircle className="h-4 w-4" />
					<AlertDescription>
						Импорт данных в процессе. Пожалуйста, подождите...
					</AlertDescription>
				</Alert>
			)}
		</div>
	);
};
