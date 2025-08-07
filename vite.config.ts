import path from "node:path";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

// https://vitejs.dev/config/
export default defineConfig({
	plugins: [react()],
	resolve: {
		alias: {
			"@": path.resolve(__dirname, "./src"),
		},
	},
	build: {
		chunkSizeWarningLimit: 1000,
		rollupOptions: {
			output: {
				manualChunks: {
					// Core React and routing
					vendor: ["react", "react-dom", "@tanstack/react-router"],
					// State management
					store: ["zustand", "immer"],
					// Heavy data processing libraries (lazy loaded)
					dataProcessing: ["xlsx", "jspdf", "jspdf-autotable", "pdf-lib"],
					// Forms and validation
					forms: ["react-hook-form", "zod", "@hookform/resolvers"],
					// UI components
					ui: [
						"lucide-react",
						"@radix-ui/react-dialog",
						"@radix-ui/react-slot",
						"@radix-ui/react-select",
						"@radix-ui/react-tooltip",
						"@radix-ui/react-popover",
						"@radix-ui/react-checkbox",
						"@radix-ui/react-dropdown-menu",
						"tailwind-merge",
						"class-variance-authority",
					],
					// External integrations
					integrations: ["google-sheets-data-fetcher", "axios"],
				},
			},
		},
	},
	server: {},
});
