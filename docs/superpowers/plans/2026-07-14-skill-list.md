# Skill List Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a standalone recruiter-facing skill list component for the `github.io` app with Astryx search, list rendering, logo avatars, compact categories, and accessible 1-5 star ratings.

**Architecture:** Keep the component set isolated under `apps/github.io/src/app/skills/`. Use typed skill data and small focused components: `SkillList` owns search state, `SkillRating` owns star rendering, and `SkillLogo` owns logo/avatar rendering. Storybook remains the visual review surface; the component is not mounted in the app shell.

**Tech Stack:** React 19, TypeScript, Nx 23, Vite, Vitest, Testing Library, Storybook 10, Astryx `@astryxdesign/core`, Astryx neutral theme.

## Global Constraints

- Do not create or modify the full app layout.
- Do not mount the skill list in `AppShell`.
- Do not add editable skill management.
- Do not add project proof, years of experience, or last-used dates in v1.
- Do not add production skill data unless it is explicitly provided later.
- Use compact categories: `Language`, `Runtime`, `Framework`, `Cloud`, `Container`, `CI/CD`, `IaC`, `Observability`, `Database`, `Build`, `Testing`, `Design System`, `Tooling`.
- Use Astryx `PowerSearch` as the primary search and filtering surface when the installed API supports it.
- Render results as an Astryx `List`, not custom cards or a grid.
- Use Astryx `Avatar` for logos and Astryx `Badge` for categories where available.
- Verify exact installed Astryx import paths and props before coding UI components.
- Stage explicit paths only and commit each task separately with conventional commits.

---

## File Structure

- Create `apps/github.io/src/app/skills/skill-list.types.ts` for `SkillCategory`, `Skill`, `SkillListProps`, and search helper signatures.
- Create `apps/github.io/src/app/skills/skill-list.data.ts` for representative sample data used only by stories and tests.
- Create `apps/github.io/src/app/skills/skill-rating.tsx` for accessible 1-5 star display.
- Create `apps/github.io/src/app/skills/skill-logo.tsx` for logo/avatar rendering.
- Create `apps/github.io/src/app/skills/skill-list.tsx` for the stateful searchable list.
- Create `apps/github.io/src/app/skills/skill-rating.spec.tsx` for rating behavior.
- Create `apps/github.io/src/app/skills/skill-list.spec.tsx` for render, search, category, keyword, and empty-state behavior.
- Create `apps/github.io/src/app/skills/skill-list.stories.tsx` for Storybook review.
- Modify `apps/github.io/src/styles.css` only for minimal skill-list layout classes that Astryx does not provide directly.

---

### Task 1: Define Skill Data Model and Rating Component

**Files:**
- Create: `apps/github.io/src/app/skills/skill-list.types.ts`
- Create: `apps/github.io/src/app/skills/skill-list.data.ts`
- Create: `apps/github.io/src/app/skills/skill-rating.tsx`
- Test: `apps/github.io/src/app/skills/skill-rating.spec.tsx`

**Interfaces:**
- Produces:
  - `export const skillCategories: readonly SkillCategory[]`
  - `export type SkillCategory = ...`
  - `export interface Skill { id: string; name: string; category: SkillCategory; level: 1 | 2 | 3 | 4 | 5; iconSlug: string; keywords: readonly string[]; }`
  - `export interface SkillListProps { skills: readonly Skill[]; heading?: string; }`
  - `export function SkillRating({ level }: { level: Skill['level'] }): JSX.Element`
  - `export const sampleSkills: readonly Skill[]`

- [ ] **Step 1: Create the failing rating test**

Create `apps/github.io/src/app/skills/skill-rating.spec.tsx`:

```tsx
import { render } from '@testing-library/react';

import { SkillRating } from './skill-rating';

describe('SkillRating', () => {
  it('renders five stars with an accessible rating label', () => {
    const { getByLabelText, getAllByText } = render(<SkillRating level={4} />);

    expect(getByLabelText('4 out of 5')).toBeTruthy();
    expect(getAllByText('★')).toHaveLength(4);
    expect(getAllByText('☆')).toHaveLength(1);
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run:

```bash
PATH=/tmp/corepack-shims:$PATH NX_DAEMON=false corepack pnpm nx test github.io --skip-nx-cache --runInBand
```

Expected: FAIL because `./skill-rating` does not exist.

- [ ] **Step 3: Create the shared types**

Create `apps/github.io/src/app/skills/skill-list.types.ts`:

```ts
export const skillCategories = [
  'Language',
  'Runtime',
  'Framework',
  'Cloud',
  'Container',
  'CI/CD',
  'IaC',
  'Observability',
  'Database',
  'Build',
  'Testing',
  'Design System',
  'Tooling',
] as const;

