# Copy Theme Format - Example

When you click "Копировать как код" in the theme customizer, you'll get this unified format:

```json
{
  "name": "Custom Theme",
  "description": "Пользовательская тема",
  "created": "2025-01-18T12:34:56.789Z",
  "themes": {
    "default": {
      "start": "#222222",
      "end": "#dd4c9b",
      "textColor": "#ffffff"
    },
    "new": {
      "start": "#222222",
      "end": "#9cdd4c",
      "textColor": "#ffffff"
    },
    "sale": {
      "start": "#222222",
      "end": "#dd4c54",
      "textColor": "#ffffff"
    },
    // ... all 17 themes
  },
  "metadata": [
    {
      "id": "default",
      "name": "Классик",
      "category": "dark",
      "order": 1
    },
    {
      "id": "new",
      "name": "Новинка",
      "category": "dark",
      "order": 2
    },
    // ... all theme metadata
  ],
  "version": "1.0.0",
  "format": "unified-theme-store"
}
```

## Benefits of This Format:

✅ **Complete Theme Set** - All 17 theme variants included
✅ **Metadata Preserved** - Categories, names, and order maintained
✅ **Version Control** - Timestamp and version info
✅ **Cross-Platform** - Works in web app, bot, and API
✅ **Validation Ready** - Structure can be validated
✅ **Developer Friendly** - Easy to paste into code or share

## Usage:

1. **Save to Theme Store**: Paste into existing theme definitions
2. **Share with Team**: Send to other developers
3. **Backup Themes**: Keep custom themes safe
4. **API Integration**: Use in external tools
5. **Bot Themes**: Apply to Telegram bot

This format ensures your custom themes work seamlessly across all platforms! 🎨