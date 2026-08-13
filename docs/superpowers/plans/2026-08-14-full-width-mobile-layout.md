# Full-Width Mobile Layout Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the shared application frame and every supported page fill the viewport width while preserving the existing mobile-first, single-column UI.

**Architecture:** Remove the global frame's 448 px maximum and centered margins from its applied StyleX style. Remove the independent skill-detail page maximum-width/centering rule, then strengthen source and compiled-CSS tests so the former constraints cannot silently return.

**Tech Stack:** React 19, TypeScript, Astryx Design, StyleX, Vitest, Testing Library, Nx, Vite

## Global Constraints

- Home, Skills, and skill-detail pages use `width: 100%` at every viewport size.
- The global navigation spans the complete viewport width.
- Remove the global 448 px maximum width and automatic horizontal centering constraint.
- Preserve the current mobile UI composition even when viewed on iPad or desktop.
- Do not add responsive breakpoints, alternate tablet/desktop structures, or width-specific content constraints.
- Preserve the existing `100dvh` frame and one page-owned scroll region beneath the persistent navigation.
- Preserve all navigation, search, routing, content, carousel, list, breadcrumb, avatar-size, spacing-token, typography, and component-variant behavior.
- Add no dependencies.
- Follow red-green-refactor, stage explicit paths only, and use a conventional commit subject.

---

## File Structure

- Modify `apps/github.io/src/app/global-navigation-layout.tsx`: retain the applied full-width/full-height/overflow frame rules and remove global maximum width and centering.
- Modify `apps/github.io/src/app/global-navigation-layout.spec.tsx`: assert the global frame is wired to a StyleX style without legacy utility classes; emitted values are validated at build level.
- Modify `apps/github.io/src/app/app.spec.tsx`: preserve the supported-route frame assertions without encoding the old centered-column contract.
- Modify `apps/github.io/src/app/skills/skill-detail-page.tsx`: remove the page-local maximum width and centering so detail content can consume its full route width.
- Modify `apps/github.io/src/app/skills/skill-detail-page.spec.tsx`: protect the full-width detail-page contract.
- Modify `apps/github.io/scripts/verify-global-layout-css.mjs`: require emitted and applied full-width frame/detail rules and reject the former maximum-width/centering/minimum-height combination.

---

### Task 1: Full-width mobile application frame

**Files:**
- Modify: `apps/github.io/src/app/global-navigation-layout.tsx`
- Modify: `apps/github.io/src/app/global-navigation-layout.spec.tsx`
- Modify: `apps/github.io/src/app/app.spec.tsx`
- Modify: `apps/github.io/src/app/skills/skill-detail-page.tsx`
- Modify: `apps/github.io/src/app/skills/skill-detail-page.spec.tsx`
- Modify: `apps/github.io/scripts/verify-global-layout-css.mjs`

**Interfaces:**
- Consumes: existing `GlobalNavigationLayout`, Astryx `Layout`, StyleX `styles.frame`, and skill-detail `styles.page`.
- Produces: an emitted global frame with `width: 100%`, `height: 100dvh`, and `overflow: hidden`, plus full-width detail content with no local maximum-width/centering rule.

- [ ] **Step 1: Write failing source-level layout tests**

Update `global-navigation-layout.spec.tsx` so its shell test rejects legacy width constraints while retaining the Astryx and single-scroll-owner assertions:

```tsx
expect(shell.className).toContain('astryx-layout');
expect(shell.className).not.toMatch(
  /\b(?:mx-auto|h-dvh|min-h-screen|w-full|max-w-md|overflow-hidden)\b/,
);
expect(container.querySelectorAll('.astryx-layout-content')).toHaveLength(0);
```

Keep this source-level assertion as a guard against falling back to non-emitted utility classes; do not claim that it proves computed width.

Update `skill-detail-page.spec.tsx` to locate the detail content stack and assert its applied StyleX output does not include a page-local maximum-width or automatic-centering utility/class contract. Add an explicit semantic marker if necessary:

```tsx
const detailContent = getByTestId('skill-detail-content');

expect(detailContent.getAttribute('style')).not.toContain('max-width');
expect(detailContent.getAttribute('style')).not.toContain('margin-inline');
```

Prefer inspecting the existing compiled class contract or a stable `data-testid` over depending on generated StyleX class names. The production verifier in Step 4 provides the emitted-CSS proof.

Update `app.spec.tsx` to keep its route-level frame assertion free of `max-w-md`, `mx-auto`, or a 448 px expectation.

- [ ] **Step 2: Make the CSS verifier fail on the old frame**

Change `verify-global-layout-css.mjs` before production code so `frame` requires only the desired declarations:

```js
const frame = assertStyle('frame', [
  'width:100%',
  'height:100dvh',
  'overflow:hidden',
]);
```

Add exact rejection checks against the compiled `frame` style:

```js
for (const forbiddenDeclaration of [
  'max-width:448px',
  'margin-inline:auto',
  'min-height:100vh',
]) {
  const forbiddenClass = findClass(forbiddenDeclaration);

  if (forbiddenClass && frame.includes(`\`${forbiddenClass}\``)) {
    throw new Error(
      `Global frame includes forbidden declaration: ${forbiddenDeclaration}`,
    );
  }
}
```

Add a verifier check for the skill-detail `page` applied style. The desired detail rule has no sizing declarations after the change, so delete `styles.page` entirely and verify the production detail call site no longer applies a `page` xstyle. Read `skill-detail-page.tsx` in the script and fail if it contains `maxWidth`, `marginInline`, or `xstyle={styles.page}`:

```js
const detailSource = readFileSync(
  resolve(process.cwd(), 'src/app/skills/skill-detail-page.tsx'),
  'utf8',
);

for (const forbiddenSource of [
  'maxWidth:',
  'marginInline:',
  'xstyle={styles.page}',
]) {
  if (detailSource.includes(forbiddenSource)) {
    throw new Error(
      `Skill detail retains a page-width constraint: ${forbiddenSource}`,
    );
  }
}
```

- [ ] **Step 3: Run focused tests and the verifier to confirm RED**

Run:

```bash
pnpm nx test github.io -- --run src/app/global-navigation-layout.spec.tsx src/app/app.spec.tsx src/app/skills/skill-detail-page.spec.tsx
pnpm nx verify-global-layout-css github.io --skip-nx-cache
```

Expected: the source tests may remain green because StyleX class names are opaque, but the verifier must fail because the compiled frame still contains `max-width: 448px` and `margin-inline: auto`, and the detail source still contains its local width constraints. Do not proceed unless at least the production verifier demonstrates RED.

- [ ] **Step 4: Remove the frame and detail width constraints**

Change the global frame style to:

```ts
const styles = stylex.create({
  frame: {
    width: '100%',
    height: '100dvh',
    overflow: 'hidden',
  },
});
```

In `skill-detail-page.tsx`, remove `spacingVars` from the token import if no longer used by another style, delete the `page` StyleX object, and remove `xstyle={styles.page}` from the content `VStack`. Keep its Astryx spacing, padding, landmark, and content unchanged.

- [ ] **Step 5: Run focused tests and compiled-CSS verification to confirm GREEN**

Run:

```bash
pnpm nx test github.io -- --run src/app/global-navigation-layout.spec.tsx src/app/app.spec.tsx src/app/skills/skill-detail-page.spec.tsx
pnpm nx verify-global-layout-css github.io --skip-nx-cache
```

Expected: all named test files pass, and the verifier reports that the compiled global frame and Home layout rules are applied with no 448 px, auto-centering, or `100vh` minimum constraint; detail source has no page-width constraint.

- [ ] **Step 6: Run complete verification**

Run:

```bash
pnpm nx lint github.io --skip-nx-cache
pnpm nx test github.io --skip-nx-cache
pnpm nx build github.io --skip-nx-cache
pnpm nx build-storybook github.io --skip-nx-cache
```

Expected: all commands exit 0. Record existing warnings separately from failures.

- [ ] **Step 7: Review and commit the implementation**

Run:

```bash
git diff --check
git status --short
git diff -- apps/github.io/src/app/global-navigation-layout.tsx apps/github.io/src/app/global-navigation-layout.spec.tsx apps/github.io/src/app/app.spec.tsx apps/github.io/src/app/skills/skill-detail-page.tsx apps/github.io/src/app/skills/skill-detail-page.spec.tsx apps/github.io/scripts/verify-global-layout-css.mjs
git add apps/github.io/src/app/global-navigation-layout.tsx apps/github.io/src/app/global-navigation-layout.spec.tsx apps/github.io/src/app/app.spec.tsx apps/github.io/src/app/skills/skill-detail-page.tsx apps/github.io/src/app/skills/skill-detail-page.spec.tsx apps/github.io/scripts/verify-global-layout-css.mjs
git diff --cached
git commit -m "fix(github.io): use full-width mobile layout"
```

- [ ] **Step 8: Perform real-device visual QA**

Run the final app over Tailscale:

```bash
CI=1 pnpm nx dev github.io --host 0.0.0.0 --port 4200
```

On iPad, verify `/`, `/skills`, and `/skills/kubernetes` in portrait and landscape:

- global navigation spans the viewport;
- content uses the complete viewport width;
- detail content is no longer independently centered or constrained;
- navigation stays visible while the active page scrolls;
- no horizontal overflow or nested-scroll trap appears;
- search and route navigation still work.

If the implementer cannot access the iPad, leave the server running only when explicitly coordinated with the controller and report the visual gate as pending rather than claiming success.

---

## Final Review Checklist

- [ ] The global frame emits and applies `width: 100%`, `height: 100dvh`, and `overflow: hidden`.
- [ ] The global frame does not apply `max-width: 448px`, `margin-inline: auto`, or `min-height: 100vh`.
- [ ] Skill detail has no independent page maximum width or centering margin.
- [ ] Home, Skills, and detail retain their mobile-first single-column composition.
- [ ] No responsive breakpoints or alternate layouts were added.
- [ ] Persistent global navigation, search, routes, page landmarks, and one-scroll-owner behavior remain covered.
- [ ] Full tests, lint, app build, Storybook build, and compiled-CSS verification pass freshly.
- [ ] iPad portrait/landscape QA is completed or explicitly reported as pending.
