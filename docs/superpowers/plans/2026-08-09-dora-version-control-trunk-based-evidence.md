# DORA Version Control And Trunk-Based Development Evidence Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add public-safe, evidence-backed Version Control and Trunk-Based Development experience catalogs, skill catalogs, compact-card projections, achievement summaries, and production Storybook review stories to the `github.io` app.

**Architecture:** Follow the Continuous Integration and Continuous Delivery static-data pattern: focused atomic catalog modules feed the global evidence catalog, while each score owns an explicit compact projection and supplemental summary. Reuse identical CI/CD records by reference, add structured capability-specific records for new facts, and validate privacy, chronology, referential integrity, presentation, and Storybook access with focused tests.

**Tech Stack:** TypeScript, React, Vitest, Testing Library, Storybook React/Vite, Nx, pnpm.

## Global Constraints

- Work only in `.worktrees/version-control-trunk-based-evidence` on `feat/version-control-trunk-based-evidence`.
- Treat the private capability repository as research input only; never add its repository name, paths, source files, URLs, copied prose, or raw artifacts to the public repository.
- Publish only affirmative, independently supportable achievements for new and selected shared records; exclude negative findings, limitations, and adverse metrics.
- Generalize repository, project, service, workflow, module, image, organization, customer, business-domain, account, and proprietary architecture names.
- Preserve public technology and practice names when safe, including Git, GitHub, AWS CodePipeline, Terraform, Docker, Helm, Kubernetes, Nx, GitHub Actions, Conventional Commits, Husky, Kustomize, Argo CD, and commitlint.
- Do not render evidence or measurement dates on compact cards.
- Keep Version Control and Trunk-Based Development scores at `4/5`; score rendering and recalibration are out of scope.
- Each score must literally enumerate five curated experience IDs followed by the complete ordered skill catalog; do not use `slice()`, ranking, runtime date sorting, or catalog order to select compact experiences.
- Keep row labels exactly `Relevant experience` and `Technical skills`, and preserve current card dimensions, grouping, responsive behavior, accessibility semantics, and visual hierarchy.
- Render skills with the neutral `SkillToken` variant; recognized technologies retain truthful brand-colored logos, while Conventional Commits uses the truthful text fallback.
- Do not commit a Tailscale IP address, MagicDNS name, tailnet name, or any other private network identifier.
- Stage explicit paths only and use Conventional Commit subjects for every self-contained commit.
- Do not push, merge, deploy, or open a pull request.

---

### Task 1: Make Selected Shared Evidence Positive And Capability-Correct

**Files:**
- Modify: `apps/github.io/src/app/devops-capability-evidence/continuous-integration-evidence.data.ts`
- Modify: `apps/github.io/src/app/devops-capability-evidence/continuous-integration-evidence.data.spec.ts`
- Modify: `apps/github.io/src/app/devops-capability-evidence/continuous-delivery-evidence.data.ts`
- Modify: `apps/github.io/src/app/devops-capability-evidence/continuous-delivery-evidence.data.spec.ts`

**Interfaces:**
- Consumes: existing `continuousIntegrationEvidenceItems: readonly CapabilityEvidenceItem[]` and `continuousDeliveryEvidenceItems: readonly CapabilityEvidenceItem[]`.
- Produces: shared records with stable IDs and added `'version-control'` mappings for later catalog composition; selected Continuous Delivery records expose affirmative facts and metrics only.

- [ ] **Step 1: Write failing shared-record tests**

Add exact assertions that the following shared experiences include Version Control without changing their IDs:

```ts
expect(capabilityKeysById('codepipeline-webhook-trunk')).toContain('version-control');
expect(capabilityKeysById('terraform-codepipeline-platform')).toContain('version-control');
expect(capabilityKeysById('reusable-helm-deployment-image')).toContain('version-control');
expect(capabilityKeysById('github-actions-gitops-handoff')).toContain('version-control');
expect(capabilityKeysById('argocd-environment-state-from-version-control')).toContain('version-control');
expect(capabilityKeysById('gitops-same-package-environments')).toContain('version-control');
expect(capabilityKeysById('argocd-automated-database-migrations')).toContain('version-control');
```

In the Continuous Delivery spec, assert that `argocd-environment-state-from-version-control` and `argocd-automated-database-migrations` contain no negative limitation text or adverse metrics. Match generalized classes rather than private phrases:

```ts
const selected = [
  itemById('argocd-environment-state-from-version-control'),
  itemById('argocd-automated-database-migrations'),
];
const publicText = JSON.stringify(selected).toLowerCase();

expect(publicText).not.toMatch(/\b(not|no|without|limitation|drift beyond|partial|missing|failed|failure)\b/);
for (const item of selected) {
  expect(item.details?.metrics.every(({ value }) => value >= 0)).toBe(true);
}
```

