import {
	type ConversationFlavor,
	conversations,
} from "@grammyjs/conversations";
import { type FileFlavor, hydrateFiles } from "@grammyjs/files";
import { Bot, type Context, type SessionFlavor, session } from "grammy";
import { env } from "@/env";
import type { Item } from "@/store/priceTagsStore";

// Session data structure
interface SessionData {
	// Current mode
	mode: "main" | "edit_items" | "edit_themes" | "edit_settings";

	// User's items
	items: Item[];

	// Current design settings
	design: boolean;
	designType: string;
	discountAmount: number;
	maxDiscountPercent: number;
	themes: {
		default: { start: string; end: string; textColor: string };
		new: { start: string; end: string; textColor: string };
		sale: { start: string; end: string; textColor: string };
		white: { start: string; end: string; textColor: string };
		black: { start: string; end: string; textColor: string };
		sunset: { start: string; end: string; textColor: string };
		ocean: { start: string; end: string; textColor: string };
		forest: { start: string; end: string; textColor: string };
		royal: { start: string; end: string; textColor: string };
		vintage: { start: string; end: string; textColor: string };
		neon: { start: string; end: string; textColor: string };
		monochrome: { start: string; end: string; textColor: string };
		silver: { start: string; end: string; textColor: string };
		charcoal: { start: string; end: string; textColor: string };
		paper: { start: string; end: string; textColor: string };
		ink: { start: string; end: string; textColor: string };
		snow: { start: string; end: string; textColor: string };
	};
	currentFont: string;
	discountText: string;
	hasTableDesigns: boolean;
	hasTableDiscounts: boolean;
	showThemeLabels: boolean;
	cuttingLineColor: string;

	// Edit mode state
	editingItemId?: number;
	editingField?: string;
	awaitingInput?: boolean;

	// Navigation stack for back buttons
	navigationStack: Array<{
		messageText: string;
		keyboard: Record<string, unknown>;
		mode: string;
	}>;

	// Temporary data for multi-step operations
	tempData?: Record<string, unknown>;
}

// Custom context type
type MyContext = Context &
	SessionFlavor<SessionData> &
	ConversationFlavor<
		Context & SessionFlavor<SessionData> & FileFlavor<Context>
	> &
	FileFlavor<Context>;

// Create bot instance using validated environment variables
const bot = new Bot<MyContext>(env.TELEGRAM_BOT_TOKEN);

// Add file handling capabilities
bot.api.config.use(hydrateFiles(bot.token));

// Session middleware
bot.use(
	session({
		initial: (): SessionData => ({
			mode: "main",
			items: [],
			design: false,
			designType: "default",
			discountAmount: 500,
			maxDiscountPercent: 5,
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
			navigationStack: [],
		}),
	}),
);

// Add conversations
bot.use(conversations());

// Helper function to generate unique ID
let uniqueIdCounter = 0;
let lastTimestamp = 0;

export const generateUniqueId = (): number => {
	let timestamp = Date.now();

	if (timestamp <= lastTimestamp) {
		timestamp = lastTimestamp + 1;
	}
	lastTimestamp = timestamp;

	const uniqueId = timestamp * 1000 + ++uniqueIdCounter;

	if (uniqueIdCounter > 999) {
		uniqueIdCounter = 0;
	}

	return uniqueId;
};

export { bot };
export type { MyContext, SessionData };
