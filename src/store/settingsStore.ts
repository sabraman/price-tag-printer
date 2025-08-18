import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

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

interface SettingsState {
	// Design settings
	design: boolean;
	designType: string;
	themes: ThemeSet;
	currentFont: string;

	// Discount settings
	discountAmount: number;
	maxDiscountPercent: number;
	discountText: string;

	// Table mode flags
	hasTableDesigns: boolean;
	hasTableDiscounts: boolean;

	// Actions
	setDesign: (design: boolean) => void;
	setDesignType: (type: string) => void;
	setThemes: (themes: ThemeSet) => void;
	setCurrentFont: (font: string) => void;
	setDiscountAmount: (amount: number) => void;
	setMaxDiscountPercent: (percent: number) => void;
	setDiscountText: (text: string) => void;
	setHasTableDesigns: (has: boolean) => void;
	setHasTableDiscounts: (has: boolean) => void;
	resetSettings: () => void;
}

const defaultThemes: ThemeSet = {
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
};

export const useSettingsStore = create<SettingsState>()(
	persist(
		(set) => ({
			// Initial state
			design: false,
			designType: "default",
			themes: defaultThemes,
			currentFont: "montserrat",
			discountAmount: 500,
			maxDiscountPercent: 5,
			discountText: "цена при подписке\nна телеграм канал",
			hasTableDesigns: false,
			hasTableDiscounts: false,

			// Actions
			setDesign: (design) => set({ design }),

			setDesignType: (type) =>
				set((state) => {
					// When switching to table mode and we have table discounts
					// disable the global discount flag to avoid conflicts
					if (type === "table" && state.hasTableDiscounts) {
						return { designType: type, design: false };
					}
					return { designType: type };
				}),

			setThemes: (themes) => set({ themes }),
			setCurrentFont: (font) => set({ currentFont: font }),
			setDiscountAmount: (amount) => set({ discountAmount: amount }),
			setMaxDiscountPercent: (percent) => set({ maxDiscountPercent: percent }),
			setDiscountText: (text) => set({ discountText: text }),
			setHasTableDesigns: (has) => set({ hasTableDesigns: has }),
			setHasTableDiscounts: (has) => set({ hasTableDiscounts: has }),

			resetSettings: () =>
				set({
					design: false,
					designType: "default",
					themes: defaultThemes,
					hasTableDesigns: false,
					hasTableDiscounts: false,
				}),
		}),
		{
			name: "settings-storage",
			storage: createJSONStorage(() => localStorage),
		},
	),
);
