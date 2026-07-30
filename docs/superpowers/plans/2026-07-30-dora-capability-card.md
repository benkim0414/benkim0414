# DORA Capability Card Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build reusable `github.io` DORA capability cards that render a full capability title, description, and merged evidence rows from the existing evidence catalog.

**Architecture:** Keep evidence selection and row grouping in a pure helper beside the current DevOps capability evidence model. Render the UI with a focused `DoraCapabilityCard` component that delegates each evidence item to the existing `CapabilityEvidence` renderer, preserving current labels, icons, links, and citation behavior.

**Tech Stack:** React 19, TypeScript, Nx, Vitest, Testing Library, Storybook, Astryx `Card` and layout primitives, StyleX, existing `CapabilityEvidence`.

## Global Constraints

- Work in `/home/benkim0414/workspace/benkim0414/.worktrees/dora-capability-card`.
- Use `pnpm` for Nx and Vitest commands.
- Do not change `devOpsCapabilityEvidenceItems`.
- Do not change `curatedDevOpsCapabilityRadarScores`.
- Do not change radar scoring or public filtering rules.
- Do not add the card to the main app page.
- Do not create a separate compact token renderer; delegate evidence display to `CapabilityEvidence`.
- Evidence rows must render in this visual order: skills, certifications, other evidence.
- Evidence rows must not have visible row labels.
- Evidence rows must wrap automatically when evidence overflows.
- Check Astryx docs before UI implementation with `pnpm exec astryx docs styling` and `pnpm exec astryx docs layout`.
- Stage explicit paths only. Do not use `git add -A`, `git add --all`, `git add -u`, `git add .`, `git commit -a`, or `git commit -am`.

---

## File Structure

- Create `apps/github.io/src/app/devops-capability-evidence/dora-capability-card.data.ts`
  - Owns `doraCapabilityDescriptions`.
- Create `apps/github.io/src/app/devops-capability-evidence/dora-capability-card.types.ts`
  - Owns card-specific evidence row and props types.
- Create `apps/github.io/src/app/devops-capability-evidence/dora-capability-card.evidence.ts`
  - Owns `getDoraCapabilityCardEvidenceRows()`.
- Create `apps/github.io/src/app/devops-capability-evidence/dora-capability-card.evidence.spec.ts`
  - Tests description coverage, curated ordering, fallback selection, grouping, empty rows, and unresolved curated IDs.
- Create `apps/github.io/src/app/devops-capability-evidence/dora-capability-card.tsx`
  - Owns the reusable React card component.
- Create `apps/github.io/src/app/devops-capability-evidence/dora-capability-card.spec.tsx`
  - Tests title, description, row order, hidden row labels, `CapabilityEvidence` delegation, and real Flexible Infrastructure rendering.
- Create `apps/github.io/src/app/devops-capability-evidence/dora-capability-card.stories.tsx`
  - Storybook coverage with real merged evidence.

---

### Task 1: Evidence Descriptions And Row Helper

**Files:**
- Create: `apps/github.io/src/app/devops-capability-evidence/dora-capability-card.data.ts`
- Create: `apps/github.io/src/app/devops-capability-evidence/dora-capability-card.types.ts`
- Create: `apps/github.io/src/app/devops-capability-evidence/dora-capability-card.evidence.ts`
- Create: `apps/github.io/src/app/devops-capability-evidence/dora-capability-card.evidence.spec.ts`

**Interfaces:**
- Consumes:
  - `CapabilityEvidenceItem`, `DoraCapabilityKey`, `DoraCapabilityScore`, and `EvidenceType` from `./devops-capability-evidence.types`.
- Produces:
  - `doraCapabilityDescriptions: Record<DoraCapabilityKey, string>`
  - `type DoraCapabilityCardEvidenceGroup = 'skills' | 'certifications' | 'other'`
  - `interface DoraCapabilityCardEvidenceRow { group: DoraCapabilityCardEvidenceGroup; evidence: readonly CapabilityEvidenceItem[] }`
  - `getDoraCapabilityCardEvidenceRows(capabilityKey: DoraCapabilityKey, evidence: readonly CapabilityEvidenceItem[], scores?: readonly DoraCapabilityScore[]): DoraCapabilityCardEvidenceRow[]`

- [ ] **Step 1: Write the failing helper tests**

Create `apps/github.io/src/app/devops-capability-evidence/dora-capability-card.evidence.spec.ts`:

```ts
import {
  curatedDevOpsCapabilityRadarScores,
  devOpsCapabilityEvidenceItems,
  doraCapabilityDefinitions,
} from './devops-capability-evidence.data';
import {
  doraCapabilityDescriptions,
  getDoraCapabilityCardEvidenceRows,
} from './dora-capability-card.evidence';
import type {
  CapabilityEvidenceItem,
  DoraCapabilityScore,
} from './devops-capability-evidence.types';

function evidence(
  overrides: Partial<CapabilityEvidenceItem>,
): CapabilityEvidenceItem {
  return {
    id: 'evidence',
    title: 'Evidence',
    label: 'Evidence',
    type: 'experience',
    capabilityKeys: ['continuous-integration'],
    summary: 'Public-safe DORA card helper test evidence.',
    isPublic: true,
    strength: 'strong',
    ...overrides,
  };
}

describe('doraCapabilityDescriptions', () => {
  it('defines descriptions for every DORA capability definition', () => {
    expect(Object.keys(doraCapabilityDescriptions).sort()).toEqual(
      doraCapabilityDefinitions.map((capability) => capability.key).sort(),
    );

    for (const capability of doraCapabilityDefinitions) {
      expect(doraCapabilityDescriptions[capability.key].length).toBeGreaterThan(
        48,
      );
    }
  });
});

describe('getDoraCapabilityCardEvidenceRows', () => {
  it('selects evidence in curated score order', () => {
    const rows = getDoraCapabilityCardEvidenceRows(
      'continuous-integration',
      devOpsCapabilityEvidenceItems,
      curatedDevOpsCapabilityRadarScores,
    );

    expect(rows.map((row) => row.group)).toEqual(['other']);
    expect(rows[0]?.evidence.map((item) => item.id)).toEqual([
      'github-actions-ci',
      'team-delivery-workflow',
      'protected-review-gates',
      'nx-affected-quality-gates',
      'regression-gates',
    ]);
  });

  it('groups selected evidence as skills, certifications, then other evidence', () => {
    const rows = getDoraCapabilityCardEvidenceRows(
      'flexible-infrastructure',
      devOpsCapabilityEvidenceItems,
      curatedDevOpsCapabilityRadarScores,
    );

    expect(rows.map((row) => row.group)).toEqual([
      'skills',
      'certifications',
      'other',
    ]);
    expect(rows[0]?.evidence.map((item) => item.id)).toEqual([
      'kubernetes-skill',
    ]);
    expect(rows[1]?.evidence.map((item) => item.id)).toEqual([
      'cncf-kubernetes-certification',
    ]);
    expect(rows[2]?.evidence.map((item) => item.id)).toEqual([
      'kubernetes-workloads',
      'kubectl-troubleshooting',
      'cluster-operations',
      'irsa-service-accounts',
      'terraform-scoped-iam',
    ]);
  });

  it('falls back to capability key filtering when scores are absent', () => {
    const rows = getDoraCapabilityCardEvidenceRows('test-automation', [
      evidence({
        id: 'test-skill',
        title: 'TypeScript',
        type: 'skill',
        capabilityKeys: ['test-automation'],
      }),
      evidence({
        id: 'test-experience',
        label: 'Regression gates',
        type: 'experience',
        capabilityKeys: ['test-automation'],
      }),
      evidence({
        id: 'unrelated',
        label: 'Unrelated',
        capabilityKeys: ['version-control'],
      }),
    ]);

    expect(rows).toHaveLength(2);
    expect(rows[0]?.group).toBe('skills');
    expect(rows[0]?.evidence.map((item) => item.id)).toEqual(['test-skill']);
    expect(rows[1]?.group).toBe('other');
    expect(rows[1]?.evidence.map((item) => item.id)).toEqual([
      'test-experience',
    ]);
  });

  it('omits curated score ids that are not present in the evidence catalog', () => {
    const scores: DoraCapabilityScore[] = [
      {
        capabilityKey: 'continuous-delivery',
        label: 'Delivery',
        score: 4,
        maxScore: 5,
        evidenceIds: ['missing', 'delivery'],
        strongestEvidenceId: 'delivery',
        evidenceCounts: { experience: 1 },
      },
    ];
    const rows = getDoraCapabilityCardEvidenceRows(
      'continuous-delivery',
      [
        evidence({
          id: 'delivery',
          label: 'Delivery',
          capabilityKeys: ['continuous-delivery'],
        }),
      ],
      scores,
    );

    expect(rows).toHaveLength(1);
    expect(rows[0]?.evidence.map((item) => item.id)).toEqual(['delivery']);
  });

  it('returns an empty array when there is no matching evidence', () => {
    expect(
      getDoraCapabilityCardEvidenceRows('pervasive-security', [
        evidence({ id: 'ci-only', capabilityKeys: ['continuous-integration'] }),
      ]),
    ).toEqual([]);
  });
});
```

