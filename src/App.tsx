import React, { useState, useEffect } from "react";
import { useReactToPrint } from "react-to-print";
import { fetchGoogleSheetsData } from "google-sheets-data-fetcher";
import PriceTagList from "./components/PriceTagList";
import GoogleSheetsForm from "./components/GoogleSheetsForm";
import ExcelUploader from "./components/ExcelUploader";
import FancyFooter from "./components/FancyFooter";

interface Item {
  id: number;
  data: string | number;
  price: number;
  discountPrice: number;
}

interface GoogleSheetsResponse {
  [columnKey: string]: {
    id: string;
    label: string;
    type: string;
    rows: {
      [rowKey: string]: { id: number; data: string | number };
    };
  };
}

const App: React.FC = () => {
  const [, setUrl] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState<Item[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [, setColumnLabels] = useState<string[]>([]);

  const componentRef = React.useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const savedUrl = localStorage.getItem("lastUrl");
    if (savedUrl) {
      setUrl(savedUrl);
      fetchData(savedUrl);
    }
  }, []); // Fetch data automatically on initial load if there is a saved URL

  const handlePrint = useReactToPrint({
    content: () => componentRef.current,
  });

  const extractSheetIdFromUrl = (url: string): string => {
    const parts = url.split("/");
    const sheetIdIndex = parts.indexOf("d") + 1;
    return parts[sheetIdIndex];
  };

  const fetchData = async (url: string) => {
    setLoading(true);
    try {
      const sheetId = extractSheetIdFromUrl(url);

      const data: GoogleSheetsResponse = await fetchGoogleSheetsData(
        [
          {
            sheetId: sheetId,
            subSheetsIds: ["0"],
          },
        ],
        ["JSON_COLUMNS"],
      );

      console.log("Получены данные из Google Sheets API:", data);

      if (data) {
        const columnKeys = Object.keys(data);
        const columnKey = columnKeys.length > 0 ? columnKeys[0] : "";

        if (columnKey && data[columnKey].rows) {
          const receivedItems = Object.values(data[columnKey].rows).map(
            (row: { id: number; data: string | number }) => ({
              ...row,
              data: row.data,
              price: Number(
                data[columnKey === "A" ? "B" : "A"].rows[row.id].data,
              ), // Extract price from the second column
              discountPrice:
                Number(data[columnKey === "A" ? "B" : "A"].rows[row.id].data) -
                55, // Calculate discount price
            }),
          ) as Item[];

          setItems(receivedItems);
          setColumnLabels([data["A"].label, data["B"].label]); // Assuming A is for product names and B is for prices
          setError(null);
        } else {
          console.error(
            "Неверная структура данных, полученная от API Google Таблиц:",
            data,
          );
          setError("Неверная ссылка");
        }
      } else {
        console.error(
          "Неверная структура данных, полученная от API Google Таблиц:",
          data,
        );
        setError("Неверная структура данных, полученная от API Google Таблиц:");
      }
    } catch (error) {
      console.error("Ошибка получения данных из API Google Таблиц:", error);
      setError(error instanceof Error ? error.message : "Произошла ошибка");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSheetsSubmit = (submittedUrl: string) => {
    setUrl(submittedUrl);
    fetchData(submittedUrl);
  };
  /* eslint-disable  @typescript-eslint/no-explicit-any */
  const handleExcelUpload = (data: any) => {
    // Assuming the first sheet in the Excel file is the relevant one, modify as needed
    const sheetData = data.Sheets[data.SheetNames[0]];
    const parsedData: GoogleSheetsResponse = {
      A: { id: "1", label: "Название", type: "string", rows: {} },
      B: { id: "2", label: "Цена", type: "number", rows: {} },
    };

    // Process each cell in the sheet
    Object.keys(sheetData).forEach((cell) => {
      const col = cell.charAt(0);
      const row = parseInt(cell.substring(1));

      // Exclude the first row (titles)
      if (row > 1) {
        if (parsedData[col]) {
          parsedData[col].rows[row] = {
            id: row,
            data: sheetData[cell].v,
          };
        }
      }
    });

    const receivedItems = Object.values(parsedData.A.rows).map(
      (row: { id: number; data: string | number }) => ({
        ...row,
        data: row.data,
        price: Number(parsedData.B.rows[row.id].data), // Extract price from the second column
        discountPrice: Number(parsedData.B.rows[row.id].data) - 55, // Calculate discount price
      }),
    ) as Item[];

    setItems(receivedItems);
    setColumnLabels([parsedData.A.label, parsedData.B.label]);
    setError(null);
  };

  return (
    <>
      <div className="max-w-screen-xl mx-auto p-4">
        <ExcelUploader onUpload={handleExcelUpload} />
        <GoogleSheetsForm onSubmit={handleGoogleSheetsSubmit} />
        {/* Pass setNewDesign function to Switcher */}
        {loading && <div>Зогрузочка👣...</div>}
        {error && <div className="mb-4 text-red-500">{error}</div>}
        {items.length > 0 && (
          <>
            <button
              onClick={handlePrint}
              className="mb-4 bg-green-500 text-white p-2 rounded"
            >
              Распечатать или сохранить в PDF{" "}
            </button>
            <div ref={componentRef}>
              <PriceTagList items={items} />
            </div>
          </>
        )}
      </div>
      <FancyFooter />
    </>
  );
};

export default App;
