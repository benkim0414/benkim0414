# GitHub.io Mobile Skills Page Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a mobile-only `github.io` skills page that shows a top search bar, fixed top-five skill carousel, and searchable full skill list at every viewport size.

**Architecture:** Keep skills as local app data with explicit `highlightedSkillIds` and derived `highlightedSkills` so a future API can replace the local source through a narrow boundary. Add a dedicated mobile skills page container that owns search filters, feeds them only to the full list, and leaves `SkillCarousel` fixed. Keep `AppShell` responsible for theme and page frame only.

**Tech Stack:** Nx, pnpm, React 19, Vitest, Testing Library, Storybook, Astryx `Theme`, `Layout`, `PowerSearch`, `Carousel`, `Card`, StyleX, Astryx-backed Tailwind utilities.

## Global Constraints

- Render the `github.io` app as a mobile layout at all viewport sizes.
- Add a minimal top bar containing only search.
- Place a fixed top-five `SkillCarousel` directly under the top bar.
- Filter only the full skills list below the carousel.
- Keep the top-five carousel fixed while search input changes.
- Store skills locally in the app in a shape compatible with existing `SkillCard`.
- Make the local data boundary straightforward to replace with an API later.
- Do not build an API, API client, loader state, or remote data fetching.
- Do not add desktop-specific navigation or desktop layout behavior.
- Do not rank top skills dynamically at runtime.
- Do not add new app dependencies or a new styling system.
- Before UI implementation, run the relevant Astryx docs commands and mention them in the final handoff.
- Work from `/home/benkim0414/workspace/benkim0414/.worktrees/mobile-skills-page` on `feat/github-io-mobile-skills-page`.

---

## File Structure

- Modify `apps/github.io/src/app/skills/skill-list.data.ts`
  - Own the local skill catalog.
  - Export `skills`, `highlightedSkillIds`, `highlightedSkills`, and keep `sampleSkills` as a compatibility alias for existing component stories/tests.

- Create `apps/github.io/src/app/skills/skill-list.data.spec.ts`
  - Lock the top-five highlighted order and data integrity.
  - Verify the highlighted skills are a fixed five-item subset of the full local catalog.

- Create `apps/github.io/src/app/skills/mobile-skills-page.tsx`
  - Own search filter state for the page.
  - Render top search, fixed highlighted carousel, and filtered full list.
  - Accept optional `skills` and `highlightedSkills` props for tests/stories while defaulting to local data.

- Create `apps/github.io/src/app/skills/mobile-skills-page.spec.tsx`
  - Test filtering behavior, fixed carousel behavior, empty states, and accessibility labels.

- Create `apps/github.io/src/app/skills/mobile-skills-page.stories.tsx`
  - Add Storybook coverage for default mobile page and no-match-friendly data state.

- Modify `apps/github.io/src/app/app-shell.tsx`
  - Keep Astryx `Theme`.
  - Render a mobile-width app frame at every viewport size.
  - Render `MobileSkillsPage`.

- Modify `apps/github.io/src/app/app.spec.tsx`
  - Update app-level assertions around the mobile-only shell.
  - Ensure old generic nav remains absent.

- Modify `apps/github.io/src/app/app-shell.stories.tsx`
  - Keep the app shell story with fullscreen layout.
  - Add a large viewport sanity story so browser QA can confirm the mobile frame remains centered on wide screens.

---

### Task 1: Local Highlighted Skills Catalog

**Files:**
- Modify: `apps/github.io/src/app/skills/skill-list.data.ts`
- Create: `apps/github.io/src/app/skills/skill-list.data.spec.ts`

**Interfaces:**
- Consumes: `Skill` from `apps/github.io/src/app/skills/skill-list.types.ts`.
- Produces:
  - `export const skills: readonly Skill[]`
  - `export const highlightedSkillIds: readonly string[]`
  - `export const highlightedSkills: readonly Skill[]`
  - `export const sampleSkills: readonly Skill[]`

- [ ] **Step 1: Write failing data integrity tests**

Create `apps/github.io/src/app/skills/skill-list.data.spec.ts`:

```ts
import {
  highlightedSkillIds,
  highlightedSkills,
  sampleSkills,
  skills,
} from './skill-list.data';

describe('skill-list data', () => {
  it('keeps sampleSkills as a compatibility alias for the local catalog', () => {
    expect(sampleSkills).toBe(skills);
  });

  it('defines the evidence-backed top five highlighted skills in order', () => {
    expect(highlightedSkillIds).toEqual([
      'kubernetes',
      'github-actions',
      'nx',
      'terraform',
      'docker',
    ]);
    expect(highlightedSkills.map((skill) => skill.id)).toEqual([
      'kubernetes',
      'github-actions',
      'nx',
      'terraform',
      'docker',
    ]);
  });

  it('resolves highlighted skills from the local catalog without missing IDs', () => {
    const catalogIds = new Set(skills.map((skill) => skill.id));

    expect(highlightedSkills).toHaveLength(5);
    expect(highlightedSkillIds.every((id) => catalogIds.has(id))).toBe(true);
    expect(new Set(highlightedSkillIds).size).toBe(highlightedSkillIds.length);
  });

  it('keeps highlighted descriptions public-safe and evidence-backed', () => {
    expect(
      highlightedSkills.find((skill) => skill.id === 'kubernetes')?.description,
    ).toBe(
      'Cloud-native workload operations, troubleshooting, and infrastructure practice backed by Kubernetes certification evidence.',
    );
    expect(
      highlightedSkills.find((skill) => skill.id === 'github-actions')
        ?.description,
    ).toBe(
      'CI/CD workflow ownership across integration, delivery, and deployment automation.',
    );
    expect(
      highlightedSkills.find((skill) => skill.id === 'nx')?.description,
    ).toBe(
      'Monorepo quality gates for lint, build, test, and type-check workflows.',
    );
    expect(
      highlightedSkills.find((skill) => skill.id === 'terraform')
        ?.description,
    ).toBe(
      'Reproducible infrastructure and scoped IAM policy management with Terraform.',
    );
    expect(
      highlightedSkills.find((skill) => skill.id === 'docker')?.description,
    ).toBe(
      'Container packaging, delivery workflow support, and immutable image deployment practice.',
    );
  });
});
```

- [ ] **Step 2: Run the focused failing test**

Run:

```bash
pnpm nx test github.io -- --run apps/github.io/src/app/skills/skill-list.data.spec.ts
```

Expected: FAIL because `highlightedSkillIds`, `highlightedSkills`, and `skills` are not exported yet.

- [ ] **Step 3: Implement the local catalog exports**

Modify `apps/github.io/src/app/skills/skill-list.data.ts` to use this export structure:

```ts
import type { Skill } from './skill-list.types';

export const skills: readonly Skill[] = [
  {
    id: 'typescript',
    name: 'TypeScript',
    description: 'Typed JavaScript for building reliable applications.',
    categories: ['Language'],
    level: 5,
    iconSlug: 'typescript',
    keywords: ['javascript', 'typed', 'frontend', 'node'],
  },
  {
    id: 'react',
    name: 'React',
    description: 'Component-based UI library for interactive web interfaces.',
    categories: ['Framework'],
    level: 5,
    iconSlug: 'react',
    keywords: ['frontend', 'ui', 'components'],
  },
  {
    id: 'nx',
    name: 'Nx',
    description:
      'Monorepo quality gates for lint, build, test, and type-check workflows.',
    categories: ['Build', 'Tooling'],
    level: 4,
    iconSlug: 'nx',
    keywords: [
      'monorepo',
      'workspace',
      'build system',
      'affected',
      'quality gates',
    ],
  },
  {
    id: 'aws',
    name: 'AWS',
    description: 'Cloud platform for scalable infrastructure and services.',
    categories: ['Cloud'],
    level: 4,
    iconSlug: 'amazonaws',
    keywords: ['cloud', 'infrastructure', 'iam', 'irsa'],
  },
  {
    id: 'terraform',
    name: 'Terraform',
    description:
      'Reproducible infrastructure and scoped IAM policy management with Terraform.',
    categories: ['IaC', 'Cloud'],
    level: 4,
    iconSlug: 'terraform',
    keywords: [
      'infrastructure as code',
      'provisioning',
      'iam',
      'irsa',
      'policy',
    ],
  },
  {
    id: 'docker',
    name: 'Docker',
    description:
      'Container packaging, delivery workflow support, and immutable image deployment practice.',
    categories: ['Container', 'Runtime'],
    level: 4,
    iconSlug: 'docker',
    keywords: [
      'container',
      'image',
      'runtime',
      'delivery',
      'digest',
      'deployment',
    ],
  },
  {
    id: 'kubernetes',
    name: 'Kubernetes',
    description:
      'Cloud-native workload operations, troubleshooting, and infrastructure practice backed by Kubernetes certification evidence.',
    categories: ['Container', 'Cloud'],
    level: 4,
    iconSlug: 'kubernetes',
    keywords: [
      'containers',
      'orchestration',
      'platform',
      'cloud native',
      'kubectl',
      'cluster operations',
      'irsa',
    ],
    certifications: [
      {
        title: 'KCNA',
        url: 'https://example.com/kcna',
        skills: ['Kubernetes'],
        expiresAt: '2028-02-26T10:59:00+11:00',
      },
      {
        title: 'CKA',
        url: 'https://example.com/cka',
        skills: ['Kubernetes'],
        expiresAt: '2028-02-26T10:59:00+11:00',
      },
      {
        title: 'CKAD',
        url: 'https://example.com/ckad',
        skills: ['Kubernetes'],
        expiresAt: '2028-02-26T10:59:00+11:00',
      },
    ],
  },
  {
    id: 'github-actions',
    name: 'GitHub Actions',
    description:
      'CI/CD workflow ownership across integration, delivery, and deployment automation.',
    categories: ['CI/CD'],
    level: 4,
    iconSlug: 'githubactions',
    keywords: ['ci', 'cd', 'automation', 'workflow', 'delivery', 'deployment'],
  },
  {
    id: 'storybook',
    name: 'Storybook',
    description: 'Development environment for building and testing UI components.',
    categories: ['Design System', 'Testing'],
    level: 4,
    iconSlug: 'storybook',
    keywords: ['components', 'ui', 'visual testing'],
  },
];

export const highlightedSkillIds = [
  'kubernetes',
  'github-actions',
  'nx',
  'terraform',
  'docker',
] as const;

export const highlightedSkills = highlightedSkillIds.map((id) => {
  const skill = skills.find((candidate) => candidate.id === id);

  if (!skill) {
    throw new Error(`Highlighted skill "${id}" is missing from skills.`);
  }

  return skill;
}) satisfies readonly Skill[];

export const sampleSkills = skills;
```

- [ ] **Step 4: Run the focused data test**

Run:

```bash
pnpm nx test github.io -- --run apps/github.io/src/app/skills/skill-list.data.spec.ts
```

Expected: PASS. The highlighted order is fixed and all highlighted IDs resolve from local skills.

- [ ] **Step 5: Run existing skill tests that depend on sample data**

Run:

```bash
pnpm nx test github.io -- --run apps/github.io/src/app/skills/skill-carousel.spec.tsx apps/github.io/src/app/skills/skill-card.spec.tsx apps/github.io/src/app/skills/skill-section.spec.tsx
```

Expected: PASS. Existing components still consume `sampleSkills` and the Kubernetes card still supports certification rendering.

- [ ] **Step 6: Commit Task 1**

Run:

```bash
git status --short
git diff -- apps/github.io/src/app/skills/skill-list.data.ts apps/github.io/src/app/skills/skill-list.data.spec.ts
git add apps/github.io/src/app/skills/skill-list.data.ts apps/github.io/src/app/skills/skill-list.data.spec.ts
git diff --cached
git commit -m "feat(github.io): add highlighted skills catalog"
```

Expected: commit contains only the skill data and data integrity test.

---

### Task 2: Mobile Skills Page Container

**Files:**
- Create: `apps/github.io/src/app/skills/mobile-skills-page.tsx`
- Create: `apps/github.io/src/app/skills/mobile-skills-page.spec.tsx`

**Interfaces:**
- Consumes:
  - `skills`, `highlightedSkills` from `./skill-list.data`
  - `SkillCarousel({ skills, ariaLabel, emptyMessage })`
  - `SkillSearch({ filters, onFiltersChange, resultCount })`
  - `SkillList({ skills, heading, emptyMessage })`
  - `skillMatchesFilters(skill, filters)` from `./skill-search`
- Produces:
  - `export interface MobileSkillsPageProps { skills?: readonly Skill[]; highlightedSkills?: readonly Skill[] }`
  - `export function MobileSkillsPage(props: MobileSkillsPageProps): ReactElement`

- [ ] **Step 1: Check Astryx docs before UI implementation**

Run:

