import xlsx from "node-xlsx";
import { existsSync, writeFileSync } from "fs";
import { join } from "path";

interface PriceItem {
  article: string; // Артикул
  name: string; // Номенклатура
  image: string; // Изображение
  retail: number; // Розничная цена
  purchase: number; // Закупочная цена
}

interface PricePair {
  retail: number;
  purchase: number;
}

interface Sheet {
  name: string;
  data: any[][];
}

try {
  // Check if input files exist
  const marineFile = "src/compare/морская прайс.xlsx";
  const gardenFile = "src/compare/садовая прайс (1).xlsx";

  console.log("Проверка наличия файлов...");
  console.log(
    `Морской прайс: ${existsSync(marineFile) ? "найден" : "не найден"}`
  );
  console.log(
    `Садовый прайс: ${existsSync(gardenFile) ? "найден" : "не найден"}`
  );

  if (!existsSync(marineFile)) {
    throw new Error(
      `Файл "${marineFile}" не найден. Пожалуйста, убедитесь, что файл находится в директории src/compare.`
    );
  }

  if (!existsSync(gardenFile)) {
    throw new Error(
      `Файл "${gardenFile}" не найден. Пожалуйста, убедитесь, что файл находится в директории src/compare.`
    );
  }

  // Read both Excel files
  console.log("Чтение файлов...");
  console.log("Чтение морского прайса...");
  const marinePriceList = xlsx.parse(marineFile);
  console.log("Чтение садового прайса...");
  const gardenPriceList = xlsx.parse(gardenFile);

  console.log("Информация о файле морского прайса:");
  console.log(
    "- Листы:",
    marinePriceList.map((sheet) => sheet.name)
  );
  console.log(
    "- Количество строк в первом листе:",
    marinePriceList[0].data.length
  );
  console.log("- Первые 10 строк данных:");
  marinePriceList[0].data.slice(0, 10).forEach((row, index) => {
    console.log(`Строка ${index}:`, row);
  });

  if (!marinePriceList.length) {
    throw new Error(`Файл "${marineFile}" не содержит листов.`);
  }

  if (!gardenPriceList.length) {
    throw new Error(`Файл "${gardenFile}" не содержит листов.`);
  }

  // Convert sheets to structured data
  console.log("Обработка данных...");

  const processSheet = (sheet: Sheet): PriceItem[] => {
    const data = sheet.data;
    console.log("Обработка листа. Всего строк:", data.length);
    // Пропускаем первые 5 строк (заголовки)
    const items: PriceItem[] = [];

    for (let i = 5; i < data.length; i++) {
      const row = data[i];
      if (row && row.length >= 5) {
        // В файле: пустая колонка, название, 2 пустых колонки, розничная цена, закупочная цена
        const retail = row[4]; // Розничная цена в 5-й колонке (индекс 4)
        const purchase = row[5]; // Закупочная цена в 6-й колонке (индекс 5)

        console.log(`Обработка строки ${i}:`, {
          raw: row,
          retail,
          purchase,
          retailType: typeof retail,
          purchaseType: typeof purchase,
        });

        // Проверяем, что значения существуют и являются числами
        if (retail !== undefined && purchase !== undefined) {
          const item = {
            article: String(row[0] || ""),
            name: String(row[1] || ""),
            image: String(row[2] || ""),
            retail:
              typeof retail === "number"
                ? retail
                : typeof retail === "string"
                ? parseFloat(retail.replace(/,/g, ""))
                : 0,
            purchase:
              typeof purchase === "number"
                ? purchase
                : typeof purchase === "string"
                ? parseFloat(purchase.replace(/,/g, ""))
                : 0,
          };
          console.log("Добавлен элемент:", item);
          items.push(item);
        }
      }
    }

    return items;
  };

  const marineData = processSheet(marinePriceList[0]);
  console.log("Обработанные данные морского прайса:", marineData.slice(0, 5));

  const gardenData = processSheet(gardenPriceList[0]);

  if (!marineData.length) {
    throw new Error(`Файл "${marineFile}" не содержит данных.`);
  }

  if (!gardenData.length) {
    throw new Error(`Файл "${gardenFile}" не содержит данных.`);
  }

  // Create a map for quick lookup
  const createPriceMap = (data: PriceItem[]): Map<string, PricePair> => {
    const map = new Map<string, PricePair>();
    data.forEach((item) => {
      if (item.name) {
        const key = item.name.trim().toLowerCase();
        map.set(key, {
          retail: item.retail,
          purchase: item.purchase,
        });
      }
    });
    return map;
  };

  console.log("Создание карты цен...");
  const marineMap = createPriceMap(marineData);
  const gardenMap = createPriceMap(gardenData);

  if (!marineMap.size) {
    throw new Error(
      `В файле "${marineFile}" не найдены корректные данные о ценах.`
    );
  }

  if (!gardenMap.size) {
    throw new Error(
      `В файле "${gardenFile}" не найдены корректные данные о ценах.`
    );
  }

  // Merge prices and keep the lowest values
  const mergedData: any[][] = [
    ["Прайс-лист на 17 февраля 2025 г.", "", "", "", ""],
    [
      "Ценовая группа",
      "",
      "",
      "Розничная цена продажи (СПБ)",
      "Закупочная цена (СПБ)",
    ],
    [
      "Артикул",
      "Номенклатура, Характеристика, Упаковка",
      "Изображение",
      "RUB",
      "RUB",
    ],
    ["Не включает НДС", "", "", "Не включает НДС", "Не включает НДС"],
    ["Цена", "", "", "Цена", "Цена"],
    ["", "", "", "", ""],
  ];

  // Compare marine prices with garden prices
  console.log("Сравнение цен...");
  let marineCount = 0;
  let gardenCount = 0;
  let bothCount = 0;

  marineMap.forEach((marinePrices, itemName) => {
    const gardenPrices = gardenMap.get(itemName);

    if (gardenPrices) {
      // Both lists have the item - compare prices
      mergedData.push([
        "",
        itemName,
        "",
        Math.min(marinePrices.retail, gardenPrices.retail),
        Math.min(marinePrices.purchase, gardenPrices.purchase),
      ]);
      bothCount++;
      gardenMap.delete(itemName); // Remove matched item
    } else {
      // Item only exists in marine list
      mergedData.push([
        "",
        itemName,
        "",
        marinePrices.retail,
        marinePrices.purchase,
      ]);
      marineCount++;
    }
  });

  // Add remaining garden-only items
  gardenMap.forEach((gardenPrices, itemName) => {
    mergedData.push([
      "",
      itemName,
      "",
      gardenPrices.retail,
      gardenPrices.purchase,
    ]);
    gardenCount++;
  });

  if (mergedData.length <= 6) {
    throw new Error(
      "Не удалось создать объединенный прайс-лист. Нет данных для объединения."
    );
  }

  // Create new workbook and save results
  console.log("Сохранение результатов...");

  const buffer = xlsx.build([
    { name: "Результат", data: mergedData, options: {} },
  ]);
  writeFileSync("Объединенный_прайс.xlsx", buffer);

  console.log('Готово! Результаты сохранены в файл "Объединенный_прайс.xlsx"');
  console.log(`Обработано товаров: ${mergedData.length - 6}`);
  console.log(`- Из морского прайса: ${marineCount}`);
  console.log(`- Из садового прайса: ${gardenCount}`);
  console.log(`- Присутствуют в обоих: ${bothCount}`);
} catch (error) {
  if (error instanceof Error) {
    console.error("Ошибка:", error.message);
  } else {
    console.error("Произошла неизвестная ошибка");
  }
  process.exit(1);
}
