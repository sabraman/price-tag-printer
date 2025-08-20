// Enhanced logging utility for Telegram bot
import type { Context } from "grammy";

export interface LogContext {
	userId?: number;
	username?: string;
	firstName?: string;
	chatId?: number;
	messageId?: number;
	action?: string;
}

// Type for extra logging data - can be any serializable value
type LogExtra =
	| string
	| number
	| boolean
	| null
	| undefined
	| Record<string, unknown>
	| unknown[];

class BotLogger {
	private formatTime(): string {
		return new Date().toISOString().replace("T", " ").replace("Z", "");
	}

	private formatUser(ctx?: Context): string {
		if (!ctx?.from) return "Unknown";

		const user = ctx.from;
		const parts = [];

		if (user.first_name) parts.push(user.first_name);
		if (user.last_name) parts.push(user.last_name);
		if (user.username) parts.push(`@${user.username}`);
		parts.push(`(${user.id})`);

		return parts.join(" ");
	}

	info(message: string, ctx?: Context, extra?: LogExtra) {
		const timestamp = this.formatTime();
		const user = ctx ? this.formatUser(ctx) : "";
		const extraStr = extra ? ` | ${JSON.stringify(extra)}` : "";

		console.log(
			`[${timestamp}] ℹ️ INFO: ${message}${user ? ` | User: ${user}` : ""}${extraStr}`,
		);
	}

	success(message: string, ctx?: Context, extra?: LogExtra) {
		const timestamp = this.formatTime();
		const user = ctx ? this.formatUser(ctx) : "";
		const extraStr = extra ? ` | ${JSON.stringify(extra)}` : "";

		console.log(
			`[${timestamp}] ✅ SUCCESS: ${message}${user ? ` | User: ${user}` : ""}${extraStr}`,
		);
	}

	warn(message: string, ctx?: Context, extra?: LogExtra) {
		const timestamp = this.formatTime();
		const user = ctx ? this.formatUser(ctx) : "";
		const extraStr = extra ? ` | ${JSON.stringify(extra)}` : "";

		console.log(
			`[${timestamp}] ⚠️ WARN: ${message}${user ? ` | User: ${user}` : ""}${extraStr}`,
		);
	}

	error(message: string, error?: unknown, ctx?: Context, extra?: LogExtra) {
		const timestamp = this.formatTime();
		const user = ctx ? this.formatUser(ctx) : "";
		const errorStr = error
			? ` | Error: ${error instanceof Error ? error.message : String(error)}`
			: "";
		const extraStr = extra ? ` | ${JSON.stringify(extra)}` : "";

		console.error(
			`[${timestamp}] ❌ ERROR: ${message}${user ? ` | User: ${user}` : ""}${errorStr}${extraStr}`,
		);

		if (error instanceof Error && error.stack) {
			console.error(`[${timestamp}] 📍 Stack trace:`, error.stack);
		}
	}

	debug(message: string, ctx?: Context, extra?: LogExtra) {
		if (process.env.NODE_ENV === "development") {
			const timestamp = this.formatTime();
			const user = ctx ? this.formatUser(ctx) : "";
			const extraStr = extra ? ` | ${JSON.stringify(extra)}` : "";

			console.log(
				`[${timestamp}] 🐛 DEBUG: ${message}${user ? ` | User: ${user}` : ""}${extraStr}`,
			);
		}
	}

	session(action: string, ctx?: Context, sessionData?: LogExtra) {
		const timestamp = this.formatTime();
		const user = ctx ? this.formatUser(ctx) : "";
		const dataStr = sessionData
			? ` | Data: ${JSON.stringify(sessionData, null, 2)}`
			: "";

		console.log(
			`[${timestamp}] 🔄 SESSION: ${action}${user ? ` | User: ${user}` : ""}${dataStr}`,
		);
	}

	conversation(action: string, ctx?: Context, step?: string) {
		const timestamp = this.formatTime();
		const user = ctx ? this.formatUser(ctx) : "";
		const stepStr = step ? ` | Step: ${step}` : "";

		console.log(
			`[${timestamp}] 💬 CONVERSATION: ${action}${user ? ` | User: ${user}` : ""}${stepStr}`,
		);
	}

	callback(data: string, ctx?: Context) {
		const timestamp = this.formatTime();
		const user = ctx ? this.formatUser(ctx) : "";

		console.log(
			`[${timestamp}] 🔘 CALLBACK: ${data}${user ? ` | User: ${user}` : ""}`,
		);
	}

	command(command: string, ctx?: Context) {
		const timestamp = this.formatTime();
		const user = ctx ? this.formatUser(ctx) : "";

		console.log(
			`[${timestamp}] ⚡ COMMAND: /${command}${user ? ` | User: ${user}` : ""}`,
		);
	}
}

export const logger = new BotLogger();
