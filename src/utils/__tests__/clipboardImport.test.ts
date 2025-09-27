import { beforeAll, describe, expect, it } from "vitest";
import { JSDOM } from "jsdom";

import {
        CLIPBOARD_TRIGGER_ATTRIBUTE,
        isEditableTarget,
        parseClipboardData,
        shouldHandlePasteEvent,
} from "../clipboardImport";

const createClipboardEvent = (target: EventTarget | null): ClipboardEvent => {
        return { target } as unknown as ClipboardEvent;
};

beforeAll(() => {
        const { window } = new JSDOM("<!doctype html><html><body></body></html>");
        globalThis.window = window as unknown as typeof globalThis.window;
        globalThis.document = window.document;
        globalThis.HTMLElement = window.HTMLElement;
        globalThis.HTMLInputElement = window.HTMLInputElement;
        globalThis.HTMLTextAreaElement = window.HTMLTextAreaElement;
        globalThis.HTMLSelectElement = window.HTMLSelectElement;
});

describe("parseClipboardData", () => {
        it("parses tab separated clipboard data with headers", () => {
                const clipboardText = [
                        "Название\tЦена\tДизайн\tСкидка\tЦена за 2\tЦена от 3",
                        "Товар 1\t100\tnew\tда\t90\t80",
                        "Товар 2\t250\tsale\tнет\t\t120",
                        "Некорректная строка",
                ].join("\n");

                const result = parseClipboardData(clipboardText);

                expect(result.items).toHaveLength(2);
                expect(result.columnLabels).toEqual([
                        "Название",
                        "Цена",
                        "Дизайн",
                        "Скидка",
                        "Цена за 2",
                        "Цена от 3",
                ]);
                expect(result.items[0]).toMatchObject({
                        data: "Товар 1",
                        price: 100,
                        discountPrice: 100,
                        designType: "new",
                        hasDiscount: true,
                        priceFor2: 90,
                        priceFrom3: 80,
                });
                expect(result.items[1]).toMatchObject({
                        data: "Товар 2",
                        price: 250,
                        discountPrice: 250,
                        designType: "sale",
                        hasDiscount: false,
                        priceFrom3: 120,
                });
                expect(result.skippedLineCount).toBe(1);
                expect(result.hasDesignData).toBe(true);
                expect(result.hasDiscountData).toBe(true);
                expect(result.hasPriceFor2Data).toBe(true);
                expect(result.hasPriceFrom3Data).toBe(true);
        });

        it("falls back to default labels when no header row is detected", () => {
                const clipboardText = [
                        "Product A\t199",
                        "Product B\t250",
                ].join("\n");

                const result = parseClipboardData(clipboardText);

                expect(result.columnLabels).toEqual(["Название", "Цена"]);
                expect(result.items.map((item) => item.price)).toEqual([199, 250]);
                expect(result.skippedLineCount).toBe(0);
        });

        it("supports semicolon separated values for manual pastes", () => {
                const clipboardText = "Item one;300;new;да;280;270";

                const result = parseClipboardData(clipboardText);

                expect(result.items).toHaveLength(1);
                expect(result.items[0]).toMatchObject({
                        data: "Item one",
                        price: 300,
                        designType: "new",
                        hasDiscount: true,
                });
        });
});

describe("paste event helpers", () => {
        it("ignores editable targets", () => {
                const input = document.createElement("input");
                const textarea = document.createElement("textarea");
                textarea.setAttribute("role", "textbox");

                expect(isEditableTarget(input)).toBe(true);
                expect(isEditableTarget(textarea)).toBe(true);

                const event = createClipboardEvent(input);
                expect(shouldHandlePasteEvent(event)).toBe(false);
        });

        it("allows paste events from the explicit trigger control", () => {
                const button = document.createElement("button");
                button.setAttribute(CLIPBOARD_TRIGGER_ATTRIBUTE, "true");
                const event = createClipboardEvent(button);

                expect(shouldHandlePasteEvent(event)).toBe(true);
        });

        it("handles non-editable surfaces by default", () => {
                const div = document.createElement("div");
                const event = createClipboardEvent(div);

                expect(isEditableTarget(div)).toBe(false);
                expect(shouldHandlePasteEvent(event)).toBe(true);
        });
});
