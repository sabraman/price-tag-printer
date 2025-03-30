import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "node:path";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    chunkSizeWarningLimit: 600,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: [
            'react',
            'react-dom',
            'zustand',
            'xlsx',
            'react-hook-form',
            'zod',
            '@tanstack/react-router'
          ],
          ui: [
            'lucide-react',
            '@radix-ui/react-dialog',
            '@radix-ui/react-slot',
            '@radix-ui/react-select',
            '@radix-ui/react-tooltip',
            '@radix-ui/react-popover',
            'tailwind-merge',
            'class-variance-authority'
          ]
        }
      }
    }
  },
  server: {},
});
