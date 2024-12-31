# Price Tag Generator

Web application for generating and printing price tags. Built with React, TypeScript, and Vite.

## Features

- Generate customizable price tags
- Import data from Excel files
- Google Sheets integration
- Real-time preview of price tags
- Responsive UI
- Multiple tag layout options
- Automatic text size adjustment

## Tech Stack

- React 18
- TypeScript
- Vite
- TailwindCSS
- Shadcn
- PDF-lib for PDF generation
- XLSX for Excel file handling
- Google Sheets API integration

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

2. Preview your tags

3. Print your tags:
   - Generate PDF
   - Direct printing
