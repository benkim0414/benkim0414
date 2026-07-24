# GitHub.io StyleX and Tailwind Migration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Migrate `apps/github.io` to Astryx's documented styling split: StyleX for component-specific styles, Tailwind utilities for layout/wrappers, `className` for utilities/external CSS, and Astryx token aliases as the styling source of truth.

**Architecture:** Keep Astryx `Theme` and component imports as the app's design-system layer. Add StyleX compilation to Vite and Tailwind v4 with the Astryx Tailwind bridge. Move internal component styling out of global selectors, leaving `styles.css` responsible for CSS imports, true globals, and React Flow third-party selectors.

**Tech Stack:** Nx, Vite, React 19, Astryx Design, StyleX, Tailwind CSS v4, Vitest, Testing Library.

## Global Constraints

- Preserve the current UI behavior.
- StyleX is for component-specific overrides, reusable local styles, pseudo-classes, and typed token access.
- Tailwind utilities are for layout, wrappers, spacing composition, and utility styling.
- `className` is for passing Tailwind utilities or external CSS integration into components.
- Styling-library token aliases must keep Astryx tokens as the source of truth.
- Do not redesign the UI, change content, change routing, replace Astryx components, create a custom Astryx theme, swizzle Astryx components, or add another CSS-in-JS library beyond StyleX.
- Use explicit path staging only. Do not use `git add -A`, `git add .`, `git add -u`, `git commit -a`, or `git commit -am`.
- Run focused validation before each commit when the local package manager is available. If `pnpm` is unavailable, try `corepack pnpm`; if that also fails, document the exact blocker.

---

## File Structure

- Modify `package.json`: add direct StyleX, StyleX unplugin, and Tailwind dependencies.
- Modify `pnpm-lock.yaml`: update lockfile after dependency changes.
- Modify `apps/github.io/vite.config.ts`: add StyleX Vite plugin before React.
- Modify `apps/github.io/src/main.tsx`: remove Astryx stylesheet imports after moving them into the CSS entry.
- Modify `apps/github.io/src/styles.css`: own import/layer ordering, globals, and React Flow third-party selectors only.
- Modify `apps/github.io/src/app/app-shell.tsx`: replace page global classes with Tailwind utilities.
- Modify `apps/github.io/src/app/skills/skill-section.tsx`: replace wrapper/search global classes with Tailwind utilities.
- Modify `apps/github.io/src/app/skills/skill-list.tsx`: replace list/header/heading global classes with Tailwind utilities passed through `className`.
- Modify `apps/github.io/src/app/skills/skill-list-item.tsx`: replace row-copy global classes with Tailwind utilities.
- Modify `apps/github.io/src/app/skills/skill-token.tsx`: move token appearance to StyleX and replace the internal `skill-token` class contract with `data-testid="skill-token"`.
- Modify `apps/github.io/src/app/skills/skill-rating.tsx`: move rating display/responsive behavior to StyleX.
- Modify `apps/github.io/src/app/skills/skill-avatar.tsx`: replace `skill-avatar` class with Tailwind.
- Modify `apps/github.io/src/app/certifications/certification-citation.tsx`: move wrapper/source sizing to StyleX and keep brand color inline data styles.
- Modify `apps/github.io/src/app/devops-roadmap/devops-roadmap-node.tsx`: move node card/list styling to StyleX and use Tailwind for simple wrappers where clearer.
- Modify `apps/github.io/src/app/devops-roadmap/devops-roadmap.tsx`: keep React Flow wrapper class only for third-party descendant selectors, use Tailwind for wrapper layout.
- Modify `apps/github.io/src/app/skills/skill-token.spec.tsx`, `apps/github.io/src/app/skills/skill-rating.spec.tsx`, `apps/github.io/src/app/certifications/certification-citation.spec.tsx`, and `apps/github.io/src/app/devops-roadmap/devops-roadmap.spec.tsx`: stop relying on migrated internal class names.

---

### Task 1: Add StyleX and Tailwind Toolchain

**Files:**
- Modify: `package.json`
- Modify: `pnpm-lock.yaml`
- Modify: `apps/github.io/vite.config.ts`
- Modify: `apps/github.io/src/main.tsx`
- Modify: `apps/github.io/src/styles.css`

**Interfaces:**
- Consumes: Astryx docs for StyleX Vite and Tailwind bridge.
- Produces: Vite compiles `@stylexjs/stylex` usages and Tailwind utilities resolve through Astryx token CSS variables.