- [ ] **Step 2: Run focused tests and verify they fail**

Run:

```bash
NX_DAEMON=false ./node_modules/.bin/nx test github.io --skip-nx-cache --testFile=continuous-integration-evidence.data.spec.ts
NX_DAEMON=false ./node_modules/.bin/nx test github.io --skip-nx-cache --testFile=continuous-delivery-evidence.data.spec.ts
```

Expected: FAIL because the Version Control mappings are missing and the selected delivery records still contain limitation/partial-coverage content.

- [ ] **Step 3: Update the shared records minimally**

Add `'version-control'` to the exact seven records above. Remove the negative reconciliation limitation fact from `argocd-environment-state-from-version-control`. For `argocd-automated-database-migrations`, retain its stable ID, technologies, affirmative automated-migration fact, and independently positive metric only; remove partial-coverage wording, adverse numerator/denominator framing, or any fact that depends on omitted negative context.

- [ ] **Step 4: Run focused tests and verify they pass**

Run the two Task 1 commands again.

Expected: PASS, with existing CI/CD catalog-order and privacy assertions still green.

- [ ] **Step 5: Commit the shared-record preparation**

```bash
git diff -- apps/github.io/src/app/devops-capability-evidence/continuous-integration-evidence.data.ts apps/github.io/src/app/devops-capability-evidence/continuous-integration-evidence.data.spec.ts apps/github.io/src/app/devops-capability-evidence/continuous-delivery-evidence.data.ts apps/github.io/src/app/devops-capability-evidence/continuous-delivery-evidence.data.spec.ts
git add apps/github.io/src/app/devops-capability-evidence/continuous-integration-evidence.data.ts apps/github.io/src/app/devops-capability-evidence/continuous-integration-evidence.data.spec.ts apps/github.io/src/app/devops-capability-evidence/continuous-delivery-evidence.data.ts apps/github.io/src/app/devops-capability-evidence/continuous-delivery-evidence.data.spec.ts
git diff --cached
git commit -m "feat(github.io): prepare shared version control evidence"
```

### Task 2: Add The Complete Version Control Catalog And Skills

**Files:**
- Modify: `apps/github.io/src/app/devops-capability-evidence/devops-capability-evidence.types.ts`
- Modify: `apps/github.io/src/app/devops-capability-evidence/capability-evidence-initiatives.ts`
- Create: `apps/github.io/src/app/devops-capability-evidence/version-control-evidence.data.ts`
- Create: `apps/github.io/src/app/devops-capability-evidence/version-control-evidence.data.spec.ts`
- Create: `apps/github.io/src/app/devops-capability-evidence/version-control-skill-evidence.data.ts`
- Create: `apps/github.io/src/app/devops-capability-evidence/version-control-skill-evidence.data.spec.ts`

**Interfaces:**
- Consumes: shared CI/CD records from Task 1 and `CapabilityEvidenceItem`.
- Produces: `versionControlEvidenceItems: readonly CapabilityEvidenceItem[]` with exactly nine experiences; `versionControlSkillEvidenceItems: readonly CapabilityEvidenceItem[]` with exactly thirteen skills; `capabilityEvidenceInitiatives.deliveryRepositoryPractices` with ID `'delivery-repository-practices'`.

- [ ] **Step 1: Write failing Version Control catalog tests**

Create tests asserting this exact experience order:

```ts
expect(versionControlEvidenceItems.map(({ id }) => id)).toEqual([
  'codepipeline-webhook-trunk',
  'terraform-codepipeline-platform',
  'reusable-helm-deployment-image',
  'github-actions-gitops-handoff',
  'argocd-environment-state-from-version-control',
  'gitops-same-package-environments',
  'argocd-automated-database-migrations',
  'merge-commit-history',
  'conventional-commit-governance',
]);
```

Assert every experience is public, non-sensitive, type `experience`, mapped to `version-control`, has details with an ISO start date, positive facts, valid metrics, public technologies, no `organization`/`proofUrl`, and no forbidden private or negative pattern. Assert labels contain at most four whitespace-separated words for the two new records and the upgraded merge record.

Assert `merge-commit-history` has a `575` count metric with denominator `575`, and `conventional-commit-governance` has `91.4` and `99` percent metrics with denominators `1021` and `1367`.

- [ ] **Step 2: Write failing Version Control skill tests**

Assert this exact order and support map:

```ts
expect(versionControlSkillEvidenceItems.map(({ title }) => title)).toEqual([
  'Git', 'GitHub', 'AWS CodePipeline', 'Terraform', 'Docker', 'Helm',
  'Conventional Commits', 'Husky', 'Nx', 'GitHub Actions', 'Kustomize',
  'Argo CD', 'Kubernetes',
]);

expect(Object.fromEntries(versionControlSkillEvidenceItems.map(
  ({ title, supportingEvidenceIds }) => [title, supportingEvidenceIds],
))).toEqual({
  Git: ['codepipeline-webhook-trunk', 'merge-commit-history', 'conventional-commit-governance'],
  GitHub: ['codepipeline-webhook-trunk', 'github-actions-gitops-handoff', 'merge-commit-history'],
  'AWS CodePipeline': ['codepipeline-webhook-trunk', 'terraform-codepipeline-platform'],
  Terraform: ['terraform-codepipeline-platform'],
  Docker: ['reusable-helm-deployment-image', 'gitops-same-package-environments'],
  Helm: ['reusable-helm-deployment-image'],
  'Conventional Commits': ['conventional-commit-governance'],
  Husky: ['conventional-commit-governance'],
  Nx: ['github-actions-gitops-handoff'],
  'GitHub Actions': ['github-actions-gitops-handoff'],
  Kustomize: ['github-actions-gitops-handoff', 'argocd-environment-state-from-version-control', 'gitops-same-package-environments'],
  'Argo CD': ['github-actions-gitops-handoff', 'argocd-environment-state-from-version-control', 'argocd-automated-database-migrations'],
  Kubernetes: ['argocd-environment-state-from-version-control', 'argocd-automated-database-migrations'],
});
```

Derive each skill's earliest supporting `details.period.startedAt`, then assert nondecreasing chronology; for equal dates compare the approved array position. Assert all supporting IDs resolve to capability-compatible Version Control experiences and `commitlint` is absent as a skill title.

- [ ] **Step 3: Run focused tests and verify they fail**

```bash
NX_DAEMON=false ./node_modules/.bin/nx test github.io --skip-nx-cache --testFile=version-control-evidence.data.spec.ts
NX_DAEMON=false ./node_modules/.bin/nx test github.io --skip-nx-cache --testFile=version-control-skill-evidence.data.spec.ts
```

Expected: FAIL because the new modules and exports do not exist.

- [ ] **Step 4: Add the structured Version Control experience catalog**

Extend `CapabilityEvidenceInitiativeId` with `'delivery-repository-practices'` and add:

```ts
deliveryRepositoryPractices: {
  id: 'delivery-repository-practices',
  label: 'Delivery repository practices',
},
```

Build `versionControlEvidenceItems` by resolving the exact first seven IDs from the combined CI/CD experience arrays and failing immediately if any shared ID is absent. Append these exact public-safe records:

```ts
{
  id: 'merge-commit-history',
  title: 'Merge-preserved integration history',
  label: 'Merge-preserved history',
  type: 'experience',
  capabilityKeys: ['trunk-based-development', 'version-control'],
  summary: 'Preserved traceable pull-request integration history with merge commits across measured delivery repositories.',
  details: {
    initiative: capabilityEvidenceInitiatives.deliveryRepositoryPractices,
    period: { startedAt: '2024-02-28' },
    metrics: [{ label: 'Resolvable integrations preserving merge history', value: 575, unit: 'count', denominator: 575, measuredAt: '2026-08-09' }],
    facts: ['All 575 resolvable measured pull-request integrations preserved two-parent merge history.'],
  },
  technologies: ['Git', 'GitHub'],
  isPublic: true,
  strength: 'strong',
},
{
  id: 'conventional-commit-governance',
  title: 'Conventional commit governance',
  label: 'Conventional commit governance',
  type: 'experience',
  capabilityKeys: ['trunk-based-development', 'version-control'],
  summary: 'Applied Conventional Commits with commit-time automation and measured strong authored-commit conformance across delivery repositories.',
  details: {
    initiative: capabilityEvidenceInitiatives.deliveryRepositoryPractices,
    period: { startedAt: '2024-02-28' },
    metrics: [
      { label: 'Authored commit conformance in one repository', value: 91.4, unit: 'percent', denominator: 1021, measuredAt: '2026-08-09' },
      { label: 'Authored commit conformance in another repository', value: 99, unit: 'percent', denominator: 1367, measuredAt: '2026-08-09' },
    ],
    facts: ['Applied Conventional Commits through commitlint and Husky-supported commit-time governance.'],
  },
  technologies: ['Git', 'Conventional Commits', 'commitlint', 'Husky'],
  isPublic: true,
  strength: 'strong',
},
```

- [ ] **Step 5: Add the ordered Version Control skill catalog**

Define thirteen literal skill definitions using the IDs `version-control-skill-git`, `version-control-skill-github`, `version-control-skill-codepipeline`, `version-control-skill-terraform`, `version-control-skill-docker`, `version-control-skill-helm`, `version-control-skill-conventional-commits`, `version-control-skill-husky`, `version-control-skill-nx`, `version-control-skill-github-actions`, `version-control-skill-kustomize`, `version-control-skill-argo-cd`, and `version-control-skill-kubernetes`. Map each definition to a public `type: 'skill'` item with `capabilityKeys: ['version-control']`, `technologies: [name]`, `strength: 'strong'`, and the exact support relationships from Step 2.

