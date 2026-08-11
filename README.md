# Price Tag Generator

Price Tag Generator is a web app for turning product data into clean,
print-ready price tags. Import an Excel workbook, connect Google Sheets, paste
tabular data, or enter products manually; then customize the design, preview
the result, and export a PDF for printing.

Live app: [print.sabraman.art](https://print.sabraman.art)

## What it does

- Imports product data from Excel, Google Sheets, pasted tables, or manual entry.
- Edits, filters, sorts, duplicates, and removes products in the browser.
- Supports discounts, multi-tier pricing, labels, fonts, and per-row designs.
- Offers 17 built-in visual themes, including sale, new, monochrome, and color
  themes.
- Previews tags before printing and exports A4, A3, or Letter-friendly PDFs.
- Exposes an OpenAPI-compatible API for automation and AI-assisted workflows.
- Includes QR-code tooling and an API health dashboard.

## Quick start

### Requirements

- Bun 1.3.3 or newer
- Node.js 20.9 or newer (required by Next.js 16)

### Run locally

```bash
bun install
bun run dev
```

Open [http://localhost:3000](http://localhost:3000).

For a production-like run:

```bash
bun run build
bun run start
```

Google Sheets and preview integrations may require the environment variables
used by the deployment. The base editor works without a database or account.

## API and machine-readable resources

The API is available at `https://print.sabraman.art/api`.

- [Interactive API documentation](https://print.sabraman.art/api-docs)
- [OpenAPI JSON](https://print.sabraman.art/openapi.json)
- [OpenAPI route](https://print.sabraman.art/api/openapi)
- [API health](https://print.sabraman.art/api/health)
- [LLM context file](https://print.sabraman.art/llms.txt)
- [LLM integration guide](./LLM_API_GUIDE.md)

Example health check:

```bash
curl https://print.sabraman.art/api/health
```

Example PDF request:

```bash
curl -X POST https://print.sabraman.art/api/generate-pdf-v2 \
  -H "Content-Type: application/json" \
  -d '{
    "items": [
      { "data": "Coffee", "price": 1200, "designType": "default" }
    ],
    "format": "A4"
  }' \
  --output price-tags.pdf
```

Prices are sent in the smallest currency unit used by the integration, such
as kopeks or cents. See the [quickstart](./quickstart.mdx) and the
[OpenAPI specification](https://print.sabraman.art/openapi.json) for complete
schemas and examples.

## Excel data

The importer accepts `.xlsx` files and maps product columns into the editor.
The most useful columns are:

- Product name or `data`
- `price`
- Optional discount, bulk-price, SKU, design, and label fields

Russian-language workbooks and pasted tabular data are supported. If a source
uses different column names, import it and adjust the rows in the editor before
printing.

## Development commands

| Command                                  | Purpose                                |
| ---------------------------------------- | -------------------------------------- |
| `bun run dev`                            | Start the Next.js development server   |
| `bun run build`                          | Build the application for production   |
| `bun run start`                          | Start the production build             |
| `bun run lint`                           | Run Oxlint                             |
| `bun run lint:fix`                       | Apply Oxlint's safe fixes              |
| `bun run format`                         | Format supported files with Oxfmt      |
| `bun run format:check`                   | Check formatting without writing files |
| `bun run typecheck`                      | Run TypeScript without emitting files  |
| `bun run test`                           | Run the Vitest test suite              |
| `bun run check:discoverability -- <url>` | Check public SEO/GEO/LLM surfaces      |

Focused table tests are available through `bun run test:selection`,
`bun run test:duplication`, `bun run test:duplication-ui`, and
`bun run test:selection-filtering`.

## Project structure

```text
src/
  app/                 Next.js App Router pages and API routes
  components/          Feature and shadcn/ui components
  config/              Site metadata, fonts, and domain settings
  hooks/               React hooks for editor and browser behavior
  lib/                 Spreadsheet, PDF, browser, theme, and utility code
  services/            Price calculation services
  store/               Zustand state stores
  tests/               Vitest and React Testing Library tests
public/
  openapi.json         LLM-friendly OpenAPI document
  llms.txt             Curated context for agents and answer engines
api-reference/         Mintlify-style API reference pages
```

The editor is a client-side React experience mounted by the Next.js App Router.
Zustand owns persistent editor state; PDF generation uses `pdf-lib` and the
browser/Node preview helpers; spreadsheet imports use `xlsx` and the Google
Sheets integration. The app uses Next.js 16 with Turbopack, Tailwind CSS 4,
React Compiler, TypeScript 7, and Vitest 4.

## Discoverability

The site publishes canonical metadata, structured data, `robots.txt`, a
sitemap, an OpenAPI document, and an `llms.txt` context file. Run the local
checker against a deployed or local URL after changing public metadata:

```bash
bun run check:discoverability -- https://print.sabraman.art
```

This checks the public HTML, crawler directives, sitemap, LLM context, OpenAPI
server URL, and placeholder domains. It does not make claims about whether a
particular AI engine will cite the site.

GitHub Actions runs OSV-Scanner on pull requests and on a weekly schedule to
detect known vulnerabilities in the Bun lockfile.

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md) for setup and pull-request guidance.
Security reports should follow [SECURITY.md](./SECURITY.md). Please do not
include credentials, private product data, or production secrets in issues or
pull requests.

## Links

- [Live application](https://print.sabraman.art)
- [API documentation](https://print.sabraman.art/api-docs)
- [GitHub repository](https://github.com/sabraman/price-tag-printer)
