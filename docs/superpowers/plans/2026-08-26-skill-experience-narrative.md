# Skill Experience Narrative Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add canonical reusable experience narratives and render selected skill experiences as text-heavy Astryx Card story blocks on skill detail pages.

**Architecture:** Introduce a focused `experience` data module that owns public-safe accomplishment narratives and their explicit relationships to skills, projects, DORA capabilities, and supporting evidence. Extend skill detail resolution to select ordered experiences by ID, then render them through a dedicated Astryx-first card list component. Keep compact DORA evidence and current skill list behavior stable.

**Tech Stack:** React 19, TypeScript 5.9, Astryx Core 0.1.4, StyleX 0.19, Nx 23, Vite 8, Vitest 4, Testing Library, Storybook 10.

**Spec:** `docs/superpowers/specs/2026-08-26-skill-experience-narrative-design.md`

## Global Constraints

- Work in the linked worktree at `/home/benkim0414/workspace/benkim0414/.worktrees/skill-experience-narrative` on branch `feat/skill-experience-narrative`.
- Astryx is authoritative for component anatomy, styling, spacing, typography, layout, and interaction.
- Material Design 3 is supporting guidance only: lists are for scannable indexes, cards are appropriate for content about one subject.
- Use Astryx components before raw HTML for every covered UI surface.
- Do not add dependencies, a CMS, markdown pipeline, database, remote content source, route, search integration, project page integration, or DORA score recalculation.
- Do not migrate every current DORA evidence item into experiences.
- Keep all relationship links explicit through stable IDs; do not derive links from display names, summaries, or technology labels.
- The first production experience is an AWS CI/CD pipeline narrative that avoids private repository, account, service, organization, URL, and environment identifiers.
- Reject non-public or sensitive experience records before rendering.
- Use Astryx `Card` only for each narrative accomplishment; compact scan surfaces must use rows or tokens in later work.
- Cards must not be nested.
- Stage explicit paths only and commit each task as a separate conventional commit.
- Before final handoff, run focused tests, full `github.io` tests, lint, build, Storybook build or documented visual QA, `git diff --check`, and Codex `/review`.

---

## File Structure

### Create

- `apps/github.io/src/app/experience/experience.types.ts` — canonical experience type contracts.
- `apps/github.io/src/app/experience/experience.data.ts` — production experience catalog with the first AWS CI/CD narrative.
- `apps/github.io/src/app/experience/experience.data.spec.ts` — catalog integrity and public-safety tests.
- `apps/github.io/src/app/skills/skill-experience-card-list.tsx` — Astryx Card narrative list for skill detail pages.
- `apps/github.io/src/app/skills/skill-experience-card-list.spec.tsx` — component rendering, semantics, and Astryx contract tests.
- `apps/github.io/src/app/skills/skill-experience-card-list.stories.tsx` — enriched and wrapping visual states.

### Modify

- `apps/github.io/src/app/skills/skill-detail.types.ts` — add experience source and resolved view-model fields.
- `apps/github.io/src/app/skills/skill-detail.data.ts` — add ordered `experienceIds` for enriched skills.
- `apps/github.io/src/app/skills/skill-detail-resolver.ts` — resolve and validate canonical experiences.
- `apps/github.io/src/app/skills/skill-detail-resolver.spec.ts` — cover experience ordering and integrity failures.
- `apps/github.io/src/app/skills/skill-detail-route.tsx` — pass production experiences into the resolver.
- `apps/github.io/src/app/skills/skill-detail-page.tsx` — render the narrative experience section.
- `apps/github.io/src/app/skills/skill-detail-page.spec.tsx` — cover enriched and basic page behavior.
- `apps/github.io/src/app/skills/skill-detail-page.stories.tsx` — expose a skill detail story with narrative cards.

### Leave Unchanged

- `apps/github.io/src/app/skills/skill-list.data.ts`
- `apps/github.io/src/app/skills/skill-card.tsx`
- `apps/github.io/src/app/skills/skill-card-list.tsx`
- `apps/github.io/src/app/skills/skill-list-item.tsx`
- `apps/github.io/src/app/global-search/skill-search-results.ts`
- DORA score calculation and projection files, except tests may import existing evidence for validation.

---

### Task 1: Add Canonical Experience Data

**Files:**

- Create: `apps/github.io/src/app/experience/experience.types.ts`
- Create: `apps/github.io/src/app/experience/experience.data.ts`
- Create: `apps/github.io/src/app/experience/experience.data.spec.ts`

