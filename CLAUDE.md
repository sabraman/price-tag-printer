# CLAUDE.md

Guidance for Claude Code and other coding agents working in this repository.

## Project facts

- Product: Price Tag Generator, a browser editor for printable price tags.
- Framework: Next.js 16 App Router with React 19.2, Turbopack, and TypeScript 7.
- Styling: Tailwind CSS 4 through the `@tailwindcss/postcss` plugin.
- Tests: Vitest 4 with React Testing Library.
- Canonical production URL: `https://print.sabraman.art`.
- API base URL: `https://print.sabraman.art/api`.
- Package manager: Bun 1.3.3. Do not reintroduce pnpm or add a second lockfile.
- Runtime: Node.js 20.9 or newer for local Next.js development and builds.

## Commands

```bash
bun install
bun run dev
bun run lint
bun run format:check
bun run typecheck
bun run test
bun run build
bun run check:discoverability -- https://print.sabraman.art
```

Use the focused test scripts in `package.json` when working on table selection,
duplication, or filtering. Run `bun run build` for release confidence after
code changes; lint, formatting, and typecheck are faster feedback during
iteration.

## Architecture

- `src/app/` contains App Router pages, metadata routes, and API handlers.
- `src/components/features/price-tags/` contains the main import, editing,
  customization, preview, and print flows.
- `src/store/` contains Zustand stores for items, themes, settings, and UI.
- `src/lib/` contains spreadsheet, PDF, browser, theme, and utility code.
- `src/config/site.ts` is the source of truth for public site and GitHub URLs.
- `public/openapi.json` and `public/llms.txt` are public machine-readable
  resources; keep them accurate when API behavior changes.

## Important patterns

- Preserve undo/redo behavior when changing table mutations.
- Keep item IDs stable and avoid introducing duplicate IDs during import or
  duplication.
- Treat prices as the smallest currency unit used by the API integration.
- Keep UI text and metadata consistent with the Russian-language product.
- Keep API routes safe for unauthenticated reads and validate request bodies
  before processing uploaded or imported data.
- Do not put private user data, credentials, or generated product rows into
  sitemap, JSON-LD, `robots.txt`, or `llms.txt`.

## URL and documentation rules

- Use `https://print.sabraman.art` for production links and examples.
- Use `https://github.com/sabraman/price-tag-printer` for repository links.
- Do not reintroduce `your-domain.com`, old Vercel URLs, or placeholder clone
  commands.
- When adding a public route, consider its title, description, canonical URL,
  sitemap entry, and whether it belongs in `llms.txt`.
- When changing an API route, update the OpenAPI document, API guides, and LLM
  context in the same change.

## Quality and commits

- Use Oxfmt for formatting and Oxlint for linting; do not add Biome or ESLint
  configuration back without a deliberate migration plan.
- Next 16 uses Turbopack by default. Keep Node-only integrations behind API
  routes or other server-only modules; never import them into client bundles.
- Keep changes focused and avoid unrelated refactors.
- Run the narrowest relevant tests, then the full validation commands before
  handoff.
- Keep commit messages short and descriptive.
- Do not add Claude as a co-author.

## Convex rule

The current `origin/main` application is the single Next.js app. If a future
branch introduces or changes Convex code, read
`packages/convex/_generated/ai/guidelines.md` completely before editing any
Convex files. Those generated guidelines override general Convex assumptions.
