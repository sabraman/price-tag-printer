import { FileSpreadsheet } from "lucide-react";
import type React from "react";
import { read, type WorkBook } from "xlsx";
import { Dropzone, DropzoneEmptyState } from "./ui/dropzone";

interface ExcelUploaderProps {
	onUpload: (data: WorkBook) => void;
}

const ExcelUploader: React.FC<ExcelUploaderProps> = ({ onUpload }) => {
	const handleFiles = (files: File[]) => {
		if (files.length > 0) {
			const file = files[0];
			const reader = new FileReader();

			reader.onload = (e) => {
				try {
					const data = read(
						new Uint8Array((e.target as FileReader).result as ArrayBuffer),
						{
							type: "array",
						},
					) as WorkBook;
					onUpload(data);
				} catch (error) {
					console.error("Error reading Excel file:", error);
				}
			};

			reader.readAsArrayBuffer(file);
		}
	};

	return (
		<Dropzone
			className="w-full"
			accept={{
				"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": [
					".xlsx",
					".xls",
				],
			}}
			onDrop={(files) => handleFiles(files)}
		>
			<DropzoneEmptyState>
				<div className="flex flex-col items-center gap-2">
					<FileSpreadsheet className="h-8 w-8 text-muted-foreground" />
					<p className="text-sm font-medium">
						Перетащите Excel файл сюда
						<br />
						или кликни, чтобы выбрать
					</p>
				</div>
			</DropzoneEmptyState>
		</Dropzone>
	);
};

export default ExcelUploader;
