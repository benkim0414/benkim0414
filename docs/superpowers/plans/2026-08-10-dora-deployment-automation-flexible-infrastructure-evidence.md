# DORA Deployment Automation And Flexible Infrastructure Evidence Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the generic Deployment Automation and mixed Flexible Infrastructure cards with public-safe five-experience projections and complete evidence-backed skill catalogs.

**Architecture:** Add capability-owned experience and skill modules that reuse existing CI/CD records through explicit required-record lookups. Compose the modules into the global evidence catalog, keep each score projection literal, and render both cards through the unchanged resolver and component.

**Tech Stack:** TypeScript 5.9, React 19, Vitest 4, Testing Library, Storybook 10, Nx 23, pnpm 11, Simple Icons 16.

**Spec:** `docs/superpowers/specs/2026-08-10-dora-deployment-automation-flexible-infrastructure-evidence-design.md`

**Execution mode:** The repository instructions preselect `superpowers:subagent-driven-development` once this plan is approved for implementation.

## Global Constraints

- Work only in the linked worktree on `feat/dora-deployment-flexible-infrastructure-cards`.
- Keep Deployment Automation and Flexible Infrastructure at `4/5`.
- Publish only affirmative, independently supportable evidence.
- Do not publish private repository, path, organization, account, identity, service, workflow, module, image, parameter, URL, or business-domain identifiers.
- Preserve exact public measurements from the approved spec and use `2026-08-09` as their `measuredAt` snapshot.
- Use `2024-06-03` for new GitHub Actions/GitOps platform experience periods and preserve dates on reused records.
- Keep every compact projection as five literal experience IDs followed by every literal skill ID; do not use spreads, `map()`, `slice()`, ranking, or runtime sorting in score definitions.
- Keep dates in structured evidence only; compact tokens must not display dates.
- Keep the existing card resolver, component structure, two-row accessibility model, neutral skill surfaces, and responsive behavior.
- Stage explicit paths only and commit each task with the conventional subject shown.
- Do not push, open a PR, merge, deploy, or modify the private evidence repository.

---

## File Structure

### New files

- `apps/github.io/src/app/devops-capability-evidence/deployment-automation-evidence.data.ts` — complete nine-experience Deployment Automation catalog.
- `apps/github.io/src/app/devops-capability-evidence/deployment-automation-evidence.data.spec.ts` — order, metrics, privacy, and compatibility contract.
- `apps/github.io/src/app/devops-capability-evidence/deployment-automation-skill-evidence.data.ts` — canonical thirteen-skill catalog.
- `apps/github.io/src/app/devops-capability-evidence/deployment-automation-skill-evidence.data.spec.ts` — skill order, support, chronology, and privacy contract.
- `apps/github.io/src/app/devops-capability-evidence/flexible-infrastructure-evidence.data.ts` — complete seven-experience Flexible Infrastructure catalog.
- `apps/github.io/src/app/devops-capability-evidence/flexible-infrastructure-evidence.data.spec.ts` — order, metrics, privacy, and compatibility contract.
- `apps/github.io/src/app/devops-capability-evidence/flexible-infrastructure-skill-evidence.data.ts` — canonical twelve-skill catalog.
- `apps/github.io/src/app/devops-capability-evidence/flexible-infrastructure-skill-evidence.data.spec.ts` — skill order, support, chronology, and privacy contract.

### Modified files

- `apps/github.io/src/app/devops-capability-evidence/continuous-delivery-evidence.data.ts` — add Deployment Automation and Flexible Infrastructure mappings to reused records.
- `apps/github.io/src/app/devops-capability-evidence/continuous-delivery-evidence.data.spec.ts` — lock those mappings.
- `apps/github.io/src/app/devops-capability-evidence/continuous-integration-evidence.data.ts` — add Flexible Infrastructure to the reusable Terraform platform.
- `apps/github.io/src/app/devops-capability-evidence/continuous-integration-evidence.data.spec.ts` — lock the mapping.
- `apps/github.io/src/app/devops-capability-evidence/devops-capability-evidence.data.ts` — compose new modules, remove migrated inline records, and replace both score projections.
- `apps/github.io/src/app/devops-capability-evidence/devops-capability-evidence.spec.ts` — lock global integrity and projection stability.
- `apps/github.io/src/app/devops-capability-evidence/dora-capability-card.spec.tsx` — lock both rendered summaries and row contents.
- `apps/github.io/src/app/devops-capability-evidence/dora-capability-card.stories.tsx` — add the production Deployment Automation story.
- `apps/github.io/src/app/devops-capability-evidence/dora-capability-card.stories.spec.ts` — lock both production stories and their exact projections.
- `apps/github.io/src/app/skills/skill-brand.ts` — add truthful aliases or color metadata for new skill labels.
- `apps/github.io/src/app/skills/skill-brand.spec.ts` — lock icon-backed, color-only, and intentionally unbranded behavior.

---

### Task 1: Prepare Reused CI/CD Evidence

**Files:**

