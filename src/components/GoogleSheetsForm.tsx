import type React from "react";
import { useState, useEffect } from "react";
import AccordionInfo from "./AccordionInfo.tsx";
import InputWithClearButton from "./input-with-clear-button";
import { Button } from "./ui/button.tsx";

interface GoogleSheetsFormProps {
  onSubmit: (url: string) => void;
}

const GoogleSheetsForm: React.FC<GoogleSheetsFormProps> = ({ onSubmit }) => {
  const DEFAULT_SHEET_URL = "https://docs.google.com/spreadsheets/d/1hib1AcPemuxn3_8JIn9lcMTsXBGSpC7b-vEBbHgvQw8/edit?gid=585882185#gid=585882185/";
  const [url, setUrl] = useState<string>(DEFAULT_SHEET_URL);

  useEffect(() => {
    const savedUrl = localStorage.getItem("lastUrl");
    if (savedUrl) {
      setUrl(savedUrl);
    }
  }, []);

  const handleUrlChange = (event: React.ChangeEvent<HTMLInputElement> | string) => {
    // Check if the input is a string or an event
    const newUrl = typeof event === "string" ? event : event.target.value;
    setUrl(newUrl);
    localStorage.setItem("lastUrl", newUrl);
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    onSubmit(url);
  };

  return (
    <div className="mb-4">
      <form onSubmit={handleSubmit} className="space-y-4">
        <p className="text-base font-medium">
          Или вставь ссылку на Гугл таблицы:{" "}
        </p>
          <a href="https://docs.google.com/spreadsheets/d/1hib1AcPemuxn3_8JIn9lcMTsXBGSpC7b-vEBbHgvQw8/edit?gid=585882185#gid=585882185/" target="_blank" rel="noopener noreferrer" className="text-gray-200 hover:text-gray-500 underline">
            Пример таблицы
          </a>
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