- [ ] **Step 6: Run focused tests and verify they pass**

Run the two Task 2 commands again.

Expected: PASS, including chronology, privacy, metric, and referential-integrity assertions.

- [ ] **Step 7: Commit the Version Control catalogs**

```bash
git add apps/github.io/src/app/devops-capability-evidence/devops-capability-evidence.types.ts apps/github.io/src/app/devops-capability-evidence/capability-evidence-initiatives.ts apps/github.io/src/app/devops-capability-evidence/version-control-evidence.data.ts apps/github.io/src/app/devops-capability-evidence/version-control-evidence.data.spec.ts apps/github.io/src/app/devops-capability-evidence/version-control-skill-evidence.data.ts apps/github.io/src/app/devops-capability-evidence/version-control-skill-evidence.data.spec.ts
git diff --cached
git commit -m "feat(github.io): add version control evidence catalog"
```

### Task 3: Add The Complete Trunk-Based Development Catalog And Skills

**Files:**
- Create: `apps/github.io/src/app/devops-capability-evidence/trunk-based-development-evidence.data.ts`
- Create: `apps/github.io/src/app/devops-capability-evidence/trunk-based-development-evidence.data.spec.ts`
- Create: `apps/github.io/src/app/devops-capability-evidence/trunk-based-development-skill-evidence.data.ts`
- Create: `apps/github.io/src/app/devops-capability-evidence/trunk-based-development-skill-evidence.data.spec.ts`

**Interfaces:**
- Consumes: `versionControlEvidenceItems`, `continuousIntegrationEvidenceItems`, and `CapabilityEvidenceItem`.
- Produces: `trunkBasedDevelopmentEvidenceItems: readonly CapabilityEvidenceItem[]` with exactly six experiences and `trunkBasedDevelopmentSkillEvidenceItems: readonly CapabilityEvidenceItem[]` with exactly six skills.

- [ ] **Step 1: Write failing Trunk-Based Development catalog tests**

Assert this exact experience order:

```ts
expect(trunkBasedDevelopmentEvidenceItems.map(({ id }) => id)).toEqual([
  'single-trunk-repository-flow',
  'short-lived-branch-flow',
  'small-change-landings',
  'merge-commit-history',
  'nx-affected-quality-gates',
  'conventional-commit-governance',
]);
```

Assert the same public, structured, positive-only, ISO-date, metrics, label-length, and privacy contracts as Task 2. Assert the single-trunk record reports two repositories, the branch record reports `972` and `6006` seconds plus `85` and `71.2` percent, and the small-batch record reports medians `3/60/2` and `4/146/2` using count units and generalized labels.

- [ ] **Step 2: Write failing Trunk-Based Development skill tests**

```ts
expect(trunkBasedDevelopmentSkillEvidenceItems.map(({ title }) => title)).toEqual([
  'Git', 'GitHub', 'Nx', 'GitHub Actions', 'Conventional Commits', 'Husky',
]);

expect(Object.fromEntries(trunkBasedDevelopmentSkillEvidenceItems.map(
  ({ title, supportingEvidenceIds }) => [title, supportingEvidenceIds],
))).toEqual({
  Git: ['single-trunk-repository-flow', 'short-lived-branch-flow', 'small-change-landings', 'merge-commit-history', 'conventional-commit-governance'],
  GitHub: ['single-trunk-repository-flow', 'short-lived-branch-flow', 'merge-commit-history', 'nx-affected-quality-gates'],
  Nx: ['nx-affected-quality-gates'],
  'GitHub Actions': ['nx-affected-quality-gates'],
  'Conventional Commits': ['conventional-commit-governance'],
  Husky: ['conventional-commit-governance'],
});
```

Derive chronology from supporting experience start dates, assert all support IDs resolve and are capability-compatible, and assert `commitlint` is not a skill title.

- [ ] **Step 3: Run focused tests and verify they fail**

```bash
NX_DAEMON=false ./node_modules/.bin/nx test github.io --skip-nx-cache --testFile=trunk-based-development-evidence.data.spec.ts
NX_DAEMON=false ./node_modules/.bin/nx test github.io --skip-nx-cache --testFile=trunk-based-development-skill-evidence.data.spec.ts
```

Expected: FAIL because the modules do not exist.

- [ ] **Step 4: Add the structured Trunk-Based Development experiences**

Resolve `merge-commit-history` and `conventional-commit-governance` from Version Control and `nx-affected-quality-gates` from Continuous Integration. Add:

```ts
{
  id: 'single-trunk-repository-flow',
  title: 'Single-trunk repository delivery',
  label: 'Single trunk repositories',
  type: 'experience',
  capabilityKeys: ['trunk-based-development'],
  summary: 'Maintained one primary integration branch across two delivery repositories to provide a consistent mainline for change integration.',
  details: {
    initiative: capabilityEvidenceInitiatives.deliveryRepositoryPractices,
    period: { startedAt: '2024-02-28' },
    metrics: [{ label: 'Delivery repositories using one primary integration branch', value: 2, unit: 'count', measuredAt: '2026-08-09' }],
    facts: ['Maintained a single primary integration branch across two delivery repositories.'],
  },
  technologies: ['Git', 'GitHub'], isPublic: true, strength: 'primary',
},
{
  id: 'short-lived-branch-flow',
  title: 'Measured short-lived branch integration',
  label: 'Short-lived branch flow',
  type: 'experience',
  capabilityKeys: ['trunk-based-development'],
  summary: 'Integrated short-lived branches into the mainline quickly, with most measured integrations completing within one day in both delivery repositories.',
  details: {
    initiative: capabilityEvidenceInitiatives.deliveryRepositoryPractices,
    period: { startedAt: '2024-02-28' },
    metrics: [
      { label: 'Median integration time in one repository', value: 972, unit: 'seconds', measuredAt: '2026-08-09' },
      { label: 'Integrations within one day in one repository', value: 85, unit: 'percent', denominator: 214, measuredAt: '2026-08-09' },
      { label: 'Median integration time in another repository', value: 6006, unit: 'seconds', measuredAt: '2026-08-09' },
      { label: 'Integrations within one day in another repository', value: 71.2, unit: 'percent', denominator: 378, measuredAt: '2026-08-09' },
    ],
    facts: ['Most measured integrations completed within one day in both delivery repositories.'],
  },
  technologies: ['Git', 'GitHub'], isPublic: true, strength: 'strong',
},
{
  id: 'small-change-landings',
  title: 'Small change batch integration',
  label: 'Small change landings',
  type: 'experience',
  capabilityKeys: ['trunk-based-development'],
  summary: 'Integrated independently reviewable change batches with compact median file, line, and commit sizes across measured delivery repositories.',
  details: {
    initiative: capabilityEvidenceInitiatives.deliveryRepositoryPractices,
    period: { startedAt: '2024-02-28' },
    metrics: [
      { label: 'Median files per landing in one repository', value: 3, unit: 'count', denominator: 211, measuredAt: '2026-08-09' },
      { label: 'Median lines per landing in one repository', value: 60, unit: 'count', denominator: 211, measuredAt: '2026-08-09' },
      { label: 'Median commits per landing in one repository', value: 2, unit: 'count', denominator: 211, measuredAt: '2026-08-09' },
      { label: 'Median files per landing in another repository', value: 4, unit: 'count', denominator: 304, measuredAt: '2026-08-09' },
      { label: 'Median lines per landing in another repository', value: 146, unit: 'count', denominator: 304, measuredAt: '2026-08-09' },
      { label: 'Median commits per landing in another repository', value: 2, unit: 'count', denominator: 304, measuredAt: '2026-08-09' },
    ],
    facts: ['Measured change landings remained compact at medians of three to four files and two commits.'],
  },
  technologies: ['Git'], isPublic: true, strength: 'strong',
},
```

When composing shared records for this catalog, add `'trunk-based-development'` to `nx-affected-quality-gates` in its owning CI module if absent; keep the shared Version Control records' mappings unchanged.

- [ ] **Step 5: Add the ordered Trunk-Based Development skills**

Define skill IDs `trunk-based-development-skill-git`, `trunk-based-development-skill-github`, `trunk-based-development-skill-nx`, `trunk-based-development-skill-github-actions`, `trunk-based-development-skill-conventional-commits`, and `trunk-based-development-skill-husky`. Map them to public strong skill items with `capabilityKeys: ['trunk-based-development']`, one matching technology, and the exact support map from Step 2.

- [ ] **Step 6: Run focused tests and verify they pass**

Run both Task 3 commands and rerun the CI evidence data spec if `nx-affected-quality-gates` changed.

Expected: PASS.

- [ ] **Step 7: Commit the Trunk-Based Development catalogs**

```bash
git add apps/github.io/src/app/devops-capability-evidence/trunk-based-development-evidence.data.ts apps/github.io/src/app/devops-capability-evidence/trunk-based-development-evidence.data.spec.ts apps/github.io/src/app/devops-capability-evidence/trunk-based-development-skill-evidence.data.ts apps/github.io/src/app/devops-capability-evidence/trunk-based-development-skill-evidence.data.spec.ts apps/github.io/src/app/devops-capability-evidence/continuous-integration-evidence.data.ts apps/github.io/src/app/devops-capability-evidence/continuous-integration-evidence.data.spec.ts
git diff --cached
git commit -m "feat(github.io): add trunk-based evidence catalog"
```

