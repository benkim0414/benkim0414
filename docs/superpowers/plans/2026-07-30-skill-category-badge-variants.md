# Skill Category Badge Variants Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make `SkillCategory` badges visually distinct by deriving a stable Astryx `Badge` variant from each category name.

**Architecture:** Keep `SkillCategory` as a thin Astryx `Badge` wrapper. Export a deterministic helper from the same module, normalize category names with `trim().toLowerCase()`, hash the normalized string, and map it onto an approved category-only Astryx variant palette.

**Tech Stack:** React 19, TypeScript, Astryx `Badge`, Vitest, Testing Library, Nx, pnpm.

## Global Constraints

- Use Astryx Badge color variants instead of custom hex backgrounds.
- Keep `SkillCategory` rendered with Astryx `Badge`.
- Do not generate arbitrary hex, RGB, or HSL colors.
- Do not add custom StyleX color overrides for category badges.
- Do not change the skill category data model.
- Do not manually maintain a fixed category-to-color map.
- Do not change skill search, filtering, or list layout behavior.
- The approved generated category palette is `blue`, `cyan`, `green`, `orange`, `pink`, `purple`, `teal`, and `yellow`.
- Exclude `success`, `warning`, `error`, and `neutral` from generated category colors.

---

## File Structure

- Modify `apps/github.io/src/app/skills/skill-category.tsx`
  - Owns the `SkillCategory` component.
  - Exports the allowed category variant palette and deterministic
    `getSkillCategoryVariant(name: string): BadgeVariant` helper.
  - Passes the computed variant to Astryx `Badge`.
- Modify `apps/github.io/src/app/skills/skill-category.spec.tsx`
  - Covers rendering, deterministic helper output, normalization, and allowed
    output for the production category list.

No new runtime files are needed. The helper should stay beside the component
until another consumer needs it.

---

### Task 1: Deterministic Category Variant Helper

**Files:**
- Modify: `apps/github.io/src/app/skills/skill-category.tsx`
- Test: `apps/github.io/src/app/skills/skill-category.spec.tsx`

**Interfaces:**
- Consumes: `BadgeVariant` from `@astryxdesign/core/Badge`
- Consumes: `skillCategories` from `./skill-list.types`
- Produces: `skillCategoryBadgeVariants: readonly BadgeVariant[]`
- Produces: `getSkillCategoryVariant(name: string): BadgeVariant`

- [ ] **Step 1: Write the failing helper tests**

Replace `apps/github.io/src/app/skills/skill-category.spec.tsx` with:

```tsx
import { render } from '@testing-library/react';

import {
  getSkillCategoryVariant,
  SkillCategory,
  skillCategoryBadgeVariants,
} from './skill-category';
import { skillCategories } from './skill-list.types';

describe('SkillCategory', () => {
  it('renders the category name as a badge', () => {
    const { getByText } = render(<SkillCategory name="Cloud" />);

    expect(getByText('Cloud')).toBeTruthy();
  });

  it('maps the same category name to the same variant', () => {
    expect(getSkillCategoryVariant('Cloud')).toBe(
      getSkillCategoryVariant('Cloud'),
    );
  });

  it('normalizes category names before mapping them to variants', () => {
    expect(getSkillCategoryVariant(' Cloud ')).toBe(
      getSkillCategoryVariant('cloud'),
    );
  });

  it('maps every production category to an approved Astryx badge variant', () => {
    const allowedVariants = new Set(skillCategoryBadgeVariants);

    for (const category of skillCategories) {
      expect(allowedVariants.has(getSkillCategoryVariant(category))).toBe(true);
    }
  });
});
```

- [ ] **Step 2: Run the focused test to verify it fails**

Run: `pnpm nx test github.io -- --run src/app/skills/skill-category.spec.tsx`

Expected: FAIL because `getSkillCategoryVariant` and
`skillCategoryBadgeVariants` are not exported from `skill-category.tsx`.

- [ ] **Step 3: Add the helper implementation**

Update `apps/github.io/src/app/skills/skill-category.tsx` to include the helper
exports while leaving the component behavior unchanged for this task:

```tsx
import { Badge, type BadgeVariant } from '@astryxdesign/core/Badge';

import type { SkillCategory as SkillCategoryName } from './skill-list.types';

export const skillCategoryBadgeVariants = [
  'blue',
  'cyan',
  'green',
  'orange',
  'pink',
  'purple',
  'teal',
  'yellow',
] as const satisfies readonly BadgeVariant[];

interface SkillCategoryProps {
  name: SkillCategoryName;
}

export function getSkillCategoryVariant(name: string): BadgeVariant {
  const normalizedName = name.trim().toLowerCase();
  let hash = 0;

  for (let index = 0; index < normalizedName.length; index += 1) {
    hash = normalizedName.charCodeAt(index) + ((hash << 5) - hash);
    hash |= 0;
  }

  const variantIndex =
    Math.abs(hash) % skillCategoryBadgeVariants.length;

  return skillCategoryBadgeVariants[variantIndex];
}

export function SkillCategory({ name }: SkillCategoryProps) {
  return <Badge label={name} />;
}
```

- [ ] **Step 4: Run the focused helper tests**

Run: `pnpm nx test github.io -- --run src/app/skills/skill-category.spec.tsx`

Expected: PASS.

- [ ] **Step 5: Commit the helper**

Inspect the diff:

```bash
git diff -- apps/github.io/src/app/skills/skill-category.tsx apps/github.io/src/app/skills/skill-category.spec.tsx
```

Stage explicit paths and commit:

```bash
git add apps/github.io/src/app/skills/skill-category.tsx apps/github.io/src/app/skills/skill-category.spec.tsx
git commit -m "feat(github.io): derive skill category badge variants"
```

---

### Task 2: Apply Generated Variant to SkillCategory

**Files:**
- Modify: `apps/github.io/src/app/skills/skill-category.tsx`
- Test: `apps/github.io/src/app/skills/skill-category.spec.tsx`

**Interfaces:**
- Consumes: `getSkillCategoryVariant(name: string): BadgeVariant`
- Produces: `SkillCategory({ name }: SkillCategoryProps)` rendering
  `<Badge label={name} variant={getSkillCategoryVariant(name)} />`

- [ ] **Step 1: Add a component-level variant test**

Append this test inside the existing `describe('SkillCategory', () => { ... })`
block in `apps/github.io/src/app/skills/skill-category.spec.tsx`:

```tsx
  it('passes the generated variant to the Astryx badge', () => {
    const { container } = render(<SkillCategory name="Cloud" />);
    const badge = container.querySelector('.astryx-badge');

    expect(badge?.className).toContain(getSkillCategoryVariant('Cloud'));
  });
```

- [ ] **Step 2: Run the focused test to verify it fails**

Run: `pnpm nx test github.io -- --run src/app/skills/skill-category.spec.tsx`

Expected: FAIL because `SkillCategory` still renders `<Badge label={name} />`
without the generated `variant`.

- [ ] **Step 3: Pass the generated variant to Badge**

Update the `SkillCategory` return statement in
`apps/github.io/src/app/skills/skill-category.tsx`:

```tsx
export function SkillCategory({ name }: SkillCategoryProps) {
  return <Badge label={name} variant={getSkillCategoryVariant(name)} />;
}
```

- [ ] **Step 4: Run focused tests**

Run: `pnpm nx test github.io -- --run src/app/skills/skill-category.spec.tsx`

Expected: PASS.

- [ ] **Step 5: Run the relevant project test target**

Run: `pnpm nx test github.io`

Expected: PASS. If an unrelated failure appears, capture the failing test name,
error summary, and why it is unrelated to category badge variants.

- [ ] **Step 6: Commit the component wiring**

Inspect the diff:

```bash
git diff -- apps/github.io/src/app/skills/skill-category.tsx apps/github.io/src/app/skills/skill-category.spec.tsx
```

Stage explicit paths and commit:

```bash
git add apps/github.io/src/app/skills/skill-category.tsx apps/github.io/src/app/skills/skill-category.spec.tsx
git commit -m "feat(github.io): color skill category badges"
```
