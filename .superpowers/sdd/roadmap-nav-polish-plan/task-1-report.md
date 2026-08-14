# Task 1 implementation report

## Outcome

Implemented the GitHub.io global navigation shell adjustment:

- Wrapped the routed `<Outlet />` in Astryx `LayoutContent` with `padding={0}` while retaining the `100dvh`/hidden-overflow shell.
- Kept the existing `isSelected` route predicates and added a selected-only `xstyle` override after `TopNavItem`'s built-in selected styles.
- The override uses transparent default background, primary text, medium font weight, hover overlay, and pressed overlay.
- Updated the shell test to require exactly one layout content element that contains the routed test content.
- Added a rendered StyleX control comparison proving selected navigation uses the text-only style rather than the default selected fill/semibold style.
- Updated the unknown-skill route integration assertion to account for its existing page-local `LayoutContent` nested inside the newly required global shell content.

## TDD evidence

### RED

Ran before production changes:

```sh
pnpm nx test github.io --run src/app/global-navigation-layout.spec.tsx
```

The focused suite failed as intended:

1. The shell contained zero `.astryx-layout-content` elements rather than one.
2. The selected Roadmap link's generated StyleX classes did not match the text-only selected control.

### GREEN

After the minimal implementation, the same focused command passed: 1 test file, 8 tests.

## Final verification

```sh
pnpm nx test github.io
pnpm nx lint github.io
pnpm nx build-storybook github.io
git diff --check
```

- `test`: 65 files and 613 tests passed.
- `lint`: completed with no errors; it reports 28 pre-existing warnings in unrelated tests.
- `build-storybook`: completed successfully. Existing Vite warnings remain for Tailwind at-rules and large chunks.
- `git diff --check`: clean.

## Self-review

Reviewed the final three-file app diff. The changes preserve navigation destinations, search behavior, and route matching. Only the app-level recovery test was adjusted, because that route already intentionally renders its own `LayoutContent` and is now nested in the mandated global content wrapper.

## Concern

Several routed page components—including the unknown-skill recovery page—already render page-local `LayoutContent` regions. The new global wrapper therefore nests them in the integrated app. This task intentionally leaves page content unchanged, per scope; a follow-up could consolidate those regions if one physical scroll container for every route is required.

## Fix Round 1: remove nested routed scroll regions

The review correctly identified that the global shell wrapper was not the single scroll owner: Home, Skills, skill detail, and full-width recovery each still rendered their own scrollable `LayoutContent`.

### RED

Before production changes, updated each affected page unit test to require zero page-local `.astryx-layout-content` elements and updated integrated route tests to require exactly one shell-owned content region. Ran:

```sh
pnpm nx test github.io --run src/app/skills/home-page.spec.tsx src/app/skills/skills-page.spec.tsx src/app/skills/skill-detail-page.spec.tsx src/app/not-found-page.spec.tsx src/app/app.spec.tsx
```

Result: 5 files ran, with 9 expected failures. The four page tests observed their existing local layout content; the integration assertions observed two regions on Home, Skills, detail, and recovery routes.

### GREEN

Replaced only the routed pages' outer `LayoutContent` with semantic, non-scrollable `VStack` roots. Their `main` landmarks, accessible labels, padding, gaps, widths, and content remain intact. The shell's `LayoutContent` is now the only routed scroll region.

Reran the same focused command: 5 files and 40 tests passed.

### Final verification

```sh
pnpm nx test github.io
pnpm nx lint github.io
pnpm nx build-storybook github.io
pnpm exec prettier --check apps/github.io/src/app/app.spec.tsx apps/github.io/src/app/not-found-page.tsx apps/github.io/src/app/not-found-page.spec.tsx apps/github.io/src/app/skills/home-page.tsx apps/github.io/src/app/skills/home-page.spec.tsx apps/github.io/src/app/skills/skills-page.tsx apps/github.io/src/app/skills/skills-page.spec.tsx apps/github.io/src/app/skills/skill-detail-page.tsx apps/github.io/src/app/skills/skill-detail-page.spec.tsx
git diff --check
```