- Modify: `apps/github.io/src/app/devops-capability-evidence/continuous-integration-evidence.data.ts:19-71`
- Modify: `apps/github.io/src/app/devops-capability-evidence/continuous-integration-evidence.data.spec.ts`
- Modify: `apps/github.io/src/app/devops-capability-evidence/continuous-delivery-evidence.data.ts:1-205`
- Modify: `apps/github.io/src/app/devops-capability-evidence/continuous-delivery-evidence.data.spec.ts`

**Interfaces:**

- Consumes: existing `continuousIntegrationEvidenceItems` and `continuousDeliveryEvidenceItems` arrays.
- Produces: capability-compatible shared records `terraform-codepipeline-platform`, `codepipeline-approval-gated-deployment`, `github-actions-gitops-handoff`, and `argocd-environment-state-from-version-control`.

- [ ] **Step 1: Write failing mapping tests**

Add exact assertions beside the existing record tests:

```ts
expect(byId.get('terraform-codepipeline-platform')?.capabilityKeys).toEqual([
  'continuous-integration',
  'continuous-delivery',
  'version-control',
  'flexible-infrastructure',
]);

expect(
  byId.get('codepipeline-approval-gated-deployment')?.capabilityKeys,
).toContain('deployment-automation');
expect(byId.get('github-actions-gitops-handoff')?.capabilityKeys).toContain(
  'deployment-automation',
);
expect(
  byId.get('argocd-environment-state-from-version-control')?.capabilityKeys,
).toContain('flexible-infrastructure');
```

- [ ] **Step 2: Run the focused tests and verify red**

Run:

```bash
NX_DAEMON=false pnpm exec vitest run apps/github.io/src/app/devops-capability-evidence/continuous-integration-evidence.data.spec.ts apps/github.io/src/app/devops-capability-evidence/continuous-delivery-evidence.data.spec.ts
```

Expected: FAIL because the four records do not yet carry the new capability keys.

- [ ] **Step 3: Add only the required capability mappings**

Change the relevant `capabilityKeys` arrays to:

```ts
capabilityKeys: [
  'continuous-integration',
  'continuous-delivery',
  'version-control',
  'flexible-infrastructure',
],

capabilityKeys: ['continuous-delivery', 'deployment-automation'],

capabilityKeys: [
  'continuous-integration',
  'continuous-delivery',
  'version-control',
  'deployment-automation',
],

capabilityKeys: [
  'continuous-delivery',
  'version-control',
  'flexible-infrastructure',
],
```

Preserve every ID, label, title, summary, metric, fact, technology, date, and existing capability key.

- [ ] **Step 4: Run focused tests and verify green**

Run the Step 2 command.

Expected: PASS.

- [ ] **Step 5: Commit the shared mapping preparation**

```bash
git add apps/github.io/src/app/devops-capability-evidence/continuous-integration-evidence.data.ts apps/github.io/src/app/devops-capability-evidence/continuous-integration-evidence.data.spec.ts apps/github.io/src/app/devops-capability-evidence/continuous-delivery-evidence.data.ts apps/github.io/src/app/devops-capability-evidence/continuous-delivery-evidence.data.spec.ts
git commit -m "feat(github.io): prepare deployment infrastructure evidence"
```

---

### Task 2: Add Deployment Automation Experiences

**Files:**

- Create: `apps/github.io/src/app/devops-capability-evidence/deployment-automation-evidence.data.ts`
- Create: `apps/github.io/src/app/devops-capability-evidence/deployment-automation-evidence.data.spec.ts`

**Interfaces:**

- Consumes: `CapabilityEvidenceItem`, `capabilityEvidenceInitiatives.githubActionsMonorepo`, and the four shared records prepared in Task 1.
- Produces: `deploymentAutomationEvidenceItems: readonly CapabilityEvidenceItem[]` in the approved nine-record order.

- [ ] **Step 1: Write the failing catalog contract**

Create the spec with these exact IDs and core assertions:

```ts
import { deploymentAutomationEvidenceItems } from './deployment-automation-evidence.data';

const expectedIds = [
  'merge-triggered-deployment-path',
  'environment-neutral-deployment-mechanism',
  'generator-based-service-onboarding',
  'automated-sealed-secret-delivery',
  'deterministic-kubernetes-overlays',
  'deployment-traceability-chain',
  'codepipeline-approval-gated-deployment',
  'github-actions-gitops-handoff',
  'image-digest-deployments',
] as const;

it('stores the approved Deployment Automation experiences in display order', () => {
  expect(deploymentAutomationEvidenceItems.map(({ id }) => id)).toEqual(
    expectedIds,
  );
});

it('keeps every record public, structured, affirmative, and compatible', () => {
  for (const item of deploymentAutomationEvidenceItems) {
    expect(item).toMatchObject({ type: 'experience', isPublic: true });
    expect(item.capabilityKeys).toContain('deployment-automation');
    expect(item.organization).toBeUndefined();
    expect(item.proofUrl).toBeUndefined();
    expect(item.details?.period.startedAt).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(item.details?.facts.length).toBeGreaterThan(0);
    expect(item.technologies?.length).toBeGreaterThan(0);
    expect(item.label?.trim().split(/\s+/).length).toBeLessThanOrEqual(4);
  }
});
```

