/**
 * Utility functions for Telegram MarkdownV2 formatting
 */

/**
 * Escapes special characters for MarkdownV2 format
 * @param text - Text to escape
 * @returns Escaped text safe for MarkdownV2
 */
export function escapeMarkdown(text: string): string {
	if (!text) return text;
	
	return text
		.replace(/[_*[\]()~`>#+=|{}.!-]/g, '\\$&')
		.replace(/\\n/g, '\n');
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
	return items
		.map(item => `• ${escapeMarkdown(item)}`)
		.join('\n');
} 