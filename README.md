# Price Tag Generator

Web application for generating and printing price tags. Built with React, TypeScript, and Vite.

## Features

- Generate customizable price tags
- Import data from Excel files
- Google Sheets integration
- Real-time preview of price tags
- Dashboard for managing price tags
- Multiple tag layout options
- Automatic text size adjustment
- Print-ready PDF generation

## Tech Stack

- React 18
- TypeScript
- Vite
- TailwindCSS
- Shadcn UI components
- PDF-lib for PDF generation
- XLSX for Excel file handling
- Google Sheets API integration

## Project Structure

```
price-tag-printer/
  ├── public/           # Static assets
  ├── src/
  │   ├── app/          # Application pages
  │   │   └── dashboard/ # Dashboard components
  │   ├── assets/       # Media assets
  │   ├── components/   # Reusable components
  │   │   └── ui/       # Shadcn UI components
  │   ├── hooks/        # Custom React hooks
  │   ├── lib/          # Library code and utilities
  │   ├── pages/        # Page components
  │   ├── store/        # State management
  │   └── utils/        # Utility functions
  └── ...               # Configuration files
```

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- pnpm (recommended) or npm

### Installation

1. Clone the repository:

```bash
git clone https://github.com/yourusername/price-tag-generator.git
cd price-tag-generator
```

2. Install dependencies:

```bash
pnpm install
```

3. Start the development server:

```bash
pnpm dev
```

The application will be available at `http://localhost:5173`

### Building for Production

To create a production build:

```bash
pnpm build
```

To preview the production build:

```bash
pnpm preview
```

## Usage

1. Choose your data input method:
   - Upload an Excel file
   - Connect to Google Sheets
   - Manual data entry

2. Customize your price tags:
   - Select layout template
   - Adjust text sizes and positioning
   - Add logos or images (if supported)

3. Preview your tags in real-time

4. Print your tags:
   - Generate PDF for printing
   - Direct printing from browser

## Excel File Format

The application expects Excel files with the following structure:
- Column names should match the fields needed for price tags (e.g., name, price, SKU)
- Russian Excel files are supported (like the included "Объединенный_прайс.xlsx")

## Development

### Available Scripts

- `pnpm dev` - Start development server
- `pnpm build` - Build for production
- `pnpm preview` - Preview production build
- `pnpm lint` - Run ESLint

## Bot Deployment

### Development
```bash
pnpm bot:dev  # Runs src/telegram-bot.ts with full features
```

### Production
**IMPORTANT**: Always use the main bot file for production:

```bash
# Recommended: Use the npm script
pnpm bot:prod

# Or manually
tsx src/telegram-bot.ts

# For compiled version
node dist/telegram-bot.js
```

**⚠️ CRITICAL: DO NOT use `simple-bot.mjs` in production** - it lacks Google Sheets functionality.

### Bot Features Comparison
- **`src/telegram-bot.ts`** ✅ Full bot with Excel + Google Sheets + all features
- **`simple-bot.mjs`** ❌ Basic bot with Excel only (for testing)
- **`bot-dev.mjs`** ❌ Minimal test bot (just /start command)

### Environment Variables

**Development:**
- `TELEGRAM_BOT_TOKEN=your_bot_token_here`
- API URL automatically uses `http://localhost:3000`

**Production:**
- `TELEGRAM_BOT_TOKEN=your_bot_token_here`
- `NEXTJS_API_URL=https://your-production-domain.com`
- `NODE_ENV=production`

The bot automatically detects the environment:
- **Development**: Always uses `localhost:3000` for API calls
- **Production**: Uses `NEXTJS_API_URL` environment variable
