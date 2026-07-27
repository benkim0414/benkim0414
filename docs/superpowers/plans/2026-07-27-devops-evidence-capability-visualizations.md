# DevOps Evidence Capability Visualizations Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build reusable React components in `apps/github.io` that visualize the owner's DevOps capabilities against selected DORA capability areas using LinkedIn-style evidence.

**Architecture:** Add a new feature folder, `apps/github.io/src/app/devops-capability-evidence/`, with shared evidence types, seed data, scoring utilities, and standalone visualization components. Components must not own card, panel, route, or dashboard chrome; they render reusable charts/figures that parents can compose later.

**Tech Stack:** React 19, TypeScript, Nx, Vite, Vitest, Testing Library, Storybook, Astryx Design, StyleX, MUI X Charts where useful.

## Global Constraints

- Target app: `apps/github.io`.
- Feature folder: `apps/github.io/src/app/devops-capability-evidence/`.
- Use selected DORA capability catalog dimensions, not DORA delivery metrics, as the visualization axes.
- Evidence types are `skill`, `learning`, `experience`, `education`, `certification`, and `project`.
- Evidence strength values are `supporting`, `strong`, and `primary`.
- Skills must not render as capability evidence unless linked to another evidence item or explicitly supported by a safe summary.
- Score-based visualizations must hide capabilities with score `0`.
- Components must not expose private company details, raw deployment counts, raw incident records, PR links, private repository URLs, customer names, or confidential screenshots.
- Components must not include card, panel, route, or dashboard chrome.
- Follow the existing Astryx styling boundary: Astryx components and tokens where useful, StyleX for component-local styling, and chart-library styling only where needed.
- Add Storybook stories for every component.
- Use focused tests; avoid brittle assertions on generated chart SVG paths unless asserting an intentional stable contract.

---

## File Structure

- Create `apps/github.io/src/app/devops-capability-evidence/devops-capability-evidence.types.ts`: shared DORA capability keys, evidence types, score interfaces, and helper maps.
- Create `apps/github.io/src/app/devops-capability-evidence/devops-capability-evidence.data.ts`: public or safely summarized seed evidence and DORA capability labels.
- Create `apps/github.io/src/app/devops-capability-evidence/devops-capability-evidence.scoring.ts`: evidence filtering, grouping, scoring, and count utilities.
- Create `apps/github.io/src/app/devops-capability-evidence/devops-capability-evidence.summary.ts`: accessible summary string builders shared by visual components.
- Create `apps/github.io/src/app/devops-capability-evidence/devops-capability-evidence.spec.ts`: shared data/scoring/summary tests.
- Create `apps/github.io/src/app/devops-capability-evidence/devops-capability-evidence-radar.tsx`: radar chart visualization.
- Create `apps/github.io/src/app/devops-capability-evidence/devops-capability-evidence-radar.spec.tsx`: radar rendering and accessibility tests.
- Create `apps/github.io/src/app/devops-capability-evidence/devops-capability-evidence-radar.stories.tsx`: radar Storybook stories.
- Create `apps/github.io/src/app/devops-capability-evidence/devops-capability-bar-list.tsx`: ranked horizontal bar visualization.
- Create `apps/github.io/src/app/devops-capability-evidence/devops-capability-bar-list.spec.tsx`: bar list tests.
- Create `apps/github.io/src/app/devops-capability-evidence/devops-capability-bar-list.stories.tsx`: bar list Storybook stories.
- Create `apps/github.io/src/app/devops-capability-evidence/devops-capability-evidence-matrix.tsx`: capability-by-evidence-type matrix.
- Create `apps/github.io/src/app/devops-capability-evidence/devops-capability-evidence-matrix.spec.tsx`: matrix tests.
- Create `apps/github.io/src/app/devops-capability-evidence/devops-capability-evidence-matrix.stories.tsx`: matrix Storybook stories.
- Create `apps/github.io/src/app/devops-capability-evidence/devops-evidence-type-donut.tsx`: evidence-type distribution chart.
- Create `apps/github.io/src/app/devops-capability-evidence/devops-evidence-type-donut.spec.tsx`: donut tests.
- Create `apps/github.io/src/app/devops-capability-evidence/devops-evidence-type-donut.stories.tsx`: donut Storybook stories.
- Create `apps/github.io/src/app/devops-capability-evidence/devops-evidence-timeline.tsx`: dated evidence timeline figure.
- Create `apps/github.io/src/app/devops-capability-evidence/devops-evidence-timeline.spec.tsx`: timeline tests.
- Create `apps/github.io/src/app/devops-capability-evidence/devops-evidence-timeline.stories.tsx`: timeline Storybook stories.
- Create `apps/github.io/src/app/devops-capability-evidence/devops-certification-capability-map.tsx`: certification-to-capability figure.
- Create `apps/github.io/src/app/devops-capability-evidence/devops-certification-capability-map.spec.tsx`: certification map tests.
- Create `apps/github.io/src/app/devops-capability-evidence/devops-certification-capability-map.stories.tsx`: certification map Storybook stories.

---

### Task 1: Add Shared Evidence Types And Seed Data

**Files:**
- Create: `apps/github.io/src/app/devops-capability-evidence/devops-capability-evidence.types.ts`
- Create: `apps/github.io/src/app/devops-capability-evidence/devops-capability-evidence.data.ts`
- Create: `apps/github.io/src/app/devops-capability-evidence/devops-capability-evidence.spec.ts`

**Interfaces:**
- Produces:
  - `DoraCapabilityKey`
  - `EvidenceType`
  - `EvidenceStrength`
  - `CapabilityEvidenceItem`
  - `DoraCapabilityScore`
  - `doraCapabilityDefinitions`
  - `evidenceTypeLabels`
  - `devOpsCapabilityEvidenceItems`

- [ ] **Step 1: Create failing type/data tests**

Add `apps/github.io/src/app/devops-capability-evidence/devops-capability-evidence.spec.ts`:

```ts
import {
  doraCapabilityDefinitions,
  evidenceTypeLabels,
  devOpsCapabilityEvidenceItems,
} from './devops-capability-evidence.data';

describe('devOpsCapabilityEvidence data', () => {
  it('defines the first DORA capability dimensions in order', () => {
    expect(doraCapabilityDefinitions.map((capability) => capability.key)).toEqual([
      'continuous-delivery',
      'deployment-automation',
      'continuous-integration',
      'test-automation',
      'monitoring-observability',
      'flexible-infrastructure',
      'pervasive-security',
      'trunk-based-development',
      'documentation-quality',
      'version-control',
    ]);
  });

  it('defines LinkedIn-style evidence type labels', () => {
    expect(evidenceTypeLabels).toEqual({
      skill: 'Skills',
      learning: 'Learning',
      experience: 'Experience',
      education: 'Education',
      certification: 'Certifications',
      project: 'Projects',
    });
  });

  it('keeps all seed evidence public or safely summarized', () => {
    expect(devOpsCapabilityEvidenceItems.length).toBeGreaterThan(0);

    for (const item of devOpsCapabilityEvidenceItems) {
      expect(item.summary.length).toBeGreaterThan(24);
      expect(item.capabilityKeys.length).toBeGreaterThan(0);
      expect(['supporting', 'strong', 'primary']).toContain(item.strength);
      expect(item.summary).not.toMatch(/incident-\d+|deploy-\d+|private repo|customer name/i);
    }
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run:

```bash
pnpm nx test github.io -- --run src/app/devops-capability-evidence/devops-capability-evidence.spec.ts
```

Expected: FAIL because the data module does not exist.

- [ ] **Step 3: Add shared types**

Create `apps/github.io/src/app/devops-capability-evidence/devops-capability-evidence.types.ts`:

```ts
export type DoraCapabilityKey =
  | 'continuous-delivery'
  | 'deployment-automation'
  | 'continuous-integration'
  | 'test-automation'
  | 'monitoring-observability'
  | 'flexible-infrastructure'
  | 'pervasive-security'
  | 'trunk-based-development'
  | 'documentation-quality'
  | 'version-control';