Add exact metric expectations:

```ts
expect(byId.get('merge-triggered-deployment-path')?.details?.metrics).toEqual([
  {
    label: 'API-triggered deployment runs',
    value: 252,
    denominator: 252,
    unit: 'count',
    measuredAt: '2026-08-09',
  },
  {
    label: 'Automation-authored deployment events',
    value: 448,
    denominator: 513,
    unit: 'count',
    measuredAt: '2026-08-09',
  },
]);
expect(
  byId.get('environment-neutral-deployment-mechanism')?.details?.metrics,
).toEqual([
  {
    label: 'Environment-specific deploy scripts',
    value: 0,
    denominator: 11,
    unit: 'count',
    measuredAt: '2026-08-09',
  },
  {
    label: 'Demo environment deployment events',
    value: 259,
    denominator: 513,
    unit: 'count',
    measuredAt: '2026-08-09',
  },
  {
    label: 'Production environment deployment events',
    value: 254,
    denominator: 513,
    unit: 'count',
    measuredAt: '2026-08-09',
  },
]);
expect(
  byId.get('generator-based-service-onboarding')?.details?.metrics,
).toEqual([
  {
    label: 'Mean core template conformance',
    value: 79.5,
    unit: 'percent',
    measuredAt: '2026-08-09',
  },
  {
    label: 'Services with all core template files',
    value: 8,
    denominator: 20,
    unit: 'count',
    measuredAt: '2026-08-09',
  },
]);
expect(byId.get('automated-sealed-secret-delivery')?.details?.metrics).toEqual([
  {
    label: 'Encrypted declarative secret payloads',
    value: 31,
    unit: 'count',
    measuredAt: '2026-08-09',
  },
]);
expect(byId.get('deterministic-kubernetes-overlays')?.details?.metrics).toEqual(
  [
    {
      label: 'Deterministic overlay renders',
      value: 39,
      denominator: 39,
      unit: 'count',
      measuredAt: '2026-08-09',
    },
    {
      label: 'Overlay build failures',
      value: 0,
      denominator: 39,
      unit: 'count',
      measuredAt: '2026-08-09',
    },
  ],
);
```

Reject URLs, 12-digit values, organization language, private-source language, manual-residue language, authorization gaps, and failing-suite wording. Include the affirmative guard sentence `Automated deployments completed without manual intervention.` and assert it does not match the prohibited pattern.

- [ ] **Step 2: Run the new spec and verify red**

```bash
NX_DAEMON=false pnpm exec vitest run apps/github.io/src/app/devops-capability-evidence/deployment-automation-evidence.data.spec.ts
```

Expected: FAIL because the module does not exist.

- [ ] **Step 3: Implement the nine-record module**

Use this module boundary:

```ts
import { capabilityEvidenceInitiatives } from './capability-evidence-initiatives';
import { continuousDeliveryEvidenceItems } from './continuous-delivery-evidence.data';
import type { CapabilityEvidenceItem } from './devops-capability-evidence.types';

const snapshotDate = '2026-08-09';
const githubInitiative = capabilityEvidenceInitiatives.githubActionsMonorepo;
const sharedById = new Map(
  continuousDeliveryEvidenceItems.map((item) => [item.id, item]),
);

const requiredSharedExperience = (id: string): CapabilityEvidenceItem => {
  const item = sharedById.get(id);
  if (!item || !item.capabilityKeys.includes('deployment-automation')) {
    throw new Error(
      `Deployment Automation evidence requires shared record: ${id}`,
    );
  }
  return item;
};
```

Define the six new records with the labels below, `period.startedAt: '2024-06-03'`, the Step 1 metrics, and one affirmative fact that restates each measured outcome without private identifiers:

```ts
const deploymentAutomationAdditionalExperienceItems = [
  {
    id: 'merge-triggered-deployment-path',
    label: 'Merge-triggered deployments',
    title: 'Merge-triggered machine-to-machine deployment',
    technologies: ['GitHub Actions', 'GitHub API', 'OpenID Connect', 'Nx'],
  },
  {
    id: 'environment-neutral-deployment-mechanism',
    label: 'Environment-neutral deploys',
    title: 'One environment-neutral deployment mechanism',
    technologies: ['GitOps', 'Kustomize', 'Kubernetes'],
  },
  {
    id: 'generator-based-service-onboarding',
    label: 'Generator-based onboarding',
    title: 'Generator-based service onboarding',
    technologies: ['Nx', 'TypeScript'],
  },
  {
    id: 'automated-sealed-secret-delivery',
    label: 'Automated secret delivery',
    title: 'Automated encrypted secret delivery',
    technologies: ['Sealed Secrets', 'Argo CD', 'Kubernetes'],
  },
  {
    id: 'deterministic-kubernetes-overlays',
    label: 'Deterministic overlays',
    title: 'Deterministic Kubernetes overlay rendering',
    technologies: ['Kustomize', 'Kubernetes', 'GitOps'],
  },
  {
    id: 'deployment-traceability-chain',
    label: 'Deployment traceability',
    title: 'End-to-end deployment traceability',
    technologies: ['Docker', 'Amazon ECR', 'GitHub'],
  },
] as const;
```

