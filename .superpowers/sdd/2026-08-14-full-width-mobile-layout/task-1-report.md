# Task 1 Report: Full-width mobile application frame

## Outcome

Removed the 448 px global frame cap and automatic centering. The global frame now emits only `width: 100%`, `height: 100dvh`, and `overflow: hidden`. The skill-detail content stack no longer applies a page-local StyleX width/centering rule. No responsive breakpoint or alternate layout was introduced.

## Files changed

- `apps/github.io/src/app/global-navigation-layout.tsx`
  - Removed `maxWidth: '448px'` and `marginInline: 'auto'` from `styles.frame`.
- `apps/github.io/src/app/skills/skill-detail-page.tsx`
  - Removed the `page` StyleX object and its unused `spacingVars` import.
  - Removed `xstyle={styles.page}` from the detail content `VStack`.
  - Added `data-testid="skill-detail-content"` as a stable test marker.
- `apps/github.io/src/app/skills/skill-detail-page.spec.tsx`
  - Added coverage that the detail content stack has the same generated StyleX class contract as an otherwise-identical stack with no local style.
- `apps/github.io/scripts/verify-global-layout-css.mjs`
  - Requires the emitted global-frame width, dynamic viewport height, and hidden overflow declarations.
  - Rejects any frame-bound `max-width` or `margin-inline` declaration, plus `min-height:100vh`.
  - Rejects a detail-page centering rule or an applied `styles.page` xstyle.

The existing global-navigation and app route tests already rejected legacy utility width constraints and retained the one-scroll-owner assertions at this branch head, so no artificial churn was added to those files.

## RED evidence

Command:

```bash
pnpm nx test github.io -- --run src/app/global-navigation-layout.spec.tsx src/app/app.spec.tsx src/app/skills/skill-detail-page.spec.tsx
pnpm nx verify-global-layout-css github.io --skip-nx-cache
```

Results before production changes:

- Focused test run failed as expected: `skill-detail-content` did not exist.
- Build-backed verifier failed as expected: `Global frame includes forbidden declaration: max-width:448px`.

## GREEN evidence

Command:

```bash
pnpm nx test github.io -- --run src/app/global-navigation-layout.spec.tsx src/app/app.spec.tsx src/app/skills/skill-detail-page.spec.tsx
pnpm nx verify-global-layout-css github.io --skip-nx-cache
```

Results:

- 3 focused files passed: 26 tests.
- The fresh build-backed verifier passed and reported the compiled global frame, Home layout, and detail width rules as verified.

After review hardening, the focused 26-test run, lint, and fresh build-backed verifier passed again.

## Complete verification

All commands exited 0:

```bash
pnpm nx lint github.io --skip-nx-cache
pnpm nx test github.io --skip-nx-cache
pnpm nx build github.io --skip-nx-cache
pnpm nx build-storybook github.io --skip-nx-cache
```

- Lint completed with 28 existing warnings in unrelated test files; no errors.
- Full test suite passed: 61 files, 590 tests.
- Application build passed.
- Storybook build passed.

Known non-failing warnings recorded by the commands:

- Nx Vite TypeScript-path plugin deprecation.
- jsdom `HTMLCanvasElement.getContext` and `window.scrollTo` not-implemented messages from existing Astryx test behavior.
- Lightning CSS warnings for Tailwind `@theme` and `@tailwind` rules.
- Vite chunk-size warning.

## Source and route inspection

Inspected all application route-level page styles:

- `/` Home uses a flex page rule only; no maximum-width or centering rule.
- `/skills` relies on `LayoutContent`; no page-level maximum-width or centering rule.
- `/skills/:skillId` had the removed local page width/centering rule.
- The separate `*` Not Found route retains its own constrained document-style column. It is outside the global application frame and out of this task's requested Home/Skills/detail scope.

Retained component-local width protections, including the detail metadata value item `maxWidth: '100%'`, cards, charts, and responsive component styles. No component-local rule was removed.

## Verifier design adjustment

The brief's example detail-source rejection for every `maxWidth:` was too broad: `metadataValueItem` legitimately uses `maxWidth: '100%'`. The verifier now checks the intended detail page application contract (`marginInline:` and `xstyle={styles.page}`) and uses the emitted frame class bindings to reject any global frame maximum-width. This preserves the full-width contract without rejecting unrelated component-local sizing.

