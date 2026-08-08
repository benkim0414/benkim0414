# Continuous Integration Skill Chronology Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the full Continuous Integration skill catalog and compact DORA card tell the approved oldest-to-newest experience story.

**Architecture:** Keep chronology as an explicit curated order in `continuousIntegrationSkillDefinitions`. The Continuous Integration score retains its five explicit experience IDs, then consumes the canonical skill IDs from `continuousIntegrationSkillEvidenceItems`, so future catalog reordering cannot drift from card ordering; tests independently derive earliest supporting-evidence dates to validate the approved cohorts.

**Tech Stack:** TypeScript, Vitest, Nx, React Storybook.

## Global Constraints

- Order skills from oldest supporting experience to newest supporting experience.
- Derive a skill's chronology from the earliest `details.period.startedAt` among its existing `supportingEvidenceIds`.
- For equal dates, use the approved delivery-flow order rather than alphabetical order.
- The exact sequence is: AWS CodePipeline; GitHub; AWS CodeBuild; AWS Systems Manager Parameter Store; Terraform; Docker; Amazon ECR; Helm; Nx; GitHub Actions; OpenID Connect; Kustomize; Argo CD.
- The date cohorts are: `2019-01-24` for AWS CodePipeline; `2019-03-06` for GitHub, AWS CodeBuild, and AWS Systems Manager Parameter Store; `2019-07-05` for Terraform, Docker, Amazon ECR, and Helm; `2024-02-28` for Nx and GitHub Actions; and `2024-05-10` for OpenID Connect, Kustomize, and Argo CD.
- The canonical full skill catalog and compact-card skill order must remain identical.
- Keep the five compact-card experience IDs unchanged and before all skills.
- Do not add, remove, or rename skills.
- Do not change supporting evidence IDs, evidence dates or content, score values, strongest evidence, evidence counts, icons, colors, labels, accessibility behavior, card layout, or Storybook data.
- Do not add runtime date sorting or duplicate a first-evidenced date into skill records.

---

### Task 1: Curate And Enforce Chronological CI Skill Order

**Files:**
- Modify: `apps/github.io/src/app/devops-capability-evidence/continuous-integration-skill-evidence.data.spec.ts`
- Modify: `apps/github.io/src/app/devops-capability-evidence/continuous-integration-skill-evidence.data.ts`
- Modify: `apps/github.io/src/app/devops-capability-evidence/devops-capability-evidence.data.ts`
- Modify: `apps/github.io/src/app/devops-capability-evidence/devops-capability-evidence.spec.ts`
- Modify: `apps/github.io/src/app/devops-capability-evidence/dora-capability-card.stories.spec.ts`

**Interfaces:**
- Consumes: `CapabilityEvidenceItem.supportingEvidenceIds`, supporting experience `details.period.startedAt`, and the first five existing Continuous Integration score evidence IDs.
- Produces: `continuousIntegrationSkillEvidenceItems` in the approved canonical chronology and a Continuous Integration score whose skill IDs are derived from that catalog order.

- [ ] **Step 1: Change the canonical expected skill sequence**

In `continuous-integration-skill-evidence.data.spec.ts`, replace
`expectedSkills` with:

```ts
const expectedSkills = [
  ['continuous-integration-skill-codepipeline', 'AWS CodePipeline'],
  ['continuous-integration-skill-github', 'GitHub'],
  ['continuous-integration-skill-codebuild', 'AWS CodeBuild'],
  [
    'continuous-integration-skill-parameter-store',
    'AWS Systems Manager Parameter Store',
  ],
  ['continuous-integration-skill-terraform', 'Terraform'],
  ['continuous-integration-skill-docker', 'Docker'],
  ['continuous-integration-skill-ecr', 'Amazon ECR'],
  ['continuous-integration-skill-helm', 'Helm'],
  ['continuous-integration-skill-nx', 'Nx'],
  ['continuous-integration-skill-github-actions', 'GitHub Actions'],
  ['continuous-integration-skill-openid-connect', 'OpenID Connect'],
  ['continuous-integration-skill-kustomize', 'Kustomize'],
  ['continuous-integration-skill-argo-cd', 'Argo CD'],
] as const;
```

Keep `expectedSupport` unchanged.

- [ ] **Step 2: Add a contract that derives each skill's earliest evidence date**

In the same describe block, add:

```ts
it('orders skills by earliest supporting experience and delivery flow', () => {
  const experienceById = new Map(
    continuousIntegrationEvidenceItems.map((item) => [item.id, item]),
  );

  expect(
    continuousIntegrationSkillEvidenceItems.map((skill) => {
      const startedAt = (skill.supportingEvidenceIds ?? [])
        .map(
          (supportId) =>
            experienceById.get(supportId)?.details?.period.startedAt,
        )
        .filter((date): date is string => Boolean(date))
        .sort()[0];

      return [skill.title, startedAt];
    }),
  ).toEqual([
    ['AWS CodePipeline', '2019-01-24'],
    ['GitHub', '2019-03-06'],
    ['AWS CodeBuild', '2019-03-06'],
    ['AWS Systems Manager Parameter Store', '2019-03-06'],
    ['Terraform', '2019-07-05'],
    ['Docker', '2019-07-05'],
    ['Amazon ECR', '2019-07-05'],
    ['Helm', '2019-07-05'],
    ['Nx', '2024-02-28'],
    ['GitHub Actions', '2024-02-28'],
    ['OpenID Connect', '2024-05-10'],
    ['Kustomize', '2024-05-10'],
    ['Argo CD', '2024-05-10'],
  ]);
});
```

This test derives dates from the existing evidence relationships and uses the
expected array to lock the approved delivery-flow tie-break inside each date
cohort.

- [ ] **Step 3: Update the shared capability and Storybook expectations**

