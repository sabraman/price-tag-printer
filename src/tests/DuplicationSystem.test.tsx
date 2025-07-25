import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { Item } from "@/store/priceTagsStore";
import { usePriceTagsStore } from "@/store/priceTagsStore";

// Mock sonner
vi.mock("sonner", () => ({
	toast: {
		success: vi.fn(),
		error: vi.fn(),
	},
}));

const createTestItem = (id: number, data: string, price: number): Item => ({
	id,
	data,
	price,
	discountPrice: price - 5,
	designType: "default",
	hasDiscount: false,
});

describe("Duplication System", () => {
	beforeEach(() => {
		// Reset store state
		const { setItems } = usePriceTagsStore.getState();
		setItems([]);
		vi.clearAllMocks();
	});

	describe("Store duplicateItems Method", () => {
		it("should create unique IDs for duplicated items", () => {
			const { result: store } = renderHook(() => usePriceTagsStore());

			// Add initial items
			act(() => {
				store.current.setItems([
					createTestItem(1, "Apple", 100),
					createTestItem(2, "Banana", 200),
					createTestItem(3, "Cherry", 300),
				]);
			});

			// Duplicate items
			act(() => {
				store.current.duplicateItems([1, 2]);
			});

			const items = store.current.items;
			expect(items).toHaveLength(5); // 3 original + 2 duplicated

			// Check that all IDs are unique
			const ids = items.map((item) => item.id);
			const uniqueIds = new Set(ids);
			expect(uniqueIds.size).toBe(ids.length);

			// Check that duplicated items have different IDs than originals
			const duplicatedItems = items.slice(3);
			expect(duplicatedItems[0].id).not.toBe(1);
			expect(duplicatedItems[1].id).not.toBe(2);
			expect(duplicatedItems[0].id).not.toBe(duplicatedItems[1].id);
		});

		it("should preserve all properties except ID", () => {
			const { result: store } = renderHook(() => usePriceTagsStore());

			// Create test items with specific properties
			const testItems: Item[] = [
				{
					id: 100,
					data: "Test Item",
					price: 250,
					designType: "new",
					hasDiscount: true,
					discountPrice: 225,
					priceFor2: 240,
					priceFrom3: 230,
				},
			];

			act(() => {
				store.current.setItems(testItems);
			});

			act(() => {
				store.current.duplicateItems([100]);
			});

			const originalItemIds = testItems.map((item) => item.id);
			const newItems = store.current.items.filter(
				(item) => !originalItemIds.includes(item.id),
			);
			expect(newItems).toHaveLength(1);

			// Should preserve original data without suffix
			expect(newItems[0].data).toBe("Test Item");
			expect(newItems[0].price).toBe(250);
			expect(newItems[0].designType).toBe("new");
			expect(newItems[0].hasDiscount).toBe(true);
			expect(newItems[0].discountPrice).toBe(225);
			expect(newItems[0].priceFor2).toBe(240);
			expect(newItems[0].priceFrom3).toBe(230);

			// Should have different ID
			expect(newItems[0].id).not.toBe(100);
		});

		it("should handle multiple items duplication with unique IDs", () => {
			const { result: store } = renderHook(() => usePriceTagsStore());

			act(() => {
				store.current.setItems([
					createTestItem(10, "Item A", 100),
					createTestItem(20, "Item B", 200),
					createTestItem(30, "Item C", 300),
					createTestItem(40, "Item D", 400),
				]);
			});

			// Duplicate all items at once
			act(() => {
				store.current.duplicateItems([10, 20, 30, 40]);
			});

			const items = store.current.items;
			expect(items).toHaveLength(8); // 4 original + 4 duplicated

			// Check all IDs are unique
			const ids = items.map((item) => item.id);
			const uniqueIds = new Set(ids);
			expect(uniqueIds.size).toBe(8);

			// Check duplicated items have copy suffix
			const duplicatedItems = items.slice(4);
			expect(duplicatedItems[0].data).toBe("Item A");
			expect(duplicatedItems[1].data).toBe("Item B");
			expect(duplicatedItems[2].data).toBe("Item C");
			expect(duplicatedItems[3].data).toBe("Item D");
		});

		it("should handle empty duplication gracefully", () => {
			const { result: store } = renderHook(() => usePriceTagsStore());

			act(() => {
				store.current.setItems([createTestItem(1, "Test", 100)]);
			});

			const originalLength = store.current.items.length;

			act(() => {
				store.current.duplicateItems([]); // Empty array
			});

			expect(store.current.items).toHaveLength(originalLength);
		});

		it("should handle non-existent IDs gracefully", () => {
			const { result: store } = renderHook(() => usePriceTagsStore());

			const originalItems = [
				createTestItem(1, "Item 1", 100),
				createTestItem(2, "Item 2", 200),
			];

			act(() => {
				store.current.setItems(originalItems);
			});

			// Try to duplicate mix of existing and non-existing IDs
			act(() => {
				store.current.duplicateItems([1, 999, 2, 888]);
			});

			const items = store.current.items;
			expect(items).toHaveLength(4); // 2 original + 2 duplicated (only existing ones)

			const duplicatedItems = items.slice(2);
			expect(duplicatedItems).toHaveLength(2);
			expect(duplicatedItems[0].data).toBe("Item 1");
			expect(duplicatedItems[1].data).toBe("Item 2");
		});

		it("should properly manage history for undo/redo", () => {
			const { result: store } = renderHook(() => usePriceTagsStore());

			act(() => {
				store.current.setItems([createTestItem(1, "Test Item", 100)]);
			});

			const initialHistoryIndex = store.current.historyIndex;

			act(() => {
				store.current.duplicateItems([1]);
			});

			// History should advance after duplication
			expect(store.current.historyIndex).toBe(initialHistoryIndex + 1);
			expect(store.current.items).toHaveLength(2);

			// Should be able to undo
			act(() => {
				store.current.undo();
			});

			expect(store.current.items).toHaveLength(1);
			expect(store.current.historyIndex).toBe(initialHistoryIndex);

			// Should be able to redo
			act(() => {
				store.current.redo();
			});

			expect(store.current.items).toHaveLength(2);
			expect(store.current.historyIndex).toBe(initialHistoryIndex + 1);
		});
	});

	describe("Selection State After Duplication", () => {
		it("should maintain consistent state when selection references old IDs", () => {
			const { result: store } = renderHook(() => usePriceTagsStore());

			act(() => {
				store.current.setItems([
					createTestItem(1, "Apple", 100),
					createTestItem(2, "Banana", 200),
					createTestItem(3, "Cherry", 300),
				]);
			});

			// Simulate selection state (in real app, this would be in component state)
			const selectedItems = [1, 2];

			act(() => {
				store.current.duplicateItems(selectedItems);
			});

			const items = store.current.items;
			expect(items).toHaveLength(5);

			// Original selected items should still exist with same IDs
			const originalItems = items.filter((item) =>
				selectedItems.includes(item.id),
			);
			expect(originalItems).toHaveLength(2);
			expect(originalItems[0].id).toBe(1);
			expect(originalItems[1].id).toBe(2);

			// New items should have different IDs
			const newItems = items.filter(
				(item) => !selectedItems.includes(item.id) && item.id !== 3,
			);
			expect(newItems).toHaveLength(2);
			expect(newItems.every((item) => !selectedItems.includes(item.id))).toBe(
				true,
			);
		});
	});

	describe("Performance and Large Scale Duplication", () => {
		it("should handle large scale duplication efficiently", () => {
			const { result: store } = renderHook(() => usePriceTagsStore());

			// Create 100 items
			const largeItemSet = Array.from({ length: 100 }, (_, i) =>
				createTestItem(i + 1, `Item ${i + 1}`, (i + 1) * 10),
			);

			act(() => {
				store.current.setItems(largeItemSet);
			});

			const startTime = performance.now();

			// Duplicate 50 items
			const idsTouplicate = Array.from({ length: 50 }, (_, i) => i + 1);

			act(() => {
				store.current.duplicateItems(idsTouplicate);
			});

			const endTime = performance.now();
			const duration = endTime - startTime;

			// Should complete quickly (less than 100ms for 50 items)
			expect(duration).toBeLessThan(100);

			const items = store.current.items;
			expect(items).toHaveLength(150); // 100 original + 50 duplicated

			// All IDs should be unique
			const ids = items.map((item) => item.id);
			const uniqueIds = new Set(ids);
			expect(uniqueIds.size).toBe(150);
		});

		it("should generate non-colliding IDs even in rapid succession", () => {
			const { result: store } = renderHook(() => usePriceTagsStore());

			act(() => {
				store.current.setItems([
					createTestItem(1, "Test 1", 100),
					createTestItem(2, "Test 2", 200),
					createTestItem(3, "Test 3", 300),
				]);
			});

			// Perform multiple rapid duplications
			const allIds = new Set();

			for (let i = 0; i < 5; i++) {
				act(() => {
					store.current.duplicateItems([1, 2, 3]);
				});

				// Collect all current IDs
				const currentIds = store.current.items.map((item) => item.id);
				currentIds.forEach((id) => allIds.add(id));
			}

			// Should have no ID collisions
			const totalItems = store.current.items.length;
			expect(allIds.size).toBe(totalItems);
			expect(totalItems).toBe(18); // 3 original + 15 duplicated (3 * 5)
		});
	});
});
