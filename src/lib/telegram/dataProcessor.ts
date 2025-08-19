// Data processing utilities for Telegram bot - matching web app exactly
import * as XLSX from "xlsx";
import type { Item } from "../../store/priceTagsStore";

export interface GoogleSheetsResponse {
	[columnKey: string]: {
		id: string;
		label: string;
		type: string;
		rows: {
			[rowKey: string]: { id: number; data: string | number };
		};
	};
}

export interface ExcelData {
	Sheets: {
		[key: string]: {
			[cell: string]: {
				v: string | number;
			};
		};
	};
	SheetNames: string[];
}

// Function to consistently parse discount values from various formats (same as web app)
export const parseDiscountValue = (
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

// Process Google Sheets data exactly like web app
export function processGoogleSheetsData(data: GoogleSheetsResponse): {
	items: Item[];
	hasTableDesigns: boolean;
	hasTableDiscounts: boolean;
	columnLabels: string[];
} {
	const columnKeys = Object.keys(data);
	const columnKey = columnKeys.length > 0 ? columnKeys[0] : "";

	if (!columnKey || !data[columnKey].rows) {
		throw new Error("Неверная структура данных Google Таблиц");
	}

	let hasDesignColumn = false;
	let designColumnKey = "";
	let hasDiscountColumn = false;
	let discountColumnKey = "";
	let hasPriceFor2Column = false;
	let priceFor2ColumnKey = "";
	let hasPriceFrom3Column = false;
	let priceFrom3ColumnKey = "";

	// Find columns by label (same logic as web app)
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

	// Check for design in row 3 if no design column (same as web app)
	const hasDesignRow = !hasDesignColumn && data.C?.rows?.[3]?.data;
	if (hasDesignRow) {
		const designValue = String(data.C.rows[3].data).toLowerCase();
		if (["default", "new", "sale"].includes(designValue)) {
			designColumnKey = "C";
		}
	}

	// Process items exactly like web app
	const items = Object.values(data[columnKey].rows).map(
		(row: { id: number; data: string | number }) => {
			const price = Number(
				data[columnKey === "A" ? "B" : "A"].rows[row.id].data,
			);

			const designType =
				(hasDesignColumn || hasDesignRow) &&
				data[designColumnKey]?.rows?.[row.id]?.data
					? ["default", "new", "sale"].includes(
							String(data[designColumnKey].rows[row.id].data).toLowerCase(),
						)
						? String(data[designColumnKey].rows[row.id].data).toLowerCase()
						: undefined
					: undefined;

			const hasDiscount =
				hasDiscountColumn && data[discountColumnKey]?.rows?.[row.id]?.data
					? parseDiscountValue(data[discountColumnKey].rows[row.id].data)
					: undefined;

			const priceFor2 =
				hasPriceFor2Column && data[priceFor2ColumnKey]?.rows?.[row.id]?.data
					? Number(data[priceFor2ColumnKey].rows[row.id].data)
					: undefined;

			const priceFrom3 =
				hasPriceFrom3Column && data[priceFrom3ColumnKey]?.rows?.[row.id]?.data
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

	// Build column labels
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

	return {
		items,
		hasTableDesigns: Boolean(hasDesignColumn || hasDesignRow),
		hasTableDiscounts: Boolean(hasDiscountColumn),
		columnLabels: labels,
	};
}

// Process Excel data exactly like web app
export function processExcelData(data: ExcelData): {
	items: Item[];
	hasTableDesigns: boolean;
	hasTableDiscounts: boolean;
	columnLabels: string[];
} {
	const sheetData = data.Sheets[data.SheetNames[0]];
	const parsedData: GoogleSheetsResponse = {
		A: { id: "1", label: "Название", type: "string", rows: {} },
		B: { id: "2", label: "Цена", type: "number", rows: {} },
		C: { id: "3", label: "Дизайн", type: "string", rows: {} },
		D: { id: "4", label: "Скидка", type: "string", rows: {} },
		E: { id: "5", label: "Цена за 2", type: "number", rows: {} },
		F: { id: "6", label: "Цена от 3", type: "number", rows: {} },
	};

	// Check for column headers (same as web app)
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

	// Check for design in row 3 if no design column (same as web app)
	let hasDesignRow = false;
	if (!hasDesignColumn && sheetData.C3) {
		const designValue = String(sheetData.C3.v).toLowerCase();
		if (["default", "new", "sale"].includes(designValue)) {
			hasDesignRow = true;
		}
	}

	// Parse all cell data (same as web app)
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

	// Process items exactly like web app
	const items = Object.values(parsedData.A.rows).map(
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

	// Build column labels
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

	return {
		items,
		hasTableDesigns: hasDesignColumn || hasDesignRow,
		hasTableDiscounts: hasDiscountColumn,
		columnLabels: labels,
	};
}

// Process uploaded Excel file from buffer
export function processExcelBuffer(buffer: Buffer): {
	items: Item[];
	hasTableDesigns: boolean;
	hasTableDiscounts: boolean;
	columnLabels: string[];
} {
	const workbook = XLSX.read(buffer, {
		type: "buffer",
		cellDates: true,
		cellNF: false,
		cellText: false,
	});

	if (!workbook.SheetNames || workbook.SheetNames.length === 0) {
		throw new Error("Excel файл не содержит листов");
	}

	const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
	if (!firstSheet || Object.keys(firstSheet).length === 0) {
		throw new Error("Первый лист Excel файла пустой");
	}

	return processExcelData(workbook as ExcelData);
}

// Extract sheet ID from Google Sheets URL (same as web app)
export function extractSheetIdFromUrl(url: string): string {
	const match = url.match(/\/d\/([a-zA-Z0-9-_]+)/);
	return match ? match[1] : "";
}

// Extract GID from Google Sheets URL (same as web app)
export function extractGidFromUrl(url: string): string {
	const match = url.match(/[#&]gid=([0-9]+)/);
	return match ? match[1] : "0";
}
