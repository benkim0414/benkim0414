# Skill Detail Muted Surface Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Give the skill-detail metadata Card a subtle Astryx-managed surface color that differs from the application body in both light and dark modes.

**Architecture:** Keep the existing `Card variant="muted"` composition in `SkillDetailPage` and apply one component-local StyleX background style backed by Astryx's `--color-background-surface` token. Preserve the Neutral theme and every other Card by avoiding global CSS or theme overrides; lock the scope and token choice with the existing source-aware component test.

**Tech Stack:** React 19, TypeScript, Astryx Core 0.1.4, Astryx Neutral Theme 0.1.4, StyleX 0.19, Vitest 4, Testing Library, Nx, Storybook

## Global Constraints

- Keep the metadata Card's `variant="muted"` and `width="100%"` props.
- Use `colorVars['--color-background-surface']`; do not hardcode light or dark color values.
- Apply the background style only to the metadata Card in `SkillDetailPage`.
- Do not change the Astryx Neutral theme, global CSS, or application body background.
- Do not change Card padding, radius, border, metadata structure, metadata content, accessibility semantics, or responsive layout.
- Preserve Categories, Rating, and conditional Certifications in their current order.
- Preserve the Basic MetadataList defaults without `columns`, `label`, or `orientation` overrides.
- Implement this plan with `superpowers:subagent-driven-development`, as selected by the repository's standing workflow instructions.

---

## File Structure

- Modify `apps/github.io/src/app/skills/skill-detail-page.tsx` to import the Astryx color tokens, define one local metadata Card style, and apply it to the existing Card.
- Modify `apps/github.io/src/app/skills/skill-detail-page.spec.tsx` to verify the selected Astryx token is scoped to that Card while retaining the existing muted/full-width contract.
- Do not create or modify production theme, global style, component, data, route, or story files.

### Task 1: Give the Muted Metadata Card a Distinct Astryx Surface

**Files:**
- Modify: `apps/github.io/src/app/skills/skill-detail-page.spec.tsx:55-67`
- Modify: `apps/github.io/src/app/skills/skill-detail-page.tsx:9-39,78`
- Verify: `apps/github.io/src/app/skills/skill-detail-page.stories.tsx`

**Interfaces:**
- Consumes: `colorVars['--color-background-surface']` from `@astryxdesign/core/theme/tokens.stylex`.
- Consumes: the existing `styles` StyleX object and `Card` `xstyle` prop.
- Produces: a private `styles.metadataCard` StyleX style with the exact surface-token-backed `backgroundColor` declaration.
- Produces: no new exported component, prop, type, data, or route API.

- [ ] **Step 1: Extend the Card contract test so it fails on the missing scoped surface style**

Replace the existing `places skill metadata in a full-width muted Astryx Card`
test with the following source-aware and rendered contract:

```tsx
it('places skill metadata in a full-width muted Card with a scoped Astryx surface', () => {
  const source = readAppSource('src/app/skills/skill-detail-page.tsx');
  const metadataCardStyle = source.match(
    /metadataCard:\s*\{[\s\S]*?\n\s*\},/,
  )?.[0];
  const metadataCardOpeningTag = source.match(/<Card[\s\S]*?>/)?.[0];
  const detail = getResolvedDetail('kubernetes');
  const { getByTestId } = render(<SkillDetailPage detail={detail} />);
  const metadata = getByTestId('skill-metadata');
  const card = metadata.closest('.astryx-card');

  expect(metadataCardStyle).toContain(
    "backgroundColor: colorVars['--color-background-surface']",
  );
  expect(metadataCardOpeningTag).toContain('variant="muted"');
  expect(metadataCardOpeningTag).toContain('width="100%"');
  expect(metadataCardOpeningTag).toContain('xstyle={styles.metadataCard}');
  expect(card).not.toBeNull();
  expect(card?.getAttribute('data-variant')).toBe('muted');
  expect((card as HTMLElement).style.getPropertyValue('--x-width')).toBe(
    '100%',
  );
  expect(card?.firstElementChild).toBe(metadata);
});
```