- [ ] **Step 1: Confirm package manager availability**

Run:

```bash
which pnpm || which corepack
```

Expected: either `pnpm` or `corepack` prints a path. If only `corepack` exists, use `corepack pnpm` for all `pnpm` commands below.

- [ ] **Step 2: Add dependencies**

Run one of:

```bash
pnpm add @stylexjs/stylex
pnpm add -D @stylexjs/unplugin tailwindcss
```

or, when `pnpm` is unavailable but `corepack` exists:

```bash
corepack pnpm add @stylexjs/stylex
corepack pnpm add -D @stylexjs/unplugin tailwindcss
```

Expected: `package.json` includes `@stylexjs/stylex` under `dependencies`, and `@stylexjs/unplugin` plus `tailwindcss` under `devDependencies`. `pnpm-lock.yaml` is updated.

- [ ] **Step 3: Configure Vite StyleX plugin**

Edit `apps/github.io/vite.config.ts` so the imports begin like this:

```ts
/// <reference types='vitest' />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import stylex from '@stylexjs/unplugin';
import { nxViteTsPaths } from '@nx/vite/plugins/nx-tsconfig-paths.plugin';
```

Change the plugin list to this shape, with StyleX before React:

```ts
  plugins: [
    stylex.vite({
      useCSSLayers: {
        before: ['reset', 'theme', 'base', 'astryx-base', 'astryx-theme'],
        after: ['utilities'],
        prefix: 'stylex',
      },
      sxPropName: false,
    }),
    react(),
    nxViteTsPaths(),
  ],
```

- [ ] **Step 4: Move stylesheet imports into the CSS entry**

Edit `apps/github.io/src/main.tsx` so only the third-party React Flow CSS and app CSS remain as stylesheet imports:

```ts
import '@xyflow/react/dist/style.css';
import './styles.css';
```

Edit the top of `apps/github.io/src/styles.css` to begin with the Astryx/Tailwind layer prelude and imports:

```css
@layer reset, theme, base, astryx-base, astryx-theme, stylex.priority1, stylex.priority2, utilities;

@import "tailwindcss/theme.css" layer(theme);
@import "tailwindcss/preflight.css" layer(base);
@import "@astryxdesign/core/reset.css";
@import "@astryxdesign/core/astryx.css";
@import "@astryxdesign/theme-neutral/theme.css";
@import "@astryxdesign/core/tailwind-theme.css";
@import "tailwindcss/utilities.css" layer(utilities);

html {
  min-height: 100%;
  background: var(--color-background-body);
}
```

Keep the existing `html`, `body`, and `a` rules after the imports for now. Do not migrate component selectors in this task.

- [ ] **Step 5: Run focused validation**

Run:

```bash
pnpm nx test github.io
pnpm nx build github.io
```

Expected: both commands pass. If `pnpm` is unavailable, run the same commands through `corepack pnpm`. If package-manager execution still fails, capture the command and error in the task notes before committing.

- [ ] **Step 6: Commit toolchain setup**

Inspect and commit only the setup files:

```bash
git diff -- package.json pnpm-lock.yaml apps/github.io/vite.config.ts apps/github.io/src/main.tsx apps/github.io/src/styles.css
git add package.json pnpm-lock.yaml apps/github.io/vite.config.ts apps/github.io/src/main.tsx apps/github.io/src/styles.css
git diff --cached
git commit -m "chore(github.io): add stylex tailwind styling pipeline"
```

---

### Task 2: Migrate Skills and Certification Styling

**Files:**
- Modify: `apps/github.io/src/styles.css`
- Modify: `apps/github.io/src/app/app-shell.tsx`
- Modify: `apps/github.io/src/app/skills/skill-section.tsx`
- Modify: `apps/github.io/src/app/skills/skill-list.tsx`
- Modify: `apps/github.io/src/app/skills/skill-list-item.tsx`
- Modify: `apps/github.io/src/app/skills/skill-token.tsx`
- Modify: `apps/github.io/src/app/skills/skill-rating.tsx`
- Modify: `apps/github.io/src/app/skills/skill-avatar.tsx`
- Modify: `apps/github.io/src/app/certifications/certification-citation.tsx`
- Modify: `apps/github.io/src/app/skills/skill-token.spec.tsx`
- Modify: `apps/github.io/src/app/skills/skill-rating.spec.tsx`
- Modify: `apps/github.io/src/app/certifications/certification-citation.spec.tsx`

