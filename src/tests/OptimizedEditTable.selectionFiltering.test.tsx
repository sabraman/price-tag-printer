import { fireEvent, render, screen, waitFor } from "@testing-library/react";
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
	usePriceTagsStore: vi.fn(() => ({
		updateItem: vi.fn(),
		deleteItem: vi.fn(),
		addItem: vi.fn(),
	})),
}));

describe("OptimizedEditTable Selection Filtering Issues", () => {
	const mockItems: Item[] = [
		{
			id: 1,
			data: "Item 1",
			price: 100,
			designType: "default",
			hasDiscount: false,
			discountPrice: 0,
		},
		{
			id: 2,
			data: "Item 2",
			price: 200,
			designType: "new",
			hasDiscount: true,
			discountPrice: 180,
		},
		{
			id: 3,
			data: "Item 3",
			price: 300,
			designType: "sale",
			hasDiscount: false,
			discountPrice: 0,
		},
		{
			id: 100,
			data: "Item 1",
			price: 100,
			designType: "default",
			hasDiscount: false,
			discountPrice: 0,
		},
		{
			id: 101,
			data: "Item 2",
			price: 200,
			designType: "new",
			hasDiscount: true,
			discountPrice: 180,
		},
	];

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

	it("should handle selection when items are filtered", () => {
		// Start with all items selected
		const allSelectedProps = {
			...mockProps,
			selectedItems: [1, 2, 3, 100, 101],
		};

		const { rerender } = render(<OptimizedEditTable {...allSelectedProps} />);

		// Simulate filtering - only showing items 1, 2, 3 (removing duplicated items)
		const filteredProps = {
			...mockProps,
			items: mockItems.slice(0, 3), // Only original 3 items
			selectedItems: [1, 2, 3, 100, 101], // Selection still includes filtered out items
		};

		rerender(<OptimizedEditTable {...filteredProps} />);

		// The component should automatically clean selection to only valid items
		expect(filteredProps.onSelectionChange).toHaveBeenCalledWith([1, 2, 3]);
	});

	it("should validate selection against filtered items during individual item selection", () => {
		// Start with filtered items (only first 3)
		const filteredProps = {
			...mockProps,
			items: mockItems.slice(0, 3),
			selectedItems: [1, 100], // 100 doesn't exist in filtered items
		};

		render(<OptimizedEditTable {...filteredProps} />);

		// Try to select item 2
		const item2Checkbox = screen.getAllByRole("checkbox")[2]; // Index 1 is select all, 2 is first item
		fireEvent.click(item2Checkbox);

		// Should only include valid items (1, 2) and filter out invalid (100)
		expect(filteredProps.onSelectionChange).toHaveBeenCalledWith([1, 2]);
	});

	it("should handle select all with filtered items correctly", () => {
		const filteredProps = {
			...mockProps,
			items: mockItems.slice(0, 3), // Only first 3 items
			selectedItems: [1, 100, 101], // Includes items not in filtered view
		};

		render(<OptimizedEditTable {...filteredProps} />);

		// Click select all
		const selectAllCheckbox = screen.getAllByRole("checkbox")[0];
		fireEvent.click(selectAllCheckbox);

		// Should select only the filtered items
		expect(filteredProps.onSelectionChange).toHaveBeenCalledWith([1, 2, 3]);
	});

	it("should handle deselect all with orphaned selections", () => {
		const filteredProps = {
			...mockProps,
			items: mockItems.slice(0, 3),
			selectedItems: [1, 2, 100, 101], // Mix of valid and invalid selections
		};

		render(<OptimizedEditTable {...filteredProps} />);

		// Click select all to deselect
		const selectAllCheckbox = screen.getAllByRole("checkbox")[0];
		fireEvent.click(selectAllCheckbox);

		// Should deselect all
		expect(filteredProps.onSelectionChange).toHaveBeenCalledWith([]);
	});

	it("should prevent orphaned selections from affecting bulk actions", () => {
		const filteredProps = {
			...mockProps,
			items: mockItems.slice(0, 2), // Only first 2 items
			selectedItems: [1, 100, 101], // 1 valid, 2 invalid
		};

		render(<OptimizedEditTable {...filteredProps} />);

		// Bulk actions should only work with valid selections
		// The selection bar should show "Выбрано товаров: 1 из 2"
		expect(screen.getByText(/Выбрано товаров: 1 из 2/)).toBeInTheDocument();
	});

	it("should clean selection when switching from filtered to unfiltered view", async () => {
		// Start with filtered view
		const filteredProps = {
			...mockProps,
			items: mockItems.slice(0, 3),
			selectedItems: [1, 2],
		};

		const { rerender } = render(<OptimizedEditTable {...filteredProps} />);

		// Switch to unfiltered view (showing all items including duplicates)
		const unfiltered = {
			...mockProps,
			items: mockItems, // All items
			selectedItems: [1, 2], // Previous selection
		};

		rerender(<OptimizedEditTable {...unfiltered} />);

		// Selection should remain valid since items 1,2 exist in unfiltered view
		await waitFor(() => {
			// No selection change should be triggered since 1,2 are still valid
			expect(unfiltered.onSelectionChange).not.toHaveBeenCalled();
		});
	});
});
