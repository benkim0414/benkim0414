# Skills Main Page Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the first real `github.io` page as a searchable skills-only main page.

**Architecture:** Keep `AppShell` as the app-level composition boundary with the Astryx `Theme` wrapper. `AppShell` renders a single `main` landmark with a visually hidden page `h1` and wires `sampleSkills` into the existing `SkillSection`; `SkillSection` continues to own search state and filtering.

**Tech Stack:** React 19, Nx 23, Vite, Vitest, Testing Library, Storybook, Astryx `Theme`, Astryx `VisuallyHidden`, Astryx `PowerSearch`, Astryx `List`.

## Global Constraints

- Make `SkillSection` the primary page content.
- Place `SkillSearch` directly above `SkillList`.
- Keep the page heading accessible but visually hidden.
- Remove the visible app bar, hero, placeholder sections, and footer from the current main page.
- Keep the layout responsive for phones, tablets, and desktop browsers.
- Follow Astryx design guidelines first, and use Material Design guidance only where Astryx has no applicable pattern.
- Do not add portfolio, project, note, contact, or landing-page content.
- Do not add app bar branding or navigation yet.
- Do not redesign the existing skill item components.
- Do not change the skill data model or skill categories.
- Stage explicit paths only; do not use `git add -A`, `git add --all`, `git add -u`, `git add .`, `git commit -a`, or `git commit -am`.

---

## File Structure

- Modify `apps/github.io/src/app/skills/skill-list.types.ts` to add `isHeadingHidden?: boolean` to `SkillListProps`.
- Modify `apps/github.io/src/app/skills/skill-list.tsx` to wrap the list heading in Astryx `VisuallyHidden` when `isHeadingHidden` is true.
- Modify `apps/github.io/src/app/skills/skill-section.tsx` to pass `isHeadingHidden` through to `SkillList`.
- Modify `apps/github.io/src/app/skills/skill-list.spec.tsx` to cover hidden-heading accessibility.
- Modify `apps/github.io/src/app/app-shell.tsx` to render the skills-only page.
- Modify `apps/github.io/src/app/app.spec.tsx` to assert the new page and absence of the old shell content.
- Modify `apps/github.io/src/app/app-shell.stories.tsx` to rename the fullscreen shell story to the skills page.
- Modify `apps/github.io/src/styles.css` to add skills-page spacing and remove CSS only used by deleted placeholder shell pieces.
- Delete now-unused placeholder shell files:
  - `apps/github.io/src/app/app-shell.data.ts`
  - `apps/github.io/src/app/app-shell.types.ts`
  - `apps/github.io/src/app/top-bar.tsx`
  - `apps/github.io/src/app/top-bar.spec.tsx`
  - `apps/github.io/src/app/top-bar.stories.tsx`
  - `apps/github.io/src/app/hero-intro.tsx`
  - `apps/github.io/src/app/hero-intro.stories.tsx`
  - `apps/github.io/src/app/placeholder-section.tsx`
  - `apps/github.io/src/app/placeholder-section.spec.tsx`
  - `apps/github.io/src/app/placeholder-section.stories.tsx`
  - `apps/github.io/src/app/site-footer.tsx`
  - `apps/github.io/src/app/site-footer.stories.tsx`

---

### Task 1: Add Hidden Heading Support To Skill List

**Files:**
- Modify: `apps/github.io/src/app/skills/skill-list.types.ts`
- Modify: `apps/github.io/src/app/skills/skill-list.tsx`
- Modify: `apps/github.io/src/app/skills/skill-section.tsx`
- Test: `apps/github.io/src/app/skills/skill-list.spec.tsx`

**Interfaces:**
- Consumes: `SkillListProps` with `skills`, `heading`, and `emptyMessage`.
- Produces: `SkillListProps.isHeadingHidden?: boolean`; `SkillSection` accepts and forwards the same prop through its existing `SkillListProps` parameter.

- [ ] **Step 1: Write the failing hidden-heading test**

Add this test to `apps/github.io/src/app/skills/skill-list.spec.tsx`:

```tsx
it('can hide its visible heading while keeping the region accessible', () => {
  const { getByRole } = render(
    <SkillList heading="Skills" isHeadingHidden skills={sampleSkills} />
  );

  const region = getByRole('region', { name: 'Skills' });
  const heading = getByRole('heading', { level: 2, name: 'Skills' });

  expect(region.getAttribute('aria-labelledby')).toBe(heading.id);
});
```

