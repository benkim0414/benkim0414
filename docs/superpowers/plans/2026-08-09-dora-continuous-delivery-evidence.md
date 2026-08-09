# DORA Continuous Delivery Evidence Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the generic Continuous Delivery capability-card placeholders with a public-safe catalog of 17 atomic experiences, an explicit five-experience projection, 14 evidence-backed skills, and a `7+ years across two delivery platforms` summary.

**Architecture:** Store twelve new Continuous Delivery experiences in a focused data module, reuse five existing CI records by adding the CD capability, and compose the datasets once in the shared catalog. Keep skill relationships in a separate typed module, let the score own the exact compact projection and summary, and reuse the existing card rows and neutral `SkillToken` presentation.

**Tech Stack:** React 19, TypeScript, Nx, pnpm, Vitest, Testing Library, Storybook, StyleX, Astryx Design System, Simple Icons, AWS Architecture Icons.

## Global Constraints

- Work only in the linked worktree on `feat/dora-continuous-delivery-evidence`.
- Use `superpowers:test-driven-development`: write each focused failing test, observe the expected failure, implement the minimum behavior, and rerun the focused suite.
- Stage explicit paths only; never use `git add .`, `git add -A`, `git add -u`, or commit flags that stage implicitly.
- Commit each task separately with the conventional subjects specified below.
- The full Continuous Delivery catalog must contain exactly 17 experiences: twelve new records and five reused cross-capability records.
- The compact projection must contain exactly five explicit experience IDs followed by all fourteen skill IDs. Do not use `slice()`, runtime ranking, strength sorting, or incidental catalog order to select it.
- Public evidence must not contain the private source repository name, URL, or path; employer, customer, organization, or regulated business-domain identity; private repository, project, service, application, workflow, script, module, image, or architecture names; contributor identities; commit SHAs or private subjects; AWS account IDs, regions, role ARNs, parameter paths; internal API fields; proof links; Jira references; Slack destinations; or copied private prose.
- Public technology names, approved counts, percentages, durations, and dates may remain exact when their subjects are generalized.
- Production tag updates are deployment intent, not completed production deployments. Retained production sync history is a lower bound, not a total.
- Store production automation gaps as structured facts on related experiences, not as positive tokens or a new evidence type.
- Use DORA terminology including deployment automation, version control for production artifacts, same package for every environment, environment-specific configuration, environment state from version control, automated database migrations, and independent deployment.
- Keep the Continuous Delivery score at 4 of 5.
- Render `7+ years across two delivery platforms` once as `<Text type="supporting" color="secondary">`; do not display exact dates on evidence tokens.
- Skills use the existing neutral `SkillToken` variant: neutral token surface, brand color only in a truthful logo, and text-only fallback when an accurate logo is unavailable.
- Preserve current card width, spacing, evidence grouping, row labels, wrapping, accessible names, and citation behavior.
- Do not build the dedicated capability page, remediate private delivery systems, add public proof links, or redesign the shared card and token components.

## File Structure

### New files

- `apps/github.io/src/app/devops-capability-evidence/capability-evidence-initiatives.ts`: shared AWS CodePipeline and GitHub Actions initiative constants.
- `apps/github.io/src/app/devops-capability-evidence/continuous-delivery-evidence.data.ts`: twelve new public-safe CD experience records.
- `apps/github.io/src/app/devops-capability-evidence/continuous-delivery-evidence.data.spec.ts`: exact CD record, metric, limitation, chronology, and privacy invariants.
- `apps/github.io/src/app/devops-capability-evidence/continuous-delivery-skill-evidence.data.ts`: fourteen CD skill records with focused support IDs.
- `apps/github.io/src/app/devops-capability-evidence/continuous-delivery-skill-evidence.data.spec.ts`: exact skill order, support, chronology, integrity, and privacy invariants.
- `apps/github.io/src/assets/skills/aws/amazon-eks.svg`: unmodified official Amazon EKS 64px AWS Architecture Icon.

### Modified files

- `apps/github.io/src/app/devops-capability-evidence/continuous-integration-evidence.data.ts`: consume shared initiative constants and map five atomic records to both CI and CD.
- `apps/github.io/src/app/devops-capability-evidence/continuous-integration-evidence.data.spec.ts`: retain CI invariants for shared records.
- `apps/github.io/src/app/devops-capability-evidence/devops-capability-evidence.types.ts`: add optional score-owned `evidenceSummary`.
- `apps/github.io/src/app/devops-capability-evidence/devops-capability-evidence.data.ts`: compose CD datasets, remove placeholders, and define the explicit CD projection.
- `apps/github.io/src/app/devops-capability-evidence/devops-capability-evidence.spec.ts`: lock catalog composition, shared mappings, projection, counts, and summary.
- `apps/github.io/src/app/skills/skill-brand.ts`: map Amazon EKS to the official local asset while retaining truthful Sealed Secrets text fallback.
- `apps/github.io/src/app/skills/skill-brand.spec.ts`: verify all selected CD brands and the EKS asset.
- `apps/github.io/src/assets/skills/README.md`: record Amazon EKS asset provenance.
- `apps/github.io/src/app/devops-capability-evidence/dora-capability-card.evidence.ts`: resolve the optional score summary.
- `apps/github.io/src/app/devops-capability-evidence/dora-capability-card.evidence.spec.ts`: test summary lookup and existing row behavior.
- `apps/github.io/src/app/devops-capability-evidence/dora-capability-card.tsx`: render optional supporting summary.
- `apps/github.io/src/app/devops-capability-evidence/dora-capability-card.spec.tsx`: test summary rendering, exact CD row contents, accessibility, and CI label compatibility.
- `apps/github.io/src/app/devops-capability-evidence/dora-capability-card.stories.tsx`: add the production-data Continuous Delivery story.
- `apps/github.io/src/app/devops-capability-evidence/dora-capability-card.stories.spec.ts`: lock the production story, top five, and skill order.

---

### Task 1: Add The Atomic Continuous Delivery Experience Catalog

**Files:**

- Create: `apps/github.io/src/app/devops-capability-evidence/capability-evidence-initiatives.ts`
- Create: `apps/github.io/src/app/devops-capability-evidence/continuous-delivery-evidence.data.ts`
- Create: `apps/github.io/src/app/devops-capability-evidence/continuous-delivery-evidence.data.spec.ts`
- Modify: `apps/github.io/src/app/devops-capability-evidence/continuous-integration-evidence.data.ts`
- Modify: `apps/github.io/src/app/devops-capability-evidence/continuous-integration-evidence.data.spec.ts`
- Modify: `apps/github.io/src/app/dora-capability-card/dora-capability-card.spec.tsx`
- Modify: `apps/github.io/src/app/dora-capability-card/dora-capability-card.stories.spec.ts`

**Interfaces:**

- Consumes: `CapabilityEvidenceInitiative` and `CapabilityEvidenceItem` from `devops-capability-evidence.types.ts`.
- Produces: `capabilityEvidenceInitiatives`, `continuousDeliveryEvidenceItems: readonly CapabilityEvidenceItem[]`, and five CI experience records whose `capabilityKeys` include both `continuous-integration` and `continuous-delivery`.
- Preserves: `continuousIntegrationEvidenceInitiatives` as an exported alias so existing consumers do not break.

- [ ] **Step 1: Write the failing exact-catalog test**

Create `continuous-delivery-evidence.data.spec.ts` with the exact new record IDs:

```ts
import { continuousDeliveryEvidenceItems } from './continuous-delivery-evidence.data';

const expectedIds = [
  'codepipeline-approval-gated-deployment',
  'argocd-environment-state-from-version-control',
  'gitops-same-package-environments',
  'argocd-automated-database-migrations',
  'argocd-reliable-database-migrations',
  'production-artifacts-version-control',
  'sealed-secrets-version-control',
  'serialized-deployment-process',
  'independent-service-deployment',
  'small-batch-deployments',
  'deployment-health-checks',
  'deployment-failure-notification',
] as const;

const expectedTitles = [
  'Approval-gated deployment automation',
  'Environment state from version control',
  'Same package for every environment',
  'Automated database migrations',
  'Reliable database migration process',
  'Version control for production artifacts',
  'Version control for encrypted configuration',
  'Reliable serialized deployment process',
  'Independent service deployment',
  'Small-batch deployments',
  'Deployment health checks',
  'Deployment failure notification',
] as const;

describe('continuousDeliveryEvidenceItems', () => {
  it('stores exactly the approved new atomic experiences', () => {
    expect(continuousDeliveryEvidenceItems.map((item) => item.id)).toEqual(
      expectedIds,
    );
    expect(continuousDeliveryEvidenceItems.map((item) => item.title)).toEqual(
      expectedTitles,
    );
  });
});
```

- [ ] **Step 2: Add failing structured metric and limitation assertions**

Append these helpers and assertions to the same spec:

```ts
const byId = new Map(
  continuousDeliveryEvidenceItems.map((item) => [item.id, item]),
);
const isoDate = /^\d{4}-\d{2}-\d{2}$/;

it('keeps approval automation metrics precise', () => {
  expect(
    byId.get('codepipeline-approval-gated-deployment')?.details?.metrics,
  ).toEqual(
    expect.arrayContaining([
      {
        label: 'Pipelines with production approval',
        value: 41,
        denominator: 47,
        unit: 'count',
        measuredAt: '2026-08-09',
      },
      {
        label: 'Approval observations',
        value: 561,
        unit: 'count',
        measuredAt: '2026-08-09',
      },
      {
        label: 'Median approval wait',
        value: 271,
        unit: 'seconds',
        measuredAt: '2026-08-09',
      },
      {
        label: 'P90 approval wait',
        value: 164299,
        unit: 'seconds',
        measuredAt: '2026-08-09',
      },
      {
        label: 'Maximum approval wait',
        value: 604920,
        unit: 'seconds',
        measuredAt: '2026-08-09',
      },
    ]),
  );
});

it('keeps GitOps measurements attached to the relevant experience', () => {
  expect(
    byId.get('argocd-environment-state-from-version-control')?.details?.metrics,
  ).toEqual(
    expect.arrayContaining([
      {
        label: 'Services',
        value: 20,
        unit: 'count',
        measuredAt: '2026-08-09',
      },
      {
        label: 'Live Argo CD applications',
        value: 41,
        unit: 'count',
        measuredAt: '2026-08-09',
      },
      {
        label: 'Automated demo applications',
        value: 17,
        denominator: 18,
        unit: 'count',
        measuredAt: '2026-08-09',
      },
    ]),
  );

  expect(byId.get('small-batch-deployments')?.details?.metrics).toContainEqual({
    label: 'Single-service tag-changing commits',
    value: 223,
    denominator: 228,
    unit: 'count',
    measuredAt: '2026-08-09',
  });

  expect(byId.get('deployment-health-checks')?.details?.metrics).toEqual(
    expect.arrayContaining([
      {
        label: 'Services with readiness probes',
        value: 17,
        denominator: 20,
        unit: 'count',
        measuredAt: '2026-08-09',
      },
      {
        label: 'Services with PodDisruptionBudgets',
        value: 10,
        denominator: 20,
        unit: 'count',
        measuredAt: '2026-08-09',
      },
    ]),
  );
});

it('stores the approved public-safe maturity limitations as facts', () => {
  const publicFacts = JSON.stringify(
    continuousDeliveryEvidenceItems.flatMap(
      (item) => item.details?.facts ?? [],
    ),
  );

  expect(publicFacts).toMatch(/manual intervention/i);
  expect(publicFacts).toMatch(/does not verify successful build completion/i);
  expect(publicFacts).toMatch(/automated rollback.*absent/i);
  expect(publicFacts).toMatch(/progressive delivery.*absent/i);
  expect(publicFacts).toMatch(/partial coverage/i);
  expect(publicFacts).toMatch(/drift.*not proactively detected/i);
});

it('stores valid structured public evidence', () => {
  for (const item of continuousDeliveryEvidenceItems) {
    expect(item.type).toBe('experience');
    expect(item.capabilityKeys).toContain('continuous-delivery');
    expect(item.isPublic).toBe(true);
    expect(item.isSensitive).not.toBe(true);
    expect(item.organization).toBeUndefined();
    expect(item.proofUrl).toBeUndefined();
    expect(item.details?.period.startedAt).toMatch(isoDate);
    expect(item.details?.facts.length).toBeGreaterThan(0);

    for (const metric of item.details?.metrics ?? []) {
      expect(Number.isFinite(metric.value)).toBe(true);
      expect(metric.value).toBeGreaterThanOrEqual(0);
      expect(metric.measuredAt).toMatch(isoDate);
      if (metric.denominator !== undefined) {
        expect(metric.denominator).toBeGreaterThan(0);
        expect(metric.value).toBeLessThanOrEqual(metric.denominator);
      }
    }
  }
});
```

- [ ] **Step 3: Add the failing privacy and terminology assertions**

```ts
it('keeps public CD evidence free of direct private-source identifiers', () => {
  const publicText = JSON.stringify(continuousDeliveryEvidenceItems);

  expect(publicText).not.toMatch(/https?:\/\//);
  expect(publicText).not.toMatch(/\b\d{12}\b/);
  expect(publicText).not.toMatch(/parameter[- ]?path/i);
  expect(publicText).not.toMatch(/employer|customer|client|organization/i);
  expect(publicText).not.toMatch(/repository name|service name|workflow name/i);
});

it('does not overstate incomplete production delivery outcomes', () => {
  const publicText = JSON.stringify(continuousDeliveryEvidenceItems);

  expect(publicText).not.toMatch(/254 production deployments/i);
  expect(publicText).not.toMatch(/fully automated production/i);
  expect(publicText).not.toMatch(/proactive failure notification/i);
  expect(publicText).not.toMatch(/automated rollback implemented/i);
});
```

- [ ] **Step 4: Run the new spec to verify the missing module failure**

Run:

```bash
NX_DAEMON=false pnpm exec vitest run apps/github.io/src/app/devops-capability-evidence/continuous-delivery-evidence.data.spec.ts
```

Expected: FAIL because `continuous-delivery-evidence.data.ts` does not exist.

- [ ] **Step 5: Extract the shared initiative constants**

Create `capability-evidence-initiatives.ts`:

```ts
import type { CapabilityEvidenceInitiative } from './devops-capability-evidence.types';

export const capabilityEvidenceInitiatives = {
  awsCodePipelinePlatform: {
    id: 'aws-codepipeline-platform',
    label: 'AWS CodePipeline platform',
  },
  githubActionsMonorepo: {
    id: 'github-actions-monorepo',
    label: 'GitHub Actions monorepo migration',
  },
} as const satisfies Record<string, CapabilityEvidenceInitiative>;
```

Update `continuous-integration-evidence.data.ts` to import the shared constant and preserve its current export:

```ts
import { capabilityEvidenceInitiatives } from './capability-evidence-initiatives';

export const continuousIntegrationEvidenceInitiatives =
  capabilityEvidenceInitiatives;
```

Keep `awsInitiative` and `githubInitiative` aliases pointing at the exported object.

- [ ] **Step 6: Add the twelve new experience records**

Create `continuous-delivery-evidence.data.ts` with `snapshotDate = '2026-08-09'`, the shared initiatives, and the exact record definitions below:

