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

        it("parses hyphen-delimited mobile price lists", () => {
                const clipboardText = `AEROVIBE 20000 - 1000 SALE
VOZOL STAR 46000 - 1690 SALE
VOZOL 46000 - 1690 SALE
ROQY L 20000 - 1900
INFLAVE OMEGA 10000 - 1690
INFLAVE ZERO 2200 - 990
INFLAVE PRO 7000 - 990 SALE
INFLAVE POWER 9000 - 800 SALE
INFLAVE SPIN 8000 - 1090
JOLYCON 1500 - 300 SALE
IGNITE 8000 - 1390
IGNITE 5000 - 1290
FIZZY BOOM 13000 - 1100 SALE
FIZZY PANDORA 12000 - 1000 SALE
FIZZY LUXURY 15000 - 1200 SALE
BUBBLE MON 10000 - 850 SALE
BUBBLE MON 15000 - 990 SALE
COOLPLAY TURBO 16000 - 1200 SALE
U-BAR 11000 - 600 SALE
MASKKING ROKI X 18000 - 990 SALE
MASKKING ROKI 15000 - 1200 SALE
Q5 PRO PLUS 10000 - 1300 SALE
MASKKING 20000 - 1200 SALE
ARTERY 25000 - 1090 SALE
RIFBAR 25000 - 990 SALE
VOOM 15000 - 1100 SALE
ICEBERG 6000 - 1100
ENERGY BOOM 12000 - 800 SALE
PODONKI 10000 - 1300 SALE
WAKA XLAND 15000 - 1000 SALE
WAKA 25000 - 1000 SALE
WAKA 38000 - 1990 SALE
WAKA 9000 - 1290 NEW
WAKA KA25000 - 1690 NEW
WAKA 20000 EXTRA - 1890 NEW
BRUSKO SPLIT 5000 - 600 SALE
CNPT COSMO 14000 - 2200
Картр HQD CLICK 5500 - 860
HQD CLICK PLUS 30000 - 1790 NEW
HQD ULTIMA PRO MAX 15000 - 1690 SALE
GEEK BAR MELOSO MINI 1500 - 600 SALE
GEEK BAR PULSE 12000 - 1000 SALE
GEEK BAR PULSE X 25000 - 1450 SALE
GEEK BAR WATT 20000 - 1100 SALE
LOST MARY OS25000 - 1790 NEW
LOST MARY MT15000 - 1650 NEW
Картр LOST MARY X LINK 20000 - 990 SALE
LOST MARY X LINK 20000 - 1390
LOST MARY MO10000 BLACK - 1550
LOST MARY MO30000 - 1890 NEW
LOST MARY PUFFBALL 30000 - 1690 NEW
LOST MARY x FUNKY LANDS 30000 - 1490 NEW
ELFBAR GH33000 - 1690 NEW
ELFBAR GH 23000 - 1590
ELFBAR BC30000 - 1690 NEW
Табак Joy 25г - 280
Табак BlackBurn 25г - 275
Угли CocoLoco 72шт 25мм - 790
Угли CocoLoco 12шт 25мм - 180
GEEKVAPE HERO Q - 2690
GEEKVAPE HERO 5 - 3800
GEEKVAPE H45 Aegis hero 2 - 3500
GEEKVAPE DIGI-Q KIT - 3200
GEEKVAPE SONDER Q2 - 1750
GEEKVAPE WENAX Q Pro - 2490
GEEKVAPE WENAX Q MINI - 2390
Voopoo VMATE Infinity Edition - 1990
Voopoo VMATE MINI - 1490
Voopoo VMATE E2 - 3200
BRUSKO MICOOL - 1450
GEEKVAPE DIGI PRO R - 3200
ELFBAR ELFX PRO - 2500
VEELAR L1 - 1300
XROS 5 MINI - 2490
XROS 5 - 3390
XROS 4 - 2990
XROS 3 MINI - 2190
XROS 3 - 2690
XROS 3 NANO - 2690
XROS 4 NANO - 2990
XROS PRO - 2990
ASPIRE FLEXUS Q - 2190
PLONQ META SMART - 3500
PLONQ META LITE - 2200
URSA POCKET - 3200
VAPORESSO ECO NANO - 1700
XROS CUBE - 1990
KNIGHT 80 - 3900
PASITO 2 - 3900
LOST VAPE THELEMA DM45 - 2990
LOST VAPE THELEMA NANO - 2890
SKALA - 420
MYYUMMY - 600
SAYONARA - 490
Q5 - 790
MOPC - 410
CAPITAN BLACK - 590
PLONQ - 800
RELL GRAY - 450
RELL AZURE - 570
RELL ULTIMA - 690
WAKA - 760
SK SINERIAN - 440
DUALL EXTREME - 450
DUALL - 400
MAD x САМОУБИЙЦА - 490
YUMMY - 380
TOYZ - 490
МОНАШКА - 490
INFLAVE - 790
LOONA ELIXIR - 800
VLAGA - 490
ICEBERG - 790
NASTY x HUSKY - 650`;

                const result = parseClipboardData(clipboardText);
                const expectedRowCount = clipboardText
                        .split(/\r?\n/)
                        .filter((line) => line.trim().length > 0).length;

                expect(result.items).toHaveLength(expectedRowCount);
                expect(result.skippedLineCount).toBe(0);
                expect(result.hasDesignData).toBe(true);
                expect(result.hasDiscountData).toBe(true);
                expect(result.columnLabels).toEqual(["Название", "Цена", "Дизайн"]);

                const aerovibe = result.items.find((item) => item.data === "AEROVIBE 20000");
                expect(aerovibe).toMatchObject({
                        price: 1000,
                        designType: "sale",
                        hasDiscount: false,
                });

                const wakaExtra = result.items.find(
                        (item) => item.data === "WAKA 20000 EXTRA",
                );
                expect(wakaExtra).toMatchObject({ price: 1890, designType: "new" });

                const hookahTobacco = result.items.find(
                        (item) => item.data === "Табак Joy 25г",
                );
                expect(hookahTobacco).toMatchObject({ price: 280 });
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
