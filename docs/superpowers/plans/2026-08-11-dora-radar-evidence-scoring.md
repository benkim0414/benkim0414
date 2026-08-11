# Evidence-Calibrated DORA Radar Scoring Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Derive all ten DORA Radar scores from their curated capability-card evidence, calibrate them to half-step values with exceptional `4.5` and theoretical `5` headroom, and render a ten-division Radar grid.

**Architecture:** Replace the unused whole-catalog additive scorer with a pure curated-projection scorer that validates evidence references and derives every score-owned field. Convert the production score fixtures into projection inputs, compute the existing exported score collection from the aggregate catalog, and leave all consumers on that stable export. Change only the Radar grid density after the data migration is covered by exact tests.

**Tech Stack:** TypeScript, React, Vitest, Testing Library, Nx, pnpm, MUI X Charts `RadarChart`.

## Global Constraints

- Work only in the linked worktree on `feat/dora-radar-evidence-scoring`.
- Use only public, non-sensitive evidence referenced by each curated capability-card projection.
- Applied weights are `primary = 1.0`, `strong = 0.75`, and `supporting = 0.5`, capped at `3.5`.
- Breadth adds `0.5` for a second distinct initiative and another `0.5` for a third, capped at `1.0`.
- Corroboration is capped at `0.5` and requires visible certification, education, or learning evidence, or at least three visible skills backed by same-projection applied evidence.
- Multiply raw maturity by `0.8`, round to the nearest `0.5`, and cap ordinary scores at `4.0`.
- Award `4.5` only with at least three primary outcomes across three initiatives plus corroboration; never award `5`.
- Keep `maxScore` at `5`, preserve capability and evidence ordering, and do not use recency in scoring.
- Preserve the Radar's current layout, theme, colors, labels, tooltip, and animation behavior.
- Stage explicit paths only and use conventional commit subjects.

---

### Task 1: Implement the curated evidence scoring contract

**Files:**
- Modify: `apps/github.io/src/app/devops-capability-evidence/devops-capability-evidence.types.ts:91-100`
- Modify: `apps/github.io/src/app/devops-capability-evidence/devops-capability-evidence.scoring.ts:1-108`
- Create: `apps/github.io/src/app/devops-capability-evidence/devops-capability-evidence.scoring.spec.ts`
- Modify: `apps/github.io/src/app/devops-capability-evidence/devops-capability-evidence.spec.ts:1439-1514`

**Interfaces:**
- Consumes: `CapabilityEvidenceItem`, `DoraCapabilityKey`, `EvidenceStrength`, and `EvidenceType` from `devops-capability-evidence.types.ts`.
- Produces: `DoraCapabilityScoreProjection` and `getCapabilityEvidenceScores(projections, items): DoraCapabilityScore[]` for Task 2.

- [ ] **Step 1: Add failing scorer tests with reusable typed fixtures**

Create `devops-capability-evidence.scoring.spec.ts` with helpers that construct complete evidence records and projections:

```ts
import type {
  CapabilityEvidenceInitiativeId,
  CapabilityEvidenceItem,
  DoraCapabilityScoreProjection,
  EvidenceStrength,
  EvidenceType,
} from './devops-capability-evidence.types';
import { getCapabilityEvidenceScores } from './devops-capability-evidence.scoring';

const capabilityKey = 'continuous-delivery' as const;

function makeEvidence({
  id,
  strength = 'primary',
  type = 'experience',
  initiativeId,
  supportingEvidenceIds,
  isPublic = true,
  isSensitive,
  date = '2025-01-01',
}: {
  id: string;
  strength?: EvidenceStrength;
  type?: EvidenceType;
  initiativeId?: CapabilityEvidenceInitiativeId;
  supportingEvidenceIds?: readonly string[];
  isPublic?: boolean;
  isSensitive?: boolean;
  date?: string;
}): CapabilityEvidenceItem {
  return {
    id,
    title: id,
    type,
    capabilityKeys: [capabilityKey],
    date,
    summary: `${id} summary`,
    isPublic,
    isSensitive,
    strength,
    supportingEvidenceIds,
    details: initiativeId
      ? {
          initiative: { id: initiativeId, label: initiativeId },
          period: { startedAt: '2025-01-01' },
          metrics: [],
          facts: [],
        }
      : undefined,
  };
}

function makeProjection(
  evidenceIds: readonly string[],
): DoraCapabilityScoreProjection {
  return {
    capabilityKey,
    label: 'Delivery',
    evidenceIds,
    evidenceSummary: 'Curated delivery evidence.',
  };
}
```

Add explicit test cases for:

```ts
it.each([
  ['primary', 1],
  ['strong', 0.5],
  ['supporting', 0.5],
] as const)('calibrates one %s applied outcome to %s', (strength, expected) => {
  const item = makeEvidence({ id: strength, strength });
  expect(getCapabilityEvidenceScores([makeProjection([item.id])], [item])[0]
    .score).toBe(expected);
});
```

