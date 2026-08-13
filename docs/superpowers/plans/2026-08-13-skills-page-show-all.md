# Skills Page And Show All Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add an alphabetical, route-native Skills page and a right-aligned Astryx `Show all` link below the Home skills carousel.

**Architecture:** Extend the existing Astryx `SkillList` with optional route URLs, then compose it inside a new mobile-width `SkillsPage` at `/skills`. Keep Home's highlighted carousel and command palette unchanged; add only the MD3 fallback placement using an Astryx link button, and make skill-detail breadcrumbs return to the new collection route.

**Tech Stack:** React 19, TypeScript, React Router, Astryx Core 0.1.4, Astryx neutral theme 0.1.4, StyleX/Tailwind utilities backed by Astryx tokens, Vitest, Testing Library, Storybook 10, Nx, pnpm.

## Global Constraints

- Source design: `docs/superpowers/specs/2026-08-13-skills-page-show-all-design.md`.
- Work only in the existing linked worktree on branch `feat/skills-page-show-all`.
- Use Astryx components and supported props before local visual primitives or styles.
- Inspect each installed Astryx component contract before modifying its use; the CLI documents principles rather than component-specific topics in Astryx 0.1.4.
- Render Home's action with Astryx `Button` using `href="/skills"`, `label="Show all"`, `size="sm"`, and `variant="ghost"`.
- Put the action in an Astryx `HStack` with `hAlign="end"` and `paddingInline={4}` immediately after `SkillCarousel`, outside its horizontal scroll container.
- Keep Home's five `highlightedSkills`, carousel configuration, DORA content, search palette, and in-memory search-selection behavior unchanged.
- Add `/skills` as a route-native page and keep `/skills/:skillId` as the canonical detail route.
- Sort a copied skills array with `localeCompare`; never mutate the exported readonly catalog.
- Preserve the centered `max-w-md`, `h-dvh`, mobile-first frame at every viewport size.
- Use a visually hidden `h1` to label the Skills page `main` without duplicating the visible `TopNavHeading` title.
- Do not add search, filtering, category grouping, a card grid, asynchronous states, skill-data edits, a carousel redesign, or a desktop-specific layout.
- Stage explicit paths only. Never use `git add .`, `git add -A`, `git add --all`, `git add -u`, `git commit -a`, or `git commit -am`.
- Use the conventional commit subjects specified in each task.

---

## File Structure

### Create

- `apps/github.io/src/app/skills/skills-page.tsx` — owns the all-skills mobile page shell, alphabetical projection, and row URL resolver.
- `apps/github.io/src/app/skills/skills-page.spec.tsx` — verifies page shell semantics, alphabetical links, and empty state.
- `apps/github.io/src/app/skills/skills-page.stories.tsx` — provides fullscreen default and empty visual states.
- `apps/github.io/src/app/skills/skills-page.stories.spec.ts` — locks the Storybook hierarchy and empty fixture.

### Modify

- `apps/github.io/src/app/skills/skill-list.types.ts` — adds the optional skill URL resolver to `SkillListProps`.
- `apps/github.io/src/app/skills/skill-list.tsx` — resolves and forwards a URL for each row.
- `apps/github.io/src/app/skills/skill-list-item.tsx` — forwards an optional URL to Astryx `ListItem`.
- `apps/github.io/src/app/skills/skill-list.spec.tsx` — verifies resolver-driven row links while preserving static behavior.
- `apps/github.io/src/app/skills/skill-list-item.spec.tsx` — verifies linked and unlinked Astryx row semantics.
- `apps/github.io/src/app/app.tsx` — registers the themed `/skills` route.
- `apps/github.io/src/app/app.spec.tsx` — verifies the route renders the complete alphabetical linked catalog.
- `apps/github.io/src/app/skills/skill-detail-page.tsx` — changes the collection breadcrumb destination to `/skills`.
- `apps/github.io/src/app/skills/skill-detail-page.spec.tsx` — verifies the updated breadcrumb URL.
- `apps/github.io/src/app/skills/home-page.tsx` — adds the Astryx action row below `SkillCarousel`.
- `apps/github.io/src/app/skills/home-page.spec.tsx` — verifies action placement, Astryx props, URL, and unchanged carousel contents.

