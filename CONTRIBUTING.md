# Contributing

Thanks for helping improve Price Tag Generator.

## Local setup

```bash
git clone https://github.com/sabraman/price-tag-printer.git
cd price-tag-printer
bun install
bun run dev
```

Use Bun 1.3.3 and Node.js 20.9+. Do not commit `.env` files, credentials,
private product data, build output, or generated user files.

## Before opening a pull request

Run the checks relevant to your change:

```bash
bun run lint
bun run format:check
bun run typecheck
bun run test
bun run build
```

For public routes, metadata, API docs, or machine-readable resources also run:

```bash
bun run check:discoverability -- https://print.sabraman.art
```

If the production site does not yet contain your branch, run the checker
against a local server instead.

## Pull requests

- Explain the user-facing or maintenance problem being solved.
- Keep the change focused and include tests or verification notes.
- Update README/API/OpenAPI/LLM documentation when public behavior changes.
- Include screenshots for meaningful UI changes.
- Do not include secrets, personal data, or unrelated formatting churn.
