# Skill Rating Heroicons Stars Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Update `SkillRating` so it renders equal-size Heroicons stars in Astryx yellow with Astryx supporting text for `{level}/5`.

**Architecture:** Keep `SkillRating` as a pure presentational React component with the same `level` prop and the same accessible rating phrase. Replace text star glyphs with five equal-size icon components, using solid stars for earned positions and outline stars for unearned positions. Keep local StyleX responsible only for inline layout, icon sizing, and token-based color.

**Tech Stack:** Nx, pnpm, React 19, TypeScript, Vitest, Testing Library, Astryx `Text`, Astryx `VisuallyHidden`, Astryx StyleX token exports, StyleX, `@heroicons/react`.

## Global Constraints

- Work in the linked worktree at `.worktrees/skill-rating-heroicons-stars`.
- Scope behavior and markup changes to `apps/github.io/src/app/skills/skill-rating.tsx`.
- Keep the `SkillRating` public props unchanged: `<SkillRating level={skill.level} />`.
- Render five visible stars for every rating.
- Earned stars use the solid Heroicons `StarIcon`.
- Unearned stars use the outline Heroicons `StarIcon`.
- Solid and outline stars must use the same rendered dimensions.
- All stars use Astryx yellow from `colorVars['--color-icon-yellow']`.
- Render visible numeric companion text as Astryx `Text type="supporting"` with content like `4/5`.
- Preserve hidden accessible text through Astryx `VisuallyHidden` with content like `4 out of 5`.
- Do not add dependencies; `@heroicons/react` is already installed.
- Astryx docs checked before planning: `pnpm exec astryx docs styling`, `pnpm exec astryx docs typography`, and `pnpm exec astryx docs tokens`.

---

## File Structure

- Modify `apps/github.io/src/app/skills/skill-rating.spec.tsx`: assert the accessible phrase, visible supporting rating text, five rendered star icons, and equal icon sizing hook.
- Modify `apps/github.io/src/app/skills/skill-rating.tsx`: import Heroicons, Astryx `Text`, and Astryx `colorVars`; render five icon slots plus supporting text.
- Leave `apps/github.io/src/app/skills/skill-rating.stories.tsx` unchanged because existing `Expert` and `Intermediate` stories already exercise the component visually.
- Leave consumers such as `skill-list-item.tsx` and `skill-card.tsx` unchanged because the component API does not change.

### Task 1: SkillRating Heroicons Rendering

**Files:**
- Modify: `apps/github.io/src/app/skills/skill-rating.spec.tsx`
- Modify: `apps/github.io/src/app/skills/skill-rating.tsx`

**Interfaces:**
- Consumes: `SkillRating({ level }: { level: Skill['level'] })`
- Produces: the same `SkillRating` export and prop contract, with rendered decorative star icons and supporting text.

- [ ] **Step 1: Replace the focused test with icon and text assertions**

Edit `apps/github.io/src/app/skills/skill-rating.spec.tsx` to this content:

```tsx
import { render, screen } from '@testing-library/react';

import { SkillRating } from './skill-rating';

describe('SkillRating', () => {
  it('renders equal-size Heroicons stars with supporting rating text', () => {
    render(<SkillRating level={4} />);

    expect(screen.getByText('4 out of 5')).toBeTruthy();
    expect(screen.getByText('4/5').closest('[aria-hidden="true"]')).toBeTruthy();

    const stars = screen.getAllByTestId('skill-rating-star');

    expect(stars).toHaveLength(5);
    expect(stars.filter((star) => star.dataset.filled === 'true')).toHaveLength(
      4,
    );
    expect(stars.filter((star) => star.dataset.filled === 'false')).toHaveLength(
      1,
    );

    const classNames = stars.map((star) => star.getAttribute('class'));
    expect(new Set(classNames)).toHaveLength(1);
  });
});
```

- [ ] **Step 2: Run the focused test to verify it fails**

Run:

```bash
pnpm nx test github.io --testFile=apps/github.io/src/app/skills/skill-rating.spec.tsx
```