- [ ] **Step 2: Run the focused test and verify it fails**

Run:

```bash
PATH=/tmp/corepack-shims:$PATH corepack pnpm nx test github.io -- --run apps/github.io/src/app/skills/skill-list.spec.tsx
```

Expected: FAIL because `isHeadingHidden` is not defined on `SkillListProps`.

- [ ] **Step 3: Add the prop type**

Update `apps/github.io/src/app/skills/skill-list.types.ts`:

```ts
export interface SkillListProps {
  skills: readonly Skill[];
  heading?: string;
  emptyMessage?: string;
  isHeadingHidden?: boolean;
}
```

- [ ] **Step 4: Hide the heading with Astryx `VisuallyHidden`**

Update `apps/github.io/src/app/skills/skill-list.tsx` to import `VisuallyHidden` and render the heading through a small local variable:

```tsx
import { useId } from 'react';
import { EmptyState } from '@astryxdesign/core/EmptyState';
import { List } from '@astryxdesign/core/List';
import { VisuallyHidden } from '@astryxdesign/core/VisuallyHidden';

import { SkillListItem } from './skill-list-item';
import type { SkillListProps } from './skill-list.types';

export function SkillList({
  skills,
  heading = 'Skills',
  emptyMessage = 'No skills have been supplied.',
  isHeadingHidden = false,
}: SkillListProps) {
  const headingId = useId();
  const headingElement = <h2 id={headingId}>{heading}</h2>;

  return (
    <section className="skill-list" aria-labelledby={headingId}>
      <div className="skill-list__header">
        {isHeadingHidden ? (
          <VisuallyHidden>{headingElement}</VisuallyHidden>
        ) : (
          headingElement
        )}
      </div>

      {skills.length === 0 ? (
        <EmptyState headingLevel={3} isCompact title={emptyMessage} />
      ) : (
        <List className="skill-list__items" density="compact" hasDividers>
          {skills.map((skill) => (
            <SkillListItem key={skill.id} skill={skill} />
          ))}
        </List>
      )}
    </section>
  );
}
```

- [ ] **Step 5: Pass the prop through `SkillSection`**

Update `apps/github.io/src/app/skills/skill-section.tsx`:

```tsx
export function SkillSection({
  skills,
  heading = 'Skills',
  emptyMessage = 'No skills have been supplied.',
  isHeadingHidden = false,
}: SkillListProps) {
  const [filters, setFilters] = useState<ReadonlyArray<PowerSearchFilter>>([]);
  const filteredSkills = useMemo(
    () => skills.filter((skill) => skillMatchesFilters(skill, filters)),
    [filters, skills]
  );

  return (
    <div className="skill-section">
      <div className="skill-section__search">
        <SkillSearch filters={filters} onFiltersChange={setFilters} />
      </div>

      <SkillList
        emptyMessage={
          skills.length === 0 ? emptyMessage : 'No skills match your search.'
        }
        heading={heading}
        isHeadingHidden={isHeadingHidden}
        skills={filteredSkills}
      />
    </div>
  );
}
```

- [ ] **Step 6: Run the focused tests**

Run:

```bash
PATH=/tmp/corepack-shims:$PATH corepack pnpm nx test github.io -- --run apps/github.io/src/app/skills/skill-list.spec.tsx apps/github.io/src/app/skills/skill-section.spec.tsx
```

Expected: PASS.

- [ ] **Step 7: Commit Task 1**

Inspect and commit only these files:

```bash
git diff -- apps/github.io/src/app/skills/skill-list.types.ts apps/github.io/src/app/skills/skill-list.tsx apps/github.io/src/app/skills/skill-section.tsx apps/github.io/src/app/skills/skill-list.spec.tsx
git status --short
git add apps/github.io/src/app/skills/skill-list.types.ts apps/github.io/src/app/skills/skill-list.tsx apps/github.io/src/app/skills/skill-section.tsx apps/github.io/src/app/skills/skill-list.spec.tsx
git diff --cached
PATH=/tmp/corepack-shims:$PATH git commit -m "feat(github.io): support hidden skill list headings"
```

---

### Task 2: Wire The Skills-Only Main Page