export type SkillCategory = (typeof skillCategories)[number];

export interface Skill {
  id: string;
  name: string;
  category: SkillCategory;
  level: 1 | 2 | 3 | 4 | 5;
  iconSlug: string;
  keywords: readonly string[];
}

export interface SkillListProps {
  skills: readonly Skill[];
  heading?: string;
}
```

- [ ] **Step 4: Create representative sample data**

Create `apps/github.io/src/app/skills/skill-list.data.ts`:

```ts
import type { Skill } from './skill-list.types';

export const sampleSkills: readonly Skill[] = [
  {
    id: 'typescript',
    name: 'TypeScript',
    category: 'Language',
    level: 5,
    iconSlug: 'typescript',
    keywords: ['javascript', 'typed', 'frontend', 'node'],
  },
  {
    id: 'react',
    name: 'React',
    category: 'Framework',
    level: 5,
    iconSlug: 'react',
    keywords: ['frontend', 'ui', 'components'],
  },
  {
    id: 'nx',
    name: 'Nx',
    category: 'Build',
    level: 4,
    iconSlug: 'nx',
    keywords: ['monorepo', 'workspace', 'build system'],
  },
  {
    id: 'aws',
    name: 'AWS',
    category: 'Cloud',
    level: 4,
    iconSlug: 'amazonaws',
    keywords: ['cloud', 'infrastructure'],
  },
  {
    id: 'terraform',
    name: 'Terraform',
    category: 'IaC',
    level: 4,
    iconSlug: 'terraform',
    keywords: ['infrastructure as code', 'provisioning'],
  },
  {
    id: 'docker',
    name: 'Docker',
    category: 'Container',
    level: 4,
    iconSlug: 'docker',
    keywords: ['container', 'image', 'runtime'],
  },
  {
    id: 'github-actions',
    name: 'GitHub Actions',
    category: 'CI/CD',
    level: 4,
    iconSlug: 'githubactions',
    keywords: ['ci', 'cd', 'automation', 'workflow'],
  },
  {
    id: 'storybook',
    name: 'Storybook',
    category: 'Design System',
    level: 4,
    iconSlug: 'storybook',
    keywords: ['components', 'ui', 'visual testing'],
  },
];
```

- [ ] **Step 5: Implement the rating component**

Create `apps/github.io/src/app/skills/skill-rating.tsx`:

```tsx
import type { Skill } from './skill-list.types';

interface SkillRatingProps {
  level: Skill['level'];
}