export type EvidenceType =
  | 'skill'
  | 'learning'
  | 'experience'
  | 'education'
  | 'certification'
  | 'project';

export type EvidenceStrength = 'supporting' | 'strong' | 'primary';

export interface DoraCapabilityDefinition {
  key: DoraCapabilityKey;
  label: string;
  shortLabel: string;
}

export interface CapabilityEvidenceItem {
  id: string;
  title: string;
  type: EvidenceType;
  capabilityKeys: readonly DoraCapabilityKey[];
  date?: string;
  endDate?: string;
  issuer?: string;
  organization?: string;
  summary: string;
  technologies?: readonly string[];
  proofUrl?: string;
  isPublic: boolean;
  isSensitive?: boolean;
  strength: EvidenceStrength;
  supportingEvidenceIds?: readonly string[];
}

export interface DoraCapabilityScore {
  capabilityKey: DoraCapabilityKey;
  label: string;
  score: number;
  maxScore: 5;
  evidenceIds: readonly string[];
  strongestEvidenceId?: string;
  evidenceCounts: Partial<Record<EvidenceType, number>>;
}
```

- [ ] **Step 4: Add seed definitions and evidence**

Create `apps/github.io/src/app/devops-capability-evidence/devops-capability-evidence.data.ts`:

```ts
import type {
  CapabilityEvidenceItem,
  DoraCapabilityDefinition,
  EvidenceType,
} from './devops-capability-evidence.types';

export const doraCapabilityDefinitions = [
  { key: 'continuous-delivery', label: 'Continuous Delivery', shortLabel: 'Delivery' },
  { key: 'deployment-automation', label: 'Deployment Automation', shortLabel: 'Deploys' },
  { key: 'continuous-integration', label: 'Continuous Integration', shortLabel: 'CI' },
  { key: 'test-automation', label: 'Test Automation', shortLabel: 'Tests' },
  { key: 'monitoring-observability', label: 'Monitoring and Observability', shortLabel: 'Observability' },
  { key: 'flexible-infrastructure', label: 'Flexible Infrastructure', shortLabel: 'Infrastructure' },
  { key: 'pervasive-security', label: 'Pervasive Security', shortLabel: 'Security' },
  { key: 'trunk-based-development', label: 'Trunk-Based Development', shortLabel: 'Trunk' },
  { key: 'documentation-quality', label: 'Documentation Quality', shortLabel: 'Docs' },
  { key: 'version-control', label: 'Version Control', shortLabel: 'Versioning' },
] as const satisfies readonly DoraCapabilityDefinition[];

export const evidenceTypeLabels = {
  skill: 'Skills',
  learning: 'Learning',
  experience: 'Experience',
  education: 'Education',
  certification: 'Certifications',
  project: 'Projects',
} as const satisfies Record<EvidenceType, string>;

export const devOpsCapabilityEvidenceItems = [
  {
    id: 'github-actions-delivery',
    title: 'CI/CD workflow ownership',
    type: 'experience',
    organization: 'Current company',
    capabilityKeys: [
      'continuous-delivery',
      'deployment-automation',
      'continuous-integration',
    ],
    summary:
      'Owned CI/CD workflow improvements for a four-developer product team using safe public summary only.',
    technologies: ['GitHub Actions', 'Docker'],
    isPublic: true,
    isSensitive: true,
    strength: 'primary',
  },
  {
    id: 'kubernetes-learning',
    title: 'Kubernetes operations learning path',
    type: 'learning',
    date: '2026-03-01',
    endDate: '2026-04-05',
    capabilityKeys: ['flexible-infrastructure', 'monitoring-observability'],
    summary:
      'Practiced workloads, services, troubleshooting, kubectl workflows, and cluster operations.',
    technologies: ['Kubernetes'],
    isPublic: true,
    strength: 'strong',
  },
  {
    id: 'cncf-kubernetes-certification',
    title: 'CNCF Kubernetes certification',
    type: 'certification',
    issuer: 'Cloud Native Computing Foundation',
    capabilityKeys: ['flexible-infrastructure', 'monitoring-observability'],
    summary:
      'Cloud native certification evidence mapped to Kubernetes operations and infrastructure capability.',
    technologies: ['Kubernetes'],
    isPublic: true,
    strength: 'primary',
  },
  {
    id: 'devops-roadmap-project',
    title: 'DevOps roadmap portfolio project',
    type: 'project',
    capabilityKeys: ['documentation-quality', 'version-control'],
    summary:
      'Built a portfolio visualization that maps DevOps topics, skills, and certifications.',
    technologies: ['React', 'TypeScript', 'Nx'],
    isPublic: true,
    strength: 'strong',
  },
  {
    id: 'kubernetes-skill',
    title: 'Kubernetes',
    type: 'skill',
    capabilityKeys: ['flexible-infrastructure', 'monitoring-observability'],
    summary: 'Kubernetes skill shown because it is backed by learning and operations evidence.',
    technologies: ['Kubernetes'],
    isPublic: true,
    strength: 'supporting',
    supportingEvidenceIds: ['kubernetes-learning'],
  },
] as const satisfies readonly CapabilityEvidenceItem[];
```

- [ ] **Step 5: Run data tests**

Run:

```bash
pnpm nx test github.io -- --run src/app/devops-capability-evidence/devops-capability-evidence.spec.ts
```

Expected: PASS.

- [ ] **Step 6: Commit task**

Run:

```bash
git add apps/github.io/src/app/devops-capability-evidence/devops-capability-evidence.types.ts apps/github.io/src/app/devops-capability-evidence/devops-capability-evidence.data.ts apps/github.io/src/app/devops-capability-evidence/devops-capability-evidence.spec.ts
git commit -m "feat(github.io): add capability evidence model"
```

---

### Task 2: Add Evidence Scoring And Summary Utilities

**Files:**
- Modify: `apps/github.io/src/app/devops-capability-evidence/devops-capability-evidence.spec.ts`
- Create: `apps/github.io/src/app/devops-capability-evidence/devops-capability-evidence.scoring.ts`
- Create: `apps/github.io/src/app/devops-capability-evidence/devops-capability-evidence.summary.ts`

**Interfaces:**
- Consumes:
  - `CapabilityEvidenceItem`
  - `DoraCapabilityDefinition`
  - `DoraCapabilityScore`
- Produces:
  - `getPublicCapabilityEvidence(items): CapabilityEvidenceItem[]`
  - `getCapabilityEvidenceScores(items, definitions): DoraCapabilityScore[]`
  - `getEvidenceTypeCounts(items): Partial<Record<EvidenceType, number>>`
  - `getCapabilityEvidenceMatrix(items, definitions): CapabilityEvidenceMatrixRow[]`
  - `getCapabilityScoreSummary(scores): string`
  - `getEvidenceTypeSummary(counts): string`

- [ ] **Step 1: Add failing utility tests**

Append to `devops-capability-evidence.spec.ts`:

```ts
import {
  getCapabilityEvidenceMatrix,
  getCapabilityEvidenceScores,
  getEvidenceTypeCounts,
  getPublicCapabilityEvidence,
} from './devops-capability-evidence.scoring';
import {
  getCapabilityScoreSummary,
  getEvidenceTypeSummary,
} from './devops-capability-evidence.summary';

