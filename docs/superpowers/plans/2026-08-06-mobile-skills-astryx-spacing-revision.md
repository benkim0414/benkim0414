# Mobile Skills Astryx Spacing Revision Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace wrapper-owned mobile skills spacing with Astryx-native carousel and stack spacing so the carousel, `All skills` label, and full-width cards have visible 16px gutters and separation.

**Architecture:** `MobileSkillsPage` chooses the mobile spacing steps. `SkillCarousel` exposes an optional Astryx spacing-step prop and forwards it to Carousel's native `padding` API, while applying the same inline inset to its empty state. The scrollable full-list region becomes the Astryx `VStack`, which owns its inline/block padding and label-to-list gap.

**Tech Stack:** React 19, TypeScript, Astryx Design System, Testing Library, Vitest, Nx, Storybook

## Global Constraints

- Use Astryx component props and spacing steps for the changed gutters and gaps.
- Use `spacing-4` (`16px`) for the carousel content gutter, carousel-to-label separation, list inline inset, and list bottom inset.
- Keep `<Text as="h2" type="body" weight="bold">All skills</Text>` unchanged.
- Keep `gap={3}` (`12px`) between the label and list and between carousel/list cards.
- Do not change the default carousel content padding; existing callers that omit the new prop retain no content inset.
- Preserve fixed navigation and carousel placement above the independently scrollable full list.
- Preserve carousel gestures, snapping, card sizing, search, skill data, compact variants, empty-state behavior, and desktop behavior.
- Do not add dependencies or modify Astryx internals or theme files.
- Stage explicit paths only when committing.

---

## File Structure

- Modify `apps/github.io/src/app/skills/skill-carousel.tsx`
  - Expose and apply optional Astryx carousel content padding to populated and empty states.
- Modify `apps/github.io/src/app/skills/skill-carousel.spec.tsx`
  - Cover the new optional padding contract and padded empty-state composition.
- Modify `apps/github.io/src/app/skills/mobile-skills-page.tsx`
  - Select `padding={4}` for the carousel and move list spacing onto the scrollable Astryx `VStack`.
- Modify `apps/github.io/src/app/skills/mobile-skills-page.spec.tsx`
  - Replace wrapper utility assertions with Astryx-native composition assertions.
- Verify `apps/github.io/src/app/skills/skill-card-list.tsx` remains unchanged.
- Verify `apps/github.io/src/app/skills/mobile-skills-page.stories.tsx` remains the visual-review surface.

### Task 1: Apply Astryx-Native Mobile Skills Spacing

**Files:**
- Modify: `apps/github.io/src/app/skills/skill-carousel.spec.tsx`
- Modify: `apps/github.io/src/app/skills/skill-carousel.tsx`
- Modify: `apps/github.io/src/app/skills/mobile-skills-page.spec.tsx`
- Modify: `apps/github.io/src/app/skills/mobile-skills-page.tsx`
- Verify unchanged: `apps/github.io/src/app/skills/skill-card-list.tsx`

**Interfaces:**
- Consumes:
  - `CarouselProps['padding']` from `@astryxdesign/core/Carousel`
  - `VStack` spacing props `paddingInline`, `paddingBlock`, `gap`, and `isScrollable`
- Produces:
  - `SkillCarouselProps.padding?: CarouselProps['padding']`
  - A mobile carousel using `padding={4}` without changing the reusable default
  - A scrollable `main` rendered by `VStack` with 16px inline/block padding and a 12px internal gap

- [ ] **Step 1: Write failing tests for the revised component contract**

In `skill-carousel.spec.tsx`, add a test that renders populated and empty carousels with `padding={4}`. Verify both render successfully, the populated carousel retains its cards, and the empty fallback is contained by an Astryx stack so it can receive the same inline spacing step:

```tsx
it('supports Astryx content padding for populated and empty states', () => {
  const populated = render(
    <SkillCarousel padding={4} skills={sampleSkills.slice(0, 2)} />,
  );

  expect(populated.getAllByTestId('skill-card')).toHaveLength(2);

  populated.unmount();

  const empty = render(<SkillCarousel padding={4} skills={[]} />);
  const status = empty.getByRole('status');

  expect(status.parentElement?.className).toContain('astryx-stack');
});
```

In `mobile-skills-page.spec.tsx`, update `keeps highlighted carousel above the scrollable full skills list` to assert the new ownership boundary:

```tsx
const main = getByRole('main', { name: 'Skills' });

expect(carouselContainer?.className).toContain('shrink-0');
expect(carouselContainer?.className).toContain('pt-4');
expect(carouselContainer?.className).not.toContain('px-4');
expect(carouselContainer?.className).not.toContain('pb-4');
expect(main.className).toContain('astryx-stack');
expect(main.className).toContain('flex-1');
expect(main.className).not.toContain('px-4');
```

Keep the existing semantic ordering, card-count, skill-name, compact-surface, empty-state, and scroll-shell assertions.

- [ ] **Step 2: Run the focused tests to verify they fail for the intended reasons**

Run:

```sh
../../node_modules/.bin/vitest run --config apps/github.io/vite.config.ts apps/github.io/src/app/skills/skill-carousel.spec.tsx apps/github.io/src/app/skills/mobile-skills-page.spec.tsx
```

Expected: FAIL because `SkillCarousel` does not yet expose/apply `padding`, the empty state is not wrapped by an Astryx stack, and `main` is not yet the Astryx stack.

- [ ] **Step 3: Add the optional native padding contract to `SkillCarousel`**

Update the imports and public props:

```tsx
import {
  Carousel,
  type CarouselProps,
} from '@astryxdesign/core/Carousel';
import { VStack } from '@astryxdesign/core/Layout';

export interface SkillCarouselProps {
  skills: readonly Skill[];
  ariaLabel?: string;
  emptyMessage?: string;
  padding?: CarouselProps['padding'];
  variant?: SkillSurfaceVariant;
}
```

Destructure `padding`. Apply the same spacing contract to both states:

```tsx
if (skills.length === 0) {
  const emptyState = (
    <EmptyState headingLevel={3} isCompact title={emptyMessage} />
  );

  return padding == null ? (
    emptyState
  ) : (
    <VStack paddingInline={padding}>
      {emptyState}
    </VStack>
  );
}

return (
  <Carousel
    aria-label={ariaLabel}
    className="skill-carousel"
    gap={3}
    hasSnap
    padding={padding}
  >
    {/* existing mapped SkillCard children */}
  </Carousel>
);
```

Do not assign a default to `padding`; omission must preserve existing callers.

- [ ] **Step 4: Move mobile list spacing to the Astryx `VStack`**

In `mobile-skills-page.tsx`, remove the carousel wrapper's `px-4` and `pb-4`, keep its existing surface and `pt-4`, and request the approved carousel gutter:

```tsx
<div className="shrink-0 bg-[var(--color-background-surface)] pt-4">
  <SkillCarousel
    ariaLabel="Highlighted skills"
    emptyMessage="No highlighted skills have been supplied."
    padding={4}
    skills={highlightedSkills}
    variant="compact"
  />
</div>
```

Replace the raw `main` plus nested stack with one scrollable Astryx stack:

```tsx
<VStack
  aria-labelledby="skills-page-title"
  as="main"
  className="min-h-0 flex-1"
  gap={3}
  isScrollable
  paddingBlock={4}
  paddingInline={4}
>
  <VisuallyHidden as="h1" id="skills-page-title">
    Skills
  </VisuallyHidden>
  <Text as="h2" type="body" weight="bold">
    All skills
  </Text>
  <SkillCardList
    emptyMessage={listEmptyMessage}
    heading="All skills"
    skills={visibleSkills}
    variant="compact"
  />
</VStack>
```