export function SkillRating({ level }: SkillRatingProps) {
  return (
    <span className="skill-rating" aria-label={`${level} out of 5`}>
      {Array.from({ length: 5 }, (_, index) => (
        <span key={index} aria-hidden="true">
          {index < level ? '★' : '☆'}
        </span>
      ))}
    </span>
  );
}
```

- [ ] **Step 6: Run the focused test**

Run:

```bash
PATH=/tmp/corepack-shims:$PATH NX_DAEMON=false corepack pnpm nx test github.io --skip-nx-cache --runInBand
```

Expected: PASS for the new rating test and existing tests.

- [ ] **Step 7: Commit Task 1**

Run:

```bash
git status --short
git diff -- apps/github.io/src/app/skills/skill-list.types.ts apps/github.io/src/app/skills/skill-list.data.ts apps/github.io/src/app/skills/skill-rating.tsx apps/github.io/src/app/skills/skill-rating.spec.tsx
git add apps/github.io/src/app/skills/skill-list.types.ts apps/github.io/src/app/skills/skill-list.data.ts apps/github.io/src/app/skills/skill-rating.tsx apps/github.io/src/app/skills/skill-rating.spec.tsx
git diff --cached
PATH=/tmp/corepack-shims:$PATH git commit -m "feat(github.io): add skill rating model"
```

---

### Task 2: Implement Searchable Astryx Skill List

**Files:**
- Create: `apps/github.io/src/app/skills/skill-logo.tsx`
- Create: `apps/github.io/src/app/skills/skill-list.tsx`
- Test: `apps/github.io/src/app/skills/skill-list.spec.tsx`
- Modify: `apps/github.io/src/styles.css`

**Interfaces:**
- Consumes:
  - `Skill`, `SkillListProps`, `skillCategories` from `skill-list.types.ts`
  - `SkillRating({ level })` from `skill-rating.tsx`
- Produces:
  - `export function SkillLogo({ skill }: { skill: Skill }): JSX.Element`
  - `export function skillMatchesQuery(skill: Skill, query: string): boolean`
  - `export function SkillList({ skills, heading = 'Skills' }: SkillListProps): JSX.Element`

- [ ] **Step 1: Install dependencies in the worktree if needed**

Run:

```bash
test -d node_modules || PATH=/tmp/corepack-shims:$PATH corepack pnpm install --frozen-lockfile
```

Expected: `node_modules` exists. If pnpm fails with a store or network sandbox error, rerun the same command with direct user approval for package-store access.

- [ ] **Step 2: Verify Astryx component import paths**

Run:

```bash
find node_modules/@astryxdesign/core -maxdepth 2 -type f | sort | rg '/(PowerSearch|List|ListItem|Avatar|Badge|EmptyState)\\.(d\\.ts|js|mjs|tsx?)$|/(PowerSearch|List|Avatar|Badge|EmptyState)/'
```

Expected: identify component-specific import paths. Prefer imports in this shape when present:

```tsx
import { Avatar } from '@astryxdesign/core/Avatar';
import { Badge } from '@astryxdesign/core/Badge';
import { List, ListItem } from '@astryxdesign/core/List';
import { PowerSearch } from '@astryxdesign/core/PowerSearch';
```

If `PowerSearch`, `List`, `ListItem`, `Avatar`, or `Badge` export names differ, inspect the matching `.d.ts` files and use the installed names. If a component is absent, use the nearest Astryx primitive available in the package and keep the same external component API.

- [ ] **Step 3: Create the failing skill-list tests**

Create `apps/github.io/src/app/skills/skill-list.spec.tsx`:

```tsx
import { fireEvent, render } from '@testing-library/react';

import { sampleSkills } from './skill-list.data';
import { SkillList, skillMatchesQuery } from './skill-list';

describe('skillMatchesQuery', () => {
  it('matches by name, category, and keyword', () => {
    const react = sampleSkills.find((skill) => skill.id === 'react');
    const terraform = sampleSkills.find((skill) => skill.id === 'terraform');

    expect(react).toBeTruthy();
    expect(terraform).toBeTruthy();
    expect(skillMatchesQuery(react!, 'react')).toBe(true);
    expect(skillMatchesQuery(terraform!, 'IaC')).toBe(true);
    expect(skillMatchesQuery(terraform!, 'provisioning')).toBe(true);
    expect(skillMatchesQuery(terraform!, 'storybook')).toBe(false);
  });
});

describe('SkillList', () => {
  it('renders skill rows with category and rating content', () => {
    const { getByLabelText, getByText } = render(
      <SkillList skills={sampleSkills} />
    );

    expect(getByText('TypeScript')).toBeTruthy();
    expect(getByText('Language')).toBeTruthy();
    expect(getByLabelText('5 out of 5')).toBeTruthy();
  });

  it('filters by search query', () => {
    const { getByLabelText, getByText, queryByText } = render(
      <SkillList skills={sampleSkills} />
    );

    fireEvent.change(getByLabelText('Search skills'), {
      target: { value: 'terraform' },
    });

    expect(getByText('Terraform')).toBeTruthy();
    expect(queryByText('React')).toBeNull();
  });

  it('shows an empty state when no skills match', () => {
    const { getByLabelText, getByText } = render(
      <SkillList skills={sampleSkills} />
    );

    fireEvent.change(getByLabelText('Search skills'), {
      target: { value: 'does-not-exist' },
    });

    expect(getByText('No skills match your search.')).toBeTruthy();
  });
});
```

- [ ] **Step 4: Run the tests to verify they fail**

Run:

```bash
PATH=/tmp/corepack-shims:$PATH NX_DAEMON=false corepack pnpm nx test github.io --skip-nx-cache --runInBand
```

Expected: FAIL because `./skill-list` does not exist.

- [ ] **Step 5: Implement the logo adapter**

Create `apps/github.io/src/app/skills/skill-logo.tsx`.

Use the verified Astryx `Avatar` import from Step 2. If the import below does not match the installed package, replace only the import line and the Avatar props to match the `.d.ts` file while preserving the exported `SkillLogo` signature.

```tsx
import { Avatar } from '@astryxdesign/core/Avatar';