**Files:**
- Modify: `apps/github.io/src/app/app-shell.tsx`
- Modify: `apps/github.io/src/app/app.spec.tsx`
- Modify: `apps/github.io/src/app/app-shell.stories.tsx`
- Modify: `apps/github.io/src/styles.css`
- Delete: placeholder shell files listed in File Structure

**Interfaces:**
- Consumes: `SkillSection({ skills, heading, emptyMessage, isHeadingHidden })` from Task 1 and `sampleSkills` from `apps/github.io/src/app/skills/skill-list.data.ts`.
- Produces: `AppShell()` rendering an Astryx `Theme` wrapper, a `main` with `className="page page--skills"` and `aria-labelledby="skills-page-title"`, a visually hidden `h1` with `id="skills-page-title"` and text `Skills`, and `SkillSection` wired to `sampleSkills`.

- [ ] **Step 1: Write the failing app test**

Replace `apps/github.io/src/app/app.spec.tsx` with:

```tsx
import { render } from '@testing-library/react';

import App from './app';

describe('App', () => {
  it('renders the skills-first page successfully', () => {
    const { getByRole, getByText } = render(<App />);

    expect(getByRole('main', { name: 'Skills' })).toBeTruthy();
    expect(getByRole('combobox', { name: 'Search skills' })).toBeTruthy();
    expect(getByText('TypeScript')).toBeTruthy();
    expect(getByText('React')).toBeTruthy();
  });

  it('does not render the previous generic shell content', () => {
    const { queryByLabelText, queryByRole, queryByText } = render(<App />);

    expect(queryByRole('link', { name: 'Home' })).toBeNull();
    expect(queryByLabelText('Primary navigation')).toBeNull();
    expect(queryByText('Generic Layout Skeleton')).toBeNull();
    expect(queryByText('Content Region')).toBeNull();
    expect(queryByText('Footer Region')).toBeNull();
  });
});
```

- [ ] **Step 2: Run the app test and verify it fails**

Run:

```bash
PATH=/tmp/corepack-shims:$PATH corepack pnpm nx test github.io -- --run apps/github.io/src/app/app.spec.tsx
```

Expected: FAIL because the current app still renders the generic shell content.

- [ ] **Step 3: Wire `AppShell` to the skills page**

Replace `apps/github.io/src/app/app-shell.tsx` with:

```tsx
import { Theme } from '@astryxdesign/core';
import { VisuallyHidden } from '@astryxdesign/core/VisuallyHidden';
import { neutralTheme } from '@astryxdesign/theme-neutral/built';

import { sampleSkills } from './skills/skill-list.data';
import { SkillSection } from './skills/skill-section';

export function AppShell() {
  return (
    <Theme theme={neutralTheme}>
      <main
        aria-labelledby="skills-page-title"
        className="page page--skills"
      >
        <VisuallyHidden>
          <h1 id="skills-page-title">Skills</h1>
        </VisuallyHidden>

        <SkillSection heading="Skills" isHeadingHidden skills={sampleSkills} />
      </main>
    </Theme>
  );
}
```

- [ ] **Step 4: Update the app shell story title**

Keep `apps/github.io/src/app/app-shell.stories.tsx` fullscreen and update only the title string:

```tsx
import type { Meta, StoryObj } from '@storybook/react-vite';

import { AppShell } from './app-shell';

const meta: Meta<typeof AppShell> = {
  component: AppShell,
  parameters: {
    layout: 'fullscreen',
  },
  title: 'GitHub.io/App Shell/Skills Page',
};

export default meta;
type Story = StoryObj<typeof AppShell>;

export const Default: Story = {};
```

- [ ] **Step 5: Update page CSS**

Edit `apps/github.io/src/styles.css`:

```css
.page {
  width: min(100% - 32px, 960px);
  margin: 0 auto;
  padding: var(--spacing-10) 0 var(--spacing-8);
}

.page--skills {
  padding-top: clamp(var(--spacing-5), 5vw, var(--spacing-10));
}
```

Delete every rule block for these selectors because the owning components are removed:

```css
.top-bar
.brand
.nav
.intro
.intro h1
.intro p:not(.eyebrow),
.content-section p:not(.eyebrow)
.eyebrow
.section-list
.content-section
.content-section h2
.footer
@media (max-width: 640px) {
  .top-bar
  .nav
}
```

Keep the existing base styles, `.page`, skill styles, and mobile skill-list styles.