describe('devOpsCapabilityEvidence scoring', () => {
  it('filters private and unsupported skill evidence out of public scoring', () => {
    const evidence = getPublicCapabilityEvidence([
      ...devOpsCapabilityEvidenceItems,
      {
        id: 'unsupported-skill',
        title: 'Unsupported Tool',
        type: 'skill',
        capabilityKeys: ['test-automation'],
        summary: 'This skill lacks supporting evidence and should not score.',
        isPublic: true,
        strength: 'supporting',
      },
      {
        id: 'private-detail',
        title: 'Private Deployment Record',
        type: 'experience',
        capabilityKeys: ['deployment-automation'],
        summary: 'Private operational detail.',
        isPublic: false,
        strength: 'primary',
      },
    ]);

    expect(evidence.map((item) => item.id)).not.toContain('unsupported-skill');
    expect(evidence.map((item) => item.id)).not.toContain('private-detail');
  });

  it('derives non-zero capability scores from evidence', () => {
    const scores = getCapabilityEvidenceScores(
      devOpsCapabilityEvidenceItems,
      doraCapabilityDefinitions,
    );

    expect(scores.find((score) => score.capabilityKey === 'continuous-delivery')).toMatchObject({
      label: 'Continuous Delivery',
      score: 3,
      maxScore: 5,
      strongestEvidenceId: 'github-actions-delivery',
    });
    expect(scores.some((score) => score.score === 0)).toBe(false);
  });

  it('groups evidence counts by type and capability', () => {
    expect(getEvidenceTypeCounts(devOpsCapabilityEvidenceItems)).toMatchObject({
      experience: 1,
      learning: 1,
      certification: 1,
      project: 1,
      skill: 1,
    });

    expect(
      getCapabilityEvidenceMatrix(
        devOpsCapabilityEvidenceItems,
        doraCapabilityDefinitions,
      ).find((row) => row.capabilityKey === 'flexible-infrastructure'),
    ).toMatchObject({
      label: 'Flexible Infrastructure',
      counts: { certification: 1, learning: 1, skill: 1 },
    });
  });

  it('builds accessible summaries', () => {
    const scores = getCapabilityEvidenceScores(
      devOpsCapabilityEvidenceItems,
      doraCapabilityDefinitions,
    );

    expect(getCapabilityScoreSummary(scores)).toContain('Continuous Delivery 3 of 5');
    expect(getEvidenceTypeSummary(getEvidenceTypeCounts(devOpsCapabilityEvidenceItems))).toBe(
      'Evidence includes 1 skill, 1 learning item, 1 experience item, 1 certification, and 1 project.',
    );
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run:

```bash
pnpm nx test github.io -- --run src/app/devops-capability-evidence/devops-capability-evidence.spec.ts
```

Expected: FAIL because scoring and summary modules do not exist.

- [ ] **Step 3: Add scoring utilities**

Create `devops-capability-evidence.scoring.ts`:

```ts
import type {
  CapabilityEvidenceItem,
  DoraCapabilityDefinition,
  DoraCapabilityKey,
  DoraCapabilityScore,
  EvidenceStrength,
  EvidenceType,
} from './devops-capability-evidence.types';

export interface CapabilityEvidenceMatrixRow {
  capabilityKey: DoraCapabilityKey;
  label: string;
  counts: Partial<Record<EvidenceType, number>>;
  total: number;
}

const evidenceStrengthScore: Record<EvidenceStrength, number> = {
  supporting: 1,
  strong: 2,
  primary: 3,
};

export function getPublicCapabilityEvidence(
  items: readonly CapabilityEvidenceItem[],
): CapabilityEvidenceItem[] {
  const itemIds = new Set(items.map((item) => item.id));

  return items.filter((item) => {
    if (!item.isPublic) {
      return false;
    }

    if (item.type !== 'skill') {
      return true;
    }

    return (item.supportingEvidenceIds ?? []).some((id) => itemIds.has(id));
  });
}

export function getEvidenceTypeCounts(
  items: readonly CapabilityEvidenceItem[],
): Partial<Record<EvidenceType, number>> {
  return getPublicCapabilityEvidence(items).reduce<Partial<Record<EvidenceType, number>>>(
    (counts, item) => ({
      ...counts,
      [item.type]: (counts[item.type] ?? 0) + 1,
    }),
    {},
  );
}

export function getCapabilityEvidenceScores(
  items: readonly CapabilityEvidenceItem[],
  definitions: readonly DoraCapabilityDefinition[],
): DoraCapabilityScore[] {
  const publicItems = getPublicCapabilityEvidence(items);

  return definitions
    .map((definition) => {
      const evidence = publicItems.filter((item) =>
        item.capabilityKeys.includes(definition.key),
      );
      const rawScore = evidence.reduce(
        (total, item) => total + evidenceStrengthScore[item.strength],
        0,
      );
      const evidenceCounts = evidence.reduce<Partial<Record<EvidenceType, number>>>(
        (counts, item) => ({
          ...counts,
          [item.type]: (counts[item.type] ?? 0) + 1,
        }),
        {},
      );
      const strongestEvidence = [...evidence].sort(
        (left, right) =>
          evidenceStrengthScore[right.strength] - evidenceStrengthScore[left.strength],
      )[0];

      return {
        capabilityKey: definition.key,
        label: definition.label,
        score: Math.min(5, rawScore),
        maxScore: 5,
        evidenceIds: evidence.map((item) => item.id),
        strongestEvidenceId: strongestEvidence?.id,
        evidenceCounts,
      } satisfies DoraCapabilityScore;
    })
    .filter((score) => score.score > 0);
}

export function getCapabilityEvidenceMatrix(
  items: readonly CapabilityEvidenceItem[],
  definitions: readonly DoraCapabilityDefinition[],
): CapabilityEvidenceMatrixRow[] {
  const publicItems = getPublicCapabilityEvidence(items);

  return definitions
    .map((definition) => {
      const evidence = publicItems.filter((item) =>
        item.capabilityKeys.includes(definition.key),
      );
      const counts = evidence.reduce<Partial<Record<EvidenceType, number>>>(
        (groupedCounts, item) => ({
          ...groupedCounts,
          [item.type]: (groupedCounts[item.type] ?? 0) + 1,
        }),
        {},
      );

      return {
        capabilityKey: definition.key,
        label: definition.label,
        counts,
        total: evidence.length,
      };
    })
    .filter((row) => row.total > 0);
}
```

- [ ] **Step 4: Add summary utilities**

Create `devops-capability-evidence.summary.ts`:

```ts
import type {
  DoraCapabilityScore,
  EvidenceType,
} from './devops-capability-evidence.types';

const evidenceTypeSingular: Record<EvidenceType, string> = {
  skill: 'skill',
  learning: 'learning item',
  experience: 'experience item',
  education: 'education item',
  certification: 'certification',
  project: 'project',
};

const evidenceTypeOrder: EvidenceType[] = [
  'skill',
  'learning',
  'experience',
  'education',
  'certification',
  'project',
];

function joinReadable(parts: readonly string[]): string {
  if (parts.length <= 1) {
    return parts[0] ?? '';
  }

  return `${parts.slice(0, -1).join(', ')}, and ${parts.at(-1)}`;
}

export function getCapabilityScoreSummary(
  scores: readonly DoraCapabilityScore[],
): string {
  return scores
    .map((score) => `${score.label} ${score.score} of ${score.maxScore}`)
    .join(', ')
    .concat('.');
}

export function getEvidenceTypeSummary(
  counts: Partial<Record<EvidenceType, number>>,
): string {
  const parts = evidenceTypeOrder
    .map((type) => [type, counts[type] ?? 0] as const)
    .filter(([, count]) => count > 0)
    .map(([type, count]) => {
      const label = evidenceTypeSingular[type];
      return `${count} ${label}${count === 1 ? '' : 's'}`;
    });

  return `Evidence includes ${joinReadable(parts)}.`;
}
```

- [ ] **Step 5: Run utility tests**

Run:

```bash
pnpm nx test github.io -- --run src/app/devops-capability-evidence/devops-capability-evidence.spec.ts
```

Expected: PASS.

- [ ] **Step 6: Commit task**

Run:

```bash
git add apps/github.io/src/app/devops-capability-evidence/devops-capability-evidence.spec.ts apps/github.io/src/app/devops-capability-evidence/devops-capability-evidence.scoring.ts apps/github.io/src/app/devops-capability-evidence/devops-capability-evidence.summary.ts
git commit -m "feat(github.io): derive capability evidence scores"
```

---

### Task 3: Build `DevOpsCapabilityEvidenceRadar`

**Files:**
- Create: `apps/github.io/src/app/devops-capability-evidence/devops-capability-evidence-radar.tsx`
- Create: `apps/github.io/src/app/devops-capability-evidence/devops-capability-evidence-radar.spec.tsx`
- Create: `apps/github.io/src/app/devops-capability-evidence/devops-capability-evidence-radar.stories.tsx`

**Interfaces:**
- Consumes:
  - `DoraCapabilityScore[]`
  - `getCapabilityScoreSummary(scores): string`
- Produces:
  - `DevOpsCapabilityEvidenceRadar`

- [ ] **Step 1: Add failing radar tests**

Create `devops-capability-evidence-radar.spec.tsx`:

```tsx
import { render, screen } from '@testing-library/react';

import {
  devOpsCapabilityEvidenceItems,
  doraCapabilityDefinitions,
} from './devops-capability-evidence.data';
import { getCapabilityEvidenceScores } from './devops-capability-evidence.scoring';
import { DevOpsCapabilityEvidenceRadar } from './devops-capability-evidence-radar';

describe('DevOpsCapabilityEvidenceRadar', () => {
  it('renders evidence-backed DORA capability axes', () => {
    const scores = getCapabilityEvidenceScores(
      devOpsCapabilityEvidenceItems,
      doraCapabilityDefinitions,
    );

    render(<DevOpsCapabilityEvidenceRadar scores={scores} />);

    expect(screen.getByText('Continuous Delivery')).toBeTruthy();
    expect(screen.getByText('Flexible Infrastructure')).toBeTruthy();
    expect(screen.queryByText('Pervasive Security')).toBeNull();
    expect(screen.getByText(/Continuous Delivery 3 of 5/)).toBeTruthy();
  });

  it('renders nothing when no scores exist', () => {
    const { container } = render(<DevOpsCapabilityEvidenceRadar scores={[]} />);

    expect(container).toBeEmptyDOMElement();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run:

```bash
pnpm nx test github.io -- --run src/app/devops-capability-evidence/devops-capability-evidence-radar.spec.tsx
```

Expected: FAIL because the component does not exist.

- [ ] **Step 3: Implement radar component**

Create `devops-capability-evidence-radar.tsx` using the existing `DevOpsCapabilityRadar` chart pattern:

```tsx
import { VisuallyHidden } from '@astryxdesign/core/VisuallyHidden';
import { colorVars } from '@astryxdesign/core/theme/tokens.stylex';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { RadarChart, radarClasses } from '@mui/x-charts/RadarChart';
import type {} from '@mui/x-charts/themeAugmentation';
import type { ReactElement } from 'react';

import { getCapabilityScoreSummary } from './devops-capability-evidence.summary';
import type { DoraCapabilityScore } from './devops-capability-evidence.types';

const CHART_WIDTH = 420;
const CHART_HEIGHT = 420;
const RADAR_FOREGROUND = colorVars['--color-text-purple'];
const RADAR_BACKGROUND = colorVars['--color-background-purple'];

const radarTheme = createTheme({
  palette: {
    background: { paper: colorVars['--color-background-surface'] },
    divider: colorVars['--color-border-emphasized'],
    text: {
      primary: colorVars['--color-text-primary'],
      secondary: colorVars['--color-text-primary'],
    },
  },
});

export interface DevOpsCapabilityEvidenceRadarProps {
  scores: readonly DoraCapabilityScore[];
}

export function DevOpsCapabilityEvidenceRadar({
  scores,
}: DevOpsCapabilityEvidenceRadarProps): ReactElement | null {
  if (scores.length === 0) {
    return null;
  }

  return (
    <ThemeProvider theme={radarTheme}>
      <VisuallyHidden>{getCapabilityScoreSummary(scores)}</VisuallyHidden>
      <RadarChart
        aria-hidden="true"
        colors={[RADAR_BACKGROUND]}
        disableKeyboardNavigation
        divisions={5}
        height={CHART_HEIGHT}
        margin={{ top: 36, right: 72, bottom: 36, left: 72 }}
        radar={{
          metrics: scores.map((score) => ({
            name: score.label,
            min: 0,
            max: score.maxScore,
          })),
        }}
        series={[{ data: scores.map((score) => score.score), fillArea: true }]}
        shape="circular"
        skipAnimation
        slotProps={{ tooltip: { trigger: 'axis' } }}
        sx={{
          [`& .${radarClasses.axisLabel}`]: {
            fill: colorVars['--color-text-primary'],
            fontFamily: 'inherit !important',
            fontSize: '12px !important',
            fontWeight: 500,
            letterSpacing: '0 !important',
          },
          [`& .${radarClasses.seriesArea}`]: {
            fill: RADAR_BACKGROUND,
            fillOpacity: 0.64,
            stroke: RADAR_FOREGROUND,
            strokeWidth: 2,
          },
          [`& .${radarClasses.seriesMark}`]: {
            fill: RADAR_FOREGROUND,
            stroke: RADAR_FOREGROUND,
          },
        }}
        width={CHART_WIDTH}
      />
    </ThemeProvider>
  );
}
```

- [ ] **Step 4: Add radar Storybook story**

Create `devops-capability-evidence-radar.stories.tsx`:

```tsx
import type { Meta, StoryObj } from '@storybook/react-vite';

import {
  devOpsCapabilityEvidenceItems,
  doraCapabilityDefinitions,
} from './devops-capability-evidence.data';
import { getCapabilityEvidenceScores } from './devops-capability-evidence.scoring';
import { DevOpsCapabilityEvidenceRadar } from './devops-capability-evidence-radar';

const meta = {
  title: 'GitHub.io/DevOps Capability Evidence/Radar',
  component: DevOpsCapabilityEvidenceRadar,
  args: {
    scores: getCapabilityEvidenceScores(
      devOpsCapabilityEvidenceItems,
      doraCapabilityDefinitions,
    ),
  },
  parameters: {
    layout: 'centered',
  },
} satisfies Meta<typeof DevOpsCapabilityEvidenceRadar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const Empty: Story = { args: { scores: [] } };
```

- [ ] **Step 5: Run radar tests**

Run:

```bash
pnpm nx test github.io -- --run src/app/devops-capability-evidence/devops-capability-evidence-radar.spec.tsx
```

Expected: PASS.

- [ ] **Step 6: Commit task**

Run:

```bash
git add apps/github.io/src/app/devops-capability-evidence/devops-capability-evidence-radar.tsx apps/github.io/src/app/devops-capability-evidence/devops-capability-evidence-radar.spec.tsx apps/github.io/src/app/devops-capability-evidence/devops-capability-evidence-radar.stories.tsx
git commit -m "feat(github.io): add evidence-backed capability radar"
```

---

### Task 4: Build `DevOpsCapabilityBarList`

**Files:**
- Create: `apps/github.io/src/app/devops-capability-evidence/devops-capability-bar-list.tsx`
- Create: `apps/github.io/src/app/devops-capability-evidence/devops-capability-bar-list.spec.tsx`
- Create: `apps/github.io/src/app/devops-capability-evidence/devops-capability-bar-list.stories.tsx`

**Interfaces:**
- Consumes:
  - `DoraCapabilityScore[]`
  - `CapabilityEvidenceItem[]`
- Produces:
  - `DevOpsCapabilityBarList`

- [ ] **Step 1: Add failing bar list tests**

Create `devops-capability-bar-list.spec.tsx`:

```tsx
import { render, screen } from '@testing-library/react';

import {
  devOpsCapabilityEvidenceItems,
  doraCapabilityDefinitions,
} from './devops-capability-evidence.data';
import { getCapabilityEvidenceScores } from './devops-capability-evidence.scoring';
import { DevOpsCapabilityBarList } from './devops-capability-bar-list';

describe('DevOpsCapabilityBarList', () => {
  it('renders ranked capabilities with strongest evidence', () => {
    const scores = getCapabilityEvidenceScores(
      devOpsCapabilityEvidenceItems,
      doraCapabilityDefinitions,
    );

    render(
      <DevOpsCapabilityBarList
        evidence={devOpsCapabilityEvidenceItems}
        scores={scores}
      />,
    );

    expect(screen.getByText('Continuous Delivery')).toBeTruthy();
    expect(screen.getByText('CI/CD workflow ownership')).toBeTruthy();
    expect(screen.getAllByText(/3 of 5|4 of 5|5 of 5/).length).toBeGreaterThan(0);
  });

  it('renders nothing without scores', () => {
    const { container } = render(
      <DevOpsCapabilityBarList evidence={devOpsCapabilityEvidenceItems} scores={[]} />,
    );

    expect(container).toBeEmptyDOMElement();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run:

```bash
pnpm nx test github.io -- --run src/app/devops-capability-evidence/devops-capability-bar-list.spec.tsx
```

Expected: FAIL because the component does not exist.

- [ ] **Step 3: Implement bar list component**

Create `devops-capability-bar-list.tsx`:

```tsx
import type { ReactElement } from 'react';

import type {
  CapabilityEvidenceItem,
  DoraCapabilityScore,
} from './devops-capability-evidence.types';

export interface DevOpsCapabilityBarListProps {
  scores: readonly DoraCapabilityScore[];
  evidence: readonly CapabilityEvidenceItem[];
}

export function DevOpsCapabilityBarList({
  scores,
  evidence,
}: DevOpsCapabilityBarListProps): ReactElement | null {
  if (scores.length === 0) {
    return null;
  }

  const evidenceById = new Map(evidence.map((item) => [item.id, item]));
  const rankedScores = [...scores].sort((left, right) => right.score - left.score);

  return (
    <div aria-label="DevOps capability score list">
      {rankedScores.map((score) => {
        const strongestEvidence = score.strongestEvidenceId
          ? evidenceById.get(score.strongestEvidenceId)
          : undefined;
        const width = `${(score.score / score.maxScore) * 100}%`;

        return (
          <div key={score.capabilityKey}>
            <div>
              <span>{score.label}</span>
              <span>{score.score} of {score.maxScore}</span>
            </div>
            <div aria-hidden="true" style={{ background: 'var(--color-border)', height: 8 }}>
              <div
                style={{
                  background: 'var(--color-text-purple)',
                  height: 8,
                  width,
                }}
              />
            </div>
            {strongestEvidence ? <p>{strongestEvidence.title}</p> : null}
          </div>
        );
      })}
    </div>
  );
}
```

- [ ] **Step 4: Add Storybook story**

Create `devops-capability-bar-list.stories.tsx`:

```tsx
import type { Meta, StoryObj } from '@storybook/react-vite';

import {
  devOpsCapabilityEvidenceItems,
  doraCapabilityDefinitions,
} from './devops-capability-evidence.data';
import { getCapabilityEvidenceScores } from './devops-capability-evidence.scoring';
import { DevOpsCapabilityBarList } from './devops-capability-bar-list';

const meta = {
  title: 'GitHub.io/DevOps Capability Evidence/Bar List',
  component: DevOpsCapabilityBarList,
  args: {
    evidence: devOpsCapabilityEvidenceItems,
    scores: getCapabilityEvidenceScores(
      devOpsCapabilityEvidenceItems,
      doraCapabilityDefinitions,
    ),
  },
} satisfies Meta<typeof DevOpsCapabilityBarList>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const Empty: Story = { args: { scores: [] } };
```

- [ ] **Step 5: Run bar list tests**

Run:

```bash
pnpm nx test github.io -- --run src/app/devops-capability-evidence/devops-capability-bar-list.spec.tsx
```

Expected: PASS.

- [ ] **Step 6: Commit task**

Run:

```bash
git add apps/github.io/src/app/devops-capability-evidence/devops-capability-bar-list.tsx apps/github.io/src/app/devops-capability-evidence/devops-capability-bar-list.spec.tsx apps/github.io/src/app/devops-capability-evidence/devops-capability-bar-list.stories.tsx
git commit -m "feat(github.io): add capability evidence bar list"
```

---

### Task 5: Build `DevOpsCapabilityEvidenceMatrix`

**Files:**
- Create: `apps/github.io/src/app/devops-capability-evidence/devops-capability-evidence-matrix.tsx`
- Create: `apps/github.io/src/app/devops-capability-evidence/devops-capability-evidence-matrix.spec.tsx`
- Create: `apps/github.io/src/app/devops-capability-evidence/devops-capability-evidence-matrix.stories.tsx`

**Interfaces:**
- Consumes:
  - `CapabilityEvidenceMatrixRow[]`
  - `evidenceTypeLabels`
- Produces:
  - `DevOpsCapabilityEvidenceMatrix`

- [ ] **Step 1: Add failing matrix tests**

Create `devops-capability-evidence-matrix.spec.tsx`:

```tsx
import { render, screen } from '@testing-library/react';

import {
  devOpsCapabilityEvidenceItems,
  doraCapabilityDefinitions,
  evidenceTypeLabels,
} from './devops-capability-evidence.data';
import { getCapabilityEvidenceMatrix } from './devops-capability-evidence.scoring';
import { DevOpsCapabilityEvidenceMatrix } from './devops-capability-evidence-matrix';

describe('DevOpsCapabilityEvidenceMatrix', () => {
  it('renders capability rows and evidence type columns', () => {
    render(
      <DevOpsCapabilityEvidenceMatrix
        evidenceTypeLabels={evidenceTypeLabels}
        rows={getCapabilityEvidenceMatrix(
          devOpsCapabilityEvidenceItems,
          doraCapabilityDefinitions,
        )}
      />,
    );

    expect(screen.getByText('Flexible Infrastructure')).toBeTruthy();
    expect(screen.getByText('Learning')).toBeTruthy();
    expect(screen.getByText('Skills')).toBeTruthy();
    expect(screen.getByLabelText('Flexible Infrastructure has 1 learning item')).toBeTruthy();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run:

```bash
pnpm nx test github.io -- --run src/app/devops-capability-evidence/devops-capability-evidence-matrix.spec.tsx
```

Expected: FAIL because the component does not exist.

- [ ] **Step 3: Implement matrix component**

Create `devops-capability-evidence-matrix.tsx`:

```tsx
import type { ReactElement } from 'react';

import type { CapabilityEvidenceMatrixRow } from './devops-capability-evidence.scoring';
import type { EvidenceType } from './devops-capability-evidence.types';

const evidenceTypeOrder: EvidenceType[] = [
  'skill',
  'learning',
  'experience',
  'education',
  'certification',
  'project',
];

export interface DevOpsCapabilityEvidenceMatrixProps {
  rows: readonly CapabilityEvidenceMatrixRow[];
  evidenceTypeLabels: Record<EvidenceType, string>;
}

export function DevOpsCapabilityEvidenceMatrix({
  rows,
  evidenceTypeLabels,
}: DevOpsCapabilityEvidenceMatrixProps): ReactElement | null {
  if (rows.length === 0) {
    return null;
  }

  return (
    <table aria-label="DevOps capability evidence matrix">
      <thead>
        <tr>
          <th>Capability</th>
          {evidenceTypeOrder.map((type) => (
            <th key={type}>{evidenceTypeLabels[type]}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((row) => (
          <tr key={row.capabilityKey}>
            <th scope="row">{row.label}</th>
            {evidenceTypeOrder.map((type) => {
              const count = row.counts[type] ?? 0;
              const singularLabel = evidenceTypeLabels[type].toLowerCase().replace(/s$/, '');

              return (
                <td
                  aria-label={`${row.label} has ${count} ${singularLabel} item${count === 1 ? '' : 's'}`}
                  key={type}
                >
                  {count > 0 ? count : ''}
                </td>
              );
            })}
          </tr>
        ))}
      </tbody>
    </table>
  );
}
```

- [ ] **Step 4: Add Storybook story**

Create `devops-capability-evidence-matrix.stories.tsx`:

```tsx
import type { Meta, StoryObj } from '@storybook/react-vite';

import {
  devOpsCapabilityEvidenceItems,
  doraCapabilityDefinitions,
  evidenceTypeLabels,
} from './devops-capability-evidence.data';
import { getCapabilityEvidenceMatrix } from './devops-capability-evidence.scoring';
import { DevOpsCapabilityEvidenceMatrix } from './devops-capability-evidence-matrix';

const meta = {
  title: 'GitHub.io/DevOps Capability Evidence/Matrix',
  component: DevOpsCapabilityEvidenceMatrix,
  args: {
    evidenceTypeLabels,
    rows: getCapabilityEvidenceMatrix(
      devOpsCapabilityEvidenceItems,
      doraCapabilityDefinitions,
    ),
  },
} satisfies Meta<typeof DevOpsCapabilityEvidenceMatrix>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const Empty: Story = { args: { rows: [] } };
```

- [ ] **Step 5: Run matrix tests**

Run:

```bash
pnpm nx test github.io -- --run src/app/devops-capability-evidence/devops-capability-evidence-matrix.spec.tsx
```

Expected: PASS.

- [ ] **Step 6: Commit task**

Run:

```bash
git add apps/github.io/src/app/devops-capability-evidence/devops-capability-evidence-matrix.tsx apps/github.io/src/app/devops-capability-evidence/devops-capability-evidence-matrix.spec.tsx apps/github.io/src/app/devops-capability-evidence/devops-capability-evidence-matrix.stories.tsx
git commit -m "feat(github.io): add capability evidence matrix"
```

---

### Task 6: Build `DevOpsEvidenceTypeDonut`

**Files:**
- Create: `apps/github.io/src/app/devops-capability-evidence/devops-evidence-type-donut.tsx`
- Create: `apps/github.io/src/app/devops-capability-evidence/devops-evidence-type-donut.spec.tsx`
- Create: `apps/github.io/src/app/devops-capability-evidence/devops-evidence-type-donut.stories.tsx`

**Interfaces:**
- Consumes:
  - `Partial<Record<EvidenceType, number>>`
  - `getEvidenceTypeSummary(counts): string`
- Produces:
  - `DevOpsEvidenceTypeDonut`

- [ ] **Step 1: Add failing donut tests**

Create `devops-evidence-type-donut.spec.tsx`:

```tsx
import { render, screen } from '@testing-library/react';

import {
  devOpsCapabilityEvidenceItems,
  evidenceTypeLabels,
} from './devops-capability-evidence.data';
import { getEvidenceTypeCounts } from './devops-capability-evidence.scoring';
import { DevOpsEvidenceTypeDonut } from './devops-evidence-type-donut';

describe('DevOpsEvidenceTypeDonut', () => {
  it('renders accessible evidence type distribution', () => {
    render(
      <DevOpsEvidenceTypeDonut
        counts={getEvidenceTypeCounts(devOpsCapabilityEvidenceItems)}
        evidenceTypeLabels={evidenceTypeLabels}
      />,
    );

    expect(screen.getByText(/Evidence includes/)).toBeTruthy();
    expect(screen.getByText('Learning')).toBeTruthy();
    expect(screen.getByText('Projects')).toBeTruthy();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run:

```bash
pnpm nx test github.io -- --run src/app/devops-capability-evidence/devops-evidence-type-donut.spec.tsx
```

Expected: FAIL because the component does not exist.

- [ ] **Step 3: Implement donut component**

Create `devops-evidence-type-donut.tsx`. Use `PieChart` from the existing `@mui/x-charts` dependency and render a visible legend list so tests and assistive text do not depend on generated SVG internals.

```tsx
import { VisuallyHidden } from '@astryxdesign/core/VisuallyHidden';
import { PieChart } from '@mui/x-charts/PieChart';
import type { ReactElement } from 'react';

import { getEvidenceTypeSummary } from './devops-capability-evidence.summary';
import type { EvidenceType } from './devops-capability-evidence.types';

const evidenceTypeOrder: EvidenceType[] = [
  'skill',
  'learning',
  'experience',
  'education',
  'certification',
  'project',
];

export interface DevOpsEvidenceTypeDonutProps {
  counts: Partial<Record<EvidenceType, number>>;
  evidenceTypeLabels: Record<EvidenceType, string>;
}

export function DevOpsEvidenceTypeDonut({
  counts,
  evidenceTypeLabels,
}: DevOpsEvidenceTypeDonutProps): ReactElement | null {
  const entries = evidenceTypeOrder
    .map((type) => ({ type, count: counts[type] ?? 0 }))
    .filter((entry) => entry.count > 0);

  if (entries.length === 0) {
    return null;
  }

  return (
    <figure aria-label="DevOps evidence type distribution">
      <VisuallyHidden>{getEvidenceTypeSummary(counts)}</VisuallyHidden>
      <PieChart
        aria-hidden="true"
        height={220}
        series={[
          {
            data: entries.map((entry) => ({
              id: entry.type,
              value: entry.count,
              label: evidenceTypeLabels[entry.type],
            })),
            innerRadius: 56,
            outerRadius: 96,
            paddingAngle: 2,
          },
        ]}
        slotProps={{ legend: { hidden: true } }}
        width={220}
      />
      <ul>
        {entries.map((entry) => (
          <li key={entry.type}>
            <span>{evidenceTypeLabels[entry.type]}</span>
            <span>{entry.count}</span>
          </li>
        ))}
      </ul>
    </figure>
  );
}
```

- [ ] **Step 4: Add Storybook story**

Create `devops-evidence-type-donut.stories.tsx`:

```tsx
import type { Meta, StoryObj } from '@storybook/react-vite';

import {
  devOpsCapabilityEvidenceItems,
  evidenceTypeLabels,
} from './devops-capability-evidence.data';
import { getEvidenceTypeCounts } from './devops-capability-evidence.scoring';
import { DevOpsEvidenceTypeDonut } from './devops-evidence-type-donut';

const meta = {
  title: 'GitHub.io/DevOps Capability Evidence/Evidence Type Donut',
  component: DevOpsEvidenceTypeDonut,
  args: {
    counts: getEvidenceTypeCounts(devOpsCapabilityEvidenceItems),
    evidenceTypeLabels,
  },
} satisfies Meta<typeof DevOpsEvidenceTypeDonut>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const Empty: Story = { args: { counts: {} } };
```

- [ ] **Step 5: Run donut tests**

Run:

```bash
pnpm nx test github.io -- --run src/app/devops-capability-evidence/devops-evidence-type-donut.spec.tsx
```

Expected: PASS.

- [ ] **Step 6: Commit task**

Run:

```bash
git add apps/github.io/src/app/devops-capability-evidence/devops-evidence-type-donut.tsx apps/github.io/src/app/devops-capability-evidence/devops-evidence-type-donut.spec.tsx apps/github.io/src/app/devops-capability-evidence/devops-evidence-type-donut.stories.tsx
git commit -m "feat(github.io): add evidence type distribution"
```

---

### Task 7: Build `DevOpsEvidenceTimeline`

**Files:**
- Create: `apps/github.io/src/app/devops-capability-evidence/devops-evidence-timeline.tsx`
- Create: `apps/github.io/src/app/devops-capability-evidence/devops-evidence-timeline.spec.tsx`
- Create: `apps/github.io/src/app/devops-capability-evidence/devops-evidence-timeline.stories.tsx`

**Interfaces:**
- Consumes:
  - `CapabilityEvidenceItem[]`
  - `evidenceTypeLabels`
- Produces:
  - `DevOpsEvidenceTimeline`

- [ ] **Step 1: Add failing timeline tests**

Create `devops-evidence-timeline.spec.tsx`:

```tsx
import { render, screen } from '@testing-library/react';

import {
  devOpsCapabilityEvidenceItems,
  evidenceTypeLabels,
} from './devops-capability-evidence.data';
import { DevOpsEvidenceTimeline } from './devops-evidence-timeline';

describe('DevOpsEvidenceTimeline', () => {
  it('renders dated evidence in reverse chronological order', () => {
    render(
      <DevOpsEvidenceTimeline
        evidence={devOpsCapabilityEvidenceItems}
        evidenceTypeLabels={evidenceTypeLabels}
      />,
    );

    expect(screen.getByText('Kubernetes operations learning path')).toBeTruthy();
    expect(screen.getByText('Learning')).toBeTruthy();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run:

```bash
pnpm nx test github.io -- --run src/app/devops-capability-evidence/devops-evidence-timeline.spec.tsx
```

Expected: FAIL because the component does not exist.

- [ ] **Step 3: Implement timeline component**

Create `devops-evidence-timeline.tsx`:

```tsx
import type { ReactElement } from 'react';

import type {
  CapabilityEvidenceItem,
  EvidenceType,
} from './devops-capability-evidence.types';

export interface DevOpsEvidenceTimelineProps {
  evidence: readonly CapabilityEvidenceItem[];
  evidenceTypeLabels: Record<EvidenceType, string>;
}

export function DevOpsEvidenceTimeline({
  evidence,
  evidenceTypeLabels,
}: DevOpsEvidenceTimelineProps): ReactElement | null {
  const datedEvidence = evidence
    .filter((item) => item.isPublic && (item.date ?? item.endDate))
    .sort((left, right) =>
      (right.date ?? right.endDate ?? '').localeCompare(left.date ?? left.endDate ?? ''),
    );

  if (datedEvidence.length === 0) {
    return null;
  }

  return (
    <ol aria-label="DevOps capability evidence timeline">
      {datedEvidence.map((item) => (
        <li key={item.id}>
          <time dateTime={item.date ?? item.endDate}>{item.date ?? item.endDate}</time>
          <strong>{item.title}</strong>
          <span>{evidenceTypeLabels[item.type]}</span>
          <p>{item.summary}</p>
        </li>
      ))}
    </ol>
  );
}
```

- [ ] **Step 4: Add Storybook story**

Create `devops-evidence-timeline.stories.tsx`:

```tsx
import type { Meta, StoryObj } from '@storybook/react-vite';

import {
  devOpsCapabilityEvidenceItems,
  evidenceTypeLabels,
} from './devops-capability-evidence.data';
import { DevOpsEvidenceTimeline } from './devops-evidence-timeline';

const meta = {
  title: 'GitHub.io/DevOps Capability Evidence/Timeline',
  component: DevOpsEvidenceTimeline,
  args: {
    evidence: devOpsCapabilityEvidenceItems,
    evidenceTypeLabels,
  },
} satisfies Meta<typeof DevOpsEvidenceTimeline>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const Empty: Story = { args: { evidence: [] } };
```

- [ ] **Step 5: Run timeline tests**

Run:

```bash
pnpm nx test github.io -- --run src/app/devops-capability-evidence/devops-evidence-timeline.spec.tsx
```

Expected: PASS.

- [ ] **Step 6: Commit task**

Run:

```bash
git add apps/github.io/src/app/devops-capability-evidence/devops-evidence-timeline.tsx apps/github.io/src/app/devops-capability-evidence/devops-evidence-timeline.spec.tsx apps/github.io/src/app/devops-capability-evidence/devops-evidence-timeline.stories.tsx
git commit -m "feat(github.io): add capability evidence timeline"
```

---

### Task 8: Build `DevOpsCertificationCapabilityMap`

**Files:**
- Create: `apps/github.io/src/app/devops-capability-evidence/devops-certification-capability-map.tsx`
- Create: `apps/github.io/src/app/devops-capability-evidence/devops-certification-capability-map.spec.tsx`
- Create: `apps/github.io/src/app/devops-capability-evidence/devops-certification-capability-map.stories.tsx`

**Interfaces:**
- Consumes:
  - `CapabilityEvidenceItem[]`
  - `DoraCapabilityDefinition[]`
- Produces:
  - `DevOpsCertificationCapabilityMap`

- [ ] **Step 1: Add failing certification map tests**

Create `devops-certification-capability-map.spec.tsx`:

```tsx
import { render, screen } from '@testing-library/react';

import {
  devOpsCapabilityEvidenceItems,
  doraCapabilityDefinitions,
} from './devops-capability-evidence.data';
import { DevOpsCertificationCapabilityMap } from './devops-certification-capability-map';

describe('DevOpsCertificationCapabilityMap', () => {
  it('renders certifications mapped to capability labels', () => {
    render(
      <DevOpsCertificationCapabilityMap
        capabilities={doraCapabilityDefinitions}
        evidence={devOpsCapabilityEvidenceItems}
      />,
    );

    expect(screen.getByLabelText('DevOps certification capability map')).toBeTruthy();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run:

```bash
pnpm nx test github.io -- --run src/app/devops-capability-evidence/devops-certification-capability-map.spec.tsx
```

Expected: FAIL because the component does not exist.

- [ ] **Step 3: Implement certification map**

Create `devops-certification-capability-map.tsx`:

```tsx
import type { ReactElement } from 'react';

import type {
  CapabilityEvidenceItem,
  DoraCapabilityDefinition,
} from './devops-capability-evidence.types';

export interface DevOpsCertificationCapabilityMapProps {
  evidence: readonly CapabilityEvidenceItem[];
  capabilities: readonly DoraCapabilityDefinition[];
}

export function DevOpsCertificationCapabilityMap({
  evidence,
  capabilities,
}: DevOpsCertificationCapabilityMapProps): ReactElement | null {
  const capabilitiesByKey = new Map(capabilities.map((capability) => [capability.key, capability]));
  const certifications = evidence.filter(
    (item) => item.isPublic && item.type === 'certification',
  );

  if (certifications.length === 0) {
    return null;
  }

  return (
    <div aria-label="DevOps certification capability map">
      {certifications.map((certification) => (
        <section key={certification.id}>
          <h3>{certification.title}</h3>
          {certification.issuer ? <p>{certification.issuer}</p> : null}
          <ul>
            {certification.capabilityKeys.map((key) => {
              const capability = capabilitiesByKey.get(key);
              return capability ? <li key={key}>{capability.label}</li> : null;
            })}
          </ul>
        </section>
      ))}
    </div>
  );
}
```

- [ ] **Step 4: Add Storybook story**

Create `devops-certification-capability-map.stories.tsx`:

```tsx
import type { Meta, StoryObj } from '@storybook/react-vite';

import {
  devOpsCapabilityEvidenceItems,
  doraCapabilityDefinitions,
} from './devops-capability-evidence.data';
import { DevOpsCertificationCapabilityMap } from './devops-certification-capability-map';

const meta = {
  title: 'GitHub.io/DevOps Capability Evidence/Certification Map',
  component: DevOpsCertificationCapabilityMap,
  args: {
    capabilities: doraCapabilityDefinitions,
    evidence: devOpsCapabilityEvidenceItems,
  },
} satisfies Meta<typeof DevOpsCertificationCapabilityMap>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const Empty: Story = { args: { evidence: [] } };
```

- [ ] **Step 5: Run certification map tests**

Run:

```bash
pnpm nx test github.io -- --run src/app/devops-capability-evidence/devops-certification-capability-map.spec.tsx
```

Expected: PASS.

- [ ] **Step 6: Commit task**

Run:

```bash
git add apps/github.io/src/app/devops-capability-evidence/devops-certification-capability-map.tsx apps/github.io/src/app/devops-capability-evidence/devops-certification-capability-map.spec.tsx apps/github.io/src/app/devops-capability-evidence/devops-certification-capability-map.stories.tsx apps/github.io/src/app/devops-capability-evidence/devops-capability-evidence.data.ts
git commit -m "feat(github.io): add certification capability map"
```

---

## Final Verification

After all tasks are complete, run:

```bash
pnpm nx test github.io
pnpm nx build github.io
```

Expected: both commands pass.

If Storybook verification is feasible, run the project Storybook command documented in `apps/github.io/project.json` and inspect the new `GitHub.io/DevOps Capability Evidence/*` stories.

## Handoff Criteria

- Every component has a focused test and Storybook story.
- No component is wired into a route, app shell, or dashboard layout.
- Score-based components hide score `0` capabilities.
- Skills are evidence-linked.
- Private company details are not present in seed data or rendered text.
- Final `pnpm nx test github.io` and `pnpm nx build github.io` results are recorded in the implementation handoff.
