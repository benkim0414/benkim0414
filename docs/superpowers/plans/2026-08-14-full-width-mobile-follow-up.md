# Full-Width Mobile Follow-up Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Close the final two review blockers by making every linked skill row exactly anchor-owned and making full-width verification resistant to JSX abstraction and class-name constraints.

**Architecture:** Remove Astryx list dividers from the linked skills catalog because Astryx owns divider borders on the outer `<li>`, outside its anchor. Add a durable Firefox browser verifier as the effective-geometry authority for every route, while strengthening the existing AST verifier to fail when it recognizes no page root or sees class-based width constraints.

**Tech Stack:** React 19, TypeScript, Astryx Design, StyleX, Vitest, Nx, Vite, Node 24, Firefox WebDriver BiDi

**Spec:** `docs/superpowers/specs/2026-08-14-full-width-mobile-layout-design.md`

## Global Constraints

- Home, Skills, resolved detail, and unresolved skill-detail routes fill the viewport width and retain one persistent global navigation.
- Skill-list navigation uses one native anchor whose rectangle exactly equals the list-row rectangle; no inert padding or divider strip may remain outside it.
- Preserve 36×36 px linked skill avatars and the existing anchor-owned spacing.
- Use Astryx components and supported variants; do not simulate navigation with outer-row JavaScript click handlers.
- Keep the mobile-first single-column UI at every viewport size; add no responsive redesign.
- The effective full-width contract must be validated in a committed, repeatable real-browser script, not only by source strings or generated class names.
- Retain AST/CSS checks as defense in depth, and make them fail closed when page-root recognition is incomplete.
- Add no dependencies.
- Follow red-green-refactor, stage explicit paths only, and use conventional commit subjects.

---

### Task 1: Exact full-row skill links

**Files:**
- Modify: `apps/github.io/src/app/skills/skill-list.tsx`
- Modify: `apps/github.io/src/app/skills/skill-list.spec.tsx`
- Modify: `apps/github.io/src/app/skills/skill-list-item.spec.tsx`

**Interfaces:**
- Consumes: existing `SkillList`, `SkillListItem`, Astryx `List` and `ListItem`.
- Produces: a linked catalog with no outer `<li>` divider or padding geometry outside each native anchor.

- [ ] **Step 1: Add failing regression coverage**

Update the list tests to assert the linked catalog does not request Astryx outer dividers and that each linked item keeps its root padding at zero. Use rendered DOM/style semantics rather than mocking navigation.

```tsx
const list = getByRole('list');
const rows = within(list).getAllByRole('listitem');

expect(list.getAttribute('data-dividers')).not.toBe('true');
for (const row of rows) {
  const link = within(row).getByRole('link');
  expect(row.children).toHaveLength(1);
  expect(row.firstElementChild).toBe(link);
}
```

Adapt the exact attribute assertion to Astryx's rendered contract after reading its installed source/tests. The production-browser geometry proof is Task 2.

- [ ] **Step 2: Run focused tests and verify RED**

```bash
pnpm nx test github.io -- --run src/app/skills/skill-list.spec.tsx src/app/skills/skill-list-item.spec.tsx
```

Expected: FAIL because `SkillList` still enables `hasDividers`, leaving a border on non-final `<li>` rows.

- [ ] **Step 3: Remove the outer divider contract**

Remove `hasDividers` from the catalog's Astryx `List`. Retain `density="compact"`, the linked root's zero padding, and the anchor-owned `HStack` padding. Do not replace dividers with a border on the outer row or add an `onClick` workaround.

- [ ] **Step 4: Run focused tests and verify GREEN**

```bash
pnpm nx test github.io -- --run src/app/skills/skill-list.spec.tsx src/app/skills/skill-list-item.spec.tsx
```

Expected: all focused tests pass.

- [ ] **Step 5: Commit the row correction**

```bash
git diff --check
git add apps/github.io/src/app/skills/skill-list.tsx apps/github.io/src/app/skills/skill-list.spec.tsx apps/github.io/src/app/skills/skill-list-item.spec.tsx
git diff --cached
git commit -m "fix(github.io): make skill links cover full rows"
```

---

### Task 2: Fail-closed width and hit-target verification

**Files:**
- Create: `apps/github.io/scripts/verify-mobile-layout-browser.mjs`
- Modify: `apps/github.io/scripts/verify-global-layout-css.mjs`
- Modify: `apps/github.io/project.json`
- Test: production app routes and linked skill rows through the new browser verifier.

**Interfaces:**
- Consumes: built `github.io` assets, local Firefox, Node 24 built-in `WebSocket`, and the existing `verify-global-layout-css` target.
- Produces: `verify-mobile-layout-browser` Nx target and a deterministic browser script that exits non-zero on width, overflow, scroll-owner, focus, or link-geometry regression.

- [ ] **Step 1: Add failing AST verifier mutations**

Extract or structure the verifier so its page-root audit returns a recognition count for each supported page source. Require at least one recognized root per file:

```js
const recognizedRoots = auditPageRoots(sourcePath);
if (recognizedRoots === 0) {
  throw new Error(`${sourcePath} has no recognized page root.`);
}
```

For every recognized root, reject a `className` whose static value contains width/centering constraints such as `max-w-*`, `mx-auto`, `w-fit`, or arbitrary `max-w-[…]`. Reject dynamic/unverifiable `className` on a page root rather than silently accepting it.

Add mutation-style verifier self-tests or fixtures proving these cases fail:

- aliased/unrecognized page root;
- `className="max-w-md mx-auto"`;
- global `Layout contentWidth={448}`;
- page-root `maxWidth={448}`.

The test must run the actual audit functions, not duplicate their logic.

- [ ] **Step 2: Run verifier tests and verify RED**

Run the verifier's focused self-test command established in Step 1. If kept inside the executable script, add a `--self-test` mode and run:

```bash
node apps/github.io/scripts/verify-global-layout-css.mjs --self-test
```

Expected: at least the unrecognized-root and class-name mutation cases fail against the current verifier.

- [ ] **Step 3: Implement fail-closed AST guards**

Make page-root recognition explicit and fail closed. Audit these production sources:

- `src/app/skills/home-page.tsx`
- `src/app/skills/skills-page.tsx`
- `src/app/skills/skill-detail-page.tsx`
- `src/app/not-found-page.tsx`

Keep the standalone wildcard exception explicit and narrow. Preserve the compiled StyleX checks for `width:100%`, `height:100dvh`, and `overflow:hidden`.

- [ ] **Step 4: Create a durable Firefox WebDriver BiDi verifier**

Commit the actual Node script used to launch and clean up a production preview server and Firefox. Do not leave pseudocode only in a report. The script must:

- choose or validate dedicated ports and terminate only processes it starts;
- serve the built app through `vite preview` or Nx `preview`, not the development server;
- launch Firefox headlessly with a temporary profile and WebDriver BiDi remote debugging;
- wait on explicit readiness conditions instead of fixed sleeps;
- run at 375×667 and 820×1180 viewports;
- inspect `/`, `/skills`, `/skills/kubernetes`, `/skills/not-real`, and `/not-a-route`;
- for every in-frame route, assert the global layout rectangle spans the viewport width within subpixel tolerance, document horizontal overflow is absent, and exactly one intended page scroll owner exists;
- assert the standalone wildcard has no horizontal overflow without requiring its content to be full width;
- on `/skills`, assert every native link rectangle equals its parent `<li>` rectangle on all four edges within subpixel tolerance, including a non-final row's bottom edge;
- dispatch pointer input at the non-final row's bottom edge and assert the URL changes to that row's `href`;
- report each route/viewport assertion and exit non-zero on any failure;
- always close the BiDi session, Firefox process, preview server, and temporary profile in `finally` cleanup.

- [ ] **Step 5: Wire the browser verifier into Nx**

Add a `verify-mobile-layout-browser` target that depends on `build` and runs the committed script from `apps/github.io`. Do not add packages.

```json
"verify-mobile-layout-browser": {
  "dependsOn": ["build"],
  "executor": "nx:run-commands",
  "options": {
    "cwd": "apps/github.io",
    "command": "node scripts/verify-mobile-layout-browser.mjs"
  }
}
```

- [ ] **Step 6: Verify GREEN**

```bash
node apps/github.io/scripts/verify-global-layout-css.mjs --self-test
pnpm nx verify-global-layout-css github.io --skip-nx-cache
pnpm nx verify-mobile-layout-browser github.io --skip-nx-cache
```

Expected: self-tests, compiled CSS checks, five-route/two-viewport browser geometry, and the non-final bottom-edge tap all pass.

- [ ] **Step 7: Run complete verification**

```bash
pnpm nx lint github.io --skip-nx-cache
pnpm nx test github.io --skip-nx-cache
pnpm nx build github.io --skip-nx-cache
pnpm nx build-storybook github.io --skip-nx-cache
```

Expected: every command exits 0; record existing warnings separately.

- [ ] **Step 8: Commit the verification gate**

```bash
git diff --check
git add apps/github.io/scripts/verify-mobile-layout-browser.mjs apps/github.io/scripts/verify-global-layout-css.mjs apps/github.io/project.json
git diff --cached
git commit -m "test(github.io): verify mobile layout geometry"
```

---

## Final Review Checklist

- [ ] No Astryx divider or other outer-row geometry remains outside linked skill anchors.
- [ ] Browser geometry proves each non-final anchor matches its `<li>` on all four edges and its bottom edge navigates.
- [ ] The AST verifier fails when it recognizes no page root or encounters constrained/unverifiable root `className`.
- [ ] Production browser geometry covers all five route states at mobile and iPad viewports.
- [ ] Browser verification uses production preview and persists its complete harness in the repository.
- [ ] Full test, lint, application build, Storybook build, CSS verification, and browser verification evidence is fresh.
- [ ] Real iPad Safari QA remains a separate final user validation gate.