- [ ] **Step 2: Run the helper tests to verify they fail**

Run:

```bash
pnpm exec vitest run --config apps/github.io/vite.config.ts \
  apps/github.io/src/app/devops-capability-evidence/dora-capability-card.evidence.spec.ts
```

Expected: FAIL because `dora-capability-card.evidence` does not exist.

- [ ] **Step 3: Add card-specific types**

Create `apps/github.io/src/app/devops-capability-evidence/dora-capability-card.types.ts`:

```ts
import type {
  CapabilityEvidenceItem,
  DoraCapabilityDefinition,
  DoraCapabilityScore,
} from './devops-capability-evidence.types';

export type DoraCapabilityCardEvidenceGroup =
  | 'skills'
  | 'certifications'
  | 'other';

export interface DoraCapabilityCardEvidenceRow {
  group: DoraCapabilityCardEvidenceGroup;
  evidence: readonly CapabilityEvidenceItem[];
}

export interface DoraCapabilityCardProps {
  capability: DoraCapabilityDefinition;
  description: string;
  evidence: readonly CapabilityEvidenceItem[];
  scores?: readonly DoraCapabilityScore[];
}
```

- [ ] **Step 4: Add capability descriptions**

Create `apps/github.io/src/app/devops-capability-evidence/dora-capability-card.data.ts`:

```ts
import type { DoraCapabilityKey } from './devops-capability-evidence.types';

export const doraCapabilityDescriptions = {
  'continuous-delivery':
    'Keeps software releasable through small changes, repeatable release paths, and fast feedback before production.',
  'deployment-automation':
    'Uses automated deployment paths so releases are repeatable, visible, and less dependent on manual coordination.',
  'continuous-integration':
    'Integrates changes frequently with automated checks that expose quality and compatibility issues early.',
  'test-automation':
    'Builds confidence through repeatable automated tests across important product and delivery workflows.',
  'monitoring-observability':
    'Makes systems understandable in operation through telemetry, alerting, debugging signals, and production feedback.',
  'flexible-infrastructure':
    'Uses adaptable infrastructure practices that support repeatable environments, scaling, recovery, and change.',
  'pervasive-security':
    'Treats security as part of everyday delivery through secure defaults, review, automation, and risk-aware practices.',
  'trunk-based-development':
    'Keeps integration paths short through small changes, shared branches, and fast review or merge feedback.',
  'documentation-quality':
    'Keeps technical context findable and maintainable through accurate docs, decision records, and operational notes.',
  'version-control':
    'Uses source control practices that preserve history, support collaboration, and make changes reviewable.',
} as const satisfies Record<DoraCapabilityKey, string>;
```

- [ ] **Step 5: Add the pure evidence row helper**

Create `apps/github.io/src/app/devops-capability-evidence/dora-capability-card.evidence.ts`:

```ts
import type {
  CapabilityEvidenceItem,
  DoraCapabilityKey,
  DoraCapabilityScore,
  EvidenceType,
} from './devops-capability-evidence.types';
import { doraCapabilityDescriptions } from './dora-capability-card.data';
import type {
  DoraCapabilityCardEvidenceGroup,
  DoraCapabilityCardEvidenceRow,
} from './dora-capability-card.types';

export { doraCapabilityDescriptions };

const evidenceGroupOrder = [
  'skills',
  'certifications',
  'other',
] as const satisfies readonly DoraCapabilityCardEvidenceGroup[];

function getEvidenceGroup(type: EvidenceType): DoraCapabilityCardEvidenceGroup {
  if (type === 'skill') {
    return 'skills';
  }

  if (type === 'certification') {
    return 'certifications';
  }

  return 'other';
}

function getOrderedEvidence(
  capabilityKey: DoraCapabilityKey,
  evidence: readonly CapabilityEvidenceItem[],
  scores: readonly DoraCapabilityScore[] | undefined,
): CapabilityEvidenceItem[] {
  const score = scores?.find((entry) => entry.capabilityKey === capabilityKey);

  if (!score) {
    return evidence.filter((item) => item.capabilityKeys.includes(capabilityKey));
  }

  const evidenceById = new Map(evidence.map((item) => [item.id, item]));

  return score.evidenceIds.flatMap((id) => {
    const item = evidenceById.get(id);
    return item ? [item] : [];
  });
}

export function getDoraCapabilityCardEvidenceRows(
  capabilityKey: DoraCapabilityKey,
  evidence: readonly CapabilityEvidenceItem[],
  scores?: readonly DoraCapabilityScore[],
): DoraCapabilityCardEvidenceRow[] {
  const grouped = new Map<
    DoraCapabilityCardEvidenceGroup,
    CapabilityEvidenceItem[]
  >();

  for (const item of getOrderedEvidence(capabilityKey, evidence, scores)) {
    const group = getEvidenceGroup(item.type);
    grouped.set(group, [...(grouped.get(group) ?? []), item]);
  }

  return evidenceGroupOrder.flatMap((group) => {
    const groupEvidence = grouped.get(group) ?? [];

    if (groupEvidence.length === 0) {
      return [];
    }

    return [{ group, evidence: groupEvidence }];
  });
}
```

