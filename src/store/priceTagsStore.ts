import { create } from "zustand";
import { immer } from "zustand/middleware/immer";

export interface Item {
  id: number;
  data: string | number;
  price: number;
  discountPrice: number;
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
  themes: ThemeSet;
  currentFont: string;
  discountText: string;
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
    design: false,
    designType: "default",
    isEditMode: false,
    discountAmount: 10,
    maxDiscountPercent: 30,
    columnLabels: [],
    themes: {
      default: {
        start: "#222222",
        end: "#dd4c9b",
        textColor: "#ffffff",
      },
      new: {
        start: "#dd4c9b",
        end: "#f6989a",
        textColor: "#ffffff",
      },
      sale: {
        start: "#ee4a61",
        end: "#f6989a",
        textColor: "#ffffff",
      },
    },
    currentFont: "Montserrat",
    discountText: "цена при регистрации\nв приложении",

    setItems: (items) => set({ items }),
    setLoading: (loading) => set({ loading }),
    setError: (error) => set({ error }),
    setDesign: (design) => set({ design }),
    setDesignType: (type) => set({ designType: type }),
    setIsEditMode: (isEditMode) => set({ isEditMode }),
    setDiscountAmount: (amount) => set({ discountAmount: amount }),
    setMaxDiscountPercent: (percent) => set({ maxDiscountPercent: percent }),
    setColumnLabels: (labels) => set({ columnLabels: labels }),
    setThemes: (themes) => set({ themes }),
    setCurrentFont: (font) => set({ currentFont: font }),
    setDiscountText: (text) => set({ discountText: text }),

    calculateDiscountPrice: (price: number) => {
      const state = get();
      if (!state.design) return price;
      const discountedPrice = price - state.discountAmount;
      const discountPercent = ((price - discountedPrice) / price) * 100;
      if (discountPercent > state.maxDiscountPercent) {
        return price - (price * state.maxDiscountPercent) / 100;
      }
      return discountedPrice;
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
          id: Date.now(),
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