### Task 4: Integrate Explicit Projections, Skills, And Summaries

**Files:**
- Modify: `apps/github.io/src/app/devops-capability-evidence/devops-capability-evidence.data.ts`
- Modify: `apps/github.io/src/app/devops-capability-evidence/devops-capability-evidence.spec.ts`

**Interfaces:**
- Consumes: four catalog exports from Tasks 2 and 3.
- Produces: globally resolvable evidence records and score-owned Version Control and Trunk-Based Development projections/summaries.

- [ ] **Step 1: Write failing global catalog and score tests**

Assert exact Version Control score fields:

```ts
expect(versionControlScore).toMatchObject({
  score: 4,
  maxScore: 5,
  strongestEvidenceId: 'terraform-codepipeline-platform',
  evidenceCounts: { experience: 5, skill: 13 },
  evidenceSummary: 'Built and maintained version-controlled delivery platforms spanning reusable Terraform pipelines and GitOps-managed Kubernetes environments, with traceable infrastructure, configuration, automation, and database changes.',
});
expect(versionControlScore.evidenceIds).toEqual([
  'terraform-codepipeline-platform',
  'github-actions-gitops-handoff',
  'argocd-environment-state-from-version-control',
  'argocd-automated-database-migrations',
  'merge-commit-history',
  ...versionControlSkillEvidenceItems.map(({ id }) => id),
]);
```

Assert exact Trunk-Based Development score fields:

```ts
expect(trunkBasedScore).toMatchObject({
  score: 4,
  maxScore: 5,
  strongestEvidenceId: 'single-trunk-repository-flow',
  evidenceCounts: { experience: 5, skill: 6 },
  evidenceSummary: 'Created and maintained single-trunk delivery repositories, integrating short-lived branches and small change batches with merge-preserved history and affected quality gates.',
});
expect(trunkBasedScore.evidenceIds).toEqual([
  'single-trunk-repository-flow',
  'short-lived-branch-flow',
  'small-change-landings',
  'nx-affected-quality-gates',
  'merge-commit-history',
  ...trunkBasedDevelopmentSkillEvidenceItems.map(({ id }) => id),
]);
```

Assert all global IDs are unique; all projection and support IDs resolve and are capability-compatible; exact type counts match resolved records; strongest ID equals the first compact ID; `protected-review-gates` is absent; and no generic duplicate of `short-lived-branch-flow` or `merge-commit-history` remains.

Add a projection-stability test by appending a synthetic unselected catalog record in test memory and proving both score ID arrays are unchanged. Inspect the score definitions' source text and reject `.slice(`, `.sort(`, strength ranking, or catalog spreading in either projection.

- [ ] **Step 2: Run focused global tests and verify they fail**

```bash
NX_DAEMON=false ./node_modules/.bin/nx test github.io --skip-nx-cache --testFile=devops-capability-evidence.spec.ts
```

Expected: FAIL because the global catalog and scores still use generic evidence.

- [ ] **Step 3: Compose the new catalogs and replace generic records**

Import all four new exports. Add Version Control and Trunk-Based Development experiences and skills to the global catalog exactly once. Remove the old inline `protected-review-gates`, `short-lived-branch-flow`, and `merge-commit-history` objects; the structured catalog versions become canonical. Avoid duplicating reused CI/CD experience objects in the global array by adding only capability-specific new experiences there, or by deduplicating at explicit composition time without changing record order.

Replace the two score entries with the literal arrays and exact summaries from Step 1. Do not derive these arrays with catalog transforms.

- [ ] **Step 4: Run focused and complete data tests**

```bash
NX_DAEMON=false ./node_modules/.bin/nx test github.io --skip-nx-cache --testFile=devops-capability-evidence.spec.ts
NX_DAEMON=false ./node_modules/.bin/nx test github.io --skip-nx-cache --testFile=version-control-evidence.data.spec.ts
NX_DAEMON=false ./node_modules/.bin/nx test github.io --skip-nx-cache --testFile=version-control-skill-evidence.data.spec.ts
NX_DAEMON=false ./node_modules/.bin/nx test github.io --skip-nx-cache --testFile=trunk-based-development-evidence.data.spec.ts
NX_DAEMON=false ./node_modules/.bin/nx test github.io --skip-nx-cache --testFile=trunk-based-development-skill-evidence.data.spec.ts
```

Expected: PASS.

- [ ] **Step 5: Commit global integration**

```bash
git add apps/github.io/src/app/devops-capability-evidence/devops-capability-evidence.data.ts apps/github.io/src/app/devops-capability-evidence/devops-capability-evidence.spec.ts
git diff --cached
git commit -m "feat(github.io): curate versioning capability cards"
```