**Interfaces:**
- Consumes: StyleX Vite setup from Task 1.
- Produces: Skills and certification components no longer depend on global CSS selectors for internal styling.

- [ ] **Step 1: Replace page shell classes with Tailwind utilities**

Edit `apps/github.io/src/app/app-shell.tsx` so the `<main>` uses Tailwind classes:

```tsx
      <main
        aria-labelledby="skills-page-title"
        className="mx-auto w-[min(calc(100%_-_32px),960px)] pt-[clamp(var(--spacing-5),5vw,var(--spacing-10))] pb-8"
      >
```

Remove `.page` and `.page--skills` from `apps/github.io/src/styles.css`.

- [ ] **Step 2: Replace skill wrapper/list classes with Tailwind utilities**

Edit `apps/github.io/src/app/skills/skill-section.tsx`:

```tsx
    <div className="grid gap-4">
      <div className="w-full">
```

Edit `apps/github.io/src/app/skills/skill-list.tsx`:

```tsx
    <h2 className="m-0 text-2xl" id={headingId}>
```

```tsx
    <section className="grid gap-4" aria-labelledby={headingId}>
```

```tsx
          <div className="grid gap-3">{headingElement}</div>
```

```tsx
          className="w-full"
```

Edit `apps/github.io/src/app/skills/skill-list-item.tsx`:

```tsx
      label={
        <div className="flex min-w-0 max-w-full flex-1 items-center gap-2 max-[640px]:flex-col max-[640px]:items-start">
          <span className="block min-w-0 max-w-full flex-1 overflow-hidden text-ellipsis whitespace-nowrap font-bold max-[640px]:w-full">
            {skill.name}
          </span>
          <SkillCategory name={skill.category} />
        </div>
      }
```

Remove the matching `.skill-section`, `.skill-section__search`, `.skill-list`, `.skill-list__header`, `.skill-list__heading`, `.skill-list__items`, `.skill-list__item-copy`, and `.skill-list__name` rules from `styles.css`.

- [ ] **Step 3: Move `SkillToken` styling to StyleX**

Edit `apps/github.io/src/app/skills/skill-token.tsx` to import StyleX:

```tsx
import * as stylex from '@stylexjs/stylex';
import type { CSSProperties } from 'react';
```

Add local styles:

```tsx
const styles = stylex.create({
  root: {
    display: 'inline-flex',
    alignItems: 'center',
    maxWidth: '100%',
    minHeight: 'var(--spacing-5)',
    gap: 'var(--spacing-1)',
    paddingBlock: 0,
    paddingInline: 'var(--spacing-2)',
    color: 'var(--skill-token-foreground, var(--color-purple-700, #5b2bd6))',
    backgroundColor: 'var(--skill-token-background, var(--color-purple-100, #eee7ff))',
    borderRadius: 'var(--radius-full, 999px)',
    fontSize: 'var(--text-supporting-size, 0.75rem)',
    fontWeight: 'var(--font-weight-medium, 500)',
    lineHeight: 'var(--text-supporting-leading, 1rem)',
  },
  icon: {
    flex: '0 0 auto',
    width: '0.875rem',
    height: '0.875rem',
  },
  label: {
    minWidth: 0,
    overflowWrap: 'anywhere',
  },
});
```

Change the JSX to:

```tsx
    <span
      {...stylex.props(styles.root)}
      data-has-icon={String(hasIcon)}
      data-testid="skill-token"
      data-token-color={hasIcon ? brand?.color : undefined}
      style={tokenStyle(brand)}
    >
```

```tsx
          {...stylex.props(styles.icon)}
```

```tsx
      <span {...stylex.props(styles.label)}>{label}</span>
```

Remove `.skill-token`, `.skill-token__icon`, and `.skill-token__label` rules from `styles.css`.

Update `apps/github.io/src/app/skills/skill-token.spec.tsx` so it queries `[data-testid="skill-token"]` instead of `.skill-token`, and remove the assertion for `skill-token--purple` because that class is no longer part of the component contract. For example, the unmapped skill test should keep these assertions:

```tsx
expect(token).toBeTruthy();
expect(token?.getAttribute('data-has-icon')).toBe('false');
expect(token?.getAttribute('data-token-color')).toBeNull();
expect(container.querySelector('svg')).toBeNull();
```

- [ ] **Step 4: Move `SkillRating` styling to StyleX**

Edit `apps/github.io/src/app/skills/skill-rating.tsx` to import StyleX:

```tsx
import * as stylex from '@stylexjs/stylex';
```

