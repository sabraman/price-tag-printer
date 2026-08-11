# Unified Theme System Architecture

## 🎯 Overview

This document describes the unified theme management system that provides a single source of truth for all platforms (Web App, Bot, and API).

## 🏗️ Architecture

### **Single Source of Truth**

- **Location**: `src/lib/themes/index.ts`
- **Purpose**: Centralized theme definitions and utilities
- **Benefits**: No duplication, consistent themes across platforms

### **Platform Integration**

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Web App       │    │      Bot        │    │      API        │
│  (Zustand)      │    │  (Grammy)       │    │  (Next.js)      │
└─────────┬───────┘    └─────────┬───────┘    └─────────┬───────┘
          │                      │                      │
          └──────────────────────┼──────────────────────┘
                                 │
                    ┌─────────────────┐
                    │  Theme Store    │
                    │  (src/lib/themes) │
                    └─────────────────┘
```

## 📁 File Structure

```
src/
├── lib/
│   └── themes/
│       └── index.ts              # Unified theme store
├── store/
│   └── priceTagsStore.ts         # Uses ThemeStore
├── bot/
│   └── index.ts                  # Uses ThemeStore
├── app/api/
│   └── themes/
│       └── unified/
│           └── route.ts          # Theme API endpoint
└── components/
    └── features/price-tags/
        └── PriceTagCustomizer.tsx # Theme saving UI
```

## 🎨 Theme Structure

### **Theme Interface**

```typescript
interface Theme {
	start: string; // Gradient start color
	end: string; // Gradient end color
	textColor: string; // Text color
}

interface ThemeSet {
	default: Theme;
	new: Theme;
	sale: Theme;
	// ... 17 total themes
}
```

### **Theme Metadata**

```typescript
interface ThemeMetadata {
	id: keyof ThemeSet; // Theme identifier
	name: string; // Display name
	emoji: string; // Bot emoji
	category: ThemeCategory; // Theme category
	order: number; // Sort order within category
}

type ThemeCategory = "light" | "dark" | "light-monochrome" | "dark-monochrome";
```

## 🔧 Usage Examples

### **Web App (React/Zustand)**

```typescript
import { ThemeStore } from "@/lib/themes";

// Get single theme
const theme = ThemeStore.getTheme("sunset");

// Get all themes
const allThemes = ThemeStore.getAllThemes();

// Get themes by category
const darkThemes = ThemeStore.getThemesByCategory("dark");
const allCategories = ThemeStore.getThemesByCategories();

// Generate CSS variables
const cssVars = ThemeStore.generateCSSVariables(theme);

// Get category info
const categoryName = ThemeStore.getCategoryDisplayName("dark");
const categoryDesc = ThemeStore.getCategoryDescription("dark");
```

### **Bot (Grammy)**

```typescript
import { ThemeStore } from "@/lib/themes";

// Get bot-ready themes with metadata
const botThemes = ThemeStore.getBotThemes();
// Returns: [{ id, name, emoji, colors }, ...]

// Get theme for preview
const theme = ThemeStore.getTheme("royal");
```

### **API (Next.js)**

```typescript
// GET /api/themes/unified?platform=bot
// Returns: { themes: [{ id, name, emoji, colors }], version: "1.0.0" }

// GET /api/themes/unified?id=sunset
// Returns: { id: "sunset", theme: {...}, metadata: {...} }
```

## 🔄 Theme Storage

### **Default Themes** (Built-in)

- **Location**: `DEFAULT_THEMES` constant in `ThemeStore`
- **Persistence**: Hardcoded in source
- **Access**: `ThemeStore.getTheme(id)`

### **Current Theme State** (Runtime)

- **Location**: Zustand store persistence
- **Storage Key**: `"price-tags-storage"` in localStorage
- **Contains**: Current active theme, user settings

### **Custom Themes** (User-saved)

- **Location**: Custom theme saving UI
- **Storage Key**: `"custom-themes"` in localStorage
- **Format**: `{ "My Theme": { default: {...}, new: {...}, ... } }`

## 🚀 API Endpoints

### **Unified Theme API**

```
GET /api/themes/unified
- ?platform=web    - Full themes + metadata + categories
- ?platform=bot    - Bot-ready themes with emojis + categories
- ?platform=api    - Serialized theme data + categories
- ?id=sunset       - Single theme data
```

### **Theme Categories**

```
light             - Светлые фоны с темным текстом (4 темы)
dark              - Темные фоны со светлым текстом (9 тем)
light-monochrome  - Светлые градиенты серых тонов (1 тема)
dark-monochrome   - Темные градиенты серых тонов (3 темы)
```

### **Theme Validation**

```
POST /api/themes/unified
{
  "themes": { ... },
  "validate": true
}
```

## 🛠️ Best Practices Implemented

### **1. Single Source of Truth**

- ✅ Centralized theme definitions
- ✅ No duplication across platforms
- ✅ Type-safe theme access

### **2. Platform-Specific Adaptation**

- ✅ Web: React component integration
- ✅ Bot: Emoji + metadata support
- ✅ API: Serialization + validation

### **3. Extensibility**

- ✅ Easy to add new themes
- ✅ Custom theme support
- ✅ Theme categorization
- ✅ Validation utilities

### **4. Performance**

- ✅ Static theme generation
- ✅ API caching headers
- ✅ Lazy loading support

## 🔄 Migration Benefits

### **Before (Duplicated)**

```typescript
// Web App
const themes = { default: {...}, new: {...}, ... };

// Bot
const defaultThemes = { default: {...}, new: {...}, ... };

// API
const themes = { default: {...}, new: {...}, ... };
```

### **After (Unified)**

```typescript
// All platforms
import { ThemeStore } from "@/lib/themes";
const themes = ThemeStore.getAllThemes();
```

## 🧪 Testing

### **Theme Consistency Test**

```javascript
// Browser console
fetch("/api/themes/unified?platform=bot")
	.then((res) => res.json())
	.then((data) => console.log("Bot themes:", data.themes));

fetch("/api/themes/unified?platform=web")
	.then((res) => res.json())
	.then((data) => console.log("Web themes:", data.themes));
```

### **Theme Validation**

```javascript
// Test custom theme structure
const testTheme = {
	start: "#ff0000",
	end: "#00ff00",
	textColor: "#ffffff",
};
// Valid if all colors are proper hex codes
```

## 📝 Future Enhancements

### **Planned Features**

- [ ] Dynamic theme generation
- [ ] Theme import/export
- [ ] User theme sharing
- [ ] Theme analytics
- [ ] A/B testing support

### **API Extensions**

- [ ] Theme search/filtering
- [ ] Theme popularity ranking
- [ ] Custom theme validation API
- [ ] Theme preview generation

---

## 🎯 Summary

The unified theme system provides:

1. **Consistency** - Same themes across all platforms
2. **Maintainability** - Single source of truth
3. **Extensibility** - Easy to add new features
4. **Type Safety** - TypeScript throughout
5. **Performance** - Optimized for each platform

This architecture eliminates theme duplication and ensures a consistent user experience across web app, bot, and API platforms.
