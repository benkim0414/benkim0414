# Mobile Skills List Label And Spacing Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a visible “All skills” heading and Astryx-aligned mobile spacing around the highlighted carousel and full skills list.

**Architecture:** Keep the change inside `MobileSkillsPage`, which already owns page hierarchy and outer layout spacing. Preserve `SkillCarousel` and `SkillCardList` defaults, including their existing `gap={3}` internal spacing, while composing the visible list heading and list in the page's existing Astryx `VStack`.

**Tech Stack:** React 19, TypeScript, Astryx Design System, Tailwind utilities backed by Astryx spacing tokens, Testing Library, Vitest, Nx, Storybook

## Global Constraints

- Render the visible label exactly as `All skills`.
- Use `<Text as="h2" type="body" weight="bold">` for the visible label.
- Keep the visually hidden `Skills` `h1` as the page title.
- Use Astryx `spacing-4` (`16px`) between the navigation and carousel, around the carousel inline edges, and between the carousel and the full-list label.
- Use Astryx `spacing-3` (`12px`) between the full-list label and list content.
- Retain the existing `gap={3}` (`12px`) inside `SkillCarousel` and `SkillCardList`.
- Keep page-level spacing in `MobileSkillsPage`; do not add spacing responsibilities to shared components.
- Do not change carousel gestures, snapping, card sizing, search, skill data, compact variants, empty-state behavior, or desktop behavior.
- Do not add dependencies or modify Astryx theme files or generated carousel internals.
- Stage explicit paths only when committing.

---

## File Structure

- Modify `apps/github.io/src/app/skills/mobile-skills-page.spec.tsx`
  - Lock the new heading semantics, ordering, accessible name, and page-owned spacing.
- Modify `apps/github.io/src/app/skills/mobile-skills-page.tsx`
  - Add the `All skills` Astryx label, update the region name, and add the missing carousel top spacing.
- Verify `apps/github.io/src/app/skills/skill-carousel.tsx` remains unchanged.
  - Its existing `gap={3}` continues to own carousel card spacing.
- Verify `apps/github.io/src/app/skills/mobile-skills-page.stories.tsx` without changing it.
  - Its page-level stories remain the visual validation surface.

### Task 1: Add The Full Skills Label And Page Spacing

**Files:**
- Modify: `apps/github.io/src/app/skills/mobile-skills-page.spec.tsx:118-170`
- Modify: `apps/github.io/src/app/skills/mobile-skills-page.tsx:118-145`
- Verify unchanged: `apps/github.io/src/app/skills/skill-carousel.tsx`

**Interfaces:**
- Consumes:
  - `Text` from `@astryxdesign/core/Text`
  - `VStack` from `@astryxdesign/core/Layout`
  - `SkillCarousel` and `SkillCardList` with their existing props
- Produces:
  - A visible `h2` named `All skills` using Astryx body text with bold weight
  - A full-list region whose accessible name is `All skills`
  - `spacing-4` outer carousel spacing without changing carousel internals

- [ ] **Step 1: Update the page test with the failing hierarchy and spacing contract**

In `apps/github.io/src/app/skills/mobile-skills-page.spec.tsx`, replace the setup and structural expectations in `keeps highlighted carousel above the scrollable full skills list` with the following. Keep the existing highlighted-card count, list-card count, and skill-name assertions after this block.

```tsx
const { getByLabelText, getByRole } = renderMobileSkillsPage();
const carousel = getByLabelText('Highlighted skills');
const carouselContainer = carousel.parentElement;
const listHeading = getByRole('heading', {
  level: 2,
  name: 'All skills',
});
const list = getByRole('region', { name: 'All skills' });

expect(listHeading.compareDocumentPosition(carousel)).toBe(
  Node.DOCUMENT_POSITION_PRECEDING,
);
expect(listHeading.compareDocumentPosition(list)).toBe(
  Node.DOCUMENT_POSITION_FOLLOWING,
);
expect(listHeading.parentElement).toBe(list.parentElement);
expect(listHeading.className).toContain('astryx-text');
expect(carouselContainer?.className).toContain('shrink-0');
expect(carouselContainer?.className).toContain('px-4');
expect(carouselContainer?.className).toContain('pt-4');
expect(carouselContainer?.className).toContain('pb-4');
```

Update the `uses compact skill surfaces for mobile` test to query the renamed region:

```tsx
const list = getByRole('region', { name: 'All skills' });
```

Update any remaining page-test query that expects the full-list region name `Skills` to expect `All skills`. Do not change the main landmark query; the page-level `main` remains named `Skills` by the hidden `h1`.

- [ ] **Step 2: Run the focused test to verify it fails for the intended reason**

Run from the feature worktree:

```sh
../../node_modules/.bin/vitest run --config apps/github.io/vite.config.ts apps/github.io/src/app/skills/mobile-skills-page.spec.tsx
```

