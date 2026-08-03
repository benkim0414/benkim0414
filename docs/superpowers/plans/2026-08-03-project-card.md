# Project Card Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a reusable Astryx-aligned `ProjectCard` for portfolio projects with title, description, skills used, and a GitHub repository link.

**Architecture:** Add a new `projects` feature area under `apps/github.io/src/app/projects/`. Keep project presentation owned by a standalone `Project` model, while reserving optional evidence-link fields for future DevOps capability evidence integration. Reuse existing Astryx primitives, `SkillToken`, and `getSkillBrand('GitHub')`.

**Tech Stack:** React 19, TypeScript, Nx, Vitest, Testing Library, Storybook, Astryx Design, StyleX, Simple Icons via existing skill branding helpers.

## Global Constraints

- Use Astryx components for component anatomy, surface, typography, and spacing where matching APIs exist.
- Use StyleX only for narrow structural overrides such as wrapping lists and layout reset.
- Keep Tailwind out of reusable component internals.
- Project title uses `Heading level={3}`.
- Project description uses `Text type="body" color="secondary" as="p"`.
- Visible label text always uses `Text type="supporting" color="secondary" as="p"`.
- Skills render through the existing `SkillToken`.
- The GitHub repository link renders through Astryx `Citation variant="label"`.
- Use `getSkillBrand('GitHub')` for the repository icon.
- Do not build the full projects page in this implementation.
- Do not link DevOps capability evidence to projects in this implementation.
- Do not change the DevOps capability evidence data model in this implementation.
- Do not support non-GitHub source links in this implementation.
- Do not change Astryx theme files or global app styling.
- Stage explicit paths only when committing.

---

## File Structure

- Create `apps/github.io/src/app/projects/project-list.types.ts`
  - Owns the `Project` and `ProjectSkill` interfaces.
- Create `apps/github.io/src/app/projects/project-list.data.ts`
  - Provides representative static project fixtures for Storybook and future page composition.
- Create `apps/github.io/src/app/projects/project-card.tsx`
  - Owns `ProjectCard`, card layout, GitHub citation source derivation, and structural StyleX for wrapping skill tokens.
- Create `apps/github.io/src/app/projects/project-card.spec.tsx`
  - Tests the public rendering contract and accessibility behavior.
- Create `apps/github.io/src/app/projects/project-card.stories.tsx`
  - Adds Storybook coverage for normal, dense, long-copy, and mobile/full-width states.

### Task 1: Project Data Model

**Files:**
- Create: `apps/github.io/src/app/projects/project-list.types.ts`
- Create: `apps/github.io/src/app/projects/project-list.data.ts`
- Test: `apps/github.io/src/app/projects/project-card.spec.tsx`

**Interfaces:**
- Produces:
  - `ProjectSkill`: `{ label: string; brandLabel?: string }`
  - `Project`: `{ id: string; title: string; description: string; skills: readonly ProjectSkill[]; githubUrl: string; evidenceIds?: readonly string[]; capabilityKeys?: readonly string[] }`
  - `sampleProjects: readonly Project[]`
- Later tasks consume `Project` and `sampleProjects`.

- [ ] **Step 1: Write the failing data contract test**

Create `apps/github.io/src/app/projects/project-card.spec.tsx`:

```tsx
import { describe, expect, it } from 'vitest';

import { sampleProjects } from './project-list.data';

describe('project data', () => {
  it('provides stable project data for ProjectCard surfaces', () => {
    expect(sampleProjects).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: 'github-io-portfolio',
          title: 'GitHub.io portfolio',
          githubUrl: 'https://github.com/benkim0414/benkim0414',
          skills: expect.arrayContaining([
            expect.objectContaining({ label: 'React' }),
            expect.objectContaining({ label: 'TypeScript' }),
            expect.objectContaining({ label: 'GitHub' }),
          ]),
        }),
      ]),
    );
  });

  it('keeps future evidence linkage as optional project metadata', () => {
    const project = sampleProjects.find(
      (item) => item.id === 'github-io-portfolio',
    );

    expect(project?.evidenceIds).toEqual(
      expect.arrayContaining(['devops-roadmap-project']),
    );
    expect(project?.capabilityKeys).toEqual(
      expect.arrayContaining(['deployment-automation']),
    );
  });
});
```

- [ ] **Step 2: Run the focused test to verify it fails**

Run:

```sh
pnpm nx test github.io -- --run apps/github.io/src/app/projects/project-card.spec.tsx
```

Expected: fail because `project-list.data` does not exist.

- [ ] **Step 3: Add the project types**

Create `apps/github.io/src/app/projects/project-list.types.ts`:

```ts
export interface ProjectSkill {
  label: string;
  brandLabel?: string;
}

export interface Project {
  id: string;
  title: string;
  description: string;
  skills: readonly ProjectSkill[];
  githubUrl: string;
  evidenceIds?: readonly string[];
  capabilityKeys?: readonly string[];
}
```

- [ ] **Step 4: Add representative project data**

Create `apps/github.io/src/app/projects/project-list.data.ts`:

```ts
import type { Project } from './project-list.types';

export const sampleProjects: readonly Project[] = [
  {
    id: 'github-io-portfolio',
    title: 'GitHub.io portfolio',
    description:
      'Personal portfolio built with React, TypeScript, Nx, Astryx, StyleX, and GitHub Pages to present skills, certifications, and DevOps capability evidence.',
    skills: [
      { label: 'React' },
      { label: 'TypeScript' },
      { label: 'Nx' },
      { label: 'Astryx' },
      { label: 'StyleX' },
      { label: 'GitHub' },
      { label: 'GitHub Actions' },
    ],
    githubUrl: 'https://github.com/benkim0414/benkim0414',
    evidenceIds: ['devops-roadmap-project'],
    capabilityKeys: ['deployment-automation'],
  },
];
```

- [ ] **Step 5: Run the focused test to verify it passes**

Run:

```sh
pnpm nx test github.io -- --run apps/github.io/src/app/projects/project-card.spec.tsx
```

Expected: pass.

- [ ] **Step 6: Commit the data model**

Run:

```sh
git status --short
git diff
git add apps/github.io/src/app/projects/project-list.types.ts apps/github.io/src/app/projects/project-list.data.ts apps/github.io/src/app/projects/project-card.spec.tsx
git diff --cached
git commit -m "feat(github.io): add project data model"
```

### Task 2: ProjectCard Component

**Files:**
- Modify: `apps/github.io/src/app/projects/project-card.spec.tsx`
- Create: `apps/github.io/src/app/projects/project-card.tsx`

**Interfaces:**
- Consumes:
  - `Project` from `./project-list.types`
  - `SkillToken` from `../skills/skill-token`
  - `getSkillBrand(label: string)` from `../skills/skill-brand`
- Produces:
  - `ProjectCardProps`: `{ isFullWidth?: boolean; project: Project }`
  - `ProjectCard({ isFullWidth, project }: ProjectCardProps): ReactElement`

- [ ] **Step 1: Add failing ProjectCard rendering tests**

Append these imports to `apps/github.io/src/app/projects/project-card.spec.tsx`:

```tsx
import { render, screen, within } from '@testing-library/react';

import { ProjectCard } from './project-card';
```

Append these tests inside the existing `describe('project data', ...)` block or create a second `describe('ProjectCard', ...)` block in the same file:

```tsx
describe('ProjectCard', () => {
  const project = sampleProjects[0];

  it('renders the project title, description, skills, and GitHub source', () => {
    render(<ProjectCard project={project} />);

    expect(
      screen.getByRole('article', { name: project.title }),
    ).toBeTruthy();
    expect(
      screen.getByRole('heading', { name: project.title, level: 3 }),
    ).toBeTruthy();
    expect(screen.getByText(project.description)).toBeTruthy();

    const skills = screen.getByRole('list', { name: 'Skills used' });
    expect(within(skills).getByText('React')).toBeTruthy();
    expect(within(skills).getByText('TypeScript')).toBeTruthy();
    expect(within(skills).getByText('GitHub')).toBeTruthy();

    const source = screen.getByRole('link', {
      name: /github repository/i,
    });
    expect(source).toHaveAttribute('href', project.githubUrl);
  });

  it('renders card section labels as supporting secondary text', () => {
    const { container } = render(<ProjectCard project={project} />);

    const labels = Array.from(container.querySelectorAll('p')).filter((node) =>
      ['Skills used', 'Source'].includes(node.textContent ?? ''),
    );

    expect(labels).toHaveLength(2);
    for (const label of labels) {
      expect(label.className).toContain('astryx-text');
    }
  });

  it('uses the GitHub brand icon for the repository citation', () => {
    const { container } = render(<ProjectCard project={project} />);

    const githubIcon = container.querySelector(
      'img[src^="data:image/svg+xml"]',
    );

    expect(githubIcon).toBeTruthy();
  });

  it('supports full-width cards without changing content', () => {
    render(<ProjectCard isFullWidth project={project} />);

    expect(
      screen.getByRole('heading', { name: project.title, level: 3 }),
    ).toBeTruthy();
    expect(
      screen.getByRole('link', { name: /github repository/i }),
    ).toHaveAttribute('href', project.githubUrl);
  });
});
```

