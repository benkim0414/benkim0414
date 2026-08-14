# DevOps Roadmap Page Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a public `/roadmap` route that presents the existing DevOps roadmap beneath a professional, attributed Astryx banner.

**Architecture:** Create a route-level `RoadmapPage` that composes Astryx page primitives with the existing zero-prop `DevOpsRoadmap`. Register that page in the existing React Router route table and add an isolated fullscreen Storybook story; do not alter navigation, roadmap data, or roadmap behavior.

**Tech Stack:** React 19, TypeScript, React Router 7, Astryx 0.1.4, StyleX-backed Astryx layout, React Flow, Vitest, Testing Library, Storybook 10, Nx 23, pnpm.

**Spec:** `docs/superpowers/specs/2026-08-14-devops-roadmap-page-design.md`

## Global Constraints

- Implement in the existing linked worktree on `feat/roadmap-page`.
- Use an Astryx component when one is available.
- Preserve the Astryx component's default style and anatomy as the first priority.
- Follow Astryx guidance and semantic tokens where additional composition guidance is required.
- Use Material Design 3 guidance only when Astryx provides neither a component nor applicable guidance; do not add a Material Design dependency.
- Render the approved banner title and description exactly as specified below.
- Use `Button` with `variant="secondary"`, `target="_blank"`, and `rel="noopener noreferrer"` for the roadmap.sh action.
- Compose `DevOpsRoadmap` with no props so its existing local data remains authoritative.
- Do not change navbar or top-nav code, roadmap topics, skills, certifications, graph behavior, or graph styling.
- Use normal document scrolling; do not set `isScrollable` on the page-level `VStack`.
- Stage explicit paths only and commit each task separately with a conventional commit subject.

## File Structure

- Create `apps/github.io/src/app/devops-roadmap/roadmap-page.tsx` for route-level heading, banner, external action, and composition of `DevOpsRoadmap`.
- Create `apps/github.io/src/app/devops-roadmap/roadmap-page.spec.tsx` for page semantics, approved copy, external-link safety, responsive container intent, and zero-prop roadmap composition.
- Modify `apps/github.io/src/app/app.tsx` only to import `RoadmapPage` and register `/roadmap`.
- Modify `apps/github.io/src/app/app.spec.tsx` only to add route coverage for `/roadmap`.
- Create `apps/github.io/src/app/devops-roadmap/roadmap-page.stories.tsx` for the fullscreen page story.
- Create `apps/github.io/src/app/devops-roadmap/roadmap-page.stories.spec.ts` for the stable Storybook hierarchy assertion.

---

### Task 1: Build the Astryx Roadmap Page

**Files:**

- Create: `apps/github.io/src/app/devops-roadmap/roadmap-page.spec.tsx`
- Create: `apps/github.io/src/app/devops-roadmap/roadmap-page.tsx`

**Interfaces:**

- Consumes: `DevOpsRoadmap(props?: DevOpsRoadmapProps)` from `apps/github.io/src/app/devops-roadmap/devops-roadmap.tsx`; the page must invoke it as `<DevOpsRoadmap />`.
- Produces: `RoadmapPage(): ReactElement`, a route-ready page with a single `main` landmark, visible `h1`, informational banner, safe external link, and default roadmap composition.

- [ ] **Step 1: Reconfirm the installed Astryx contracts before the UI change**

Run:

```bash
pnpm exec astryx docs principles --dense
pnpm exec astryx docs layout --dense
pnpm exec astryx component Heading --dense
pnpm exec astryx component VStack --dense
pnpm exec astryx component Banner --dense
pnpm exec astryx component Button --dense
```

Expected: every command exits successfully. Confirm these supported contracts before continuing:

- `Heading` requires `level` and `children`.
- `VStack` supports `as`, `gap`, `width`, `maxWidth`, `minHeight`, `paddingBlock`, and `paddingInline`.
- `Banner` supports `status`, `title`, `description`, and `endContent`.
- `Button` supports `href`, `label`, `variant`, `target`, and `rel`.

- [ ] **Step 2: Write the failing page tests**

Create `apps/github.io/src/app/devops-roadmap/roadmap-page.spec.tsx`:

```tsx
import { Theme } from '@astryxdesign/core';
import { LinkProvider } from '@astryxdesign/core/Link';
import { neutralTheme } from '@astryxdesign/theme-neutral/built';
import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { vi } from 'vitest';

import { RouterLink } from '../router-link';
import { RoadmapPage } from './roadmap-page';

const { devOpsRoadmapSpy } = vi.hoisted(() => ({
  devOpsRoadmapSpy: vi.fn(),
}));

vi.mock('./devops-roadmap', () => ({
  DevOpsRoadmap: (props: Record<string, unknown>) => {
    devOpsRoadmapSpy(props);

    return <div aria-label="DevOps roadmap diagram" role="group" />;
  },
}));

function renderRoadmapPage() {
  return render(
    <MemoryRouter>
      <LinkProvider component={RouterLink}>
        <Theme theme={neutralTheme}>
          <RoadmapPage />
        </Theme>
      </LinkProvider>
    </MemoryRouter>,
  );
}

describe('RoadmapPage', () => {
  it('renders the approved roadmap introduction and external source action', () => {
    const { getByRole, getByText } = renderRoadmapPage();
    const main = getByRole('main');
    const learnMore = getByRole('link', { name: 'Learn more' });

    expect(main.className).toContain('mx-auto');
    expect(
      getByRole('heading', { level: 1, name: 'DevOps roadmap' }),
    ).toBeTruthy();
    expect(getByText('About this roadmap')).toBeTruthy();
    expect(
      getByText(
        'This roadmap presents my DevOps capabilities using the learning path published by roadmap.sh as a reference framework. Each topic highlights relevant skills and certifications, providing a structured overview of my experience across the DevOps discipline.',
      ),
    ).toBeTruthy();
    expect(learnMore.getAttribute('href')).toBe('https://roadmap.sh/devops');
    expect(learnMore.getAttribute('target')).toBe('_blank');
    expect(learnMore.getAttribute('rel')).toBe('noopener noreferrer');
  });

  it('composes the existing roadmap without overriding its default data', () => {
    const { getByRole } = renderRoadmapPage();

    expect(getByRole('group', { name: 'DevOps roadmap diagram' })).toBeTruthy();
    expect(devOpsRoadmapSpy).toHaveBeenCalledTimes(1);
    expect(devOpsRoadmapSpy).toHaveBeenCalledWith({});
  });
});
```

- [ ] **Step 3: Run the focused test and verify it fails**

Run:

```bash
pnpm nx test github.io -- --run src/app/devops-roadmap/roadmap-page.spec.tsx
```

Expected: FAIL because `./roadmap-page` does not exist.

- [ ] **Step 4: Implement the minimal route-level page**

Create `apps/github.io/src/app/devops-roadmap/roadmap-page.tsx`:

```tsx
import { Banner } from '@astryxdesign/core/Banner';
import { Button } from '@astryxdesign/core/Button';
import { Heading } from '@astryxdesign/core/Heading';
import { VStack } from '@astryxdesign/core/Layout';
import type { ReactElement } from 'react';

import { DevOpsRoadmap } from './devops-roadmap';

const ROADMAP_DESCRIPTION =
  'This roadmap presents my DevOps capabilities using the learning path published by roadmap.sh as a reference framework. Each topic highlights relevant skills and certifications, providing a structured overview of my experience across the DevOps discipline.';

export function RoadmapPage(): ReactElement {
  return (
    <VStack
      as="main"
      className="mx-auto"
      gap={4}
      maxWidth={448}
      minHeight="100vh"
      paddingBlock={4}
      paddingInline={4}
      width="100%"
    >
      <Heading level={1}>DevOps roadmap</Heading>
      <Banner
        description={ROADMAP_DESCRIPTION}
        endContent={
          <Button
            href="https://roadmap.sh/devops"
            label="Learn more"
            rel="noopener noreferrer"
            target="_blank"
            variant="secondary"
          />
        }
        status="info"
        title="About this roadmap"
      />
      <DevOpsRoadmap />
    </VStack>
  );
}
```

Do not add `isScrollable`, page-specific StyleX rules, Banner overrides, Button overrides, roadmap props, or changes to existing roadmap files.

- [ ] **Step 5: Run the focused test and verify it passes**

Run:

```bash
pnpm nx test github.io -- --run src/app/devops-roadmap/roadmap-page.spec.tsx
```

Expected: PASS with 2 tests.

- [ ] **Step 6: Run focused static checks**

Run:

```bash
pnpm exec prettier --check apps/github.io/src/app/devops-roadmap/roadmap-page.tsx apps/github.io/src/app/devops-roadmap/roadmap-page.spec.tsx
pnpm nx typecheck github.io
```

Expected: both commands exit successfully.

- [ ] **Step 7: Commit Task 1**

Inspect and commit only the page files:

```bash
git diff -- apps/github.io/src/app/devops-roadmap/roadmap-page.tsx apps/github.io/src/app/devops-roadmap/roadmap-page.spec.tsx
git status --short
git add apps/github.io/src/app/devops-roadmap/roadmap-page.tsx apps/github.io/src/app/devops-roadmap/roadmap-page.spec.tsx
git diff --cached
git commit -m "feat(github.io): add DevOps roadmap page"
```

