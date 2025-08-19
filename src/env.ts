import { createEnv } from "@t3-oss/env-core";
import { z } from "zod";

export const env = createEnv({
	/**
	 * Схема для переменных окружения
	 */
	server: {
		NODE_ENV: z
			.enum(["development", "test", "production"])
			.default("development"),
		TELEGRAM_BOT_TOKEN: z.string().min(1, "Telegram bot token is required"),
	},

	/**
	 * Переменные runtime окружения
	 * В Node.js environment все берется из process.env
	 */
	runtimeEnv: process.env,

	/**
	 * Пустые строки рассматривать как undefined
	 */
	emptyStringAsUndefined: true,
});
