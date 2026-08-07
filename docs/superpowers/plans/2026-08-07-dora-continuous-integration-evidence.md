# DORA Continuous Integration Evidence Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace illustrative Continuous Integration card evidence with a measured, public-safe atomic evidence catalog and show its strongest five records in Storybook.

**Architecture:** Add optional structured evidence details to the existing domain model and keep the Continuous Integration records in a focused data module that is composed into `devOpsCapabilityEvidenceItems`. The current card remains unchanged and continues selecting evidence through the ordered Continuous Integration score; future pages can read initiative, period, metrics, and facts from the same records.

**Tech Stack:** TypeScript 5.9, React 19, Vitest 4, Storybook 10, Nx 23, pnpm workspace, Astryx-backed existing card components

## Global Constraints

- Work only in the linked worktree at `/home/benkim0414/workspace/benkim0414/.worktrees/dora-ci-evidence` on `feat/dora-ci-evidence`.
- Do not copy from or link to the private evidence repository.
- Do not store employer names, private repository/service/workflow/module names, AWS account IDs or regions, secret or SSM parameter paths, or business-domain identifiers.
- Use generalized context such as `standalone repositories`, `services`, `source monorepo`, and `operations monorepo`.
- Preserve useful public technology names: AWS CodePipeline, AWS CodeBuild, GitHub Actions, Nx, Terraform, Docker, Amazon ECR, AWS Systems Manager Parameter Store, PostgreSQL, Kustomize, Argo CD, Git, GitHub, OIDC, commitlint, Husky, and Slack.
- Exact approved numbers, percentages, and dates may be public when their surrounding text contains no private identifier.
- Keep every contribution atomic; do not collapse an initiative into one oversized evidence item.
- Store the complete approved CI evidence set, but render only the curated top five in the card.
- Keep the Continuous Integration score at 4 of 5.
- Do not revise other capability scores, build the future capability page, or change `DoraCapabilityCard` layout or behavior.
- Keep existing broad evidence records when another capability score still references them.
- Stage explicit paths only and use conventional commits with the `github.io` scope.
- Run commands from the worktree. Use `../../node_modules/.bin/*` so pnpm does not attempt an automatic install from the linked worktree.

---

## File Structure

- `apps/github.io/src/app/devops-capability-evidence/devops-capability-evidence.types.ts`
  owns the reusable structured initiative, period, metric, and evidence-detail interfaces.
- `apps/github.io/src/app/devops-capability-evidence/continuous-integration-evidence.data.ts`
  owns the two initiative constants and all atomic Continuous Integration evidence records.
- `apps/github.io/src/app/devops-capability-evidence/continuous-integration-evidence.data.spec.ts`
  protects record identity, structure, metrics, public-safe content, and initiative balance.
- `apps/github.io/src/app/devops-capability-evidence/devops-capability-evidence.data.ts`
  composes the CI records into the shared catalog and selects the top five through the curated score.
- `apps/github.io/src/app/devops-capability-evidence/devops-capability-evidence.spec.ts`
  protects shared-catalog and score integrity.
- `apps/github.io/src/app/devops-capability-evidence/dora-capability-card.evidence.spec.ts`
  protects the exact evidence order rendered by the card helper.
- `apps/github.io/src/app/devops-capability-evidence/dora-capability-card.stories.spec.ts`
  proves the Continuous Integration story uses shared data and resolves the five approved labels.

---

### Task 1: Add The Structured Atomic CI Evidence Catalog

**Files:**
- Modify: `apps/github.io/src/app/devops-capability-evidence/devops-capability-evidence.types.ts:28-55`
- Create: `apps/github.io/src/app/devops-capability-evidence/continuous-integration-evidence.data.ts`
- Create: `apps/github.io/src/app/devops-capability-evidence/continuous-integration-evidence.data.spec.ts`

**Interfaces:**
- Consumes: existing `CapabilityEvidenceItem`, `DoraCapabilityKey`, and `EvidenceStrength` types.
- Produces: `CapabilityEvidenceInitiativeId`, `CapabilityEvidenceInitiative`, `CapabilityEvidencePeriod`, `CapabilityEvidenceMetric`, `CapabilityEvidenceDetails`, `continuousIntegrationEvidenceInitiatives`, and `continuousIntegrationEvidenceItems`.

