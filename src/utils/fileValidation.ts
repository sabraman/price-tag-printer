export interface FileValidationResult {
	isValid: boolean;
	error?: string;
	warnings?: string[];
}

export interface FileValidationOptions {
	maxSize?: number; // in bytes
	allowedTypes?: string[];
	allowedExtensions?: string[];
	requireSpreadsheet?: boolean;
}

// Constants moved outside of class
const DEFAULT_MAX_SIZE = 10 * 1024 * 1024; // 10MB

const SPREADSHEET_TYPES = [
	"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", // .xlsx
	"application/vnd.ms-excel", // .xls
	"text/csv", // .csv
	"application/csv",
];

const SPREADSHEET_EXTENSIONS = [".xlsx", ".xls", ".csv"];

/**
 * Get file extension from filename
 */
function getFileExtension(filename: string): string {
	const lastDotIndex = filename.lastIndexOf(".");
	return lastDotIndex === -1 ? "" : filename.slice(lastDotIndex);
}

/**
 * Format file size for display
 */
function formatFileSize(bytes: number): string {
	if (bytes === 0) return "0 Bytes";

	const k = 1024;
	const sizes = ["Bytes", "KB", "MB", "GB"];
	const i = Math.floor(Math.log(bytes) / Math.log(k));

	return `${parseFloat((bytes / k ** i).toFixed(2))} ${sizes[i]}`;
}

/**
 * Validate spreadsheet-specific requirements
 */
function validateSpreadsheetFile(file: File): FileValidationResult {
	const warnings: string[] = [];

	// Check if file appears to be a spreadsheet based on name patterns
	const fileName = file.name.toLowerCase();

	if (fileName.includes("template") || fileName.includes("шаблон")) {
		warnings.push("Файл похож на шаблон, убедитесь что он содержит данные");
	}

	if (fileName.includes("copy") || fileName.includes("копия")) {
		warnings.push("Файл похож на копию, убедитесь что это актуальная версия");
	}

	// Check for Excel temporary files
	if (fileName.startsWith("~$")) {
		return {
			isValid: false,
			error: "Это временный файл Excel. Закройте Excel и попробуйте снова",
		};
	}

	return {
		isValid: true,
		warnings: warnings.length > 0 ? warnings : undefined,
	};
}

/**
 * Read a chunk of file for validation
 */
function readFileChunk(
	file: File,
	start: number,
	end: number,
): Promise<ArrayBuffer> {
	return new Promise((resolve, reject) => {
		const reader = new FileReader();
		reader.onload = () => resolve(reader.result as ArrayBuffer);
		reader.onerror = reject;
		reader.readAsArrayBuffer(file.slice(start, end));
	});
}

/**
 * Validate uploaded file
 */
export function validateFile(
	file: File,
	options: FileValidationOptions = {},
): FileValidationResult {
	const {
		maxSize = DEFAULT_MAX_SIZE,
		allowedTypes = SPREADSHEET_TYPES,
		allowedExtensions = SPREADSHEET_EXTENSIONS,
		requireSpreadsheet = true,
	} = options;

	const warnings: string[] = [];

	// Check if file exists
	if (!file) {
		return {
			isValid: false,
			error: "Файл не выбран",
		};
	}

	// Check file size
	if (file.size > maxSize) {
		return {
			isValid: false,
			error: `Размер файла превышает лимит ${formatFileSize(maxSize)}`,
		};
	}

	// Warn about very small files
	if (file.size < 100) {
		warnings.push("Файл очень маленький, возможно он пустой");
	}

	// Check MIME type
	if (file.type && !allowedTypes.includes(file.type)) {
		if (requireSpreadsheet) {
			return {
				isValid: false,
				error: `Неподдерживаемый тип файла: ${file.type}. Поддерживаются: Excel (.xlsx, .xls), CSV`,
			};
		} else {
			warnings.push(`Тип файла ${file.type} может не поддерживаться`);
		}
	}

	// Check file extension
	const fileExtension = getFileExtension(file.name);
	if (
		!allowedExtensions.some(
			(ext) => ext.toLowerCase() === fileExtension.toLowerCase(),
		)
	) {
		if (requireSpreadsheet) {
			return {
				isValid: false,
				error: `Неподдерживаемое расширение файла: ${fileExtension}. Поддерживаются: ${allowedExtensions.join(", ")}`,
			};
		} else {
			warnings.push(
				`Расширение файла ${fileExtension} может не поддерживаться`,
			);
		}
	}

	// Validate file name
	if (file.name.length > 255) {
		warnings.push("Очень длинное имя файла");
	}

	// Check for potentially unsafe characters in filename
	if (/[<>:"/\\|?*]/.test(file.name)) {
		warnings.push("Имя файла содержит специальные символы");
	}

	// Validate spreadsheet-specific requirements
	if (requireSpreadsheet) {
		const spreadsheetValidation = validateSpreadsheetFile(file);
		if (!spreadsheetValidation.isValid) {
			return spreadsheetValidation;
		}
		if (spreadsheetValidation.warnings) {
			warnings.push(...spreadsheetValidation.warnings);
		}
	}

	return {
		isValid: true,
		warnings: warnings.length > 0 ? warnings : undefined,
	};
}

/**
 * Validate multiple files
 */
export function validateFiles(
	files: FileList | File[],
	options: FileValidationOptions = {},
): FileValidationResult {
	if (files.length === 0) {
		return {
			isValid: false,
			error: "Файл не выбран",
		};
	}

	if (files.length > 1) {
		return {
			isValid: false,
			error: "Выберите только один файл",
		};
	}

	return validateFile(files[0], options);
}

/**
 * Check if file appears to be corrupted based on basic heuristics
 */
export async function validateFileIntegrity(
	file: File,
): Promise<FileValidationResult> {
	try {
		// For Excel files, check if we can read the first few bytes
		if (file.name.toLowerCase().endsWith(".xlsx")) {
			const firstChunk = await readFileChunk(file, 0, 4);
			const signature = new Uint8Array(firstChunk);

			// XLSX files are ZIP archives, should start with PK
			if (signature[0] !== 0x50 || signature[1] !== 0x4b) {
				return {
					isValid: false,
					error: "Файл поврежден или имеет неверный формат",
				};
			}
		}

		return { isValid: true };
	} catch {
		console.error("Failed to validate file");
		return {
			isValid: false,
			error: "Не удалось прочитать файл",
		};
	}
}
