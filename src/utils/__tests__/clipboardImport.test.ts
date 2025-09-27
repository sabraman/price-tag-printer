import { describe, expect, it } from "vitest";

import { parseClipboardData, parseClipboardLine } from "../clipboardImport";

describe("clipboardImport", () => {
        it("parses a line with sale tag", () => {
                const result = parseClipboardLine("AEROVIBE 20000 - 1000 SALE");

                expect(result).toEqual({
                        name: "AEROVIBE 20000",
                        price: 1000,
                        designType: "sale",
                        hasDiscount: true,
                });
        });

        it("parses a line without tag", () => {
                const result = parseClipboardLine("ROQY L 20000 - 1 900");

                expect(result).toEqual({
                        name: "ROQY L 20000",
                        price: 1900,
                });
        });

        it("collects failed lines during bulk parse", () => {
                const input = "INFLAVE ZERO 2200 - 990\ninvalid line";
                const { items, failedLines } = parseClipboardData(input);

                expect(items).toEqual([
                        {
                                name: "INFLAVE ZERO 2200",
                                price: 990,
                        },
                ]);
                expect(failedLines).toEqual(["invalid line"]);
        });
});