Add styles:

```tsx
const styles = stylex.create({
  root: {
    display: 'inline-flex',
    flex: '0 0 auto',
    color: 'var(--color-text-primary)',
    letterSpacing: 0,
    whiteSpace: 'nowrap',
  },
  stars: {
    display: {
      default: 'inline-flex',
      '@media (max-width: 640px)': 'none',
    },
    alignItems: 'center',
    gap: 1,
  },
  compact: {
    display: {
      default: 'none',
      '@media (max-width: 640px)': 'inline-flex',
    },
    alignItems: 'center',
    gap: 'var(--spacing-1)',
  },
});
```

Apply them:

```tsx
    <span {...stylex.props(styles.root)}>
      <VisuallyHidden>{level} out of 5</VisuallyHidden>
      <span {...stylex.props(styles.stars)} aria-hidden="true">
```

```tsx
      <span {...stylex.props(styles.compact)} aria-hidden="true">
```

Remove `.skill-rating`, `.skill-rating__stars`, and `.skill-rating__compact` rules from `styles.css`.

Update `apps/github.io/src/app/skills/skill-rating.spec.tsx` so it tests text and ARIA behavior without selecting generated StyleX classes:

```tsx
const { getByText } = render(<SkillRating level={4} />);

expect(getByText('4 out of 5')).toBeTruthy();
expect(getByText('★★★★☆').getAttribute('aria-hidden')).toBe('true');
expect(getByText('★').closest('[aria-hidden="true"]')?.textContent).toBe('★4/5');
```

- [ ] **Step 5: Migrate avatar and certification citation wrappers**

Edit `apps/github.io/src/app/skills/skill-avatar.tsx` to replace `className="skill-avatar"` with Tailwind:

```tsx
className="flex-none"
```

Edit `apps/github.io/src/app/certifications/certification-citation.tsx` to import StyleX:

```tsx
import * as stylex from '@stylexjs/stylex';
```

Add styles:

```tsx
const styles = stylex.create({
  root: {
    display: 'inline-flex',
    alignItems: 'center',
    maxWidth: '100%',
  },
  source: {
    maxWidth: '100%',
  },
});
```

Change the wrapper to:

```tsx
    <span
      {...stylex.props(styles.root)}
      data-certification-primary-skill={primary?.skill}
      data-certification-status={status}
      data-testid="certification-citation"
    >
```

Change the `Citation` className to:

```tsx
        className={stylex.props(styles.source).className}
```

Remove `.certification-citation`, `.certification-citation__source`, and `.skill-avatar` rules from `styles.css`.

Update `apps/github.io/src/app/certifications/certification-citation.spec.tsx` so it queries `[data-testid="certification-citation"]` instead of `.certification-citation`, and remove assertions for `certification-citation--branded`.

- [ ] **Step 6: Run focused validation**

Run:

```bash
pnpm nx test github.io
pnpm nx build github.io
```

Expected: both pass, and `styles.css` still contains global rules plus React Flow integration but no skills or certification component selectors.

- [ ] **Step 7: Commit skills/certification migration**

Inspect and commit only this task's files:

```bash
git diff -- apps/github.io/src/styles.css apps/github.io/src/app/app-shell.tsx apps/github.io/src/app/skills apps/github.io/src/app/certifications/certification-citation.tsx
git add apps/github.io/src/styles.css apps/github.io/src/app/app-shell.tsx apps/github.io/src/app/skills/skill-section.tsx apps/github.io/src/app/skills/skill-list.tsx apps/github.io/src/app/skills/skill-list-item.tsx apps/github.io/src/app/skills/skill-token.tsx apps/github.io/src/app/skills/skill-rating.tsx apps/github.io/src/app/skills/skill-avatar.tsx apps/github.io/src/app/certifications/certification-citation.tsx apps/github.io/src/app/skills/skill-token.spec.tsx apps/github.io/src/app/skills/skill-rating.spec.tsx apps/github.io/src/app/certifications/certification-citation.spec.tsx
git diff --cached
git commit -m "refactor(github.io): migrate skills styling to stylex tailwind"
```

---

### Task 3: Migrate DevOps Roadmap Styling and Verify Visually

**Files:**
- Modify: `apps/github.io/src/styles.css`
- Modify: `apps/github.io/src/app/devops-roadmap/devops-roadmap.tsx`
- Modify: `apps/github.io/src/app/devops-roadmap/devops-roadmap-node.tsx`
- Modify: `apps/github.io/src/app/devops-roadmap/devops-roadmap.spec.tsx`