The stack's top block padding creates the 16px carousel-to-label separation; its inline padding aligns the label and full-width cards; its bottom block padding preserves the page inset.

- [ ] **Step 5: Run focused tests and type-aware lint/build checks**

Run:

```sh
../../node_modules/.bin/vitest run --config apps/github.io/vite.config.ts apps/github.io/src/app/skills/skill-carousel.spec.tsx apps/github.io/src/app/skills/mobile-skills-page.spec.tsx
../../node_modules/.bin/nx lint github.io
../../node_modules/.bin/nx build github.io
```

Expected: both focused suites pass, lint passes, and the application build succeeds without new warnings from the changed files.

- [ ] **Step 6: Review and commit the spacing correction**

Run:

```sh
git diff --check
git diff -- apps/github.io/src/app/skills/skill-carousel.spec.tsx apps/github.io/src/app/skills/skill-carousel.tsx apps/github.io/src/app/skills/mobile-skills-page.spec.tsx apps/github.io/src/app/skills/mobile-skills-page.tsx
git diff --exit-code -- apps/github.io/src/app/skills/skill-card-list.tsx
git add apps/github.io/src/app/skills/skill-carousel.spec.tsx apps/github.io/src/app/skills/skill-carousel.tsx apps/github.io/src/app/skills/mobile-skills-page.spec.tsx apps/github.io/src/app/skills/mobile-skills-page.tsx
git diff --cached --check
git diff --cached
git commit -m "fix(github.io): apply native mobile skills spacing"
```

Expected: one focused correction commit and no changes to `SkillCardList`.

### Task 2: Validate The Revised Mobile Layout

**Files:**
- Verify: `apps/github.io/src/app/skills/mobile-skills-page.tsx`
- Verify: `apps/github.io/src/app/skills/mobile-skills-page.spec.tsx`
- Verify: `apps/github.io/src/app/skills/mobile-skills-page.stories.tsx`
- Verify: `apps/github.io/src/app/skills/skill-carousel.tsx`
- Verify: `apps/github.io/src/app/skills/skill-card-list.tsx`

**Interfaces:**
- Consumes: the Astryx-native spacing composition completed in Task 1
- Produces: full-suite, Storybook-build, and iPad visual evidence for final review

- [ ] **Step 1: Run the complete `github.io` test suite**

Run:

```sh
../../node_modules/.bin/vitest run --config apps/github.io/vite.config.ts
```

Expected: all `github.io` test files pass. Existing non-failing dependency warnings may remain, but no new warning should originate from the changed files.

- [ ] **Step 2: Build Storybook**

Run:

```sh
../../node_modules/.bin/nx build-storybook github.io
```

Expected: Storybook builds successfully into the configured static output directory.

- [ ] **Step 3: Restart Storybook for visual review**

Run:

```sh
../../node_modules/.bin/nx storybook github.io --host 0.0.0.0 --port 6007
```

Inspect `GitHub.io/Skills/Mobile Skills Page` at `390px x 844px` and `768px x 1024px`. Confirm:

- The first and final carousel cards align to a 16px scroll gutter.
- Carousel snapping aligns cards to the same gutter.
- `All skills` is visibly separated from the carousel by 16px.
- `All skills` and every full-width list card retain 16px left/right insets.
- The label-to-list and card-to-card gaps remain 12px.
- The fixed carousel does not move while the list scrolls vertically.
- Populated, filtered, no-highlighted-skills, and no-skills states have no overlap, clipping, or lost inset.

- [ ] **Step 4: Run final branch checks and request review**

Run:

```sh
git diff --check
git status --short --branch
git log --oneline --decorate -6
```

Expected: no whitespace errors, a clean feature worktree, and separate design, plan, implementation, and correction commits. Request code review before branch integration; do not push, merge, deploy, or delete the worktree without explicit handoff approval.