import type { Skill } from './skill-list.types';

interface SkillLogoProps {
  skill: Skill;
}

export function SkillLogo({ skill }: SkillLogoProps) {
  const initials = skill.name
    .split(/\s+/)
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <Avatar
      aria-hidden="true"
      className="skill-logo"
      data-icon-slug={skill.iconSlug}
      name={skill.name}
    >
      {initials}
    </Avatar>
  );
}
```

- [ ] **Step 6: Implement the searchable list**

Create `apps/github.io/src/app/skills/skill-list.tsx`.

Use the verified Astryx imports from Step 2. If `PowerSearch` does not behave like a text input, wrap or configure it so `getByLabelText('Search skills')` resolves to the active search input. If `ListItem` uses a different child API, preserve the same visible content and accessibility contract.

```tsx
import { useMemo, useState } from 'react';
import { Badge } from '@astryxdesign/core/Badge';
import { List, ListItem } from '@astryxdesign/core/List';
import { PowerSearch } from '@astryxdesign/core/PowerSearch';

import { SkillLogo } from './skill-logo';
import { SkillRating } from './skill-rating';
import type { Skill, SkillListProps } from './skill-list.types';

export function skillMatchesQuery(skill: Skill, query: string) {
  const normalizedQuery = query.trim().toLowerCase();

  if (normalizedQuery.length === 0) {
    return true;
  }

  return [skill.name, skill.category, ...skill.keywords].some((value) =>
    value.toLowerCase().includes(normalizedQuery)
  );
}

export function SkillList({ skills, heading = 'Skills' }: SkillListProps) {
  const [query, setQuery] = useState('');
  const filteredSkills = useMemo(
    () => skills.filter((skill) => skillMatchesQuery(skill, query)),
    [query, skills]
  );

  return (
    <section className="skill-list" aria-labelledby="skill-list-heading">
      <div className="skill-list__header">
        <h2 id="skill-list-heading">{heading}</h2>
        <PowerSearch
          aria-label="Search skills"
          placeholder="Search skills"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        />
      </div>

      {filteredSkills.length > 0 ? (
        <List className="skill-list__items" density="compact" dividers>
          {filteredSkills.map((skill) => (
            <ListItem
              key={skill.id}
              startContent={<SkillLogo skill={skill} />}
              endContent={<SkillRating level={skill.level} />}
            >
              <div className="skill-list__item-copy">
                <span className="skill-list__name">{skill.name}</span>
                <Badge>{skill.category}</Badge>
              </div>
            </ListItem>
          ))}
        </List>
      ) : (
        <p className="skill-list__empty">No skills match your search.</p>
      )}
    </section>
  );
}
```

- [ ] **Step 7: Add minimal layout styles**

Append to `apps/github.io/src/styles.css`:

```css
.skill-list {
  display: grid;
  gap: var(--spacing-4);
}

.skill-list__header {
  display: grid;
  gap: var(--spacing-3);
}

.skill-list__header h2 {
  margin: 0;
  font-size: var(--font-size-2xl);
}

.skill-list__items {
  width: 100%;
}

.skill-list__item-copy {
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
  min-width: 0;
}

