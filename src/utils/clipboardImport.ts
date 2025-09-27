import type { Item } from "@/store/priceTagsStore";

export const CLIPBOARD_TRIGGER_ATTRIBUTE = "data-clipboard-import-trigger";

const DEFAULT_COLUMN_LABELS = [
        "Название",
        "Цена",
        "Дизайн",
        "Скидка",
        "Цена за 2",
        "Цена от 3",
];

const DESIGN_VALUES = new Set(["default", "new", "sale"]);

const POSITIVE_DISCOUNT_VALUES = new Set([
        "да",
        "true",
        "yes",
        "1",
        "истина",
        "y",
        "д",
        "+",
        "т",
        "true1",
]);

const NEGATIVE_DISCOUNT_VALUES = new Set([
        "нет",
        "false",
        "no",
        "0",
        "ложь",
        "n",
        "н",
        "-",
        "ф",
        "false0",
]);

const sanitizeNumericValue = (value: string | undefined): number | undefined => {
        if (!value) {
                return undefined;
        }

        const normalized = value
                .replace(/[\u00A0\s]/g, "")
                .replace(/,(\d{1,2})$/, ".$1")
                .replace(/,/g, ".");

        if (!normalized) {
                return undefined;
        }

        const parsed = Number(normalized);
        if (Number.isFinite(parsed)) {
                return parsed;
        }

        return undefined;
};

const parseDiscountValue = (
        value: string | undefined,
): boolean | undefined => {
        if (!value) {
                return undefined;
        }

        const normalized = value.trim().toLowerCase();

        if (!normalized) {
                return undefined;
        }

        if (POSITIVE_DISCOUNT_VALUES.has(normalized)) {
                return true;
        }

        if (NEGATIVE_DISCOUNT_VALUES.has(normalized)) {
                return false;
        }

        return undefined;
};

const detectDelimiter = (line: string): RegExp | string => {
        if (line.includes("\t")) {
                return "\t";
        }

        const semicolonCount = (line.match(/;/g) || []).length;
        if (semicolonCount >= 1) {
                return ";";
        }

        const commaCount = (line.match(/,/g) || []).length;
        if (commaCount >= 1) {
                return ",";
        }

        return /\s{2,}/;
};

const splitLine = (line: string): string[] => {
        const delimiter = detectDelimiter(line);
        return line.split(delimiter).map((cell) => cell.trim());
};

const hasHeaderRow = (firstRow: string[]): boolean => {
        if (firstRow.length < 2) {
                return false;
        }

        const priceCandidate = sanitizeNumericValue(firstRow[1]);
        if (priceCandidate !== undefined) {
                return false;
        }

        return true;
};

const ensureColumnLabels = (labels: string[], columnsObserved: number): string[] => {
        if (labels.length >= 2) {
                return labels;
        }

        const count = Math.max(columnsObserved, 2);
        return DEFAULT_COLUMN_LABELS.slice(0, count);
};

export interface ParsedClipboardData {
        items: Item[];
        columnLabels: string[];
        hasDesignData: boolean;
        hasDiscountData: boolean;
        hasPriceFor2Data: boolean;
        hasPriceFrom3Data: boolean;
        skippedLineCount: number;
}

export const parseClipboardData = (raw: string): ParsedClipboardData => {
        const cleaned = raw
                .split(/\r?\n/)
                .map((line) => line.trim())
                .filter((line) => line.length > 0);

        if (cleaned.length === 0) {
                return {
                        items: [],
                        columnLabels: [],
                        hasDesignData: false,
                        hasDiscountData: false,
                        hasPriceFor2Data: false,
                        hasPriceFrom3Data: false,
                        skippedLineCount: 0,
                };
        }

        const firstRowCells = splitLine(cleaned[0]);
        const headerPresent = hasHeaderRow(firstRowCells);

        const columnLabels = headerPresent
                ? firstRowCells
                : DEFAULT_COLUMN_LABELS.slice(0, Math.max(firstRowCells.length, 2));

        const rowsToParse = headerPresent ? cleaned.slice(1) : cleaned;

        let skippedLineCount = 0;
        const items: Item[] = [];
        let columnsObserved = columnLabels.length;

        rowsToParse.forEach((line, index) => {
                const cells = splitLine(line);
                if (cells.length < 2) {
                        skippedLineCount += 1;
                        return;
                }

                columnsObserved = Math.max(columnsObserved, cells.length);

                const [name, priceRaw, designRaw, discountRaw, priceFor2Raw, priceFrom3Raw] = cells;

                if (!name) {
                        skippedLineCount += 1;
                        return;
                }

                const price = sanitizeNumericValue(priceRaw);

                if (price === undefined) {
                        skippedLineCount += 1;
                        return;
                }

                const discountPrice = price;

                const item: Item = {
                        id: Date.now() + index,
                        data: name,
                        price,
                        discountPrice,
                };

                const designCandidate = designRaw?.toLowerCase();
                if (designCandidate && DESIGN_VALUES.has(designCandidate)) {
                        item.designType = designCandidate;
                }

                const discountCandidate = parseDiscountValue(discountRaw);
                if (discountCandidate !== undefined) {
                        item.hasDiscount = discountCandidate;
                }

                const priceFor2 = sanitizeNumericValue(priceFor2Raw);
                if (priceFor2 !== undefined) {
                        item.priceFor2 = priceFor2;
                }

                const priceFrom3 = sanitizeNumericValue(priceFrom3Raw);
                if (priceFrom3 !== undefined) {
                        item.priceFrom3 = priceFrom3;
                }

                items.push(item);
        });

        const hasDesignData = items.some((item) => item.designType !== undefined);
        const hasDiscountData = items.some((item) => item.hasDiscount !== undefined);
        const hasPriceFor2Data = items.some((item) => item.priceFor2 !== undefined);
        const hasPriceFrom3Data = items.some((item) => item.priceFrom3 !== undefined);

        const resolvedLabels = ensureColumnLabels(columnLabels, columnsObserved);

        return {
                items,
                columnLabels: resolvedLabels,
                hasDesignData,
                hasDiscountData,
                hasPriceFor2Data,
                hasPriceFrom3Data,
                skippedLineCount,
        };
};

export const isEditableTarget = (target: EventTarget | null): boolean => {
        if (!target || !(target instanceof HTMLElement)) {
                return false;
        }

        const element = target as HTMLElement;

        if (element instanceof HTMLSelectElement) {
                return !element.disabled;
        }

        if (element instanceof HTMLInputElement) {
                const type = element.type;
                if (["button", "submit", "reset"].includes(type)) {
                        return false;
                }

                return !element.readOnly && !element.disabled;
        }

        if (element instanceof HTMLTextAreaElement) {
                return !element.readOnly && !element.disabled;
        }

        if (element.isContentEditable) {
                return true;
        }

        const role = element.getAttribute("role");
        if (role && role.toLowerCase() === "textbox") {
                return true;
        }

        return false;
};

export const shouldHandlePasteEvent = (event: ClipboardEvent): boolean => {
        const target = event.target as HTMLElement | null;

        if (!target) {
                return true;
        }

        if (target.closest(`[${CLIPBOARD_TRIGGER_ATTRIBUTE}]`)) {
                return true;
        }

        return !isEditableTarget(target);
};