Also construct and assert these complete scenarios:

- five applied items with two primary and three strong strengths across three initiatives plus three backed skills produce the ordinary cap `4.0` rather than `4.5`;
- three primary items across `aws-codepipeline-platform`, `github-actions-monorepo`, and `delivery-repository-practices`, plus three backed skills, produce exceptional `4.5`;
- the same exceptional fixture without its third primary, third initiative, or corroboration does not produce `4.5`;
- two primary items produce `1.5`, while adding three same-projection backed skills raises the rounded result to `2.0` and adding more skills does not raise it again;
- certifications, education, and learning each activate the same single `0.5` corroboration subtotal;
- unsupported skills and skills supported only by evidence outside the projection do not activate corroboration;
- changing only evidence dates leaves the score unchanged;
- `evidenceCounts`, `maxScore: 5`, `evidenceSummary`, and strongest-evidence tie order are derived correctly;
- missing, duplicate, private, sensitive, and wrong-capability evidence references throw errors containing the capability key and offending evidence ID.

- [ ] **Step 2: Run the tests and verify the old scorer contract fails**

Run: `pnpm nx test github.io`

Expected: FAIL because `DoraCapabilityScoreProjection` does not exist and `getCapabilityEvidenceScores` still accepts the full catalog plus capability definitions.

- [ ] **Step 3: Add the projection type**

Add this beside `DoraCapabilityScore`:

```ts
export interface DoraCapabilityScoreProjection {
  capabilityKey: DoraCapabilityKey;
  label: string;
  evidenceIds: readonly string[];
  evidenceSummary?: string;
}
```

Keep `DoraCapabilityScore` unchanged for existing consumers.

- [ ] **Step 4: Replace the additive scorer with the calibrated projection scorer**

In `devops-capability-evidence.scoring.ts`, retain `getPublicCapabilityEvidence`, `getEvidenceTypeCounts`, and `getCapabilityEvidenceMatrix`. Replace only the old `getCapabilityEvidenceScores(items, definitions)` implementation.

Use these constants and helpers:

```ts
const appliedEvidenceTypes = new Set<EvidenceType>(['experience', 'project']);
const corroboratingEvidenceTypes = new Set<EvidenceType>([
  'certification',
  'education',
  'learning',
]);
const evidenceStrengthScore: Record<EvidenceStrength, number> = {
  supporting: 0.5,
  strong: 0.75,
  primary: 1,
};
const APPLIED_SCORE_CAP = 3.5;
const BREADTH_SCORE_CAP = 1;
const CORROBORATION_SCORE = 0.5;
const SCORE_CALIBRATION = 0.8;
const ORDINARY_SCORE_CAP = 4;
const EXCEPTIONAL_SCORE = 4.5;
const MAX_SCORE = 5 as const;

function roundToHalf(value: number): number {
  return Math.round(value * 2) / 2;
}
```

Implement the final interface exactly:

```ts
export function getCapabilityEvidenceScores(
  projections: readonly DoraCapabilityScoreProjection[],
  items: readonly CapabilityEvidenceItem[],
): DoraCapabilityScore[]
```

For each projection:

1. Reject duplicate projection IDs.
2. Resolve IDs from the aggregate catalog in projection order.
3. Reject missing, private, sensitive, or wrong-capability records with a descriptive error.
4. Select `experience` and `project` records as applied evidence.
5. Sum applied weights and cap at `3.5`.
6. Count distinct `details.initiative.id` values and compute `Math.min(1, Math.max(0, count - 1) * 0.5)`.
7. Count skills with at least one `supportingEvidenceId` in the same projection's applied-ID set.
8. Set corroboration to `0.5` when a curated certification, education, or learning record exists, or at least three backed skills exist.
9. Compute `Math.min(4, roundToHalf((applied + breadth + corroboration) * 0.8))`.
10. Override to `4.5` only when primary count is at least three, initiative count is at least three, and corroboration is present.
11. Derive evidence counts directly from the resolved projection and select the first item at the strongest weight.
12. Return the complete score with `maxScore: 5`.

- [ ] **Step 5: Remove obsolete whole-catalog score tests from the aggregate spec**

Delete the old `derives non-zero capability scores from evidence` test and the score-producing half of `omits definitions without evidence from scores and the matrix`. Keep the matrix assertion as a renamed `omits definitions without evidence from the matrix` test.

Update `builds accessible summaries` to use a literal `DoraCapabilityScore` fixture with `score: 3.5` and assert `Continuous Delivery 3.5 of 5`. Keep the independent evidence-type summary assertion unchanged. Remove the now-unused scoring import from this spec.

- [ ] **Step 6: Run focused project verification**

