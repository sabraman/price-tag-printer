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
import { PriceTagCustomizer } from "@/components/PriceTagCustomizer";
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

// Function to consistently parse discount values from various formats
const parseDiscountValue = (value: string | number | null | undefined): boolean | undefined => {
  if (value === null || value === undefined) return undefined;
  
  const strValue = String(value).trim().toLowerCase();
  
  // Empty string means no value
  if (strValue === '') return undefined;
  
  // Check for positive values
  if (['да', 'true', 'yes', '1', 'истина', 'y', 'д', '+', 'т', 'true1'].includes(strValue)) {
    return true;
  }
  
  // Check for negative values
  if (['нет', 'false', 'no', '0', 'ложь', 'n', 'н', '-', 'ф', 'false0'].includes(strValue)) {
    return false;
  }
  
  // For any other values, log and return undefined
  console.log(`Unknown discount value: ${value}`);
  return undefined;
};

export const PriceTagsPage: React.FC = () => {
  const {
    items,
    loading,
    error,
    design,
    designType,
    isEditMode,
    themes,
    currentFont,
    discountText,
    hasTableDesigns,
    hasTableDiscounts,
    setItems,
    setLoading,
    setError,
    setColumnLabels,
    setIsEditMode,
    setThemes,
    setCurrentFont,
    setDiscountText,
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
          let hasDesignColumn = false;
          let designColumnKey = "";
          let hasDiscountColumn = false;
          let discountColumnKey = "";
          
          for (const key of columnKeys) {
            if (data[key]?.label?.toLowerCase() === "дизайн") {
              hasDesignColumn = true;
              designColumnKey = key;
            }
            if (data[key]?.label?.toLowerCase() === "скидка") {
              hasDiscountColumn = true;
              discountColumnKey = key;
            }
          }
          
          const hasDesignRow = !hasDesignColumn && data.C?.rows?.[3]?.data;
          if (hasDesignRow) {
            const designValue = String(data.C.rows[3].data).toLowerCase();
            if (['default', 'new', 'sale'].includes(designValue)) {
              designColumnKey = 'C';
            }
          }

          const receivedItems = Object.values(data[columnKey].rows).map(
            (row: { id: number; data: string | number }) => {
              const price = Number(data[columnKey === "A" ? "B" : "A"].rows[row.id].data);
              
              const designType = ((hasDesignColumn || hasDesignRow) && data[designColumnKey]?.rows?.[row.id]?.data) ? 
                (['default', 'new', 'sale'].includes(String(data[designColumnKey].rows[row.id].data).toLowerCase()) ? 
                  String(data[designColumnKey].rows[row.id].data).toLowerCase() : undefined) : 
                undefined;
              
              const hasDiscount = hasDiscountColumn && data[discountColumnKey]?.rows?.[row.id]?.data
                ? parseDiscountValue(data[discountColumnKey].rows[row.id].data)
                : undefined;
              
              return {
                ...row,
                data: row.data,
                price,
                discountPrice: price,
                designType,
                hasDiscount,
              };
            }
          ) as Item[];
          
          setItems(receivedItems);
          
          const labels = [data.A.label, data.B.label];
          if (hasDesignColumn) {
            labels.push(data[designColumnKey].label);
          }
          if (hasDiscountColumn) {
            labels.push(data[discountColumnKey].label);
          }
          setColumnLabels(labels);
          
          if (hasDesignColumn || hasDesignRow) {
            usePriceTagsStore.getState().setHasTableDesigns(true);
          } else {
            usePriceTagsStore.getState().setHasTableDesigns(false);
          }
          
          if (hasDiscountColumn) {
            usePriceTagsStore.getState().setHasTableDiscounts(true);
          } else {
            usePriceTagsStore.getState().setHasTableDiscounts(false);
          }
          
          // --- REPLACE THIS BLOCK ---
          if ((hasDesignColumn || hasDesignRow) && hasDiscountColumn) {
            usePriceTagsStore.getState().setDesign(false); // Reset global discount flag
            usePriceTagsStore.getState().setDesignType("table");
          }
          // --- END OF BLOCK ---
          
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
  }, [updateItemPrices]);

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
      C: { id: "3", label: "Дизайн", type: "string", rows: {} },
      D: { id: "4", label: "Скидка", type: "string", rows: {} },
    };

    let hasDesignColumn = false;
    if (sheetData.C1 && String(sheetData.C1.v).toLowerCase() === "дизайн") {
      hasDesignColumn = true;
      parsedData.C.label = String(sheetData.C1.v);
    }

    let hasDiscountColumn = false;
    if (sheetData.D1 && String(sheetData.D1.v).toLowerCase() === "скидка") {
      hasDiscountColumn = true;
      parsedData.D.label = String(sheetData.D1.v);
    }

    let hasDesignRow = false;
    
    if (!hasDesignColumn && sheetData.C3) {
      const designValue = String(sheetData.C3.v).toLowerCase();
      if (['default', 'new', 'sale'].includes(designValue)) {
        hasDesignRow = true;
      }
    }

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
      (row: { id: number; data: string | number }) => {
        const designType = ((hasDesignColumn || hasDesignRow) && parsedData.C.rows[row.id]) ? 
          (['default', 'new', 'sale'].includes(String(parsedData.C.rows[row.id].data).toLowerCase()) ? 
            String(parsedData.C.rows[row.id].data).toLowerCase() : undefined) : 
          undefined;
        
        const hasDiscount = hasDiscountColumn && parsedData.D.rows[row.id]
          ? parseDiscountValue(parsedData.D.rows[row.id].data)
          : undefined;
        
        return {
          ...row,
          data: row.data,
          price: Number(parsedData.B.rows[row.id].data),
          discountPrice: Number(parsedData.B.rows[row.id].data),
          designType,
          hasDiscount,
        };
      }
    ) as Item[];

    setItems(receivedItems);
    
    const labels = [parsedData.A.label, parsedData.B.label];
    if (hasDesignColumn) {
      labels.push(parsedData.C.label);
    }
    if (hasDiscountColumn) {
      labels.push(parsedData.D.label);
    }
    setColumnLabels(labels);
    
    if (hasDesignColumn || hasDesignRow) {
      usePriceTagsStore.getState().setHasTableDesigns(true);
    } else {
      usePriceTagsStore.getState().setHasTableDesigns(false);
    }
    
    if (hasDiscountColumn) {
      usePriceTagsStore.getState().setHasTableDiscounts(true);
    } else {
      usePriceTagsStore.getState().setHasTableDiscounts(false);
    }
    
    // --- REPLACE THIS BLOCK ---
    if ((hasDesignColumn || hasDesignRow) && hasDiscountColumn) {
      usePriceTagsStore.getState().setDesign(false); // Reset global discount flag
      usePriceTagsStore.getState().setDesignType("table");
    }
    // --- END OF BLOCK ---
    
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
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      {/* Left Column - Controls */}
      <div className="lg:col-span-4 space-y-4">
        <div className="space-y-4">
          <ExcelUploader onUpload={handleExcelUpload} />
          <GoogleSheetsForm onSubmit={handleGoogleSheetsSubmit} />
          {!items.length ? (
            <Button onClick={handleManualEntry} variant="outline" className="w-full">
              Добавить самому
            </Button>
          ) : null}
        </div>

        {loading && (
          <div className="w-full">
            <Progress value={33} className="w-full" />
            <p className="text-sm text-muted-foreground mt-2">
              Загрузка данных...
            </p>
          </div>
        )}

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {items.length > 0 && (
          <div className="space-y-4">
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
            <PriceTagCustomizer
              themes={themes}
              currentFont={currentFont}
              discountText={discountText}
              onThemeChange={setThemes}
              onFontChange={setCurrentFont}
              onDiscountTextChange={setDiscountText}
            />
          </div>
        )}
      </div>

      {/* Right Column - Preview/Edit */}
      {items.length > 0 && (
        <div className="lg:col-span-8">
          {isEditMode ? (
            <EditTable items={items} onChange={setItems} />
          ) : (
            <div ref={componentRef}>
              <PriceTagList
                items={items}
                design={design}
                designType={designType}
                themes={themes}
                font={currentFont}
                discountText={discountText}
                useTableDesigns={hasTableDesigns && designType === "table"}
                useTableDiscounts={hasTableDiscounts && designType === "table"}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
};
