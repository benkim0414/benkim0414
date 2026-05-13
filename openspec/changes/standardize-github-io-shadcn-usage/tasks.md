## 1. Inspect Existing UI Primitives

- [x] 1.1 Confirm the app-local shadcn component inventory under `apps/github.io/src/components/ui`.
- [x] 1.2 Confirm `apps/github.io/components.json` still uses shadcn CSS variables and local aliases.

## 2. Apply shadcn Usage Rules

- [x] 2.1 Replace inline action/link button styling with the existing `Button` primitive where the interaction matches.
- [x] 2.2 Keep search inputs, filters, labels, result cards, badges, and chips as semantic HTML when no local shadcn primitive exists.
- [x] 2.3 Avoid running shadcn CLI commands or adding new UI component files.
- [x] 2.4 Preserve existing search, filter, URL, and theme behavior.

## 3. Verify

- [x] 3.1 Run `git diff --check`.
- [x] 3.2 Run `pnpm nx test github.io`.
- [x] 3.3 Run `pnpm nx build github.io`.
- [x] 3.4 Run `pnpm openspec validate standardize-github-io-shadcn-usage`.