- [ ] **Step 6: Run the helper tests to verify they pass**

Run:

```bash
pnpm exec vitest run --config apps/github.io/vite.config.ts \
  apps/github.io/src/app/devops-capability-evidence/dora-capability-card.evidence.spec.ts
```

Expected: PASS.

- [ ] **Step 7: Run the related evidence data tests**

Run:

```bash
pnpm exec vitest run --config apps/github.io/vite.config.ts \
  apps/github.io/src/app/devops-capability-evidence/dora-capability-card.evidence.spec.ts \
  apps/github.io/src/app/devops-capability-evidence/devops-capability-evidence.spec.ts
```

Expected: PASS.

- [ ] **Step 8: Inspect the diff**

Run:

```bash
git diff -- \
  apps/github.io/src/app/devops-capability-evidence/dora-capability-card.data.ts \
  apps/github.io/src/app/devops-capability-evidence/dora-capability-card.types.ts \
  apps/github.io/src/app/devops-capability-evidence/dora-capability-card.evidence.ts \
  apps/github.io/src/app/devops-capability-evidence/dora-capability-card.evidence.spec.ts
```

Expected: the diff only adds the description map, types, pure helper, and helper tests.

- [ ] **Step 9: Commit the helper layer**

Run:

```bash
git add \
  apps/github.io/src/app/devops-capability-evidence/dora-capability-card.data.ts \
  apps/github.io/src/app/devops-capability-evidence/dora-capability-card.types.ts \
  apps/github.io/src/app/devops-capability-evidence/dora-capability-card.evidence.ts \
  apps/github.io/src/app/devops-capability-evidence/dora-capability-card.evidence.spec.ts
git commit -m "feat(github.io): add dora capability evidence rows"
```

Expected: commit succeeds with only Task 1 files staged.

---

### Task 2: Reusable DORA Capability Card Component

**Files:**
- Create: `apps/github.io/src/app/devops-capability-evidence/dora-capability-card.tsx`
- Create: `apps/github.io/src/app/devops-capability-evidence/dora-capability-card.spec.tsx`

**Interfaces:**
- Consumes:
  - `DoraCapabilityCardProps` and `DoraCapabilityCardEvidenceRow` from `./dora-capability-card.types`.
  - `getDoraCapabilityCardEvidenceRows()` from `./dora-capability-card.evidence`.
  - `CapabilityEvidence` from `./capability-evidence`.
- Produces:
  - `DoraCapabilityCard({ capability, description, evidence, scores }: DoraCapabilityCardProps): ReactElement`

- [ ] **Step 1: Write the failing component tests**

Create `apps/github.io/src/app/devops-capability-evidence/dora-capability-card.spec.tsx`:

```tsx
import { render, screen, within } from '@testing-library/react';

import {
  curatedDevOpsCapabilityRadarScores,
  devOpsCapabilityEvidenceItems,
  doraCapabilityDefinitions,
} from './devops-capability-evidence.data';
import { DoraCapabilityCard } from './dora-capability-card';
import { doraCapabilityDescriptions } from './dora-capability-card.evidence';
import type { CapabilityEvidenceItem } from './devops-capability-evidence.types';

const flexibleInfrastructure = doraCapabilityDefinitions.find(
  (capability) => capability.key === 'flexible-infrastructure',
);
const continuousIntegration = doraCapabilityDefinitions.find(
  (capability) => capability.key === 'continuous-integration',
);

if (!flexibleInfrastructure || !continuousIntegration) {
  throw new Error('Missing DORA capability fixture');
}

function evidence(
  overrides: Partial<CapabilityEvidenceItem>,
): CapabilityEvidenceItem {
  return {
    id: 'evidence',
    title: 'Evidence',
    label: 'Evidence',
    type: 'experience',
    capabilityKeys: ['continuous-integration'],
    summary: 'Public-safe DORA capability card component test evidence.',
    isPublic: true,
    strength: 'strong',
    ...overrides,
  };
}

describe('DoraCapabilityCard', () => {
  it('renders the full capability title and description', () => {
    render(
      <DoraCapabilityCard
        capability={continuousIntegration}
        description={doraCapabilityDescriptions['continuous-integration']}
        evidence={devOpsCapabilityEvidenceItems}
        scores={curatedDevOpsCapabilityRadarScores}
      />,
    );

    expect(
      screen.getByRole('heading', { name: 'Continuous Integration' }),
    ).toBeTruthy();
    expect(
      screen.getByText(
        doraCapabilityDescriptions['continuous-integration'],
      ),
    ).toBeTruthy();
    expect(screen.getByTestId('dora-capability-card')).toBeTruthy();
  });

  it('renders evidence rows in skill, certification, other order without visible row labels', () => {
    render(
      <DoraCapabilityCard
        capability={flexibleInfrastructure}
        description={doraCapabilityDescriptions['flexible-infrastructure']}
        evidence={devOpsCapabilityEvidenceItems}
        scores={curatedDevOpsCapabilityRadarScores}
      />,
    );

    const rows = screen.getAllByTestId('dora-capability-evidence-row');

    expect(rows).toHaveLength(3);
    expect(rows.map((row) => row.getAttribute('data-group'))).toEqual([
      'skills',
      'certifications',
      'other',
    ]);
    expect(screen.queryByText('Skills')).toBeNull();
    expect(screen.queryByText('Certifications')).toBeNull();
    expect(screen.queryByText('Other')).toBeNull();
  });

  it('delegates evidence rendering to CapabilityEvidence', () => {
    render(
      <DoraCapabilityCard
        capability={flexibleInfrastructure}
        description={doraCapabilityDescriptions['flexible-infrastructure']}
        evidence={devOpsCapabilityEvidenceItems}
        scores={curatedDevOpsCapabilityRadarScores}
      />,
    );

    expect(screen.getByTestId('skill-token')).toBeTruthy();
    expect(
      screen.getByRole('group', { name: 'Skill evidence: Kubernetes' }),
    ).toBeTruthy();
    expect(
      screen.getByRole('group', {
        name: 'Certification evidence: Kubernetes cert',
      }),
    ).toBeTruthy();
    expect(
      screen.getByRole('group', { name: 'Learning evidence: Workloads' }),
    ).toBeTruthy();
  });

  it('uses curated score order within each evidence group', () => {
    render(
      <DoraCapabilityCard
        capability={continuousIntegration}
        description={doraCapabilityDescriptions['continuous-integration']}
        evidence={devOpsCapabilityEvidenceItems}
        scores={curatedDevOpsCapabilityRadarScores}
      />,
    );

    const row = screen.getByTestId('dora-capability-evidence-row');

    expect(
      within(row)
        .getAllByRole('group')
        .map((group) => group.getAttribute('aria-label')),
    ).toEqual([
      'Experience evidence: GitHub Actions',
      'Experience evidence: Team delivery',
      'Experience evidence: Protected reviews',
      'Experience evidence: Nx affected',
      'Experience evidence: Regression gates',
    ]);
  });

  it('falls back to capability key filtering when scores are omitted', () => {
    render(
      <DoraCapabilityCard
        capability={continuousIntegration}
        description={doraCapabilityDescriptions['continuous-integration']}
        evidence={[
          evidence({
            id: 'ci',
            label: 'CI',
            capabilityKeys: ['continuous-integration'],
          }),
          evidence({
            id: 'version-control',
            label: 'Versioning',
            capabilityKeys: ['version-control'],
          }),
        ]}
      />,
    );

    expect(screen.getByRole('group', { name: 'Experience evidence: CI' })).toBeTruthy();
    expect(
      screen.queryByRole('group', { name: 'Experience evidence: Versioning' }),
    ).toBeNull();
  });

  it('marks evidence rows as wrapping lists', () => {
    render(
      <DoraCapabilityCard
        capability={continuousIntegration}
        description={doraCapabilityDescriptions['continuous-integration']}
        evidence={devOpsCapabilityEvidenceItems}
        scores={curatedDevOpsCapabilityRadarScores}
      />,
    );

    const row = screen.getByTestId('dora-capability-evidence-row');

    expect(row.getAttribute('data-wrap')).toBe('true');
    expect(
      screen.getByRole('list', {
        name: 'Continuous Integration other evidence',
      }),
    ).toBe(row);
  });

  it('omits evidence rows when no evidence matches', () => {
    render(
      <DoraCapabilityCard
        capability={continuousIntegration}
        description={doraCapabilityDescriptions['continuous-integration']}
        evidence={[]}
        scores={[]}
      />,
    );

    expect(screen.queryByTestId('dora-capability-evidence-row')).toBeNull();
  });
});
```