| ID                                              | Label                       | Initiative | Start        | Strength   | Technologies                                      |
| ----------------------------------------------- | --------------------------- | ---------- | ------------ | ---------- | ------------------------------------------------- |
| `codepipeline-approval-gated-deployment`        | `Approval-gated automation` | AWS        | `2019-07-05` | primary    | AWS CodePipeline, AWS CodeBuild, Helm, Amazon EKS |
| `argocd-environment-state-from-version-control` | `Environment state`         | GitHub     | `2024-06-03` | primary    | Argo CD, Kubernetes, Kustomize                    |
| `gitops-same-package-environments`              | `Same package`              | GitHub     | `2024-06-03` | primary    | Docker, Amazon ECR, Kustomize                     |
| `argocd-automated-database-migrations`          | `Database migrations`       | GitHub     | `2024-06-03` | primary    | Argo CD, Kubernetes                               |
| `argocd-reliable-database-migrations`           | `Reliable migrations`       | GitHub     | `2024-06-03` | strong     | Argo CD, Kubernetes                               |
| `production-artifacts-version-control`          | `Production artifacts`      | GitHub     | `2024-06-03` | primary    | GitHub, Terraform, Kubernetes, Kustomize, Argo CD |
| `sealed-secrets-version-control`                | `Encrypted configuration`   | GitHub     | `2024-06-03` | strong     | Sealed Secrets, Kubernetes, GitHub                |
| `serialized-deployment-process`                 | `Reliable deployment`       | GitHub     | `2024-06-03` | strong     | GitHub Actions, Nx                                |
| `independent-service-deployment`                | `Independent deployment`    | GitHub     | `2024-06-03` | strong     | Kustomize, Argo CD, Kubernetes                    |
| `small-batch-deployments`                       | `Small batches`             | GitHub     | `2024-06-03` | strong     | GitHub, Kustomize                                 |
| `deployment-health-checks`                      | `Deployment health`         | GitHub     | `2024-06-03` | supporting | Argo CD, Kubernetes                               |
| `deployment-failure-notification`               | `Failure notification`      | GitHub     | `2024-06-03` | supporting | GitHub Actions, Slack                             |

Use `as const satisfies readonly CapabilityEvidenceItem[]` for the catalog and export it as `readonly CapabilityEvidenceItem[]`.

Add these structured measurements to the relevant records in addition to the failing assertions:

```ts
const additionalMetrics = {
  approvalUnderOneHour: {
    label: 'Approvals completed within one hour',
    value: 77.2,
    unit: 'percent',
    measuredAt: snapshotDate,
  },
  productionAutomation: {
    label: 'Automated production applications',
    value: 0,
    denominator: 16,
    unit: 'count',
    measuredAt: snapshotDate,
  },
  databaseMigrationCoverage: {
    label: 'Services with automated database migrations',
    value: 2,
    denominator: 20,
    unit: 'count',
    measuredAt: snapshotDate,
  },
  migrationTimeout: {
    label: 'Database migration timeout',
    value: 600,
    unit: 'seconds',
    measuredAt: snapshotDate,
  },
  encryptedPayloads: {
    label: 'Encrypted secret payloads',
    value: 31,
    unit: 'count',
    measuredAt: snapshotDate,
  },
  livenessCoverage: {
    label: 'Services with liveness probes',
    value: 17,
    denominator: 20,
    unit: 'count',
    measuredAt: snapshotDate,
  },
  explicitReplicaCoverage: {
    label: 'Services with explicit replica counts',
    value: 18,
    denominator: 20,
    unit: 'count',
    measuredAt: snapshotDate,
  },
} as const;
```

Facts must use public-safe generalized subjects and include the approved limitations. Do not copy source sentences. Use concise statements such as:

```ts
facts: [
  'Production deployment requires one manual intervention after the automated process completes.',
  'Production deployment frequency and lead time are not fully measurable from retained deployment history.',
];
```

- [ ] **Step 7: Map the five shared CI records to Continuous Delivery**

In `continuous-integration-evidence.data.ts`, update only these records:

```ts
const sharedContinuousDeliveryIds = [
  'terraform-codepipeline-platform',
  'ecr-immutable-promotion',
  'github-actions-gitops-handoff',
  'kustomize-tag-update-reliability',
  'reusable-helm-deployment-image',
] as const;
```

For each matching record, make `capabilityKeys` exactly:

```ts
capabilityKeys: ['continuous-integration', 'continuous-delivery'];
```

Refine `github-actions-gitops-handoff` to:

```ts
label: 'Deployment automation',
title: 'Automated deployment process',
summary:
  'Automated the affected-service deployment process through GitHub Actions, Nx, version-controlled Kustomize configuration, and Argo CD reconciliation.',
technologies: [
  'GitHub',
  'GitHub Actions',
  'OpenID Connect',
  'Nx',
  'Amazon ECR',
  'Kustomize',
  'Argo CD',
],
```

Append these metrics to that record without removing its existing handoff metrics:

```ts
{
  label: 'Environment tag-update events created by automation',
  value: 448,
  denominator: 513,
  unit: 'count',
  measuredAt: '2026-08-09',
},
{
  label: 'Automated demo deployments',
  value: 259,
  unit: 'count',
  measuredAt: '2026-08-09',
},
{
  label: 'Median merge-to-demo lead time',
  value: 317,
  unit: 'seconds',
  measuredAt: '2026-08-09',
},
{
  label: 'P90 merge-to-demo lead time',
  value: 1689,
  unit: 'seconds',
  measuredAt: '2026-08-09',
},
```

Add facts that deployment does not verify successful build completion and that production synchronization remains manual. Keep the CI record ID, initiative, established start date, and existing CI measurements.

- [ ] **Step 8: Update the focused CI expectations for the shared record**

In `continuous-integration-evidence.data.spec.ts`, retain the existing exact CI ID order and add:

```ts
it('maps only the approved shared CI experiences to Continuous Delivery', () => {
  expect(
    continuousIntegrationEvidenceItems
      .filter((item) => item.capabilityKeys.includes('continuous-delivery'))
      .map((item) => item.id),
  ).toEqual([
    'terraform-codepipeline-platform',
    'ecr-immutable-promotion',
    'github-actions-gitops-handoff',
    'kustomize-tag-update-reliability',
    'reusable-helm-deployment-image',
  ]);
});

it('uses DORA deployment terminology for the shared GitOps record', () => {
  expect(byId.get('github-actions-gitops-handoff')).toMatchObject({
    label: 'Deployment automation',
    title: 'Automated deployment process',
    capabilityKeys: ['continuous-integration', 'continuous-delivery'],
  });
});
```

Update the fourth CI experience label expectation in both card specs from
`GitOps handoff` to `Deployment automation`. Keep the existing CI IDs, order,
counts, and score unchanged.

- [ ] **Step 9: Run focused experience suites**

Run:

```bash
NX_DAEMON=false pnpm exec vitest run \
  apps/github.io/src/app/devops-capability-evidence/continuous-delivery-evidence.data.spec.ts \
  apps/github.io/src/app/devops-capability-evidence/continuous-integration-evidence.data.spec.ts \
  apps/github.io/src/app/dora-capability-card/dora-capability-card.spec.tsx \
  apps/github.io/src/app/dora-capability-card/dora-capability-card.stories.spec.ts
```

Expected: PASS.

- [ ] **Step 10: Inspect and commit the experience catalog**

```bash
git diff --check
git diff -- \
  apps/github.io/src/app/devops-capability-evidence/capability-evidence-initiatives.ts \
  apps/github.io/src/app/devops-capability-evidence/continuous-delivery-evidence.data.ts \
  apps/github.io/src/app/devops-capability-evidence/continuous-delivery-evidence.data.spec.ts \
  apps/github.io/src/app/devops-capability-evidence/continuous-integration-evidence.data.ts \
  apps/github.io/src/app/devops-capability-evidence/continuous-integration-evidence.data.spec.ts \
  apps/github.io/src/app/dora-capability-card/dora-capability-card.spec.tsx \
  apps/github.io/src/app/dora-capability-card/dora-capability-card.stories.spec.ts
git add \
  apps/github.io/src/app/devops-capability-evidence/capability-evidence-initiatives.ts \
  apps/github.io/src/app/devops-capability-evidence/continuous-delivery-evidence.data.ts \
  apps/github.io/src/app/devops-capability-evidence/continuous-delivery-evidence.data.spec.ts \
  apps/github.io/src/app/devops-capability-evidence/continuous-integration-evidence.data.ts \
  apps/github.io/src/app/devops-capability-evidence/continuous-integration-evidence.data.spec.ts \
  apps/github.io/src/app/dora-capability-card/dora-capability-card.spec.tsx \
  apps/github.io/src/app/dora-capability-card/dora-capability-card.stories.spec.ts
git diff --cached
git diff --cached --check
git commit -m "feat(github.io): add continuous delivery evidence"
```

