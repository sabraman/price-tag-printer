import { ExternalLink, FileSpreadsheet } from "lucide-react";
import type React from "react";
import { useEffect, useState } from "react";
import AccordionInfo from "@/components/layout/AccordionInfo";
import { Button } from "@/components/ui/button";
import InputWithClearButton from "./input-with-clear-button";

interface GoogleSheetsFormProps {
	onSubmit?: (url: string) => void;
	onFetchData?: (spreadsheetId: string) => Promise<void>;
}

const GoogleSheetsForm: React.FC<GoogleSheetsFormProps> = ({
	onSubmit,
	onFetchData,
}) => {
	const DEFAULT_SHEET_URL =
		"https://docs.google.com/spreadsheets/d/1hib1AcPemuxn3_8JIn9lcMTsXBGSpC7b-vEBbHgvQw8/edit?gid=585882185#gid=585882185/";
	const [url, setUrl] = useState<string>(DEFAULT_SHEET_URL);

	useEffect(() => {
		const savedUrl = localStorage.getItem("lastUrl");
		if (savedUrl) {
			setUrl(savedUrl);
		}
	}, []);

	const handleUrlChange = (
		event: React.ChangeEvent<HTMLInputElement> | string,
	) => {
		// Check if the input is a string or an event
		const newUrl = typeof event === "string" ? event : event.target.value;
		setUrl(newUrl);
		localStorage.setItem("lastUrl", newUrl);
	};

	const handleSubmit = (event: React.FormEvent) => {
		event.preventDefault();
		if (onSubmit) {
			onSubmit(url);
		} else if (onFetchData) {
			// Extract sheet ID from URL and call onFetchData
			const sheetId = extractSheetIdFromUrl(url);
			onFetchData(sheetId);
		}
	};

	// Helper function to extract sheet ID from URL
	const extractSheetIdFromUrl = (url: string): string => {
		const match = url.match(/\/d\/([a-zA-Z0-9-_]+)/);
		return match ? match[1] : "";
	};

	return (
		<div className="space-y-4">
			{/* Header Section */}
			<div className="border border-border/50 rounded-xl p-4 bg-gradient-to-br from-card/80 to-card/40 backdrop-blur-sm">
				<div className="flex items-center gap-3 mb-3">
					<div className="p-2 rounded-lg bg-primary/10">
						<FileSpreadsheet className="w-5 h-5 text-primary" />
					</div>
					<div>
						<h3 className="text-base font-semibold text-foreground">
							Импорт из Google Таблиц
						</h3>
						<p className="text-sm text-muted-foreground">
							Загрузите данные прямо из вашей таблицы
						</p>
					</div>
				</div>

				{/* Example Link */}
				<div className="flex items-center justify-between p-3 rounded-lg bg-card/60 border border-border/30">
					<div className="flex items-center gap-2">
						<span className="text-2xl">📊</span>
						<div>
							<p className="text-sm font-medium text-foreground">
								Нужен пример?
							</p>
							<p className="text-xs text-muted-foreground">
								Посмотрите структуру таблицы
							</p>
						</div>
					</div>
					<a
						href="https://docs.google.com/spreadsheets/d/1hib1AcPemuxn3_8JIn9lcMTsXBGSpC7b-vEBbHgvQw8/edit?gid=585882185#gid=585882185/"
						target="_blank"
						rel="noopener noreferrer"
						className="group inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary/10 hover:bg-primary/20 text-primary transition-all duration-200 hover:scale-105"
					>
						<span className="text-sm font-medium">Открыть пример</span>
						<ExternalLink className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
					</a>
				</div>
			</div>

			{/* Form Section */}
			<form onSubmit={handleSubmit} className="space-y-4">
				<div className="space-y-3">
					<InputWithClearButton
						value={url}
						onChange={handleUrlChange}
						placeholder="Вставьте ссылку на Google Таблицы..."
						className="w-full"
					/>

					{/* Help Accordion */}
					<AccordionInfo />

					<Button
						type="submit"
						variant="default"
						className="w-full h-11 text-base font-semibold"
					>
						<FileSpreadsheet className="w-5 h-5 mr-2" />
						Загрузить данные
					</Button>
				</div>
			</form>
		</div>
	);
};

export default GoogleSheetsForm;
