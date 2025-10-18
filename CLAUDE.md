# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

### Core Development
- `pnpm dev` - Start development server (Next.js)
- `pnpm build` - Build for production (Next.js build)
- `pnpm start` - Start production server

### Code Quality
- `pnpm lint` - Run Biome linter (configured via Next.js ESLint integration)
- `pnpm biome:check` - Run Biome linter/formatter check
- `pnpm biome:unsafe` - Run Biome with unsafe fixes
- `pnpm biome:write` - Format code with Biome
- `pnpm typecheck` - Run TypeScript type checking without emitting files

### Development Hints
- Don't build the project to find errors - use these commands instead:
  - `lint`: Run linter to check for TypeScript/React errors
  - `typecheck`: Run TypeScript compiler for type errors
  - `biome:check`: Run Biome for comprehensive code quality check
  - `biome:unsafe`: Run Biome with more aggressive checks
  - `biome:write`: Automatically format code with Biome

### Testing
- `pnpm test` - Run all tests with Vitest
- `pnpm test:selection` - Run OptimizedEditTable tests
- `pnpm test:duplication` - Run DuplicationSystem tests
- `pnpm test:duplication-ui` - Run duplication UI tests
- `pnpm test:selection-filtering` - Run selection/filtering tests
- `pnpm test:all-table` - Run all table-related tests

## Package Management
- Always use pnpm instead of npm

## Architecture Overview

### State Management
The application uses **Zustand** with persistence as the primary state management solution:
- **Main store**: `src/store/priceTagsStore.ts` - Manages all price tag data, themes, and application settings
- **Features**: Immer middleware for immutable updates, localStorage persistence, undo/redo functionality
- **Key state**: items, themes, design settings, discount configurations, table-specific settings

### Routing
Uses **Next.js App Router**:
- Root route: `/` - PriceTagsPage (main application)
- Secondary route: `/marketing` - QR code functionality
- API routes in `src/app/api/` for PDF generation, data processing, and Telegram bot

### Component Architecture
Organized in a feature-based structure:

**Features (`src/components/features/`)**:
- `price-tags/` - Core price tag functionality including table editing, customization, PDF generation
- `qr/` - QR code generation features

**Key Components**:
- `OptimizedEditTable.tsx` - Main data table with selection, duplication, inline editing
- `PriceTagSVG.tsx` - SVG rendering for price tags with theme support
- `PriceTagCustomizer.tsx` - Theme and design configuration
- `ExcelUploader.tsx` / `GoogleSheetsForm.tsx` - Data import functionality

**UI System**: Shadcn/ui components in `src/components/ui/` with Radix UI primitives

### Data Flow
1. **Import**: Excel files or Google Sheets → parsed into `Item[]` format
2. **Processing**: Items stored in Zustand store with unique ID generation
3. **Table Editing**: OptimizedEditTable provides inline editing with selection/duplication
4. **Rendering**: PriceTagSVG renders tags based on themes and discount settings
5. **Export**: PDF generation using pdf-lib for printing

### Key Features
- **Multi-tier pricing**: Support for bulk pricing (priceFor2, priceFrom3)
- **Dynamic theming**: Gradient themes with configurable colors per design type
- **Table vs Global modes**: Design settings can be applied globally or per-row in table
- **Discount system**: Configurable discount amounts and percentages
- **History management**: Undo/redo functionality for all table operations

### Technology Stack
- **Frontend**: React 19 + TypeScript + Next.js 15.4.6 (App Router)
- **Styling**: TailwindCSS + Shadcn/ui
- **State**: Zustand with persistence and Immer middleware
- **Forms**: React Hook Form + Zod validation
- **PDF**: pdf-lib for generation, react-to-print for browser printing
- **Excel**: xlsx library for file processing
- **Bot Framework**: Grammy for Telegram bot functionality
- **Testing**: Vitest + React Testing Library

### Important Patterns
- All table operations (add/edit/delete/duplicate) automatically update history for undo/redo
- Unique ID generation uses timestamp + counter to prevent collisions
- Price calculations are reactive and update automatically when discount settings change
- Theme system supports per-item design overrides when in table mode
- API routes follow Next.js App Router conventions in `src/app/api/`

### Telegram Bot Integration
- Framework is in place with Grammy dependencies
- API endpoints exist at `src/app/api/bot/` and `src/app/api/telegram-webhook/`
- Used for automated price tag generation and sharing via Telegram

## Git Commit Guidelines
- Do NOT add Claude as co-author in commit messages
- Keep commit messages concise and descriptive
- Focus on the changes made, not who made them