import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";

// Add ID counter to prevent collisions - use a more robust approach
let uniqueIdCounter = 0;
let lastTimestamp = 0;

// Helper function to generate guaranteed unique IDs
const generateUniqueId = (): number => {
	// Get current timestamp in milliseconds
	let timestamp = Date.now();

	// If we're generating IDs too quickly (same millisecond), increment the timestamp
	if (timestamp <= lastTimestamp) {
		timestamp = lastTimestamp + 1;
	}
	lastTimestamp = timestamp;

	// Multiply by 1000 to leave room for counter, then add incremental counter
	const uniqueId = timestamp * 1000 + ++uniqueIdCounter;

	// Reset counter if it gets too large to prevent overflow
	if (uniqueIdCounter > 999) {
		uniqueIdCounter = 0;
	}

	return uniqueId;
};

export interface Item {
	id: number;
	data: string | number;
	price: number;
	discountPrice: number;
	designType?: string; // 'default', 'new', 'sale' or null for global setting
	hasDiscount?: boolean; // true or false from table column
	priceFor2?: number;
	priceFrom3?: number;
}

export interface Theme {
	start: string;
	end: string;
	textColor: string;
}

export interface ThemeSet {
	default: Theme;
	new: Theme;
	sale: Theme;
	white: Theme;
	black: Theme;
	sunset: Theme;
	ocean: Theme;
	forest: Theme;
	royal: Theme;
	vintage: Theme;
	neon: Theme;
	monochrome: Theme;
	silver: Theme;
	charcoal: Theme;
	paper: Theme;
	ink: Theme;
	snow: Theme;
}

interface PriceTagsState {
	items: Item[];
	history: Item[][];
	historyIndex: number;
	loading: boolean;
	error: string | null;
	design: boolean;
	designType: string;
	isEditMode: boolean;
	discountAmount: number;
	maxDiscountPercent: number;
	columnLabels: string[];
	themes: ThemeSet;
	currentFont: string;
	discountText: string;
	hasTableDesigns: boolean; // Флаг, указывающий на наличие дизайнов в таблице
	hasTableDiscounts: boolean; // Флаг, указывающий на наличие настроек скидки в таблице
	showThemeLabels: boolean; // Показывать ли надписи NEW/SALE на ценниках
	cuttingLineColor: string; // Цвет линии отреза
	setItems: (items: Item[]) => void;
	setLoading: (loading: boolean) => void;
	setError: (error: string | null) => void;
	setDesign: (design: boolean) => void;
	setDesignType: (type: string) => void;
	setIsEditMode: (isEditMode: boolean) => void;
	setDiscountAmount: (amount: number) => void;
	setMaxDiscountPercent: (percent: number) => void;
	setColumnLabels: (labels: string[]) => void;
	setThemes: (themes: ThemeSet) => void;
	setCurrentFont: (font: string) => void;
	setDiscountText: (text: string) => void;
	setHasTableDesigns: (has: boolean) => void;
	setHasTableDiscounts: (has: boolean) => void;
	setShowThemeLabels: (show: boolean) => void;
	setCuttingLineColor: (color: string) => void;
	updateItemPrices: () => void;
	addItem: (item: Item) => void;
	calculateDiscountPrice: (price: number) => number;
	deleteItem: (id: number) => void;
	undo: () => void;
	redo: () => void;
	updateItem: (
		id: number,
		field:
			| "data"
			| "price"
			| "designType"
			| "hasDiscount"
			| "priceFor2"
			| "priceFrom3",
		value: string | number | boolean,
	) => void;
	clearSettings: () => void;
	duplicateItems: (idsToDuplicate: number[]) => void;
}

