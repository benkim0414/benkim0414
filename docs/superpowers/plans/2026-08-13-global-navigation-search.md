# Global Navigation Search Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Give Home, Skills, and skill-detail routes one persistent, heading-free Astryx top navigation with skill search that navigates to canonical detail URLs.

**Architecture:** A route-level `GlobalNavigationLayout` owns the Astryx `Layout`, `TopNav`, command palette, and React Router navigation. A domain-neutral command-result contract is populated by a skills adapter today, while routed pages supply only their content-area layout and domain content.

**Tech Stack:** React 19, TypeScript, React Router, Astryx Design, Vitest, Testing Library, Nx, Storybook

## Global Constraints

- Use Astryx components and layout primitives wherever Astryx covers the surface; use MD3 guidance only when Astryx has no applicable guidance.
- The top navigation is visually identical and heading-free on Home, Skills, and valid skill-detail routes.
- Search covers skills only in this change, but the global navigation contract must not depend on the `Skill` type.
- The accessible search action remains `Search skills` while skills are the only result group.
- Selecting a result must navigate with React Router to `/skills/:skillId`; do not retain Home-only local detail state.
- Keep the centered `max-w-md`, full-height presentation and one intentional scroll region per page beneath the persistent navigation.
- Unknown/not-found routes remain outside the global navigation.
- Do not change skill matching behavior, skill-list avatar sizing, detail content, Home carousel content, or breadcrumb destinations.
- Add no dependencies.
- Follow red-green-refactor for each behavior change, stage explicit paths only, and use conventional commit subjects.

---

## File Structure

- Create `apps/github.io/src/app/global-search/global-search.types.ts`: domain-neutral command result and group contract.
- Create `apps/github.io/src/app/global-search/skill-search-results.ts`: adapter from canonical `Skill` records to generic results.
- Create `apps/github.io/src/app/global-search/skill-search-results.spec.ts`: adapter contract and keyword coverage.
- Create `apps/github.io/src/app/global-navigation-layout.tsx`: shared Astryx layout, navigation, palette state, and result routing.
- Create `apps/github.io/src/app/global-navigation-layout.spec.tsx`: isolated global navigation and route-navigation behavior.
- Create `apps/github.io/src/app/global-navigation-layout.stories.tsx`: routed Home, Skills, and detail stories for visual review of the complete global frame.
- Modify `apps/github.io/src/app/app.tsx`: nest the three supported routes under the global layout and leave wildcard outside.
- Modify `apps/github.io/src/app/app.spec.tsx`: assert exactly one identical global nav and working search on every supported surface.
- Delete `apps/github.io/src/app/app-shell.tsx`: remove the obsolete Home-only selected-skill shell.
- Modify `apps/github.io/src/app/skills/home-page.tsx`: remove page-local nav/search state and render Home content only.
- Modify `apps/github.io/src/app/skills/home-page.spec.tsx`: remove local-nav ownership assertions while retaining content/search-data regression coverage at the correct boundary.
- Modify `apps/github.io/src/app/skills/skills-page.tsx`: remove its page shell and top nav; return its routed `LayoutContent` body.
- Modify `apps/github.io/src/app/skills/skills-page.spec.tsx`: assert Skills owns content and one scrolling main, not the global shell.
- Modify `apps/github.io/src/app/skills/skill-detail-page.tsx`: render detail inside route content that scrolls beneath the global nav.
- Modify `apps/github.io/src/app/skills/skill-detail-page.spec.tsx`: protect detail content, breadcrumb, and scroll ownership.
- Create: `apps/github.io/src/app/global-navigation-layout.stories.tsx`

---

### Task 1: Domain-neutral global search results

**Files:**
- Create: `apps/github.io/src/app/global-search/global-search.types.ts`
- Create: `apps/github.io/src/app/global-search/skill-search-results.ts`
- Create: `apps/github.io/src/app/global-search/skill-search-results.spec.ts`

**Interfaces:**
- Consumes: `Skill` from `../skills/skill-list.types` inside the skills adapter only.
- Produces: `GlobalSearchResult`, `GlobalSearchGroup`, and `createSkillSearchResults(skills: readonly Skill[]): GlobalSearchResult[]`.

- [ ] **Step 1: Write the failing adapter tests**

