# Skill Carousel Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build reusable `SkillCarousel` and `SkillCard` components that render expanded skill descriptions and optional certification citations.

**Architecture:** Expand the existing `Skill` domain model so all skill views share one source of truth. Add `SkillCard` as the reusable item renderer and `SkillCarousel` as a thin Astryx `Carousel` wrapper that maps skills to cards or renders the existing empty-state treatment.

**Tech Stack:** React 19, TypeScript, Nx, Vite/Vitest, Storybook, Astryx core components, StyleX, pnpm.

## Global Constraints

- Work in `/home/benkim0414/workspace/benkim0414/.worktrees/feat-skill-carousel` on branch `feat/skill-carousel`.
- Expand the existing `Skill` model; do not create carousel-specific skill data.
- One skill may have zero, one, or many certification citations.
- Do not change `SkillSection`, `SkillList`, or search/filter behavior.
- Do not add a page-level section or visible heading for the carousel.
- Do not add visible carousel labels or visible certification footer labels.
- Non-visible accessibility labels, such as `aria-label`, are acceptable when needed by Astryx or screen reader clarity.
- Reuse Astryx `Carousel`, Astryx `Card`, Astryx layout primitives, and existing `CertificationCitation`.
- Use StyleX for component-specific layout and sizing with Astryx token variables.
- Keep Tailwind limited to wrapper-level layout if needed.
- Do not add global CSS for these components.
- Stage explicit paths only. Do not use `git add -A`, `git add --all`, `git add -u`, `git add .`, `git commit -a`, or `git commit -am`.
- Verification caveat: `pnpm nx show project github.io` failed in the sandbox because pnpm attempted to open/write its external store database. During implementation, run focused commands normally first; if pnpm/Nx fails with the same store/cache error, request direct approval before rerunning.

---

## File Structure

- Modify: `apps/github.io/src/app/skills/skill-list.types.ts`
  - Add `SkillCertification`.
  - Add `description` and optional `certifications` to `Skill`.
- Modify: `apps/github.io/src/app/skills/skill-list.data.ts`
  - Add descriptions to every `sampleSkills` item.
  - Add a Kubernetes sample skill with multiple certifications if no equivalent fixture exists.
- Create: `apps/github.io/src/app/skills/skill-card.tsx`
  - Render one skill as an Astryx card.
  - Map optional certifications to `CertificationCitation`.
- Create: `apps/github.io/src/app/skills/skill-card.spec.tsx`
  - Test title, description, absent footer, and multiple citations.
- Create: `apps/github.io/src/app/skills/skill-card.stories.tsx`
  - Story variants for no certification and multiple certifications.
- Create: `apps/github.io/src/app/skills/skill-carousel.tsx`
  - Render empty state or Astryx carousel of skill cards.
- Create: `apps/github.io/src/app/skills/skill-carousel.spec.tsx`
  - Test card count and empty state.
- Create: `apps/github.io/src/app/skills/skill-carousel.stories.tsx`
  - Story variants for populated and empty carousel.
- Existing tests to rerun:
  - `apps/github.io/src/app/skills/skill-list.spec.tsx`
  - `apps/github.io/src/app/skills/skill-search.spec.tsx`
  - `apps/github.io/src/app/skills/skill-section.spec.tsx`

---

### Task 1: Expand Skill Model and Fixtures

**Files:**
- Modify: `apps/github.io/src/app/skills/skill-list.types.ts`
- Modify: `apps/github.io/src/app/skills/skill-list.data.ts`
- Test: `apps/github.io/src/app/skills/skill-list.spec.tsx`
- Test: `apps/github.io/src/app/skills/skill-search.spec.tsx`
- Test: `apps/github.io/src/app/skills/skill-section.spec.tsx`

**Interfaces:**
- Produces:
  - `export interface SkillCertification { title: string; url: string; skills: readonly string[]; expiresAt: string; }`
  - `Skill.description: string`
  - `Skill.certifications?: readonly SkillCertification[]`
  - `sampleSkills: readonly Skill[]` with every item containing a description
- Consumes:
  - Existing `Skill` consumers continue using `id`, `name`, `category`, `level`, `iconSlug`, and `keywords`.

- [ ] **Step 1: Update the type definition**

