import React, { useState, useEffect } from "react";
import AccordionInfo from "./AccordionInfo.tsx";
import { Input } from "./ui/input.tsx";

interface GoogleSheetsFormProps {
  onSubmit: (url: string) => void;
}

const GoogleSheetsForm: React.FC<GoogleSheetsFormProps> = ({ onSubmit }) => {
  const [url, setUrl] = useState<string>("");

  useEffect(() => {
    const savedUrl = localStorage.getItem("lastUrl");
    if (savedUrl) {
      setUrl(savedUrl);
    }
  }, []);

  const handleUrlChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newUrl = event.target.value;
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
        <div className="flex flex-col space-y-4">
          <Input
            type="text"
            value={url}
            onChange={handleUrlChange}
            placeholder="Вставьте ссылку на Google Таблицы"
            className="w-full"
          />
          <AccordionInfo />
        </div>
      </form>
    </div>
  );
};

export default GoogleSheetsForm;