Existing `home-page.stories.tsx` requires no source edit: its Default,
SingleSearchSkill, and Empty stories render `HomePage`, so all three inherit the
new action automatically. Use those stories during Task 4 visual QA.

---

### Task 1: Support Optional Route URLs In Skill Rows

**Files:**

- Modify: `apps/github.io/src/app/skills/skill-list.types.ts:36-42`
- Modify: `apps/github.io/src/app/skills/skill-list.tsx:7-22`
- Modify: `apps/github.io/src/app/skills/skill-list-item.tsx:9-45`
- Test: `apps/github.io/src/app/skills/skill-list.spec.tsx`
- Test: `apps/github.io/src/app/skills/skill-list-item.spec.tsx`

**Interfaces:**

- Consumes: Astryx `ListItem`'s installed `href?: string` API and the existing `Skill` model.
- Produces: `SkillListProps.getSkillHref?: (skill: Skill) => string | undefined` and `SkillListItemProps.href?: string`.
- Preserves: Existing unlinked rendering when `getSkillHref` and `href` are omitted.

- [ ] **Step 1: Reconfirm the installed Astryx row contract**

Run:

```bash
sed -n '40,230p' node_modules/@astryxdesign/core/src/List/ListItem.tsx
```

Expected: `ListItemProps` includes `href`, and the component example documents link rendering when `href` is supplied.

- [ ] **Step 2: Write failing resolver and row-link tests**

Append this test to `skill-list.spec.tsx`:

```tsx
it('resolves a semantic link for each skill when requested', () => {
  const typeScript = sampleSkills.find((skill) => skill.id === 'typescript');

  expect(typeScript).toBeTruthy();

  const { getByRole } = render(
    <SkillList
      getSkillHref={(skill) => `/skills/${skill.id}`}
      skills={[typeScript!]}
    />,
  );
  const link = getByRole('link', { name: /TypeScript/ });

  expect(link.getAttribute('href')).toBe('/skills/typescript');
});
```

Append these tests to `skill-list-item.spec.tsx`:

```tsx
it('uses the Astryx row link contract when href is supplied', () => {
  const typeScript = sampleSkills.find((skill) => skill.id === 'typescript');

  expect(typeScript).toBeTruthy();

  const { getByRole } = render(
    <SkillListItem href="/skills/typescript" skill={typeScript!} />,
  );

  expect(
    getByRole('link', { name: /TypeScript/ }).getAttribute('href'),
  ).toBe('/skills/typescript');
});

it('remains a static Astryx row when href is omitted', () => {
  const typeScript = sampleSkills.find((skill) => skill.id === 'typescript');

  expect(typeScript).toBeTruthy();

  const { queryByRole } = render(<SkillListItem skill={typeScript!} />);

  expect(queryByRole('link')).toBeNull();
});
```

- [ ] **Step 3: Run the focused tests and verify the new API fails**

Run:

```bash
pnpm nx test github.io -- --run src/app/skills/skill-list.spec.tsx src/app/skills/skill-list-item.spec.tsx
```

Expected: FAIL because `getSkillHref` and `href` are not yet accepted or forwarded.

- [ ] **Step 4: Add the optional resolver and href plumbing**

Change `SkillListProps` in `skill-list.types.ts` to:

```ts
export interface SkillListProps {
  skills: readonly Skill[];
  heading?: string;
  emptyMessage?: string;
  isHeadingHidden?: boolean;
  variant?: SkillSurfaceVariant;
  getSkillHref?: (skill: Skill) => string | undefined;
}
```