Replace the bottom of `skill-list.types.ts` with this shape while preserving the existing `skillCategories` array:

```ts
export interface SkillCertification {
  title: string;
  url: string;
  skills: readonly string[];
  expiresAt: string;
}

export interface Skill {
  id: string;
  name: string;
  description: string;
  category: SkillCategory;
  level: 1 | 2 | 3 | 4 | 5;
  iconSlug: string;
  keywords: readonly string[];
  certifications?: readonly SkillCertification[];
}

export interface SkillListProps {
  skills: readonly Skill[];
  heading?: string;
  emptyMessage?: string;
  isHeadingHidden?: boolean;
}
```

- [ ] **Step 2: Update sample skill data**

Add a short description to every existing skill. Add a Kubernetes fixture with multiple certifications so card and carousel stories/tests can use production-shaped data:

```ts
{
  id: 'kubernetes',
  name: 'Kubernetes',
  description:
    'Container orchestration for deploying, scaling, and operating cloud-native workloads.',
  category: 'Container',
  level: 4,
  iconSlug: 'kubernetes',
  keywords: ['containers', 'orchestration', 'platform', 'cloud native'],
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
}
```

Use stable public example URLs under `https://example.com/` until real certificate URLs are available in repository data.

- [ ] **Step 3: Run existing skill tests**

Run:

```bash
pnpm nx test github.io -- --run apps/github.io/src/app/skills/skill-list.spec.tsx apps/github.io/src/app/skills/skill-search.spec.tsx apps/github.io/src/app/skills/skill-section.spec.tsx
```

Expected: tests pass. If the command shape is rejected by Nx/Vitest, run the project test target instead:

```bash
pnpm nx test github.io
```

- [ ] **Step 4: Inspect the diff**

Run:

```bash
git diff -- apps/github.io/src/app/skills/skill-list.types.ts apps/github.io/src/app/skills/skill-list.data.ts
```

Expected: the diff only expands the type and fixture data.

- [ ] **Step 5: Commit**

Run:

```bash
git add apps/github.io/src/app/skills/skill-list.types.ts apps/github.io/src/app/skills/skill-list.data.ts
git diff --cached
git commit -m "feat(github.io): expand skill model for citations"
```

---

### Task 2: Build SkillCard

**Files:**
- Create: `apps/github.io/src/app/skills/skill-card.tsx`
- Create: `apps/github.io/src/app/skills/skill-card.spec.tsx`

**Interfaces:**
- Consumes:
  - `Skill` from `./skill-list.types`
  - `CertificationCitation` from `../certifications/certification-citation`
- Produces:
  - `export interface SkillCardProps { skill: Skill; }`
  - `export function SkillCard({ skill }: SkillCardProps): ReactElement`

- [ ] **Step 1: Write the failing tests**

Create `skill-card.spec.tsx`:

```tsx
import { render } from '@testing-library/react';

import { SkillCard } from './skill-card';
import type { Skill } from './skill-list.types';

const baseSkill: Skill = {
  id: 'kubernetes',
  name: 'Kubernetes',
  description:
    'Container orchestration for deploying, scaling, and operating cloud-native workloads.',
  category: 'Container',
  level: 4,
  iconSlug: 'kubernetes',
  keywords: ['containers', 'orchestration'],
};

describe('SkillCard', () => {
  it('renders the skill name as the title', () => {
    const { getByRole } = render(<SkillCard skill={baseSkill} />);

    expect(getByRole('heading', { name: 'Kubernetes' })).toBeTruthy();
  });

  it('renders the skill description as supporting text', () => {
    const { getByText } = render(<SkillCard skill={baseSkill} />);

    expect(
      getByText(
        'Container orchestration for deploying, scaling, and operating cloud-native workloads.',
      ),
    ).toBeTruthy();
  });

  it('omits certification citations when the skill has no certifications', () => {
    const { container } = render(<SkillCard skill={baseSkill} />);

    expect(
      container.querySelector('[data-testid="certification-citation"]'),
    ).toBeNull();
  });

  it('renders multiple certification citations at the bottom of the card', () => {
    const { getByRole, getAllByTestId } = render(
      <SkillCard
        skill={{
          ...baseSkill,
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
        }}
      />,
    );

    expect(getAllByTestId('certification-citation')).toHaveLength(3);
    expect(getByRole('doc-noteref', { name: 'Citation 1: KCNA' })).toBeTruthy();
    expect(getByRole('doc-noteref', { name: 'Citation 2: CKA' })).toBeTruthy();
    expect(getByRole('doc-noteref', { name: 'Citation 3: CKAD' })).toBeTruthy();
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run:

```bash
pnpm nx test github.io -- --run apps/github.io/src/app/skills/skill-card.spec.tsx
```

Expected: fail because `./skill-card` does not exist.

- [ ] **Step 3: Implement `SkillCard`**

Create `skill-card.tsx`:

```tsx
import * as stylex from '@stylexjs/stylex';
import { Card } from '@astryxdesign/core/Card';
import { VStack } from '@astryxdesign/core/Layout';
import {
  colorVars,
  spacingVars,
  typeScaleVars,
} from '@astryxdesign/core/theme/tokens.stylex';
import type { ReactElement } from 'react';