### Task 2: Add Evidence-Backed Continuous Delivery Skills

**Files:**

- Create: `apps/github.io/src/app/devops-capability-evidence/continuous-delivery-skill-evidence.data.ts`
- Create: `apps/github.io/src/app/devops-capability-evidence/continuous-delivery-skill-evidence.data.spec.ts`

**Interfaces:**

- Consumes: Task 1's new experiences and the five shared records by stable ID.
- Produces: `continuousDeliverySkillEvidenceItems: readonly CapabilityEvidenceItem[]` with `type: 'skill'`, `capabilityKeys: ['continuous-delivery']`, exact title/label, and focused `supportingEvidenceIds`.

- [ ] **Step 1: Write the failing exact skill and relationship test**

Create `continuous-delivery-skill-evidence.data.spec.ts`:

```ts
import { continuousDeliveryEvidenceItems } from './continuous-delivery-evidence.data';
import { continuousDeliverySkillEvidenceItems } from './continuous-delivery-skill-evidence.data';
import { continuousIntegrationEvidenceItems } from './continuous-integration-evidence.data';

const expectedSkills = [
  ['continuous-delivery-skill-codepipeline', 'AWS CodePipeline'],
  ['continuous-delivery-skill-github', 'GitHub'],
  ['continuous-delivery-skill-docker', 'Docker'],
  ['continuous-delivery-skill-ecr', 'Amazon ECR'],
  ['continuous-delivery-skill-helm', 'Helm'],
  ['continuous-delivery-skill-eks', 'Amazon EKS'],
  ['continuous-delivery-skill-terraform', 'Terraform'],
  ['continuous-delivery-skill-kubernetes', 'Kubernetes'],
  ['continuous-delivery-skill-github-actions', 'GitHub Actions'],
  ['continuous-delivery-skill-openid-connect', 'OpenID Connect'],
  ['continuous-delivery-skill-nx', 'Nx'],
  ['continuous-delivery-skill-kustomize', 'Kustomize'],
  ['continuous-delivery-skill-argo-cd', 'Argo CD'],
  ['continuous-delivery-skill-sealed-secrets', 'Sealed Secrets'],
] as const;

const expectedSupport = {
  'continuous-delivery-skill-codepipeline': [
    'codepipeline-approval-gated-deployment',
    'terraform-codepipeline-platform',
  ],
  'continuous-delivery-skill-github': [
    'codepipeline-approval-gated-deployment',
    'github-actions-gitops-handoff',
  ],
  'continuous-delivery-skill-docker': [
    'gitops-same-package-environments',
    'reusable-helm-deployment-image',
  ],
  'continuous-delivery-skill-ecr': [
    'ecr-immutable-promotion',
    'gitops-same-package-environments',
  ],
  'continuous-delivery-skill-helm': [
    'codepipeline-approval-gated-deployment',
    'reusable-helm-deployment-image',
  ],
  'continuous-delivery-skill-eks': ['codepipeline-approval-gated-deployment'],
  'continuous-delivery-skill-terraform': [
    'terraform-codepipeline-platform',
    'production-artifacts-version-control',
  ],
  'continuous-delivery-skill-kubernetes': [
    'codepipeline-approval-gated-deployment',
    'argocd-environment-state-from-version-control',
    'argocd-automated-database-migrations',
    'deployment-health-checks',
  ],
  'continuous-delivery-skill-github-actions': [
    'github-actions-gitops-handoff',
    'serialized-deployment-process',
    'deployment-failure-notification',
  ],
  'continuous-delivery-skill-openid-connect': ['github-actions-gitops-handoff'],
  'continuous-delivery-skill-nx': ['github-actions-gitops-handoff'],
  'continuous-delivery-skill-kustomize': [
    'github-actions-gitops-handoff',
    'argocd-environment-state-from-version-control',
    'gitops-same-package-environments',
  ],
  'continuous-delivery-skill-argo-cd': [
    'argocd-environment-state-from-version-control',
    'argocd-automated-database-migrations',
  ],
  'continuous-delivery-skill-sealed-secrets': [
    'sealed-secrets-version-control',
  ],
} as const;

describe('continuousDeliverySkillEvidenceItems', () => {
  it('stores exactly the approved skills in display order', () => {
    expect(
      continuousDeliverySkillEvidenceItems.map(({ id, title }) => [id, title]),
    ).toEqual(expectedSkills);
  });

  it('links every skill to the approved focused experience set', () => {
    for (const skill of continuousDeliverySkillEvidenceItems) {
      expect(skill.supportingEvidenceIds).toEqual(
        expectedSupport[skill.id as keyof typeof expectedSupport],
      );
    }
  });
});
```

- [ ] **Step 2: Add failing chronology, integrity, and privacy assertions**

```ts
it('orders skills by earliest supporting period and delivery flow', () => {
  const experienceById = new Map(
    [
      ...continuousIntegrationEvidenceItems,
      ...continuousDeliveryEvidenceItems,
    ].map((item) => [item.id, item]),
  );
  const earliestDates = continuousDeliverySkillEvidenceItems.map(
    (skill) =>
      skill.supportingEvidenceIds
        ?.map((id) => experienceById.get(id)?.details?.period.startedAt)
        .filter((date): date is string => Boolean(date))
        .sort()[0],
  );

  expect(earliestDates).toEqual([
    '2019-07-05',
    '2019-07-05',
    '2019-07-05',
    '2019-07-05',
    '2019-07-05',
    '2019-07-05',
    '2019-07-05',
    '2019-07-05',
    '2024-05-10',
    '2024-05-10',
    '2024-05-10',
    '2024-05-10',
    '2024-06-03',
    '2024-06-03',
  ]);
});

it('supports every skill with public non-skill CD experience', () => {
  const experienceById = new Map(
    [
      ...continuousIntegrationEvidenceItems,
      ...continuousDeliveryEvidenceItems,
    ].map((item) => [item.id, item]),
  );

  for (const skill of continuousDeliverySkillEvidenceItems) {
    expect(skill.type).toBe('skill');
    expect(skill.capabilityKeys).toEqual(['continuous-delivery']);
    expect(skill.supportingEvidenceIds?.length).toBeGreaterThan(0);

    for (const supportId of skill.supportingEvidenceIds ?? []) {
      const support = experienceById.get(supportId);
      expect(support, `${skill.id} support ${supportId}`).toBeDefined();
      expect(support?.type).toBe('experience');
      expect(support?.isPublic).toBe(true);
      expect(support?.capabilityKeys).toContain('continuous-delivery');
    }
  }
});

it('keeps skill text public-safe', () => {
  const publicText = JSON.stringify(continuousDeliverySkillEvidenceItems);

  expect(publicText).not.toMatch(/https?:\/\//);
  expect(publicText).not.toMatch(/\b\d{12}\b/);
  expect(publicText).not.toMatch(/employer|customer|client|organization/i);
});
```

- [ ] **Step 3: Run the skill spec to verify the missing module failure**

```bash
NX_DAEMON=false pnpm exec vitest run apps/github.io/src/app/devops-capability-evidence/continuous-delivery-skill-evidence.data.spec.ts
```

Expected: FAIL because `continuous-delivery-skill-evidence.data.ts` does not exist.

- [ ] **Step 4: Implement the exact skill definitions**

Create `continuous-delivery-skill-evidence.data.ts` with this shape and the exact `expectedSupport` arrays from Step 1:

```ts
import type { CapabilityEvidenceItem } from './devops-capability-evidence.types';

const continuousDeliverySkillDefinitions = [
  {
    id: 'continuous-delivery-skill-codepipeline',
    name: 'AWS CodePipeline',
    supportingEvidenceIds: [
      'codepipeline-approval-gated-deployment',
      'terraform-codepipeline-platform',
    ],
  },
  {
    id: 'continuous-delivery-skill-github',
    name: 'GitHub',
    supportingEvidenceIds: [
      'codepipeline-approval-gated-deployment',
      'github-actions-gitops-handoff',
    ],
  },
  {
    id: 'continuous-delivery-skill-docker',
    name: 'Docker',
    supportingEvidenceIds: [
      'gitops-same-package-environments',
      'reusable-helm-deployment-image',
    ],
  },
  {
    id: 'continuous-delivery-skill-ecr',
    name: 'Amazon ECR',
    supportingEvidenceIds: [
      'ecr-immutable-promotion',
      'gitops-same-package-environments',
    ],
  },
  {
    id: 'continuous-delivery-skill-helm',
    name: 'Helm',
    supportingEvidenceIds: [
      'codepipeline-approval-gated-deployment',
      'reusable-helm-deployment-image',
    ],
  },
  {
    id: 'continuous-delivery-skill-eks',
    name: 'Amazon EKS',
    supportingEvidenceIds: ['codepipeline-approval-gated-deployment'],
  },
  {
    id: 'continuous-delivery-skill-terraform',
    name: 'Terraform',
    supportingEvidenceIds: [
      'terraform-codepipeline-platform',
      'production-artifacts-version-control',
    ],
  },
  {
    id: 'continuous-delivery-skill-kubernetes',
    name: 'Kubernetes',
    supportingEvidenceIds: [
      'codepipeline-approval-gated-deployment',
      'argocd-environment-state-from-version-control',
      'argocd-automated-database-migrations',
      'deployment-health-checks',
    ],
  },
  {
    id: 'continuous-delivery-skill-github-actions',
    name: 'GitHub Actions',
    supportingEvidenceIds: [
      'github-actions-gitops-handoff',
      'serialized-deployment-process',
      'deployment-failure-notification',
    ],
  },
  {
    id: 'continuous-delivery-skill-openid-connect',
    name: 'OpenID Connect',
    supportingEvidenceIds: ['github-actions-gitops-handoff'],
  },
  {
    id: 'continuous-delivery-skill-nx',
    name: 'Nx',
    supportingEvidenceIds: ['github-actions-gitops-handoff'],
  },
  {
    id: 'continuous-delivery-skill-kustomize',
    name: 'Kustomize',
    supportingEvidenceIds: [
      'github-actions-gitops-handoff',
      'argocd-environment-state-from-version-control',
      'gitops-same-package-environments',
    ],
  },
  {
    id: 'continuous-delivery-skill-argo-cd',
    name: 'Argo CD',
    supportingEvidenceIds: [
      'argocd-environment-state-from-version-control',
      'argocd-automated-database-migrations',
    ],
  },
  {
    id: 'continuous-delivery-skill-sealed-secrets',
    name: 'Sealed Secrets',
    supportingEvidenceIds: ['sealed-secrets-version-control'],
  },
] as const;

export const continuousDeliverySkillEvidenceItems: readonly CapabilityEvidenceItem[] =
  continuousDeliverySkillDefinitions.map(
    ({ id, name, supportingEvidenceIds }) => ({
      id,
      title: name,
      label: name,
      type: 'skill',
      capabilityKeys: ['continuous-delivery'],
      summary: `Evidence-backed Continuous Delivery capability with ${name}.`,
      technologies: [name],
      isPublic: true,
      strength: 'strong',
      supportingEvidenceIds,
    }),
  );
```

Do not add extra technology strings or infer support from names. The source file must spell out all fourteen definitions; do not import the test constants.

- [ ] **Step 5: Run the focused skill and experience suites**

```bash
NX_DAEMON=false pnpm exec vitest run \
  apps/github.io/src/app/devops-capability-evidence/continuous-delivery-skill-evidence.data.spec.ts \
  apps/github.io/src/app/devops-capability-evidence/continuous-delivery-evidence.data.spec.ts \
  apps/github.io/src/app/devops-capability-evidence/continuous-integration-evidence.data.spec.ts
```

Expected: PASS.

- [ ] **Step 6: Inspect and commit the skill catalog**

```bash
git diff --check
git diff -- \
  apps/github.io/src/app/devops-capability-evidence/continuous-delivery-skill-evidence.data.ts \
  apps/github.io/src/app/devops-capability-evidence/continuous-delivery-skill-evidence.data.spec.ts
git add \
  apps/github.io/src/app/devops-capability-evidence/continuous-delivery-skill-evidence.data.ts \
  apps/github.io/src/app/devops-capability-evidence/continuous-delivery-skill-evidence.data.spec.ts
git diff --cached
git diff --cached --check
git commit -m "feat(github.io): add continuous delivery skills"
```

### Task 3: Add The Official Amazon EKS Brand Asset

**Files:**

- Create: `apps/github.io/src/assets/skills/aws/amazon-eks.svg`
- Modify: `apps/github.io/src/assets/skills/README.md`
- Modify: `apps/github.io/src/app/skills/skill-brand.ts`
- Modify: `apps/github.io/src/app/skills/skill-brand.spec.ts`

**Interfaces:**

- Consumes: the existing Vite SVG URL imports, `SkillBrand`, Simple Icons mappings, neutral `SkillToken`, and the Q2 2026 AWS Architecture Icons archive already documented in the repo.
- Produces: official local full-color icon metadata for `Amazon EKS`; preserves Simple Icons for GitHub, Docker, Helm, Terraform, Kubernetes, GitHub Actions, OpenID Connect, Nx, Kustomize, and Argo CD; preserves truthful text-only fallback for `Sealed Secrets`.

- [ ] **Step 1: Add failing CD brand assertions**

Extend `skill-brand.spec.ts`:

```ts
const cdSkillNames = [
  'AWS CodePipeline',
  'GitHub',
  'Docker',
  'Amazon ECR',
  'Helm',
  'Amazon EKS',
  'Terraform',
  'Kubernetes',
  'GitHub Actions',
  'OpenID Connect',
  'Nx',
  'Kustomize',
  'Argo CD',
  'Sealed Secrets',
] as const;

it('uses truthful brand treatment for every selected CD skill', () => {
  for (const skill of cdSkillNames) {
    const brand = getSkillBrand(skill);

    if (skill === 'Sealed Secrets') {
      expect(hasSkillBrandIcon(brand)).toBe(false);
      continue;
    }

    expect(hasSkillBrandIcon(brand), skill).toBe(true);
  }
});

it('uses an official local full-color AWS asset for Amazon EKS', () => {
  const brand = getSkillBrand('Amazon EKS');

  expect(brand?.iconPath).toBeUndefined();
  expect(brand?.iconDataUrl).toMatch(/assets\/.*\.svg/);
});
```

- [ ] **Step 2: Run the brand test and observe the EKS failure**

```bash
NX_DAEMON=false pnpm exec vitest run apps/github.io/src/app/skills/skill-brand.spec.ts
```

Expected: FAIL because `Amazon EKS` has no mapped local asset. `Sealed Secrets` must pass through the explicit no-icon branch rather than receiving an unrelated logo.

- [ ] **Step 3: Extract and document the official EKS icon**

Use the already approved and documented AWS archive:

```text
Source page: https://aws.amazon.com/architecture/icons/
Archive: https://d1.awsstatic.com/onedam/marketing-channels/website/aws/en_US/architecture/approved/architecture-icons/Icon-package_04302026.4705b90f5aa45b019271a2699e9ce9b97b941ee1.zip
Release: Q2 2026 / 2026-04-30
Upstream filename: Arch_Amazon-Elastic-Kubernetes-Service_64.svg
Local filename: aws/amazon-eks.svg
```

Download to `/tmp`, extract only the unmodified 64px SVG, and copy it into the asset directory. Do not hotlink the icon at runtime or alter its artwork.