Expand each compact declaration into a full `CapabilityEvidenceItem` with `type: 'experience'`, the approved capability keys, exact summary, `details`, `isPublic`, and strength. Give `deterministic-kubernetes-overlays` both target capability keys. Move `image-digest-deployments` from the global inline catalog into this module, remove its `organization`, preserve its stable ID, set `period.startedAt` to `2024-06-03`, and add structured facts. Export the six new records, the two required shared records, and the migrated image-digest record in `expectedIds` order.

- [ ] **Step 4: Run the focused spec and verify green**

Run the Step 2 command.

Expected: PASS with nine records and exact metrics.

- [ ] **Step 5: Commit Deployment Automation experiences**

```bash
git add apps/github.io/src/app/devops-capability-evidence/deployment-automation-evidence.data.ts apps/github.io/src/app/devops-capability-evidence/deployment-automation-evidence.data.spec.ts
git commit -m "feat(github.io): add deployment automation evidence"
```

---

### Task 3: Add Deployment Automation Skills

**Files:**

- Create: `apps/github.io/src/app/devops-capability-evidence/deployment-automation-skill-evidence.data.ts`
- Create: `apps/github.io/src/app/devops-capability-evidence/deployment-automation-skill-evidence.data.spec.ts`

**Interfaces:**

- Consumes: `deploymentAutomationEvidenceItems` from Task 2.
- Produces: `deploymentAutomationSkillEvidenceItems: readonly CapabilityEvidenceItem[]` with thirteen skills.

- [ ] **Step 1: Write failing order, support, chronology, and privacy tests**

Lock these exact titles and support links:

```ts
const expectedSupport = {
  'AWS CodePipeline': ['codepipeline-approval-gated-deployment'],
  Terraform: ['codepipeline-approval-gated-deployment'],
  'GitHub Actions': [
    'merge-triggered-deployment-path',
    'github-actions-gitops-handoff',
  ],
  'Argo CD': [
    'github-actions-gitops-handoff',
    'automated-sealed-secret-delivery',
  ],
  GitOps: [
    'github-actions-gitops-handoff',
    'environment-neutral-deployment-mechanism',
  ],
  Docker: ['deployment-traceability-chain', 'image-digest-deployments'],
  'Amazon ECR': ['deployment-traceability-chain', 'image-digest-deployments'],
  Kubernetes: [
    'environment-neutral-deployment-mechanism',
    'automated-sealed-secret-delivery',
    'deterministic-kubernetes-overlays',
  ],
  'OpenID Connect': ['merge-triggered-deployment-path'],
  Nx: ['generator-based-service-onboarding', 'merge-triggered-deployment-path'],
  'GitHub API': ['merge-triggered-deployment-path'],
  Kustomize: [
    'environment-neutral-deployment-mechanism',
    'deterministic-kubernetes-overlays',
  ],
  'Sealed Secrets': ['automated-sealed-secret-delivery'],
} as const;
```

Assert exact title order, exact support, nondecreasing earliest support dates, public skill shape, and support resolution to compatible experiences.

- [ ] **Step 2: Run the new skill spec and verify red**

```bash
NX_DAEMON=false pnpm exec vitest run apps/github.io/src/app/devops-capability-evidence/deployment-automation-skill-evidence.data.spec.ts
```

Expected: FAIL because the skill module does not exist.

- [ ] **Step 3: Implement the canonical skill catalog**

Create `deploymentAutomationSkillDefinitions` with IDs derived from the approved titles:

```ts
const deploymentAutomationSkillDefinitions = [
  ['deployment-automation-skill-aws-codepipeline', 'AWS CodePipeline'],
  ['deployment-automation-skill-terraform', 'Terraform'],
  ['deployment-automation-skill-github-actions', 'GitHub Actions'],
  ['deployment-automation-skill-argo-cd', 'Argo CD'],
  ['deployment-automation-skill-gitops', 'GitOps'],
  ['deployment-automation-skill-docker', 'Docker'],
  ['deployment-automation-skill-amazon-ecr', 'Amazon ECR'],
  ['deployment-automation-skill-kubernetes', 'Kubernetes'],
  ['deployment-automation-skill-openid-connect', 'OpenID Connect'],
  ['deployment-automation-skill-nx', 'Nx'],
  ['deployment-automation-skill-github-api', 'GitHub API'],
  ['deployment-automation-skill-kustomize', 'Kustomize'],
  ['deployment-automation-skill-sealed-secrets', 'Sealed Secrets'],
] as const;
```

Attach the exact `expectedSupport` lists and map definitions to public `skill` records with `capabilityKeys: ['deployment-automation']`, `technologies: [name]`, and `strength: 'supporting'`.

- [ ] **Step 4: Run the focused skill spec and verify green**

Run the Step 2 command.

Expected: PASS with thirteen skills and valid support.

- [ ] **Step 5: Commit Deployment Automation skills**

```bash
git add apps/github.io/src/app/devops-capability-evidence/deployment-automation-skill-evidence.data.ts apps/github.io/src/app/devops-capability-evidence/deployment-automation-skill-evidence.data.spec.ts
git commit -m "feat(github.io): add deployment automation skills"
```