Destructure and forward the resolver in `skill-list.tsx`:

```tsx
export function SkillList({
  skills,
  heading = 'Skills',
  emptyMessage = 'No skills have been supplied.',
  variant = 'default',
  getSkillHref,
}: SkillListProps) {
  return (
    <section aria-label={heading}>
      {skills.length === 0 ? (
        <EmptyState headingLevel={3} isCompact title={emptyMessage} />
      ) : (
        <List className="w-full" density="compact" hasDividers>
          {skills.map((skill) => (
            <SkillListItem
              href={getSkillHref?.(skill)}
              key={skill.id}
              skill={skill}
              variant={variant}
            />
          ))}
        </List>
      )}
    </section>
  );
}
```

Extend and use `SkillListItemProps` in `skill-list-item.tsx`:

```tsx
interface SkillListItemProps {
  skill: Skill;
  variant?: SkillSurfaceVariant;
  href?: string;
}

export function SkillListItem({
  skill,
  variant = 'default',
  href,
}: SkillListItemProps) {
  const shouldShowCategories = variant === 'default';

  return (
    <ListItem
      endContent={
        <HStack gap={2} vAlign="center">
          {shouldShowCategories
            ? skill.categories.map((category) => (
                <SkillCategory key={category} name={category} />
              ))
            : null}
          <SkillRating level={skill.level} />
        </HStack>
      }
      href={href}
      label={skill.name}
      startContent={<SkillAvatar skill={skill} size="small" />}
    />
  );
}
```

Preserve all current avatar, category, and rating behavior; `href={href}` is the
only rendered-prop addition.

- [ ] **Step 5: Run focused tests and verify they pass**

Run:

```bash
pnpm nx test github.io -- --run src/app/skills/skill-list.spec.tsx src/app/skills/skill-list-item.spec.tsx
```

Expected: PASS for both files, including existing static and empty-state coverage.

- [ ] **Step 6: Inspect and commit the linked-row slice**

Run:

```bash
git diff -- apps/github.io/src/app/skills/skill-list.types.ts apps/github.io/src/app/skills/skill-list.tsx apps/github.io/src/app/skills/skill-list-item.tsx apps/github.io/src/app/skills/skill-list.spec.tsx apps/github.io/src/app/skills/skill-list-item.spec.tsx
git add apps/github.io/src/app/skills/skill-list.types.ts apps/github.io/src/app/skills/skill-list.tsx apps/github.io/src/app/skills/skill-list-item.tsx apps/github.io/src/app/skills/skill-list.spec.tsx apps/github.io/src/app/skills/skill-list-item.spec.tsx
git diff --cached
git commit -m "feat(github.io): support linked skill rows"
```

Expected: One commit containing only the optional resolver, `href` forwarding, and focused tests.

---

### Task 2: Build The Astryx SkillsPage

**Files:**

- Create: `apps/github.io/src/app/skills/skills-page.tsx`
- Create: `apps/github.io/src/app/skills/skills-page.spec.tsx`
- Create: `apps/github.io/src/app/skills/skills-page.stories.tsx`
- Create: `apps/github.io/src/app/skills/skills-page.stories.spec.ts`

**Interfaces:**

- Consumes: `SkillListProps.getSkillHref` from Task 1, canonical `skills`, Astryx `TopNav`, `TopNavHeading`, `VStack`, and `VisuallyHidden`.
- Produces: `SkillsPageProps { skills?: readonly Skill[] }` and `SkillsPage`.
- Page URL resolver: `(skill) => `/skills/${skill.id}``.

- [ ] **Step 1: Reconfirm Astryx page-shell guidance and contracts**

Run:

```bash
pnpm exec astryx docs layout
pnpm exec astryx docs typography
sed -n '110,205p' node_modules/@astryxdesign/core/src/TopNav/TopNav.tsx
sed -n '110,230p' node_modules/@astryxdesign/core/src/TopNav/TopNavHeading.tsx
```