## UI guidance checked

Checked official Astryx layout, styling, `Layout`, and `VStack` documentation before changing UI code. The change keeps the existing `Layout` shell and `VStack` composition, spacing, landmark, and scroll ownership.

## Self-review

- Ran `git diff --check` successfully.
- Confirmed the frame has only the three requested declarations.
- Confirmed detail has no `styles.page`, `xstyle={styles.page}`, or page-local `marginInline`.
- Confirmed no responsive breakpoints were added.
- Independent review found one verifier gap: it initially rejected only `max-width:448px`; this was corrected to reject any frame-bound maximum-width declaration, then re-verified.
- Final read-only correctness review reported no defects. No remaining actionable findings.

## Commit

Created local commit with the requested conventional subject:

```text
fix(github.io): use full-width mobile layout
```

## Concerns and pending QA

- Real iPad portrait/landscape QA is intentionally pending controller coordination. No dev server was started.
- No other functional concern remains from automated validation.

## Fix round 1: in-frame unknown skill Not Found layout

### Finding addressed

`/skills/not-real` is resolved by `SkillDetailRoute` inside the global frame. It previously rendered the same constrained `NotFoundPage` used by the standalone wildcard route, so the detail-route page could retain a centered maximum-width column even when the global-frame verifier passed.

### Files changed

- `apps/github.io/src/app/not-found-page.tsx`
- `apps/github.io/src/app/not-found-page.spec.tsx`
- `apps/github.io/src/app/skills/skill-detail-route.tsx`
- `apps/github.io/src/app/app.spec.tsx`
- `apps/github.io/scripts/verify-global-layout-css.mjs`

### TDD evidence

RED command:

```bash
pnpm nx test github.io -- --run src/app/app.spec.tsx src/app/not-found-page.spec.tsx; pnpm nx verify-global-layout-css github.io --skip-nx-cache
```

Result: exited non-zero as expected. The unknown skill and wildcard route assertions both received no layout variant, and the verifier failed with `Unknown skill routes must render the full-width not found page.` The first focused unit-test draft also exposed that StyleX emits class names rather than inline styles; it was replaced with a stable comparison against an equivalent unstyled `VStack` control.

GREEN command:

```bash
pnpm nx test github.io -- --run src/app/app.spec.tsx src/app/not-found-page.spec.tsx && pnpm nx verify-global-layout-css github.io --skip-nx-cache
```

Result: exited 0. The focused suite passed 17 tests in 2 files. The fresh build-backed verifier passed and printed `Verified compiled global frame, Home layout, and detail width rules`.

### Implementation and verifier changes

- Added the optional `NotFoundPage.isFullWidth` variant. Its default continues applying `styles.page`, preserving the standalone wildcard route's existing maximum-width and centered layout.
- `SkillDetailRoute` passes `isFullWidth`, so only unknown skills rendered in the application frame omit the page constraint.
- Route tests distinguish `/skills/not-real` (`data-layout="full-width"` and global search) from `/not-a-route` (`data-layout="standalone"` and no global search).
- The focused page test proves the full-width variant receives the same generated StyleX classes as an otherwise identical unconstrained `VStack`, while the default does not.
- The CSS/source verifier now reads both route and Not Found sources: it requires the in-frame variant wiring and the conditional `xstyle`, but deliberately permits the default standalone constraint.

### Source inspection and self-review

- Confirmed `SkillDetailRoute` is the only supported detail-route Not Found branch and it is rendered beneath the global layout.
- Confirmed the wildcard `*` route continues to render `NotFoundPage` with its default constrained layout outside that frame.
- Ran `git diff --check` successfully; no responsive styles or component-local width rules were changed.

### Complete verification

All commands exited 0:

```bash
pnpm nx lint github.io --skip-nx-cache
pnpm nx test github.io --skip-nx-cache
pnpm nx build github.io --skip-nx-cache
```

- Lint: 28 pre-existing warnings, 0 errors.
- Full tests: 61 files, 591 tests passed.
- Build passed.
- Existing non-failing Vite, jsdom, Lightning CSS, and chunk-size warnings remain unchanged.

### Commit and concerns

- Commit subject: `fix(github.io): keep unknown skills full width`.
- No dev server was started. Real iPad QA remains controller-coordinated.