In `devops-capability-evidence.spec.ts`, import the canonical catalog:

```ts
import { continuousIntegrationSkillEvidenceItems } from './continuous-integration-skill-evidence.data';
```

Extend `curates two AWS and three GitHub monorepo records for the CI card`
after its first-five-ID assertion with:

```ts
expect(score?.evidenceIds.slice(5)).toEqual(
  continuousIntegrationSkillEvidenceItems.map((item) => item.id),
);
```

In `dora-capability-card.stories.spec.ts`, replace only the expected skill
titles after `selected?.slice(5)` with:

```ts
[
  'AWS CodePipeline',
  'GitHub',
  'AWS CodeBuild',
  'AWS Systems Manager Parameter Store',
  'Terraform',
  'Docker',
  'Amazon ECR',
  'Helm',
  'Nx',
  'GitHub Actions',
  'OpenID Connect',
  'Kustomize',
  'Argo CD',
]
```

Do not change the five expected experience labels.

- [ ] **Step 4: Run focused tests to verify RED**

Run:

```bash
../../node_modules/.bin/vitest run --config apps/github.io/vite.config.ts continuous-integration-skill-evidence.data.spec.ts devops-capability-evidence.spec.ts dora-capability-card.stories.spec.ts
```

Expected: FAIL because the catalog and score still use the previous skill
order.

- [ ] **Step 5: Reorder the canonical skill definitions**

In `continuous-integration-skill-evidence.data.ts`, move the existing complete
definition objects without changing their contents so
`continuousIntegrationSkillDefinitions` follows this ID order:

```ts
[
  'continuous-integration-skill-codepipeline',
  'continuous-integration-skill-github',
  'continuous-integration-skill-codebuild',
  'continuous-integration-skill-parameter-store',
  'continuous-integration-skill-terraform',
  'continuous-integration-skill-docker',
  'continuous-integration-skill-ecr',
  'continuous-integration-skill-helm',
  'continuous-integration-skill-nx',
  'continuous-integration-skill-github-actions',
  'continuous-integration-skill-openid-connect',
  'continuous-integration-skill-kustomize',
  'continuous-integration-skill-argo-cd',
]
```

Do not rewrite, add, or remove any property inside the moved objects.

- [ ] **Step 6: Make the CI score consume canonical skill order**

In the Continuous Integration entry of
`devops-capability-evidence.data.ts`, preserve the five explicit experience
IDs and replace the thirteen explicit skill ID strings with:

```ts
...continuousIntegrationSkillEvidenceItems.map((item) => item.id),
```

The complete start of the array remains:

```ts
evidenceIds: [
  'terraform-codepipeline-platform',
  'codebuild-pr-gates',
  'nx-affected-quality-gates',
  'github-actions-gitops-handoff',
  'kustomize-tag-update-reliability',
  ...continuousIntegrationSkillEvidenceItems.map((item) => item.id),
],
```

This is order reuse, not runtime date sorting. Do not alter the score, strongest
evidence ID, or evidence counts.

- [ ] **Step 7: Run focused tests to verify GREEN**

Run:

```bash
../../node_modules/.bin/vitest run --config apps/github.io/vite.config.ts continuous-integration-skill-evidence.data.spec.ts devops-capability-evidence.spec.ts dora-capability-card.stories.spec.ts dora-capability-card.evidence.spec.ts dora-capability-card.spec.tsx
```

Expected: PASS with thirteen chronologically ordered skills after the unchanged
five experience records.

- [ ] **Step 8: Run project verification**

Run each command from the linked worktree root:

```bash
NX_DAEMON=false ../../node_modules/.bin/nx test github.io --skip-nx-cache
NX_DAEMON=false ../../node_modules/.bin/nx lint github.io --skip-nx-cache
NX_DAEMON=false ../../node_modules/.bin/nx build github.io --skip-nx-cache
NX_DAEMON=false ../../node_modules/.bin/nx build-storybook github.io --skip-nx-cache
../../node_modules/.bin/tsc -p apps/github.io/tsconfig.spec.json --noEmit --pretty false
git diff --check
```

Expected: Nx test, lint, build, Storybook build, and `git diff --check` pass.
The TypeScript spec command may retain only the seven documented pre-branch
diagnostics in `devops-capability-evidence-radar.spec.tsx`,
`devops-capability-evidence.spec.ts`,
`devops-capability-evidence.summary.ts`, and `devops-roadmap.spec.tsx`; no new
diagnostic may involve the files changed by this task.

- [ ] **Step 9: Validate the reordered CI Storybook card responsively**

Serve the built Storybook on loopback and inspect the Continuous Integration
card at `390x844` and `768x1024`. Confirm:

- Experiences still contains the same five tokens in the same order;
- Skills contains the thirteen approved tokens in canonical chronological
  order;
- labels, neutral token surfaces, and brand-colored icons are unchanged;
- token wrapping remains coherent after the reorder; and
- neither the card nor the document has horizontal overflow or overlap.

Record screenshots, token text order, and objective overflow measurements in
this plan's ignored SDD workspace.

- [ ] **Step 10: Commit the implementation**

Inspect `git diff` and `git diff --cached`, stage only the five task files, and
commit:

```bash
git add apps/github.io/src/app/devops-capability-evidence/continuous-integration-skill-evidence.data.spec.ts apps/github.io/src/app/devops-capability-evidence/continuous-integration-skill-evidence.data.ts apps/github.io/src/app/devops-capability-evidence/devops-capability-evidence.data.ts apps/github.io/src/app/devops-capability-evidence/devops-capability-evidence.spec.ts apps/github.io/src/app/devops-capability-evidence/dora-capability-card.stories.spec.ts
git commit -m "feat(github.io): order CI skills chronologically"
```