export const usePriceTagsStore = create<PriceTagsState>()(
	persist(
		immer((set, get) => ({
			items: [],
			history: [[]],
			historyIndex: 0,
			loading: false,
			error: null,
			design: false,
			designType: "default",
			isEditMode: false,
			discountAmount: 500,
			maxDiscountPercent: 5,
			columnLabels: [],
			themes: {
				default: {
					start: "#222222",
					end: "#dd4c9b",
					textColor: "#ffffff",
				},
				new: {
					start: "#222222",
					end: "#9cdd4c",
					textColor: "#ffffff",
				},
				sale: {
					start: "#222222",
					end: "#dd4c54",
					textColor: "#ffffff",
				},
				white: {
					start: "#ffffff",
					end: "#ffffff",
					textColor: "#000000",
				},
				black: {
					start: "#000000",
					end: "#000000",
					textColor: "#ffffff",
				},
				sunset: {
					start: "#ff7e5f",
					end: "#feb47b",
					textColor: "#ffffff",
				},
				ocean: {
					start: "#667eea",
					end: "#764ba2",
					textColor: "#ffffff",
				},
				forest: {
					start: "#134e5e",
					end: "#71b280",
					textColor: "#ffffff",
				},
				royal: {
					start: "#4c63d2",
					end: "#9c27b0",
					textColor: "#ffffff",
				},
				vintage: {
					start: "#8b4513",
					end: "#d2b48c",
					textColor: "#ffffff",
				},
				neon: {
					start: "#00ff00",
					end: "#ff00ff",
					textColor: "#000000",
				},
				monochrome: {
					start: "#4a4a4a",
					end: "#888888",
					textColor: "#ffffff",
				},
				silver: {
					start: "#c0c0c0",
					end: "#e8e8e8",
					textColor: "#000000",
				},
				charcoal: {
					start: "#2c2c2c",
					end: "#2c2c2c",
					textColor: "#ffffff",
				},
				paper: {
					start: "#f8f8f8",
					end: "#f0f0f0",
					textColor: "#333333",
				},
				ink: {
					start: "#1a1a1a",
					end: "#1a1a1a",
					textColor: "#ffffff",
				},
				snow: {
					start: "#ffffff",
					end: "#f5f5f5",
					textColor: "#000000",
				},
			},
			currentFont: "montserrat",
			discountText: "цена при подписке\nна телеграм канал",
			hasTableDesigns: false,
			hasTableDiscounts: false,
			showThemeLabels: true,
			cuttingLineColor: "#cccccc",

			setItems: (items) => {
				set((state) => {
					const newHistory = state.history.slice(0, state.historyIndex + 1);
					newHistory.push(items);
					state.history = newHistory;
					state.historyIndex = newHistory.length - 1;
					state.items = items;
				});
				// Пересчитываем скидочные цены сразу после установки новых элементов
				setTimeout(() => {
					usePriceTagsStore.getState().updateItemPrices();
				}, 0);
			},
			undo: () =>
				set((state) => {
					if (state.historyIndex > 0) {
						state.historyIndex--;
						state.items = state.history[state.historyIndex];
					}
				}),
			redo: () =>
				set((state) => {
					if (state.historyIndex < state.history.length - 1) {
						state.historyIndex++;
						state.items = state.history[state.historyIndex];
					}
				}),
			setLoading: (loading) => set({ loading }),
			setError: (error) => set({ error }),
			setDesign: (design) => set({ design }),
			setDesignType: (type: string) =>
				set((state) => {
					// When switching to table mode and we have table discounts
					// make sure we disable the global discount flag to avoid conflicts
					if (type === "table" && state.hasTableDiscounts) {
						state.design = false;
					}
					state.designType = type;
				}),
			setIsEditMode: (isEditMode) => set({ isEditMode }),
			setDiscountAmount: (amount) => set({ discountAmount: amount }),
			setMaxDiscountPercent: (percent) => set({ maxDiscountPercent: percent }),
			setColumnLabels: (labels) => set({ columnLabels: labels }),
			setThemes: (themes) => set({ themes }),
			setCurrentFont: (font) => set({ currentFont: font }),
			setDiscountText: (text) => set({ discountText: text }),
			setHasTableDesigns: (has) => set({ hasTableDesigns: has }),
			setHasTableDiscounts: (has) => set({ hasTableDiscounts: has }),
			setShowThemeLabels: (show) => set({ showThemeLabels: show }),
			setCuttingLineColor: (color) => set({ cuttingLineColor: color }),

			calculateDiscountPrice: (price: number) => {
				const state = get();

				// When design is off, we still calculate but don't actually apply
				const discountedPrice = price - state.discountAmount;
				const discountPercent = ((price - discountedPrice) / price) * 100;

				// Apply max discount percent if needed
				if (discountPercent > state.maxDiscountPercent) {
					return Math.round(price - (price * state.maxDiscountPercent) / 100);
				}

				return Math.round(discountedPrice);
			},

			updateItemPrices: () =>
				set((state) => {
					const { designType, hasTableDiscounts, design } = state;
					const useTableDiscounts = hasTableDiscounts && designType === "table";

					for (const item of state.items) {
						// First calculate the potential discount price (regardless of whether it's shown)
						const potentialDiscountPrice = get().calculateDiscountPrice(
							item.price,
						);

						// Then determine whether to apply it based on settings

						// Case 1: Table discounts enabled + item has specific discount setting
						if (useTableDiscounts && item.hasDiscount !== undefined) {
							item.discountPrice = item.hasDiscount
								? potentialDiscountPrice
								: item.price;
						}
						// Case 2: Table discounts enabled + item has NO specific setting
						else if (useTableDiscounts) {
							// For items without table setting, use the global design flag
							item.discountPrice = design ? potentialDiscountPrice : item.price;
						}
						// Case 3: Normal global discount mode
						else {
							item.discountPrice = design ? potentialDiscountPrice : item.price;
						}
					}
				}),

			addItem: (item: Item) =>
				set((state) => {
					const newItems = [...state.items, item];

					// Update history
					const newHistory = state.history.slice(0, state.historyIndex + 1);
					newHistory.push([...newItems]);
					state.history = newHistory;
					state.historyIndex = newHistory.length - 1;
					state.items = newItems;
				}),

			deleteItem: (id: number) =>
				set((state) => {
					const newItems = state.items.filter((item) => item.id !== id);

					// Update history
					const newHistory = state.history.slice(0, state.historyIndex + 1);
					newHistory.push([...newItems]);
					state.history = newHistory;
					state.historyIndex = newHistory.length - 1;
					state.items = newItems;
				}),

			updateItem: (
				id: number,
				field:
					| "data"
					| "price"
					| "designType"
					| "hasDiscount"
					| "priceFor2"
					| "priceFrom3",
				value: string | number | boolean,
			) =>
				set((state) => {
					const newItems = [...state.items];
					const item = newItems.find((item) => item.id === id);
					if (item) {
						if (field === "price") {
							item.price = Number(value);
							item.discountPrice = get().calculateDiscountPrice(Number(value));
						} else if (field === "designType") {
							item.designType =
								String(value) === "" ? undefined : String(value);
						} else if (field === "hasDiscount") {
							item.hasDiscount = Boolean(value);
						} else if (field === "data") {
							// Handle data field specifically to avoid type errors
							item.data = value as string | number;
						} else if (field === "priceFor2") {
							item.priceFor2 = Number(value);
						} else if (field === "priceFrom3") {
							item.priceFrom3 = Number(value);
						}

						// Update history
						const newHistory = state.history.slice(0, state.historyIndex + 1);
						newHistory.push([...newItems]);
						state.history = newHistory;
						state.historyIndex = newHistory.length - 1;
						state.items = newItems;
					}
				}),

			// Enhanced duplication with proper ID generation and history management
			duplicateItems: (idsToDuplicate: number[]) =>
				set((state) => {
					if (idsToDuplicate.length === 0) return;

					const itemsToDuplicate = state.items.filter((item) =>
						idsToDuplicate.includes(item.id),
					);

					if (itemsToDuplicate.length === 0) return;

					// Generate truly unique IDs using timestamp + incremental counter
					const duplicatedItems = itemsToDuplicate.map((item) => {
						const uniqueId = generateUniqueId();
						return {
							...item,
							id: uniqueId,
							data: item.data, // Remove the copy suffix
						};
					});

					const newItems = [...state.items, ...duplicatedItems];

					// Update history properly
					const newHistory = state.history.slice(0, state.historyIndex + 1);
					newHistory.push([...newItems]);
					state.history = newHistory;
					state.historyIndex = newHistory.length - 1;
					state.items = newItems;
				}),

			clearSettings: () =>
				set((state) => {
					// Reset only the settings that might cause issues when switching between table/global modes
					state.design = false;
					state.designType = "default";
					state.hasTableDesigns = false;
					state.hasTableDiscounts = false;
					state.showThemeLabels = true;
					return state;
				}),
		})),
		{
			name: "price-tags-storage", // имя для хранилища в localStorage
			storage: createJSONStorage(() => localStorage),
			partialize: (state) => ({
				// Указываем, какие части состояния сохранять в localStorage
				items: state.items,
				history: state.history,
				historyIndex: state.historyIndex,
				design: state.design,
				designType: state.designType,
				discountAmount: state.discountAmount,
				maxDiscountPercent: state.maxDiscountPercent,
				columnLabels: state.columnLabels,
				themes: state.themes,
				currentFont: state.currentFont,
				discountText: state.discountText,
				hasTableDesigns: state.hasTableDesigns,
				hasTableDiscounts: state.hasTableDiscounts,
				showThemeLabels: state.showThemeLabels,
				// Не сохраняем временные состояния
				// loading: false,
				// error: null,
				// isEditMode: false
			}),
			onRehydrateStorage: () => {
				// Выполняем действия после восстановления состояния из localStorage
				return (rehydratedState, error) => {
					if (error) {
						// localStorage rehydration error - silently continue
					} else if (rehydratedState) {
						// Пересчитываем discountPrice для всех элементов после восстановления из localStorage
						setTimeout(() => {
							const store = usePriceTagsStore.getState();
							store.updateItemPrices();
						}, 0);
					}
				};
			},
		},
	),
);