```ts
import { skills } from '../skills/skill-list.data';
import { createSkillSearchResults } from './skill-search-results';

describe('createSkillSearchResults', () => {
  it('creates domain-neutral destinations in the Skills group', () => {
    const [result] = createSkillSearchResults([
      skills.find((skill) => skill.id === 'terraform')!,
    ]);

    expect(result).toMatchObject({
      id: 'skill:terraform',
      label: 'Terraform',
      href: '/skills/terraform',
      group: 'Skills',
    });
    expect(result).not.toHaveProperty('skill');
  });

  it('preserves description, category, and keyword matching data', () => {
    const terraform = skills.find((skill) => skill.id === 'terraform')!;
    const [result] = createSkillSearchResults([terraform]);

    expect(result.keywords).toEqual([
      terraform.description,
      ...terraform.categories,
      ...terraform.keywords,
    ]);
  });
});
```

- [ ] **Step 2: Run the focused test and verify RED**

Run:

```bash
pnpm nx test github.io -- --run src/app/global-search/skill-search-results.spec.ts
```

Expected: FAIL because the global-search modules do not exist.

- [ ] **Step 3: Implement the generic contract and skills adapter**

```ts
// global-search.types.ts
export type GlobalSearchGroup = string;

export interface GlobalSearchResult {
  readonly id: string;
  readonly label: string;
  readonly href: string;
  readonly group: GlobalSearchGroup;
  readonly keywords: readonly string[];
}
```

```ts
// skill-search-results.ts
import type { Skill } from '../skills/skill-list.types';
import type { GlobalSearchResult } from './global-search.types';

export function createSkillSearchResults(
  skills: readonly Skill[],
): GlobalSearchResult[] {
  return skills.map((skill) => ({
    id: `skill:${skill.id}`,
    label: skill.name,
    href: `/skills/${skill.id}`,
    group: 'Skills',
    keywords: [
      skill.description,
      ...skill.categories,
      ...skill.keywords,
    ],
  }));
}
```

- [ ] **Step 4: Run focused tests and verify GREEN**

Run:

```bash
pnpm nx test github.io -- --run src/app/global-search/skill-search-results.spec.ts
```

Expected: PASS with both adapter tests.

- [ ] **Step 5: Review and commit the result model**

Run:

```bash
git diff --check
git diff -- apps/github.io/src/app/global-search
git add apps/github.io/src/app/global-search/global-search.types.ts apps/github.io/src/app/global-search/skill-search-results.ts apps/github.io/src/app/global-search/skill-search-results.spec.ts
git diff --cached
git commit -m "feat(github.io): model global search results"
```

---

### Task 2: Shared Astryx global navigation layout

**Files:**
- Create: `apps/github.io/src/app/global-navigation-layout.tsx`
- Create: `apps/github.io/src/app/global-navigation-layout.spec.tsx`

**Interfaces:**
- Consumes: `GlobalSearchResult`, `createSkillSearchResults`, canonical `skills`, React Router `Outlet` and `useNavigate`.
- Produces: `GlobalNavigationLayout(): ReactElement`, the route-layout element used by `AppRoutes` in Task 3.

- [ ] **Step 1: Write failing layout tests with child routes**

Render `GlobalNavigationLayout` under a `MemoryRouter` with a nested index route and a `/skills/:skillId` target. Mock the Astryx command palette using the established mock shape from `home-page.spec.tsx`, but keep the test assertions at the global-layout boundary.

```tsx
it('renders one heading-free global nav above routed content', () => {
  renderGlobalLayout('/');

  expect(getByRole('navigation', { name: 'Global navigation' })).toBeTruthy();
  expect(getByRole('button', { name: 'Search skills' })).toBeTruthy();
  expect(queryByRole('heading', { name: /skills/i })).toBeNull();
  expect(getByText('Route content')).toBeTruthy();
});

it('opens search and navigates a selected skill result', async () => {
  const user = userEvent.setup();
  renderGlobalLayout('/');

  await user.click(getByRole('button', { name: 'Search skills' }));
  expect(getByRole('dialog', { name: 'Search skills' })).toBeTruthy();

  selectCommandValue('skill:terraform');
  expect(getByTestId('location')).toHaveTextContent('/skills/terraform');
});
```

Also assert the shell uses Astryx `Layout`/`LayoutHeader`, `max-w-md`, `h-dvh`, and a single `TopNav`.

- [ ] **Step 2: Run the layout test and verify RED**

Run:

```bash
pnpm nx test github.io -- --run src/app/global-navigation-layout.spec.tsx
```

Expected: FAIL because `GlobalNavigationLayout` does not exist.

- [ ] **Step 3: Implement the shared layout**

Use the installed Astryx sources as the API reference. Keep the frame domain-neutral after the adapter call.

```tsx
import { useMemo, useState, type ReactElement } from 'react';
import { useNavigate, Outlet } from 'react-router-dom';
import { CommandPalette, CommandPaletteInput } from '@astryxdesign/core/CommandPalette';
import { Icon } from '@astryxdesign/core/Icon';
import { IconButton } from '@astryxdesign/core/IconButton';
import { Layout, LayoutHeader } from '@astryxdesign/core/Layout';
import { TopNav } from '@astryxdesign/core/TopNav';
import { createStaticSource } from '@astryxdesign/core/Typeahead';

import { createSkillSearchResults } from './global-search/skill-search-results';
import { skills } from './skills/skill-list.data';

export function GlobalNavigationLayout(): ReactElement {
  const navigate = useNavigate();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [selectedResultId, setSelectedResultId] = useState<string>();
  const results = useMemo(() => createSkillSearchResults(skills), []);
  const resultById = useMemo(
    () => new Map(results.map((result) => [result.id, result])),
    [results],
  );
  const searchSource = useMemo(
    () => createStaticSource(results, { keywords: (result) => result.keywords }),
    [results],
  );

  return (
    <Layout
      className="mx-auto h-dvh min-h-screen w-full max-w-md overflow-hidden"
      height="fill"
      header={
        <LayoutHeader padding={0}>
          <TopNav
            label="Global navigation"
            endContent={
              <IconButton
                icon={<Icon color="inherit" icon="search" size="sm" />}
                label="Search skills"
                size="sm"
                variant="ghost"
                onClick={() => setIsSearchOpen(true)}
              />
            }
          />
        </LayoutHeader>
      }
      content={
        <>
          <CommandPalette
            isOpen={isSearchOpen}
            input={<CommandPaletteInput aria-label="Search skills" placeholder="Search skills" />}
            label="Search skills"
            maxHeight="min(80vh, 480px)"
            searchSource={searchSource}
            width="min(calc(100vw - 32px), 448px)"
            emptyBootstrapText="No skills"
            emptySearchText="No skills"
            value={selectedResultId}
            onOpenChange={setIsSearchOpen}
            onValueChange={(resultId) => {
              setSelectedResultId(resultId);
              const result = resultById.get(resultId);
              if (result) navigate(result.href);
            }}
          />
          <Outlet />
        </>
      }
    />
  );
}
```

If Astryx `Layout` requires its content slot to be one layout-area component rather than a fragment, keep `CommandPalette` adjacent to `Layout` and use `<Outlet />` as the content slot. Do not substitute a raw page shell.

- [ ] **Step 4: Run focused tests and verify GREEN**

Run:

```bash
pnpm nx test github.io -- --run src/app/global-search/skill-search-results.spec.ts src/app/global-navigation-layout.spec.tsx
```

Expected: PASS; one heading-free nav, palette open behavior, and URL navigation are protected.

- [ ] **Step 5: Review and commit the global frame**

Run:

```bash
git diff --check
git diff -- apps/github.io/src/app/global-navigation-layout.tsx apps/github.io/src/app/global-navigation-layout.spec.tsx
git add apps/github.io/src/app/global-navigation-layout.tsx apps/github.io/src/app/global-navigation-layout.spec.tsx
git diff --cached
git commit -m "feat(github.io): add global search navigation"
```

---

### Task 3: Move route and page ownership under the global frame

**Files:**
- Modify: `apps/github.io/src/app/app.tsx`
- Modify: `apps/github.io/src/app/app.spec.tsx`
- Delete: `apps/github.io/src/app/app-shell.tsx`
- Create: `apps/github.io/src/app/global-navigation-layout.stories.tsx`
- Modify: `apps/github.io/src/app/skills/home-page.tsx`
- Modify: `apps/github.io/src/app/skills/home-page.spec.tsx`
- Modify: `apps/github.io/src/app/skills/skills-page.tsx`
- Modify: `apps/github.io/src/app/skills/skills-page.spec.tsx`
- Modify: `apps/github.io/src/app/skills/skill-detail-page.tsx`
- Modify: `apps/github.io/src/app/skills/skill-detail-page.spec.tsx`

