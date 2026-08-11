# Repository and Discoverability Refresh

## Objective

Bring the repository and the existing Next.js website up to a publishable,
machine-readable baseline using the current GitHub version as the starting
point. The public canonical origin will be `https://print.sabraman.art`.

The work will improve four connected surfaces:

1. Human contributors: README, agent instructions, contribution guidance, and
   GitHub issue/PR entry points.
2. Developers and API consumers: consistent production URLs in the API docs,
   OpenAPI document, examples, and LLM guide.
3. Search engines: canonical metadata, social metadata, structured data,
   robots rules, and a sitemap.
4. Answer engines and coding agents: a standards-shaped `llms.txt`, a complete
   API discovery path, and a repeatable discoverability audit.
5. Local development: Bun as the package manager and Oxc as the formatter and
   linter.

The existing Next.js application remains the deployed product. This pass does
not migrate to the parked Astro/Convex work, change routing, or redesign the
application UI. The dependency refresh also brings the active app to Next.js
16/Turbopack, Tailwind CSS 4, React Compiler, TypeScript 7, and Vitest 4.

## Baseline

- Source branch: a fresh `chore/repo-seo-refresh` branch from `origin/main`.
- Application: Next.js App Router with a React client editor at `/`.
- Existing public documentation: `/api-docs`, `/api-health`, `/openapi.json`,
  `/api/llms`, `public/llms.txt`, and Markdown/MDX API guides.
- Current issues: README placeholders, stale framework/version descriptions,
  missing `AGENTS.md`, placeholder API origins, minimal metadata, no generated
  robots or sitemap routes, an empty GitHub description, and an old GitHub
  homepage URL.

## Chosen approach

Use a focused repository-and-discoverability pass on the existing application.
This is preferable to a landing-page migration because it makes the live
origin accurate immediately and keeps the change set reviewable. A separate
Astro landing experience can be introduced later without invalidating the
canonical URL and documentation contracts established here.

The external guidance/checking references are:

- `resciencelab/opc-skills` `seo-geo` for SEO/GEO content and crawler checks.
- `seo-skills/seo-audit-skill` for a broad technical audit with SEO and GEO
  rules.
- `Auriti-Labs/geo-optimizer-skill` as a GEO-specific comparison tool when a
  live citation-readiness audit is useful.
- `AnswerDotAI/llms-txt` as the format reference for the root `llms.txt`.

These tools guide and validate the work; the repository will not depend on an
agent skill at runtime.

The repository toolchain will also move from pnpm/Biome to Bun/Oxc during this
pass. This keeps the migration explicit and prevents the README and agent
instructions from documenting two competing workflows.

## Design

### 1. Repository and GitHub presentation

Rewrite `README.md` around the real product: importing product data, editing
and previewing price tags, applying themes, and exporting print-ready PDFs.
It will include the live demo, API/docs links, current commands, architecture,
configuration notes, supported data formats, and contribution guidance. All
clone commands will use the real repository URL.

Update `CLAUDE.md` to remove stale Telegram/Vite claims, document the current
Next.js structure and commands, and explain the canonical URL/API surfaces.
Add `AGENTS.md` as the concise project-wide instruction source, including the
existing Convex rule for any future Convex work.

Add lightweight GitHub contribution surfaces where they are missing:

- `CONTRIBUTING.md` with setup, checks, and pull-request expectations.
- `SECURITY.md` with a private vulnerability-reporting path.
- A pull-request template and issue templates for bugs and feature requests.
- A Bun/Oxc/Next validation workflow and Dependabot configuration so the
  repository stays current after the migration.

Use the authenticated GitHub CLI after the local changes are validated to set:

- Description: a concise description of the open-source price-tag generator.
- Homepage: `https://print.sabraman.art`.
- Topics covering price tags, retail, printing/PDF, React, Next.js,
  TypeScript, Excel, Google Sheets, OpenAPI, and LLM integrations.

Do not create a semantic release tag in this documentation pass; a release tag
should represent a deployed product version and can be created when this work
is merged and deployed.

### 2. Canonical URL contract

Define one production origin, `https://print.sabraman.art`, and use it for
public-facing URLs. Keep `https://github.com/sabraman/price-tag-printer` for
repository links.

Replace `your-domain.com`, `yourusername`, the old Vercel homepage, and the
stale docs hostname in README/API/OpenAPI/LLM examples with the canonical
origin. The API base becomes `https://print.sabraman.art/api`.