Expected: one commit containing only the page component and its test.

### Task 2: Register the Public Roadmap Route

**Files:**

- Modify: `apps/github.io/src/app/app.spec.tsx`
- Modify: `apps/github.io/src/app/app.tsx`

**Interfaces:**

- Consumes: `RoadmapPage(): ReactElement` from Task 1.
- Produces: `AppRoutes()` resolving the exact path `/roadmap` to `<RoadmapPage />` while preserving `/`, `/skills/:skillId`, and the wildcard route.

- [ ] **Step 1: Add the failing route test**

Add this test inside the existing `describe('AppRoutes', ...)` block in `apps/github.io/src/app/app.spec.tsx`:

```tsx
it('renders the DevOps roadmap page for its clean route', () => {
  const { getByRole, getByText } = render(
    <MemoryRouter initialEntries={['/roadmap']}>
      <AppProviders>
        <AppRoutes />
        <LocationProbe />
      </AppProviders>
    </MemoryRouter>,
  );

  expect(
    getByRole('heading', { level: 1, name: 'DevOps roadmap' }),
  ).toBeTruthy();
  expect(getByText('About this roadmap')).toBeTruthy();
  expect(getByRole('group', { name: 'DevOps roadmap diagram' })).toBeTruthy();
});
```

- [ ] **Step 2: Run the route test and verify it fails**

Run:

```bash
pnpm nx test github.io -- --run src/app/app.spec.tsx
```

Expected: FAIL because `/roadmap` still resolves to the wildcard page.

- [ ] **Step 3: Register `RoadmapPage` without touching navigation**

In `apps/github.io/src/app/app.tsx`, add this import with the other local page imports:

```tsx
import { RoadmapPage } from './devops-roadmap/roadmap-page';
```

Add the route between `/` and `/skills/:skillId`:

```tsx
<Route path="/" element={<HomePage />} />
<Route path="/roadmap" element={<RoadmapPage />} />
<Route path="/skills/:skillId" element={<SkillDetailRoute />} />
```

Do not modify `HomePage`, `TopNav`, `RouterLink`, skill-detail pages, or any navigation test in this task.

- [ ] **Step 4: Run the route and page tests**

Run:

```bash
pnpm nx test github.io -- --run src/app/app.spec.tsx src/app/devops-roadmap/roadmap-page.spec.tsx
```

Expected: PASS for both files.

- [ ] **Step 5: Commit Task 2**

Inspect and commit only the route files:

```bash
git diff -- apps/github.io/src/app/app.tsx apps/github.io/src/app/app.spec.tsx
git status --short
git add apps/github.io/src/app/app.tsx apps/github.io/src/app/app.spec.tsx
git diff --cached
git commit -m "feat(github.io): route DevOps roadmap page"
```

Expected: one commit containing only route registration and route coverage.

### Task 3: Add the Roadmap Page Story

**Files:**

- Create: `apps/github.io/src/app/devops-roadmap/roadmap-page.stories.spec.ts`
- Create: `apps/github.io/src/app/devops-roadmap/roadmap-page.stories.tsx`

**Interfaces:**

- Consumes: `RoadmapPage(): ReactElement` from Task 1 and the global Storybook decorators that already provide `MemoryRouter`, Astryx `LinkProvider`, `Theme`, React Flow CSS, and app CSS.
- Produces: a fullscreen `Default` story at `GitHub.io/DevOps Roadmap/Roadmap Page`.

- [ ] **Step 1: Write the failing story metadata test**

Create `apps/github.io/src/app/devops-roadmap/roadmap-page.stories.spec.ts`:

```ts
import meta from './roadmap-page.stories';

describe('RoadmapPage stories', () => {
  it('uses the Roadmap Page Storybook hierarchy', () => {
    expect(meta.title).toBe('GitHub.io/DevOps Roadmap/Roadmap Page');
  });
});
```

- [ ] **Step 2: Run the focused story test and verify it fails**

Run:

```bash
pnpm nx test github.io -- --run src/app/devops-roadmap/roadmap-page.stories.spec.ts
```

Expected: FAIL because `./roadmap-page.stories` does not exist.

- [ ] **Step 3: Add the fullscreen page story**

Create `apps/github.io/src/app/devops-roadmap/roadmap-page.stories.tsx`:

```tsx
import type { Meta, StoryObj } from '@storybook/react-vite';

import { RoadmapPage } from './roadmap-page';

const meta: Meta<typeof RoadmapPage> = {
  component: RoadmapPage,
  parameters: {
    layout: 'fullscreen',
  },
  title: 'GitHub.io/DevOps Roadmap/Roadmap Page',
};

export default meta;
type Story = StoryObj<typeof RoadmapPage>;

export const Default: Story = {};
```

Do not add a story-specific router, theme, CSS import, mock dataset, or alternate roadmap props; the existing Storybook preview owns providers and styling.

- [ ] **Step 4: Run the story and page test files**

Run:

```bash
pnpm nx test github.io -- --run src/app/devops-roadmap/roadmap-page.stories.spec.ts src/app/devops-roadmap/roadmap-page.spec.tsx
```

Expected: PASS for both files.

- [ ] **Step 5: Build Storybook**

Run:

```bash
pnpm nx build-storybook github.io
```

Expected: Storybook exits successfully and emits `apps/github.io/storybook-static` without missing-provider, React Flow stylesheet, or story-index errors.

- [ ] **Step 6: Commit Task 3**

Inspect and commit only the story files:

```bash
git diff -- apps/github.io/src/app/devops-roadmap/roadmap-page.stories.tsx apps/github.io/src/app/devops-roadmap/roadmap-page.stories.spec.ts
git status --short
git add apps/github.io/src/app/devops-roadmap/roadmap-page.stories.tsx apps/github.io/src/app/devops-roadmap/roadmap-page.stories.spec.ts
git diff --cached
git commit -m "test(github.io): cover DevOps roadmap page story"
```

Expected: one commit containing only the Storybook story and its hierarchy test.

### Task 4: Verify the Complete Roadmap Page

**Files:**

- Verify only; no planned file changes.

**Interfaces:**

- Consumes: the page, route, and Storybook story from Tasks 1–3.
- Produces: fresh verification evidence and a clean implementation handoff; it must not produce a new code change.

- [ ] **Step 1: Confirm the implementation stayed inside scope**

Run:

```bash
git diff --stat 9fb72c1..HEAD
git diff --name-only 9fb72c1..HEAD
git status --short
```

Expected:

- Changed implementation paths are limited to the six files listed in this plan, plus this committed plan document.
- No navbar, `HomePage`, roadmap data, existing roadmap component, roadmap node, or stylesheet file changed.
- The working tree is clean.

- [ ] **Step 2: Run all project checks without relying on stale Nx results**

Run each command separately:

```bash
pnpm nx test github.io --skip-nx-cache
pnpm nx lint github.io --skip-nx-cache
pnpm nx typecheck github.io --skip-nx-cache
pnpm nx build github.io --skip-nx-cache
pnpm nx build-storybook github.io --skip-nx-cache
pnpm exec prettier --check apps/github.io/src/app/devops-roadmap/roadmap-page.tsx apps/github.io/src/app/devops-roadmap/roadmap-page.spec.tsx apps/github.io/src/app/devops-roadmap/roadmap-page.stories.tsx apps/github.io/src/app/devops-roadmap/roadmap-page.stories.spec.ts apps/github.io/src/app/app.tsx apps/github.io/src/app/app.spec.tsx
git diff --check 9fb72c1..HEAD
```

Expected: every command exits successfully; all tests pass; lint and typecheck report no errors; both builds complete; Prettier and whitespace checks pass.

- [ ] **Step 3: Perform visual review at narrow and wide widths**

Run Storybook and inspect `GitHub.io/DevOps Roadmap/Roadmap Page` at approximately 390px and 1024px viewport widths.

Verify at both widths:

- The visible `DevOps roadmap` heading, banner, and roadmap appear in that order.
- The banner uses its default informational anatomy and a secondary `Learn more` action.
- The action opens `https://roadmap.sh/devops` in a new tab.
- The page uses normal vertical document scrolling with no nested scrollbar.
- The roadmap has no horizontal overflow and retains its existing static interactions.
- No navbar is introduced by this branch.

- [ ] **Step 4: Run the repository review gate**

Run:

```bash
codex review --base 9fb72c1
```

Expected: no actionable findings. If review identifies a concrete issue, apply the smallest in-scope fix, rerun the affected focused test and all checks from Step 2, stage only the corrected files, inspect the staged diff, and commit with the appropriate conventional subject before repeating the review.

- [ ] **Step 5: Record the handoff state**

Run:

```bash
git status --short --branch
git log --oneline 9fb72c1..HEAD
```

Expected: a clean `feat/roadmap-page` worktree containing the committed implementation plan and three logical implementation commits, with no push, PR, merge, or deployment performed.
