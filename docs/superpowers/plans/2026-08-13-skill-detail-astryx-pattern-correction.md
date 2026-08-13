# Skill Detail Astryx Pattern Correction Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the skill detail page match Astryx's Basic Metadata example and restore the default secondary/primary breadcrumb color hierarchy.

**Architecture:** Keep `SkillDetailPage` as the existing composition boundary and preserve its data, content, and semantic rows. Remove only the `MetadataList` presentation overrides that diverge from Astryx Basic Metadata, then remove the unlayered generic anchor rule that overrides Astryx `BreadcrumbItem` colors; Astryx remains the sole owner of both components' presentation.

**Tech Stack:** React 19, TypeScript, Astryx `MetadataList` and `Breadcrumbs`, CSS cascade layers, Vitest, Testing Library, Storybook, Nx, pnpm, agent-browser, Tailscale.

## Global Constraints

- Follow the approved design in `docs/superpowers/specs/2026-08-12-skill-detail-page-design.md`.
- Use Astryx components and defaults first; use MD3 only where Astryx has no guidance. No such gap exists for this correction.
- Follow the installed official Astryx `MetadataListBasicMetadata` example because the public documentation URL is not readable from the development environment.
- Do not add custom MetadataList or Breadcrumb styles.
- Keep the metadata rows in this order: `Categories`, `Rating`, then conditional `Certifications`.
- Preserve all existing category badges, rating content, certification citations, evidence, projects, routes, and responsive page-width behavior.
- Linked breadcrumb ancestors must use Astryx secondary text color; the current item must use Astryx primary text color.
- Do not implement skill-card, list-item, or command-palette navigation to the detail route.
- Keep Storybook reachable from the user's iPad through the existing Tailscale VPN.
- This correction plan supersedes the `columns="single"` and top-positioned-label requirements in `docs/superpowers/plans/2026-08-13-skill-detail-metadata-list.md`; that earlier plan records the already-executed implementation.

## File Map

- Modify `apps/github.io/src/app/skills/skill-detail-page.spec.tsx`: add source-contract regression tests for the approved Astryx component usage and global link-style boundary.
- Modify `apps/github.io/src/app/skills/skill-detail-page.tsx`: remove the explicit MetadataList layout props while preserving its rows and values.
- Modify `apps/github.io/src/styles.css`: remove the unlayered generic anchor rule that overrides Astryx Breadcrumb colors.
- Do not modify `apps/github.io/src/app/skills/skill-detail-page.stories.tsx`: reuse `EnrichedKubernetes` and `BasicSkill` for browser validation.

---

### Task 1: Match the Astryx Basic Metadata example

**Files:**
- Modify: `apps/github.io/src/app/skills/skill-detail-page.spec.tsx`
- Modify: `apps/github.io/src/app/skills/skill-detail-page.tsx`

**Interfaces:**
- Consumes: `SkillDetailPage({ detail }: SkillDetailPageProps)`, the existing `data-testid="skill-metadata"`, and Astryx `MetadataList` defaults.
- Produces: the same semantic `Categories`, `Rating`, and optional `Certifications` rows, rendered without `columns`, `label`, or `orientation` overrides.

- [ ] **Step 1: Re-check the installed official Astryx example before editing**

Run:

```bash
pnpm exec astryx component MetadataList --detail full
pnpm exec astryx component MetadataListItem --detail full
sed -n '1,160p' node_modules/.pnpm/@astryxdesign+cli*/node_modules/@astryxdesign/cli/templates/blocks/components/MetadataList/MetadataListBasicMetadata.tsx
```

Expected: the Basic Metadata template composes plain `<MetadataList>` and `<MetadataListItem label="…">` elements without `columns`, `label`, or `orientation` props. If the installed package path has changed, locate the same template with `rg --files node_modules/.pnpm | rg 'MetadataListBasicMetadata\.tsx$'` and inspect that result.

- [ ] **Step 2: Add a failing source-contract test for Basic Metadata defaults**

Add these Node imports to `skill-detail-page.spec.tsx`:

```tsx
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
```

Add this helper after `getResolvedDetail`:

```tsx
function readAppSource(relativePath: string): string {
  const appRoot = process.cwd().endsWith('/apps/github.io')
    ? process.cwd()
    : resolve(process.cwd(), 'apps/github.io');

  return readFileSync(resolve(appRoot, relativePath), 'utf8');
}
```

Add this test inside `describe('SkillDetailPage', ...)`:

```tsx
it('uses the Astryx Basic Metadata defaults without layout overrides', () => {
  const source = readAppSource('src/app/skills/skill-detail-page.tsx');
  const metadataOpeningTag = source.match(/<MetadataList[\s\S]*?>/)?.[0];

  expect(metadataOpeningTag).toBeDefined();
  expect(metadataOpeningTag).not.toMatch(/\bcolumns=/);
  expect(metadataOpeningTag).not.toMatch(/\blabel=/);
  expect(metadataOpeningTag).not.toMatch(/\borientation=/);
});
```

- [ ] **Step 3: Run the focused test and confirm the intended failure**

Run:

```bash
pnpm nx test github.io -- --run src/app/skills/skill-detail-page.spec.tsx
```

Expected: FAIL because the current opening tag contains `columns="single"` and `label={{ position: 'top' }}`. Record the relevant assertion failure before editing production code.

- [ ] **Step 4: Remove the MetadataList presentation overrides**

Replace the current opening tag in `skill-detail-page.tsx`:

```tsx
<MetadataList
  columns="single"
  data-testid="skill-metadata"
  label={{ position: 'top' }}
>
```

with:

```tsx
<MetadataList data-testid="skill-metadata">
```

Do not change the `MetadataListItem` order, conditional Certifications row, category badge list, rating, or citations.

- [ ] **Step 5: Run the component tests and confirm the semantic contract still passes**

Run:

```bash
pnpm nx test github.io -- --run src/app/skills/skill-detail-page.spec.tsx
```

Expected: PASS. The new source-contract test passes, and the existing semantic assertions still confirm `dl`/`dt`/`dd`, row order, badges, rating, citations, evidence, projects, and basic-skill omissions.

- [ ] **Step 6: Inspect and commit the metadata correction**

Run:

```bash
git diff --check
git diff -- apps/github.io/src/app/skills/skill-detail-page.tsx apps/github.io/src/app/skills/skill-detail-page.spec.tsx
git add apps/github.io/src/app/skills/skill-detail-page.tsx apps/github.io/src/app/skills/skill-detail-page.spec.tsx
git diff --cached
git commit -m "fix(github.io): use basic Astryx skill metadata"
```

Expected: one focused commit containing only the default-prop correction and its regression test.

---

### Task 2: Restore Astryx breadcrumb color ownership

**Files:**
- Modify: `apps/github.io/src/app/skills/skill-detail-page.spec.tsx`
- Modify: `apps/github.io/src/styles.css`

**Interfaces:**
- Consumes: the existing default `<Breadcrumbs>` composition, Astryx's layered `BreadcrumbItem` styles, and `readAppSource(relativePath)` from Task 1.
- Produces: no unlayered generic `a { color: inherit; ... }` override, allowing linked ancestors to resolve to Astryx secondary text color and the current item to remain primary.

- [ ] **Step 1: Re-check the installed Astryx Breadcrumb contract**

Run:

```bash
pnpm exec astryx component Breadcrumbs --detail full
pnpm exec astryx component BreadcrumbItem --detail full
```

Expected: default ancestor links use secondary text color and the current item uses primary text color. The `supporting` variant is not appropriate because it makes the whole trail secondary.

- [ ] **Step 2: Add a failing regression test for the global style boundary**

Add this test inside `describe('SkillDetailPage', ...)`:

```tsx
it('does not globally override Astryx link colors outside cascade layers', () => {
  const styles = readAppSource('src/styles.css');
  const unscopedAnchorRule = styles.match(/(?:^|\n)a\s*\{[^}]*\}/)?.[0];

  expect(unscopedAnchorRule).toBeUndefined();
});
```

This regression test protects the ownership boundary rather than copying Astryx color tokens into app code.

- [ ] **Step 3: Run the focused test and confirm the intended failure**

Run:

```bash
pnpm nx test github.io -- --run src/app/skills/skill-detail-page.spec.tsx
```

Expected: FAIL because `src/styles.css` currently contains an unlayered `a { color: inherit; text-decoration: none; }` rule.

- [ ] **Step 4: Remove the generic anchor rule**

Delete only this block from `apps/github.io/src/styles.css`:

```css
a {
  color: inherit;
  text-decoration: none;
}
```

Do not add replacement Breadcrumb selectors or color tokens. Tailwind preflight and Astryx reset layers already provide generic anchor normalization; Astryx component styles must own Breadcrumb colors.

- [ ] **Step 5: Run the component tests**

Run:

```bash
pnpm nx test github.io -- --run src/app/skills/skill-detail-page.spec.tsx
```

