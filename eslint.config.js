import js from "@eslint/js";
import nextPlugin from "@next/eslint-plugin-next";
import typescript from "@typescript-eslint/eslint-plugin";
import typescriptParser from "@typescript-eslint/parser";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";

export default [
	js.configs.recommended,
	{
		files: ["**/*.{js,jsx,ts,tsx}"],
		languageOptions: {
			parser: typescriptParser,
			parserOptions: {
				ecmaVersion: "latest",
				sourceType: "module",
				ecmaFeatures: {
					jsx: true,
				},
			},
			globals: {
				// Browser globals
				window: "readonly",
				document: "readonly",
				console: "readonly",
				setTimeout: "readonly",
				clearTimeout: "readonly",
				setInterval: "readonly",
				clearInterval: "readonly",
				requestAnimationFrame: "readonly",
				fetch: "readonly",
				alert: "readonly",
				localStorage: "readonly",
				sessionStorage: "readonly",
				// Web API globals
				URL: "readonly",
				URLSearchParams: "readonly",
				Response: "readonly",
				Request: "readonly",
				Headers: "readonly",
				AbortSignal: "readonly",
				AbortController: "readonly",
				// Node.js globals
				Buffer: "readonly",
				process: "readonly",
				global: "readonly",
				__dirname: "readonly",
				__filename: "readonly",
				// DOM types
				HTMLElement: "readonly",
				HTMLDivElement: "readonly",
				HTMLButtonElement: "readonly",
				HTMLInputElement: "readonly",
				HTMLTextAreaElement: "readonly",
				HTMLTableElement: "readonly",
				HTMLTableSectionElement: "readonly",
				HTMLTableRowElement: "readonly",
				HTMLTableCellElement: "readonly",
				HTMLTableCaptionElement: "readonly",
				HTMLOListElement: "readonly",
				HTMLLIElement: "readonly",
				HTMLAnchorElement: "readonly",
				HTMLSpanElement: "readonly",
				HTMLHeadingElement: "readonly",
				HTMLParagraphElement: "readonly",
				HTMLUListElement: "readonly",
				// File API
				File: "readonly",
				FileList: "readonly",
				FileReader: "readonly",
				// React
				React: "readonly",
				// Performance
				performance: "readonly",
				// Navigator
				navigator: "readonly",
				// Node.js types (for some components)
				NodeJS: "readonly",
				// ResizeObserver
				ResizeObserver: "readonly",
				// Additional globals
				KeyboardEvent: "readonly",
			},
		},
		plugins: {
			"@typescript-eslint": typescript,
			"react-hooks": reactHooks,
			"react-refresh": reactRefresh,
			"@next/next": nextPlugin,
		},
		rules: {
			...typescript.configs.recommended.rules,
			...reactHooks.configs.recommended.rules,
			"react-refresh/only-export-components": [
				"warn",
				{ allowConstantExport: true },
			],
			// Allow any types for dynamic imports (necessary for puppeteer)
			"@typescript-eslint/no-explicit-any": "off",
			// Allow unused variables that are required by interfaces
			"@typescript-eslint/no-unused-vars": [
				"error",
				{
					argsIgnorePattern: "^_",
					varsIgnorePattern: "^_",
					caughtErrorsIgnorePattern: "^_",
				},
			],
			// Allow unused expressions when using void
			"@typescript-eslint/no-unused-expressions": [
				"error",
				{
					allowShortCircuit: true,
					allowTernary: true,
					allowTaggedTemplates: true,
				},
			],
		},
	},
	{
		files: ["src/app/api/**/*.{js,ts}"],
		languageOptions: {
			globals: {
				process: "readonly",
				setTimeout: "readonly",
				console: "readonly",
				Buffer: "readonly",
				URL: "readonly",
				URLSearchParams: "readonly",
				Response: "readonly",
				Request: "readonly",
				Headers: "readonly",
				AbortSignal: "readonly",
				AbortController: "readonly",
			},
		},
	},
	{
		files: ["src/lib/**/*.{js,ts}"],
		languageOptions: {
			globals: {
				process: "readonly",
				setTimeout: "readonly",
				console: "readonly",
				Buffer: "readonly",
				URL: "readonly",
				URLSearchParams: "readonly",
				Response: "readonly",
				Request: "readonly",
				Headers: "readonly",
				AbortSignal: "readonly",
				AbortController: "readonly",
			},
		},
	},
	{
		files: ["src/telegram-bot.ts", "src/**/telegram/**/*.{js,ts}"],
		languageOptions: {
			globals: {
				process: "readonly",
				setTimeout: "readonly",
				console: "readonly",
				Buffer: "readonly",
				URL: "readonly",
				URLSearchParams: "readonly",
				Response: "readonly",
				Request: "readonly",
				Headers: "readonly",
				AbortSignal: "readonly",
				AbortController: "readonly",
			},
		},
	},
];