---

### Task 4: Add Flexible Infrastructure Experiences

**Files:**

- Create: `apps/github.io/src/app/devops-capability-evidence/flexible-infrastructure-evidence.data.ts`
- Create: `apps/github.io/src/app/devops-capability-evidence/flexible-infrastructure-evidence.data.spec.ts`

**Interfaces:**

- Consumes: shared CI/CD records from Task 1 and `deterministic-kubernetes-overlays` from Task 2.
- Produces: `flexibleInfrastructureEvidenceItems: readonly CapabilityEvidenceItem[]` in the approved seven-record order.

- [ ] **Step 1: Write the failing catalog contract**

Lock this order:

```ts
const expectedIds = [
  'terraform-managed-cloud-foundations',
  'irsa-service-accounts',
  'terraform-scoped-iam',
  'terraform-codepipeline-platform',
  'argocd-environment-state-from-version-control',
  'deterministic-kubernetes-overlays',
  'reusable-kubernetes-deployment-foundations',
] as const;
```

Reuse the public/structured/capability/label/metric validation loop from Task 2 with `flexible-infrastructure`. Add exact assertions:

```ts
expect(
  byId.get('terraform-managed-cloud-foundations')?.details?.metrics,
).toEqual([
  {
    label: 'Terraform roots',
    value: 13,
    unit: 'count',
    measuredAt: '2026-08-09',
  },
  {
    label: 'Terraform-managed container repositories',
    value: 3,
    unit: 'count',
    measuredAt: '2026-08-09',
  },
]);
expect(byId.get('irsa-service-accounts')?.details?.metrics).toEqual([
  {
    label: 'Per-service IRSA modules using the shared module',
    value: 9,
    denominator: 9,
    unit: 'count',
    measuredAt: '2026-08-09',
  },
]);
expect(byId.get('irsa-service-accounts')?.organization).toBeUndefined();
expect(byId.get('terraform-scoped-iam')?.organization).toBeUndefined();
```

Assert `deterministic-kubernetes-overlays` is the same object reference exported by Deployment Automation, and assert every reused record contains `flexible-infrastructure`.

- [ ] **Step 2: Run the new spec and verify red**

```bash
NX_DAEMON=false pnpm exec vitest run apps/github.io/src/app/devops-capability-evidence/flexible-infrastructure-evidence.data.spec.ts
```

Expected: FAIL because the module does not exist.

- [ ] **Step 3: Implement the seven-record module**

Build one `sharedById` map from continuous integration, continuous delivery, and Deployment Automation arrays. Use a `requiredSharedExperience(id)` helper that also checks the Flexible Infrastructure key.

Create four owned records:

```ts
const flexibleInfrastructureOwnedExperienceItems = [
  {
    id: 'terraform-managed-cloud-foundations',
    label: 'Terraform cloud foundations',
    title: 'Terraform-managed cloud foundations',
    technologies: ['Terraform', 'AWS', 'Amazon ECR'],
    startedAt: '2024-06-03',
  },
  {
    id: 'irsa-service-accounts',
    label: 'Shared IRSA modules',
    title: 'Shared Terraform IRSA modules',
    technologies: ['Terraform', 'AWS IAM', 'IRSA', 'Kubernetes'],
    startedAt: '2024-06-03',
  },
  {
    id: 'terraform-scoped-iam',
    label: 'Terraform scoped IAM',
    title: 'Terraform-managed scoped IAM policies',
    technologies: ['Terraform', 'AWS IAM', 'IRSA'],
    startedAt: '2024-06-03',
  },
  {
    id: 'reusable-kubernetes-deployment-foundations',
    label: 'Reusable K8s foundations',
    title: 'Reusable Kubernetes deployment foundations',
    technologies: ['Kubernetes', 'kubectl', 'Helm', 'Docker'],
    startedAt: '2019-07-05',
  },
] as const;
```

Expand them to full records with affirmative summaries, structured facts, the exact Step 1 metrics where present, `isPublic: true`, and no organization. Export owned records 1-3, shared records 4-6, and owned record 7 in `expectedIds` order. Move the legacy `irsa-service-accounts` and `terraform-scoped-iam` definitions out of the global inline catalog when Task 6 composes this module.

- [ ] **Step 4: Run the focused experience specs**

```bash
NX_DAEMON=false pnpm exec vitest run apps/github.io/src/app/devops-capability-evidence/deployment-automation-evidence.data.spec.ts apps/github.io/src/app/devops-capability-evidence/flexible-infrastructure-evidence.data.spec.ts
```

Expected: PASS, including shared object identity and compatibility.

- [ ] **Step 5: Commit Flexible Infrastructure experiences**

```bash
git add apps/github.io/src/app/devops-capability-evidence/flexible-infrastructure-evidence.data.ts apps/github.io/src/app/devops-capability-evidence/flexible-infrastructure-evidence.data.spec.ts
git commit -m "feat(github.io): add flexible infrastructure evidence"
```

---