Expected: FAIL because no level-2 `All skills` heading or `All skills` region exists. The carousel wrapper also lacks `pt-4`.

- [ ] **Step 3: Implement the minimal page composition**

In `apps/github.io/src/app/skills/mobile-skills-page.tsx`, add the missing top inset to the page-owned carousel wrapper without changing `SkillCarousel`:

```tsx
<div className="shrink-0 bg-[var(--color-background-surface)] px-4 pb-4 pt-4">
  <SkillCarousel
    ariaLabel="Highlighted skills"
    emptyMessage="No highlighted skills have been supplied."
    skills={highlightedSkills}
    variant="compact"
  />
</div>
```

Compose the visible label and full-list region inside the existing `VStack`:

```tsx
<VStack gap={3}>
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

Do not add another wrapper gap, margin, typography class, or carousel prop. The carousel wrapper's `pb-4` creates the approved 16px carousel-to-label separation, and `VStack gap={3}` creates the approved 12px label-to-list separation.

- [ ] **Step 4: Run the focused test to verify it passes**

Run:

```sh
../../node_modules/.bin/vitest run --config apps/github.io/vite.config.ts apps/github.io/src/app/skills/mobile-skills-page.spec.tsx
```

Expected: PASS with all mobile skills page tests green.

- [ ] **Step 5: Verify shared carousel behavior remains unchanged**

Run:

```sh
../../node_modules/.bin/vitest run --config apps/github.io/vite.config.ts apps/github.io/src/app/skills/skill-carousel.spec.tsx
git diff --exit-code -- apps/github.io/src/app/skills/skill-carousel.tsx apps/github.io/src/app/skills/skill-card-list.tsx
```

Expected: the carousel suite passes, and `git diff --exit-code` reports no shared-component changes. Confirm `SkillCarousel` still declares `gap={3}` during diff review.

- [ ] **Step 6: Inspect and commit the implementation**

Run:

```sh
git diff --check
git diff -- apps/github.io/src/app/skills/mobile-skills-page.spec.tsx apps/github.io/src/app/skills/mobile-skills-page.tsx
git status --short
git add apps/github.io/src/app/skills/mobile-skills-page.spec.tsx apps/github.io/src/app/skills/mobile-skills-page.tsx
git diff --cached --check
git diff --cached
git commit -m "feat(github.io): label mobile skills list"
```

Expected: one focused commit containing only the page test and implementation.

### Task 2: Validate The Mobile Page End To End

**Files:**
- Verify: `apps/github.io/src/app/skills/mobile-skills-page.tsx`
- Verify: `apps/github.io/src/app/skills/mobile-skills-page.spec.tsx`
- Verify: `apps/github.io/src/app/skills/mobile-skills-page.stories.tsx`
- Verify: `apps/github.io/src/app/skills/skill-carousel.tsx`

**Interfaces:**
- Consumes: the completed `MobileSkillsPage` composition from Task 1
- Produces: test, build, and visual evidence that the mobile hierarchy works without regressions

- [ ] **Step 1: Run the complete `github.io` test suite**

Run:

```sh
../../node_modules/.bin/vitest run --config apps/github.io/vite.config.ts
```

Expected: all `github.io` test files pass. Existing non-failing deprecation or React warnings may remain, but no new warning should originate from the changed files.

- [ ] **Step 2: Build the `github.io` Storybook**

Run:

```sh
../../node_modules/.bin/nx build-storybook github.io
```

Expected: Storybook builds successfully into `apps/github.io/storybook-static` or the target's configured output directory.

- [ ] **Step 3: Start Storybook for mobile visual review**

Run:

```sh
../../node_modules/.bin/nx storybook github.io --host 0.0.0.0 --port 6007
```

Open the `GitHub.io/Skills/Mobile Skills Page` default story and inspect it at:

- Narrow phone: `390px × 844px`.
- iPad portrait: `768px × 1024px`.

Confirm all of the following:

- There is 16px between the navigation and carousel.
- The carousel retains 16px inline page insets.
- There is 16px between the carousel and `All skills`.
- There is 12px between `All skills` and the first card.
- `All skills` uses body-sized bold Astryx typography.
- Horizontal carousel scrolling and snapping still work.
- The full list scrolls vertically without moving the top navigation or carousel.
- The default, single-list-skill, and empty stories have no overlap, clipping, or unexpected blank space.

Stop Storybook after validation.

- [ ] **Step 4: Run final repository checks and review the branch**

Run:

```sh
git diff --check HEAD~1..HEAD
git status --short --branch
git log --oneline --decorate -3
```

Expected: no whitespace errors, a clean feature worktree, and separate documentation and implementation commits. Request code review before branch integration; do not push, merge, deploy, or delete the worktree without the user's explicit handoff instruction.