- [ ] **Step 1: Write the failing atomic-catalog test**

Create `continuous-integration-evidence.data.spec.ts` with these exact record IDs and structural checks:

```ts
import {
  continuousIntegrationEvidenceInitiatives,
  continuousIntegrationEvidenceItems,
} from './continuous-integration-evidence.data';

const expectedIds = [
  'terraform-codepipeline-platform',
  'codebuild-pr-gates',
  'codebuild-postgresql-tests',
  'codebuild-feedback-tuning',
  'ecr-immutable-promotion',
  'codepipeline-webhook-trunk',
  'nx-monorepo-migration',
  'nx-affected-quality-gates',
  'github-actions-container-verification',
  'github-actions-oidc-ecr-publishing',
  'github-actions-gitops-handoff',
  'kustomize-tag-update-reliability',
  'github-actions-failure-notifications',
  'tested-ci-automation',
  'commitlint-small-batches',
];

const isoDate = /^\d{4}-\d{2}-\d{2}$/;

describe('continuousIntegrationEvidenceItems', () => {
  it('stores every approved contribution as one atomic record', () => {
    expect(continuousIntegrationEvidenceItems.map((item) => item.id)).toEqual(
      expectedIds,
    );
    expect(new Set(expectedIds)).toHaveProperty('size', expectedIds.length);
  });

  it('uses the two approved public initiative identities', () => {
    expect(continuousIntegrationEvidenceInitiatives).toEqual({
      awsCodePipelinePlatform: {
        id: 'aws-codepipeline-platform',
        label: 'AWS CodePipeline platform',
      },
      githubActionsMonorepo: {
        id: 'github-actions-monorepo',
        label: 'GitHub Actions monorepo migration',
      },
    });

    const counts = Object.fromEntries(
      Object.values(continuousIntegrationEvidenceInitiatives).map(
        (initiative) => [
          initiative.id,
          continuousIntegrationEvidenceItems.filter(
            (item) => item.details?.initiative.id === initiative.id,
          ).length,
        ],
      ),
    );

    expect(counts).toEqual({
      'aws-codepipeline-platform': 6,
      'github-actions-monorepo': 9,
    });
  });

  it('stores valid public structured details', () => {
    const initiativeIds = new Set(
      Object.values(continuousIntegrationEvidenceInitiatives).map(
        (initiative) => initiative.id,
      ),
    );

    for (const item of continuousIntegrationEvidenceItems) {
      expect(item.type).toBe('experience');
      expect(item.capabilityKeys).toContain('continuous-integration');
      expect(item.isPublic).toBe(true);
      expect(item.isSensitive).not.toBe(true);
      expect(item.organization).toBeUndefined();
      expect(item.proofUrl).toBeUndefined();
      expect(item.details).toBeDefined();
      expect(initiativeIds).toContain(item.details?.initiative.id);
      expect(item.details?.period.startedAt).toMatch(isoDate);

      if (item.details?.period.endedAt) {
        expect(item.details.period.endedAt).toMatch(isoDate);
      }

      expect(item.details?.facts.length).toBeGreaterThan(0);

      for (const metric of item.details?.metrics ?? []) {
        expect(Number.isFinite(metric.value)).toBe(true);
        expect(metric.value).toBeGreaterThanOrEqual(0);
        expect(metric.measuredAt).toMatch(isoDate);

        if (metric.unit === 'percent') {
          expect(metric.value).toBeLessThanOrEqual(100);
        }

        if (metric.denominator !== undefined) {
          expect(metric.denominator).toBeGreaterThan(0);
          expect(metric.value).toBeLessThanOrEqual(metric.denominator);
        }
      }
    }
  });

  it('keeps public text free of direct private-source identifiers', () => {
    const publicText = JSON.stringify(continuousIntegrationEvidenceItems);

    expect(publicText).not.toMatch(/https?:\/\//);
    expect(publicText).not.toMatch(/\b\d{12}\b/);
    expect(publicText).not.toMatch(/parameter[- ]?path/i);
    expect(publicText).not.toMatch(/employer|customer|client/i);
  });
});
```

- [ ] **Step 2: Run the new test and verify RED**

Run:

```bash
../../node_modules/.bin/vitest run \
  --config apps/github.io/vite.config.ts \
  apps/github.io/src/app/devops-capability-evidence/continuous-integration-evidence.data.spec.ts
```

Expected: FAIL because `./continuous-integration-evidence.data` does not exist.

- [ ] **Step 3: Add the structured evidence interfaces**

Insert these types after `EvidenceStrength` and add `details?: CapabilityEvidenceDetails` to `CapabilityEvidenceItem` after `summary`:

```ts
export type CapabilityEvidenceInitiativeId =
  | 'aws-codepipeline-platform'
  | 'github-actions-monorepo';

export interface CapabilityEvidenceInitiative {
  readonly id: CapabilityEvidenceInitiativeId;
  readonly label: string;
}

export interface CapabilityEvidencePeriod {
  readonly startedAt: string;
  readonly endedAt?: string;
}

export interface CapabilityEvidenceMetric {
  readonly label: string;
  readonly value: number;
  readonly unit: 'count' | 'percent' | 'seconds';
  readonly measuredAt: string;
  readonly denominator?: number;
}

export interface CapabilityEvidenceDetails {
  readonly initiative: CapabilityEvidenceInitiative;
  readonly period: CapabilityEvidencePeriod;
  readonly metrics: readonly CapabilityEvidenceMetric[];
  readonly facts: readonly string[];
}
```

The relevant `CapabilityEvidenceItem` section becomes:

```ts
  organization?: string;
  summary: string;
  details?: CapabilityEvidenceDetails;
  technologies?: readonly string[];
```

- [ ] **Step 4: Create the complete CI data module**

Create `continuous-integration-evidence.data.ts`. Export the initiatives with a compile-time contract:

```ts
import type {
  CapabilityEvidenceInitiative,
  CapabilityEvidenceItem,
} from './devops-capability-evidence.types';

const snapshotDate = '2026-08-07';

export const continuousIntegrationEvidenceInitiatives = {
  awsCodePipelinePlatform: {
    id: 'aws-codepipeline-platform',
    label: 'AWS CodePipeline platform',
  },
  githubActionsMonorepo: {
    id: 'github-actions-monorepo',
    label: 'GitHub Actions monorepo migration',
  },
} as const satisfies Record<string, CapabilityEvidenceInitiative>;

const awsInitiative =
  continuousIntegrationEvidenceInitiatives.awsCodePipelinePlatform;
const githubInitiative =
  continuousIntegrationEvidenceInitiatives.githubActionsMonorepo;
```

Define `continuousIntegrationEvidenceItems` as `as const satisfies readonly CapabilityEvidenceItem[]`. Use the following complete record contract; every row is one array object and all `facts` use the wording shown:

| ID | Label | Title | Strength | Initiative | Started | Technologies | Facts |
|---|---|---|---|---|---|---|---|
| `terraform-codepipeline-platform` | `Terraform pipelines` | `Reusable Terraform delivery platform` | `primary` | AWS | `2019-07-05` | Terraform, AWS CodePipeline, AWS CodeBuild, Amazon ECR | `Designed and built reusable Terraform modules that provisioned consistent delivery pipelines, build projects, container repositories, and scoped IAM roles.` |
| `codebuild-pr-gates` | `CodeBuild PR gates` | `Pull-request test gates with AWS CodeBuild` | `primary` | AWS | `2019-03-06` | AWS CodeBuild, GitHub | `Configured pull-request webhooks to run automated builds and tests and report their status directly to GitHub.` |
| `codebuild-postgresql-tests` | `PostgreSQL gates` | `Database-backed CodeBuild test gates` | `strong` | AWS | `2019-03-06` | AWS CodeBuild, PostgreSQL, AWS Systems Manager Parameter Store | `Ran application test suites against PostgreSQL while resolving test credentials at build time from AWS Systems Manager Parameter Store.` |
| `codebuild-feedback-tuning` | `CodeBuild tuning` | `Fast feedback through CodeBuild tuning` | `strong` | AWS | `2019-03-06` | AWS CodeBuild | `Adjusted compute capacity and build timeouts to match suite size and keep pull-request feedback within minutes.` |
| `ecr-immutable-promotion` | `ECR promotion` | `Build-once Amazon ECR promotion` | `primary` | AWS | `2019-07-05` | Docker, Amazon ECR, AWS CodeBuild | `Built container images once, tagged them with the source commit SHA, and promoted the same image manifest without rebuilding per environment.` |
| `codepipeline-webhook-trunk` | `Webhook delivery` | `Webhook-driven trunk delivery` | `strong` | AWS | `2019-01-24` | AWS CodePipeline, GitHub, Git | `Delivered changes from one trunk through webhook-driven pipelines without a long-lived release-branch topology.` |
| `nx-monorepo-migration` | `Nx migration` | `Standalone repository migration to an Nx monorepo` | `primary` | GitHub | `2024-02-28` | Nx, GitHub Actions, TypeScript | `Migrated standalone repositories into an Nx monorepo while preserving fast feedback with dependency-aware affected execution.` |
| `nx-affected-quality-gates` | `Nx affected` | `Nx affected quality gates` | `primary` | GitHub | `2024-02-28` | Nx, GitHub Actions, TypeScript | `Configured pull-request and main-branch CI to run affected lint, unit, integration, and build targets from the last successful main-branch baseline.` |
| `github-actions-container-verification` | `Container verification` | `End-to-end and container smoke verification` | `strong` | GitHub | `2024-02-28` | GitHub Actions, Nx, Docker | `Added dedicated end-to-end projects and container health-check smoke tests that retain logs on failure and always clean up.` |
| `github-actions-oidc-ecr-publishing` | `OIDC image publishing` | `OIDC-based Amazon ECR publishing` | `strong` | GitHub | `2024-05-10` | GitHub Actions, OIDC, Docker, Amazon ECR | `Published commit-SHA container images from GitHub Actions through an OIDC-assumed AWS role without static cloud credentials.` |
| `github-actions-gitops-handoff` | `GitOps handoff` | `Cross-repository GitOps deployment handoff` | `primary` | GitHub | `2024-05-10` | GitHub Actions, Kustomize, Argo CD, Amazon ECR | `Dispatched affected deployments to an operations monorepo, updated Kustomize image references, and let Argo CD reconcile the desired state.` |
| `kustomize-tag-update-reliability` | `Tag reliability` | `Reliable Kustomize batch tag updates` | `primary` | GitHub | `2026-06-15` | GitHub Actions, Kustomize, yq | `Reworked batch image-tag updates with validated inputs, pinned tooling, compatibility handling, and safe skipping for projects without deployment overlays.` |
| `github-actions-failure-notifications` | `Failure notifications` | `Deployment automation failure notifications` | `strong` | GitHub | `2026-08-05` | GitHub Actions, Slack | `Added Slack notification with the workflow-run link and deployment consequence when container publishing or deployment dispatch fails.` |
| `tested-ci-automation` | `Tested CI code` | `Tests for CI support code and reconciled configuration` | `strong` | GitHub | `2024-02-28` | GitHub Actions, JavaScript, Prometheus, Docker | `Added unit tests for cross-repository dispatch support and containerized rule tests for monitoring configuration that is automatically reconciled.` |
| `commitlint-small-batches` | `Commit conventions` | `Mechanically enforced commit conventions` | `supporting` | GitHub | `2024-02-28` | commitlint, Husky, Git | `Enforced conventional, reviewable commits through commitlint and Husky in both monorepos.` |

Every record must set `type: 'experience'`, `isPublic: true`, and
`capabilityKeys: ['continuous-integration']` except for the Nx record described
below. Copy the row's Facts cell verbatim into both `summary` and the sole
initial entry of `details.facts`. Copy the row's Started cell into
`details.period.startedAt`. Omit `details.period.endedAt`, `organization`,
`proofUrl`, `isSensitive`, and `supportingEvidenceIds`. Start each record with
`details.metrics: []`, then replace that empty array with the applicable exact
metric block below. Set `details.initiative` to `awsInitiative` for the first six
rows and `githubInitiative` for the final nine rows.

For `nx-affected-quality-gates`, retain its existing additional capability keys in this exact order:

```ts
capabilityKeys: [
  'test-automation',
  'continuous-integration',
  'trunk-based-development',
],
```

Populate metrics on the relevant records exactly as follows:

```ts
// terraform-codepipeline-platform
metrics: [
  { label: 'Delivery pipelines', value: 47, unit: 'count', measuredAt: snapshotDate },
  { label: 'Build projects', value: 105, unit: 'count', measuredAt: snapshotDate },
  { label: 'Services', value: 27, unit: 'count', measuredAt: snapshotDate },
  { label: 'Lifetime builds', value: 39114, unit: 'count', measuredAt: snapshotDate },
],

// codebuild-pr-gates
metrics: [
  { label: 'Test projects with webhooks', value: 27, denominator: 27, unit: 'count', measuredAt: snapshotDate },
  { label: 'Standard PR event filters', value: 26, denominator: 27, unit: 'count', measuredAt: snapshotDate },
  { label: 'GitHub status reporting', value: 26, denominator: 27, unit: 'count', measuredAt: snapshotDate },
  { label: 'Lifetime PR test builds', value: 24779, unit: 'count', measuredAt: snapshotDate },
  { label: 'Median PR feedback', value: 175, unit: 'seconds', measuredAt: snapshotDate },
],

// codebuild-feedback-tuning
metrics: [
  { label: 'Median PR feedback', value: 175, unit: 'seconds', measuredAt: snapshotDate },
  { label: 'PR feedback p90', value: 494, unit: 'seconds', measuredAt: snapshotDate },
  { label: 'Recent PR build success', value: 73.8, unit: 'percent', measuredAt: snapshotDate },
],

// ecr-immutable-promotion
metrics: [
  { label: 'Median production promotion', value: 91, unit: 'seconds', measuredAt: snapshotDate },
],

// nx-monorepo-migration
metrics: [
  { label: 'Services', value: 20, unit: 'count', measuredAt: snapshotDate },
  { label: 'End-to-end projects', value: 16, unit: 'count', measuredAt: snapshotDate },
  { label: 'Shared packages', value: 15, unit: 'count', measuredAt: snapshotDate },
  { label: 'Test files', value: 430, unit: 'count', measuredAt: snapshotDate },
],

// nx-affected-quality-gates
metrics: [
  { label: 'Workflow runs', value: 629, unit: 'count', measuredAt: snapshotDate },
  { label: 'Median affected CI feedback', value: 179, unit: 'seconds', measuredAt: snapshotDate },
  { label: 'Affected CI feedback p90', value: 1382, unit: 'seconds', measuredAt: snapshotDate },
],

// github-actions-container-verification
metrics: [
  { label: 'Container-smoke coverage', value: 2, denominator: 20, unit: 'count', measuredAt: snapshotDate },
],

// github-actions-gitops-handoff
metrics: [
  { label: 'Deployment runs', value: 249, unit: 'count', measuredAt: snapshotDate },
  { label: 'Deployment success', value: 85.9, unit: 'percent', measuredAt: snapshotDate },
  { label: 'Median deployment handoff', value: 103, unit: 'seconds', measuredAt: snapshotDate },
  { label: 'Tag-update runs', value: 251, unit: 'count', measuredAt: snapshotDate },
  { label: 'Median tag update', value: 15, unit: 'seconds', measuredAt: snapshotDate },
],

// kustomize-tag-update-reliability
metrics: [
  { label: 'March 2026 success', value: 30.4, unit: 'percent', measuredAt: '2026-03-31' },
  { label: 'April 2026 success', value: 44.2, unit: 'percent', measuredAt: '2026-04-30' },
  { label: 'May 2026 success', value: 61.8, unit: 'percent', measuredAt: '2026-05-31' },
  { label: 'June 2026 success', value: 95.2, unit: 'percent', measuredAt: '2026-06-30' },
  { label: 'July 2026 success', value: 100, unit: 'percent', measuredAt: '2026-07-31' },
  { label: 'August 2026 success to date', value: 100, unit: 'percent', measuredAt: snapshotDate },
],
```

Records not listed in the metric blocks use `metrics: []`. Use `githubInitiative` for the nine GitHub rows and `awsInitiative` for the six AWS rows.

- [ ] **Step 5: Run the atomic-catalog test and verify GREEN**

Run:

```bash
../../node_modules/.bin/vitest run \
  --config apps/github.io/vite.config.ts \
  apps/github.io/src/app/devops-capability-evidence/continuous-integration-evidence.data.spec.ts
```

