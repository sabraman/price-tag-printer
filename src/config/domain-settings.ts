import type { ThemeSet } from "@/store/priceTagsStore";

export interface DomainSettings {
	themes: ThemeSet;
	font: string;
	designType: string;
	discountText: string;
	showThemeLabels: boolean;
}

// Default settings (current app defaults)
const defaultSettings: DomainSettings = {
	themes: {
		default: { start: "#222222", end: "#dd4c9b", textColor: "#ffffff" },
		new: { start: "#222222", end: "#9cdd4c", textColor: "#ffffff" },
		sale: { start: "#222222", end: "#dd4c54", textColor: "#ffffff" },
		white: { start: "#ffffff", end: "#ffffff", textColor: "#000000" },
		black: { start: "#000000", end: "#000000", textColor: "#ffffff" },
		sunset: { start: "#ff7e5f", end: "#feb47b", textColor: "#ffffff" },
		ocean: { start: "#667eea", end: "#764ba2", textColor: "#ffffff" },
		forest: { start: "#134e5e", end: "#71b280", textColor: "#ffffff" },
		royal: { start: "#4c63d2", end: "#9c27b0", textColor: "#ffffff" },
		vintage: { start: "#8b4513", end: "#d2b48c", textColor: "#ffffff" },
		neon: { start: "#00ff00", end: "#ff00ff", textColor: "#000000" },
		monochrome: { start: "#4a4a4a", end: "#888888", textColor: "#ffffff" },
		silver: { start: "#c0c0c0", end: "#e8e8e8", textColor: "#000000" },
		charcoal: { start: "#2c2c2c", end: "#2c2c2c", textColor: "#ffffff" },
		paper: { start: "#f8f8f8", end: "#f0f0f0", textColor: "#333333" },
		ink: { start: "#1a1a1a", end: "#1a1a1a", textColor: "#ffffff" },
		snow: { start: "#ffffff", end: "#f5f5f5", textColor: "#000000" },
	},
	font: "Montserrat",
	designType: "default",
	discountText: "цена при подписке\nна телеграм канал",
	showThemeLabels: true,
};

// Domain-specific settings configuration
export const domainConfigs: Record<string, DomainSettings> = {
	// ArchSmoke print subdomain
	"print.archsmoke.ru": {
		...defaultSettings,
		themes: {
			...defaultSettings.themes,
			// Use sunset theme as default (from GradientPicker lines 76-81)
			default: { start: "#2B2827", end: "#FF731D", textColor: "#ffffff" },
			new: { start: "#2B2827", end: "#E2E0FF", textColor: "#ffffff" },
			sale: { start: "#2B2827", end: "#FE4152", textColor: "#ffffff" },
		},
		font: "Nunito",
		designType: "sunset",
	},

	// Vapar Vercel app
	"vapar-print.vercel.app": {
		...defaultSettings,
		themes: {
			...defaultSettings.themes,
			// Use Vapar gradient theme (from GradientPicker lines 70-75)
			default: { start: "#dd4c9b", end: "#f6989a", textColor: "#ffffff" },
			new: { start: "#dd4c9b", end: "#f6989a", textColor: "#ffffff" },
			sale: { start: "#ee4a61", end: "#f6989a", textColor: "#ffffff" },
		},
		font: "Montserrat",
		designType: "default",
	},

	// You can add more domains as needed
	"example.com": {
		...defaultSettings,
		font: "Inter",
		designType: "ocean",
		themes: {
			...defaultSettings.themes,
			default: defaultSettings.themes.ocean,
		},
	},
};

/**
 * Get domain settings based on the current hostname
 * Supports exact domain matching and subdomain wildcards
 */
export function getDomainSettings(hostname?: string): DomainSettings {
	if (!hostname) {
		return defaultSettings;
	}

	// Normalize hostname (remove www, convert to lowercase)
	const normalizedHostname = hostname.toLowerCase().replace(/^www\./, "");

	// Check exact match first
	if (domainConfigs[normalizedHostname]) {
		return domainConfigs[normalizedHostname];
	}

	// Check for parent domain matches (for subdomains)
	const domainParts = normalizedHostname.split(".");
	if (domainParts.length > 2) {
		// Check if parent domain has config (e.g., archsmoke.ru for any.archsmoke.ru)
		const parentDomain = domainParts.slice(-2).join(".");
		if (domainConfigs[parentDomain]) {
			return domainConfigs[parentDomain];
		}
	}

	// Return default if no match found
	return defaultSettings;
}

/**
 * Check if the current domain has custom settings
 */
export function hasDomainCustomization(hostname?: string): boolean {
	if (!hostname) return false;

	const normalizedHostname = hostname.toLowerCase().replace(/^www\./, "");

	// Check exact match
	if (domainConfigs[normalizedHostname]) return true;

	// Check parent domain
	const domainParts = normalizedHostname.split(".");
	if (domainParts.length > 2) {
		const parentDomain = domainParts.slice(-2).join(".");
		if (domainConfigs[parentDomain]) return true;
	}

	return false;
}

/**
 * Get a friendly name for the current domain configuration
 */
export function getDomainConfigName(hostname?: string): string {
	if (!hostname) return "Default";

	const normalizedHostname = hostname.toLowerCase().replace(/^www\./, "");

	switch (normalizedHostname) {
		case "print.archsmoke.ru":
			return "ArchSmoke Print";
		case "vapar-print.vercel.app":
			return "Vapar Print";
		default:
			if (hasDomainCustomization(hostname)) {
				return `Custom (${normalizedHostname})`;
			}
			return "Default";
	}
}
