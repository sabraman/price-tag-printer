import { create } from "zustand";
import { immer } from "zustand/middleware/immer";

export interface Item {
  id: number;
  data: string | number;
  price: number;
  discountPrice: number;
}

interface PriceTagsState {
  items: Item[];
  loading: boolean;
  error: string | null;
  design: boolean;
  designType: string;
  isEditMode: boolean;
  discountAmount: number;
  maxDiscountPercent: number;
  columnLabels: string[];
  setItems: (items: Item[]) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setDesign: (design: boolean) => void;
  setDesignType: (type: string) => void;
  setIsEditMode: (isEditMode: boolean) => void;
  setDiscountAmount: (amount: number) => void;
  setMaxDiscountPercent: (percent: number) => void;
  setColumnLabels: (labels: string[]) => void;
  updateItemPrices: () => void;
  addItem: () => void;
  calculateDiscountPrice: (price: number) => number;
  deleteItem: (id: number) => void;
  updateItem: (
    id: number,
    field: "data" | "price",
    value: string | number
  ) => void;
}

export const usePriceTagsStore = create<PriceTagsState>()(
  immer((set, get) => ({
    items: [],
    loading: false,
    error: null,
    design: true,
    designType: "default",
    isEditMode: false,
    discountAmount: 100,
    maxDiscountPercent: 5,
    columnLabels: [],

    setItems: (items) => set({ items }),
    setLoading: (loading) => set({ loading }),
    setError: (error) => set({ error }),
    setDesign: (design) => set({ design }),
    setDesignType: (type) => set({ designType: type }),
    setIsEditMode: (isEditMode) => set({ isEditMode }),
    setDiscountAmount: (amount) => set({ discountAmount: amount }),
    setMaxDiscountPercent: (percent) => set({ maxDiscountPercent: percent }),
    setColumnLabels: (labels) => set({ columnLabels: labels }),

    calculateDiscountPrice: (price: number) => {
      const state = get();
      if (!state.design) return price;
      const maxDiscount = price * (state.maxDiscountPercent / 100);
      return Math.ceil(price - Math.min(state.discountAmount, maxDiscount));
    },

    updateItemPrices: () =>
      set((state) => {
        state.items.forEach((item) => {
          item.discountPrice = get().calculateDiscountPrice(item.price);
        });
      }),

    addItem: () =>
      set((state) => {
        state.items.push({
          id: state.items.length + 1,
          data: "",
          price: 0,
          discountPrice: 0,
        });
      }),

    deleteItem: (id: number) =>
      set((state) => {
        state.items = state.items.filter((item) => item.id !== id);
      }),

    updateItem: (id: number, field: "data" | "price", value: string | number) =>
      set((state) => {
        const item = state.items.find((item) => item.id === id);
        if (item) {
          if (field === "price") {
            item.price = Number(value);
            item.discountPrice = get().calculateDiscountPrice(Number(value));
          } else {
            item.data = value;
          }
        }
      }),
  }))
);