Append the upstream-to-local mapping row to `apps/github.io/src/assets/skills/README.md`. Retain the existing source, release, retrieval, terms, and Kustomize fallback documentation.

- [ ] **Step 4: Map Amazon EKS in the skill-brand registry**

Update `skill-brand.ts`:

```ts
import eksIconUrl from '../../assets/skills/aws/amazon-eks.svg?no-inline';
```

Add this exact property to `skillIconAssets`:

```ts
'Amazon EKS': eksIconUrl,
```

Add this exact property to `skillBrandColors`:

```ts
'Amazon EKS': '#FFFFFF',
```

Do not add a `Sealed Secrets` color-only mapping. `getSkillBrand('Sealed Secrets')` should remain `undefined`, allowing the current neutral token to render text without an inaccurate icon.

- [ ] **Step 5: Run brand and token regression suites**

```bash
NX_DAEMON=false pnpm exec vitest run \
  apps/github.io/src/app/skills/skill-brand.spec.ts \
  apps/github.io/src/app/skills/skill-token.spec.tsx \
  apps/github.io/src/app/devops-capability-evidence/capability-evidence.spec.tsx
```

Expected: PASS.

- [ ] **Step 6: Inspect and commit the EKS brand asset**

```bash
git diff --check
git diff -- \
  apps/github.io/src/assets/skills/README.md \
  apps/github.io/src/app/skills/skill-brand.ts \
  apps/github.io/src/app/skills/skill-brand.spec.ts
git add \
  apps/github.io/src/assets/skills/aws/amazon-eks.svg \
  apps/github.io/src/assets/skills/README.md \
  apps/github.io/src/app/skills/skill-brand.ts \
  apps/github.io/src/app/skills/skill-brand.spec.ts
git diff --cached
git diff --cached --check
git commit -m "feat(github.io): add Amazon EKS skill branding"
```

### Task 4: Compose The Continuous Delivery Catalog And Projection

**Files:**

- Modify: `apps/github.io/src/app/devops-capability-evidence/devops-capability-evidence.types.ts`
- Modify: `apps/github.io/src/app/devops-capability-evidence/devops-capability-evidence.data.ts`
- Modify: `apps/github.io/src/app/devops-capability-evidence/devops-capability-evidence.spec.ts`

**Interfaces:**

- Consumes: `continuousDeliveryEvidenceItems`, `continuousDeliverySkillEvidenceItems`, and Task 1's shared CI records.
- Produces: one duplicate-free `devOpsCapabilityEvidenceItems` catalog; `DoraCapabilityScore.evidenceSummary?: string`; exact CD score projection with five experiences, fourteen skills, and `{ experience: 5, skill: 14 }`.

- [ ] **Step 1: Replace the stale generic-delivery test with failing catalog assertions**

In `devops-capability-evidence.spec.ts`, import both CD datasets and replace `keeps the CI/CD experience as a public-safe portfolio projection` with:

```ts
it('composes exactly seventeen Continuous Delivery experiences', () => {
  const deliveryExperiences = devOpsCapabilityEvidenceItems.filter(
    (item) =>
      item.type === 'experience' &&
      item.capabilityKeys.includes('continuous-delivery'),
  );

  expect(deliveryExperiences).toHaveLength(17);
  expect(new Set(deliveryExperiences.map((item) => item.id)).size).toBe(17);
  expect(deliveryExperiences.map((item) => item.id)).toEqual(
    expect.arrayContaining([
      ...continuousDeliveryEvidenceItems.map((item) => item.id),
      'terraform-codepipeline-platform',
      'ecr-immutable-promotion',
      'github-actions-gitops-handoff',
      'kustomize-tag-update-reliability',
      'reusable-helm-deployment-image',
    ]),
  );
});

it('removes the superseded generic Continuous Delivery placeholders', () => {
  expect(devOpsCapabilityEvidenceItems.map((item) => item.id)).not.toEqual(
    expect.arrayContaining([
      'github-actions-ci',
      'docker-delivery',
      'team-delivery-workflow',
    ]),
  );
});
```

- [ ] **Step 2: Add the failing exact projection and summary assertion**

```ts
it('curates the approved Continuous Delivery experiences and skills', () => {
  const score = curatedDevOpsCapabilityRadarScores.find(
    (entry) => entry.capabilityKey === 'continuous-delivery',
  );

  expect(score).toMatchObject({
    score: 4,
    maxScore: 5,
    strongestEvidenceId: 'codepipeline-approval-gated-deployment',
    evidenceCounts: { experience: 5, skill: 14 },
    evidenceSummary: '7+ years across two delivery platforms',
  });
  expect(score?.evidenceIds.slice(0, 5)).toEqual([
    'codepipeline-approval-gated-deployment',
    'github-actions-gitops-handoff',
    'argocd-environment-state-from-version-control',
    'gitops-same-package-environments',
    'argocd-automated-database-migrations',
  ]);
  expect(score?.evidenceIds.slice(5)).toEqual(
    continuousDeliverySkillEvidenceItems.map((item) => item.id),
  );
});
```

Retain the generic score-integrity test that verifies every referenced ID exists, supports the score capability, and matches `evidenceCounts`.

- [ ] **Step 3: Run the global evidence spec and observe the failures**

```bash
NX_DAEMON=false pnpm exec vitest run apps/github.io/src/app/devops-capability-evidence/devops-capability-evidence.spec.ts
```

Expected: FAIL because CD datasets are not composed, placeholders remain, the score lacks nineteen IDs and the summary, and `DoraCapabilityScore` lacks `evidenceSummary`.

- [ ] **Step 4: Add the optional score summary type**

Update `DoraCapabilityScore`:

```ts
export interface DoraCapabilityScore {
  capabilityKey: DoraCapabilityKey;
  label: string;
  score: number;
  maxScore: 5;
  evidenceIds: readonly string[];
  strongestEvidenceId?: string;
  evidenceCounts: Partial<Record<EvidenceType, number>>;
  evidenceSummary?: string;
}
```

- [ ] **Step 5: Compose the datasets exactly once**

Add imports to `devops-capability-evidence.data.ts`:

```ts
import { continuousDeliveryEvidenceItems } from './continuous-delivery-evidence.data';
import { continuousDeliverySkillEvidenceItems } from './continuous-delivery-skill-evidence.data';
```

Compose them after the existing CI arrays:

```ts
const devOpsCapabilityEvidenceItemCatalog = [
  // existing shared records
  ...continuousIntegrationEvidenceItems,
  ...continuousIntegrationSkillEvidenceItems,
  ...continuousDeliveryEvidenceItems,
  ...continuousDeliverySkillEvidenceItems,
  // remaining capability evidence
];
```

Do not add the five reused records again; they already enter through `continuousIntegrationEvidenceItems`. Delete the complete object literals for `github-actions-ci`, `docker-delivery`, and `team-delivery-workflow`.

- [ ] **Step 6: Replace the Continuous Delivery score**

Use this literal projection:

```ts
{
  capabilityKey: 'continuous-delivery',
  label: 'Delivery',
  score: 4,
  maxScore: 5,
  evidenceIds: [
    'codepipeline-approval-gated-deployment',
    'github-actions-gitops-handoff',
    'argocd-environment-state-from-version-control',
    'gitops-same-package-environments',
    'argocd-automated-database-migrations',
    ...continuousDeliverySkillEvidenceItems.map((item) => item.id),
  ],
  strongestEvidenceId: 'codepipeline-approval-gated-deployment',
  evidenceCounts: { experience: 5, skill: 14 },
  evidenceSummary: '7+ years across two delivery platforms',
},
```

Do not change the separate `deployment-automation` capability score.

- [ ] **Step 7: Run focused global and data tests**