**Interfaces:**

- Consumes: `DoraCapabilityKey` and `CapabilityEvidenceItem` from `apps/github.io/src/app/devops-capability-evidence/devops-capability-evidence.types.ts`.
- Consumes: existing `skills`, `sampleProjects`, and `devOpsCapabilityEvidenceItems` production collections.
- Produces: `ExperiencePeriod`, `ExperienceEnvironment`, `Experience`, and `experiences`.
- Later tasks import `Experience` and `experiences` from this module.

- [ ] **Step 1: Write the failing catalog integrity tests**

Create `apps/github.io/src/app/experience/experience.data.spec.ts`:

```ts
import { devOpsCapabilityEvidenceItems } from '../devops-capability-evidence/devops-capability-evidence.data';
import { sampleProjects } from '../projects/project-list.data';
import { skills } from '../skills/skill-list.data';
import { experiences } from './experience.data';

describe('experiences', () => {
  it('contains stable unique experience IDs', () => {
    const ids = experiences.map(({ id }) => id);

    expect(ids).toContain('aws-codepipeline-codebuild-multistage-delivery');
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('keeps every production experience public and non-sensitive', () => {
    expect(experiences).not.toHaveLength(0);
    expect(
      experiences.every(
        ({ isPublic, isSensitive }) => isPublic && isSensitive !== true,
      ),
    ).toBe(true);
  });

  it('links only to existing skills, projects, and supporting evidence', () => {
    const skillIds = new Set(skills.map(({ id }) => id));
    const projectIds = new Set(sampleProjects.map(({ id }) => id));
    const evidenceById = new Map(
      devOpsCapabilityEvidenceItems.map((item) => [item.id, item]),
    );

    for (const experience of experiences) {
      for (const skillId of experience.skillIds) {
        expect(skillIds.has(skillId)).toBe(true);
      }

      for (const projectId of experience.projectIds) {
        expect(projectIds.has(projectId)).toBe(true);
      }

      for (const evidenceId of experience.supportingEvidenceIds ?? []) {
        const evidence = evidenceById.get(evidenceId);

        expect(evidence).toBeDefined();
        expect(evidence?.isPublic).toBe(true);
        expect(evidence?.isSensitive).not.toBe(true);
      }
    }
  });

  it('authors the AWS CI/CD narrative as reusable text-heavy content', () => {
    const experience = experiences.find(
      ({ id }) => id === 'aws-codepipeline-codebuild-multistage-delivery',
    );

    expect(experience).toMatchObject({
      title: 'Multi-stage AWS CI/CD delivery pipeline',
      summary:
        'Built AWS CodePipeline and CodeBuild automation for staging and production delivery with build validation, artifact handoff, and controlled promotion.',
      skillIds: expect.arrayContaining([
        'aws-codepipeline',
        'aws-codebuild',
        'terraform',
      ]),
      projectIds: ['homelab'],
      capabilityKeys: expect.arrayContaining([
        'continuous-integration',
        'continuous-delivery',
        'deployment-automation',
      ]),
      technologies: expect.arrayContaining([
        'AWS CodePipeline',
        'AWS CodeBuild',
      ]),
      isPublic: true,
    });
    expect(experience?.narrative).toHaveLength(3);
    expect(experience?.environments?.map(({ label }) => label)).toEqual([
      'Staging',
      'Production',
    ]);
  });
});
```

- [ ] **Step 2: Run the new test and verify it fails for missing modules**

Run:

```bash
pnpm nx test github.io src/app/experience/experience.data.spec.ts
```

Expected: FAIL because `experience.data.ts` and `experience.types.ts` do not exist.

- [ ] **Step 3: Define the canonical experience interfaces**

Create `apps/github.io/src/app/experience/experience.types.ts`:

```ts
import type {
  CapabilityEvidenceItem,
  DoraCapabilityKey,
} from '../devops-capability-evidence/devops-capability-evidence.types';

export interface ExperiencePeriod {
  readonly startedAt: string;
  readonly endedAt?: string;
}

export interface ExperienceEnvironment {
  readonly label: string;
}

export interface Experience {
  readonly id: string;
  readonly title: string;
  readonly summary: string;
  readonly narrative: readonly string[];
  readonly role?: string;
  readonly organization?: string;
  readonly period?: ExperiencePeriod;
  readonly environments?: readonly ExperienceEnvironment[];
  readonly skillIds: readonly string[];
  readonly projectIds: readonly string[];
  readonly capabilityKeys: readonly DoraCapabilityKey[];
  readonly technologies: readonly string[];
  readonly supportingEvidenceIds?: readonly CapabilityEvidenceItem['id'][];
  readonly proofUrl?: string;
  readonly isPublic: boolean;
  readonly isSensitive?: boolean;
}
```