- [ ] **Step 2: Run the component tests to verify they fail**

Run:

```bash
pnpm exec vitest run --config apps/github.io/vite.config.ts \
  apps/github.io/src/app/devops-capability-evidence/dora-capability-card.spec.tsx
```

Expected: FAIL because `dora-capability-card.tsx` does not exist.

- [ ] **Step 3: Check Astryx docs for card styling and layout**

Run:

```bash
pnpm exec astryx docs styling
pnpm exec astryx docs layout
```

Expected: both commands print Astryx styling and layout guidance. Use those docs to keep the implementation on Astryx primitives and StyleX token variables.

- [ ] **Step 4: Add the card component implementation**

Create `apps/github.io/src/app/devops-capability-evidence/dora-capability-card.tsx`:

```tsx
import { Card } from '@astryxdesign/core/Card';
import { VStack } from '@astryxdesign/core/Layout';
import {
  colorVars,
  spacingVars,
  typeScaleVars,
} from '@astryxdesign/core/theme/tokens.stylex';
import * as stylex from '@stylexjs/stylex';
import { useId, type ReactElement } from 'react';

import { CapabilityEvidence } from './capability-evidence';
import { getDoraCapabilityCardEvidenceRows } from './dora-capability-card.evidence';
import type {
  DoraCapabilityCardEvidenceGroup,
  DoraCapabilityCardEvidenceRow,
  DoraCapabilityCardProps,
} from './dora-capability-card.types';

const evidenceGroupLabels = {
  skills: 'skill evidence',
  certifications: 'certification evidence',
  other: 'other evidence',
} as const satisfies Record<DoraCapabilityCardEvidenceGroup, string>;

const styles = stylex.create({
  root: {
    display: 'block',
    maxWidth: `calc(${spacingVars['--spacing-12']} * 9)`,
    width: '100%',
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
  evidenceRows: {
    display: 'flex',
    flexDirection: 'column',
    gap: spacingVars['--spacing-2'],
  },
  evidenceRow: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: spacingVars['--spacing-2'],
    margin: 0,
    padding: 0,
    listStyle: 'none',
  },
  evidenceItem: {
    display: 'inline-flex',
    maxWidth: '100%',
  },
});

function rowLabel(
  capabilityLabel: string,
  group: DoraCapabilityCardEvidenceGroup,
) {
  return `${capabilityLabel} ${evidenceGroupLabels[group]}`;
}

function DoraCapabilityEvidenceRow({
  capabilityLabel,
  row,
}: {
  capabilityLabel: string;
  row: DoraCapabilityCardEvidenceRow;
}): ReactElement {
  return (
    <ul
      {...stylex.props(styles.evidenceRow)}
      aria-label={rowLabel(capabilityLabel, row.group)}
      data-group={row.group}
      data-testid="dora-capability-evidence-row"
      data-wrap="true"
    >
      {row.evidence.map((item, index) => (
        <li {...stylex.props(styles.evidenceItem)} key={item.id}>
          <CapabilityEvidence evidence={item} citationNumber={index + 1} />
        </li>
      ))}
    </ul>
  );
}

export function DoraCapabilityCard({
  capability,
  description,
  evidence,
  scores,
}: DoraCapabilityCardProps): ReactElement {
  const titleId = useId();
  const rows = getDoraCapabilityCardEvidenceRows(
    capability.key,
    evidence,
    scores,
  );

  return (
    <Card padding={4} xstyle={styles.root}>
      <article aria-labelledby={titleId} data-testid="dora-capability-card">
        <VStack gap={3}>
          <VStack gap={1}>
            <h3 id={titleId} {...stylex.props(styles.title)}>
              {capability.label}
            </h3>
            <p {...stylex.props(styles.description)}>{description}</p>
          </VStack>

          {rows.length > 0 ? (
            <div {...stylex.props(styles.evidenceRows)}>
              {rows.map((row) => (
                <DoraCapabilityEvidenceRow
                  capabilityLabel={capability.label}
                  key={row.group}
                  row={row}
                />
              ))}
            </div>
          ) : null}
        </VStack>
      </article>
    </Card>
  );
}
```