Run: `pnpm nx test github.io`

Expected: PASS, including the new scoring spec and the existing aggregate evidence tests.

Run: `pnpm nx typecheck github.io`

Expected: PASS with the new projection interface and scorer signature.

- [ ] **Step 7: Commit the scoring contract**

```bash
git add apps/github.io/src/app/devops-capability-evidence/devops-capability-evidence.types.ts
git add apps/github.io/src/app/devops-capability-evidence/devops-capability-evidence.scoring.ts
git add apps/github.io/src/app/devops-capability-evidence/devops-capability-evidence.scoring.spec.ts
git add apps/github.io/src/app/devops-capability-evidence/devops-capability-evidence.spec.ts
git diff --cached
git commit -m "feat(github.io): calculate calibrated DORA scores"
```

### Task 2: Derive the production Radar scores from card projections

**Files:**
- Modify: `apps/github.io/src/app/devops-capability-evidence/devops-capability-evidence.data.ts:1-410`
- Modify: `apps/github.io/src/app/devops-capability-evidence/devops-capability-evidence.spec.ts:403-500`
- Modify: `apps/github.io/src/app/devops-capability-evidence/devops-capability-evidence-radar.spec.tsx:8-46`

**Interfaces:**
- Consumes: `DoraCapabilityScoreProjection` and `getCapabilityEvidenceScores(projections, items)` from Task 1.
- Produces: the unchanged `curatedDevOpsCapabilityRadarScores: readonly DoraCapabilityScore[]` export with derived half-step scores.

- [ ] **Step 1: Change production expectations before changing data construction**

Update the exact score assertion to expect this ordered result:

```ts
[
  ['version-control', 'Versioning', 4.5],
  ['trunk-based-development', 'Trunk', 3.5],
  ['continuous-integration', 'CI', 3.5],
  ['test-automation', 'Tests', 3.5],
  ['pervasive-security', 'Security', 3.5],
  ['continuous-delivery', 'Delivery', 3.5],
  ['deployment-automation', 'Deploys', 3],
  ['flexible-infrastructure', 'Infrastructure', 3.5],
  ['monitoring-observability', 'Observability', 3],
  ['documentation-quality', 'Docs', 3],
]
```

Map each production score to `[capabilityKey, label, score]` for this assertion. Add separate assertions that every score has `maxScore === 5`, `score <= 4.5`, and `Number.isInteger(score * 2)`.

Update the Radar accessible-summary expectation to:

```ts
/Versioning 4.5 of 5, Trunk 3.5 of 5, CI 3.5 of 5, Tests 3.5 of 5, Security 3.5 of 5, Delivery 3.5 of 5, Deploys 3 of 5, Infrastructure 3.5 of 5, Observability 3 of 5, Docs 3 of 5/
```

- [ ] **Step 2: Run tests and verify the handwritten values fail**

Run: `pnpm nx test github.io`

Expected: FAIL in the production score and Radar summary assertions because the current data still contains whole-number handwritten scores.

- [ ] **Step 3: Convert handwritten score objects into curated projections**

Import `getCapabilityEvidenceScores` and `DoraCapabilityScoreProjection`. Rename the current array to an unexported `curatedDevOpsCapabilityRadarScoreProjections` and make it satisfy `readonly DoraCapabilityScoreProjection[]`.

For all ten projections, preserve `capabilityKey`, `label`, the full ordered `evidenceIds` expression including skill-array spreads, and `evidenceSummary`. Remove only these derived properties:

```ts
score
maxScore
strongestEvidenceId
evidenceCounts
```

Do not rewrite the evidence arrays or summaries while removing those properties.

- [ ] **Step 4: Export computed scores after the aggregate catalog declaration**

Immediately after `devOpsCapabilityEvidenceItems` is fully declared, add:

```ts
export const curatedDevOpsCapabilityRadarScores =
  getCapabilityEvidenceScores(
    curatedDevOpsCapabilityRadarScoreProjections,
    devOpsCapabilityEvidenceItems,
  );
```

Leave every existing consumer import unchanged.

- [ ] **Step 5: Assert derived metadata against the card projection**

Extend the aggregate data test to verify Version Control derives:

```ts
{
  score: 4.5,
  maxScore: 5,
  strongestEvidenceId: 'terraform-codepipeline-platform',
  evidenceCounts: { experience: 5, skill: 13 },
}
```

Retain existing tests that lock evidence IDs, summaries, ordering, and public safety. Add a check that each score's `evidenceCounts` totals to its `evidenceIds.length`.

- [ ] **Step 6: Run project verification**

Run: `pnpm nx test github.io`

Expected: PASS with all ten recalculated scores and decimal accessible summaries.

Run: `pnpm nx typecheck github.io`

Expected: PASS with the computed export inferred as `DoraCapabilityScore[]`.