- [ ] **Step 4: Add the first production experience record**

Create `apps/github.io/src/app/experience/experience.data.ts`:

```ts
import type { Experience } from './experience.types';

export const experiences = [
  {
    id: 'aws-codepipeline-codebuild-multistage-delivery',
    title: 'Multi-stage AWS CI/CD delivery pipeline',
    summary:
      'Built AWS CodePipeline and CodeBuild automation for staging and production delivery with build validation, artifact handoff, and controlled promotion.',
    narrative: [
      'Built a delivery pipeline around AWS CodePipeline and AWS CodeBuild so application changes could move through repeatable validation before reaching runtime environments.',
      'Separated staging and production delivery concerns so changes could be exercised in a pre-production stage before production promotion, with the pipeline carrying the same build output through the release path.',
      'Used the pipeline as a reliability boundary: build feedback, deployment ordering, and environment-specific handoff were handled by automation instead of manual release steps.',
    ],
    role: 'Platform engineer',
    environments: [{ label: 'Staging' }, { label: 'Production' }],
    skillIds: [
      'aws-codepipeline',
      'aws-codebuild',
      'terraform',
      'amazon-ecr',
      'amazon-eks',
      'kubernetes',
    ],
    projectIds: ['homelab'],
    capabilityKeys: [
      'continuous-integration',
      'continuous-delivery',
      'deployment-automation',
    ],
    technologies: [
      'AWS CodePipeline',
      'AWS CodeBuild',
      'Terraform',
      'CI/CD',
    ],
    supportingEvidenceIds: [
      'terraform-codepipeline-platform',
      'codebuild-pr-gates',
      'codepipeline-approval-gated-deployment',
    ],
    isPublic: true,
  },
] as const satisfies readonly Experience[];
```

- [ ] **Step 5: Run the focused experience tests**

Run:

```bash
pnpm nx test github.io src/app/experience/experience.data.spec.ts
```

Expected: PASS with the experience catalog tests passing.

- [ ] **Step 6: Inspect and commit Task 1**

Run:

```bash
git diff -- apps/github.io/src/app/experience/experience.types.ts apps/github.io/src/app/experience/experience.data.ts apps/github.io/src/app/experience/experience.data.spec.ts
git diff --check
git status --short
```

Stage and commit only Task 1 paths:

```bash
git add apps/github.io/src/app/experience/experience.types.ts apps/github.io/src/app/experience/experience.data.ts apps/github.io/src/app/experience/experience.data.spec.ts
git diff --cached --check
git diff --cached
git commit -m "feat(experience): add narrative catalog"
```

---

### Task 2: Resolve Experiences Into Skill Detail View Models

**Files:**

- Modify: `apps/github.io/src/app/skills/skill-detail.types.ts`
- Modify: `apps/github.io/src/app/skills/skill-detail.data.ts`
- Modify: `apps/github.io/src/app/skills/skill-detail-resolver.ts`
- Modify: `apps/github.io/src/app/skills/skill-detail-resolver.spec.ts`
- Modify: `apps/github.io/src/app/skills/skill-detail-route.tsx`

**Interfaces:**

- Consumes: `Experience` and `experiences` from Task 1.
- Produces: `SkillDetailRecord.experienceIds`, `SkillDetailSources.experiences`, and `ResolvedSkillDetail.experiences`.
- Produces: `resolveSkillDetail(skillId, sources)` returning ordered canonical experiences in found results.

- [ ] **Step 1: Extend resolver tests for canonical experiences**

In `skill-detail-resolver.spec.ts`, import production experiences:

```ts
import { experiences } from '../experience/experience.data';
```

Add `experiences` to `productionSources`:

```ts
const productionSources = {
  skills,
  detailRecords: skillDetailRecords,
  evidenceItems: devOpsCapabilityEvidenceItems,
  projects: sampleProjects,
  experiences,
};
```

Extend the Kubernetes/enriched-skill test to assert ordered experiences:

```ts
expect(result.value.experiences.map(({ id }) => id)).toEqual([
  'aws-codepipeline-codebuild-multistage-delivery',
]);
```

Extend the known-basic-skill test:

```ts
expect(result.value.experiences).toEqual([]);
```