**Interfaces:**
- Consumes: `GlobalNavigationLayout` from Task 2.
- Produces: nested routes where `/`, `/skills`, and `/skills/:skillId` share one global nav; page components that render content without their own top navigation.

- [ ] **Step 1: Write failing route-level ownership tests**

Extend `app.spec.tsx` with a table-driven test for the three supported routes:

```tsx
it.each([
  ['/', 'Home'],
  ['/skills', 'Skills'],
  ['/skills/kubernetes', 'Kubernetes'],
])('renders one identical global nav at %s', (path, pageHeading) => {
  render(
    <MemoryRouter initialEntries={[path]}>
      <AppRoutes />
    </MemoryRouter>,
  );

  expect(getAllByRole('navigation', { name: 'Global navigation' })).toHaveLength(1);
  expect(getAllByRole('button', { name: 'Search skills' })).toHaveLength(1);
  expect(getByRole('heading', { level: 1, name: pageHeading })).toBeTruthy();
});
```

Add an integration case that opens the palette from `/skills/kubernetes`, selects `skill:terraform`, and observes the Terraform detail heading and `/skills/terraform` location. Add a wildcard case proving an unknown route has no global search button.

Adjust page tests before production edits:

- Home must have no page-local `TopNav` or command palette and must retain Top skills, five cards, Show all, DORA content, and one scrolling content area.
- Skills must have no page-local nav and must retain its hidden `h1`, alphabetical links, and `LayoutContent` main.
- Detail must have no page-local nav, must retain breadcrumb/content, and must use one scrollable `LayoutContent` main beneath the frame.

- [ ] **Step 2: Run the affected tests and verify RED**

Run:

```bash
pnpm nx test github.io -- --run src/app/app.spec.tsx src/app/skills/home-page.spec.tsx src/app/skills/skills-page.spec.tsx src/app/skills/skill-detail-page.spec.tsx
```

Expected: FAIL because routes are not nested and pages still own navigation/shell responsibilities.

- [ ] **Step 3: Nest supported routes under the shared layout**

Use one themed parent route and keep wildcard outside it:

```tsx
<Routes>
  <Route
    element={
      <Theme theme={neutralTheme}>
        <GlobalNavigationLayout />
      </Theme>
    }
  >
    <Route path="/" element={<HomePage />} />
    <Route path="/skills" element={<SkillsPage />} />
    <Route path="/skills/:skillId" element={<SkillDetailRoute />} />
  </Route>
  <Route
    path="*"
    element={
      <Theme theme={neutralTheme}>
        <NotFoundPage />
      </Theme>
    }
  />
</Routes>
```

Delete `AppShell`; `AppRoutes` renders `HomePage` directly at `/`. This removes the local `selectedSkill`/`resolveSelectedSkill` state path from production.

- [ ] **Step 4: Make each page own content only**

- Remove Home imports/state for `CommandPalette`, `CommandPaletteInput`, `Icon`, `IconButton`, `TopNav`, `createStaticSource`, `useMemo`, and `useState`; remove `onSkillSelect` from `HomePageProps`.
- Keep the Top skills section fixed within the Home content allocation and its DORA `main` as the intentional scroll region. Use an Astryx `LayoutContent padding={0} isScrollable={false}` or another documented Astryx content-area composition rather than a raw full-page shell.
- Remove Skills `Layout`, `LayoutHeader`, `TopNav`, and `TopNavHeading`; return one `LayoutContent label="Skills" padding={4} role="main"` with the existing hidden `h1` and list.
- Wrap detail content in one `LayoutContent label="Skill detail" padding={0} role="main"`, and change its inner `VStack` from `as="main"` to content-only markup so there is one main landmark and one scroll owner.
- Preserve all existing copy, links, sorting, carousel composition, metadata, and evidence sections.

- [ ] **Step 5: Add routed global-layout stories**

Create `global-navigation-layout.stories.tsx` with three stories that render `AppRoutes` inside a `MemoryRouter`:

```tsx
import type { Meta, StoryObj } from '@storybook/react-vite';
import { MemoryRouter } from 'react-router-dom';

import { AppRoutes } from './app';

function RoutedGlobalNavigation({ path }: { path: string }) {
  return (
    <MemoryRouter initialEntries={[path]}>
      <AppRoutes />
    </MemoryRouter>
  );
}

const meta = {
  component: RoutedGlobalNavigation,
  parameters: { layout: 'fullscreen' },
  title: 'GitHub.io/Navigation/Global Navigation',
} satisfies Meta<typeof RoutedGlobalNavigation>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Home: Story = { args: { path: '/' } };
export const Skills: Story = { args: { path: '/skills' } };
export const SkillDetail: Story = {
  args: { path: '/skills/kubernetes' },
};
```

- [ ] **Step 6: Run focused tests and fix only ownership regressions**

Run:

```bash
pnpm nx test github.io -- --run src/app/global-search/skill-search-results.spec.ts src/app/global-navigation-layout.spec.tsx src/app/app.spec.tsx src/app/skills/home-page.spec.tsx src/app/skills/skills-page.spec.tsx src/app/skills/skill-detail-page.spec.tsx
```

Expected: PASS. Confirm the test count is non-zero for every named file.

- [ ] **Step 7: Run complete verification**

Run:

```bash
pnpm nx lint github.io --skip-nx-cache
pnpm nx test github.io --skip-nx-cache
pnpm nx build github.io --skip-nx-cache
pnpm nx build-storybook github.io --skip-nx-cache
```

Expected: all commands exit 0. Record existing warnings separately from new failures.

- [ ] **Step 8: Perform Tailscale iPad visual QA**

With the existing feature worktree servers stopped or ports verified, run the app on the Tailscale interface:

```bash
pnpm nx dev github.io --host 0.0.0.0 --port 4200
```

Verify on iPad:

- `/` has one heading-free top bar and working search.
- `/skills` has the identical top bar, 36 px skill avatars, and working search.
- `/skills/kubernetes` has the identical top bar, breadcrumb, scrollable detail, and working search.
- Selecting Terraform from each surface lands on `/skills/terraform`.
- The top bar stays visible while page content scrolls.
- No horizontal overflow or nested-scroll trap appears in portrait or landscape.

If browser access is unavailable to the implementer, report that validation gap without claiming a visual pass; leave the server command and URL for the user.

- [ ] **Step 9: Review, stage explicit paths, and commit the route migration**

Run:

```bash
git diff --check
git status --short
git diff -- apps/github.io/src/app/app.tsx apps/github.io/src/app/app.spec.tsx apps/github.io/src/app/app-shell.tsx apps/github.io/src/app/global-navigation-layout.stories.tsx apps/github.io/src/app/skills/home-page.tsx apps/github.io/src/app/skills/home-page.spec.tsx apps/github.io/src/app/skills/skills-page.tsx apps/github.io/src/app/skills/skills-page.spec.tsx apps/github.io/src/app/skills/skill-detail-page.tsx apps/github.io/src/app/skills/skill-detail-page.spec.tsx
```

Stage only paths actually changed, for example:

```bash
git add apps/github.io/src/app/app.tsx apps/github.io/src/app/app.spec.tsx apps/github.io/src/app/app-shell.tsx apps/github.io/src/app/global-navigation-layout.stories.tsx apps/github.io/src/app/skills/home-page.tsx apps/github.io/src/app/skills/home-page.spec.tsx apps/github.io/src/app/skills/skills-page.tsx apps/github.io/src/app/skills/skills-page.spec.tsx apps/github.io/src/app/skills/skill-detail-page.tsx apps/github.io/src/app/skills/skill-detail-page.spec.tsx
git diff --cached
git commit -m "refactor(github.io): make search navigation global"
```

Stage the deleted `app-shell.tsx` path explicitly with `git add apps/github.io/src/app/app-shell.tsx`.

---

## Final Review Checklist

- [ ] The global frame imports no `Skill` type and consumes only generic results after the adapter boundary.
- [ ] Home, Skills, and valid detail routes each render exactly one identical, heading-free Astryx top nav.
- [ ] Search is available and navigates correctly from all three surfaces.
- [ ] Unknown routes remain outside the global frame.
- [ ] No page-local nav, palette, or selected-skill state remains.
- [ ] Each page has one main landmark and one intentional scroll owner.
- [ ] Skill-list avatars remain Astryx `small` (36×36 px).
- [ ] Full test, lint, application build, and Storybook build evidence is fresh.
- [ ] Visual QA is either completed on iPad over Tailscale or explicitly reported as pending.
