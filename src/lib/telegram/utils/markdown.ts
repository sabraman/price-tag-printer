/**
 * Escapes special MarkdownV2 characters for Telegram
 * @param text - Text to escape
 * @returns Escaped text safe for MarkdownV2
 */
export function escapeMarkdown(text: string): string {
	// Characters that need to be escaped in MarkdownV2:
	// _ * [ ] ( ) ~ ` > # + - = | { } . !
	return text.replace(/[_*[\]()~`>#+=|{}.!-]/g, "\\$&");
}

/**
 * Escapes text but preserves already formatted markdown
 * @param text - Text with markdown formatting
 * @returns Text with only special characters escaped
 */
export function escapeMarkdownPreserveFormatting(text: string): string {
	// Only escape characters that would break parsing, but preserve intentional formatting
	return text.replace(/[\\`>#+=|{}.!-]/g, "\\$&");
}

/**
 * Safely formats text for MarkdownV2 by escaping special characters
 * @param text - Text to format
 * @returns Formatted text safe for MarkdownV2
 */
export function safeMarkdown(text: string): string {
	return escapeMarkdown(text);
}

/**
 * Escapes a list of items for MarkdownV2 bullet points
 * @param items - Array of items to format
 * @returns Formatted bullet list
 */
export function formatBulletList(items: string[]): string {
	return items.map((item) => `• ${escapeMarkdown(item)}`).join("\n");
}
