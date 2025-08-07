import { useEffect } from "react";
import { useItemsStore, type Item } from "@/store/itemsStore";
import { useSettingsStore } from "@/store/settingsStore";
import { useUIStore } from "@/store/uiStore";
import { PriceCalculationService } from "@/services/priceCalculationService";

/**
 * Combined hook that provides all store functionality with automatic price updates
 */
export const usePriceTagStore = () => {
	// Store hooks
	const itemsStore = useItemsStore();
	const settingsStore = useSettingsStore();
	const uiStore = useUIStore();

	// Auto-update prices when settings change
	useEffect(() => {
		const updatedItems = PriceCalculationService.updateItemPrices({
			items: itemsStore.items,
			discountSettings: {
				discountAmount: settingsStore.discountAmount,
				maxDiscountPercent: settingsStore.maxDiscountPercent,
			},
			design: settingsStore.design,
			designType: settingsStore.designType,
			hasTableDiscounts: settingsStore.hasTableDiscounts,
		});

		// Only update if prices actually changed
		const hasChanges = updatedItems.some((item, index) => 
			itemsStore.items[index] && item.discountPrice !== itemsStore.items[index].discountPrice
		);

		if (hasChanges) {
			// Update items without creating history entry for price recalculation
			useItemsStore.setState((state) => ({
				...state,
				items: updatedItems,
			}));
		}
	}, [
		settingsStore.discountAmount,
		settingsStore.maxDiscountPercent,
		settingsStore.design,
		settingsStore.designType,
		settingsStore.hasTableDiscounts,
		itemsStore.items.length, // Only recalculate when items count changes
	]);

	// Enhanced actions that combine multiple stores
	const enhancedActions = {
		// Item actions with price calculation
		addItemWithPriceCalc: (item: Omit<Item, 'id' | 'discountPrice'>) => {
			const discountPrice = PriceCalculationService.calculateDiscountPrice(
				item.price,
				{
					discountAmount: settingsStore.discountAmount,
					maxDiscountPercent: settingsStore.maxDiscountPercent,
				}
			);

			itemsStore.addItem({
				...item,
				discountPrice: settingsStore.design ? discountPrice : item.price,
			} as Item);
		},

		// Update item with automatic price recalculation
		updateItemWithPriceCalc: (id: number, field: keyof Item, value: string | number | boolean) => {
			itemsStore.updateItem(id, field, value);
			
			// If price was updated, recalculate discount price
			if (field === 'price') {
				const item = itemsStore.items.find(item => item.id === id);
				if (item) {
					const discountPrice = PriceCalculationService.calculateDiscountPrice(
						Number(value),
						{
							discountAmount: settingsStore.discountAmount,
							maxDiscountPercent: settingsStore.maxDiscountPercent,
						}
					);
					
					// Update discount price based on current settings
					const finalDiscountPrice = settingsStore.hasTableDiscounts && settingsStore.designType === 'table'
						? (item.hasDiscount !== undefined 
							? (item.hasDiscount ? discountPrice : Number(value))
							: (settingsStore.design ? discountPrice : Number(value)))
						: (settingsStore.design ? discountPrice : Number(value));

					itemsStore.updateItem(id, 'discountPrice', finalDiscountPrice);
				}
			}
		},

		// Bulk operations
		duplicateSelectedItems: () => {
			if (uiStore.selectedItems.length > 0) {
				itemsStore.duplicateItems(uiStore.selectedItems);
				uiStore.clearSelection();
			}
		},

		deleteSelectedItems: () => {
			uiStore.selectedItems.forEach((id) => {
				itemsStore.deleteItem(id);
			});
			uiStore.clearSelection();
		},

		// Settings with automatic price recalculation
		updateDiscountSettings: (discountAmount?: number, maxDiscountPercent?: number) => {
			if (discountAmount !== undefined) {
				settingsStore.setDiscountAmount(discountAmount);
			}
			if (maxDiscountPercent !== undefined) {
				settingsStore.setMaxDiscountPercent(maxDiscountPercent);
			}
		},

		// Reset all stores
		resetAll: () => {
			itemsStore.clearItems();
			settingsStore.resetSettings();
			uiStore.resetUI();
		},
	};

	return {
		// Store states
		items: itemsStore.items,
		settings: {
			design: settingsStore.design,
			designType: settingsStore.designType,
			themes: settingsStore.themes,
			currentFont: settingsStore.currentFont,
			discountAmount: settingsStore.discountAmount,
			maxDiscountPercent: settingsStore.maxDiscountPercent,
			discountText: settingsStore.discountText,
			hasTableDesigns: settingsStore.hasTableDesigns,
			hasTableDiscounts: settingsStore.hasTableDiscounts,
		},
		ui: {
			loading: uiStore.loading,
			error: uiStore.error,
			isEditMode: uiStore.isEditMode,
			selectedItems: uiStore.selectedItems,
			searchQuery: uiStore.searchQuery,
			currentFilter: uiStore.currentFilter,
		},
		history: {
			canUndo: itemsStore.historyIndex > 0,
			canRedo: itemsStore.historyIndex < itemsStore.history.length - 1,
		},

		// Individual store actions
		items: itemsStore,
		settingsActions: settingsStore,
		uiActions: uiStore,

		// Enhanced combined actions
		...enhancedActions,
	};
};