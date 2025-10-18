/**
 * Unified Theme Store - Single Source of Truth for All Platforms
 *
 * Best practices implemented:
 * - Single source of truth for theme definitions
 * - Type-safe theme access
 * - Serialization support for bot/API
 * - Extensible architecture for custom themes
 * - Platform-specific metadata
 */

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

export type ThemeCategory =
	| "light"
	| "dark"
	| "light-monochrome"
	| "dark-monochrome";

export interface ThemeMetadata {
	id: keyof ThemeSet;
	name: string;
	emoji: string;
	description?: string;
	category: ThemeCategory;
	order: number; // For sorting within categories
}

/**
 * Default themes - single source of truth
 */
export const DEFAULT_THEMES: ThemeSet = {
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

/**
 * Theme metadata for UI/bot display with proper categorization
 */
export const THEME_METADATA: ThemeMetadata[] = [
	// Light themes - light backgrounds with dark text
	{ id: "white", name: "Белый", emoji: "⚪", category: "light", order: 1 },
	{ id: "snow", name: "Снег", emoji: "❄️", category: "light", order: 2 },
	{ id: "silver", name: "Серебро", emoji: "🥈", category: "light", order: 3 },
	{ id: "paper", name: "Бумага", emoji: "📄", category: "light", order: 4 },

	// Light monochrome themes - light grayscale with dark text
	{
		id: "monochrome",
		name: "Монохром",
		emoji: "🎨",
		category: "light-monochrome",
		order: 1,
	},

	// Dark themes - dark backgrounds with light text
	{ id: "default", name: "Классик", emoji: "🎯", category: "dark", order: 1 },
	{ id: "new", name: "Новинка", emoji: "✨", category: "dark", order: 2 },
	{ id: "sale", name: "Распродажа", emoji: "🏷️", category: "dark", order: 3 },
	{ id: "sunset", name: "Закат", emoji: "🌅", category: "dark", order: 4 },
	{ id: "ocean", name: "Океан", emoji: "🌊", category: "dark", order: 5 },
	{ id: "forest", name: "Лес", emoji: "🌲", category: "dark", order: 6 },
	{ id: "royal", name: "Королевский", emoji: "👑", category: "dark", order: 7 },
	{ id: "vintage", name: "Винтаж", emoji: "📜", category: "dark", order: 8 },
	{ id: "neon", name: "Неон", emoji: "💫", category: "dark", order: 9 },

	// Dark monochrome themes - dark grayscale with light text
	{
		id: "black",
		name: "Черный",
		emoji: "⚫",
		category: "dark-monochrome",
		order: 1,
	},
	{
		id: "charcoal",
		name: "Уголь",
		emoji: "⚫",
		category: "dark-monochrome",
		order: 2,
	},
	{
		id: "ink",
		name: "Чернила",
		emoji: "🖋️",
		category: "dark-monochrome",
		order: 3,
	},
];

/**
 * Type-safe theme access utilities
 */
export class ThemeStore {
	/**
	 * Get theme by ID
	 */
	static getTheme(id: keyof ThemeSet): Theme {
		return DEFAULT_THEMES[id];
	}

	/**
	 * Get all themes
	 */
	static getAllThemes(): ThemeSet {
		return { ...DEFAULT_THEMES };
	}

	/**
	 * Get theme metadata
	 */
	static getThemeMetadata(id: keyof ThemeSet): ThemeMetadata | undefined {
		return THEME_METADATA.find((meta) => meta.id === id);
	}

	/**
	 * Get all theme metadata
	 */
	static getAllThemeMetadata(): ThemeMetadata[] {
		return [...THEME_METADATA];
	}

	/**
	 * Get themes filtered by category (sorted by order)
	 */
	static getThemesByCategory(category: ThemeCategory): ThemeMetadata[] {
		return THEME_METADATA.filter((meta) => meta.category === category).sort(
			(a, b) => a.order - b.order,
		);
	}

	/**
	 * Get all themes grouped by category
	 */
	static getThemesByCategories(): Record<ThemeCategory, ThemeMetadata[]> {
		const categories: Record<ThemeCategory, ThemeMetadata[]> = {
			light: [],
			dark: [],
			"light-monochrome": [],
			"dark-monochrome": [],
		};

		THEME_METADATA.forEach((meta) => {
			categories[meta.category].push(meta);
		});

		// Sort each category by order
		Object.keys(categories).forEach((category) => {
			categories[category as ThemeCategory].sort((a, b) => a.order - b.order);
		});

		return categories;
	}

	/**
	 * Get category display name
	 */
	static getCategoryDisplayName(category: ThemeCategory): string {
		const names: Record<ThemeCategory, string> = {
			light: "Светлые",
			dark: "Темные",
			"light-monochrome": "Светлые монохром",
			"dark-monochrome": "Темные монохром",
		};
		return names[category];
	}

	/**
	 * Get category description
	 */
	static getCategoryDescription(category: ThemeCategory): string {
		const descriptions: Record<ThemeCategory, string> = {
			light: "Светлые фоны с темным текстом",
			dark: "Темные фоны со светлым текстом",
			"light-monochrome": "Светлые градиенты серых тонов",
			"dark-monochrome": "Темные градиенты серых тонов",
		};
		return descriptions[category];
	}

	/**
	 * Serialize themes for API/bot usage
	 */
	static serializeThemes(): string {
		return JSON.stringify(
			{
				themes: DEFAULT_THEMES,
				metadata: THEME_METADATA,
				version: "1.0.0",
				lastUpdated: new Date().toISOString(),
			},
			null,
			2,
		);
	}

	/**
	 * Deserialize themes (for future custom theme support)
	 */
	static deserializeThemeSet(data: string): ThemeSet {
		try {
			const parsed = JSON.parse(data);
			return parsed.themes || DEFAULT_THEMES;
		} catch {
			return DEFAULT_THEMES;
		}
	}

	/**
	 * Validate theme structure
	 */
	static validateTheme(theme: any): theme is Theme {
		return (
			typeof theme === "object" &&
			typeof theme.start === "string" &&
			typeof theme.end === "string" &&
			typeof theme.textColor === "string" &&
			/^#[0-9A-Fa-f]{6}$/.test(theme.start) &&
			/^#[0-9A-Fa-f]{6}$/.test(theme.end) &&
			/^#[0-9A-Fa-f]{6}$/.test(theme.textColor)
		);
	}

	/**
	 * Get theme for bot (with emoji and name)
	 */
	static getBotThemes(): Array<{
		id: string;
		name: string;
		emoji: string;
		colors: Theme;
	}> {
		return THEME_METADATA.map((meta) => ({
			id: meta.id,
			name: meta.name,
			emoji: meta.emoji,
			colors: DEFAULT_THEMES[meta.id],
		}));
	}

	/**
	 * Generate CSS variables for theme
	 */
	static generateCSSVariables(
		theme: Theme,
		prefix = "--theme",
	): Record<string, string> {
		return {
			[`${prefix}-start`]: theme.start,
			[`${prefix}-end`]: theme.end,
			[`${prefix}-text-color`]: theme.textColor,
		};
	}

	/**
	 * Create gradient CSS string
	 */
	static createGradient(theme: Theme, direction = "135deg"): string {
		return `linear-gradient(${direction}, ${theme.start}, ${theme.end})`;
	}
}

/**
 * Convenience exports for backward compatibility
 */
export const themes = ThemeStore.getAllThemeMetadata();
export const defaultThemes = ThemeStore.getAllThemes();
export type ThemeId = keyof ThemeSet;