```bash
pnpm exec astryx docs layout
pnpm exec astryx docs styling
pnpm exec astryx docs typography
pnpm exec astryx docs PowerSearch
pnpm exec astryx docs Carousel
```

Expected: commands print official Astryx guidance. Record any component-specific prop corrections before writing implementation. If a component docs command is not available by exact component name, run the closest official Astryx docs command printed by the CLI and note that in the task summary.

- [ ] **Step 2: Write failing mobile page tests**

Create `apps/github.io/src/app/skills/mobile-skills-page.spec.tsx`:

```tsx
import { fireEvent, render, within } from '@testing-library/react';

import { MobileSkillsPage } from './mobile-skills-page';
import {
  highlightedSkills,
  skills,
} from './skill-list.data';

describe('MobileSkillsPage', () => {
  it('renders top search, fixed highlighted carousel, and full skills list', () => {
    const { getAllByTestId, getByLabelText, getByRole, getByText } = render(
      <MobileSkillsPage />,
    );

    expect(getByRole('search', { name: 'Skill search' })).toBeTruthy();
    expect(getByRole('combobox', { name: 'Search skills' })).toBeTruthy();
    expect(getByLabelText('Highlighted skills')).toBeTruthy();
    expect(getAllByTestId('skill-card')).toHaveLength(5);
    expect(getByRole('region', { name: 'Skills' })).toBeTruthy();
    expect(getByText('TypeScript')).toBeTruthy();
    expect(getByText('React')).toBeTruthy();
  });

  it('filters only the full skills list from the top search', () => {
    const { getAllByTestId, getByLabelText, getByRole, queryByText } = render(
      <MobileSkillsPage />,
    );

    fireEvent.change(getByRole('combobox', { name: 'Search skills' }), {
      target: { value: 'terraform' },
    });

    const carousel = getByLabelText('Highlighted skills');
    const list = getByRole('region', { name: 'Skills' });

    expect(getAllByTestId('skill-card')).toHaveLength(5);
    expect(within(carousel).getByRole('heading', { name: 'Kubernetes' }))
      .toBeTruthy();
    expect(within(carousel).getByRole('heading', { name: 'GitHub Actions' }))
      .toBeTruthy();
    expect(within(list).getByText('Terraform')).toBeTruthy();
    expect(queryByText('React')).toBeNull();
  });

  it('keeps the highlighted carousel fixed when the list has no search match', () => {
    const { getAllByTestId, getByRole, getByText } = render(
      <MobileSkillsPage />,
    );

    fireEvent.change(getByRole('combobox', { name: 'Search skills' }), {
      target: { value: 'zzzz-no-match' },
    });

    expect(getAllByTestId('skill-card')).toHaveLength(5);
    expect(getByText('No skills match your search.')).toBeTruthy();
    expect(getByText('Kubernetes')).toBeTruthy();
  });

  it('uses the full empty message only when no local skills are supplied', () => {
    const { getByText } = render(
      <MobileSkillsPage highlightedSkills={[]} skills={[]} />,
    );

    expect(getByText('No skills have been supplied.')).toBeTruthy();
    expect(getByText('No highlighted skills have been supplied.')).toBeTruthy();
  });

  it('accepts supplied skills while preserving supplied highlighted skills', () => {
    const suppliedSkills = skills.filter((skill) => skill.id === 'react');

    const { getAllByTestId, getByText, queryByText } = render(
      <MobileSkillsPage
        highlightedSkills={highlightedSkills}
        skills={suppliedSkills}
      />,
    );

    expect(getAllByTestId('skill-card')).toHaveLength(5);
    expect(getByText('React')).toBeTruthy();
    expect(getByText('Kubernetes')).toBeTruthy();
    expect(queryByText('TypeScript')).toBeNull();
  });
});
```

- [ ] **Step 3: Run the focused failing mobile page test**

Run:

```bash
pnpm nx test github.io -- --run apps/github.io/src/app/skills/mobile-skills-page.spec.tsx
```

Expected: FAIL because `mobile-skills-page.tsx` does not exist.

- [ ] **Step 4: Implement `MobileSkillsPage`**

Create `apps/github.io/src/app/skills/mobile-skills-page.tsx`:

```tsx
import { useMemo, useState, type ReactElement } from 'react';
import { VStack } from '@astryxdesign/core/Layout';
import type { PowerSearchFilter } from '@astryxdesign/core/PowerSearch';

import {
  highlightedSkills as defaultHighlightedSkills,
  skills as defaultSkills,
} from './skill-list.data';
import { SkillCarousel } from './skill-carousel';
import { SkillList } from './skill-list';
import type { Skill } from './skill-list.types';
import { SkillSearch, skillMatchesFilters } from './skill-search';

export interface MobileSkillsPageProps {
  skills?: readonly Skill[];
  highlightedSkills?: readonly Skill[];
}

export function MobileSkillsPage({
  skills = defaultSkills,
  highlightedSkills = defaultHighlightedSkills,
}: MobileSkillsPageProps): ReactElement {
  const [filters, setFilters] = useState<ReadonlyArray<PowerSearchFilter>>([]);
  const filteredSkills = useMemo(
    () => skills.filter((skill) => skillMatchesFilters(skill, filters)),
    [filters, skills],
  );

  return (
    <VStack gap={4}>
      <search aria-label="Skill search">
        <SkillSearch
          filters={filters}
          onFiltersChange={setFilters}
          resultCount={filteredSkills.length}
        />
      </search>

      <SkillCarousel
        ariaLabel="Highlighted skills"
        emptyMessage="No highlighted skills have been supplied."
        skills={highlightedSkills}
      />

      <SkillList
        emptyMessage={
          skills.length === 0 ? 'No skills have been supplied.' : 'No skills match your search.'
        }
        heading="Skills"
        skills={filteredSkills}
      />
    </VStack>
  );
}
```

If lint requires line wrapping for the `emptyMessage` expression, rewrite it as:

```tsx
const listEmptyMessage =
  skills.length === 0
    ? 'No skills have been supplied.'
    : 'No skills match your search.';
```

and pass `emptyMessage={listEmptyMessage}`.

- [ ] **Step 5: Run the focused mobile page test**

Run:

```bash
pnpm nx test github.io -- --run apps/github.io/src/app/skills/mobile-skills-page.spec.tsx
```

Expected: PASS. Search filters only the full list and the carousel remains fixed.

- [ ] **Step 6: Run related skill search/list tests**

Run:

```bash
pnpm nx test github.io -- --run apps/github.io/src/app/skills/skill-search.spec.tsx apps/github.io/src/app/skills/skill-list.spec.tsx apps/github.io/src/app/skills/skill-carousel.spec.tsx
```

Expected: PASS. Existing search, list, and carousel contracts are unchanged.

- [ ] **Step 7: Commit Task 2**

Run:

```bash
git status --short
git diff -- apps/github.io/src/app/skills/mobile-skills-page.tsx apps/github.io/src/app/skills/mobile-skills-page.spec.tsx
git add apps/github.io/src/app/skills/mobile-skills-page.tsx apps/github.io/src/app/skills/mobile-skills-page.spec.tsx
git diff --cached
git commit -m "feat(github.io): add mobile skills page"
```

Expected: commit contains only the mobile page component and its tests.

---

### Task 3: Mobile-Only App Shell

**Files:**
- Modify: `apps/github.io/src/app/app-shell.tsx`
- Modify: `apps/github.io/src/app/app.spec.tsx`
- Modify: `apps/github.io/src/app/app-shell.stories.tsx`

**Interfaces:**
- Consumes: `MobileSkillsPage()` from `./skills/mobile-skills-page`.
- Produces: `AppShell()` that renders the same mobile-width skills page at every viewport size.

- [ ] **Step 1: Write failing app shell tests**

Modify `apps/github.io/src/app/app.spec.tsx`:

