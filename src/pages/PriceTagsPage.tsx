import type React from "react";
import { useCallback, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { AlertCircle, Edit2, Eye } from "lucide-react";
import { fetchGoogleSheetsData } from "google-sheets-data-fetcher";
import PriceTagList from "@/components/PriceTagList";
import GoogleSheetsForm from "@/components/GoogleSheetsForm";
import ExcelUploader from "@/components/ExcelUploader";
import { usePrintTags } from "@/hooks/usePrintTags";
import Switcher from "@/components/Switcher";
import { EditTable } from "@/components/EditTable";
import GenerateButton from "@/components/GenerateButton";
import { usePriceTagsStore } from "@/store/priceTagsStore";
import type { Item } from "@/store/priceTagsStore";

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

export const PriceTagsPage: React.FC = () => {
  const {
    items,
    loading,
    error,
    design,
    designType,
    isEditMode,
    discountAmount,
    maxDiscountPercent,
    setItems,
    setLoading,
    setError,
    setColumnLabels,
    setIsEditMode,
    addItem,
    updateItemPrices,
  } = usePriceTagsStore();

  const { componentRef, handlePrint } = usePrintTags({
    onError: (error) => setError(error.message),
  });

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

      if (data) {
        const columnKeys = Object.keys(data);
        const columnKey = columnKeys.length > 0 ? columnKeys[0] : "";

        if (columnKey && data[columnKey].rows) {
          const receivedItems = Object.values(data[columnKey].rows).map(
            (row: { id: number; data: string | number }) => {
              const price = Number(data[columnKey === "A" ? "B" : "A"].rows[row.id].data);
              return {
                ...row,
                data: row.data,
                price,
                discountPrice: price,
              };
            }
          ) as Item[];
          setItems(receivedItems);
          setColumnLabels([data.A.label, data.B.label]);
          setError(null);
        } else {
          setError("Неверная ссылка");
        }
      } else {
        setError("Неверная структура данных, полученная от API Google Таблиц:");
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : "Произошла ошибка");
    } finally {
      setLoading(false);
    }
  }, [setItems, setColumnLabels, setError, setLoading]);

  useEffect(() => {
    const savedUrl = localStorage.getItem("lastUrl");
    if (savedUrl) {
      fetchData(savedUrl);
    }
  }, [fetchData]);

  useEffect(() => {
    updateItemPrices();
  }, [updateItemPrices, design, discountAmount, maxDiscountPercent]);

  const extractSheetIdFromUrl = (url: string): string => {
    const parts = url.split("/");
    const sheetIdIndex = parts.indexOf("d") + 1;
    return parts[sheetIdIndex];
  };

  const handleGoogleSheetsSubmit = (submittedUrl: string) => {
    fetchData(submittedUrl);
  };

  interface ExcelData {
    Sheets: {
      [key: string]: {
        [cell: string]: {
          v: string | number;
        };
      };
    };
    SheetNames: string[];
  }

  const handleExcelUpload = (data: ExcelData) => {
    const sheetData = data.Sheets[data.SheetNames[0]];
    const parsedData: GoogleSheetsResponse = {
      A: { id: "1", label: "Название", type: "string", rows: {} },
      B: { id: "2", label: "Цена", type: "number", rows: {} },
    };

    for (const cell of Object.keys(sheetData)) {
      const col = cell.charAt(0);
      const row = Number.parseInt(cell.substring(1));

      if (row > 1) {
        if (parsedData[col]) {
          parsedData[col].rows[row] = {
            id: row,
            data: sheetData[cell].v,
          };
        }
      }
    }

    const receivedItems = Object.values(parsedData.A.rows).map(
      (row: { id: number; data: string | number }) => ({
        ...row,
        data: row.data,
        price: Number(parsedData.B.rows[row.id].data),
        discountPrice: Number(parsedData.B.rows[row.id].data),
      })
    ) as Item[];

    setItems(receivedItems);
    setColumnLabels([parsedData.A.label, parsedData.B.label]);
    setError(null);
  };

  const handleManualEntry = () => {
    addItem();
    setIsEditMode(true);
    setError(null);
  };

  const handleGenerate = () => {
    handlePrint();
  };

  return (
    <div className="flex-col flex gap-4">
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
            <GenerateButton
              items={items}
              isEditMode={isEditMode}
              onGenerate={handleGenerate}
            />
          </div>
          <Switcher />
          {isEditMode ? (
            <EditTable
              items={items}
              onChange={setItems}
            />
          ) : (
            <div ref={componentRef}>
              <PriceTagList items={items} design={design} designType={designType} />
            </div>
          )}
        </div>
      )}
    </div>
  );
};