- [ ] **Step 5: Run the component tests to verify they pass**

Run:

```bash
pnpm exec vitest run --config apps/github.io/vite.config.ts \
  apps/github.io/src/app/devops-capability-evidence/dora-capability-card.spec.tsx
```

Expected: PASS.

- [ ] **Step 6: Run helper, component, and evidence consistency tests**

Run:

```bash
pnpm exec vitest run --config apps/github.io/vite.config.ts \
  apps/github.io/src/app/devops-capability-evidence/dora-capability-card.evidence.spec.ts \
  apps/github.io/src/app/devops-capability-evidence/dora-capability-card.spec.tsx \
  apps/github.io/src/app/devops-capability-evidence/devops-capability-evidence.spec.ts \
  apps/github.io/src/app/devops-capability-evidence/capability-evidence.spec.tsx
```

Expected: PASS.

- [ ] **Step 7: Inspect the diff**

Run:

```bash
git diff -- \
  apps/github.io/src/app/devops-capability-evidence/dora-capability-card.tsx \
  apps/github.io/src/app/devops-capability-evidence/dora-capability-card.spec.tsx
```

Expected: the diff only adds the reusable card component and component tests.

- [ ] **Step 8: Commit the component**

Run:

```bash
git add \
  apps/github.io/src/app/devops-capability-evidence/dora-capability-card.tsx \
  apps/github.io/src/app/devops-capability-evidence/dora-capability-card.spec.tsx
git commit -m "feat(github.io): add dora capability card"
```

Expected: commit succeeds with only Task 2 files staged.

---

### Task 3: Storybook Coverage With Real Evidence

**Files:**
- Create: `apps/github.io/src/app/devops-capability-evidence/dora-capability-card.stories.tsx`

**Interfaces:**
- Consumes:
  - `DoraCapabilityCard` from `./dora-capability-card`.
  - `doraCapabilityDescriptions` from `./dora-capability-card.evidence`.
  - `curatedDevOpsCapabilityRadarScores`, `devOpsCapabilityEvidenceItems`, and `doraCapabilityDefinitions` from `./devops-capability-evidence.data`.
- Produces:
  - Storybook stories under `GitHub.io/DevOps Capability Evidence/DORA Capability Card`.

- [ ] **Step 1: Add the Storybook stories**

Create `apps/github.io/src/app/devops-capability-evidence/dora-capability-card.stories.tsx`:

```tsx
import type { Meta, StoryObj } from '@storybook/react-vite';

import { DoraCapabilityCard } from './dora-capability-card';
import { doraCapabilityDescriptions } from './dora-capability-card.evidence';
import {
  curatedDevOpsCapabilityRadarScores,
  devOpsCapabilityEvidenceItems,
  doraCapabilityDefinitions,
} from './devops-capability-evidence.data';
import type {
  DoraCapabilityDefinition,
  DoraCapabilityKey,
} from './devops-capability-evidence.types';

function capability(key: DoraCapabilityKey): DoraCapabilityDefinition {
  const definition = doraCapabilityDefinitions.find(
    (entry) => entry.key === key,
  );

  if (!definition) {
    throw new Error(`Missing DORA capability definition: ${key}`);
  }

  return definition;
}

const flexibleInfrastructure = capability('flexible-infrastructure');
const continuousIntegration = capability('continuous-integration');
const monitoringObservability = capability('monitoring-observability');
const documentationQuality = capability('documentation-quality');

const meta = {
  component: DoraCapabilityCard,
  title: 'GitHub.io/DevOps Capability Evidence/DORA Capability Card',
  args: {
    capability: flexibleInfrastructure,
    description: doraCapabilityDescriptions['flexible-infrastructure'],
    evidence: devOpsCapabilityEvidenceItems,
    scores: curatedDevOpsCapabilityRadarScores,
  },
  parameters: {
    layout: 'centered',
  },
} satisfies Meta<typeof DoraCapabilityCard>;

export default meta;

type Story = StoryObj<typeof meta>;

export const FlexibleInfrastructure: Story = {};

export const ContinuousIntegration: Story = {
  args: {
    capability: continuousIntegration,
    description: doraCapabilityDescriptions['continuous-integration'],
  },
};

export const MonitoringAndObservability: Story = {
  args: {
    capability: monitoringObservability,
    description: doraCapabilityDescriptions['monitoring-observability'],
  },
};

export const DocumentationQuality: Story = {
  args: {
    capability: documentationQuality,
    description: doraCapabilityDescriptions['documentation-quality'],
  },
};

export const WrappingStress: Story = {
  args: {
    capability: flexibleInfrastructure,
    description: doraCapabilityDescriptions['flexible-infrastructure'],
    evidence: [
      ...devOpsCapabilityEvidenceItems,
      {
        id: 'storybook-extra-platform-automation',
        title: 'Platform automation review practice',
        label: 'Platform automation',
        type: 'experience',
        organization: 'Storybook fixture',
        capabilityKeys: ['flexible-infrastructure'],
        summary:
          'Storybook-only evidence item that creates a wider wrapping row for visual review.',
        technologies: ['Kubernetes', 'Terraform'],
        isPublic: true,
        strength: 'supporting',
      },
    ],
    scores: undefined,
  },
};
```