- [ ] **Step 2: Run the focused test to verify it fails**

Run:

```sh
pnpm nx test github.io -- --run apps/github.io/src/app/projects/project-card.spec.tsx
```

Expected: fail because `project-card.tsx` does not exist.

- [ ] **Step 3: Implement ProjectCard**

Create `apps/github.io/src/app/projects/project-card.tsx`:

```tsx
import { Card } from '@astryxdesign/core/Card';
import { Citation } from '@astryxdesign/core/Citation';
import { Heading } from '@astryxdesign/core/Heading';
import { VStack } from '@astryxdesign/core/Layout';
import { Text } from '@astryxdesign/core/Text';
import { spacingVars } from '@astryxdesign/core/theme/tokens.stylex';
import * as stylex from '@stylexjs/stylex';
import { useId, type ReactElement } from 'react';

import { getSkillBrand } from '../skills/skill-brand';
import { SkillToken } from '../skills/skill-token';
import type { Project } from './project-list.types';

export interface ProjectCardProps {
  isFullWidth?: boolean;
  project: Project;
}

const styles = stylex.create({
  root: {
    display: 'block',
    width: {
      default: `calc(${spacingVars['--spacing-12']} * 7)`,
      '@media (max-width: 640px)': `calc(${spacingVars['--spacing-12']} * 5)`,
    },
  },
  fullWidth: {
    width: '100%',
  },
  skillList: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: spacingVars['--spacing-2'],
    padding: 0,
    margin: 0,
    listStyle: 'none',
  },
  skillItem: {
    display: 'inline-flex',
    maxWidth: '100%',
  },
});

export function ProjectCard({
  isFullWidth = false,
  project,
}: ProjectCardProps): ReactElement {
  const titleId = useId();
  const githubBrand = getSkillBrand('GitHub');
  const githubSource = {
    title: 'GitHub repository',
    url: project.githubUrl,
    icon: githubBrand?.iconDataUrl,
  };

  return (
    <Card
      padding={4}
      xstyle={[styles.root, isFullWidth && styles.fullWidth]}
    >
      <article aria-labelledby={titleId} data-testid="project-card">
        <VStack gap={4}>
          <VStack gap={2} hAlign="start">
            <Heading id={titleId} level={3}>
              {project.title}
            </Heading>
            <Text type="body" color="secondary" as="p">
              {project.description}
            </Text>
          </VStack>

          <VStack gap={2} hAlign="start">
            <Text type="supporting" color="secondary" as="p">
              Skills used
            </Text>
            <ul aria-label="Skills used" {...stylex.props(styles.skillList)}>
              {project.skills.map((skill) => (
                <li
                  key={`${skill.label}-${skill.brandLabel ?? skill.label}`}
                  {...stylex.props(styles.skillItem)}
                >
                  <SkillToken
                    label={skill.label}
                    brandLabel={skill.brandLabel}
                  />
                </li>
              ))}
            </ul>
          </VStack>

          <VStack gap={2} hAlign="start">
            <Text type="supporting" color="secondary" as="p">
              Source
            </Text>
            <Citation number={1} source={githubSource} variant="label" />
          </VStack>
        </VStack>
      </article>
    </Card>
  );
}
```

- [ ] **Step 4: Run the focused test to verify it passes**

Run:

```sh
pnpm nx test github.io -- --run apps/github.io/src/app/projects/project-card.spec.tsx
```

Expected: pass. If the GitHub icon assertion fails because Astryx renders citation icons as CSS background images rather than `img`, inspect the existing `CertificationCitation` tests and update the assertion to match the installed Astryx `Citation` contract without changing production behavior.

- [ ] **Step 5: Run lint for import/type issues**

Run:

```sh
pnpm nx lint github.io
```

Expected: pass.

- [ ] **Step 6: Commit the component**

Run:

```sh
git status --short
git diff
git add apps/github.io/src/app/projects/project-card.tsx apps/github.io/src/app/projects/project-card.spec.tsx
git diff --cached
git commit -m "feat(github.io): add project card"
```

### Task 3: Storybook Coverage

**Files:**
- Create: `apps/github.io/src/app/projects/project-card.stories.tsx`
- Modify: `apps/github.io/src/app/projects/project-card.spec.tsx`

**Interfaces:**
- Consumes:
  - `ProjectCard` from `./project-card`
  - `sampleProjects` from `./project-list.data`
- Produces:
  - Storybook stories titled `GitHub.io/Projects/Project Card`

- [ ] **Step 1: Add a failing story smoke test**

Append this import to `apps/github.io/src/app/projects/project-card.spec.tsx`:

```tsx
import * as stories from './project-card.stories';
```

Append this test:

```tsx
describe('ProjectCard stories', () => {
  it('exports the expected story fixtures', () => {
    expect(stories.Default.args?.project?.id).toBe('github-io-portfolio');
    expect(stories.ManySkills.args?.project?.skills.length).toBeGreaterThan(8);
    expect(stories.LongCopy.args?.project?.title).toContain('observability');
    expect(stories.FullWidth.parameters?.viewport?.defaultViewport).toBe(
      'mobile1',
    );
  });
});
```

- [ ] **Step 2: Run the focused test to verify it fails**

Run:

```sh
pnpm nx test github.io -- --run apps/github.io/src/app/projects/project-card.spec.tsx
```

Expected: fail because `project-card.stories.tsx` does not exist.

- [ ] **Step 3: Add Storybook stories**

Create `apps/github.io/src/app/projects/project-card.stories.tsx`:

```tsx
import type { Meta, StoryObj } from '@storybook/react-vite';

import { ProjectCard } from './project-card';
import { sampleProjects } from './project-list.data';
import type { Project } from './project-list.types';

const baseProject = sampleProjects[0];

const manySkillsProject: Project = {
  ...baseProject,
  skills: [
    ...baseProject.skills,
    { label: 'Docker' },
    { label: 'Kubernetes' },
    { label: 'Terraform' },
    { label: 'Prometheus' },
  ],
};

const longCopyProject: Project = {
  ...baseProject,
  id: 'observability-delivery-project',
  title: 'Platform observability and delivery evidence workspace',
  description:
    'A compact public project surface that connects delivery automation, cloud infrastructure, observability, and certification evidence into a scannable engineering portfolio.',
  skills: [
    { label: 'React' },
    { label: 'TypeScript' },
    { label: 'GitHub Actions' },
    { label: 'Prometheus' },
    { label: 'Grafana' },
  ],
};

const meta: Meta<typeof ProjectCard> = {
  component: ProjectCard,
  title: 'GitHub.io/Projects/Project Card',
};

export default meta;
type Story = StoryObj<typeof ProjectCard>;

export const Default: Story = {
  args: {
    project: baseProject,
  },
};

export const ManySkills: Story = {
  args: {
    project: manySkillsProject,
  },
};

export const LongCopy: Story = {
  args: {
    project: longCopyProject,
  },
};

export const FullWidth: Story = {
  args: {
    isFullWidth: true,
    project: baseProject,
  },
  parameters: {
    viewport: {
      defaultViewport: 'mobile1',
    },
  },
};
```

- [ ] **Step 4: Run the focused test to verify it passes**

Run:

```sh
pnpm nx test github.io -- --run apps/github.io/src/app/projects/project-card.spec.tsx
```

Expected: pass.

- [ ] **Step 5: Run Storybook-related checks available in the repo**

Run:

```sh
pnpm nx test github.io -- --run apps/github.io/src/app/projects/project-card.spec.tsx
pnpm nx lint github.io
```

Expected: pass.

- [ ] **Step 6: Commit the Storybook coverage**

Run:

```sh
git status --short
git diff
git add apps/github.io/src/app/projects/project-card.stories.tsx apps/github.io/src/app/projects/project-card.spec.tsx
git diff --cached
git commit -m "docs(github.io): add project card stories"
```

### Task 4: Final Verification

**Files:**
- No code file changes expected.

**Interfaces:**
- Consumes the completed project data, `ProjectCard`, tests, and stories from Tasks 1-3.
- Produces final confidence that the component is ready for code review and handoff.

- [ ] **Step 1: Inspect branch status**

Run:

```sh
git status --short --branch
```

Expected: clean branch with no unstaged or staged changes.

- [ ] **Step 2: Run focused project checks**

Run:

```sh
pnpm nx test github.io -- --run apps/github.io/src/app/projects/project-card.spec.tsx
pnpm nx lint github.io
pnpm nx build github.io
```

Expected: all commands pass.

- [ ] **Step 3: Run broader tests if local runtime remains stable**

Run:

```sh
pnpm nx test github.io
```

Expected: pass. If this command is slow or fails outside the ProjectCard area, capture the failing suite and decide whether it is related before changing ProjectCard code.

- [ ] **Step 4: Prepare review summary**

Collect:

```sh
git log --oneline --decorate -5
git status --short --branch
```

Expected: three implementation commits after the design/plan commits, clean branch, and no pushed changes.

Summarize:

- files created;
- validation commands and results;
- any skipped checks with exact reason;
- that DevOps evidence linkage remains future work by design.
