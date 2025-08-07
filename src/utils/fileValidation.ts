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

/**
 * Enhanced file validation utility
 */
export class FileValidator {
	private static readonly DEFAULT_MAX_SIZE = 10 * 1024 * 1024; // 10MB
	
	private static readonly SPREADSHEET_TYPES = [
		'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
		'application/vnd.ms-excel', // .xls
		'text/csv', // .csv
		'application/csv',
	];

	private static readonly SPREADSHEET_EXTENSIONS = ['.xlsx', '.xls', '.csv'];

	/**
	 * Validate uploaded file
	 */
	static validateFile(file: File, options: FileValidationOptions = {}): FileValidationResult {
		const {
			maxSize = this.DEFAULT_MAX_SIZE,
			allowedTypes = this.SPREADSHEET_TYPES,
			allowedExtensions = this.SPREADSHEET_EXTENSIONS,
			requireSpreadsheet = true,
		} = options;

		const warnings: string[] = [];

		// Check if file exists
		if (!file) {
			return {
				isValid: false,
				error: 'Файл не выбран',
			};
		}

		// Check file size
		if (file.size > maxSize) {
			return {
				isValid: false,
				error: `Размер файла превышает лимит ${this.formatFileSize(maxSize)}`,
			};
		}

		// Warn about very small files
		if (file.size < 100) {
			warnings.push('Файл очень маленький, возможно он пустой');
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
		const fileExtension = this.getFileExtension(file.name);
		if (!allowedExtensions.some(ext => ext.toLowerCase() === fileExtension.toLowerCase())) {
			if (requireSpreadsheet) {
				return {
					isValid: false,
					error: `Неподдерживаемое расширение файла: ${fileExtension}. Поддерживаются: ${allowedExtensions.join(', ')}`,
				};
			} else {
				warnings.push(`Расширение файла ${fileExtension} может не поддерживаться`);
			}
		}

		// Validate file name
		if (file.name.length > 255) {
			warnings.push('Очень длинное имя файла');
		}

		// Check for potentially unsafe characters in filename
		if (/[<>:"/\\|?*]/.test(file.name)) {
			warnings.push('Имя файла содержит специальные символы');
		}

		// Validate spreadsheet-specific requirements
		if (requireSpreadsheet) {
			const spreadsheetValidation = this.validateSpreadsheetFile(file);
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
	 * Validate spreadsheet-specific requirements
	 */
	private static validateSpreadsheetFile(file: File): FileValidationResult {
		const warnings: string[] = [];

		// Check if file appears to be a spreadsheet based on name patterns
		const fileName = file.name.toLowerCase();
		
		if (fileName.includes('template') || fileName.includes('шаблон')) {
			warnings.push('Файл похож на шаблон, убедитесь что он содержит данные');
		}

		if (fileName.includes('copy') || fileName.includes('копия')) {
			warnings.push('Файл похож на копию, убедитесь что это актуальная версия');
		}

		// Check for Excel temporary files
		if (fileName.startsWith('~$')) {
			return {
				isValid: false,
				error: 'Это временный файл Excel. Закройте Excel и попробуйте снова',
			};
		}

		return {
			isValid: true,
			warnings: warnings.length > 0 ? warnings : undefined,
		};
	}

	/**
	 * Validate multiple files
	 */
	static validateFiles(files: File[], options: FileValidationOptions = {}): FileValidationResult {
		if (files.length === 0) {
			return {
				isValid: false,
				error: 'Файлы не выбраны',
			};
		}

		if (files.length > 1) {
			return {
				isValid: false,
				error: 'Можно загружать только один файл за раз',
			};
		}

		return this.validateFile(files[0], options);
	}

	/**
	 * Get file extension from filename
	 */
	private static getFileExtension(filename: string): string {
		const lastDotIndex = filename.lastIndexOf('.');
		return lastDotIndex === -1 ? '' : filename.slice(lastDotIndex);
	}

	/**
	 * Format file size for display
	 */
	private static formatFileSize(bytes: number): string {
		if (bytes === 0) return '0 Bytes';
		
		const k = 1024;
		const sizes = ['Bytes', 'KB', 'MB', 'GB'];
		const i = Math.floor(Math.log(bytes) / Math.log(k));
		
		return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
	}

	/**
	 * Check if file appears to be corrupted based on basic heuristics
	 */
	static async validateFileIntegrity(file: File): Promise<FileValidationResult> {
		try {
			// For Excel files, check if we can read the first few bytes
			if (file.name.toLowerCase().endsWith('.xlsx')) {
				const firstChunk = await this.readFileChunk(file, 0, 4);
				const signature = new Uint8Array(firstChunk);
				
				// XLSX files are ZIP archives, should start with PK
				if (signature[0] !== 0x50 || signature[1] !== 0x4B) {
					return {
						isValid: false,
						error: 'Файл поврежден или имеет неверный формат',
					};
				}
			}

			return { isValid: true };
		} catch (error) {
			return {
				isValid: false,
				error: 'Не удалось прочитать файл. Возможно, файл поврежден',
			};
		}
	}

	/**
	 * Read a chunk of file for validation
	 */
	private static readFileChunk(file: File, start: number, end: number): Promise<ArrayBuffer> {
		return new Promise((resolve, reject) => {
			const reader = new FileReader();
			reader.onload = () => resolve(reader.result as ArrayBuffer);
			reader.onerror = reject;
			reader.readAsArrayBuffer(file.slice(start, end));
		});
	}
}