### Task 5: Add Flexible Infrastructure Skills

**Files:**

- Create: `apps/github.io/src/app/devops-capability-evidence/flexible-infrastructure-skill-evidence.data.ts`
- Create: `apps/github.io/src/app/devops-capability-evidence/flexible-infrastructure-skill-evidence.data.spec.ts`

**Interfaces:**

- Consumes: `flexibleInfrastructureEvidenceItems` from Task 4.
- Produces: `flexibleInfrastructureSkillEvidenceItems: readonly CapabilityEvidenceItem[]` with twelve skills.

- [ ] **Step 1: Write failing order, support, chronology, and privacy tests**

Lock these links:

```ts
const expectedSupport = {
  Terraform: [
    'terraform-managed-cloud-foundations',
    'irsa-service-accounts',
    'terraform-scoped-iam',
    'terraform-codepipeline-platform',
  ],
  AWS: [
    'terraform-managed-cloud-foundations',
    'terraform-codepipeline-platform',
  ],
  Kubernetes: [
    'irsa-service-accounts',
    'argocd-environment-state-from-version-control',
    'deterministic-kubernetes-overlays',
    'reusable-kubernetes-deployment-foundations',
  ],
  kubectl: ['reusable-kubernetes-deployment-foundations'],
  Helm: ['reusable-kubernetes-deployment-foundations'],
  Docker: [
    'terraform-codepipeline-platform',
    'reusable-kubernetes-deployment-foundations',
  ],
  'Amazon ECR': [
    'terraform-managed-cloud-foundations',
    'terraform-codepipeline-platform',
  ],
  'AWS IAM': ['irsa-service-accounts', 'terraform-scoped-iam'],
  IRSA: ['irsa-service-accounts', 'terraform-scoped-iam'],
  Kustomize: [
    'argocd-environment-state-from-version-control',
    'deterministic-kubernetes-overlays',
  ],
  'Argo CD': ['argocd-environment-state-from-version-control'],
  GitOps: [
    'argocd-environment-state-from-version-control',
    'deterministic-kubernetes-overlays',
  ],
} as const;
```

Assert exact order, exact support, nondecreasing earliest support dates, public skill shape, and compatible experience support.

- [ ] **Step 2: Run the new skill spec and verify red**

```bash
NX_DAEMON=false pnpm exec vitest run apps/github.io/src/app/devops-capability-evidence/flexible-infrastructure-skill-evidence.data.spec.ts
```

Expected: FAIL because the module does not exist.

- [ ] **Step 3: Implement the twelve-skill module**

Use IDs in table order:

```ts
const flexibleInfrastructureSkillDefinitions = [
  ['flexible-infrastructure-skill-terraform', 'Terraform'],
  ['flexible-infrastructure-skill-aws', 'AWS'],
  ['flexible-infrastructure-skill-kubernetes', 'Kubernetes'],
  ['flexible-infrastructure-skill-kubectl', 'kubectl'],
  ['flexible-infrastructure-skill-helm', 'Helm'],
  ['flexible-infrastructure-skill-docker', 'Docker'],
  ['flexible-infrastructure-skill-amazon-ecr', 'Amazon ECR'],
  ['flexible-infrastructure-skill-aws-iam', 'AWS IAM'],
  ['flexible-infrastructure-skill-irsa', 'IRSA'],
  ['flexible-infrastructure-skill-kustomize', 'Kustomize'],
  ['flexible-infrastructure-skill-argo-cd', 'Argo CD'],
  ['flexible-infrastructure-skill-gitops', 'GitOps'],
] as const;
```

Attach the exact support lists and map to public `skill` records with `capabilityKeys: ['flexible-infrastructure']`, `technologies: [name]`, and `strength: 'supporting'`.

- [ ] **Step 4: Run the focused skill spec and verify green**

Run the Step 2 command.

Expected: PASS with twelve skills and valid support.

- [ ] **Step 5: Commit Flexible Infrastructure skills**

```bash
git add apps/github.io/src/app/devops-capability-evidence/flexible-infrastructure-skill-evidence.data.ts apps/github.io/src/app/devops-capability-evidence/flexible-infrastructure-skill-evidence.data.spec.ts
git commit -m "feat(github.io): add flexible infrastructure skills"
```

---

### Task 6: Compose Catalogs And Curate Both Scores

**Files:**

- Modify: `apps/github.io/src/app/devops-capability-evidence/devops-capability-evidence.data.ts:1-420`
- Modify: `apps/github.io/src/app/devops-capability-evidence/devops-capability-evidence.spec.ts:1-620`

**Interfaces:**

- Consumes: all four arrays produced by Tasks 2-5.
- Produces: globally resolvable evidence plus exact Deployment Automation and Flexible Infrastructure score records.

- [ ] **Step 1: Replace the generic integration expectations with failing exact projections**

Add imports for all four arrays in the data file. In the global spec, expect:

```ts
const deploymentAutomationExperienceIds = [
  'merge-triggered-deployment-path',
  'environment-neutral-deployment-mechanism',
  'generator-based-service-onboarding',
  'automated-sealed-secret-delivery',
  'deterministic-kubernetes-overlays',
] as const;

const flexibleInfrastructureExperienceIds = [
  'terraform-managed-cloud-foundations',
  'irsa-service-accounts',
  'terraform-scoped-iam',
  'terraform-codepipeline-platform',
  'argocd-environment-state-from-version-control',
] as const;
```

Assert both exact full score arrays, first-ID strongest evidence, `{ experience: 5, skill: 13 }`, `{ experience: 5, skill: 12 }`, unchanged `4/5` scores, and these summaries:

```ts
'Built merge-triggered deployment automation across environments, with generator-based onboarding, automated secret delivery, and deterministic Kubernetes rendering.';

'Built reusable Terraform and Kubernetes foundations with workload identity, scoped IAM, delivery-platform provisioning, and GitOps-managed environments.';
```

Extend the synthetic-unselected-record test to both new capability keys and extend the source scan so it rejects `slice(`, `.sort(`, ranking, and skill-array spreads inside both score blocks.

- [ ] **Step 2: Run the global spec and verify red**

```bash
NX_DAEMON=false pnpm exec vitest run apps/github.io/src/app/devops-capability-evidence/devops-capability-evidence.spec.ts
```

Expected: FAIL because the global catalog and score records are still generic.

- [ ] **Step 3: Compose arrays and remove migrated inline records**

Add all four module arrays to `devOpsCapabilityEvidenceItemCatalog`. Remove the inline definitions of `image-digest-deployments`, `irsa-service-accounts`, and `terraform-scoped-iam`; their stable IDs now come from capability-owned modules. Leave Kubernetes learning, certification, and the generic Kubernetes skill in the catalog for other consumers.

Write every target score ID literally. Do not spread or map the skill arrays in these two score records. Set exact strongest IDs, counts, and summaries from Step 1.

- [ ] **Step 4: Run catalog and global integration specs**

```bash
NX_DAEMON=false pnpm exec vitest run apps/github.io/src/app/devops-capability-evidence/deployment-automation-evidence.data.spec.ts apps/github.io/src/app/devops-capability-evidence/deployment-automation-skill-evidence.data.spec.ts apps/github.io/src/app/devops-capability-evidence/flexible-infrastructure-evidence.data.spec.ts apps/github.io/src/app/devops-capability-evidence/flexible-infrastructure-skill-evidence.data.spec.ts apps/github.io/src/app/devops-capability-evidence/devops-capability-evidence.spec.ts apps/github.io/src/app/devops-capability-evidence/dora-capability-card.evidence.spec.ts
```

Expected: PASS with no missing, duplicate, incompatible, or incorrectly counted evidence.

- [ ] **Step 5: Commit global composition and scores**

```bash
git add apps/github.io/src/app/devops-capability-evidence/devops-capability-evidence.data.ts apps/github.io/src/app/devops-capability-evidence/devops-capability-evidence.spec.ts
git commit -m "feat(github.io): curate deployment infrastructure cards"
```

---

### Task 7: Add Production Stories, Rendering Contracts, And Brand Treatment

**Files:**

- Modify: `apps/github.io/src/app/devops-capability-evidence/dora-capability-card.stories.tsx:1-140`
- Modify: `apps/github.io/src/app/devops-capability-evidence/dora-capability-card.stories.spec.ts:1-170`
- Modify: `apps/github.io/src/app/devops-capability-evidence/dora-capability-card.spec.tsx:90-230`
- Modify: `apps/github.io/src/app/skills/skill-brand.ts:1-130`
- Modify: `apps/github.io/src/app/skills/skill-brand.spec.ts:1-180`

**Interfaces:**

- Consumes: global catalog and exact scores from Task 6.
- Produces: `DeploymentAutomation` and existing `FlexibleInfrastructure` production stories with exact card semantics and truthful skill branding.

- [ ] **Step 1: Write failing story and component tests**

Import `DeploymentAutomation` and `FlexibleInfrastructure` into the story spec. Assert both inherit the production evidence and scores from `meta`, then add a table-driven exact projection check using these labels and the Task 3/5 title arrays:

```ts
[
  'deployment-automation',
  ['Merge-triggered deployments', 'Environment-neutral deploys', 'Generator-based onboarding', 'Automated secret delivery', 'Deterministic overlays'],
  ['AWS CodePipeline', 'Terraform', 'GitHub Actions', 'Argo CD', 'GitOps', 'Docker', 'Amazon ECR', 'Kubernetes', 'OpenID Connect', 'Nx', 'GitHub API', 'Kustomize', 'Sealed Secrets'],
],
[
  'flexible-infrastructure',
  ['Terraform cloud foundations', 'Shared IRSA modules', 'Terraform scoped IAM', 'Reusable Terraform CI pipelines', 'Version-controlled environment state'],
  ['Terraform', 'AWS', 'Kubernetes', 'kubectl', 'Helm', 'Docker', 'Amazon ECR', 'AWS IAM', 'IRSA', 'Kustomize', 'Argo CD', 'GitOps'],
],
```

In the component spec, render both capabilities with production data and assert the exact summary, five `Relevant experience` list items, thirteen or twelve `Technical skills` items, and exact accessible group names for every token.