Expected: Astryx guidance supports a frame-first mobile shell; `TopNav` accepts `heading` and `label`, and `TopNavHeading` accepts `heading="Skills"`.

- [ ] **Step 2: Write failing SkillsPage behavior tests**

Create `skills-page.spec.tsx`:

```tsx
import { render, within } from '@testing-library/react';
import { Theme } from '@astryxdesign/core';
import { neutralTheme } from '@astryxdesign/theme-neutral/built';

import { skills } from './skill-list.data';
import type { Skill } from './skill-list.types';
import { SkillsPage } from './skills-page';

const renderSkillsPage = (suppliedSkills?: readonly Skill[]) =>
  render(
    <Theme theme={neutralTheme}>
      <SkillsPage skills={suppliedSkills} />
    </Theme>,
  );

describe('SkillsPage', () => {
  it('owns a centered mobile shell with one scrollable labelled main', () => {
    const { getByRole } = renderSkillsPage();
    const main = getByRole('main', { name: 'Skills' });
    const navigation = getByRole('navigation', { name: 'Skills navigation' });
    const shell = main.parentElement;

    expect(getByRole('heading', { level: 1, name: 'Skills' })).toBeTruthy();
    expect(shell).toBe(navigation.parentElement);
    expect(shell?.className).toContain('max-w-md');
    expect(shell?.className).toContain('h-dvh');
    expect(shell?.className).toContain('overflow-hidden');
    expect(navigation.className).toContain('shrink-0');
    expect(main.className).toContain('min-h-0');
    expect(main.className).toContain('flex-1');
    expect(main.className).toContain('astryx-stack');
  });

  it('sorts a copy of supplied skills and links every row to its detail route', () => {
    const suppliedSkills = ['typescript', 'argo', 'docker'].map((id) => {
      const skill = skills.find((candidate) => candidate.id === id);

      if (!skill) {
        throw new Error(`Expected ${id} in the canonical skill catalog.`);
      }

      return skill;
    });
    const originalOrder = suppliedSkills.map((skill) => skill.id);
    const { getByRole } = renderSkillsPage(suppliedSkills);
    const main = getByRole('main', { name: 'Skills' });
    const links = within(main).getAllByRole('link');

    expect(links.map((link) => link.getAttribute('href'))).toEqual([
      '/skills/argo',
      '/skills/docker',
      '/skills/typescript',
    ]);
    expect(suppliedSkills.map((skill) => skill.id)).toEqual(originalOrder);
  });

  it('uses the existing Astryx empty state for an empty catalog', () => {
    const { getByRole, getByText } = renderSkillsPage([]);

    expect(getByRole('status')).toBeTruthy();
    expect(getByText('No skills have been supplied.')).toBeTruthy();
  });
});
```

- [ ] **Step 3: Run the page test and verify it fails because the page is absent**

Run:

```bash
pnpm nx test github.io -- --run src/app/skills/skills-page.spec.tsx
```

Expected: FAIL because `./skills-page` does not exist.

- [ ] **Step 4: Implement the minimal Astryx SkillsPage**

Create `skills-page.tsx`:

```tsx
import { VStack } from '@astryxdesign/core/Layout';
import { TopNav, TopNavHeading } from '@astryxdesign/core/TopNav';
import { VisuallyHidden } from '@astryxdesign/core/VisuallyHidden';
import type { ReactElement } from 'react';

import { SkillList } from './skill-list';
import { skills as defaultSkills } from './skill-list.data';
import type { Skill } from './skill-list.types';

export interface SkillsPageProps {
  skills?: readonly Skill[];
}

const getSkillHref = (skill: Skill) => `/skills/${skill.id}`;

export function SkillsPage({
  skills = defaultSkills,
}: SkillsPageProps): ReactElement {
  const sortedSkills = [...skills].sort((left, right) =>
    left.name.localeCompare(right.name),
  );

  return (
    <div className="mx-auto flex h-dvh min-h-screen w-full max-w-md flex-col overflow-hidden">
      <TopNav
        className="shrink-0 bg-[var(--color-background-surface)]"
        heading={<TopNavHeading heading="Skills" />}
        label="Skills navigation"
      />
      <VisuallyHidden as="h1" id="skills-page-title">
        Skills
      </VisuallyHidden>
      <VStack
        aria-labelledby="skills-page-title"
        as="main"
        className="min-h-0 flex-1"
        gap={3}
        isScrollable
        paddingBlock={4}
        paddingInline={4}
      >
        <SkillList
          getSkillHref={getSkillHref}
          heading="All skills"
          skills={sortedSkills}
        />
      </VStack>
    </div>
  );
}
```

Do not add page-local colors, typography, breakpoints, or a second visible heading.

- [ ] **Step 5: Run the page tests and verify they pass**

Run:

```bash
pnpm nx test github.io -- --run src/app/skills/skills-page.spec.tsx
```

Expected: PASS for shell ownership, alphabetical URLs, non-mutation, and empty state.

- [ ] **Step 6: Add default and empty fullscreen stories**

Create `skills-page.stories.tsx`:

```tsx
import type { Meta, StoryObj } from '@storybook/react-vite';

import { SkillsPage } from './skills-page';

const meta: Meta<typeof SkillsPage> = {
  component: SkillsPage,
  parameters: {
    layout: 'fullscreen',
  },
  title: 'GitHub.io/Skills/Skills Page',
};

export default meta;
type Story = StoryObj<typeof SkillsPage>;

export const Default: Story = {};

export const Empty: Story = {
  args: {
    skills: [],
  },
};
```

Create `skills-page.stories.spec.ts`:

```ts
import meta, { Empty } from './skills-page.stories';

describe('SkillsPage stories', () => {
  it('publishes the page and empty state in the Skills hierarchy', () => {
    expect(meta.title).toBe('GitHub.io/Skills/Skills Page');
    expect(Empty.args).toEqual({ skills: [] });
  });
});
```

- [ ] **Step 7: Run all new page and story tests**

Run:

```bash
pnpm nx test github.io -- --run src/app/skills/skills-page.spec.tsx src/app/skills/skills-page.stories.spec.ts
```

Expected: PASS for both files.

- [ ] **Step 8: Inspect and commit the SkillsPage slice**

Run:

```bash
git diff -- apps/github.io/src/app/skills/skills-page.tsx apps/github.io/src/app/skills/skills-page.spec.tsx apps/github.io/src/app/skills/skills-page.stories.tsx apps/github.io/src/app/skills/skills-page.stories.spec.ts
git add apps/github.io/src/app/skills/skills-page.tsx apps/github.io/src/app/skills/skills-page.spec.tsx apps/github.io/src/app/skills/skills-page.stories.tsx apps/github.io/src/app/skills/skills-page.stories.spec.ts
git diff --cached
git commit -m "feat(github.io): add skills page"
```

Expected: One commit containing only the page, its tests, and its stories.

---

### Task 3: Register The Collection Route And Correct Breadcrumbs

**Files:**

- Modify: `apps/github.io/src/app/app.tsx:6-29`
- Modify: `apps/github.io/src/app/app.spec.tsx:122-164`
- Modify: `apps/github.io/src/app/skills/skill-detail-page.tsx:70-73`
- Modify: `apps/github.io/src/app/skills/skill-detail-page.spec.tsx`

**Interfaces:**

- Consumes: `SkillsPage` from Task 2 and existing `AppRoutes`/`SkillDetailRoute`.
- Produces: `/skills` → themed `SkillsPage`; `/skills/:skillId` remains unchanged.
- Breadcrumb contract: `Skills` → `/skills`; current skill remains the non-link current item.

- [ ] **Step 1: Write a failing `/skills` integration test**