.skill-list__name {
  overflow: hidden;
  font-weight: 700;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.skill-logo {
  flex: 0 0 auto;
}

.skill-rating {
  display: inline-flex;
  flex: 0 0 auto;
  gap: 1px;
  color: var(--color-text-primary);
  letter-spacing: 0;
  white-space: nowrap;
}

.skill-list__empty {
  margin: 0;
  color: var(--color-text-secondary);
}

@media (max-width: 640px) {
  .skill-list__item-copy {
    align-items: flex-start;
    flex-direction: column;
  }
}
```

- [ ] **Step 8: Run tests and fix only API mismatches**

Run:

```bash
PATH=/tmp/corepack-shims:$PATH NX_DAEMON=false corepack pnpm nx test github.io --skip-nx-cache --runInBand
```

Expected: PASS. If TypeScript fails because Astryx prop names differ, update only the imports/props in `skill-logo.tsx` and `skill-list.tsx` to match the installed `.d.ts` files. Do not replace the component with custom cards.

- [ ] **Step 9: Commit Task 2**

Run:

```bash
git status --short
git diff -- apps/github.io/src/app/skills/skill-logo.tsx apps/github.io/src/app/skills/skill-list.tsx apps/github.io/src/app/skills/skill-list.spec.tsx apps/github.io/src/styles.css
git add apps/github.io/src/app/skills/skill-logo.tsx apps/github.io/src/app/skills/skill-list.tsx apps/github.io/src/app/skills/skill-list.spec.tsx apps/github.io/src/styles.css
git diff --cached
PATH=/tmp/corepack-shims:$PATH git commit -m "feat(github.io): add searchable skill list"
```

---

### Task 3: Add Storybook Coverage and Final Verification

**Files:**
- Create: `apps/github.io/src/app/skills/skill-list.stories.tsx`

**Interfaces:**
- Consumes:
  - `SkillList({ skills, heading })`
  - `sampleSkills`
- Produces:
  - Storybook title `GitHub.io/Skills/Skill List`
  - Stories `Default`, `Empty`, and `FocusedResults`

- [ ] **Step 1: Create the Storybook stories**

Create `apps/github.io/src/app/skills/skill-list.stories.tsx`:

```tsx
import type { Meta, StoryObj } from '@storybook/react-vite';

import { sampleSkills } from './skill-list.data';
import { SkillList } from './skill-list';

const meta: Meta<typeof SkillList> = {
  component: SkillList,
  title: 'GitHub.io/Skills/Skill List',
};

export default meta;
type Story = StoryObj<typeof SkillList>;

export const Default: Story = {
  args: {
    heading: 'Skills',
    skills: sampleSkills,
  },
};

export const Empty: Story = {
  args: {
    heading: 'Skills',
    skills: [],
  },
};

export const FocusedResults: Story = {
  args: {
    heading: 'Infrastructure Skills',
    skills: sampleSkills.filter((skill) =>
      ['Cloud', 'Container', 'CI/CD', 'IaC'].includes(skill.category)
    ),
  },
};
```

- [ ] **Step 2: Run component tests**

Run:

```bash
PATH=/tmp/corepack-shims:$PATH NX_DAEMON=false corepack pnpm nx test github.io --skip-nx-cache --runInBand
```

Expected: PASS.

- [ ] **Step 3: Run lint**

Run:

```bash
PATH=/tmp/corepack-shims:$PATH NX_DAEMON=false corepack pnpm nx lint github.io --skip-nx-cache
```

Expected: PASS.

- [ ] **Step 4: Build the app**

Run:

```bash
PATH=/tmp/corepack-shims:$PATH NX_DAEMON=false corepack pnpm nx build github.io --skip-nx-cache
```

Expected: PASS.

- [ ] **Step 5: Build Storybook**

Run:

```bash
PATH=/tmp/corepack-shims:$PATH NX_DAEMON=false corepack pnpm nx build-storybook github.io --skip-nx-cache
```

Expected: PASS.

- [ ] **Step 6: Commit Task 3**

Run:

```bash
git status --short
git diff -- apps/github.io/src/app/skills/skill-list.stories.tsx
git add apps/github.io/src/app/skills/skill-list.stories.tsx
git diff --cached
PATH=/tmp/corepack-shims:$PATH git commit -m "feat(github.io): add skill list stories"
```

---

## Final Review

- Run `git status --short --branch` and confirm only intended committed changes remain.
- Run a final diff against `main` with `git diff main...HEAD --stat`.
- Request code review with `superpowers:requesting-code-review`.
- Address review findings in separate fix commits.
- Use `superpowers:verification-before-completion` before reporting implementation complete.
