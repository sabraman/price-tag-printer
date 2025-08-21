# 🌐 Domain-Based Default Settings

This feature allows different domains/subdomains to have their own default themes, fonts, and settings that are automatically applied when users first visit the site.

## How It Works

When a user visits the application for the first time on a configured domain, the system will:

1. **Detect the current domain** using `window.location.hostname`
2. **Check for domain-specific configuration** in `src/config/domain-settings.ts`
3. **Apply the custom defaults** automatically (only if the store is in its initial state)
4. **Show a domain indicator** (optional) to let users know custom settings are active

## Configured Domains

### `print.archsmoke.ru`
- **Theme**: Sunset gradient (`#2B2827` → `#FF731D`)
- **Font**: Nunito
- **Design Type**: sunset
- **Config Name**: "ArchSmoke Print"

### `vapar-print.vercel.app`
- **Theme**: Vapar gradient (`#dd4c9b` → `#f6989a`)
- **Font**: Montserrat  
- **Design Type**: default
- **Config Name**: "Vapar Print"

## Files Structure

```
src/
├── config/
│   └── domain-settings.ts          # Domain configuration mappings
├── hooks/
│   └── useDomainSettings.ts        # React hook for domain detection
├── components/
│   ├── DomainSettingsInitializer.tsx  # Auto-applies domain settings
│   ├── DomainIndicator.tsx         # Shows current domain config (optional)
│   └── DomainSettingsTest.tsx      # Test component for development
└── app/
    └── layout.tsx                  # DomainSettingsInitializer added here
```

## Adding New Domains

1. **Edit `src/config/domain-settings.ts`**:
   ```typescript
   "your-domain.com": {
     ...defaultSettings,
     themes: {
       ...defaultSettings.themes,
       default: { start: "#your-color", end: "#your-color2", textColor: "#ffffff" },
       // ... customize other themes
     },
     font: "YourFont",
     designType: "your-theme-name",
   },
   ```

2. **Available fonts**: `"Montserrat"`, `"Nunito"`, `"Inter"`, `"Mont"`

3. **Available design types**: Any key from the themes object (`"default"`, `"sunset"`, `"ocean"`, etc.)

## Usage Examples

### Automatic Application (Default)
Settings are applied automatically on first visit. The `DomainSettingsInitializer` component handles this.

### Manual Domain Detection
```tsx
import { useDomainSettings } from "@/hooks/useDomainSettings";

function MyComponent() {
  const { hostname, configName, hasCustomization, settings } = useDomainSettings();
  
  if (hasCustomization) {
    return <div>Using {configName} configuration</div>;
  }
  return <div>Using default settings</div>;
}
```

### Domain Indicator
```tsx
import { DomainIndicator } from "@/components/DomainIndicator";

// Shows a small indicator with domain info
<DomainIndicator />
```

### Server-Side Usage
```tsx
import { getDomainSettingsFromHeaders } from "@/hooks/useDomainSettings";

export async function GET(request: NextRequest) {
  const settings = getDomainSettingsFromHeaders(request.headers);
  // Use settings...
}
```

## Development & Testing

### Test Component
Use `DomainSettingsTest` component to test different domains:

```tsx
import { DomainSettingsTest } from "@/components/DomainSettingsTest";

// Add to any page for testing
<DomainSettingsTest />
```

### Debug Mode
Add debug indicator to see what's happening:

```tsx
import { DomainSettingsDebug } from "@/components/DomainSettingsInitializer";

// Shows debug info in bottom-right corner
<DomainSettingsDebug enabled={process.env.NODE_ENV === "development"} />
```

## Important Notes

⚠️ **Only applies to fresh stores**: Domain settings only apply when the user visits for the first time (empty items, default themes). If the user has already customized settings or loaded data, domain defaults won't override their work.

✅ **Hydration safe**: Uses proper client-side detection to avoid SSR hydration mismatches.

🔧 **Fallback friendly**: If domain detection fails or no custom config exists, falls back to default settings gracefully.

## Domain Matching Logic

1. **Exact match**: `print.archsmoke.ru` matches exactly
2. **Parent domain**: `any.archsmoke.ru` would match `archsmoke.ru` config if it exists
3. **Normalized**: Removes `www.` prefix automatically
4. **Case insensitive**: Domain matching is case-insensitive

## Security Considerations

- Domain detection happens client-side only
- No sensitive data is exposed
- Settings are cosmetic only (themes, fonts, UI preferences)
- Users can always override domain defaults manually