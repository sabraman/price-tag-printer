import React, { useState, useCallback, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { AlertCircle, Edit2, Eye } from "lucide-react";
import { fetchGoogleSheetsData } from "google-sheets-data-fetcher";
import PriceTagList from "./components/PriceTagList";
import GoogleSheetsForm from "./components/GoogleSheetsForm";
import ExcelUploader from "./components/ExcelUploader";
import { usePrintTags } from "./hooks/usePrintTags";
import Switcher from "./components/Switcher";
import { EditTable } from "./components/EditTable";
import GenerateButton from "./components/GenerateButton";

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
  const [design, setDesign] = useState<boolean>(true);
  const [isEditMode, setIsEditMode] = useState(false);

  const { componentRef, handlePrint } = usePrintTags({
    onError: (error) => setError(error.message),
  });

  const handleDesignChange = (selectedDesign: boolean) => {
    setDesign(selectedDesign);
  };

  const fetchData = useCallback(async (url: string) => {
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
        ["JSON_COLUMNS"]
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
                data[columnKey === "A" ? "B" : "A"].rows[row.id].data
              ), // Extract price from the second column
              discountPrice:
                Number(data[columnKey === "A" ? "B" : "A"].rows[row.id].data) -
                55, // Calculate discount price
            })
          ) as Item[];

          setItems(receivedItems);
          setColumnLabels([data["A"].label, data["B"].label]); // Assuming A is for product names and B is for prices
          setError(null);
        } else {
          console.error(
            "Неверная структура данных, полученная от API Google Таблиц:",
            data
          );
          setError("Неверная ссылка");
        }
      } else {
        console.error(
          "Неверная структура данных, полученная от API Google Таблиц:",
          data
        );
        setError("Неверная структура данных, полученная от API Google Таблиц:");
      }
    } catch (error) {
      console.error("Ошибка получения данных из API Google Таблиц:", error);
      setError(error instanceof Error ? error.message : "Произошла ошибка");
    } finally {
      setLoading(false);
    }
  }, []); // Empty dependency array since this function doesn't depend on any state/props

  useEffect(() => {
    const savedUrl = localStorage.getItem("lastUrl");
    if (savedUrl) {
      setUrl(savedUrl);
      fetchData(savedUrl);
    }
  }, [fetchData]); // Add fetchData as a dependency

  const extractSheetIdFromUrl = (url: string): string => {
    const parts = url.split("/");
    const sheetIdIndex = parts.indexOf("d") + 1;
    return parts[sheetIdIndex];
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
      })
    ) as Item[];

    setItems(receivedItems);
    setColumnLabels([parsedData.A.label, parsedData.B.label]);
    setError(null);
  };

  const handleItemsChange = (newItems: Item[]) => {
    setItems(newItems);
  };

  const handleManualEntry = () => {
    setItems([]);
    setIsEditMode(true);
    setError(null);
  };

  const handleGenerate = () => {
    handlePrint();
  };

  return (
    <>
      <div className="max-w-lg mx-auto p-4 flex flex-col gap-4">
        <ExcelUploader onUpload={handleExcelUpload} />
        <div className="flex flex-col">
          <GoogleSheetsForm onSubmit={handleGoogleSheetsSubmit} />
          {!items.length ? (
            <Button onClick={handleManualEntry} variant="outline">
              Добавить самому
            </Button>
          ) : null}
        </div>
        {loading && (
          <div className="w-full my-4">
            <Progress value={33} className="w-full" />
            <p className="text-sm text-muted-foreground mt-2">
              Загрузка данных...
            </p>
          </div>
        )}
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        {items.length > 0 && (
          <div className="flex-col flex gap-4">
            <div className="flex gap-2">
              <Button
                onClick={() => setIsEditMode(!isEditMode)}
                variant="outline"
                className="flex-1"
              >
                {isEditMode ? (
                  <>
                    <Eye className="h-4 w-4 mr-2" />
                    Просмотр
                  </>
                ) : (
                  <>
                    <Edit2 className="h-4 w-4 mr-2" />
                    Редактировать
                  </>
                )}
              </Button>
              {/* {!isEditMode && (
                <Button
                  onClick={(e) => {
                    e.preventDefault();
                    handlePrint();
                  }}
                  className="flex-1"
                  variant="default"
                >
                  Распечатать или сохранить в PDF
                </Button>
              )} */}
            </div>
            {!isEditMode && <Switcher onChange={handleDesignChange} />}
          </div>
        )}
        {isEditMode ? (
          <EditTable
            items={items}
            onItemsChange={handleItemsChange}
            isEditMode={isEditMode}
            setIsEditMode={setIsEditMode}
          />
        ) : (
          <>
            <GenerateButton
              items={items}
              onGenerate={handleGenerate}
              isEditMode={isEditMode}
            />
            <div
              ref={componentRef}
              className={`flex flex-col print-content ${
                items.length === 0 ? "hidden" : ""
              }`}
            >
              {items.length > 0 && (
                <PriceTagList items={items} design={design} />
              )}
            </div>
          </>
        )}
      </div>
    </>
  );
};

export default App;