- [ ] **Step 2: Run the card tests after adding stories**

Run:

```bash
pnpm exec vitest run --config apps/github.io/vite.config.ts \
  apps/github.io/src/app/devops-capability-evidence/dora-capability-card.evidence.spec.ts \
  apps/github.io/src/app/devops-capability-evidence/dora-capability-card.spec.tsx
```

Expected: PASS.

- [ ] **Step 3: Inspect the story diff**

Run:

```bash
git diff -- apps/github.io/src/app/devops-capability-evidence/dora-capability-card.stories.tsx
```

Expected: the diff only adds stories using real merged data.

- [ ] **Step 4: Commit Storybook coverage**

Run:

```bash
git add apps/github.io/src/app/devops-capability-evidence/dora-capability-card.stories.tsx
git commit -m "test(github.io): add dora capability card stories"
```

Expected: commit succeeds with only the story file staged.

---

### Task 4: Final Verification And Review Prep

**Files:**
- No planned source edits.
- Verification may reveal fixes in Task 1, Task 2, or Task 3 files; if so, stage only the affected paths.

**Interfaces:**
- Consumes:
  - All files created in Tasks 1 through 3.
- Produces:
  - Passing focused tests, app tests/build where feasible, and a clean review-ready branch.

- [ ] **Step 1: Run all focused DORA card and evidence tests**

Run:

```bash
pnpm exec vitest run --config apps/github.io/vite.config.ts \
  apps/github.io/src/app/devops-capability-evidence/dora-capability-card.evidence.spec.ts \
  apps/github.io/src/app/devops-capability-evidence/dora-capability-card.spec.tsx \
  apps/github.io/src/app/devops-capability-evidence/devops-capability-evidence.spec.ts \
  apps/github.io/src/app/devops-capability-evidence/capability-evidence.spec.tsx \
  apps/github.io/src/app/certifications/certification-citation.spec.tsx \
  apps/github.io/src/app/skills/skill-token.spec.tsx
```

Expected: PASS.

- [ ] **Step 2: Run the app test target**

Run:

```bash
pnpm nx test github.io
```

Expected: PASS. If Vitest discovers duplicate configs from unrelated linked worktrees, rerun with the app config and record the exact discovery failure:

```bash
pnpm exec vitest run --config apps/github.io/vite.config.ts
```

- [ ] **Step 3: Run the app build**

Run:

```bash
pnpm nx build github.io
```

Expected: PASS.

- [ ] **Step 4: Inspect branch status and diff**

Run:

```bash
git status --short --branch
git diff
git diff --cached
```

Expected: no unstaged or staged changes remain after all logical commits.

- [ ] **Step 5: Run a local review pass**

Review the branch against the spec and check:

```bash
git log --oneline --max-count=5
git show --stat --oneline HEAD
```

Expected: commits are split by helper, component, stories, and any verification fix. No commit changes the merged evidence catalog, radar scores, or app page integration.

- [ ] **Step 6: Report verification**

Include this status in the implementation handoff:

```text
Focused tests: <command> -> <result>
App tests: <command> -> <result or exact blocker>
App build: <command> -> <result or exact blocker>
Review status: clean branch or listed remaining changes
```

Expected: the user can see exactly what passed and what, if anything, was skipped or blocked.