import { CertificationCitation } from '../certifications/certification-citation';
import type { Skill } from './skill-list.types';

export interface SkillCardProps {
  skill: Skill;
}

const styles = stylex.create({
  root: {
    display: 'block',
    width: {
      default: `calc(${spacingVars['--spacing-12']} * 7)`,
      '@media (max-width: 640px)': `calc(${spacingVars['--spacing-12']} * 5)`,
    },
    minHeight: `calc(${spacingVars['--spacing-12']} * 4)`,
  },
  title: {
    margin: 0,
    color: colorVars['--color-text-primary'],
    fontSize: typeScaleVars['--text-heading-3-size'],
    lineHeight: typeScaleVars['--text-heading-3-leading'],
  },
  description: {
    margin: 0,
    color: colorVars['--color-text-secondary'],
    fontSize: typeScaleVars['--text-body-size'],
    lineHeight: typeScaleVars['--text-body-leading'],
  },
  citationList: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: spacingVars['--spacing-2'],
    padding: 0,
    margin: 0,
    listStyle: 'none',
  },
  citationItem: {
    display: 'inline-flex',
    maxWidth: '100%',
  },
});

export function SkillCard({ skill }: SkillCardProps): ReactElement {
  const certifications = skill.certifications ?? [];

  return (
    <Card padding={4} xstyle={styles.root}>
      <article aria-labelledby={`${skill.id}-skill-card-title`}>
        <VStack gap={3}>
          <VStack gap={1}>
            <h3 id={`${skill.id}-skill-card-title`} {...stylex.props(styles.title)}>
              {skill.name}
            </h3>
            <p {...stylex.props(styles.description)}>{skill.description}</p>
          </VStack>

          {certifications.length > 0 ? (
            <ul {...stylex.props(styles.citationList)}>
              {certifications.map((certification, index) => (
                <li {...stylex.props(styles.citationItem)} key={certification.title}>
                  <CertificationCitation {...certification} number={index + 1} />
                </li>
              ))}
            </ul>
          ) : null}
        </VStack>
      </article>
    </Card>
  );
}
```

If `Card` does not accept `xstyle` in this app’s installed Astryx version, move `styles.root` to a wrapping `<div>` around `Card` and keep the card itself as the Astryx surface.

- [ ] **Step 4: Run card tests**

Run:

```bash
pnpm nx test github.io -- --run apps/github.io/src/app/skills/skill-card.spec.tsx
```

Expected: pass.

- [ ] **Step 5: Inspect the diff**

Run:

```bash
git diff -- apps/github.io/src/app/skills/skill-card.tsx apps/github.io/src/app/skills/skill-card.spec.tsx
```

Expected: the diff only adds the new component and its focused tests.

- [ ] **Step 6: Commit**

Run:

```bash
git add apps/github.io/src/app/skills/skill-card.tsx apps/github.io/src/app/skills/skill-card.spec.tsx
git diff --cached
git commit -m "feat(github.io): add skill card"
```

---

### Task 3: Build SkillCarousel

**Files:**
- Create: `apps/github.io/src/app/skills/skill-carousel.tsx`
- Create: `apps/github.io/src/app/skills/skill-carousel.spec.tsx`

**Interfaces:**
- Consumes:
  - `SkillCard` from `./skill-card`
  - `Skill` from `./skill-list.types`
- Produces:
  - `export interface SkillCarouselProps { skills: readonly Skill[]; emptyMessage?: string; }`
  - `export function SkillCarousel({ skills, emptyMessage }: SkillCarouselProps): ReactElement`

- [ ] **Step 1: Write the failing tests**

Create `skill-carousel.spec.tsx`:

```tsx
import { render } from '@testing-library/react';