```tsx
import { fireEvent, render, within } from '@testing-library/react';

import App from './app';

describe('App', () => {
  it('renders the mobile-only skills page successfully', () => {
    const { getAllByTestId, getByLabelText, getByRole, getByText } = render(
      <App />,
    );
    const main = getByRole('main', { name: 'Skills' });

    expect(main.className).toContain('max-w-md');
    expect(getByRole('heading', { level: 1, name: 'Skills' })).toBeTruthy();
    expect(getByRole('search', { name: 'Skill search' })).toBeTruthy();
    expect(getByRole('combobox', { name: 'Search skills' })).toBeTruthy();
    expect(getByLabelText('Highlighted skills')).toBeTruthy();
    expect(getAllByTestId('skill-card')).toHaveLength(5);
    expect(getByText('TypeScript')).toBeTruthy();
    expect(getByText('React')).toBeTruthy();
  });

  it('filters only the full skills list from the top search', () => {
    const { getAllByTestId, getByLabelText, getByRole } = render(<App />);

    fireEvent.change(getByRole('combobox', { name: 'Search skills' }), {
      target: { value: 'terraform' },
    });

    const carousel = getByLabelText('Highlighted skills');
    const list = getByRole('region', { name: 'Skills' });

    expect(getAllByTestId('skill-card')).toHaveLength(5);
    expect(within(carousel).getByRole('heading', { name: 'Kubernetes' }))
      .toBeTruthy();
    expect(within(list).getByText('Terraform')).toBeTruthy();
  });

  it('does not render generic navigation or desktop shell content', () => {
    const { queryByLabelText, queryByRole, queryByText } = render(<App />);

    expect(queryByRole('link', { name: 'Home' })).toBeNull();
    expect(queryByLabelText('Primary navigation')).toBeNull();
    expect(queryByText('Generic Layout Skeleton')).toBeNull();
    expect(queryByText('Content Region')).toBeNull();
    expect(queryByText('Footer Region')).toBeNull();
  });
});
```

- [ ] **Step 2: Run the focused failing app test**

Run:

```bash
pnpm nx test github.io -- --run apps/github.io/src/app/app.spec.tsx
```

Expected: FAIL because `AppShell` still uses `max-w-5xl` and does not render `MobileSkillsPage`.

- [ ] **Step 3: Implement the mobile-only app shell**

Modify `apps/github.io/src/app/app-shell.tsx`:

```tsx
import { Theme } from '@astryxdesign/core';
import { VisuallyHidden } from '@astryxdesign/core/VisuallyHidden';
import { neutralTheme } from '@astryxdesign/theme-neutral/built';

import { MobileSkillsPage } from './skills/mobile-skills-page';

export function AppShell() {
  return (
    <Theme theme={neutralTheme}>
      <main
        aria-labelledby="skills-page-title"
        className="mx-auto min-h-screen w-full max-w-md px-4 py-4"
      >
        <VisuallyHidden as="h1" id="skills-page-title">
          Skills
        </VisuallyHidden>

        <MobileSkillsPage />
      </main>
    </Theme>
  );
}
```

Modify `apps/github.io/src/app/app-shell.stories.tsx`:

```tsx
import type { Meta, StoryObj } from '@storybook/react-vite';

import { AppShell } from './app-shell';

const meta: Meta<typeof AppShell> = {
  component: AppShell,
  parameters: {
    layout: 'fullscreen',
  },
  title: 'GitHub.io/App Shell/Mobile Skills Page',
};

export default meta;
type Story = StoryObj<typeof AppShell>;

export const Default: Story = {};

export const LargeViewport: Story = {
  parameters: {
    viewport: {
      defaultViewport: 'responsive',
    },
  },
};
```

- [ ] **Step 4: Run app shell and mobile page tests**

Run:

```bash
pnpm nx test github.io -- --run apps/github.io/src/app/app.spec.tsx apps/github.io/src/app/skills/mobile-skills-page.spec.tsx
```

Expected: PASS. The app shell renders the mobile-width page and search behavior is preserved at the app boundary.

- [ ] **Step 5: Commit Task 3**

Run:

```bash
git status --short
git diff -- apps/github.io/src/app/app-shell.tsx apps/github.io/src/app/app.spec.tsx apps/github.io/src/app/app-shell.stories.tsx
git add apps/github.io/src/app/app-shell.tsx apps/github.io/src/app/app.spec.tsx apps/github.io/src/app/app-shell.stories.tsx
git diff --cached
git commit -m "feat(github.io): render mobile skills shell"
```

Expected: commit contains only app shell wiring, app tests, and app shell stories.

---

### Task 4: Mobile Skills Page Storybook Coverage

**Files:**
- Create: `apps/github.io/src/app/skills/mobile-skills-page.stories.tsx`

**Interfaces:**
- Consumes: `MobileSkillsPage` and `skills`.
- Produces: Storybook stories at `GitHub.io/Skills/Mobile Skills Page`.

- [ ] **Step 1: Create the mobile skills page stories**

Create `apps/github.io/src/app/skills/mobile-skills-page.stories.tsx`:

```tsx
import type { Meta, StoryObj } from '@storybook/react-vite';

import { MobileSkillsPage } from './mobile-skills-page';
import { highlightedSkills, skills } from './skill-list.data';

const meta: Meta<typeof MobileSkillsPage> = {
  component: MobileSkillsPage,
  parameters: {
    layout: 'fullscreen',
  },
  title: 'GitHub.io/Skills/Mobile Skills Page',
};

export default meta;
type Story = StoryObj<typeof MobileSkillsPage>;

export const Default: Story = {};

export const SingleListSkill: Story = {
  args: {
    highlightedSkills,
    skills: skills.filter((skill) => skill.id === 'react'),
  },
};

export const Empty: Story = {
  args: {
    highlightedSkills: [],
    skills: [],
  },
};
```

- [ ] **Step 2: Run TypeScript/test coverage for story imports**

Run:

```bash
pnpm nx test github.io -- --run apps/github.io/src/app/skills/mobile-skills-page.spec.tsx
```

Expected: PASS. The component remains importable and story args use real exported data.

- [ ] **Step 3: Commit Task 4**

Run:

```bash
git status --short
git diff -- apps/github.io/src/app/skills/mobile-skills-page.stories.tsx
git add apps/github.io/src/app/skills/mobile-skills-page.stories.tsx
git diff --cached
git commit -m "docs(github.io): add mobile skills page stories"
```

Expected: commit contains only the new Storybook stories.

---

### Task 5: Final Verification And Browser QA

**Files:**
- Verify: `apps/github.io/src/app/**`
- Verify: `apps/github.io/src/styles.css`
- No planned source edits unless verification exposes a bug.

**Interfaces:**
- Consumes: all prior task outputs.
- Produces: verified mobile-only skills page ready for code review/handoff.

- [ ] **Step 1: Run focused tests**

Run:

```bash
pnpm nx test github.io -- --run apps/github.io/src/app/app.spec.tsx apps/github.io/src/app/skills/mobile-skills-page.spec.tsx apps/github.io/src/app/skills/skill-list.data.spec.ts apps/github.io/src/app/skills/skill-carousel.spec.tsx apps/github.io/src/app/skills/skill-search.spec.tsx apps/github.io/src/app/skills/skill-list.spec.tsx
```

Expected: PASS.

- [ ] **Step 2: Run full app tests**

Run:

```bash
pnpm nx test github.io
```

Expected: PASS.

- [ ] **Step 3: Run lint**

Run:

```bash
pnpm nx lint github.io
```

Expected: PASS.

- [ ] **Step 4: Run production build**

Run:

```bash
pnpm nx build github.io
```

Expected: PASS.

- [ ] **Step 5: Run Storybook for visual QA**

Run:

```bash
pnpm nx storybook github.io -- --host 127.0.0.1
```

Expected: Storybook starts and reports a local URL. Keep the session running only while doing visual QA, then stop it before final response.

- [ ] **Step 6: Browser-check mobile and large viewport behavior**

Open the Storybook stories:

- `GitHub.io/App Shell/Mobile Skills Page`
- `GitHub.io/Skills/Mobile Skills Page`
- `GitHub.io/Skills/Skill Carousel`

Verify:

- At a mobile viewport, the page shows top search, fixed highlighted carousel, and full list.
- At a large viewport, the same mobile-width frame remains centered; no desktop nav or desktop grid appears.
- Search input does not visually move or resize the highlighted carousel.
- Skill cards do not clip category badges, headings, certification citations, or descriptions.
- The carousel cards remain equal-height through the existing `.skill-carousel` scoped CSS.

- [ ] **Step 7: Fix verification findings if needed**

If a test or browser check fails, make the smallest scoped fix in the file that owns the problem, then rerun the failing command. Stage and commit the fix with one of:

```bash
git add <explicit fixed files>
git commit -m "fix(github.io): stabilize mobile skills layout"
```

or

```bash
git add <explicit fixed files>
git commit -m "test(github.io): cover mobile skills behavior"
```

Use the `fix` type for runtime/UI behavior and `test` type for test-only corrections.

- [ ] **Step 8: Final status check**

Run:

```bash
git status --short --branch
git log --oneline -6
```

Expected: worktree is clean on `feat/github-io-mobile-skills-page`, with separate commits for the design spec, implementation plan, catalog, mobile page, shell wiring, stories, and any verification fixups.