Add these integrity tests:

```ts
it('rejects missing, private, and sensitive experience references', () => {
  const kubernetesDetail = skillDetailRecords[0];

  expect(() =>
    resolveSkillDetail('kubernetes', {
      ...productionSources,
      detailRecords: [
        { ...kubernetesDetail, experienceIds: ['missing-experience'] },
      ],
    }),
  ).toThrow('missing experience "missing-experience"');

  for (const experience of [
    { ...experiences[0], id: 'private-experience', isPublic: false },
    {
      ...experiences[0],
      id: 'sensitive-experience',
      isPublic: true,
      isSensitive: true,
    },
  ]) {
    expect(() =>
      resolveSkillDetail('kubernetes', {
        ...productionSources,
        detailRecords: [
          { ...kubernetesDetail, experienceIds: [experience.id] },
        ],
        experiences: [...experiences, experience],
      }),
    ).toThrow(/public, non-sensitive experience/);
  }
});

it('rejects experience references that are not linked back to the skill', () => {
  const crossSkillExperience = {
    ...experiences[0],
    id: 'cross-skill-experience',
    skillIds: ['react'],
  };

  expect(() =>
    resolveSkillDetail('kubernetes', {
      ...productionSources,
      detailRecords: [
        {
          ...skillDetailRecords[0],
          experienceIds: [crossSkillExperience.id],
        },
      ],
      experiences: [...experiences, crossSkillExperience],
    }),
  ).toThrow(
    'Skill detail "kubernetes" references experience "cross-skill-experience" that is not linked to the skill.',
  );
});

it('rejects duplicate experience source IDs before resolving references', () => {
  expect(() =>
    resolveSkillDetail('kubernetes', {
      ...productionSources,
      experiences: [
        ...experiences,
        { ...experiences[0], title: 'Unexpected duplicate experience' },
      ],
    }),
  ).toThrow(
    'Duplicate experience source ID "aws-codepipeline-codebuild-multistage-delivery".',
  );
});
```

- [ ] **Step 2: Run the focused resolver test and verify the intended failure**

Run:

```bash
pnpm nx test github.io src/app/skills/skill-detail-resolver.spec.ts
```

Expected: FAIL because the resolver types and implementation do not yet accept canonical experiences.

- [ ] **Step 3: Extend skill detail type contracts**

Modify `skill-detail.types.ts`:

```ts
import type { Experience } from '../experience/experience.types';
```

Add `experienceIds` to `SkillDetailRecord`:

```ts
export interface SkillDetailRecord {
  readonly skillId: string;
  readonly experienceIds: readonly string[];
  readonly experienceEvidenceIds: readonly string[];
  readonly projectIds: readonly string[];
}
```

Add `experiences` to `SkillDetailSources`:

```ts
export interface SkillDetailSources {
  readonly skills: readonly Skill[];
  readonly detailRecords: readonly SkillDetailRecord[];
  readonly evidenceItems: readonly CapabilityEvidenceItem[];
  readonly projects: readonly Project[];
  readonly experiences: readonly Experience[];
}
```

Add `experiences` to `ResolvedSkillDetail`:

```ts
export interface ResolvedSkillDetail {
  readonly skill: Skill;
  readonly experiences: readonly Experience[];
  readonly experienceEvidence: readonly CapabilityEvidenceItem[];
  readonly projects: readonly Project[];
}
```

- [ ] **Step 4: Add ordered experience IDs to the enriched skill detail record**

Modify `skill-detail.data.ts` so the Kubernetes record includes:

```ts
experienceIds: ['aws-codepipeline-codebuild-multistage-delivery'],
```

Keep existing `experienceEvidenceIds` and `projectIds` unchanged.

- [ ] **Step 5: Resolve and validate canonical experiences**

Modify `skill-detail-resolver.ts` to build an experience map before resolving records:

```ts
const experienceById = new Map<string, (typeof sources.experiences)[number]>();

for (const experience of sources.experiences) {
  if (experienceById.has(experience.id)) {
    throw new Error(`Duplicate experience source ID "${experience.id}".`);
  }

  experienceById.set(experience.id, experience);
}
```

When a known skill has no detail record, return empty `experiences`:

```ts
value: {
  skill,
  experiences: [],
  experienceEvidence: [],
  projects: [],
},
```

Resolve `record.experienceIds` before or after existing evidence resolution:

```ts
const experiences = record.experienceIds.map((experienceId) => {
  const experience = experienceById.get(experienceId);

  if (!experience) {
    throw new Error(
      `Skill detail "${skillId}" references missing experience "${experienceId}".`,
    );
  }
  if (!experience.isPublic || experience.isSensitive) {
    throw new Error(
      `Skill detail "${skillId}" must reference public, non-sensitive experience; received "${experienceId}".`,
    );
  }
  if (!experience.skillIds.includes(skillId)) {
    throw new Error(
      `Skill detail "${skillId}" references experience "${experienceId}" that is not linked to the skill.`,
    );
  }

  return experience;
});
```

Include `experiences` in the found result value.

- [ ] **Step 6: Pass production experiences from the route**

Modify `skill-detail-route.tsx` to import and provide production experiences:

```tsx
import { experiences } from '../experience/experience.data';
```

Add the field to the resolver source object:

```tsx
experiences,
```

- [ ] **Step 7: Run focused tests**

Run:

```bash
pnpm nx test github.io src/app/skills/skill-detail-resolver.spec.ts
pnpm nx test github.io src/app/skills/skill-detail-page.spec.tsx
```

Expected: resolver tests PASS. Page tests may fail only if their fixtures still omit the new `experiences` field; update those test fixtures to include `experiences: []` for basic records or the production resolved detail for enriched records.

- [ ] **Step 8: Inspect and commit Task 2**

Run:

```bash
git diff -- apps/github.io/src/app/skills/skill-detail.types.ts apps/github.io/src/app/skills/skill-detail.data.ts apps/github.io/src/app/skills/skill-detail-resolver.ts apps/github.io/src/app/skills/skill-detail-resolver.spec.ts apps/github.io/src/app/skills/skill-detail-route.tsx
git diff --check
git status --short
```

Stage and commit only Task 2 paths:

```bash
git add apps/github.io/src/app/skills/skill-detail.types.ts apps/github.io/src/app/skills/skill-detail.data.ts apps/github.io/src/app/skills/skill-detail-resolver.ts apps/github.io/src/app/skills/skill-detail-resolver.spec.ts apps/github.io/src/app/skills/skill-detail-route.tsx
git diff --cached --check
git diff --cached
git commit -m "feat(skills): resolve experience narratives"
```

---

### Task 3: Build the Astryx Experience Card List

**Files:**

- Create: `apps/github.io/src/app/skills/skill-experience-card-list.tsx`
- Create: `apps/github.io/src/app/skills/skill-experience-card-list.spec.tsx`
- Create: `apps/github.io/src/app/skills/skill-experience-card-list.stories.tsx`

**Interfaces:**

- Consumes: `Experience` from `../experience/experience.types`.
- Produces: `SkillExperienceCardList({ experiences }: { experiences: readonly Experience[] })`.
- Later task consumes `SkillExperienceCardList` from `SkillDetailPage`.

- [ ] **Step 1: Check Astryx component docs used by this component**

Run:

```bash
pnpm exec astryx component Card
pnpm exec astryx component Heading
pnpm exec astryx component MetadataList
pnpm exec astryx component Token
pnpm exec astryx docs typography
pnpm exec astryx docs layout
```

Expected: commands succeed. Use the documented public props only.

- [ ] **Step 2: Write the failing component tests**

Create `skill-experience-card-list.spec.tsx`:

```tsx
import { render, screen, within } from '@testing-library/react';

import type { Experience } from '../experience/experience.types';
import { SkillExperienceCardList } from './skill-experience-card-list';

const ciCdExperience: Experience = {
  id: 'aws-codepipeline-codebuild-multistage-delivery',
  title: 'Multi-stage AWS CI/CD delivery pipeline',
  summary:
    'Built AWS CodePipeline and CodeBuild automation for staging and production delivery with build validation, artifact handoff, and controlled promotion.',
  narrative: [
    'Built a delivery pipeline around AWS CodePipeline and AWS CodeBuild so application changes could move through repeatable validation before reaching runtime environments.',
    'Separated staging and production delivery concerns so changes could be exercised in a pre-production stage before production promotion, with the pipeline carrying the same build output through the release path.',
  ],
  role: 'Platform engineer',
  environments: [{ label: 'Staging' }, { label: 'Production' }],
  skillIds: ['aws-codepipeline'],
  projectIds: ['homelab'],
  capabilityKeys: ['continuous-integration', 'continuous-delivery'],
  technologies: ['AWS CodePipeline', 'AWS CodeBuild', 'Terraform'],
  isPublic: true,
};

describe('SkillExperienceCardList', () => {
  it('renders each experience as a titled Astryx Card narrative', () => {
    render(<SkillExperienceCardList experiences={[ciCdExperience]} />);

    const list = screen.getByRole('list', { name: 'Skill experience' });
    const item = within(list).getByRole('listitem');
    const card = item.querySelector('.astryx-card');

    expect(card).not.toBeNull();
    expect(
      within(item).getByRole('heading', {
        level: 3,
        name: 'Multi-stage AWS CI/CD delivery pipeline',
      }),
    ).toBeInTheDocument();
    expect(within(item).getByText(ciCdExperience.summary)).toBeInTheDocument();
    expect(within(item).getByText(ciCdExperience.narrative[0])).toBeInTheDocument();
    expect(within(item).getByText(ciCdExperience.narrative[1])).toBeInTheDocument();
  });

  it('renders metadata and technology tokens without nested cards', () => {
    render(<SkillExperienceCardList experiences={[ciCdExperience]} />);

    const item = screen.getByRole('listitem');

    expect(within(item).getByText('Role')).toBeInTheDocument();
    expect(within(item).getByText('Platform engineer')).toBeInTheDocument();
    expect(within(item).getByText('Environments')).toBeInTheDocument();
    expect(within(item).getByText('Staging')).toBeInTheDocument();
    expect(within(item).getByText('Production')).toBeInTheDocument();
    expect(within(item).getByText('AWS CodePipeline')).toBeInTheDocument();
    expect(within(item).getByText('AWS CodeBuild')).toBeInTheDocument();
    expect(item.querySelectorAll('.astryx-card')).toHaveLength(1);
  });
});
```

- [ ] **Step 3: Run the component test and verify it fails for missing component**

Run:

```bash
pnpm nx test github.io src/app/skills/skill-experience-card-list.spec.tsx
```

Expected: FAIL because `skill-experience-card-list.tsx` does not exist.

- [ ] **Step 4: Implement the card list component**

Create `skill-experience-card-list.tsx`:

```tsx
import { Card } from '@astryxdesign/core/Card';
import { Heading } from '@astryxdesign/core/Heading';
import { HStack, VStack } from '@astryxdesign/core/Layout';
import {
  MetadataList,
  MetadataListItem,
} from '@astryxdesign/core/MetadataList';
import { Text } from '@astryxdesign/core/Text';
import { Token } from '@astryxdesign/core/Token';
import * as stylex from '@stylexjs/stylex';
import type { ReactElement } from 'react';

import type { Experience } from '../experience/experience.types';

export interface SkillExperienceCardListProps {
  readonly experiences: readonly Experience[];
}

const styles = stylex.create({
  list: {
    margin: 0,
    padding: 0,
    listStyle: 'none',
  },
  item: {
    listStyle: 'none',
  },
  tokenList: {
    margin: 0,
    padding: 0,
    listStyle: 'none',
  },
  tokenItem: {
    display: 'inline-flex',
    maxWidth: '100%',
    listStyle: 'none',
  },
});

export function SkillExperienceCardList({
  experiences,
}: SkillExperienceCardListProps): ReactElement {
  return (
    <ul aria-label="Skill experience" {...stylex.props(styles.list)}>
      {experiences.map((experience) => (
        <li key={experience.id} {...stylex.props(styles.item)}>
          <VStack paddingBlock={2}>
            <Card width="100%">
              <VStack gap={3}>
                <VStack gap={1}>
                  <Heading level={3}>{experience.title}</Heading>
                  <Text as="p" type="body">
                    {experience.summary}
                  </Text>
                </VStack>

                <VStack gap={2}>
                  {experience.narrative.map((paragraph) => (
                    <Text key={paragraph} as="p" type="body" color="secondary">
                      {paragraph}
                    </Text>
                  ))}
                </VStack>

                <ExperienceMetadata experience={experience} />

                {experience.technologies.length > 0 ? (
                  <HStack
                    as="ul"
                    gap={1}
                    wrap="wrap"
                    xstyle={styles.tokenList}
                  >
                    {experience.technologies.map((technology) => (
                      <li
                        key={technology}
                        {...stylex.props(styles.tokenItem)}
                      >
                        <Token label={technology} size="sm" />
                      </li>
                    ))}
                  </HStack>
                ) : null}
              </VStack>
            </Card>
          </VStack>
        </li>
      ))}
    </ul>
  );
}

function ExperienceMetadata({
  experience,
}: {
  readonly experience: Experience;
}): ReactElement | null {
  const environments = experience.environments ?? [];

  if (!experience.role && environments.length === 0) return null;

  return (
    <MetadataList>
      {experience.role ? (
        <MetadataListItem label="Role">{experience.role}</MetadataListItem>
      ) : null}
      {environments.length > 0 ? (
        <MetadataListItem label="Environments">
          <HStack
            as="ul"
            gap={1}
            wrap="wrap"
            xstyle={styles.tokenList}
          >
            {environments.map(({ label }) => (
              <li key={label} {...stylex.props(styles.tokenItem)}>
                <Token label={label} size="sm" color="gray" />
              </li>
            ))}
          </HStack>
        </MetadataListItem>
      ) : null}
    </MetadataList>
  );
}
```