Expected: FAIL because the current component renders text glyphs and no `data-testid="skill-rating-star"` elements.

- [ ] **Step 3: Update `SkillRating` imports**

In `apps/github.io/src/app/skills/skill-rating.tsx`, replace the current imports with:

```tsx
import { StarIcon as StarOutlineIcon } from '@heroicons/react/24/outline';
import { StarIcon as StarSolidIcon } from '@heroicons/react/24/solid';
import { Text } from '@astryxdesign/core/Text';
import { VisuallyHidden } from '@astryxdesign/core/VisuallyHidden';
import { colorVars, spacingVars } from '@astryxdesign/core/theme/tokens.stylex';
import * as stylex from '@stylexjs/stylex';

import type { Skill } from './skill-list.types';
```

- [ ] **Step 4: Replace the StyleX styles**

In `apps/github.io/src/app/skills/skill-rating.tsx`, replace the current `styles` object with:

```tsx
const styles = stylex.create({
  root: {
    display: 'inline-flex',
    flex: '0 0 auto',
    alignItems: 'center',
    gap: spacingVars['--spacing-1'],
    color: colorVars['--color-icon-yellow'],
    letterSpacing: 0,
    whiteSpace: 'nowrap',
  },
  stars: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: spacingVars['--spacing-0-5'],
  },
  star: {
    display: 'block',
    width: spacingVars['--spacing-4'],
    height: spacingVars['--spacing-4'],
    flex: '0 0 auto',
    color: colorVars['--color-icon-yellow'],
  },
});
```

- [ ] **Step 5: Replace the component render body**

In `apps/github.io/src/app/skills/skill-rating.tsx`, replace the current `SkillRating` implementation with:

```tsx
export function SkillRating({ level }: SkillRatingProps) {
  return (
    <span {...stylex.props(styles.root)}>
      <VisuallyHidden>{level} out of 5</VisuallyHidden>
      <span {...stylex.props(styles.stars)} aria-hidden="true">
        {Array.from({ length: 5 }, (_, index) => {
          const isFilled = index < level;
          const StarIcon = isFilled ? StarSolidIcon : StarOutlineIcon;

          return (
            <StarIcon
              {...stylex.props(styles.star)}
              aria-hidden="true"
              data-filled={isFilled}
              data-testid="skill-rating-star"
              key={index}
            />
          );
        })}
      </span>
      <Text type="supporting" aria-hidden="true">
        {level}/5
      </Text>
    </span>
  );
}
```

- [ ] **Step 6: Run the focused test to verify it passes**

Run:

```bash
pnpm nx test github.io --testFile=apps/github.io/src/app/skills/skill-rating.spec.tsx
```

Expected: PASS for `SkillRating`.

- [ ] **Step 7: Run focused app lint**

Run:

```bash
pnpm nx lint github.io
```

Expected: PASS.

- [ ] **Step 8: Visually inspect the Storybook story**

Start Storybook from the app directory so the worktree source and config line up:

```bash
pnpm nx storybook github.io --host 0.0.0.0
```

Open the `GitHub.io/Skills/Skill Rating` story and check:

- `Expert` shows five equal-size solid yellow stars and `5/5` supporting text.
- `Intermediate` shows three equal-size solid yellow stars, two equal-size outline yellow stars, and `3/5` supporting text.
- The star row and supporting text stay aligned without clipping or overlap.

Stop Storybook after inspection.

- [ ] **Step 9: Inspect the implementation diff**

Run:

```bash
git diff -- apps/github.io/src/app/skills/skill-rating.tsx apps/github.io/src/app/skills/skill-rating.spec.tsx
```

Expected: the diff only changes `SkillRating` and its focused test. No consumer files, story files, dependencies, lockfiles, or unrelated docs change.

- [ ] **Step 10: Commit the implementation**

Stage explicit paths only:

```bash
git add apps/github.io/src/app/skills/skill-rating.tsx apps/github.io/src/app/skills/skill-rating.spec.tsx
git diff --cached
git commit -m "fix(github.io): render skill ratings with heroicons"
```