### Task 5: Add Production Storybook Stories And Runtime Tailscale Host Configuration

**Files:**
- Modify: `apps/github.io/src/app/devops-capability-evidence/dora-capability-card.stories.tsx`
- Modify: `apps/github.io/src/app/devops-capability-evidence/dora-capability-card.stories.spec.ts`
- Modify: `apps/github.io/src/app/devops-capability-evidence/dora-capability-card.spec.tsx`
- Modify: `apps/github.io/.storybook/main.ts`
- Create: `apps/github.io/.storybook/main.spec.ts`

**Interfaces:**
- Consumes: production `devOpsCapabilityEvidenceItems`, `curatedDevOpsCapabilityRadarScores`, `doraCapabilityDescriptions`, and `DoraCapabilityCard`.
- Produces: `VersionControl` and `TrunkBasedDevelopment` Storybook exports; Storybook `allowedHosts` derived from `STORYBOOK_ALLOWED_HOST` plus `localhost`.

- [ ] **Step 1: Write failing production-story tests**

Import the two new story exports and assert they inherit shared production evidence and scores from meta rather than defining fixtures:

```ts
expect(VersionControl.args?.evidence).toBeUndefined();
expect(VersionControl.args?.scores).toBeUndefined();
expect(TrunkBasedDevelopment.args?.evidence).toBeUndefined();
expect(TrunkBasedDevelopment.args?.scores).toBeUndefined();
```

Resolve each score and assert the first five labels and remaining skill titles exactly match Tasks 2–4. Render both cards and assert the exact summaries, five experience tokens before every skill token, and accessible list names:

```ts
expect(screen.getByRole('list', { name: 'Relevant experience' })).toBeVisible();
expect(screen.getByRole('list', { name: 'Technical skills' })).toBeVisible();
```

Assert evidence date strings such as `2024-02-28` and `2026-08-09` are absent. Assert skill tokens use the neutral surface, known brands retain their accurate icon treatment, and the `Conventional Commits` token renders text without an invented logo.

- [ ] **Step 2: Write failing Storybook host-config tests**

Extract or export a small pure helper from `main.ts`:

```ts
export function getStorybookAllowedHosts(host = process.env.STORYBOOK_ALLOWED_HOST): string[] {
  return host ? ['localhost', host] : ['localhost'];
}
```

Test `getStorybookAllowedHosts(undefined)` equals `['localhost']`, a runtime address is appended, blank input is ignored, duplicates are removed, and the module source contains no IPv4 literal, `.ts.net`, or tailnet identifier.

- [ ] **Step 3: Run Storybook/component tests and verify they fail**

```bash
NX_DAEMON=false ./node_modules/.bin/nx test github.io --skip-nx-cache --testFile=dora-capability-card.stories.spec.ts
NX_DAEMON=false ./node_modules/.bin/nx test github.io --skip-nx-cache --testFile=dora-capability-card.spec.tsx
NX_DAEMON=false ./node_modules/.bin/nx test github.io --skip-nx-cache --testFile=main.spec.ts
```

Expected: FAIL because the stories and host helper are absent and a hard-coded non-local host remains.

- [ ] **Step 4: Add production-backed stories**

Resolve definitions for `'version-control'` and `'trunk-based-development'` with the existing `capability()` helper and add:

```ts
export const VersionControl: Story = {
  args: {
    capability: versionControl,
    description: doraCapabilityDescriptions['version-control'],
  },
};

export const TrunkBasedDevelopment: Story = {
  args: {
    capability: trunkBasedDevelopment,
    description: doraCapabilityDescriptions['trunk-based-development'],
  },
};
```

Do not add custom evidence, scores, layout, dimensions, or fixtures to either story.

- [ ] **Step 5: Replace the hard-coded Storybook host**

Implement the pure helper with trimming and deduplication:

```ts
export function getStorybookAllowedHosts(host = process.env.STORYBOOK_ALLOWED_HOST): string[] {
  const requestedHost = host?.trim();
  return Array.from(new Set(['localhost', ...(requestedHost ? [requestedHost] : [])]));
}
```

Set `viteFinal.server.allowedHosts` to `getStorybookAllowedHosts()` and remove the existing hard-coded address. Do not log or persist the environment value.

- [ ] **Step 6: Run Storybook/component tests and verify they pass**

Run the three Task 5 commands again.

Expected: PASS.

- [ ] **Step 7: Commit the Storybook review surface**

```bash
git add apps/github.io/src/app/devops-capability-evidence/dora-capability-card.stories.tsx apps/github.io/src/app/devops-capability-evidence/dora-capability-card.stories.spec.ts apps/github.io/src/app/devops-capability-evidence/dora-capability-card.spec.tsx apps/github.io/.storybook/main.ts apps/github.io/.storybook/main.spec.ts
git diff --cached
git commit -m "feat(github.io): add versioning capability stories"
```