**Interfaces:**
- Consumes: StyleX/Tailwind setup from Task 1 and migrated `SkillToken`/`CertificationCitation` from Task 2.
- Produces: Roadmap node card styles are owned by the roadmap node component; only React Flow descendant selectors remain global.

- [ ] **Step 1: Move roadmap node card styling to StyleX**

Edit `apps/github.io/src/app/devops-roadmap/devops-roadmap-node.tsx` to import StyleX:

```tsx
import * as stylex from '@stylexjs/stylex';
import { Handle, Position } from '@xyflow/react';
```

Add styles:

```tsx
const styles = stylex.create({
  root: {
    display: 'grid',
    alignContent: 'start',
    gap: 'var(--spacing-3)',
    width: {
      default: 'min(100%, 320px)',
      '@media (max-width: 640px)': 'min(100%, 280px)',
    },
    minHeight: 148,
    padding: {
      default: 'var(--spacing-4)',
      '@media (max-width: 640px)': 'var(--spacing-3)',
    },
    color: 'var(--color-text-primary)',
    backgroundColor: 'var(--color-background-surface, var(--color-background-body))',
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: 'var(--color-border-subtle, rgba(15, 23, 42, 0.16))',
    borderRadius: 'var(--radius-2, 8px)',
    boxShadow: 'var(--shadow-xs, 0 1px 2px rgba(15, 23, 42, 0.08))',
  },
  title: {
    margin: 0,
    fontSize: 'var(--font-size-lg)',
    lineHeight: 'var(--line-height-tight)',
  },
  list: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: 'var(--spacing-2)',
    padding: 0,
    margin: 0,
    listStyle: 'none',
  },
  listItem: {
    display: 'inline-flex',
    maxWidth: '100%',
  },
});
```

Apply those styles:

```tsx
    <article {...stylex.props(styles.root)} aria-label={item.title}>
```

```tsx
      <h3 {...stylex.props(styles.title)}>{item.title}</h3>
```

```tsx
        <ul {...stylex.props(styles.list)} aria-label={`${item.title} skills`}>
```

```tsx
            <li {...stylex.props(styles.listItem)} key={skill}>
```

Use the same `styles.list` and `styles.listItem` for certifications.

Remove `.devops-roadmap-node`, `.devops-roadmap-node__title`, `.devops-roadmap-node__skills`, `.devops-roadmap-node__skill`, `.devops-roadmap-node__certifications`, `.devops-roadmap-node__certification`, and the mobile `.devops-roadmap-node` rules from `styles.css`.

- [ ] **Step 2: Keep only React Flow third-party global selectors**

Edit `apps/github.io/src/app/devops-roadmap/devops-roadmap.tsx` so the React Flow wrapper keeps `devops-roadmap__flow` only because `styles.css` still targets React Flow internals, and uses Tailwind utility classes for direct wrapper layout:

```tsx
    <div
      aria-label={ariaLabel}
      className="devops-roadmap__flow w-full min-w-0"
      role="group"
      style={{ height }}
    >
```

Edit `apps/github.io/src/styles.css` so the only roadmap selectors left are:

```css
.devops-roadmap__flow .react-flow__node {
  width: min(100%, 320px);
}

.devops-roadmap__flow .react-flow__handle {
  opacity: 0;
  pointer-events: none;
}

.devops-roadmap__flow .react-flow__edge-path {
  stroke: var(--color-border-strong, var(--color-text-secondary));
  stroke-width: 2;
}
```

Remove the standalone `.devops-roadmap__flow` rule because Tailwind owns that direct wrapper layout.

- [ ] **Step 3: Update roadmap tests for stable selectors**

Update `apps/github.io/src/app/devops-roadmap/devops-roadmap.spec.tsx` so it does not assert `.devops-roadmap-node__skills` or `.devops-roadmap-node__certifications`.

For the empty chip list test, add no test-only marker when the skills list is absent and use:

```tsx
expect(getByText('Cloud Design Patterns')).toBeTruthy();
expect(container.querySelector('[data-roadmap-node-skills]')).toBeNull();
```

For the certifications ordering test, add `data-roadmap-node-skills` to the skills `<ul>` and `data-roadmap-node-certifications` to the certifications `<ul>`, then assert:

```tsx
expect(container.querySelector('[data-roadmap-node-skills] + [data-roadmap-node-certifications]')).toBeTruthy();
```

