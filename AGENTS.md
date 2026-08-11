# Agent instructions

This repository is the Next.js application for Price Tag Generator.

## Source of truth

- Production site: `https://print.sabraman.art`
- API base: `https://print.sabraman.art/api`
- Repository: `https://github.com/sabraman/price-tag-printer`
- Public URL constants: `src/config/site.ts`
- Package manager: Bun 1.3.3
- Runtime: Node.js 20.9 or newer
- Framework: Next.js 16 with Turbopack, Tailwind CSS 4, and React Compiler

Use Bun and the existing scripts in `package.json`. Use Oxfmt for formatting
and Oxlint for linting. Keep the Next.js App Router, API docs, OpenAPI
document, and `llms.txt` synchronized when changing public behavior.

Before handoff, run the relevant lint, format check, typecheck, tests, build,
and `bun run check:discoverability -- <url>` commands. Avoid unrelated
refactors and never add secrets or private product data to tracked files.

If a future branch contains Convex code, read
`packages/convex/_generated/ai/guidelines.md` before touching it. The generated
Convex guidance is authoritative for Convex APIs and patterns.