- [ ] **Step 5: Add Storybook states**

Create `skill-experience-card-list.stories.tsx`:

```tsx
import type { Meta, StoryObj } from '@storybook/react-vite';

import { experiences } from '../experience/experience.data';
import { SkillExperienceCardList } from './skill-experience-card-list';

const meta: Meta<typeof SkillExperienceCardList> = {
  title: 'github.io/skills/SkillExperienceCardList',
  component: SkillExperienceCardList,
};

export default meta;

type Story = StoryObj<typeof SkillExperienceCardList>;

export const AwsCiCdPipeline: Story = {
  args: {
    experiences,
  },
};

export const LongWrappingNarrative: Story = {
  args: {
    experiences: [
      {
        ...experiences[0],
        title:
          'Multi-stage AWS CI/CD delivery pipeline with intentionally long wrapping title',
        technologies: [
          ...experiences[0].technologies,
          'Environment promotion',
          'Build validation',
          'Release automation',
        ],
      },
    ],
  },
};
```

- [ ] **Step 6: Run focused component tests**

Run:

```bash
pnpm nx test github.io src/app/skills/skill-experience-card-list.spec.tsx
```

Expected: PASS with the component tests passing.

- [ ] **Step 7: Inspect and commit Task 3**

Run:

```bash
git diff -- apps/github.io/src/app/skills/skill-experience-card-list.tsx apps/github.io/src/app/skills/skill-experience-card-list.spec.tsx apps/github.io/src/app/skills/skill-experience-card-list.stories.tsx
git diff --check
git status --short
```

Stage and commit only Task 3 paths:

```bash
git add apps/github.io/src/app/skills/skill-experience-card-list.tsx apps/github.io/src/app/skills/skill-experience-card-list.spec.tsx apps/github.io/src/app/skills/skill-experience-card-list.stories.tsx
git diff --cached --check
git diff --cached
git commit -m "feat(skills): add experience narrative cards"
```

---

### Task 4: Render Experience Narratives On Skill Detail

**Files:**

- Modify: `apps/github.io/src/app/skills/skill-detail-page.tsx`
- Modify: `apps/github.io/src/app/skills/skill-detail-page.spec.tsx`
- Modify: `apps/github.io/src/app/skills/skill-detail-page.stories.tsx`

**Interfaces:**

- Consumes: `ResolvedSkillDetail.experiences` from Task 2.
- Consumes: `SkillExperienceCardList` from Task 3.
- Produces: skill detail page section headed `Experience` that renders only when `detail.experiences.length > 0`.

- [ ] **Step 1: Extend page tests for enriched and basic experience rendering**

In `skill-detail-page.spec.tsx`, add assertions to the enriched detail test:

```tsx
expect(
  screen.getByRole('heading', { level: 2, name: 'Experience' }),
).toBeInTheDocument();
expect(
  screen.getByRole('heading', {
    level: 3,
    name: 'Multi-stage AWS CI/CD delivery pipeline',
  }),
).toBeInTheDocument();
expect(
  screen.getByText(
    'Built AWS CodePipeline and CodeBuild automation for staging and production delivery with build validation, artifact handoff, and controlled promotion.',
  ),
).toBeInTheDocument();
```

In the basic known skill test, assert the section is omitted:

```tsx
expect(
  screen.queryByRole('heading', { level: 2, name: 'Experience' }),
).not.toBeInTheDocument();
```

If local test fixtures construct `ResolvedSkillDetail` by hand, include:

```ts
experiences: [],
```

for basic details and the production resolved experience for enriched details.

- [ ] **Step 2: Run the focused page test and verify the intended failure**

Run:

```bash
pnpm nx test github.io src/app/skills/skill-detail-page.spec.tsx
```

