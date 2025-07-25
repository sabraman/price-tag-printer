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
vi.mock("@/store/priceTagsStore", () => ({
	usePriceTagsStore: () => ({
		updateItem: vi.fn(),
		deleteItem: vi.fn(),
		addItem: vi.fn(),
	}),
}));

const mockItems: Item[] = [
	{
		id: 1,
		data: "Item 1",
		price: 100,
		discountPrice: 95,
		designType: "default",
		hasDiscount: false,
	},
	{
		id: 2,
		data: "Item 2",
		price: 200,
		discountPrice: 190,
		designType: "new",
		hasDiscount: true,
	},
	{
		id: 3,
		data: "Item 3",
		price: 300,
		discountPrice: 285,
		designType: "sale",
		hasDiscount: false,
	},
];

describe("OptimizedEditTable Selection Logic", () => {
	const mockProps = {
		items: mockItems,
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

	describe("Individual Item Selection", () => {
		it("should select an item when clicking its checkbox", () => {
			render(<OptimizedEditTable {...mockProps} />);

			const checkbox = screen.getAllByRole("checkbox")[1]; // First item checkbox (skip select-all)
			fireEvent.click(checkbox);

			expect(mockProps.onSelectionChange).toHaveBeenCalledWith([1]);
		});

		it("should unselect an item when clicking its checkbox again", () => {
			const propsWithSelection = { ...mockProps, selectedItems: [1] };
			render(<OptimizedEditTable {...propsWithSelection} />);

			const checkbox = screen.getAllByRole("checkbox")[1];
			fireEvent.click(checkbox);

			expect(mockProps.onSelectionChange).toHaveBeenCalledWith([]);
		});

		it("should add to existing selection when selecting multiple items", () => {
			const propsWithSelection = { ...mockProps, selectedItems: [1] };
			render(<OptimizedEditTable {...propsWithSelection} />);

			const secondCheckbox = screen.getAllByRole("checkbox")[2]; // Second item
			fireEvent.click(secondCheckbox);

			expect(mockProps.onSelectionChange).toHaveBeenCalledWith([1, 2]);
		});

		it("should remove only the clicked item from selection", () => {
			const propsWithSelection = { ...mockProps, selectedItems: [1, 2, 3] };
			render(<OptimizedEditTable {...propsWithSelection} />);

			const secondCheckbox = screen.getAllByRole("checkbox")[2]; // Second item
			fireEvent.click(secondCheckbox);

			expect(mockProps.onSelectionChange).toHaveBeenCalledWith([1, 3]);
		});

		it("should not duplicate items in selection", () => {
			const propsWithSelection = { ...mockProps, selectedItems: [1] };
			render(<OptimizedEditTable {...propsWithSelection} />);

			const firstCheckbox = screen.getAllByRole("checkbox")[1];
			fireEvent.click(firstCheckbox); // Should uncheck, not duplicate

			expect(mockProps.onSelectionChange).toHaveBeenCalledWith([]);
		});
	});

	describe("Select All Functionality", () => {
		it("should select all items when clicking select-all checkbox", () => {
			render(<OptimizedEditTable {...mockProps} />);

			const selectAllCheckbox = screen.getAllByRole("checkbox")[0];
			fireEvent.click(selectAllCheckbox);

			expect(mockProps.onSelectionChange).toHaveBeenCalledWith([1, 2, 3]);
		});

		it("should deselect all items when clicking select-all checkbox with all selected", () => {
			const propsWithAllSelected = { ...mockProps, selectedItems: [1, 2, 3] };
			render(<OptimizedEditTable {...propsWithAllSelected} />);

			const selectAllCheckbox = screen.getAllByRole("checkbox")[0];
			fireEvent.click(selectAllCheckbox);

			expect(mockProps.onSelectionChange).toHaveBeenCalledWith([]);
		});

		it("should select all items when clicking select-all with partial selection", () => {
			const propsWithPartialSelection = { ...mockProps, selectedItems: [1] };
			render(<OptimizedEditTable {...propsWithPartialSelection} />);

			const selectAllCheckbox = screen.getAllByRole("checkbox")[0];
			fireEvent.click(selectAllCheckbox);

			expect(mockProps.onSelectionChange).toHaveBeenCalledWith([1, 2, 3]);
		});
	});

	describe("Selection State Consistency", () => {
		it("should show correct checkbox states for selected items", () => {
			const propsWithSelection = { ...mockProps, selectedItems: [1, 3] };
			render(<OptimizedEditTable {...propsWithSelection} />);

			const checkboxes = screen.getAllByRole("checkbox");

			// Select-all should be unchecked (partial selection)
			expect(checkboxes[0]).not.toBeChecked();

			// Item 1 should be checked
			expect(checkboxes[1]).toBeChecked();

			// Item 2 should be unchecked
			expect(checkboxes[2]).not.toBeChecked();

			// Item 3 should be checked
			expect(checkboxes[3]).toBeChecked();
		});

		it("should show select-all as checked when all items are selected", () => {
			const propsWithAllSelected = { ...mockProps, selectedItems: [1, 2, 3] };
			render(<OptimizedEditTable {...propsWithAllSelected} />);

			const selectAllCheckbox = screen.getAllByRole("checkbox")[0];
			expect(selectAllCheckbox).toBeChecked();
		});
	});

	describe("Edge Cases", () => {
		it("should handle empty items array", () => {
			const emptyProps = { ...mockProps, items: [] };
			render(<OptimizedEditTable {...emptyProps} />);

			const selectAllCheckbox = screen.getAllByRole("checkbox")[0];
			fireEvent.click(selectAllCheckbox);

			expect(mockProps.onSelectionChange).toHaveBeenCalledWith([]);
		});

		it("should handle invalid selected items (items that dont exist)", () => {
			const propsWithInvalidSelection = {
				...mockProps,
				selectedItems: [1, 999],
			};
			render(<OptimizedEditTable {...propsWithInvalidSelection} />);

			// Should not crash and should show only valid selections
			const checkboxes = screen.getAllByRole("checkbox");
			expect(checkboxes[1]).toBeChecked(); // Item 1 exists
			expect(checkboxes[2]).not.toBeChecked(); // Item 2 not selected
		});

		it("should handle rapid clicking without race conditions", () => {
			const { rerender } = render(<OptimizedEditTable {...mockProps} />);

			const checkbox = screen.getAllByRole("checkbox")[1];

			// Simulate rapid clicks with proper state updates
			let currentSelection: number[] = [];

			// First click - should select
			fireEvent.click(checkbox);
			currentSelection = [1]; // Simulate state update
			rerender(
				<OptimizedEditTable {...mockProps} selectedItems={currentSelection} />,
			);

			// Second click - should deselect
			fireEvent.click(checkbox);
			currentSelection = []; // Simulate state update
			rerender(
				<OptimizedEditTable {...mockProps} selectedItems={currentSelection} />,
			);

			// Third click - should select again
			fireEvent.click(checkbox);
			currentSelection = [1]; // Simulate state update
			rerender(
				<OptimizedEditTable {...mockProps} selectedItems={currentSelection} />,
			);

			// After 3 clicks (odd number), item should be selected
			const calls = mockProps.onSelectionChange.mock.calls;
			expect(calls[calls.length - 1][0]).toEqual([1]); // Access first argument
			expect(calls.length).toBe(3);
			expect(calls[0][0]).toEqual([1]); // First click: select
			expect(calls[1][0]).toEqual([]); // Second click: deselect
			expect(calls[2][0]).toEqual([1]); // Third click: select
		});
	});
});
