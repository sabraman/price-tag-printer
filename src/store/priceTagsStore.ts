import { create } from "zustand";
import { immer } from "zustand/middleware/immer";
import { persist, createJSONStorage } from "zustand/middleware";

export interface Item {
  id: number;
  data: string | number;
  price: number;
  discountPrice: number;
  designType?: string; // 'default', 'new', 'sale' or null for global setting
  hasDiscount?: boolean; // true or false from table column
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
  hasTableDesigns: boolean; // Флаг, указывающий на наличие дизайнов в таблице
  hasTableDiscounts: boolean; // Флаг, указывающий на наличие настроек скидки в таблице
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
  updateItemPrices: () => void;
  addItem: () => void;
  calculateDiscountPrice: (price: number) => number;
  deleteItem: (id: number) => void;
  updateItem: (
    id: number,
    field: "data" | "price" | "designType" | "hasDiscount",
    value: string | number | boolean
  ) => void;
  clearSettings: () => void;
}

export const usePriceTagsStore = create<PriceTagsState>()(
  persist(
    immer((set, get) => ({
      items: [],
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
      },
      currentFont: "Montserrat",
      discountText: "цена при подписке\nна телеграм канал",
      hasTableDesigns: false,
      hasTableDiscounts: false,

      setItems: (items) => {
        set({ items });
        // Пересчитываем скидочные цены сразу после установки новых элементов
        setTimeout(() => {
          usePriceTagsStore.getState().updateItemPrices();
        }, 0);
      },
      setLoading: (loading) => set({ loading }),
      setError: (error) => set({ error }),
      setDesign: (design) => set({ design }),
      setDesignType: (type: string) => set((state) => {
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
            const potentialDiscountPrice = get().calculateDiscountPrice(item.price);
            
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
              item.discountPrice = design 
                ? potentialDiscountPrice
                : item.price;
            }
            // Case 3: Normal global discount mode
            else {
              item.discountPrice = design 
                ? potentialDiscountPrice
                : item.price;
            }
          }
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

      updateItem: (
        id: number,
        field: "data" | "price" | "designType" | "hasDiscount",
        value: string | number | boolean
      ) =>
        set((state) => {
          const item = state.items.find((item) => item.id === id);
          if (item) {
            if (field === "price") {
              item.price = Number(value);
              item.discountPrice = get().calculateDiscountPrice(Number(value));
            } else if (field === "designType") {
              item.designType = String(value);
            } else if (field === "hasDiscount") {
              item.hasDiscount = Boolean(value);
            } else if (field === "data") {
              // Handle data field specifically to avoid type errors
              item.data = value as string | number;
            }
          }
        }),

      clearSettings: () => set((state) => {
        // Reset only the settings that might cause issues when switching between table/global modes
        state.design = false;
        state.designType = "default";
        state.hasTableDesigns = false;
        state.hasTableDiscounts = false;
        return state;
      }),
    })),
    {
      name: "price-tags-storage", // имя для хранилища в localStorage
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        // Указываем, какие части состояния сохранять в localStorage
        items: state.items,
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
        // Не сохраняем временные состояния
        // loading: false,
        // error: null,
        // isEditMode: false
      }),
      onRehydrateStorage: () => {
        // Выполняем действия после восстановления состояния из localStorage
        return (rehydratedState, error) => {
          if (error) {
            console.error("Ошибка при загрузке состояния из localStorage:", error);
          } else if (rehydratedState) {
            // Пересчитываем discountPrice для всех элементов после восстановления из localStorage
            setTimeout(() => {
              const store = usePriceTagsStore.getState();
              store.updateItemPrices();
            }, 0);
          }
        };
      },
    }
  )
);