For title rendering, prefer accessible queries:

```tsx
expect(getByRole('article', { name: 'Containers' })).toBeTruthy();
```

Do not add tests for generated StyleX class names because they are implementation details.

- [ ] **Step 4: Run full focused validation**

Run:

```bash
pnpm nx test github.io
pnpm nx build github.io
```

Expected: both pass.

If the project exposes Storybook targets, inspect them:

```bash
pnpm nx show project github.io --web
```

If a Storybook target exists, run the relevant non-watch Storybook build command shown by Nx, for example:

```bash
pnpm nx build-storybook github.io
```

Expected: Storybook build passes or the absence of a Storybook target is documented in the task notes.

- [ ] **Step 5: Browser verification**

Start the dev server:

```bash
pnpm nx serve github.io
```

Open the served app and verify:

- The skills list still has the same spacing, headings, token sizing, avatars, ratings, search width, and empty states.
- The DevOps roadmap nodes still render as compact cards with wrapped skill tokens and certification citations.
- Mobile width around `390x844` still stacks skill item text/rating correctly and roadmap nodes fit without horizontal overflow.
- StyleX-generated CSS is present in the served CSS output and the page is not unstyled.

- [ ] **Step 6: Commit roadmap migration**

Inspect and commit only roadmap/global files:

```bash
git diff -- apps/github.io/src/styles.css apps/github.io/src/app/devops-roadmap/devops-roadmap.tsx apps/github.io/src/app/devops-roadmap/devops-roadmap-node.tsx apps/github.io/src/app/devops-roadmap/devops-roadmap.spec.tsx
git add apps/github.io/src/styles.css apps/github.io/src/app/devops-roadmap/devops-roadmap.tsx apps/github.io/src/app/devops-roadmap/devops-roadmap-node.tsx apps/github.io/src/app/devops-roadmap/devops-roadmap.spec.tsx
git diff --cached
git commit -m "refactor(github.io): migrate roadmap styling to stylex tailwind"
```

---

### Task 4: Final Audit and Handoff Notes

**Files:**
- Modify: `docs/superpowers/plans/2026-07-24-github-io-stylex-tailwind-migration.md`

**Interfaces:**
- Consumes: Completed commits from Tasks 1-3.
- Produces: Checked-off implementation plan with exact validation results for handoff/review.

- [ ] **Step 1: Audit remaining global selectors**

Run:

```bash
rg -n "^\\.(page|skill-|certification-citation|devops-roadmap-node|devops-roadmap__flow)" apps/github.io/src/styles.css
```

Expected: only React Flow descendant selectors under `.devops-roadmap__flow` remain. No `.page`, `.skill-*`, `.certification-citation`, or `.devops-roadmap-node` rules remain.

- [ ] **Step 2: Audit hardcoded styling values**

Run:

```bash
rg -n "#[0-9A-Fa-f]{3,8}|rgba\\(|rgb\\(|[0-9]+px" apps/github.io/src/app apps/github.io/src/styles.css
```

Expected: remaining hardcoded color/px values are either brand data, fallback values copied from existing behavior, React Flow integration, or documented Astryx fallback values. Convert any ordinary layout/color values to Astryx tokens or Tailwind token utilities before final review.

- [ ] **Step 3: Run final validation**

Run:

```bash
pnpm nx test github.io
pnpm nx build github.io
```

Expected: both pass. If `pnpm` remains unavailable, record the exact command failure and do not claim tests passed.

- [ ] **Step 4: Update this plan with results**

Check off completed steps in this file and add a short validation note under this task:

```markdown
Validation:
- `pnpm nx test github.io`: pass
- `pnpm nx build github.io`: pass
- Browser verification: pass at desktop and mobile widths
```

If a command could not run, write the real blocker message from the failed command. Example for the current shell state:

```markdown
Validation:
- `pnpm nx test github.io`: not run, `pnpm` was unavailable and `corepack pnpm` could not start because Corepack could not resolve pnpm.
- `pnpm nx build github.io`: not run, `pnpm` was unavailable and `corepack pnpm` could not start because Corepack could not resolve pnpm.
```

- [ ] **Step 5: Commit plan status update if this file changed**

```bash
git diff -- docs/superpowers/plans/2026-07-24-github-io-stylex-tailwind-migration.md
git add docs/superpowers/plans/2026-07-24-github-io-stylex-tailwind-migration.md
git diff --cached
git commit -m "docs(github.io): record stylex migration validation"
```