- [ ] **Step 2: Write failing brand-contract tests**

Assert:

```ts
expect(getSkillBrand('GitHub API')?.iconPath).toBe(
  getSkillBrand('GitHub')?.iconPath,
);
expect(getSkillBrand('kubectl')?.iconPath).toBe(
  getSkillBrand('Kubernetes')?.iconPath,
);
for (const skill of ['AWS', 'AWS IAM', 'IRSA']) {
  expect(getSkillBrand(skill)).toMatchObject({ color: '#FF9900' });
}
for (const skill of ['GitOps', 'Sealed Secrets']) {
  expect(hasSkillBrandIcon(getSkillBrand(skill))).toBe(false);
}
```

This is the truthful policy: use documented family fallbacks for GitHub API and kubectl, AWS color metadata where no exact icon exists, and no unrelated logo for GitOps or Sealed Secrets.

- [ ] **Step 3: Run focused UI and brand specs and verify red**

```bash
NX_DAEMON=false pnpm exec vitest run apps/github.io/src/app/devops-capability-evidence/dora-capability-card.stories.spec.ts apps/github.io/src/app/devops-capability-evidence/dora-capability-card.spec.tsx apps/github.io/src/app/skills/skill-brand.spec.ts
```

Expected: FAIL because the new story, exact target rows, and brand aliases are absent.

- [ ] **Step 4: Implement the production story and brand mappings**

Add:

```ts
const deploymentAutomation = capability('deployment-automation');

export const DeploymentAutomation: Story = {
  args: {
    capability: deploymentAutomation,
    description: doraCapabilityDescriptions['deployment-automation'],
  },
};
```

Keep `FlexibleInfrastructure: Story = {}` as the default production-data story. In `skill-brand.ts`, add `'GitHub API': siGithub` and `kubectl: siKubernetes` to `skillIcons`; add `'AWS IAM': '#FF9900'` and `IRSA: '#FF9900'` to `skillBrandColors`. Do not add fabricated GitOps or Sealed Secrets icons.

- [ ] **Step 5: Run the focused UI and brand specs and verify green**

Run the Step 3 command.

Expected: PASS with exact summaries, row lengths, accessible names, and truthful brand treatment.

- [ ] **Step 6: Commit stories and rendering contracts**

```bash
git add apps/github.io/src/app/devops-capability-evidence/dora-capability-card.stories.tsx apps/github.io/src/app/devops-capability-evidence/dora-capability-card.stories.spec.ts apps/github.io/src/app/devops-capability-evidence/dora-capability-card.spec.tsx apps/github.io/src/app/skills/skill-brand.ts apps/github.io/src/app/skills/skill-brand.spec.ts
git commit -m "feat(github.io): add deployment infrastructure stories"
```

---

### Task 8: Full Verification, Browser QA, And Review Gate

**Files:**

- Verify only; modify task-owned files only when a failing check identifies a scoped defect.

**Interfaces:**

- Consumes: completed Tasks 1-7.
- Produces: verified branch state ready for the repository's manual handoff workflow.

- [ ] **Step 1: Run all automated gates from a clean process**

```bash
NX_DAEMON=false pnpm nx test github.io --skip-nx-cache
NX_DAEMON=false pnpm nx lint github.io --skip-nx-cache
NX_DAEMON=false pnpm nx build github.io --skip-nx-cache
NX_DAEMON=false pnpm nx build-storybook github.io --skip-nx-cache
```

Expected: all four commands exit `0`. Record any deprecation warnings separately from failures.

- [ ] **Step 2: Inspect the complete branch diff and commit boundaries**

```bash
git status --short --branch
git diff main...HEAD --stat
git log --format='%h %s' main..HEAD
```

Expected: clean worktree with logical, self-contained commit boundaries and no unrelated files. Reviewed fix commits are permitted when they preserve those boundaries.

- [ ] **Step 3: Run phone browser QA**

Start Storybook on loopback and inspect the Deployment Automation and Flexible Infrastructure stories at `390x844`. Verify summary hierarchy, row labels, exact token order, logo truthfulness, wrapping, card width, clipping, overlap, and horizontal overflow.

- [ ] **Step 4: Run the user iPad visual gate**

Resolve the current Tailscale IPv4 address at runtime, pass it through the existing Storybook allowed-host environment setting, and start Storybook on `0.0.0.0:6006`. Share the Tailscale-only URL in chat, keep the server alive while the user inspects both stories at `768x1024`, record approval or requested changes, and stop the server afterward. Never commit the address or URL.

- [ ] **Step 5: Run Codex `/review`**

Review `main...HEAD` against the approved spec and plan. Treat correctness, privacy, capability compatibility, exact projection ownership, accessibility, and regression coverage as blocking. Apply scoped findings with new focused tests and one conventional fix commit per concern, then rerun all affected checks.

- [ ] **Step 6: Stop at awaiting handoff**

Report commit hashes, automated verification evidence, browser results, user visual approval, and remaining warnings. Do not push, open a PR, merge, or deploy until the user explicitly invokes the repository's handoff/shipping workflow.