- [ ] **Step 7: Commit the production data migration**

```bash
git add apps/github.io/src/app/devops-capability-evidence/devops-capability-evidence.data.ts
git add apps/github.io/src/app/devops-capability-evidence/devops-capability-evidence.spec.ts
git add apps/github.io/src/app/devops-capability-evidence/devops-capability-evidence-radar.spec.tsx
git diff --cached
git commit -m "feat(github.io): derive Radar scores from card evidence"
```

### Task 3: Render the Radar in half-step divisions

**Files:**
- Modify: `apps/github.io/src/app/devops-capability-evidence/devops-capability-evidence-radar.tsx:12-17,86-98`
- Modify: `apps/github.io/src/app/devops-capability-evidence/devops-capability-evidence-radar.spec.tsx:8-46`

**Interfaces:**
- Consumes: derived decimal `DoraCapabilityScore[]` from Task 2.
- Produces: a Radar whose unchanged `0–5` domain has ten `0.5` divisions.

- [ ] **Step 1: Add a failing grid-density assertion**

In the main Radar rendering test, import `radarClasses` from `@mui/x-charts/RadarChart` and assert:

```ts
expect(
  container.querySelectorAll(`.${radarClasses.gridDivider}`),
).toHaveLength(10);
```

Keep the existing axis labels, accessible summary, keyboard-navigation, empty-data, and zero-filter assertions.

- [ ] **Step 2: Run tests and verify the current five divisions fail**

Run: `pnpm nx test github.io`

Expected: FAIL because the rendered Radar contains five grid-divider elements.

- [ ] **Step 3: Change only the Radar division count**

In `DevOpsCapabilityEvidenceRadar`, change:

```tsx
divisions={5}
```

to:

```tsx
divisions={10}
```

Do not change dimensions, margins, metrics, series construction, theme, `sx`, tooltip, shape, or animation props.

- [ ] **Step 4: Run component and build verification**

Run: `pnpm nx test github.io`

Expected: PASS, including ten grid dividers and decimal score summaries.

Run: `pnpm nx build-storybook github.io`

Expected: PASS and produce the static Storybook without Radar warnings.

- [ ] **Step 5: Visually inspect the existing Radar stories**

Run: `pnpm nx storybook github.io`

Open `GitHub.io/DevOps Capability Evidence/Radar` and inspect `Default` and `NarrowViewport`. Confirm ten rings remain legible at `400 × 300`, labels are not clipped, the polygon matches the recalculated values, and no new horizontal overflow appears. Stop the Storybook process after inspection.

- [ ] **Step 6: Commit the Radar scale change**

```bash
git add apps/github.io/src/app/devops-capability-evidence/devops-capability-evidence-radar.tsx
git add apps/github.io/src/app/devops-capability-evidence/devops-capability-evidence-radar.spec.tsx
git diff --cached
git commit -m "feat(github.io): show half-step DORA Radar scale"
```

### Task 4: Complete branch verification and review

**Files:**
- Verify: `apps/github.io/src/app/devops-capability-evidence/`
- Verify: `docs/superpowers/specs/2026-08-11-dora-radar-evidence-scoring-design.md`
- Verify: `docs/superpowers/plans/2026-08-11-dora-radar-evidence-scoring.md`

**Interfaces:**
- Consumes: the three committed implementation deliverables.
- Produces: a locally reviewed, tested branch ready for the repository's separate handoff stage; no push or PR.

- [ ] **Step 1: Run the complete focused quality gate**

```bash
pnpm nx test github.io
pnpm nx lint github.io
pnpm nx typecheck github.io
pnpm nx build github.io
pnpm nx build-storybook github.io
```

Expected: all five commands PASS. Record the test-file and test counts from Vitest.

- [ ] **Step 2: Inspect branch scope and commit structure**

```bash
git status --short --branch
git log --oneline --decorate main..HEAD
git diff --check main...HEAD
git diff --stat main...HEAD
git diff main...HEAD -- apps/github.io/src/app/devops-capability-evidence
```

Expected: only the scoring contract, production projection migration, Radar division change, tests, spec, and plan are present; the working tree is clean; logical changes remain separately committed.

- [ ] **Step 3: Run Codex `/review` against the branch diff**

Review specifically for score-formula mistakes, accidental evidence reordering, silent invalid-reference handling, type drift, inaccessible decimal output, and MUI Radar regressions. If review finds an issue, reproduce it with a failing test, apply the smallest fix, rerun the five-command quality gate, and commit the fix with an explicit conventional subject and explicit staged paths.

- [ ] **Step 4: Stop at awaiting handoff**

Report the final commits, exact score table, verification results, visual Storybook result, and any review findings. Do not push, open a PR, merge, deploy, or delete the worktree; those actions belong to the user-approved handoff stage.