### Task 6: Validate The Complete App And Prepare The Live Visual Gate

**Files:**
- Modify only if validation reveals a feature-scoped defect: files already listed in Tasks 1–5.

**Interfaces:**
- Consumes: completed implementation and Nx inferred targets.
- Produces: passing focused/full validation and a runtime-only Storybook session for phone/iPad review; no repository artifact stores private network data.

- [ ] **Step 1: Run all focused evidence and component tests together**

```bash
NX_DAEMON=false ./node_modules/.bin/nx test github.io --skip-nx-cache --testFile=continuous-integration-evidence.data.spec.ts --testFile=continuous-delivery-evidence.data.spec.ts --testFile=version-control-evidence.data.spec.ts --testFile=version-control-skill-evidence.data.spec.ts --testFile=trunk-based-development-evidence.data.spec.ts --testFile=trunk-based-development-skill-evidence.data.spec.ts --testFile=devops-capability-evidence.spec.ts --testFile=dora-capability-card.spec.tsx --testFile=dora-capability-card.stories.spec.ts --testFile=main.spec.ts
```

Expected: PASS.

- [ ] **Step 2: Run the complete required validation matrix**

Prefer the repository's pnpm commands; if pnpm's local metadata database prevents execution, use the already-linked local Nx binary with the same target and flags and record that substitution:

```bash
NX_DAEMON=false pnpm nx test github.io --skip-nx-cache
NX_DAEMON=false pnpm nx lint github.io --skip-nx-cache
NX_DAEMON=false pnpm nx build github.io --skip-nx-cache
NX_DAEMON=false pnpm nx build-storybook github.io --skip-nx-cache
```

Fallback equivalents:

```bash
NX_DAEMON=false ./node_modules/.bin/nx test github.io --skip-nx-cache
NX_DAEMON=false ./node_modules/.bin/nx lint github.io --skip-nx-cache
NX_DAEMON=false ./node_modules/.bin/nx build github.io --skip-nx-cache
NX_DAEMON=false ./node_modules/.bin/nx build-storybook github.io --skip-nx-cache
```

Expected: all four targets exit `0`.

- [ ] **Step 3: Inspect the final feature diff and repository privacy boundary**

```bash
git status --short --branch
git diff HEAD~5 --check
git diff HEAD~5 -- apps/github.io docs/superpowers
git grep -nE '([0-9]{1,3}\.){3}[0-9]{1,3}|\.ts\.net|tailnet|proofUrl|isSensitive|Current company' -- apps/github.io/.storybook apps/github.io/src/app/devops-capability-evidence
```

Expected: no whitespace errors; no private-network identifier; new/selected records contain neither `organization`, `proofUrl`, sensitive flags, nor negative evidence; only intended public-safe files changed.

- [ ] **Step 4: Fix only feature-scoped validation defects using TDD and commit separately**

For any failure, first add or tighten the smallest focused regression assertion, reproduce the failure, patch only the implicated Task 1–5 file, rerun its focused test, then rerun the complete failed target. Stage only the changed files and use:

```bash
git commit -m "fix(github.io): correct versioning capability evidence"
```

If all validation passes without changes, create no extra commit.

- [ ] **Step 5: Start the runtime-only Tailscale Storybook session**

Resolve the current workstation Tailscale IPv4 address at runtime without writing it to the repository. Start Storybook bound to all interfaces with that address supplied only through the environment:

```bash
STORYBOOK_ALLOWED_HOST="$(tailscale ip -4)" NX_DAEMON=false ./node_modules/.bin/nx storybook github.io --skip-nx-cache --host 0.0.0.0 --port 6006
```

Expected: Storybook remains available on port `6006` at the IPv4 address returned by `tailscale ip -4` to devices on the same tailnet. Share the resolved URL only in the live conversation.

- [ ] **Step 6: Perform responsive Storybook QA and wait for user approval**

Inspect the production-backed Version Control and Trunk-Based Development stories at `390x844` and `768x1024`. Verify exact summary hierarchy, `Relevant experience` and `Technical skills` labels, token order, truthful brand marks, text fallback for Conventional Commits, wrapping, card width, clipping, overlap, and absence of horizontal overflow. Keep Storybook running while the user checks the iPad view over Tailscale. Stop here for explicit visual approval; do not invoke final code review or compounding before approval.

After approval, stop Storybook. Then invoke `superpowers:requesting-code-review` and `compound-engineering:ce-compound` as separate workflow steps, commit any approved durable solution document, rerun affected validation, and return an awaiting-handoff summary without pushing, merging, or deploying.
