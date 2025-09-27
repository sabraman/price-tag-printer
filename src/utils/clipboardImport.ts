import type { Item } from "@/store/priceTagsStore";

export interface ParsedClipboardItem {
        name: string;
        price: number;
        designType?: Item["designType"];
        hasDiscount?: boolean;
}

export interface ClipboardParseResult {
        items: ParsedClipboardItem[];
        failedLines: string[];
}

const DESIGN_TAG_MAP: Record<
        string,
        { designType?: Item["designType"]; hasDiscount?: boolean }
> = {
        sale: { designType: "sale", hasDiscount: true },
        new: { designType: "new" },
        default: { designType: "default" },
};

const DASH_REGEXP = /[-–—]/;

const isEditableTarget = (target: EventTarget | null): boolean => {
        if (!target || !(target instanceof HTMLElement)) {
                return false;
        }

        const tagName = target.tagName;

        if (tagName === "INPUT" || tagName === "TEXTAREA" || tagName === "SELECT") {
                return true;
        }

        return target.isContentEditable;
};

const sanitizePrice = (rawPrice: string): number | null => {
        const normalized = rawPrice.replace(/[\s₽руб.,]+$/iu, "");
        const digitsOnly = normalized.replace(/[^\d.,]/g, "").replace(/,/g, ".");

        if (!digitsOnly) {
                return null;
        }

        const price = Number.parseFloat(digitsOnly);

        if (!Number.isFinite(price) || price <= 0) {
                return null;
        }

        return Math.round(price);
};

export const parseClipboardLine = (line: string): ParsedClipboardItem | null => {
        const trimmedLine = line.trim();

        if (!trimmedLine) {
                return null;
        }

        const dashIndex = trimmedLine.search(DASH_REGEXP);

        if (dashIndex === -1) {
                return null;
        }

        const rawName = trimmedLine.slice(0, dashIndex).trim();
        let remainder = trimmedLine.slice(dashIndex + 1).trim();

        if (!rawName || !remainder) {
                return null;
        }

        const tagMatch = remainder.match(/\b([A-Za-zА-Яа-яЁё]+)\b$/u);

        let tag: string | undefined;

        if (tagMatch) {
                const candidate = tagMatch[1]?.toLowerCase();

                if (candidate && DESIGN_TAG_MAP[candidate]) {
                        tag = candidate;
                        remainder = remainder.slice(0, tagMatch.index).trim();
                }
        }

        const price = sanitizePrice(remainder);

        if (price === null) {
                return null;
        }

        const normalizedName = rawName.replace(/\s+/g, " ");

        const parsedItem: ParsedClipboardItem = {
                name: normalizedName,
                price,
        };

        if (tag) {
                const mapped = DESIGN_TAG_MAP[tag];

                if (mapped.designType) {
                        parsedItem.designType = mapped.designType;
                }

                if (mapped.hasDiscount !== undefined) {
                        parsedItem.hasDiscount = mapped.hasDiscount;
                }
        }

        return parsedItem;
};

export const parseClipboardData = (text: string): ClipboardParseResult => {
        const lines = text.split(/\r?\n/);
        const items: ParsedClipboardItem[] = [];
        const failedLines: string[] = [];

        for (const rawLine of lines) {
                const parsed = parseClipboardLine(rawLine);

                if (parsed) {
                        items.push(parsed);
                } else if (rawLine.trim()) {
                        failedLines.push(rawLine.trim());
                }
        }

        return { items, failedLines };
};

export const shouldHandlePasteEvent = (event: ClipboardEvent): boolean => {
        if (!event.clipboardData) {
                return false;
        }

        if (isEditableTarget(event.target)) {
                return false;
        }

        const text = event.clipboardData.getData("text/plain");

        if (!text) {
                return false;
        }

        return /[-–—]/.test(text);
};