Expected: PASS with four tests.

- [ ] **Step 6: Inspect and commit the atomic data model**

Run:

```bash
git diff --check
git diff -- apps/github.io/src/app/devops-capability-evidence/devops-capability-evidence.types.ts \
  apps/github.io/src/app/devops-capability-evidence/continuous-integration-evidence.data.ts \
  apps/github.io/src/app/devops-capability-evidence/continuous-integration-evidence.data.spec.ts
git add apps/github.io/src/app/devops-capability-evidence/devops-capability-evidence.types.ts
git add apps/github.io/src/app/devops-capability-evidence/continuous-integration-evidence.data.ts
git add apps/github.io/src/app/devops-capability-evidence/continuous-integration-evidence.data.spec.ts
git diff --cached
git commit -m "feat(github.io): add atomic continuous integration evidence"
```

Expected: one commit containing only the reusable type additions and focused CI data module/tests.

---

### Task 2: Compose The Catalog And Curate The Card Evidence

**Files:**
- Modify: `apps/github.io/src/app/devops-capability-evidence/devops-capability-evidence.data.ts:1-6,87-100,253-270,336-377`
- Modify: `apps/github.io/src/app/devops-capability-evidence/devops-capability-evidence.spec.ts:1-6,139-258,261-322`
- Modify: `apps/github.io/src/app/devops-capability-evidence/dora-capability-card.evidence.spec.ts:45-61`

**Interfaces:**
- Consumes: `continuousIntegrationEvidenceItems` and their `details.initiative.id` values from Task 1.
- Produces: a shared catalog containing every atomic CI item and an unchanged 4/5 CI score selecting the approved top five.

- [ ] **Step 1: Update shared-catalog tests for the new contract**

In `devops-capability-evidence.spec.ts`, update the expected Continuous Integration score row to:

```ts
{
  capabilityKey: 'continuous-integration',
  evidenceIds: [
    'terraform-codepipeline-platform',
    'codebuild-pr-gates',
    'nx-affected-quality-gates',
    'github-actions-gitops-handoff',
    'kustomize-tag-update-reliability',
  ],
  strongestEvidenceId: 'terraform-codepipeline-platform',
  evidenceCounts: { experience: 5 },
},
```

Add this focused test inside the top-level block named
`devOpsCapabilityEvidence data`:

```ts
it('curates two AWS and three GitHub monorepo records for the CI card', () => {
  const score = curatedDevOpsCapabilityRadarScores.find(
    (entry) => entry.capabilityKey === 'continuous-integration',
  );
  const selected = (score?.evidenceIds ?? []).map((id) =>
    devOpsCapabilityEvidenceItems.find((item) => item.id === id),
  );

  expect(score?.score).toBe(4);
  expect(score?.strongestEvidenceId).toBe(score?.evidenceIds[0]);
  expect(selected.every(Boolean)).toBe(true);
  expect(
    selected.map((item) => item?.details?.initiative.id),
  ).toEqual([
    'aws-codepipeline-platform',
    'aws-codepipeline-platform',
    'github-actions-monorepo',
    'github-actions-monorepo',
    'github-actions-monorepo',
  ]);
});
```

Keep the existing carved-interview token expectations for shared records. Update the expected `nx-affected-quality-gates` object only if its title or summary is asserted; its ID, label, and capability keys stay unchanged.

In the existing `tokenizes previously captured broad evidence into compact
tokens` expectation, narrow only these two capability arrays:

```ts
{
  id: 'github-actions-ci',
  label: 'GitHub Actions',
  capabilityKeys: ['continuous-delivery', 'deployment-automation'],
},
{
  id: 'team-delivery-workflow',
  label: 'Team delivery',
  capabilityKeys: ['continuous-delivery'],
},
```

The focused module replaces one existing experience record and adds 14 new
ones. Update the existing evidence-count assertion to `experience: 26` and the
accessible summary expectation to this exact string:

```ts
'Evidence includes 1 skill, 3 learning items, 26 experience items, 1 certification, and 2 projects.'
```

In `dora-capability-card.evidence.spec.ts`, replace the old five CI IDs with:

```ts
expect(rows[0]?.evidence.map((item) => item.id)).toEqual([
  'terraform-codepipeline-platform',
  'codebuild-pr-gates',
  'nx-affected-quality-gates',
  'github-actions-gitops-handoff',
  'kustomize-tag-update-reliability',
]);
```

- [ ] **Step 2: Run the integration tests and verify RED**

Run:

```bash
../../node_modules/.bin/vitest run \
  --config apps/github.io/vite.config.ts \
  apps/github.io/src/app/devops-capability-evidence/devops-capability-evidence.spec.ts \
  apps/github.io/src/app/devops-capability-evidence/dora-capability-card.evidence.spec.ts
```

Expected: FAIL because the shared catalog and CI score still expose the old evidence selection.

- [ ] **Step 3: Compose the focused records into the shared catalog**

At the top of `devops-capability-evidence.data.ts`, import the Task 1 array before the type-only import:

```ts
import { continuousIntegrationEvidenceItems } from './continuous-integration-evidence.data';
```

Remove the existing inline `nx-affected-quality-gates` object from `devOpsCapabilityEvidenceItems`; Task 1 now owns the enriched record. Add the focused array to the shared catalog at the point where the removed record previously appeared:

```ts
  ...continuousIntegrationEvidenceItems,
```

Do not remove `protected-review-gates` or `regression-gates`; they remain valid atomic evidence for other capability relationships. Narrow these two broad records because their CI meaning is now fully represented by the new atomic catalog:

```ts
// github-actions-ci
capabilityKeys: ['continuous-delivery', 'deployment-automation'],

// team-delivery-workflow
capabilityKeys: ['continuous-delivery'],
```

Keep both records and their other fields unchanged because Continuous Delivery and Deployment Automation scores still reference them.

- [ ] **Step 4: Replace the curated CI score selection**

Change only the Continuous Integration row in `curatedDevOpsCapabilityRadarScores`:

```ts
{
  capabilityKey: 'continuous-integration',
  label: 'CI',
  score: 4,
  maxScore: 5,
  evidenceIds: [
    'terraform-codepipeline-platform',
    'codebuild-pr-gates',
    'nx-affected-quality-gates',
    'github-actions-gitops-handoff',
    'kustomize-tag-update-reliability',
  ],
  strongestEvidenceId: 'terraform-codepipeline-platform',
  evidenceCounts: { experience: 5 },
},
```

Do not edit any other score row.

- [ ] **Step 5: Run focused integration tests and verify GREEN**

Run:

```bash
../../node_modules/.bin/vitest run \
  --config apps/github.io/vite.config.ts \
  apps/github.io/src/app/devops-capability-evidence/continuous-integration-evidence.data.spec.ts \
  apps/github.io/src/app/devops-capability-evidence/devops-capability-evidence.spec.ts \
  apps/github.io/src/app/devops-capability-evidence/dora-capability-card.evidence.spec.ts
```

Expected: PASS. The existing score-to-catalog integrity test must confirm every selected ID exists, maps back to Continuous Integration, and matches `{ experience: 5 }`.

- [ ] **Step 6: Inspect and commit the shared-catalog integration**

Run:

```bash
git diff --check
git diff -- apps/github.io/src/app/devops-capability-evidence/devops-capability-evidence.data.ts \
  apps/github.io/src/app/devops-capability-evidence/devops-capability-evidence.spec.ts \
  apps/github.io/src/app/devops-capability-evidence/dora-capability-card.evidence.spec.ts
git add apps/github.io/src/app/devops-capability-evidence/devops-capability-evidence.data.ts
git add apps/github.io/src/app/devops-capability-evidence/devops-capability-evidence.spec.ts
git add apps/github.io/src/app/devops-capability-evidence/dora-capability-card.evidence.spec.ts
git diff --cached
git commit -m "feat(github.io): curate continuous integration card evidence"
```

Expected: one commit containing only catalog composition, the CI score selection, and their focused regression tests.

---

### Task 3: Lock The Storybook Contract And Run Full Verification

**Files:**
- Create: `apps/github.io/src/app/devops-capability-evidence/dora-capability-card.stories.spec.ts`

**Interfaces:**
- Consumes: the existing default story metadata, `ContinuousIntegration` named story, shared evidence catalog, and curated score.
- Produces: a regression contract proving Storybook uses production data and resolves the approved five compact labels.

