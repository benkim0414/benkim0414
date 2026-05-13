## 1. Test First

- [ ] 1.1 Add or update focused UI tests for theme mode behavior if token changes affect existing assertions.
- [ ] 1.2 Add or update Playwright smoke coverage for desktop and mobile themed rendering.

## 2. Centralize Theme Tokens

- [ ] 2.1 Map the `DESIGN.md` palette into `apps/github.io/src/styles.css` using CSS variables and Tailwind v4 `@theme inline`.
- [ ] 2.2 Preserve shadcn semantic tokens such as `background`, `foreground`, `card`, `primary`, `secondary`, `muted`, `border`, `input`, and `ring`.
- [ ] 2.3 Add reusable variables or utilities for raised surfaces, violet accent variants, signal/success/warning colors, subtle text, and developer-font accents.
- [ ] 2.4 Keep light, dark, and system theme behavior compatible with the existing theme provider.

## 3. Apply Theme Through Shared Utilities

- [ ] 3.1 Update app markup only where needed to consume centralized tokens or reusable utilities.
- [ ] 3.2 Avoid hard-coded component-by-component theme palettes.
- [ ] 3.3 Keep developer-font usage limited to metadata, counters, tags, path labels, and compact status text.
- [ ] 3.4 Add subtle bits-inspired texture or crisp surface treatment through reusable page/surface classes, not repeated component-specific effects.

## 4. Verify

- [ ] 4.1 Run `git diff --check`.
- [ ] 4.2 Run `pnpm nx test github.io`.
- [ ] 4.3 Run `pnpm nx build github.io`.
- [ ] 4.4 Run `pnpm nx e2e github.io-e2e`.
- [ ] 4.5 Verify desktop and mobile screenshots for readability, focus visibility, no text overflow, and no one-note purple palette.
- [ ] 4.6 Run `pnpm openspec validate apply-github-io-design-theme`.