- Full test suite: 65 files and 613 tests passed.
- Lint: no errors; the same 28 pre-existing unrelated warnings remain.
- Storybook build: passed; existing Vite Tailwind-at-rule and chunk-size warnings remain.
- Prettier and diff checks: passed.

### Self-review

Confirmed `LayoutContent` appears in routed application code only in `GlobalNavigationLayout`. The integration tests require exactly one `.astryx-layout-content` for Home, Roadmap, Skills, skill detail, and unknown-skill recovery routes; page-level tests prevent reintroducing local scroll owners.

## Final review fix wave

Updated only the registered GitHub.io layout verifiers and their self-tests.

### Files

- `apps/github.io/scripts/verify-global-layout-css.mjs`
  - Audits NotFound's returned `VStack` with `data-layout="full-width"` as the routed semantic root, while continuing to exclude the constrained standalone branch.
  - Replaces the obsolete `LayoutContent` source requirement and adds a real NotFound root-count self-test.
- `apps/github.io/scripts/verify-mobile-layout-browser.mjs`
  - Changes every framed route to the uniquely shell-owned `.astryx-layout-content:has(> main)` owner, adds `/roadmap`, and uses semantic `main[...]` selectors.
  - Retains width, focus, scroll-owner, and Home content-motion checks. Page width is measured against the shell scroll viewport's `clientWidth`, which correctly excludes Firefox's scrollbar.
  - Adds self-tests for the framed route matrix, nested Command Palette layout-content exclusion, semantic main selectors, Roadmap coverage, and shell scroll-viewport width.

### RED

Changed the self-tests first and ran each stale validator version. The expected failures were captured with these commands:

```sh
node apps/github.io/scripts/verify-global-layout-css.mjs --self-test
node apps/github.io/scripts/verify-mobile-layout-browser.mjs --self-test
```

- CSS exited 1 because `src/app/not-found-page.tsx has no recognized page root`.
- Browser exited 1 because all framed routes still named their page `main` as the scroll owner instead of shell layout content.
- Follow-up browser self-test RED runs also caught the stale explicit `[role="main"]` selectors, the ambiguous generic `.astryx-layout-content` selector (the Command Palette owns another one), and viewport-width comparison that ignored the shell scrollbar.

### GREEN

After the minimal verifier changes, both self-test suites passed:

```sh
node apps/github.io/scripts/verify-global-layout-css.mjs --self-test
node apps/github.io/scripts/verify-mobile-layout-browser.mjs --self-test
```

Registered target verification passed:

```sh
pnpm nx run github.io:verify-global-layout-css
pnpm nx run github.io:verify-mobile-layout-browser
```

- The compiled CSS verifier passed.
- The browser verifier passed all six routes (`/`, `/roadmap`, `/skills`, skill detail, unknown-skill recovery, and standalone wildcard) at 375x667 and 820x1180. It confirmed one shell scroll owner, no horizontal overflow, Home content motion, and detail-heading focus.

Relevant full checks passed:

```sh
pnpm nx test github.io
pnpm nx lint github.io
pnpm exec prettier --check apps/github.io/scripts/verify-global-layout-css.mjs apps/github.io/scripts/verify-mobile-layout-browser.mjs
git diff --check
```

- Tests: 65 files and 613 tests passed.
- Lint: no errors; the existing 28 unrelated warnings remain.
- Prettier and diff checks passed.

### Self-review and concerns

Reviewed the final two-script diff. The shell selector deliberately requires a direct routed `main` child, preventing the always-mounted Command Palette's nested `LayoutContent` from being mistaken for the page scroll owner. Firefox's visible scrollbar is intentionally excluded through `clientWidth`; this preserves a full-width assertion for the actual scrollable content viewport. No remaining concerns.