import { SkillCarousel } from './skill-carousel';
import { sampleSkills } from './skill-list.data';

describe('SkillCarousel', () => {
  it('renders one skill card for each supplied skill', () => {
    const { getAllByTestId, getByRole } = render(
      <SkillCarousel skills={sampleSkills.slice(0, 3)} />,
    );

    expect(getAllByTestId('skill-card')).toHaveLength(3);
    expect(getByRole('heading', { name: sampleSkills[0].name })).toBeTruthy();
    expect(getByRole('heading', { name: sampleSkills[1].name })).toBeTruthy();
    expect(getByRole('heading', { name: sampleSkills[2].name })).toBeTruthy();
  });

  it('renders an empty state when no skills are supplied', () => {
    const { getByRole, getByText, queryByTestId } = render(
      <SkillCarousel skills={[]} />,
    );

    expect(getByRole('status')).toBeTruthy();
    expect(getByText('No skills have been supplied.')).toBeTruthy();
    expect(queryByTestId('skill-card')).toBeNull();
  });

  it('uses a non-visible carousel accessibility label without rendering a visible label', () => {
    const { getByLabelText, queryByRole } = render(
      <SkillCarousel skills={sampleSkills.slice(0, 2)} />,
    );

    expect(getByLabelText('Skills carousel')).toBeTruthy();
    expect(queryByRole('heading', { name: 'Skills carousel' })).toBeNull();
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run:

```bash
pnpm nx test github.io -- --run apps/github.io/src/app/skills/skill-carousel.spec.tsx
```

Expected: fail because `./skill-carousel` does not exist.

- [ ] **Step 3: Add `data-testid` to `SkillCard`**

In `skill-card.tsx`, add the test id to the outer semantic card element:

```tsx
<article
  aria-labelledby={`${skill.id}-skill-card-title`}
  data-testid="skill-card"
>
```

- [ ] **Step 4: Implement `SkillCarousel`**

Create `skill-carousel.tsx`:

```tsx
import { Carousel } from '@astryxdesign/core/Carousel';
import { EmptyState } from '@astryxdesign/core/EmptyState';
import type { ReactElement } from 'react';

import { SkillCard } from './skill-card';
import type { Skill } from './skill-list.types';

export interface SkillCarouselProps {
  skills: readonly Skill[];
  emptyMessage?: string;
}

export function SkillCarousel({
  skills,
  emptyMessage = 'No skills have been supplied.',
}: SkillCarouselProps): ReactElement {
  if (skills.length === 0) {
    return <EmptyState headingLevel={3} isCompact title={emptyMessage} />;
  }

  return (
    <Carousel aria-label="Skills carousel" gap={3} hasSnap>
      {skills.map((skill) => (
        <SkillCard key={skill.id} skill={skill} />
      ))}
    </Carousel>
  );
}
```

The `aria-label` is intentionally non-visible. Do not add visible text labelled “Skills carousel”.

- [ ] **Step 5: Run carousel and card tests**

Run:

```bash
pnpm nx test github.io -- --run apps/github.io/src/app/skills/skill-card.spec.tsx apps/github.io/src/app/skills/skill-carousel.spec.tsx
```

Expected: pass.

- [ ] **Step 6: Inspect the diff**

Run:

```bash
git diff -- apps/github.io/src/app/skills/skill-card.tsx apps/github.io/src/app/skills/skill-carousel.tsx apps/github.io/src/app/skills/skill-carousel.spec.tsx
```

Expected: the diff only updates `SkillCard` with `data-testid` and adds the carousel component/tests.

- [ ] **Step 7: Commit**

Run:

```bash
git add apps/github.io/src/app/skills/skill-card.tsx apps/github.io/src/app/skills/skill-carousel.tsx apps/github.io/src/app/skills/skill-carousel.spec.tsx
git diff --cached
git commit -m "feat(github.io): add skill carousel"
```

---

### Task 4: Add Stories and Run Focused Validation

**Files:**
- Create: `apps/github.io/src/app/skills/skill-card.stories.tsx`
- Create: `apps/github.io/src/app/skills/skill-carousel.stories.tsx`
- Test: new and existing skill component specs

**Interfaces:**
- Consumes:
  - `SkillCard`
  - `SkillCarousel`
  - `sampleSkills`
- Produces:
  - Storybook coverage for no-certification card, multiple-certification card, populated carousel, and empty carousel.

- [ ] **Step 1: Create `skill-card.stories.tsx`**

```tsx
import type { Meta, StoryObj } from '@storybook/react-vite';

import { sampleSkills } from './skill-list.data';
import { SkillCard } from './skill-card';

const kubernetes =
  sampleSkills.find((skill) => skill.id === 'kubernetes') ?? sampleSkills[0];
const typeScript =
  sampleSkills.find((skill) => skill.id === 'typescript') ?? sampleSkills[0];

const meta: Meta<typeof SkillCard> = {
  component: SkillCard,
  title: 'GitHub.io/Skills/Skill Card',
};

export default meta;
type Story = StoryObj<typeof SkillCard>;

export const WithoutCertifications: Story = {
  args: {
    skill: typeScript,
  },
};

export const WithMultipleCertifications: Story = {
  args: {
    skill: kubernetes,
  },
};
```

- [ ] **Step 2: Create `skill-carousel.stories.tsx`**

```tsx
import type { Meta, StoryObj } from '@storybook/react-vite';

import { sampleSkills } from './skill-list.data';
import { SkillCarousel } from './skill-carousel';

const meta: Meta<typeof SkillCarousel> = {
  component: SkillCarousel,
  title: 'GitHub.io/Skills/Skill Carousel',
};

export default meta;
type Story = StoryObj<typeof SkillCarousel>;

export const Default: Story = {
  args: {
    skills: sampleSkills,
  },
};

export const Empty: Story = {
  args: {
    skills: [],
  },
};
```

- [ ] **Step 3: Run focused skill tests**

Run:

```bash
pnpm nx test github.io -- --run apps/github.io/src/app/skills/skill-card.spec.tsx apps/github.io/src/app/skills/skill-carousel.spec.tsx apps/github.io/src/app/skills/skill-list.spec.tsx apps/github.io/src/app/skills/skill-search.spec.tsx apps/github.io/src/app/skills/skill-section.spec.tsx
```

Expected: pass.

- [ ] **Step 4: Run app validation**

Run:

```bash
pnpm nx lint github.io
pnpm nx test github.io
pnpm nx build github.io
```

Expected: pass. If `pnpm nx` fails with the external pnpm store/cache database error seen during planning, request direct approval before rerunning the same command unsandboxed and document the approval result.

- [ ] **Step 5: Inspect the complete implementation diff**

Run:

```bash
git diff -- apps/github.io/src/app/skills docs/superpowers/plans/2026-07-28-skill-carousel.md
```

Expected: the implementation diff is limited to the skill model, skill data, new components, tests, stories, and this plan.

- [ ] **Step 6: Commit stories and validation**

Run:

```bash
git add apps/github.io/src/app/skills/skill-card.stories.tsx apps/github.io/src/app/skills/skill-carousel.stories.tsx
git diff --cached
git commit -m "docs(github.io): add skill carousel stories"
```

If validation fixes are needed, stage only the affected explicit paths and use a separate conventional commit subject that describes the fix.

---

## Plan Self-Review

- Spec coverage: covered model expansion, reusable card, reusable carousel, Astryx reuse, no visible labels, multiple certifications, tests, stories, and validation.
- Red-flag scan: all steps include concrete files, commands, or code.
- Type consistency: `SkillCertification`, `Skill`, `SkillCardProps`, and `SkillCarouselProps` are defined before use and reused consistently across tasks.
- Scope check: the plan avoids page placement, search/filter behavior, `SkillSection` changes, global CSS, and visible carousel/footer labels.
