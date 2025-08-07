import { AlertTriangle, FileSpreadsheet } from "lucide-react";
import type React from "react";
import { useState } from "react";
import { toast } from "sonner";
import { read, type WorkBook } from "xlsx";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Dropzone, DropzoneEmptyState } from "@/components/ui/dropzone";
import { validateFileIntegrity, validateFiles } from "@/utils/fileValidation";

interface ExcelUploaderProps {
	onUpload: (data: WorkBook) => void;
	onError?: (error: string) => void;
}

const ExcelUploader: React.FC<ExcelUploaderProps> = ({ onUpload, onError }) => {
	const [validationWarnings, setValidationWarnings] = useState<string[]>([]);

	const handleFiles = async (files: File[]) => {
		setValidationWarnings([]);

		// Validate files
		const validation = validateFiles(files);
		if (!validation.isValid) {
			const errorMessage = validation.error || "Ошибка загрузки файла";
			toast.error(errorMessage);
			onError?.(errorMessage);
			return;
		}

		// Show warnings if any
		if (validation.warnings && validation.warnings.length > 0) {
			setValidationWarnings(validation.warnings);
		}

		const file = files[0];

		// Additional integrity check for Excel files
		const integrityCheck = await validateFileIntegrity(file);
		if (!integrityCheck.isValid) {
			const errorMessage = integrityCheck.error || "Файл поврежден";
			toast.error(errorMessage);
			onError?.(errorMessage);
			return;
		}

		const reader = new FileReader();

		reader.onload = (e) => {
			try {
				const arrayBuffer = e.target?.result as ArrayBuffer;
				const data = read(new Uint8Array(arrayBuffer), {
					type: "array",
					cellDates: true,
					cellNF: false,
					cellText: false,
				}) as WorkBook;

				// Validate workbook has sheets
				if (!data.SheetNames || data.SheetNames.length === 0) {
					throw new Error("Excel файл не содержит листов");
				}

				// Check if first sheet has data
				const firstSheet = data.Sheets[data.SheetNames[0]];
				if (!firstSheet || Object.keys(firstSheet).length === 0) {
					throw new Error("Первый лист Excel файла пустой");
				}

				onUpload(data);
				toast.success("Excel файл успешно загружен");
			} catch (error) {
				const errorMessage =
					error instanceof Error
						? `Ошибка чтения Excel файла: ${error.message}`
						: "Не удалось прочитать Excel файл";
				toast.error(errorMessage);
				onError?.(errorMessage);
			}
		};

		reader.onerror = () => {
			const errorMessage = "Ошибка чтения файла";
			toast.error(errorMessage);
			onError?.(errorMessage);
		};

		reader.readAsArrayBuffer(file);
	};

	return (
		<div className="space-y-2">
			<Dropzone
				className="w-full"
				accept={{
					"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": [
						".xlsx",
					],
					"application/vnd.ms-excel": [".xls"],
					"text/csv": [".csv"],
				}}
				onDrop={(files) => handleFiles(files)}
				maxFiles={1}
			>
				<DropzoneEmptyState>
					<div className="flex flex-col items-center gap-2">
						<FileSpreadsheet className="h-8 w-8 text-muted-foreground" />
						<p className="text-sm font-medium">
							Перетащите Excel файл сюда
							<br />
							или кликни, чтобы выбрать
						</p>
						<p className="text-xs text-muted-foreground">
							Поддерживаются: .xlsx, .xls, .csv (до 10MB)
						</p>
					</div>
				</DropzoneEmptyState>
			</Dropzone>

			{validationWarnings.length > 0 && (
				<Alert variant="default">
					<AlertTriangle className="h-4 w-4" />
					<AlertDescription>
						<div className="space-y-1">
							<p className="font-medium">Предупреждения:</p>
							<ul className="list-disc list-inside text-sm space-y-1">
								{validationWarnings.map((warning, index) => (
									<li key={`warning-${index}-${warning.slice(0, 10)}`}>
										{warning}
									</li>
								))}
							</ul>
						</div>
					</AlertDescription>
				</Alert>
			)}
		</div>
	);
};

export default ExcelUploader;
