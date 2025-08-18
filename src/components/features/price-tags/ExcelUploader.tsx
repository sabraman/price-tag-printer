import { AlertTriangle, FileSpreadsheet, Upload } from "lucide-react";
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
		<div className="space-y-4">
			{/* Header */}
			<div className="border border-border/50 rounded-xl p-4 bg-gradient-to-br from-card/80 to-card/40 backdrop-blur-sm">
				<div className="flex items-center gap-3 mb-3">
					<div className="p-2 rounded-lg bg-emerald-500/10">
						<Upload className="w-5 h-5 text-emerald-500" />
					</div>
					<div>
						<h3 className="text-base font-semibold text-foreground">
							Загрузка Excel файла
						</h3>
						<p className="text-sm text-muted-foreground">
							Перетащите файл или нажмите для выбора
						</p>
					</div>
				</div>

				{/* Dropzone */}
				<Dropzone
					className="w-full border-2 border-dashed border-border/50 hover:border-primary/50 bg-card/20 hover:bg-card/40 transition-all duration-200 rounded-xl"
					accept={{
						"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet":
							[".xlsx"],
						"application/vnd.ms-excel": [".xls"],
						"text/csv": [".csv"],
					}}
					onDrop={(files) => handleFiles(files)}
					maxFiles={1}
				>
					<DropzoneEmptyState>
						<div className="flex flex-col items-center gap-3 py-8">
							<div className="p-4 rounded-full bg-foreground/5">
								<FileSpreadsheet className="h-8 w-8 text-foreground/60" />
							</div>
							<div className="text-center space-y-2">
								<p className="text-sm font-medium text-foreground">
									Перетащите Excel файл сюда
								</p>
								<p className="text-xs text-muted-foreground">
									или нажмите для выбора файла
								</p>
								<div className="flex items-center gap-2 text-xs text-muted-foreground">
									<span className="px-2 py-1 rounded bg-muted/50">.xlsx</span>
									<span className="px-2 py-1 rounded bg-muted/50">.xls</span>
									<span className="px-2 py-1 rounded bg-muted/50">.csv</span>
									<span className="text-muted-foreground/70">до 10MB</span>
								</div>
							</div>
						</div>
					</DropzoneEmptyState>
				</Dropzone>
			</div>

			{validationWarnings.length > 0 && (
				<Alert
					variant="default"
					className="border-amber-500/20 bg-amber-500/10"
				>
					<AlertTriangle className="h-4 w-4 text-amber-500" />
					<AlertDescription>
						<div className="space-y-2">
							<p className="font-medium text-amber-600 dark:text-amber-400">
								Предупреждения:
							</p>
							<ul className="list-disc list-inside text-sm space-y-1 text-amber-700 dark:text-amber-300">
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
