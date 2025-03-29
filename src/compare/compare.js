"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var node_xlsx_1 = __importDefault(require("node-xlsx"));
var fs_1 = require("fs");
try {
    // Check if input files exist
    var marineFile = "src/compare/морская прайс.xlsx";
    var gardenFile = "src/compare/садовая прайс (1).xlsx";
    console.log("Проверка наличия файлов...");
    console.log("\u041C\u043E\u0440\u0441\u043A\u043E\u0439 \u043F\u0440\u0430\u0439\u0441: ".concat((0, fs_1.existsSync)(marineFile) ? "найден" : "не найден"));
    console.log("\u0421\u0430\u0434\u043E\u0432\u044B\u0439 \u043F\u0440\u0430\u0439\u0441: ".concat((0, fs_1.existsSync)(gardenFile) ? "найден" : "не найден"));
    if (!(0, fs_1.existsSync)(marineFile)) {
        throw new Error("\u0424\u0430\u0439\u043B \"".concat(marineFile, "\" \u043D\u0435 \u043D\u0430\u0439\u0434\u0435\u043D. \u041F\u043E\u0436\u0430\u043B\u0443\u0439\u0441\u0442\u0430, \u0443\u0431\u0435\u0434\u0438\u0442\u0435\u0441\u044C, \u0447\u0442\u043E \u0444\u0430\u0439\u043B \u043D\u0430\u0445\u043E\u0434\u0438\u0442\u0441\u044F \u0432 \u0434\u0438\u0440\u0435\u043A\u0442\u043E\u0440\u0438\u0438 src/compare."));
    }
    if (!(0, fs_1.existsSync)(gardenFile)) {
        throw new Error("\u0424\u0430\u0439\u043B \"".concat(gardenFile, "\" \u043D\u0435 \u043D\u0430\u0439\u0434\u0435\u043D. \u041F\u043E\u0436\u0430\u043B\u0443\u0439\u0441\u0442\u0430, \u0443\u0431\u0435\u0434\u0438\u0442\u0435\u0441\u044C, \u0447\u0442\u043E \u0444\u0430\u0439\u043B \u043D\u0430\u0445\u043E\u0434\u0438\u0442\u0441\u044F \u0432 \u0434\u0438\u0440\u0435\u043A\u0442\u043E\u0440\u0438\u0438 src/compare."));
    }
    // Read both Excel files
    console.log("Чтение файлов...");
    console.log("Чтение морского прайса...");
    var marinePriceList = node_xlsx_1.default.parse(marineFile);
    console.log("Чтение садового прайса...");
    var gardenPriceList = node_xlsx_1.default.parse(gardenFile);
    console.log("Информация о файле морского прайса:");
    console.log("- Листы:", marinePriceList.map(function (sheet) { return sheet.name; }));
    console.log("- Количество строк в первом листе:", marinePriceList[0].data.length);
    console.log("- Первые 10 строк данных:");
    marinePriceList[0].data.slice(0, 10).forEach(function (row, index) {
        console.log("\u0421\u0442\u0440\u043E\u043A\u0430 ".concat(index, ":"), row);
    });
    if (!marinePriceList.length) {
        throw new Error("\u0424\u0430\u0439\u043B \"".concat(marineFile, "\" \u043D\u0435 \u0441\u043E\u0434\u0435\u0440\u0436\u0438\u0442 \u043B\u0438\u0441\u0442\u043E\u0432."));
    }
    if (!gardenPriceList.length) {
        throw new Error("\u0424\u0430\u0439\u043B \"".concat(gardenFile, "\" \u043D\u0435 \u0441\u043E\u0434\u0435\u0440\u0436\u0438\u0442 \u043B\u0438\u0441\u0442\u043E\u0432."));
    }
    // Convert sheets to structured data
    console.log("Обработка данных...");
    var processSheet = function (sheet) {
        var data = sheet.data;
        console.log("Обработка листа. Всего строк:", data.length);
        // Пропускаем первые 5 строк (заголовки)
        var items = [];
        for (var i = 5; i < data.length; i++) {
            var row = data[i];
            if (row && row.length >= 5) {
                // Закупочная цена в 4-й колонке, розничная в 5-й
                var purchase = row[3];
                var retail = row[4];
                console.log("\u041E\u0431\u0440\u0430\u0431\u043E\u0442\u043A\u0430 \u0441\u0442\u0440\u043E\u043A\u0438 ".concat(i, ":"), {
                    raw: row,
                    retail: retail,
                    purchase: purchase,
                    retailType: typeof retail,
                    purchaseType: typeof purchase,
                });
                // Проверяем, что значения существуют и являются числами
                if (purchase !== undefined) {
                    var item = {
                        article: String(row[0] || ""),
                        name: String(row[1] || ""),
                        image: String(row[2] || ""),
                        retail: typeof retail === "number"
                            ? retail
                            : typeof retail === "string"
                                ? parseFloat(retail.replace(/,/g, ""))
                                : 0,
                        purchase: typeof purchase === "number"
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
    var marineData = processSheet(marinePriceList[0]);
    console.log("Обработанные данные морского прайса:", marineData.slice(0, 5));
    var gardenData = processSheet(gardenPriceList[0]);
    if (!marineData.length) {
        throw new Error("\u0424\u0430\u0439\u043B \"".concat(marineFile, "\" \u043D\u0435 \u0441\u043E\u0434\u0435\u0440\u0436\u0438\u0442 \u0434\u0430\u043D\u043D\u044B\u0445."));
    }
    if (!gardenData.length) {
        throw new Error("\u0424\u0430\u0439\u043B \"".concat(gardenFile, "\" \u043D\u0435 \u0441\u043E\u0434\u0435\u0440\u0436\u0438\u0442 \u0434\u0430\u043D\u043D\u044B\u0445."));
    }
    // Create a map for quick lookup
    var createPriceMap = function (data) {
        var map = new Map();
        data.forEach(function (item) {
            if (item.name) {
                var key = item.name.trim().toLowerCase();
                map.set(key, {
                    retail: item.retail,
                    purchase: item.purchase,
                });
            }
        });
        return map;
    };
    console.log("Создание карты цен...");
    var marineMap = createPriceMap(marineData);
    var gardenMap_1 = createPriceMap(gardenData);
    if (!marineMap.size) {
        throw new Error("\u0412 \u0444\u0430\u0439\u043B\u0435 \"".concat(marineFile, "\" \u043D\u0435 \u043D\u0430\u0439\u0434\u0435\u043D\u044B \u043A\u043E\u0440\u0440\u0435\u043A\u0442\u043D\u044B\u0435 \u0434\u0430\u043D\u043D\u044B\u0435 \u043E \u0446\u0435\u043D\u0430\u0445."));
    }
    if (!gardenMap_1.size) {
        throw new Error("\u0412 \u0444\u0430\u0439\u043B\u0435 \"".concat(gardenFile, "\" \u043D\u0435 \u043D\u0430\u0439\u0434\u0435\u043D\u044B \u043A\u043E\u0440\u0440\u0435\u043A\u0442\u043D\u044B\u0435 \u0434\u0430\u043D\u043D\u044B\u0435 \u043E \u0446\u0435\u043D\u0430\u0445."));
    }
    // Merge prices and keep the lowest values
    var mergedData_1 = [
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
    var marineCount_1 = 0;
    var gardenCount_1 = 0;
    var bothCount_1 = 0;
    marineMap.forEach(function (marinePrices, itemName) {
        var gardenPrices = gardenMap_1.get(itemName);
        if (gardenPrices) {
            // Both lists have the item - compare prices
            mergedData_1.push([
                "",
                itemName,
                "",
                Math.min(marinePrices.retail, gardenPrices.retail),
                Math.min(marinePrices.purchase, gardenPrices.purchase),
            ]);
            bothCount_1++;
            gardenMap_1.delete(itemName); // Remove matched item
        }
        else {
            // Item only exists in marine list
            mergedData_1.push([
                "",
                itemName,
                "",
                marinePrices.retail,
                marinePrices.purchase,
            ]);
            marineCount_1++;
        }
    });
    // Add remaining garden-only items
    gardenMap_1.forEach(function (gardenPrices, itemName) {
        mergedData_1.push([
            "",
            itemName,
            "",
            gardenPrices.retail,
            gardenPrices.purchase,
        ]);
        gardenCount_1++;
    });
    if (mergedData_1.length <= 6) {
        throw new Error("Не удалось создать объединенный прайс-лист. Нет данных для объединения.");
    }
    // Create new workbook and save results
    console.log("Сохранение результатов...");
    var buffer = node_xlsx_1.default.build([
        { name: "Результат", data: mergedData_1, options: {} },
    ]);
    (0, fs_1.writeFileSync)("Объединенный_прайс.xlsx", buffer);
    console.log('Готово! Результаты сохранены в файл "Объединенный_прайс.xlsx"');
    console.log("\u041E\u0431\u0440\u0430\u0431\u043E\u0442\u0430\u043D\u043E \u0442\u043E\u0432\u0430\u0440\u043E\u0432: ".concat(mergedData_1.length - 6));
    console.log("- \u0418\u0437 \u043C\u043E\u0440\u0441\u043A\u043E\u0433\u043E \u043F\u0440\u0430\u0439\u0441\u0430: ".concat(marineCount_1));
    console.log("- \u0418\u0437 \u0441\u0430\u0434\u043E\u0432\u043E\u0433\u043E \u043F\u0440\u0430\u0439\u0441\u0430: ".concat(gardenCount_1));
    console.log("- \u041F\u0440\u0438\u0441\u0443\u0442\u0441\u0442\u0432\u0443\u044E\u0442 \u0432 \u043E\u0431\u043E\u0438\u0445: ".concat(bothCount_1));
}
catch (error) {
    if (error instanceof Error) {
        console.error("Ошибка:", error.message);
    }
    else {
        console.error("Произошла неизвестная ошибка");
    }
    process.exit(1);
}