```bash
NX_DAEMON=false pnpm exec vitest run \
  apps/github.io/src/app/devops-capability-evidence/devops-capability-evidence.spec.ts \
  apps/github.io/src/app/devops-capability-evidence/continuous-delivery-evidence.data.spec.ts \
  apps/github.io/src/app/devops-capability-evidence/continuous-delivery-skill-evidence.data.spec.ts \
  apps/github.io/src/app/devops-capability-evidence/continuous-integration-evidence.data.spec.ts
```

Expected: PASS.

- [ ] **Step 8: Inspect and commit catalog composition**

```bash
git diff --check
git diff -- \
  apps/github.io/src/app/devops-capability-evidence/devops-capability-evidence.types.ts \
  apps/github.io/src/app/devops-capability-evidence/devops-capability-evidence.data.ts \
  apps/github.io/src/app/devops-capability-evidence/devops-capability-evidence.spec.ts
git add \
  apps/github.io/src/app/devops-capability-evidence/devops-capability-evidence.types.ts \
  apps/github.io/src/app/devops-capability-evidence/devops-capability-evidence.data.ts \
  apps/github.io/src/app/devops-capability-evidence/devops-capability-evidence.spec.ts
git diff --cached
git diff --cached --check
git commit -m "feat(github.io): curate continuous delivery evidence"
```

### Task 5: Render The Experience Summary And Production Story

**Files:**

- Modify: `apps/github.io/src/app/devops-capability-evidence/dora-capability-card.evidence.ts`
- Modify: `apps/github.io/src/app/devops-capability-evidence/dora-capability-card.evidence.spec.ts`
- Modify: `apps/github.io/src/app/devops-capability-evidence/dora-capability-card.tsx`
- Modify: `apps/github.io/src/app/devops-capability-evidence/dora-capability-card.spec.tsx`
- Modify: `apps/github.io/src/app/devops-capability-evidence/dora-capability-card.stories.tsx`
- Modify: `apps/github.io/src/app/devops-capability-evidence/dora-capability-card.stories.spec.ts`

**Interfaces:**

- Consumes: Task 4's optional `DoraCapabilityScore.evidenceSummary`, production catalog, and exact CD projection.
- Produces: `getDoraCapabilityCardEvidenceSummary(capabilityKey, scores): string | undefined`; optional supporting secondary summary; `ContinuousDelivery` Storybook story backed by shared production data.

- [ ] **Step 1: Write failing summary resolver tests**

Add to `dora-capability-card.evidence.spec.ts`:

```ts
import { getDoraCapabilityCardEvidenceSummary } from './dora-capability-card.evidence';

describe('getDoraCapabilityCardEvidenceSummary', () => {
  it('returns the score-owned Continuous Delivery evidence summary', () => {
    expect(
      getDoraCapabilityCardEvidenceSummary(
        'continuous-delivery',
        curatedDevOpsCapabilityRadarScores,
      ),
    ).toBe('7+ years across two delivery platforms');
  });

  it('returns undefined when the capability has no evidence summary', () => {
    expect(
      getDoraCapabilityCardEvidenceSummary(
        'continuous-integration',
        curatedDevOpsCapabilityRadarScores,
      ),
    ).toBeUndefined();
    expect(
      getDoraCapabilityCardEvidenceSummary('continuous-delivery', undefined),
    ).toBeUndefined();
  });
});
```

- [ ] **Step 2: Run the resolver test and observe the missing export failure**

```bash
NX_DAEMON=false pnpm exec vitest run apps/github.io/src/app/devops-capability-evidence/dora-capability-card.evidence.spec.ts
```

Expected: FAIL because `getDoraCapabilityCardEvidenceSummary` is not exported.

- [ ] **Step 3: Implement the summary resolver**

Add to `dora-capability-card.evidence.ts`:

```ts
export function getDoraCapabilityCardEvidenceSummary(
  capabilityKey: DoraCapabilityKey,
  scores: readonly DoraCapabilityScore[] | undefined,
): string | undefined {
  return scores?.find((entry) => entry.capabilityKey === capabilityKey)
    ?.evidenceSummary;
}
```

Run the resolver spec again. Expected: PASS.

- [ ] **Step 4: Write failing component tests for summary and CD rows**

In `dora-capability-card.spec.tsx`, define the Continuous Delivery capability and add:

```ts
it('renders the Continuous Delivery experience summary as supporting context', () => {
  render(
    <DoraCapabilityCard
      capability={continuousDelivery}
      description={doraCapabilityDescriptions['continuous-delivery']}
      evidence={devOpsCapabilityEvidenceItems}
      scores={curatedDevOpsCapabilityRadarScores}
    />,
  );

  const summary = screen.getByText('7+ years across two delivery platforms');

  expect(summary.tagName).toBe('SPAN');
  expect(summary).toBeTruthy();
});

it('renders the approved Continuous Delivery experience and skill rows', () => {
  render(
    <DoraCapabilityCard
      capability={continuousDelivery}
      description={doraCapabilityDescriptions['continuous-delivery']}
      evidence={devOpsCapabilityEvidenceItems}
      scores={curatedDevOpsCapabilityRadarScores}
    />,
  );

  const experienceRow = screen.getByRole('list', { name: 'Experience' });
  const skillRow = screen.getByRole('list', { name: 'Skills' });

  expect(within(experienceRow).getAllByRole('listitem')).toHaveLength(5);
  expect(within(skillRow).getAllByRole('listitem')).toHaveLength(14);
  expect(
    within(experienceRow)
      .getAllByRole('group')
      .map((group) => group.getAttribute('aria-label')),
  ).toEqual([
    'Experience evidence: Approval-gated automation',
    'Experience evidence: Deployment automation',
    'Experience evidence: Environment state',
    'Experience evidence: Same package',
    'Experience evidence: Database migrations',
  ]);
});

it('does not render a summary for capabilities without one', () => {
  render(
    <DoraCapabilityCard
      capability={continuousIntegration}
      description={doraCapabilityDescriptions['continuous-integration']}
      evidence={devOpsCapabilityEvidenceItems}
      scores={curatedDevOpsCapabilityRadarScores}
    />,
  );

  expect(
    screen.queryByText('7+ years across two delivery platforms'),
  ).toBeNull();
});
```

Do not assert implementation-specific StyleX class names. The Astryx `Text` semantic props are exercised by rendering the component exactly as specified in Step 5.

- [ ] **Step 5: Render the optional summary with Astryx Text**

Import the resolver and compute the summary beside the rows:

```ts
const evidenceSummary = getDoraCapabilityCardEvidenceSummary(
  capability.key,
  scores,
);
```

Render it inside the existing heading/description `VStack` after the description:

```tsx
{
  evidenceSummary ? (
    <Text type="supporting" color="secondary">
      {evidenceSummary}
    </Text>
  ) : null;
}
```

Do not change `VStack` gaps, card dimensions, row markup, or token rendering.

- [ ] **Step 6: Add a failing production-story test**

Update `dora-capability-card.stories.spec.ts` to import `ContinuousDelivery` and add:

```ts
it('uses shared production data for Continuous Delivery', () => {
  expect(meta.args?.evidence).toBe(devOpsCapabilityEvidenceItems);
  expect(meta.args?.scores).toBe(curatedDevOpsCapabilityRadarScores);
  expect(ContinuousDelivery.args?.evidence).toBeUndefined();
  expect(ContinuousDelivery.args?.scores).toBeUndefined();
});

it('resolves the approved Continuous Delivery evidence and skills', () => {
  const score = curatedDevOpsCapabilityRadarScores.find(
    (entry) => entry.capabilityKey === 'continuous-delivery',
  );
  const selected = score?.evidenceIds.map((id) =>
    devOpsCapabilityEvidenceItems.find((item) => item.id === id),
  );

  expect(selected?.slice(0, 5).map((item) => item?.label)).toEqual([
    'Approval-gated automation',
    'Deployment automation',
    'Environment state',
    'Same package',
    'Database migrations',
  ]);
  expect(selected?.slice(5).map((item) => item?.title)).toEqual([
    'AWS CodePipeline',
    'GitHub',
    'Docker',
    'Amazon ECR',
    'Helm',
    'Amazon EKS',
    'Terraform',
    'Kubernetes',
    'GitHub Actions',
    'OpenID Connect',
    'Nx',
    'Kustomize',
    'Argo CD',
    'Sealed Secrets',
  ]);
});
```