Centralize the URL in application metadata where code can reference it, while
keeping static Markdown/JSON examples explicit and copyable. Remove all
placeholder-domain occurrences from tracked documentation before completion.

### 3. Technical SEO surfaces

Expand the existing Next metadata with:

- `metadataBase` and a canonical alternate for the site origin.
- A descriptive Russian title/description suitable for the editor and API.
- Open Graph and Twitter card metadata, including the canonical URL.
- Application name and language-consistent metadata.
- A JSON-LD block describing the web application and its publisher.

Add App Router metadata routes:

- `src/app/robots.ts` allows public product/docs pages, advertises the sitemap,
  and avoids crawling operational API paths.
- `src/app/sitemap.ts` lists the human-readable product, API documentation,
  health, and marketing routes that are actually present.

Do not expose private credentials or user-generated product data through any
SEO surface. API responses remain operational resources, not sitemap entries.

### 4. LLM/GEO discovery

Rewrite `public/llms.txt` to follow the `llms.txt` convention: an H1, a concise
blockquote summary, short interpretation notes, and grouped Markdown links to
the live app, API documentation, health endpoint, OpenAPI document, and API
guide. It must state the production base URL and avoid claiming endpoints that
do not exist.

Keep `/api/llms` as the machine-readable route, but make its fallback match the
same canonical content. Update `public/openapi.json` so its server URL and
descriptions are production-accurate. Keep the existing API docs links to the
LLM file and OpenAPI document working.

Content will use answer-first headings, explicit endpoint names, stable links,
and concise definitions so both search crawlers and retrieval systems can
identify what the product is, who it serves, and how to use it.

### 5. Repeatable checker

Add a dependency-free Node checker at
`scripts/check-discoverability.mjs`, invoked as:

```bash
bun run check:discoverability -- https://print.sabraman.art
```

The checker will fetch the origin and verify:

- Root HTML status, language, title, description, H1, canonical, Open Graph,
  and JSON-LD presence.
- `robots.txt` and `sitemap.xml` status and required references.
- `llms.txt` format markers, production links, and absence of placeholders.
- `openapi.json` status and canonical server URL.
- No `your-domain.com`, `yourusername`, or old Vercel origin in the audited
  public content.

It will print human-readable PASS/FAIL results and exit non-zero on failures.
The external audit tool and Lighthouse will be used as supplemental validation
when the live deployment is reachable; the local checker remains the stable
repository check that does not require Python, credentials, or third-party
accounts.

### 6. Bun and Oxc toolchain

Migrate local package management from pnpm to Bun:

- Declare Bun 1.3.3 in `package.json`.
- Keep `bun.lock` and remove the pnpm lockfile.
- Use `bun install`, `bun run`, and `bunx` in documentation and contributor
  instructions.

Replace Biome and the standalone ESLint configuration with Oxc:

- Add the `oxlint` and `oxfmt` development packages.
- Add `.oxlintrc.json` and `.oxfmtrc.json` with repository-wide ignores and
  formatting settings matching the existing tab/semicolon style.
- Make `bun run lint` run Oxlint and add `bun run lint:fix`.
- Make `bun run format` write with Oxfmt and `bun run format:check` verify
  without changing files.
- Remove Biome/ESLint-only scripts, configuration, dependencies, and comments
  once Oxlint and Oxfmt pass over the source tree.

The Oxc migration is tooling-only: it must not change runtime behavior or
silently reformat generated assets, lockfiles, or build output. The framework
and dependency refresh is separate and includes the server/client boundary
fixes required by Turbopack.

## Validation

Before handoff, run:

```bash
bun install --frozen-lockfile
bun run lint
bun run format:check
bun run typecheck
bun run test -- --run
bun run build
bun run check:discoverability -- https://print.sabraman.art
```

Also verify with `gh repo view` that the description, homepage, and topics were
updated, and inspect the final diff for placeholder URLs. A production URL
check may continue to report old metadata until this branch is deployed; that
distinction will be called out in the handoff.

## Non-goals

- No changes to the parked `wip/forgot-to-start` branch.
- No migration to the Astro landing app or Convex architecture in this pass.
- No new analytics provider, cookies, user tracking, or paid SEO service.
- No claim that `llms.txt` guarantees citations by any particular AI engine.
- No release tag until the validated changes represent a deployed release.
- No runtime package-manager changes beyond Bun, and no automatic source
  reformatting of generated assets.