- [ ] **Step 6: Delete unused placeholder shell files**

Run:

```bash
rm apps/github.io/src/app/app-shell.data.ts
rm apps/github.io/src/app/app-shell.types.ts
rm apps/github.io/src/app/top-bar.tsx
rm apps/github.io/src/app/top-bar.spec.tsx
rm apps/github.io/src/app/top-bar.stories.tsx
rm apps/github.io/src/app/hero-intro.tsx
rm apps/github.io/src/app/hero-intro.stories.tsx
rm apps/github.io/src/app/placeholder-section.tsx
rm apps/github.io/src/app/placeholder-section.spec.tsx
rm apps/github.io/src/app/placeholder-section.stories.tsx
rm apps/github.io/src/app/site-footer.tsx
rm apps/github.io/src/app/site-footer.stories.tsx
```

- [ ] **Step 7: Run focused tests**

Run:

```bash
PATH=/tmp/corepack-shims:$PATH corepack pnpm nx test github.io -- --run apps/github.io/src/app/app.spec.tsx apps/github.io/src/app/skills/skill-list.spec.tsx apps/github.io/src/app/skills/skill-section.spec.tsx
```

Expected: PASS.

- [ ] **Step 8: Commit Task 2**

Inspect and commit only these paths:

```bash
git diff -- apps/github.io/src/app/app-shell.tsx apps/github.io/src/app/app.spec.tsx apps/github.io/src/app/app-shell.stories.tsx apps/github.io/src/styles.css apps/github.io/src/app/app-shell.data.ts apps/github.io/src/app/app-shell.types.ts apps/github.io/src/app/top-bar.tsx apps/github.io/src/app/top-bar.spec.tsx apps/github.io/src/app/top-bar.stories.tsx apps/github.io/src/app/hero-intro.tsx apps/github.io/src/app/hero-intro.stories.tsx apps/github.io/src/app/placeholder-section.tsx apps/github.io/src/app/placeholder-section.spec.tsx apps/github.io/src/app/placeholder-section.stories.tsx apps/github.io/src/app/site-footer.tsx apps/github.io/src/app/site-footer.stories.tsx
git status --short
git add apps/github.io/src/app/app-shell.tsx apps/github.io/src/app/app.spec.tsx apps/github.io/src/app/app-shell.stories.tsx apps/github.io/src/styles.css
git add apps/github.io/src/app/app-shell.data.ts apps/github.io/src/app/app-shell.types.ts apps/github.io/src/app/top-bar.tsx apps/github.io/src/app/top-bar.spec.tsx apps/github.io/src/app/top-bar.stories.tsx apps/github.io/src/app/hero-intro.tsx apps/github.io/src/app/hero-intro.stories.tsx apps/github.io/src/app/placeholder-section.tsx apps/github.io/src/app/placeholder-section.spec.tsx apps/github.io/src/app/placeholder-section.stories.tsx apps/github.io/src/app/site-footer.tsx apps/github.io/src/app/site-footer.stories.tsx
git diff --cached
PATH=/tmp/corepack-shims:$PATH git commit -m "feat(github.io): render skills main page"
```

---

### Task 3: Final Verification

**Files:**
- No planned source edits.
- Commit a verification fix only when a command in this task fails and the source change is required to satisfy this plan.

**Interfaces:**
- Consumes: completed Task 1 and Task 2.
- Produces: verified `github.io` app, lint, production build, and Storybook build.

- [ ] **Step 1: Run the full test suite for the app**

Run:

```bash
PATH=/tmp/corepack-shims:$PATH corepack pnpm nx test github.io
```

Expected: PASS.

- [ ] **Step 2: Run lint**

Run:

```bash
PATH=/tmp/corepack-shims:$PATH corepack pnpm nx lint github.io
```

Expected: PASS.

- [ ] **Step 3: Run production build**

Run:

```bash
PATH=/tmp/corepack-shims:$PATH corepack pnpm nx build github.io
```

Expected: PASS.

- [ ] **Step 4: Run Storybook build**

Run:

```bash
PATH=/tmp/corepack-shims:$PATH corepack pnpm nx build-storybook github.io
```

Expected: PASS.

- [ ] **Step 5: Check git status**

Run:

```bash
git status --short --branch
```

Expected: clean worktree on `feat/skills-main-page`.