Add this test inside `describe('AppRoutes')` in `app.spec.tsx`. Extend the existing Testing Library import with `within` only if it is no longer already imported.

```tsx
it('renders the complete alphabetical linked catalog at /skills', () => {
  const { getByRole } = render(
    <MemoryRouter initialEntries={['/skills']}>
      <AppRoutes />
    </MemoryRouter>,
  );
  const main = getByRole('main', { name: 'Skills' });
  const links = within(main).getAllByRole('link');
  const expectedSkills = [...skills].sort((left, right) =>
    left.name.localeCompare(right.name),
  );

  expect(links).toHaveLength(skills.length);
  expect(links.map((link) => link.getAttribute('href'))).toEqual(
    expectedSkills.map((skill) => `/skills/${skill.id}`),
  );
  expectedSkills.forEach((skill) => {
    expect(within(main).getAllByText(skill.name)).toHaveLength(1);
  });
});
```

Add this import near the other app fixtures:

```ts
import { skills } from './skills/skill-list.data';
```

- [ ] **Step 2: Write a failing detail breadcrumb test**

Add this test to `skill-detail-page.spec.tsx`:

```tsx
it('returns to the dedicated skills collection', () => {
  const { getByRole } = render(
    <SkillDetailPage detail={getResolvedDetail('kubernetes')} />,
  );
  const skillsLink = getByRole('link', { name: 'Skills' });

  expect(skillsLink.getAttribute('href')).toBe('/skills');
});
```

- [ ] **Step 3: Run the focused route tests and verify both failures**

Run:

```bash
pnpm nx test github.io -- --run src/app/app.spec.tsx src/app/skills/skill-detail-page.spec.tsx
```

Expected: FAIL because `/skills` currently falls through to `NotFoundPage` and the breadcrumb still points to `/`.

- [ ] **Step 4: Register the themed `/skills` route**

Import the page in `app.tsx`:

```ts
import { SkillsPage } from './skills/skills-page';
```

Insert this route immediately after `/` and before `/skills/:skillId`:

```tsx
<Route
  path="/skills"
  element={
    <Theme theme={neutralTheme}>
      <SkillsPage />
    </Theme>
  }
/>
```

Do not move the neutral theme into a new global wrapper; keep the existing route boundary pattern.

- [ ] **Step 5: Point the collection breadcrumb at `/skills`**

Change only the first breadcrumb item in `skill-detail-page.tsx`:

```tsx
<Breadcrumbs label="Skill breadcrumb">
  <BreadcrumbItem href="/skills">Skills</BreadcrumbItem>
  <BreadcrumbItem isCurrent>{detail.skill.name}</BreadcrumbItem>
</Breadcrumbs>
```

- [ ] **Step 6: Run focused route and breadcrumb tests**

Run:

```bash
pnpm nx test github.io -- --run src/app/app.spec.tsx src/app/skills/skill-detail-page.spec.tsx
```

Expected: PASS for the new collection route, existing known/unknown detail routes, and updated breadcrumb URL.

- [ ] **Step 7: Inspect and commit the routing slice**

Run:

```bash
git diff -- apps/github.io/src/app/app.tsx apps/github.io/src/app/app.spec.tsx apps/github.io/src/app/skills/skill-detail-page.tsx apps/github.io/src/app/skills/skill-detail-page.spec.tsx
git add apps/github.io/src/app/app.tsx apps/github.io/src/app/app.spec.tsx apps/github.io/src/app/skills/skill-detail-page.tsx apps/github.io/src/app/skills/skill-detail-page.spec.tsx
git diff --cached
git commit -m "feat(github.io): route skills collection"
```

Expected: One commit containing only route registration, breadcrumb correction, and their tests.

---

### Task 4: Add The Home Show All Action And Verify The Feature

**Files:**

