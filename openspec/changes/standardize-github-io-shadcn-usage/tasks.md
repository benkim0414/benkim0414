## 1. Inspect Existing UI Primitives

- [ ] 1.1 Confirm the app-local shadcn component inventory under `apps/github.io/src/components/ui`.
- [ ] 1.2 Confirm `apps/github.io/components.json` still uses shadcn CSS variables and local aliases.

## 2. Apply shadcn Usage Rules

- [ ] 2.1 Replace inline action/link button styling with the existing `Button` primitive where the interaction matches.
- [ ] 2.2 Keep search inputs, filters, labels, result cards, badges, and chips as semantic HTML when no local shadcn primitive exists.
- [ ] 2.3 Avoid running shadcn CLI commands or adding new UI component files.
- [ ] 2.4 Preserve existing search, filter, URL, and theme behavior.

## 3. Verify

- [ ] 3.1 Run `git diff --check`.
- [ ] 3.2 Run `pnpm nx test github.io`.
- [ ] 3.3 Run `pnpm nx build github.io`.
- [ ] 3.4 Run `pnpm openspec validate standardize-github-io-shadcn-usage`.