Also change the existing CI expected fourth label from `GitOps handoff` to `Deployment automation` without changing any CI IDs or skill titles.

- [ ] **Step 7: Add the Continuous Delivery story**

In `dora-capability-card.stories.tsx`:

```ts
const continuousDelivery = capability('continuous-delivery');

export const ContinuousDelivery: Story = {
  args: {
    capability: continuousDelivery,
    description: doraCapabilityDescriptions['continuous-delivery'],
  },
};
```

The story must inherit `evidence` and `scores` from `meta.args`; do not create a story-only fixture.

- [ ] **Step 8: Run card, story, resolver, and shared token suites**

```bash
NX_DAEMON=false pnpm exec vitest run \
  apps/github.io/src/app/devops-capability-evidence/dora-capability-card.evidence.spec.ts \
  apps/github.io/src/app/devops-capability-evidence/dora-capability-card.spec.tsx \
  apps/github.io/src/app/devops-capability-evidence/dora-capability-card.stories.spec.ts \
  apps/github.io/src/app/devops-capability-evidence/capability-evidence.spec.tsx \
  apps/github.io/src/app/skills/skill-token.spec.tsx
```

Expected: PASS.

- [ ] **Step 9: Inspect and commit the card presentation**

```bash
git diff --check
git diff -- \
  apps/github.io/src/app/devops-capability-evidence/dora-capability-card.evidence.ts \
  apps/github.io/src/app/devops-capability-evidence/dora-capability-card.evidence.spec.ts \
  apps/github.io/src/app/devops-capability-evidence/dora-capability-card.tsx \
  apps/github.io/src/app/devops-capability-evidence/dora-capability-card.spec.tsx \
  apps/github.io/src/app/devops-capability-evidence/dora-capability-card.stories.tsx \
  apps/github.io/src/app/devops-capability-evidence/dora-capability-card.stories.spec.ts
git add \
  apps/github.io/src/app/devops-capability-evidence/dora-capability-card.evidence.ts \
  apps/github.io/src/app/devops-capability-evidence/dora-capability-card.evidence.spec.ts \
  apps/github.io/src/app/devops-capability-evidence/dora-capability-card.tsx \
  apps/github.io/src/app/devops-capability-evidence/dora-capability-card.spec.tsx \
  apps/github.io/src/app/devops-capability-evidence/dora-capability-card.stories.tsx \
  apps/github.io/src/app/devops-capability-evidence/dora-capability-card.stories.spec.ts
git diff --cached
git diff --cached --check
git commit -m "feat(github.io): present continuous delivery evidence"
```

### Task 6: Run Full Validation And Responsive Storybook QA

**Files:**

- Verify only: all files changed in Tasks 1-5.
- Modify only when a validation failure proves a scoped correction is required; add the regression assertion to the closest focused test and commit that correction separately.

**Interfaces:**

- Consumes: the complete feature branch.
- Produces: passing focused and project validation plus phone and iPad visual evidence for the production-data Continuous Delivery story.

- [ ] **Step 1: Run the complete focused regression set**

```bash
NX_DAEMON=false pnpm exec vitest run \
  apps/github.io/src/app/devops-capability-evidence/continuous-delivery-evidence.data.spec.ts \
  apps/github.io/src/app/devops-capability-evidence/continuous-delivery-skill-evidence.data.spec.ts \
  apps/github.io/src/app/devops-capability-evidence/continuous-integration-evidence.data.spec.ts \
  apps/github.io/src/app/devops-capability-evidence/devops-capability-evidence.spec.ts \
  apps/github.io/src/app/devops-capability-evidence/dora-capability-card.evidence.spec.ts \
  apps/github.io/src/app/devops-capability-evidence/dora-capability-card.spec.tsx \
  apps/github.io/src/app/devops-capability-evidence/dora-capability-card.stories.spec.ts \
  apps/github.io/src/app/devops-capability-evidence/capability-evidence.spec.tsx \
  apps/github.io/src/app/skills/skill-brand.spec.ts \
  apps/github.io/src/app/skills/skill-token.spec.tsx
```

Expected: PASS.

- [ ] **Step 2: Run complete github.io verification**

Run each command separately and retain the success output:

```bash
NX_DAEMON=false pnpm nx test github.io --skip-nx-cache
NX_DAEMON=false pnpm nx lint github.io --skip-nx-cache
NX_DAEMON=false pnpm nx build github.io --skip-nx-cache
NX_DAEMON=false pnpm nx build-storybook github.io --skip-nx-cache
```

Expected: all four targets succeed. Existing unrelated deprecation warnings are acceptable; test failures, lint errors, build failures, privacy failures, and Storybook compilation failures are not.

- [ ] **Step 3: Start Storybook from the linked worktree**

From the worktree root, choose an unused local port, preferring 6008:

```bash
NX_DAEMON=false pnpm nx storybook github.io --host 0.0.0.0 --port 6008
```

Keep the process running until both responsive checks are complete. Use this story URL:

```text
http://127.0.0.1:6008/iframe.html?id=github-io-devops-capability-evidence-dora-capability-card--continuous-delivery&viewMode=story
```

- [ ] **Step 4: Verify the phone viewport**

Inspect the production-data story at `390x844`. Confirm:

- the heading and DORA description remain readable;
- `7+ years across two delivery platforms` appears once as secondary supporting text;
- `Experience` precedes exactly five neutral experience tokens;
- `Skills` precedes exactly fourteen neutral skill tokens;
- AWS CodePipeline, Amazon ECR, and Amazon EKS use local full-color AWS marks;
- other mapped brands use their truthful brand-colored logos;
- Sealed Secrets uses a readable text-only neutral token;
- long labels wrap without horizontal overflow;
- no text, token, label, or card content overlaps; and
- the card width and spacing remain consistent with the existing stories.

- [ ] **Step 5: Verify the iPad viewport**

Inspect the same story at `768x1024`. Confirm the same content and order plus:

- the extra width produces natural token wrapping without excessive gaps;
- neither row changes height unexpectedly while assets load;
- the summary does not compete with the capability description; and
- the complete card remains visible and centered without clipping.

Capture screenshots for the task record if the browser tool supports it. Screenshots are verification artifacts and must not be committed unless the repository already tracks that exact artifact type for this story.

- [ ] **Step 6: Stop Storybook and verify the worktree state**

Stop the Storybook process, then run:

```bash
git status --short --branch
git log --oneline --decorate -6
```

Expected: no required process remains running; the worktree is clean unless a verified correction is intentionally pending.

- [ ] **Step 7: Commit any verification correction separately**

Only if Steps 1-5 exposed a real issue, stage the exact corrected source and regression-test paths, inspect both diffs, and use a scoped conventional commit such as:

```bash
git add <exact-source-path> <exact-test-path>
git diff --cached
git diff --cached --check
git commit -m "fix(github.io): correct continuous delivery evidence"
```

If validation passes without source changes, do not create an empty verification commit.

## Completion Criteria

- The branch contains the approved design spec and implementation plan plus separate logical commits for experiences, skills, EKS branding, catalog projection, and card presentation.
- The global public catalog has 17 unique Continuous Delivery experiences and 14 supported CD skills.
- The Continuous Delivery score selects the exact approved five experiences followed by all skills and exposes the approved `7+ years` summary.
- The three generic placeholders are absent.
- Shared CI records remain valid and the CI score retains its IDs, order, counts, and 4-of-5 score.
- Privacy, terminology, metrics, limitations, support relationships, accessibility, responsive layout, and icon provenance are locked by tests or documented QA.
- Focused tests, complete `github.io` tests, lint, app build, Storybook build, phone QA, and iPad QA pass.
- Nothing is pushed, merged, or deployed automatically.