- Modify: `apps/github.io/src/app/skills/home-page.tsx:7-14,122-140`
- Modify: `apps/github.io/src/app/skills/home-page.spec.tsx:1-13,166-207`
- Modify: `apps/github.io/src/app/app.spec.tsx:51-89`
- Verify story: `apps/github.io/src/app/skills/home-page.stories.tsx`
- Verify story: `apps/github.io/src/app/skills/skills-page.stories.tsx`

**Interfaces:**

- Consumes: `/skills` from Task 3; Astryx `Button`, `HStack`, and existing `SkillCarousel`.
- Produces: A semantic `Show all` link below the carousel with the exact props in Global Constraints.
- Preserves: Exactly five default highlighted cards and unchanged carousel behavior.

- [ ] **Step 1: Reconfirm the installed Astryx action and alignment contracts**

Run:

```bash
pnpm exec astryx docs layout
sed -n '268,390p' node_modules/@astryxdesign/core/src/Button/Button.tsx
sed -n '1,115p' node_modules/@astryxdesign/core/src/HStack/HStack.tsx
```

Expected: `Button` supports `href`, `size="sm"`, and `variant="ghost"`; `HStack` supports `hAlign="end"` and inherited `paddingInline`.

- [ ] **Step 2: Write a failing placement and component-contract test**

Change the test import from:

```ts
import { VStack } from '@astryxdesign/core/Layout';
```

to:

```ts
import { HStack, VStack } from '@astryxdesign/core/Layout';
```

Add this test to `home-page.spec.tsx` after the existing fixed-carousel test:

```tsx
it('places an Astryx Show all link below and right-aligned to the carousel', () => {
  const { getByLabelText, getByRole } = renderHomePage();
  const carousel = getByLabelText('Highlighted skills');
  const main = getByRole('main', { name: 'Home' });
  const showAll = getByRole('link', { name: 'Show all' });
  const actionRow = showAll.parentElement;
  const { getByTestId } = render(
    <Theme theme={neutralTheme}>
      <HStack
        data-testid="show-all-row-control"
        hAlign="end"
        paddingInline={4}
      >
        <span>Control</span>
      </HStack>
    </Theme>,
  );

  expect(showAll.className).toContain('astryx-button');
  expect(showAll.getAttribute('href')).toBe('/skills');
  expect(showAll.getAttribute('data-size')).toBe('sm');
  expect(showAll.getAttribute('data-variant')).toBe('ghost');
  expect(carousel.nextElementSibling).toBe(actionRow);
  expect(actionRow?.className).toBe(
    getByTestId('show-all-row-control').className,
  );
  expect(actionRow?.parentElement?.nextElementSibling).toBe(main);
  expect(carousel.contains(showAll)).toBe(false);
});
```

- [ ] **Step 3: Strengthen the app-level Home assertion**

In the existing `renders the home page with a scroll-persistent search nav` test in `app.spec.tsx`, add:

```tsx
const showAll = getByRole('link', { name: 'Show all' });

expect(showAll.getAttribute('href')).toBe('/skills');
expect(getAllByTestId('skill-card')).toHaveLength(5);
```

Keep the existing five-card assertion only once; replace it rather than duplicating it if necessary.

- [ ] **Step 4: Run focused Home tests and verify they fail**

Run:

```bash
pnpm nx test github.io -- --run src/app/skills/home-page.spec.tsx src/app/app.spec.tsx
```

Expected: FAIL because `Show all` is not rendered yet.

- [ ] **Step 5: Add the exact Astryx action row after the carousel**

Change the Home layout import to include `HStack`:

```ts
import { HStack, VStack } from '@astryxdesign/core/Layout';
```

Insert this block immediately after `SkillCarousel` and before the closing tag of the fixed Top skills `VStack`:

```tsx
<HStack hAlign="end" paddingInline={4}>
  <Button
    href="/skills"
    label="Show all"
    size="sm"
    variant="ghost"
  />
</HStack>
```

