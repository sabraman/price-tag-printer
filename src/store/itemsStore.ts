import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";

// Improved unique ID generation
export const generateUniqueId = (): number => {
	return Date.now() + Math.random() * 1000;
};

export interface Item {
	id: number;
	data: string | number;
	price: number;
	discountPrice: number;
	designType?: string;
	hasDiscount?: boolean;
	priceFor2?: number;
	priceFrom3?: number;
}

interface ItemsState {
	items: Item[];
	history: Item[][];
	historyIndex: number;
	columnLabels: string[];

	// Actions
	setItems: (items: Item[]) => void;
	addItem: (item: Item) => void;
	updateItem: (
		id: number,
		field: keyof Item,
		value: string | number | boolean,
	) => void;
	deleteItem: (id: number) => void;
	duplicateItems: (idsToDuplicate: number[]) => void;
	setColumnLabels: (labels: string[]) => void;
	undo: () => void;
	redo: () => void;
	clearItems: () => void;
}

const updateHistory = (state: ItemsState) => {
	const newHistory = state.history.slice(0, state.historyIndex + 1);
	newHistory.push([...state.items]);
	state.history = newHistory;
	state.historyIndex = newHistory.length - 1;
};

export const useItemsStore = create<ItemsState>()(
	persist(
		immer((set) => ({
			items: [],
			history: [[]],
			historyIndex: 0,
			columnLabels: [],

			setItems: (items) => {
				set((state) => {
					state.items = items;
					updateHistory(state);
				});
			},

			addItem: (item) => {
				set((state) => {
					const newItem = { ...item, id: generateUniqueId() };
					state.items.push(newItem);
					updateHistory(state);
				});
			},

			updateItem: (id, field, value) => {
				set((state) => {
					const item = state.items.find((item) => item.id === id);
					if (item) {
						if (field === "price") {
							item.price = Number(value);
						} else if (field === "designType") {
							item.designType =
								String(value) === "" ? undefined : String(value);
						} else if (field === "hasDiscount") {
							item.hasDiscount = Boolean(value);
						} else if (field === "data") {
							item.data = value as string | number;
						} else if (field === "priceFor2") {
							item.priceFor2 = Number(value);
						} else if (field === "priceFrom3") {
							item.priceFrom3 = Number(value);
						}
						updateHistory(state);
					}
				});
			},

			deleteItem: (id) => {
				set((state) => {
					state.items = state.items.filter((item) => item.id !== id);
					updateHistory(state);
				});
			},

			duplicateItems: (idsToDuplicate) => {
				set((state) => {
					if (idsToDuplicate.length === 0) return;

					const itemsToDuplicate = state.items.filter((item) =>
						idsToDuplicate.includes(item.id),
					);

					if (itemsToDuplicate.length === 0) return;

					const duplicatedItems = itemsToDuplicate.map((item) => ({
						...item,
						id: generateUniqueId(),
					}));

					state.items.push(...duplicatedItems);
					updateHistory(state);
				});
			},

			setColumnLabels: (labels) => {
				set({ columnLabels: labels });
			},

			undo: () => {
				set((state) => {
					if (state.historyIndex > 0) {
						state.historyIndex--;
						state.items = [...state.history[state.historyIndex]];
					}
				});
			},

			redo: () => {
				set((state) => {
					if (state.historyIndex < state.history.length - 1) {
						state.historyIndex++;
						state.items = [...state.history[state.historyIndex]];
					}
				});
			},

			clearItems: () => {
				set((state) => {
					state.items = [];
					state.history = [[]];
					state.historyIndex = 0;
				});
			},
		})),
		{
			name: "items-storage",
			storage: createJSONStorage(() => localStorage),
			partialize: (state) => ({
				items: state.items,
				history: state.history,
				historyIndex: state.historyIndex,
				columnLabels: state.columnLabels,
			}),
		},
	),
);