Expected: PASS, including the new global-style boundary assertion and all existing detail-page behavior.

- [ ] **Step 6: Inspect and commit the breadcrumb correction**

Run:

```bash
git diff --check
git diff -- apps/github.io/src/styles.css apps/github.io/src/app/skills/skill-detail-page.spec.tsx
git add apps/github.io/src/styles.css apps/github.io/src/app/skills/skill-detail-page.spec.tsx
git diff --cached
git commit -m "fix(github.io): restore Astryx breadcrumb colors"
```

Expected: one focused commit containing only the global-anchor removal and its regression test.

---

### Task 3: Verify the correction in tests, builds, and iPad Storybook

**Files:**
- Verify: `apps/github.io/src/app/skills/skill-detail-page.stories.tsx`
- Verify: `apps/github.io/src/app/skills/skill-detail-page.tsx`
- Verify: `apps/github.io/src/styles.css`

**Interfaces:**
- Consumes: the completed Task 1 and Task 2 commits, `EnrichedKubernetes` and `BasicSkill` stories, the `github.io` Nx project, and the host's Tailscale IPv4 address.
- Produces: recorded verification evidence that Basic Metadata and Breadcrumb colors work at phone, iPad, and desktop widths without regressions.

- [ ] **Step 1: Run the full relevant automated verification**

Run:

```bash
pnpm nx test github.io
pnpm nx lint github.io
pnpm nx build github.io
pnpm nx build-storybook github.io
git diff --check
```

Expected: all tests and both builds PASS; lint has zero errors (existing unrelated warnings may remain); `git diff --check` emits no output.

- [ ] **Step 2: Serve Storybook on the Tailscale-reachable interface**

If the existing Storybook server at port `41737` is not serving the current build, run:

```bash
pnpm exec http-server dist/storybook/github.io -a 0.0.0.0 -p 41737
```

In a separate terminal, get the address:

```bash
tailscale ip -4
```

Expected: Storybook is reachable locally and at `http://<tailscale-ip>:41737/`. Do not expose the server through a public tunnel.

- [ ] **Step 3: Validate the enriched story at phone, iPad, and desktop sizes**

Open the `Skill Detail Page / Enriched Kubernetes` story directly in the Storybook iframe. Check these viewports in order:

```text
390 × 844
768 × 1024
1440 × 900
```

At each size, verify:

- Metadata is the Astryx Basic Metadata key/value layout, not the top-label variant.
- Row order is Categories, Rating, Certifications.
- Badges and certification citations wrap without clipping or horizontal overflow.
- The `Skills` breadcrumb link is visibly gray/secondary and `Kubernetes` is primary.
- The page stays one centered reading column and blockquotes/projects remain aligned.

Use browser evaluation to compare computed styles rather than relying only on appearance:

```js
const nav = document.querySelector('nav[aria-label="Skill breadcrumb"]');
const ancestor = nav?.querySelector('a');
const current = nav?.querySelector('[aria-current="page"]');
const resolveColorToken = (token) => {
  const probe = document.createElement('span');
  probe.style.color = `var(${token})`;
  document.body.append(probe);
  const color = getComputedStyle(probe).color;
  probe.remove();
  return color;
};
const ancestorColor = ancestor ? getComputedStyle(ancestor).color : null;
const currentColor = current ? getComputedStyle(current).color : null;
const secondary = resolveColorToken('--color-text-secondary');
const primary = resolveColorToken('--color-text-primary');
({
  ancestorColor,
  currentColor,
  secondary,
  primary,
  ancestorMatchesSecondary: ancestorColor === secondary,
  currentMatchesPrimary: currentColor === primary,
});
```

Expected: both match booleans are `true`, and ancestor and current computed colors
are different.

- [ ] **Step 4: Validate the basic story and iPad access**

Open `Skill Detail Page / Basic Skill` at `768 × 1024`. Confirm the same Basic Metadata alignment, a gray `Skills` ancestor, a primary current item, no Certifications row, and no empty experience or projects sections. Then open `http://<tailscale-ip>:41737/` from the user's iPad while connected to Tailscale and load both stories.

Expected: both stories render on the iPad without clipping, stale assets, or connection errors.

- [ ] **Step 5: Confirm repository state for review**

Run:

```bash
git status --short --branch
git log -3 --oneline
```

Expected: the branch contains the two focused correction commits after the plan commit, with no uncommitted implementation changes. If visual QA finds a defect, return to the relevant task, add a failing regression test, implement the smallest Astryx-aligned correction, rerun verification, and create a separate conventional commit before reporting completion.