Do not put the action inside `SkillCarousel`, beside the `Top skills` heading, or inside the scrollable DORA `main`.

- [ ] **Step 6: Run all feature-focused tests**

Run:

```bash
pnpm nx test github.io -- --run src/app/skills/skill-list.spec.tsx src/app/skills/skill-list-item.spec.tsx src/app/skills/skills-page.spec.tsx src/app/skills/skills-page.stories.spec.ts src/app/skills/home-page.spec.tsx src/app/skills/skill-detail-page.spec.tsx src/app/app.spec.tsx
```

Expected: PASS for every listed file.

- [ ] **Step 7: Run the complete automated project checks without relying on stale Nx results**

Run:

```bash
pnpm nx lint github.io --skip-nx-cache
pnpm nx test github.io --skip-nx-cache
pnpm nx build github.io --skip-nx-cache
pnpm nx build-storybook github.io --skip-nx-cache
```

Expected: All four commands exit 0. Record any pre-existing non-fatal warnings separately; do not describe a command as passing if it exits non-zero.

- [ ] **Step 8: Perform Storybook visual and interaction QA**

Start Storybook:

```bash
pnpm nx storybook github.io --host 0.0.0.0
```

Review these stories at `390 × 844` and `1280 × 800`:

```text
GitHub.io/Home/Home Page — Default
GitHub.io/Home/Home Page — Empty
GitHub.io/Skills/Skills Page — Default
GitHub.io/Skills/Skills Page — Empty
```

Verify each item explicitly:

- Home keeps five default cards and its existing horizontal carousel.
- `Show all` is below the carousel, right-aligned, outside horizontal scrolling, and visibly focusable by keyboard.
- The Empty Home story still renders `Show all`, because the destination represents the complete canonical collection rather than the supplied highlighted subset.
- SkillsPage remains a centered mobile-width frame at both viewport sizes.
- TopNav remains fixed while the list is the sole vertical scroll region.
- The default list is alphabetical and rows do not clip avatars, names, categories, or ratings.
- Skill row links and `Show all` expose the expected browser status-bar URLs.
- The SkillsPage empty state is readable and does not collapse the shell.

Stop the Storybook process after recording the result.

- [ ] **Step 9: Inspect and commit the Home action slice**

Run:

```bash
git diff -- apps/github.io/src/app/skills/home-page.tsx apps/github.io/src/app/skills/home-page.spec.tsx apps/github.io/src/app/app.spec.tsx
git add apps/github.io/src/app/skills/home-page.tsx apps/github.io/src/app/skills/home-page.spec.tsx apps/github.io/src/app/app.spec.tsx
git diff --cached
git commit -m "feat(github.io): link carousel to skills page"
```

Expected: One commit containing only the Home action, its layout assertions, and the app-level Home assertion.

- [ ] **Step 10: Verify the committed branch is clean and contains the intended commits**

Run:

```bash
git status --short --branch
git log --oneline --decorate -6
```

Expected: No uncommitted files and these four implementation commits above the two documentation commits:

```text
feat(github.io): link carousel to skills page
feat(github.io): route skills collection
feat(github.io): add skills page
feat(github.io): support linked skill rows
docs(github.io): plan skills page navigation
docs(github.io): design skills page navigation
```

## Completion Criteria

- `/skills` renders every canonical skill once, in `localeCompare` alphabetical order.
- Every SkillsPage row is a semantic Astryx `ListItem` link to `/skills/:skillId`.
- Skill details continue to resolve and the `Skills` breadcrumb links to `/skills`.
- Home renders an Astryx ghost/small `Show all` link immediately below and right-aligned to the carousel.
- Home still renders the same five highlighted cards and unchanged search/DORA behavior.
- Default and empty SkillsPage stories exist; Home stories visibly include the action.
- Focused tests, full lint/test/build/build-storybook checks, and both-viewport visual QA pass.
- The branch is clean with four scoped implementation commits after the two documentation commits.
