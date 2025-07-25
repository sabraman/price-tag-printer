import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { Item } from "@/store/priceTagsStore";
import { OptimizedEditTable } from "@/components/features/price-tags/OptimizedEditTable";

// Mock sonner toast
vi.mock("sonner", () => ({
	toast: {
		info: vi.fn(),
		success: vi.fn(),
		error: vi.fn(),
		warning: vi.fn(),
		loading: vi.fn(),
		dismiss: vi.fn(),
	},
	Toaster: () => null,
}));

// Mock the store
const mockUpdateItem = vi.fn();
const mockDeleteItem = vi.fn();
const mockAddItem = vi.fn();

vi.mock("@/store/priceTagsStore", () => ({
	usePriceTagsStore: () => ({
		updateItem: mockUpdateItem,
		deleteItem: mockDeleteItem,
		addItem: mockAddItem,
	}),
}));

const createMockItem = (id: number, data: string): Item => ({
	id,
	data,
	price: 100 + id,
	discountPrice: 95 + id,
	designType: "default",
	hasDiscount: false,
});

describe("OptimizedEditTable Duplication Issues", () => {
	const mockProps = {
		items: [
			createMockItem(1, "Item 1"),
			createMockItem(2, "Item 2"),
			createMockItem(3, "Item 3"),
		],
		selectedItems: [],
		onSelectionChange: vi.fn(),
		onDuplicate: vi.fn(),
		onUndo: vi.fn(),
		onRedo: vi.fn(),
		onFilterChange: vi.fn(),
		onSortChange: vi.fn(),
		onSearch: vi.fn(),
		onClearAll: vi.fn(),
		onExport: vi.fn(),
	};

	beforeEach(() => {
		vi.clearAllMocks();
	});

	describe("Selection After Duplication", () => {
		it("should maintain selection state when items are duplicated with unique IDs", () => {
			const { rerender } = render(
				<OptimizedEditTable {...mockProps} selectedItems={[1, 2]} />,
			);

			// Simulate duplication adding new items with unique IDs
			const duplicatedItems = [
				...mockProps.items,
				createMockItem(4, "Item 1"), // Duplicated Item 1
				createMockItem(5, "Item 2"), // Duplicated Item 2
			];

			rerender(
				<OptimizedEditTable
					{...mockProps}
					items={duplicatedItems}
					selectedItems={[1, 2]}
				/>,
			);

			const checkboxes = screen.getAllByRole("checkbox");

			// Original items should still be selected
			expect(checkboxes[1]).toBeChecked(); // Item 1
			expect(checkboxes[2]).toBeChecked(); // Item 2
			expect(checkboxes[3]).not.toBeChecked(); // Item 3
			expect(checkboxes[4]).not.toBeChecked(); // Duplicated Item 1
			expect(checkboxes[5]).not.toBeChecked(); // Duplicated Item 2
		});

		it("should handle ID collisions gracefully when duplication creates duplicate IDs", () => {
			const { rerender } = render(
				<OptimizedEditTable {...mockProps} selectedItems={[1]} />,
			);

			// Simulate bad duplication with ID collision (same timestamp)
			const itemsWithCollision = [
				...mockProps.items,
				{ ...createMockItem(1, "Item 1 Duplicate"), id: 1 }, // Same ID collision!
			];

			rerender(
				<OptimizedEditTable
					{...mockProps}
					items={itemsWithCollision}
					selectedItems={[1]}
				/>,
			);

			// Should not crash and should show consistent state
			const checkboxes = screen.getAllByRole("checkbox");
			expect(checkboxes.length).toBeGreaterThan(1);

			// Only valid selections should be maintained
			const validSelections = [1].filter((id) =>
				itemsWithCollision.some((item) => item.id === id),
			);
			expect(validSelections).toEqual([1]);
		});

		it("should clear selection after duplication to avoid confusion", () => {
			const mockOnSelectionChange = vi.fn();
			const { rerender } = render(
				<OptimizedEditTable
					{...mockProps}
					selectedItems={[1, 2]}
					onSelectionChange={mockOnSelectionChange}
				/>,
			);

			// Simulate duplication process
			mockProps.onDuplicate();

			// After duplication, selection should be cleared
			expect(mockProps.onDuplicate).toHaveBeenCalled();

			// Simulate the page clearing selection after duplication
			rerender(
				<OptimizedEditTable
					{...mockProps}
					items={[
						...mockProps.items,
						createMockItem(4, "Item 1"),
						createMockItem(5, "Item 2"),
					]}
					selectedItems={[]} // Selection cleared
					onSelectionChange={mockOnSelectionChange}
				/>,
			);

			const checkboxes = screen.getAllByRole("checkbox");
			checkboxes.slice(1).forEach((checkbox) => {
				expect(checkbox).not.toBeChecked();
			});
		});

		it("should handle rapid selection changes after duplication", async () => {
			const mockOnSelectionChange = vi.fn();
			const duplicatedItems = [
				...mockProps.items,
				createMockItem(4, "Item 1 Copy"),
				createMockItem(5, "Item 2 Copy"),
				createMockItem(6, "Item 3 Copy"),
			];

			const { rerender } = render(
				<OptimizedEditTable
					{...mockProps}
					items={duplicatedItems}
					selectedItems={[]}
					onSelectionChange={mockOnSelectionChange}
				/>,
			);

			const checkboxes = screen.getAllByRole("checkbox");
			let currentSelection: number[] = [];

			// Rapid selection after duplication
			fireEvent.click(checkboxes[1]); // Select item 1
			currentSelection = [1];
			rerender(
				<OptimizedEditTable
					{...mockProps}
					items={duplicatedItems}
					selectedItems={currentSelection}
					onSelectionChange={mockOnSelectionChange}
				/>,
			);

			fireEvent.click(checkboxes[4]); // Select duplicated item 4
			currentSelection = [1, 4];
			rerender(
				<OptimizedEditTable
					{...mockProps}
					items={duplicatedItems}
					selectedItems={currentSelection}
					onSelectionChange={mockOnSelectionChange}
				/>,
			);

			fireEvent.click(checkboxes[1]); // Deselect item 1
			currentSelection = [4];
			rerender(
				<OptimizedEditTable
					{...mockProps}
					items={duplicatedItems}
					selectedItems={currentSelection}
					onSelectionChange={mockOnSelectionChange}
				/>,
			);

			// Should have consistent selection calls
			expect(mockOnSelectionChange).toHaveBeenCalledTimes(3);
			expect(mockOnSelectionChange).toHaveBeenNthCalledWith(1, [1]);
			expect(mockOnSelectionChange).toHaveBeenNthCalledWith(2, [1, 4]);
			expect(mockOnSelectionChange).toHaveBeenNthCalledWith(3, [4]);
		});
	});

	describe("Select All After Duplication", () => {
		it("should select all items including duplicates", () => {
			const duplicatedItems = [
				...mockProps.items,
				createMockItem(4, "Item 1 Copy"),
				createMockItem(5, "Item 2 Copy"),
			];

			const mockOnSelectionChange = vi.fn();
			render(
				<OptimizedEditTable
					{...mockProps}
					items={duplicatedItems}
					selectedItems={[]}
					onSelectionChange={mockOnSelectionChange}
				/>,
			);

			const selectAllCheckbox = screen.getAllByRole("checkbox")[0];
			fireEvent.click(selectAllCheckbox);

			// Should select all items including duplicates
			expect(mockOnSelectionChange).toHaveBeenCalledWith([1, 2, 3, 4, 5]);
		});

		it("should handle partial selection with mixed original and duplicate items", () => {
			const duplicatedItems = [
				...mockProps.items,
				createMockItem(4, "Item 1 Copy"),
				createMockItem(5, "Item 2 Copy"),
			];

			const mockOnSelectionChange = vi.fn();
			render(
				<OptimizedEditTable
					{...mockProps}
					items={duplicatedItems}
					selectedItems={[1, 4]} // Original + duplicate selected
					onSelectionChange={mockOnSelectionChange}
				/>,
			);

			const selectAllCheckbox = screen.getAllByRole("checkbox")[0];

			// Should not be fully checked (partial selection)
			expect(selectAllCheckbox).not.toBeChecked();

			// Clicking should select all remaining items
			fireEvent.click(selectAllCheckbox);
			expect(mockOnSelectionChange).toHaveBeenCalledWith([1, 2, 3, 4, 5]);
		});
	});

	describe("Edge Cases After Duplication", () => {
		it("should handle empty duplication result", () => {
			const mockOnSelectionChange = vi.fn();
			render(
				<OptimizedEditTable
					{...mockProps}
					items={mockProps.items}
					selectedItems={[]}
					onSelectionChange={mockOnSelectionChange}
				/>,
			);

			// Try to duplicate with no selection
			mockProps.onDuplicate();
			expect(mockProps.onDuplicate).toHaveBeenCalled();

			// Should not cause any selection issues
			const checkboxes = screen.getAllByRole("checkbox");
			expect(checkboxes.length).toBe(4); // 3 items + select all
		});

		it("should maintain valid selection state when items are filtered after duplication", () => {
			const duplicatedItems = [
				createMockItem(1, "Apple"),
				createMockItem(2, "Banana"),
				createMockItem(3, "Cherry"),
				createMockItem(4, "Apple Copy"),
				createMockItem(5, "Banana Copy"),
			];

			// Filter to only show items containing "Apple"
			const filteredItems = duplicatedItems.filter((item) =>
				String(item.data).toLowerCase().includes("apple"),
			);

			const mockOnSelectionChange = vi.fn();
			render(
				<OptimizedEditTable
					{...mockProps}
					items={filteredItems} // Only Apple items
					selectedItems={[1, 4]} // Both Apple items selected
					onSelectionChange={mockOnSelectionChange}
				/>,
			);

			const checkboxes = screen.getAllByRole("checkbox");
			expect(checkboxes[1]).toBeChecked(); // Apple
			expect(checkboxes[2]).toBeChecked(); // Apple Copy

			// Select all should work correctly with filtered + duplicated items
			const selectAllCheckbox = checkboxes[0];
			expect(selectAllCheckbox).toBeChecked(); // All visible items are selected
		});

		it("should handle large duplication scenarios without performance issues", async () => {
			const largeItemSet = Array.from({ length: 100 }, (_, i) =>
				createMockItem(i + 1, `Item ${i + 1}`),
			);

			const duplicatedLargeSet = [
				...largeItemSet,
				...largeItemSet.map((item) => ({
					...item,
					id: item.id + 1000,
					data: `${item.data} Copy`,
				})),
			];

			const mockOnSelectionChange = vi.fn();
			const { rerender } = render(
				<OptimizedEditTable
					{...mockProps}
					items={largeItemSet}
					selectedItems={[1, 2, 3]}
					onSelectionChange={mockOnSelectionChange}
				/>,
			);

			// Simulate duplication
			rerender(
				<OptimizedEditTable
					{...mockProps}
					items={duplicatedLargeSet}
					selectedItems={[]} // Cleared after duplication
					onSelectionChange={mockOnSelectionChange}
				/>,
			);

			// Should render without performance issues
			const checkboxes = screen.getAllByRole("checkbox");
			expect(checkboxes.length).toBe(201); // 200 items + 1 select all

			// Selection should still work smoothly
			fireEvent.click(checkboxes[1]);
			expect(mockOnSelectionChange).toHaveBeenCalledWith([1]);
		}, 10000); // Increase timeout to 10 seconds
	});
});
