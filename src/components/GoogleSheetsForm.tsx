import React, { useState, useEffect } from "react";
import AccordionInfo from "./AccordionInfo.tsx";

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
      <form onSubmit={handleSubmit}>
        <p className="block mb-2">Или вставь ссылку на Гугл таблицы: </p>
        <div className="flex">
          <input
            type="text"
            value={url}
            onChange={handleUrlChange}
            className="flex-grow bg-blue-500 border p-2 rounded-r"
            placeholder="ссылочка"
          />
        </div>
        <AccordionInfo />
        <button type="submit" className="bg-blue-500 text-white p-2 rounded-r">
          Сгенерировать Ценники
        </button>
      </form>
    </div>
  );
};

export default GoogleSheetsForm;