- [ ] **Step 1: Write the failing Storybook data test**

Create `dora-capability-card.stories.spec.ts`:

```ts
import meta, { ContinuousIntegration } from './dora-capability-card.stories';
import {
  curatedDevOpsCapabilityRadarScores,
  devOpsCapabilityEvidenceItems,
} from './devops-capability-evidence.data';

describe('DoraCapabilityCard stories', () => {
  it('uses shared production data for Continuous Integration', () => {
    expect(meta.args?.evidence).toBe(devOpsCapabilityEvidenceItems);
    expect(meta.args?.scores).toBe(curatedDevOpsCapabilityRadarScores);
    expect(ContinuousIntegration.args?.evidence).toBeUndefined();
    expect(ContinuousIntegration.args?.scores).toBeUndefined();
  });

  it('resolves the approved top-five Continuous Integration labels', () => {
    const score = curatedDevOpsCapabilityRadarScores.find(
      (entry) => entry.capabilityKey === 'continuous-integration',
    );
    const labels = score?.evidenceIds.map((id) =>
      devOpsCapabilityEvidenceItems.find((item) => item.id === id)?.label,
    );

    expect(labels).toEqual([
      'Terraform pipelines',
      'CodeBuild PR gates',
      'Nx affected',
      'GitOps handoff',
      'Tag reliability',
    ]);
  });
});
```

- [ ] **Step 2: Prove the Storybook test protects the contract**

Before changing production data, temporarily change the first expected label in the new test to `Terraform CI`. Run:

```bash
../../node_modules/.bin/vitest run \
  --config apps/github.io/vite.config.ts \
  apps/github.io/src/app/devops-capability-evidence/dora-capability-card.stories.spec.ts
```

Expected: FAIL showing `Terraform CI` does not equal `Terraform pipelines`.

Restore `Terraform pipelines` immediately.

- [ ] **Step 3: Run the Storybook test and focused evidence suite**

Run:

```bash
../../node_modules/.bin/vitest run \
  --config apps/github.io/vite.config.ts \
  apps/github.io/src/app/devops-capability-evidence
```

Expected: PASS for all DevOps capability evidence test files. Existing radar tests may continue to print the known duplicate React key warning; no test may fail.

- [ ] **Step 4: Run full GitHub.io verification**

Run each command independently:

```bash
NX_DAEMON=false ../../node_modules/.bin/nx test github.io --skip-nx-cache
NX_DAEMON=false ../../node_modules/.bin/nx lint github.io --skip-nx-cache
NX_DAEMON=false ../../node_modules/.bin/nx build github.io --skip-nx-cache
NX_DAEMON=false ../../node_modules/.bin/nx build-storybook github.io --skip-nx-cache
```

Expected: all four commands exit 0. Record any pre-existing warnings separately; do not describe a command as passing unless its exit code is 0.

- [ ] **Step 5: Inspect and commit the Storybook contract**

Run:

```bash
git status --short --branch
git diff --check
git diff -- apps/github.io/src/app/devops-capability-evidence/dora-capability-card.stories.spec.ts
git add apps/github.io/src/app/devops-capability-evidence/dora-capability-card.stories.spec.ts
git diff --cached
git commit -m "test(github.io): lock continuous integration story data"
git status --short --branch
```

Expected: one test commit and a clean worktree. Do not stage the design or plan commits again; they are already committed separately.

---

## Final Review Checklist

- [ ] All 15 atomic CI evidence records exist once in the shared catalog.
- [ ] The records are grouped structurally as six AWS and nine GitHub Actions/Nx contributions.
- [ ] No new record contains `organization`, `proofUrl`, or a private identifier.
- [ ] Exact approved metrics use generalized labels and explicit measurement dates.
- [ ] `nx-affected-quality-gates` remains linked to Test Automation and Trunk-Based Development.
- [ ] Broad shared records still support their other capability scores.
- [ ] The CI score remains 4 of 5 and selects exactly two AWS plus three GitHub records.
- [ ] The current card component and story layout have not changed.
- [ ] The Storybook story inherits the shared evidence catalog and score.
- [ ] Focused tests, full tests, lint, app build, and Storybook build all exit 0.
- [ ] Commits are logical, conventional, and contain only explicit paths.