Expected: FAIL because `SkillDetailPage` does not yet render the new `Experience` section.

- [ ] **Step 3: Render the experience section**

Modify `skill-detail-page.tsx` to import the card list:

```tsx
import { SkillExperienceCardList } from './skill-experience-card-list';
```

Render the section after the metadata card and before the existing `In practice` section:

```tsx
{detail.experiences.length > 0 ? (
  <section aria-labelledby="skill-experience-narrative-heading">
    <VStack gap={3}>
      <Heading id="skill-experience-narrative-heading" level={2}>
        Experience
      </Heading>
      <SkillExperienceCardList experiences={detail.experiences} />
    </VStack>
  </section>
) : null}
```

Keep the existing `In practice` section unchanged so legacy evidence rendering remains compatible during this transition.

- [ ] **Step 4: Update Storybook skill-detail states**

Modify `skill-detail-page.stories.tsx` so the enriched story uses production resolution with `experiences` included. If the story currently constructs details manually, import production `experiences` and include the AWS CI/CD experience in the enriched story while keeping the basic story at `experiences: []`.

Use this shape for manual enriched fixtures:

```ts
experiences: [experiences[0]],
```

Do not add a standalone route story or change list/card navigation.

- [ ] **Step 5: Run focused page and component tests**

Run:

```bash
pnpm nx test github.io src/app/skills/skill-detail-page.spec.tsx
pnpm nx test github.io src/app/skills/skill-experience-card-list.spec.tsx
pnpm nx test github.io src/app/skills/skill-detail-resolver.spec.ts
```

Expected: PASS for all focused tests.

- [ ] **Step 6: Run full automated verification**

Run:

```bash
pnpm nx test github.io
pnpm nx lint github.io
pnpm nx build github.io
pnpm nx build-storybook github.io
git diff --check
```

Expected:

- All `github.io` tests pass.
- Lint reports no new errors.
- The Vite application build succeeds.
- The static Storybook build succeeds.
- `git diff --check` produces no output.

- [ ] **Step 7: Perform visual QA on affected stories**

Start Storybook:

```bash
pnpm nx storybook github.io -- --host 0.0.0.0 --port 41737
```

Inspect these stories at 390×844, 768×1024, and 1440×900 in light and dark modes:

```text
http://localhost:41737/iframe.html?id=github-io-skills-skill-detail-page--enriched-kubernetes&viewMode=story
http://localhost:41737/iframe.html?id=github-io-skills-skill-detail-page--basic-skill&viewMode=story
http://localhost:41737/iframe.html?id=github-io-skills-skillexperiencecardlist--aws-ci-cd-pipeline&viewMode=story
http://localhost:41737/iframe.html?id=github-io-skills-skillexperiencecardlist--long-wrapping-narrative&viewMode=story
```

Verify:

- narrative cards do not nest inside another card;
- the skill metadata card remains separate from the narrative cards;
- the `Experience` section appears only for enriched details;
- the existing `In practice` and `Projects` sections still render in order;
- title, summary, paragraphs, metadata, and tokens wrap without clipping;
- no horizontal overflow occurs;
- light and dark mode contrast remains readable.

- [ ] **Step 8: Run code review before the final commit**

Run the repository-required Codex review on the task-scoped branch. Address correctness, regression, test-quality, or Astryx-guidance findings before committing. Re-run the affected verification command after any fix.

- [ ] **Step 9: Commit Task 4**

Run:

```bash
git diff -- apps/github.io/src/app/skills/skill-detail-page.tsx apps/github.io/src/app/skills/skill-detail-page.spec.tsx apps/github.io/src/app/skills/skill-detail-page.stories.tsx
git status --short
```

Stage and commit only Task 4 paths:

```bash
git add apps/github.io/src/app/skills/skill-detail-page.tsx apps/github.io/src/app/skills/skill-detail-page.spec.tsx apps/github.io/src/app/skills/skill-detail-page.stories.tsx
git diff --cached --check
git diff --cached
git commit -m "feat(skills): show experience narratives"
```

---

## Final Verification

After all tasks are committed, run:

```bash
pnpm nx test github.io
pnpm nx lint github.io
pnpm nx build github.io
pnpm nx build-storybook github.io
git diff --check
git status --short --branch
```

Expected final state:

- Branch remains `feat/skill-experience-narrative`.
- Working tree is clean.
- The design spec commit remains present.
- Four implementation commits exist after the plan commit if every task was executed.
- No push, merge, deployment, or worktree cleanup is performed without explicit user approval.