This test deliberately checks both contracts: the rendered Astryx Card remains
muted and full-width, while the source uses the exact semantic token and scopes
the StyleX override to that Card. Do not replace the existing enriched/basic
metadata, semantics, or focus tests.

- [ ] **Step 2: Run the focused test and verify the intended failure**

Run from the linked worktree root:

```bash
pnpm nx test github.io src/app/skills/skill-detail-page.spec.tsx
```

Expected: FAIL in `places skill metadata in a full-width muted Card with a
scoped Astryx surface` because `metadataCardStyle` is undefined and the Card
opening tag has no `xstyle={styles.metadataCard}`. The other five tests pass.

- [ ] **Step 3: Import the color tokens and define the local Card style**

In `skill-detail-page.tsx`, replace the existing spacing-only token import:

```tsx
import { spacingVars } from '@astryxdesign/core/theme/tokens.stylex';
```

with:

```tsx
import {
  colorVars,
  spacingVars,
} from '@astryxdesign/core/theme/tokens.stylex';
```

Add this entry immediately after `page` in the existing `styles` object:

```tsx
metadataCard: {
  backgroundColor: colorVars['--color-background-surface'],
},
```

Do not add a hardcoded fallback, custom property override, global selector, or
new theme definition.

- [ ] **Step 4: Apply the style only to the existing metadata Card**

Replace the metadata Card opening tag:

```tsx
<Card variant="muted" width="100%">
```

with:

```tsx
<Card variant="muted" width="100%" xstyle={styles.metadataCard}>
```

Do not alter the `MetadataList` subtree or any other Card.

- [ ] **Step 5: Run the focused test and verify it passes**

Run:

```bash
pnpm nx test github.io src/app/skills/skill-detail-page.spec.tsx
```

Expected: PASS with 1 test file and 6 tests passing.

- [ ] **Step 6: Run complete automated verification**

Run each command from the linked worktree root:

```bash
pnpm nx test github.io
pnpm nx lint github.io
pnpm nx build github.io
pnpm nx build-storybook github.io
git diff --check
```

Expected:

- All `github.io` tests pass.
- Lint reports no new errors; record pre-existing warnings separately.
- The Vite application build succeeds.
- The static Storybook build succeeds.
- `git diff --check` produces no output.

- [ ] **Step 7: Inspect existing Storybook stories responsively**

Start Storybook if it is not already listening on port 41737:

```bash
pnpm nx storybook github.io -- --host 0.0.0.0 --port 41737
```

Inspect both existing stories in light and dark modes at 390×844, 768×1024,
and 1440×900:

```text
http://localhost:41737/iframe.html?id=github-io-skills-skill-detail-page--enriched-kubernetes&viewMode=story
http://localhost:41737/iframe.html?id=github-io-skills-skill-detail-page--basic-skill&viewMode=story
```

Verify:

- the page body remains `#f1f1f1` light / `#1b1b1b` dark under the current
  Neutral theme;
- the metadata Card resolves to `#ffffff` light / `#262626` dark;
- only the metadata Card receives the distinct surface;
- the title and description remain outside the Card;
- Categories, Rating, and conditional Certifications retain their content and
  order;
- metadata wraps without clipping or horizontal overflow;
- the In practice and Projects sections remain visually unchanged.

- [ ] **Step 8: Review the task-scoped diff**

Inspect only the implementation files:

```bash
git diff -- apps/github.io/src/app/skills/skill-detail-page.tsx apps/github.io/src/app/skills/skill-detail-page.spec.tsx
git status --short
```

Run the repository-required Codex review. Address any correctness, regression,
test-quality, or Astryx-guidance finding, then rerun the affected verification
command before committing.

- [ ] **Step 9: Commit the implementation as one logical change**

Stage the two explicit paths, inspect the staged diff, and commit:

```bash
git add apps/github.io/src/app/skills/skill-detail-page.tsx apps/github.io/src/app/skills/skill-detail-page.spec.tsx
git diff --cached --check
git diff --cached
git commit -m "fix(github.io): distinguish muted skill metadata"
```

Expected: one implementation commit containing only the scoped Astryx surface
style and its regression test. Do not push, merge, deploy, or remove the linked
worktree without explicit user direction.
