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
		<div className="mb-4">
			<form onSubmit={handleSubmit} className="space-y-4">
				<div className="space-y-2">
					<p className="text-base font-medium">
						Или вставь ссылку на Гугл таблицы:{" "}
					</p>
					<a
						href="https://docs.google.com/spreadsheets/d/1hib1AcPemuxn3_8JIn9lcMTsXBGSpC7b-vEBbHgvQw8/edit?gid=585882185#gid=585882185/"
						target="_blank"
						rel="noopener noreferrer"
						className="text-primary hover:text-primary/80 underline inline-block"
					>
						📊 Пример таблицы
					</a>
				</div>
				<div className="flex flex-col space-y-4">
					<InputWithClearButton
						value={url}
						onChange={handleUrlChange}
						placeholder="Вставьте ссылку на Google Таблицы"
						className="w-full"
					/>
					<AccordionInfo />
					<Button type="submit" className="w-full">
						Загрузить данные
					</Button>
				</div>
			</form>
		</div>
	);
};

export default GoogleSheetsForm;
