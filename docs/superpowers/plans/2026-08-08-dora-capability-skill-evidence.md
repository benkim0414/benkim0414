# DORA Capability Skill Evidence Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add thirteen evidence-backed Continuous Integration skill tokens beneath the unchanged five applied-evidence tokens, expand the public CI catalog with three atomic AWS platform records, and render accurate local or Simple Icons assets for every selected skill.

**Architecture:** Keep CI applied work and CI skills in separate typed datasets, then compose both into the shared capability catalog and select them through the existing score. Replace the card's catch-all grouping with the global `applied`, `certifications`, `skills`, `learning` taxonomy. Extend the shared skill-brand renderer so Simple Icons continue to use monochrome SVG paths while official AWS Architecture SVGs render as full-color local images through the existing `DoraCapabilityCard -> CapabilityEvidence -> SkillEvidenceToken -> SkillToken` path.

**Tech Stack:** React, TypeScript, Nx, Jest, Testing Library, Storybook, StyleX, Astryx Design System, Simple Icons, AWS Architecture Icons.

## Global Constraints

- Work only in the linked `feat/dora-ci-evidence` worktree and do not push, merge, or deploy.
- Keep the CI score at `4` of `5`, keep `strongestEvidenceId: 'terraform-codepipeline-platform'`, and keep the current five experience IDs first and unchanged.
- The compact card must contain exactly five selected experience records followed by exactly thirteen selected skill records.
- Do not add the thirteen capability skills to the main Skills page or introduce ratings, categories, descriptions, or search metadata there.
- Do not create a CI-specific renderer; preserve `DoraCapabilityCard -> CapabilityEvidence -> SkillEvidenceToken -> SkillToken`.
- Skill tokens remain name-only, non-clickable, visually unlabeled by row, and have no hover cards or new interaction state.
- Public data must not expose employer names; private repository, service, workflow, module, or image names; AWS account IDs or regions; secret or Parameter Store paths; business identifiers; private source links; or copied private-source prose.
- Public technology names, generalized context, exact approved dates, counts, percentages, and ratios are allowed.
- Use official local AWS Architecture SVGs for AWS CodePipeline, AWS CodeBuild, Amazon ECR, and AWS Systems Manager; Parameter Store uses the Systems Manager icon.
- Use Simple Icons for Terraform, GitHub, Docker, Nx, GitHub Actions, OpenID Connect, Helm, Argo CD, and the Kubernetes fallback mark for Kustomize.
- Record only public icon sources in provenance and explicitly identify Kubernetes as a Kustomize fallback, not a distinct Kustomize brand.
- Preserve stable token/icon dimensions, wrapping, and existing Astryx spacing. Full-color SVG images must not inherit monochrome path fill styles.
- Commit each self-contained task separately with explicit staging paths and conventional commit subjects.

---

## File Structure

- Modify `apps/github.io/src/app/devops-capability-evidence/continuous-integration-evidence.data.ts`: add the three approved atomic AWS experience records.
- Modify `apps/github.io/src/app/devops-capability-evidence/continuous-integration-evidence.data.spec.ts`: lock the 18-record experience catalog, 9/9 initiative split, approved metrics, period, and privacy constraints.
- Create `apps/github.io/src/app/devops-capability-evidence/continuous-integration-skill-evidence.data.ts`: define the thirteen ordered CI skill records and focused supporting-evidence links.
- Create `apps/github.io/src/app/devops-capability-evidence/continuous-integration-skill-evidence.data.spec.ts`: verify skill order, shape, privacy, uniqueness, and support-link resolution.
- Modify `apps/github.io/src/app/devops-capability-evidence/devops-capability-evidence.data.ts`: compose both CI datasets and append the thirteen skill IDs to the CI score.
- Modify `apps/github.io/src/app/devops-capability-evidence/devops-capability-evidence.spec.ts`: verify global uniqueness and the exact CI selection, score, strongest evidence, and counts.
- Modify `apps/github.io/src/app/devops-capability-evidence/dora-capability-card.types.ts`: replace `other` with semantic applied and learning groups.
- Modify `apps/github.io/src/app/devops-capability-evidence/dora-capability-card.evidence.ts`: map all evidence types to the approved global order.
- Modify `apps/github.io/src/app/devops-capability-evidence/dora-capability-card.evidence.spec.ts`: lock group membership and order.
- Modify `apps/github.io/src/app/devops-capability-evidence/dora-capability-card.tsx`: update accessible row labels without adding visible headings.
- Add `apps/github.io/src/assets/skills/aws/aws-codepipeline.svg`, `aws-codebuild.svg`, `amazon-ecr.svg`, and `aws-systems-manager.svg`: locally bundled official full-color AWS Architecture service icons.
- Add `apps/github.io/src/assets/skills/README.md`: public asset provenance, release/retrieval information, and the Kustomize fallback decision.
- Modify `apps/github.io/src/app/skills/skill-brand.ts`: map the thirteen public skill names to Simple Icons or local image assets.
- Modify `apps/github.io/src/app/skills/skill-brand.spec.ts`: verify aliases and local/full-color asset mappings.
- Modify `apps/github.io/src/app/skills/skill-token.tsx`: render path icons as inline SVG and local image icons as decorative images.
- Modify `apps/github.io/src/app/skills/skill-token.spec.tsx`: verify both icon variants and fallback behavior.
- Modify `apps/github.io/src/app/devops-capability-evidence/capability-evidence-icon.tsx`: recognize and render either skill-brand icon representation.
- Modify `apps/github.io/src/app/devops-capability-evidence/capability-evidence.spec.tsx`: verify all selected CI skills use `SkillToken` with real icons.
- Modify `apps/github.io/src/app/devops-capability-evidence/dora-capability-card.spec.tsx`: verify row ARIA names and exact applied/skill rendering.
- Modify `apps/github.io/src/app/devops-capability-evidence/dora-capability-card.stories.spec.ts`: lock the shared story's exact five-plus-thirteen selection.

### Task 1: Expand The Atomic CI Evidence Catalogs

**Files:**
- Modify: `apps/github.io/src/app/devops-capability-evidence/continuous-integration-evidence.data.ts`
- Modify: `apps/github.io/src/app/devops-capability-evidence/continuous-integration-evidence.data.spec.ts`
- Create: `apps/github.io/src/app/devops-capability-evidence/continuous-integration-skill-evidence.data.ts`
- Create: `apps/github.io/src/app/devops-capability-evidence/continuous-integration-skill-evidence.data.spec.ts`

**Interfaces:**
- Consumes: `CapabilityEvidenceItem`, `continuousIntegrationEvidenceInitiatives`, and the existing fifteen-item experience catalog.
- Produces: `continuousIntegrationEvidenceItems: readonly CapabilityEvidenceItem[]` with 18 experience items and `continuousIntegrationSkillEvidenceItems: readonly CapabilityEvidenceItem[]` with 13 skill items in approved order.

- [ ] **Step 1: Write failing experience-catalog assertions**

Extend `continuous-integration-evidence.data.spec.ts` so `expectedIds` ends with:

```ts
  'reusable-helm-deployment-image',
  'codebuild-status-visibility',
  'codebuild-runtime-upgrades',
```

Change the expected initiative counts to:

```ts
expect(counts).toEqual({
  'aws-codepipeline-platform': 9,
  'github-actions-monorepo': 9,
});
```

Add exact assertions for the new records:

```ts
expect(byId.get('reusable-helm-deployment-image')).toMatchObject({
  type: 'experience',
  technologies: [
    'AWS CodeBuild',
    'Amazon ECR',
    'Docker',
    'Helm',
    'Amazon EKS',
  ],
  details: {
    initiative: continuousIntegrationEvidenceInitiatives.awsCodePipelinePlatform,
    metrics: [
      {
        label: 'Build projects using reusable image',
        value: 44,
        denominator: 105,
        unit: 'count',
        measuredAt: '2026-08-07',
      },
      {
        label: 'Contributed image changes',
        value: 24,
        denominator: 51,
        unit: 'count',
        measuredAt: '2026-08-07',
      },
    ],
  },
});

expect(byId.get('codebuild-status-visibility')?.details?.metrics).toEqual([
  {
    label: 'Projects with build badges',
    value: 98,
    denominator: 105,
    unit: 'count',
    measuredAt: '2026-08-07',
  },
  {
    label: 'Projects reporting GitHub status',
    value: 91,
    denominator: 105,
    unit: 'count',
    measuredAt: '2026-08-07',
  },
]);

expect(byId.get('codebuild-runtime-upgrades')).toMatchObject({
  technologies: ['AWS CodeBuild', 'Terraform'],
  details: {
    period: { startedAt: '2019-07-05', endedAt: '2025-03-18' },
    metrics: [],
    facts: [
      'Upgraded the AWS CodeBuild standard image from generation 5 to 6 in March 2023.',
      'Upgraded the AWS CodeBuild standard image from generation 6 to 7 in March 2025.',
    ],
  },
});
```

Create `byId` with `new Map(continuousIntegrationEvidenceItems.map((item) => [item.id, item]))` inside the new test.

- [ ] **Step 2: Run the experience data test and verify it fails**

Run:

```bash
../../node_modules/.bin/vitest run --config apps/github.io/vite.config.ts continuous-integration-evidence.data.spec.ts
```

Expected: FAIL because the catalog still has 15 records and the three IDs do not resolve.

- [ ] **Step 3: Add the three atomic experience records**

Append these objects to `continuousIntegrationEvidenceItemCatalog` before its closing bracket:

```ts
{
  id: 'reusable-helm-deployment-image',
  label: 'Reusable Helm image',
  title: 'Reusable Docker and Helm deployment image',
  type: 'experience',
  capabilityKeys: ['continuous-integration'],
  isPublic: true,
  strength: 'strong',
  summary:
    'Maintained a reusable Docker and Helm build image used by AWS CodeBuild projects to deploy applications to Amazon EKS.',
  technologies: [
    'AWS CodeBuild',
    'Amazon ECR',
    'Docker',
    'Helm',
    'Amazon EKS',
  ],
  details: {
    initiative: awsInitiative,
    period: { startedAt: '2019-07-05' },
    metrics: [
      {
        label: 'Build projects using reusable image',
        value: 44,
        denominator: 105,
        unit: 'count',
        measuredAt: snapshotDate,
      },
      {
        label: 'Contributed image changes',
        value: 24,
        denominator: 51,
        unit: 'count',
        measuredAt: snapshotDate,
      },
    ],
    facts: [
      'Maintained one reusable CI build image consumed by many build projects without implying public distribution.',
    ],
  },
},
{
  id: 'codebuild-status-visibility',
  label: 'Build status visibility',
  title: 'CodeBuild status visibility',
  type: 'experience',
  capabilityKeys: ['continuous-integration'],
  isPublic: true,
  strength: 'strong',
  summary:
    'Made CI results visible through build badges and GitHub commit statuses configured by the reusable Terraform platform.',
  technologies: ['Terraform', 'AWS CodeBuild', 'GitHub'],
  details: {
    initiative: awsInitiative,
    period: { startedAt: '2019-07-05' },
    metrics: [
      {
        label: 'Projects with build badges',
        value: 98,
        denominator: 105,
        unit: 'count',
        measuredAt: snapshotDate,
      },
      {
        label: 'Projects reporting GitHub status',
        value: 91,
        denominator: 105,
        unit: 'count',
        measuredAt: snapshotDate,
      },
    ],
    facts: [
      'Made CI outcomes visible across the build fleet through badges and source-control status reporting.',
    ],
  },
},
{
  id: 'codebuild-runtime-upgrades',
  label: 'Runtime upgrades',
  title: 'AWS CodeBuild runtime upgrades',
  type: 'experience',
  capabilityKeys: ['continuous-integration'],
  isPublic: true,
  strength: 'supporting',
  summary:
    'Maintained the CI platform through successive AWS CodeBuild standard-image generations and associated delivery-platform updates.',
  technologies: ['AWS CodeBuild', 'Terraform'],
  details: {
    initiative: awsInitiative,
    period: { startedAt: '2019-07-05', endedAt: '2025-03-18' },
    metrics: [],
    facts: [
      'Upgraded the AWS CodeBuild standard image from generation 5 to 6 in March 2023.',
      'Upgraded the AWS CodeBuild standard image from generation 6 to 7 in March 2025.',
    ],
  },
},
```

Do not add any private organization, repository, image, module, account, region, or parameter-path identifier.

- [ ] **Step 4: Run the experience data test and verify it passes**

Run the Step 2 command again.

Expected: PASS with 18 experience records and a 9 AWS / 9 GitHub initiative split.

- [ ] **Step 5: Write the failing skill-catalog test**

Create `continuous-integration-skill-evidence.data.spec.ts` with the exact approved names and support map:

```ts
import { continuousIntegrationEvidenceItems } from './continuous-integration-evidence.data';
import { continuousIntegrationSkillEvidenceItems } from './continuous-integration-skill-evidence.data';

const expectedSkills = [
  ['continuous-integration-skill-terraform', 'Terraform'],
  ['continuous-integration-skill-codepipeline', 'AWS CodePipeline'],
  ['continuous-integration-skill-codebuild', 'AWS CodeBuild'],
  ['continuous-integration-skill-ecr', 'Amazon ECR'],
  ['continuous-integration-skill-github', 'GitHub'],
  ['continuous-integration-skill-parameter-store', 'AWS Systems Manager Parameter Store'],
  ['continuous-integration-skill-docker', 'Docker'],
  ['continuous-integration-skill-nx', 'Nx'],
  ['continuous-integration-skill-github-actions', 'GitHub Actions'],
  ['continuous-integration-skill-openid-connect', 'OpenID Connect'],
  ['continuous-integration-skill-kustomize', 'Kustomize'],
  ['continuous-integration-skill-helm', 'Helm'],
  ['continuous-integration-skill-argo-cd', 'Argo CD'],
] as const;

const expectedSupport = {
  'continuous-integration-skill-terraform': ['terraform-codepipeline-platform'],
  'continuous-integration-skill-codepipeline': [
    'terraform-codepipeline-platform',
    'codepipeline-webhook-trunk',
  ],
  'continuous-integration-skill-codebuild': [
    'codebuild-pr-gates',
    'codebuild-feedback-tuning',
    'codebuild-runtime-upgrades',
  ],
  'continuous-integration-skill-ecr': [
    'ecr-immutable-promotion',
    'github-actions-oidc-ecr-publishing',
    'reusable-helm-deployment-image',
  ],
  'continuous-integration-skill-github': [
    'codebuild-pr-gates',
    'nx-affected-quality-gates',
  ],
  'continuous-integration-skill-parameter-store': ['codebuild-postgresql-tests'],
  'continuous-integration-skill-docker': [
    'ecr-immutable-promotion',
    'github-actions-container-verification',
    'github-actions-oidc-ecr-publishing',
    'reusable-helm-deployment-image',
  ],
  'continuous-integration-skill-nx': [
    'nx-monorepo-migration',
    'nx-affected-quality-gates',
  ],
  'continuous-integration-skill-github-actions': [
    'nx-affected-quality-gates',
    'github-actions-oidc-ecr-publishing',
    'github-actions-gitops-handoff',
  ],
  'continuous-integration-skill-openid-connect': [
    'github-actions-oidc-ecr-publishing',
  ],
  'continuous-integration-skill-kustomize': [
    'github-actions-gitops-handoff',
    'kustomize-tag-update-reliability',
  ],
  'continuous-integration-skill-helm': ['reusable-helm-deployment-image'],
  'continuous-integration-skill-argo-cd': ['github-actions-gitops-handoff'],
} as const;

describe('continuousIntegrationSkillEvidenceItems', () => {
  it('stores exactly the approved skills in display order', () => {
    expect(continuousIntegrationSkillEvidenceItems.map(({ id, title }) => [id, title])).toEqual(expectedSkills);
  });

  it('stores focused links to real experience evidence', () => {
    const experienceById = new Map(
      continuousIntegrationEvidenceItems.map((item) => [item.id, item]),
    );

    for (const item of continuousIntegrationSkillEvidenceItems) {
      expect(item).toMatchObject({
        label: item.title,
        type: 'skill',
        capabilityKeys: ['continuous-integration'],
        technologies: [item.title],
        isPublic: true,
      });
      expect(item.isSensitive).not.toBe(true);
      expect(item.proofUrl).toBeUndefined();
      expect(item.supportingEvidenceIds).toEqual(
        expectedSupport[item.id as keyof typeof expectedSupport],
      );
      expect(item.supportingEvidenceIds?.length).toBeGreaterThan(0);

      for (const supportId of item.supportingEvidenceIds ?? []) {
        expect(experienceById.get(supportId)?.type).toBe('experience');
      }
    }
  });

  it('keeps ids unique and public text free of private identifiers', () => {
    const ids = continuousIntegrationSkillEvidenceItems.map((item) => item.id);
    const publicText = JSON.stringify(continuousIntegrationSkillEvidenceItems);

    expect(new Set(ids)).toHaveProperty('size', 13);
    expect(publicText).not.toMatch(/https?:\/\//);
    expect(publicText).not.toMatch(/\b\d{12}\b/);
    expect(publicText).not.toMatch(/parameter[- ]?path/i);
    expect(publicText).not.toMatch(/employer|customer|client/i);
  });
});
```

- [ ] **Step 6: Run the skill data test and verify it fails**

Run:

```bash
../../node_modules/.bin/vitest run --config apps/github.io/vite.config.ts continuous-integration-skill-evidence.data.spec.ts
```

Expected: FAIL because the new module does not exist.

- [ ] **Step 7: Implement the thirteen skill evidence records**

Create `continuous-integration-skill-evidence.data.ts` with the complete ordered definitions and a single mapping into the shared evidence shape:

```ts
import type { CapabilityEvidenceItem } from './devops-capability-evidence.types';

const continuousIntegrationSkillDefinitions = [
  {
    id: 'continuous-integration-skill-terraform',
    name: 'Terraform',
    supportingEvidenceIds: ['terraform-codepipeline-platform'],
  },
  {
    id: 'continuous-integration-skill-codepipeline',
    name: 'AWS CodePipeline',
    supportingEvidenceIds: [
      'terraform-codepipeline-platform',
      'codepipeline-webhook-trunk',
    ],
  },
  {
    id: 'continuous-integration-skill-codebuild',
    name: 'AWS CodeBuild',
    supportingEvidenceIds: [
      'codebuild-pr-gates',
      'codebuild-feedback-tuning',
      'codebuild-runtime-upgrades',
    ],
  },
  {
    id: 'continuous-integration-skill-ecr',
    name: 'Amazon ECR',
    supportingEvidenceIds: [
      'ecr-immutable-promotion',
      'github-actions-oidc-ecr-publishing',
      'reusable-helm-deployment-image',
    ],
  },
  {
    id: 'continuous-integration-skill-github',
    name: 'GitHub',
    supportingEvidenceIds: [
      'codebuild-pr-gates',
      'nx-affected-quality-gates',
    ],
  },
  {
    id: 'continuous-integration-skill-parameter-store',
    name: 'AWS Systems Manager Parameter Store',
    supportingEvidenceIds: ['codebuild-postgresql-tests'],
  },
  {
    id: 'continuous-integration-skill-docker',
    name: 'Docker',
    supportingEvidenceIds: [
      'ecr-immutable-promotion',
      'github-actions-container-verification',
      'github-actions-oidc-ecr-publishing',
      'reusable-helm-deployment-image',
    ],
  },
  {
    id: 'continuous-integration-skill-nx',
    name: 'Nx',
    supportingEvidenceIds: [
      'nx-monorepo-migration',
      'nx-affected-quality-gates',
    ],
  },
  {
    id: 'continuous-integration-skill-github-actions',
    name: 'GitHub Actions',
    supportingEvidenceIds: [
      'nx-affected-quality-gates',
      'github-actions-oidc-ecr-publishing',
      'github-actions-gitops-handoff',
    ],
  },
  {
    id: 'continuous-integration-skill-openid-connect',
    name: 'OpenID Connect',
    supportingEvidenceIds: ['github-actions-oidc-ecr-publishing'],
  },
  {
    id: 'continuous-integration-skill-kustomize',
    name: 'Kustomize',
    supportingEvidenceIds: [
      'github-actions-gitops-handoff',
      'kustomize-tag-update-reliability',
    ],
  },
  {
    id: 'continuous-integration-skill-helm',
    name: 'Helm',
    supportingEvidenceIds: ['reusable-helm-deployment-image'],
  },
  {
    id: 'continuous-integration-skill-argo-cd',
    name: 'Argo CD',
    supportingEvidenceIds: ['github-actions-gitops-handoff'],
  },
] as const;

export const continuousIntegrationSkillEvidenceItems:
  readonly CapabilityEvidenceItem[] = continuousIntegrationSkillDefinitions.map(
    ({ id, name, supportingEvidenceIds }) => ({
      id,
      title: name,
      label: name,
      type: 'skill',
      capabilityKeys: ['continuous-integration'],
      summary: `Evidence-backed Continuous Integration capability with ${name}.`,
      technologies: [name],
      isPublic: true,
      strength: 'strong',
      supportingEvidenceIds,
    }),
  );
```

- [ ] **Step 8: Run both focused data tests and verify they pass**

Run:

```bash
../../node_modules/.bin/vitest run --config apps/github.io/vite.config.ts continuous-integration-evidence.data.spec.ts continuous-integration-skill-evidence.data.spec.ts
```

Expected: PASS for both suites.

- [ ] **Step 9: Commit the catalog expansion**

```bash
git diff --check
git diff -- apps/github.io/src/app/devops-capability-evidence/continuous-integration-evidence.data.ts apps/github.io/src/app/devops-capability-evidence/continuous-integration-evidence.data.spec.ts apps/github.io/src/app/devops-capability-evidence/continuous-integration-skill-evidence.data.ts apps/github.io/src/app/devops-capability-evidence/continuous-integration-skill-evidence.data.spec.ts
git add apps/github.io/src/app/devops-capability-evidence/continuous-integration-evidence.data.ts apps/github.io/src/app/devops-capability-evidence/continuous-integration-evidence.data.spec.ts apps/github.io/src/app/devops-capability-evidence/continuous-integration-skill-evidence.data.ts apps/github.io/src/app/devops-capability-evidence/continuous-integration-skill-evidence.data.spec.ts
git diff --cached --check
git commit -m "feat(github.io): add CI skill evidence catalog"
```

### Task 2: Compose The CI Selection And Semantic Evidence Rows

**Files:**
- Modify: `apps/github.io/src/app/devops-capability-evidence/devops-capability-evidence.data.ts`
- Modify: `apps/github.io/src/app/devops-capability-evidence/devops-capability-evidence.spec.ts`
- Modify: `apps/github.io/src/app/devops-capability-evidence/dora-capability-card.types.ts`
- Modify: `apps/github.io/src/app/devops-capability-evidence/dora-capability-card.evidence.ts`
- Modify: `apps/github.io/src/app/devops-capability-evidence/dora-capability-card.evidence.spec.ts`
- Modify: `apps/github.io/src/app/devops-capability-evidence/dora-capability-card.tsx`
- Modify: `apps/github.io/src/app/devops-capability-evidence/dora-capability-card.spec.tsx`

**Interfaces:**
- Consumes: `continuousIntegrationSkillEvidenceItems` from Task 1 and the existing `DoraCapabilityScore`/`EvidenceType` types.
- Produces: a CI score whose `evidenceIds` are five experience IDs plus thirteen skill IDs; `DoraCapabilityCardEvidenceGroup = 'applied' | 'certifications' | 'skills' | 'learning'`; accessible row labels for those groups.

- [ ] **Step 1: Write failing score-composition assertions**

In `devops-capability-evidence.spec.ts`, change the expected CI score to:

```ts
{
  capabilityKey: 'continuous-integration',
  evidenceIds: [
    'terraform-codepipeline-platform',
    'codebuild-pr-gates',
    'nx-affected-quality-gates',
    'github-actions-gitops-handoff',
    'kustomize-tag-update-reliability',
    'continuous-integration-skill-terraform',
    'continuous-integration-skill-codepipeline',
    'continuous-integration-skill-codebuild',
    'continuous-integration-skill-ecr',
    'continuous-integration-skill-github',
    'continuous-integration-skill-parameter-store',
    'continuous-integration-skill-docker',
    'continuous-integration-skill-nx',
    'continuous-integration-skill-github-actions',
    'continuous-integration-skill-openid-connect',
    'continuous-integration-skill-kustomize',
    'continuous-integration-skill-helm',
    'continuous-integration-skill-argo-cd',
  ],
  strongestEvidenceId: 'terraform-codepipeline-platform',
  evidenceCounts: { experience: 5, skill: 13 },
}
```

Keep the existing score/max-score assertions and add:

```ts
expect(score?.score).toBe(4);
expect(score?.maxScore).toBe(5);
expect(score?.evidenceIds.slice(0, 5)).toEqual([
  'terraform-codepipeline-platform',
  'codebuild-pr-gates',
  'nx-affected-quality-gates',
  'github-actions-gitops-handoff',
  'kustomize-tag-update-reliability',
]);
```

- [ ] **Step 2: Run the shared data test and verify it fails**

Run:

```bash
../../node_modules/.bin/vitest run --config apps/github.io/vite.config.ts devops-capability-evidence.spec.ts
```

Expected: FAIL because the skill dataset is not composed or selected.

- [ ] **Step 3: Compose the skill catalog and selection**

In `devops-capability-evidence.data.ts`:

```ts
import { continuousIntegrationSkillEvidenceItems } from './continuous-integration-skill-evidence.data';
```

Append `...continuousIntegrationSkillEvidenceItems` immediately after `...continuousIntegrationEvidenceItems` in `devOpsCapabilityEvidenceItems`. Append the thirteen skill IDs from Step 1 after the existing five CI IDs. Change only that score's count to:

```ts
evidenceCounts: { experience: 5, skill: 13 },
```

Do not change its score, max score, strongest evidence, or first five IDs.

- [ ] **Step 4: Run the shared data test and verify it passes**

Run the Step 2 command again.

Expected: PASS, including the existing global ID/reference/count integrity checks.

- [ ] **Step 5: Write failing semantic-group tests**

Update `dora-capability-card.evidence.spec.ts` so the CI test expects:

```ts
expect(rows.map((row) => row.group)).toEqual(['applied', 'skills']);
expect(rows[0]?.evidence.map((item) => item.id)).toEqual([
  'terraform-codepipeline-platform',
  'codebuild-pr-gates',
  'nx-affected-quality-gates',
  'github-actions-gitops-handoff',
  'kustomize-tag-update-reliability',
]);
expect(rows[1]?.evidence).toHaveLength(13);
```

Replace the existing mixed-group fixture expectation with a local fixture covering every type:

```ts
const rows = getDoraCapabilityCardEvidenceRows('continuous-integration', [
  evidence({ id: 'experience', type: 'experience' }),
  evidence({ id: 'project', type: 'project' }),
  evidence({ id: 'certification', type: 'certification' }),
  evidence({ id: 'skill', type: 'skill' }),
  evidence({ id: 'learning', type: 'learning' }),
  evidence({ id: 'education', type: 'education' }),
]);

expect(rows.map((row) => row.group)).toEqual([
  'applied',
  'certifications',
  'skills',
  'learning',
]);
expect(rows.map((row) => row.evidence.map((item) => item.id))).toEqual([
  ['experience', 'project'],
  ['certification'],
  ['skill'],
  ['learning', 'education'],
]);
```

Update the scoreless fallback test to expect `applied` before `skills`.

- [ ] **Step 6: Run the evidence grouping test and verify it fails**

Run:

```bash
../../node_modules/.bin/vitest run --config apps/github.io/vite.config.ts dora-capability-card.evidence.spec.ts
```

Expected: FAIL because the implementation still returns `skills`, `certifications`, and `other`.

- [ ] **Step 7: Implement the semantic evidence groups**

Change `DoraCapabilityCardEvidenceGroup` in `dora-capability-card.types.ts` to:

```ts
export type DoraCapabilityCardEvidenceGroup =
  | 'applied'
  | 'certifications'
  | 'skills'
  | 'learning';
```

In `dora-capability-card.evidence.ts`, use:

```ts
const evidenceGroupOrder = [
  'applied',
  'certifications',
  'skills',
  'learning',
] as const satisfies readonly DoraCapabilityCardEvidenceGroup[];

const evidenceGroupByType = {
  experience: 'applied',
  project: 'applied',
  certification: 'certifications',
  skill: 'skills',
  learning: 'learning',
  education: 'learning',
} as const satisfies Record<EvidenceType, DoraCapabilityCardEvidenceGroup>;

function getEvidenceGroup(type: EvidenceType): DoraCapabilityCardEvidenceGroup {
  return evidenceGroupByType[type];
}
```

In `dora-capability-card.tsx`, change only the accessible label map:

```ts
const evidenceGroupLabels = {
  applied: 'applied evidence',
  certifications: 'certification evidence',
  skills: 'skill evidence',
  learning: 'learning evidence',
} as const satisfies Record<DoraCapabilityCardEvidenceGroup, string>;
```

Do not add visible row headings or alter spacing styles.

- [ ] **Step 8: Update and run the card rendering test**

In `dora-capability-card.spec.tsx`, change existing group assertions to the new `data-group` values and query the CI rows by these exact accessible names:

```ts
const appliedRow = screen.getByRole('list', {
  name: 'Continuous Integration applied evidence',
});
const skillRow = screen.getByRole('list', {
  name: 'Continuous Integration skill evidence',
});

expect(within(appliedRow).getAllByRole('listitem')).toHaveLength(5);
expect(within(skillRow).getAllByRole('listitem')).toHaveLength(13);
expect(appliedRow).toHaveAttribute('data-group', 'applied');
expect(skillRow).toHaveAttribute('data-group', 'skills');
```

Run:

```bash
../../node_modules/.bin/vitest run --config apps/github.io/vite.config.ts dora-capability-card.evidence.spec.ts dora-capability-card.spec.tsx
```

Expected: PASS for helper and component suites.

- [ ] **Step 9: Commit the shared selection and grouping**

```bash
git diff --check
git add apps/github.io/src/app/devops-capability-evidence/devops-capability-evidence.data.ts apps/github.io/src/app/devops-capability-evidence/devops-capability-evidence.spec.ts apps/github.io/src/app/devops-capability-evidence/dora-capability-card.types.ts apps/github.io/src/app/devops-capability-evidence/dora-capability-card.evidence.ts apps/github.io/src/app/devops-capability-evidence/dora-capability-card.evidence.spec.ts apps/github.io/src/app/devops-capability-evidence/dora-capability-card.tsx apps/github.io/src/app/devops-capability-evidence/dora-capability-card.spec.tsx
git diff --cached --check
git commit -m "feat(github.io): group capability skill evidence"
```

### Task 3: Add Official AWS Assets And Full-Color Icon Rendering

**Files:**
- Create: `apps/github.io/src/assets/skills/aws/aws-codepipeline.svg`
- Create: `apps/github.io/src/assets/skills/aws/aws-codebuild.svg`
- Create: `apps/github.io/src/assets/skills/aws/amazon-ecr.svg`
- Create: `apps/github.io/src/assets/skills/aws/aws-systems-manager.svg`
- Create: `apps/github.io/src/assets/skills/README.md`
- Modify: `apps/github.io/src/app/skills/skill-brand.ts`
- Modify: `apps/github.io/src/app/skills/skill-brand.spec.ts`
- Modify: `apps/github.io/src/app/skills/skill-token.tsx`
- Modify: `apps/github.io/src/app/skills/skill-token.spec.tsx`
- Modify: `apps/github.io/src/app/devops-capability-evidence/capability-evidence-icon.tsx`
- Modify: `apps/github.io/src/app/devops-capability-evidence/capability-evidence.spec.tsx`

**Interfaces:**
- Consumes: Vite SVG URL imports, installed `simple-icons`, `SkillBrand`, and Task 1's exact skill names.
- Produces: `hasSkillBrandIcon(brand: SkillBrand | undefined): boolean`; `SkillBrand.iconPath` for monochrome inline paths or `SkillBrand.iconDataUrl` for local full-color images; decorative SVG or `img` rendering with stable `--spacing-3` dimensions.

- [ ] **Step 1: Obtain and record the current official AWS icons**

Download the official Q2 2026 AWS Architecture Icon package from the public AWS source page:

```text
Source page: https://aws.amazon.com/architecture/icons/
Archive: https://d1.awsstatic.com/onedam/marketing-channels/website/aws/en_US/architecture/approved/architecture-icons/Icon-package_04302026.4705b90f5aa45b019271a2699e9ce9b97b941ee1.zip
Release: Q2 2026 / 2026-04-30
Retrieval date: 2026-08-08
```

Extract the 64px SVG variants named `Arch_AWS-CodePipeline_64.svg`, `Arch_AWS-CodeBuild_64.svg`, `Arch_Amazon-Elastic-Container-Registry_64.svg`, and `Arch_AWS-Systems-Manager_64.svg`. Store them under the stable filenames listed in this task. Do not edit their artwork or hotlink the archive at runtime.

Create `apps/github.io/src/assets/skills/README.md` containing the source page, archive URL, release date, retrieval date, upstream filename-to-local-filename mapping, AWS's published asset terms link from the source page, and this exact fallback note:

```md
## Kustomize fallback

Kustomize does not publish a dedicated official brand asset. The UI uses the
Kubernetes mark from the installed Simple Icons package as a contextual fallback
because Kustomize is Kubernetes SIG CLI tooling and is integrated into `kubectl`.
The Kubernetes mark is not represented as a distinct Kustomize brand.
```

- [ ] **Step 2: Write failing brand-mapping tests**

In `skill-brand.spec.ts`, add:

```ts
const ciSkillNames = [
  'Terraform',
  'AWS CodePipeline',
  'AWS CodeBuild',
  'Amazon ECR',
  'GitHub',
  'AWS Systems Manager Parameter Store',
  'Docker',
  'Nx',
  'GitHub Actions',
  'OpenID Connect',
  'Kustomize',
  'Helm',
  'Argo CD',
];

it('resolves an icon for every selected CI skill', () => {
  for (const skill of ciSkillNames) {
    expect(hasSkillBrandIcon(getSkillBrand(skill))).toBe(true);
  }
});

it.each([
  'AWS CodePipeline',
  'AWS CodeBuild',
  'Amazon ECR',
  'AWS Systems Manager Parameter Store',
])('uses a local full-color AWS asset for %s', (skill) => {
  const brand = getSkillBrand(skill);

  expect(brand?.iconPath).toBeUndefined();
  expect(brand?.iconDataUrl).toMatch(/assets\/.*\.svg/);
});

it('uses the Kubernetes Simple Icon as the documented Kustomize fallback', () => {
  expect(getSkillBrand('Kustomize')?.iconPath).toBe(
    getSkillBrand('Kubernetes')?.iconPath,
  );
});
```

- [ ] **Step 3: Run the brand test and verify it fails**

Run:

```bash
../../node_modules/.bin/vitest run --config apps/github.io/vite.config.ts skill-brand.spec.ts
```

Expected: FAIL because AWS image mappings, OpenID Connect, Helm, the `Argo CD` alias, Kustomize fallback, and `hasSkillBrandIcon` are missing.

- [ ] **Step 4: Extend the shared skill-brand model**

In `skill-brand.ts`:

```ts
import codeBuildIconUrl from '../../assets/skills/aws/aws-codebuild.svg';
import codePipelineIconUrl from '../../assets/skills/aws/aws-codepipeline.svg';
import ecrIconUrl from '../../assets/skills/aws/amazon-ecr.svg';
import systemsManagerIconUrl from '../../assets/skills/aws/aws-systems-manager.svg';
```

Add `siHelm` and `siOpenid` to the Simple Icons import. Add these mappings while preserving all existing aliases:

```ts
'Argo CD': siArgo,
Helm: siHelm,
Kustomize: siKubernetes,
'OpenID Connect': siOpenid,
```

Add:

```ts
const skillIconAssets: Readonly<Record<string, string>> = {
  'AWS CodePipeline': codePipelineIconUrl,
  'AWS CodeBuild': codeBuildIconUrl,
  'Amazon ECR': ecrIconUrl,
  'AWS Systems Manager Parameter Store': systemsManagerIconUrl,
};

const skillBrandColors: Readonly<Record<string, string>> = {
  AWS: '#FF9900',
  'AWS CodePipeline': '#FFFFFF',
  'AWS CodeBuild': '#FFFFFF',
  'Amazon ECR': '#FFFFFF',
  'AWS Systems Manager Parameter Store': '#FFFFFF',
};

export function hasSkillBrandIcon(
  brand: SkillBrand | undefined,
): boolean {
  return Boolean(brand?.iconPath || brand?.iconDataUrl);
}
```

Update `getSkillBrand` so it reads `const iconAssetUrl = skillIconAssets[label]`, accepts either an icon, asset URL, or legacy brand color, and returns `{ iconDataUrl: iconAssetUrl }` for local assets. Preserve the existing `toIconDataUrl` behavior for Simple Icons and the existing unknown-label fallback.

- [ ] **Step 5: Run the brand test and verify it passes**

Run the Step 3 command again.

Expected: PASS, with every CI skill mapped and all existing skill-brand tests unchanged.

- [ ] **Step 6: Write failing token and capability-icon rendering tests**

In `skill-token.spec.tsx`, mock or use the real mapping and add assertions that:

```ts
const { container } = render(<SkillToken label="AWS CodePipeline" />);

const image = container.querySelector('img');
expect(image).toHaveAttribute('aria-hidden', 'true');
expect(image).toHaveAttribute('src', expect.stringMatching(/assets\/.*\.svg/));
expect(image).toHaveAttribute('alt', '');
```

Retain the existing inline `<svg>` assertion for a Simple Icons skill and the no-icon assertion for an unknown skill.

In `capability-evidence.spec.tsx`, add one `type: 'skill'` case for `AWS CodePipeline` and one for `Kustomize`. Assert both render a `skill-token`, the AWS case contains a decorative `img`, and the Kustomize case contains a decorative inline `svg` rather than a fallback Heroicon.

- [ ] **Step 7: Run the rendering tests and verify they fail**

Run:

```bash
../../node_modules/.bin/vitest run --config apps/github.io/vite.config.ts skill-token.spec.tsx capability-evidence.spec.tsx
```

Expected: FAIL because image-only brands are currently treated as missing icons.

- [ ] **Step 8: Render both icon representations**

In `skill-token.tsx`, import `hasSkillBrandIcon`, change `tokenStyle` and `hasIcon` to use it, and choose the icon node as follows:

```tsx
const icon = brand?.iconPath ? (
  <svg
    aria-hidden="true"
    {...stylex.props(styles.icon)}
    focusable="false"
    viewBox="0 0 24 24"
  >
    <path d={brand.iconPath} fill="currentColor" />
  </svg>
) : brand?.iconDataUrl ? (
  <img
    alt=""
    aria-hidden="true"
    {...stylex.props(styles.icon)}
    src={brand.iconDataUrl}
  />
) : undefined;
```

Pass `icon={icon}` to `Token`. Do not apply `currentColor` or a path fill to the image asset.

In `capability-evidence-icon.tsx`, import and use `hasSkillBrandIcon` in `firstKnownTechnologyBrand`, the Udemy lookup, and GitHub lookup. In `renderCapabilityEvidenceIcon`, retain the current inline SVG branch when `iconPath` exists, then render this image branch:

```tsx
if (iconData.brand.iconDataUrl) {
  return (
    <img
      alt=""
      aria-hidden="true"
      {...stylex.props(styles.brandIcon)}
      src={iconData.brand.iconDataUrl}
    />
  );
}
```

Keep `getCapabilityEvidenceCitationIcon` returning `iconDataUrl`, so both generated Simple Icons data URLs and bundled SVG URLs remain valid citation icon sources.

- [ ] **Step 9: Run all icon tests and verify they pass**

Run:

```bash
../../node_modules/.bin/vitest run --config apps/github.io/vite.config.ts skill-brand.spec.ts skill-token.spec.tsx capability-evidence.spec.tsx
```

Expected: PASS for brand resolution, both rendering variants, existing generic fallbacks, and capability skill tokens.

- [ ] **Step 10: Commit the icon assets and renderer**

```bash
git diff --check
git add apps/github.io/src/assets/skills/aws/aws-codepipeline.svg apps/github.io/src/assets/skills/aws/aws-codebuild.svg apps/github.io/src/assets/skills/aws/amazon-ecr.svg apps/github.io/src/assets/skills/aws/aws-systems-manager.svg apps/github.io/src/assets/skills/README.md apps/github.io/src/app/skills/skill-brand.ts apps/github.io/src/app/skills/skill-brand.spec.ts apps/github.io/src/app/skills/skill-token.tsx apps/github.io/src/app/skills/skill-token.spec.tsx apps/github.io/src/app/devops-capability-evidence/capability-evidence-icon.tsx apps/github.io/src/app/devops-capability-evidence/capability-evidence.spec.tsx
git diff --cached --check
git commit -m "feat(github.io): render official CI skill icons"
```

### Task 4: Lock The Story Contract And Verify Responsive Rendering

**Files:**
- Modify: `apps/github.io/src/app/devops-capability-evidence/dora-capability-card.stories.spec.ts`
- Modify if an assertion needs alignment: `apps/github.io/src/app/devops-capability-evidence/dora-capability-card.spec.tsx`

**Interfaces:**
- Consumes: the shared production evidence catalog, CI score, semantic rows, and icon mappings from Tasks 1-3.
- Produces: regression coverage for the exact five applied labels followed by thirteen skill labels, plus verification evidence for phone/iPad wrapping and production builds.

- [ ] **Step 1: Write the failing exact story-selection assertion**

Replace the top-five-only assertion in `dora-capability-card.stories.spec.ts` with:

```ts
it('resolves the approved Continuous Integration evidence and skills', () => {
  const score = curatedDevOpsCapabilityRadarScores.find(
    (entry) => entry.capabilityKey === 'continuous-integration',
  );
  const selected = score?.evidenceIds.map((id) =>
    devOpsCapabilityEvidenceItems.find((item) => item.id === id),
  );

  expect(selected?.slice(0, 5).map((item) => item?.label)).toEqual([
    'Terraform pipelines',
    'CodeBuild PR gates',
    'Nx affected',
    'GitOps handoff',
    'Tag reliability',
  ]);
  expect(selected?.slice(5).map((item) => item?.title)).toEqual([
    'Terraform',
    'AWS CodePipeline',
    'AWS CodeBuild',
    'Amazon ECR',
    'GitHub',
    'AWS Systems Manager Parameter Store',
    'Docker',
    'Nx',
    'GitHub Actions',
    'OpenID Connect',
    'Kustomize',
    'Helm',
    'Argo CD',
  ]);
});
```

- [ ] **Step 2: Run the story and card tests**

Run:

```bash
../../node_modules/.bin/vitest run --config apps/github.io/vite.config.ts dora-capability-card.stories.spec.ts dora-capability-card.spec.tsx
```

Expected: PASS after Tasks 1-3. If it fails, correct the production data or shared rendering path rather than adding story-only evidence args.

- [ ] **Step 3: Run the focused DORA evidence suite**

Run:

```bash
../../node_modules/.bin/vitest run --config apps/github.io/vite.config.ts continuous-integration-evidence.data.spec.ts continuous-integration-skill-evidence.data.spec.ts devops-capability-evidence.spec.ts dora-capability-card.evidence.spec.ts dora-capability-card.spec.tsx dora-capability-card.stories.spec.ts capability-evidence.spec.tsx
```

Expected: PASS with 18 experience records, 13 skill records, globally valid references, semantic groups, and exact story selection.

- [ ] **Step 4: Run the spec TypeScript check**

Run:

```bash
../../node_modules/.bin/tsc -p apps/github.io/tsconfig.spec.json --noEmit --pretty false
```

Expected: no feature-introduced error. Seven previously documented unrelated errors may remain; compare any output to the pre-task baseline and fix every error in files changed by this plan.

- [ ] **Step 5: Run the full app verification**

Run each command independently:

```bash
NX_DAEMON=false ../../node_modules/.bin/nx test github.io --skip-nx-cache
NX_DAEMON=false ../../node_modules/.bin/nx lint github.io --skip-nx-cache
NX_DAEMON=false ../../node_modules/.bin/nx build github.io --skip-nx-cache
NX_DAEMON=false ../../node_modules/.bin/nx build-storybook github.io --skip-nx-cache
```

Expected: all four commands exit `0`.

- [ ] **Step 6: Perform phone and iPad Storybook QA**

Start Storybook on a free Tailscale-reachable interface:

```bash
NX_DAEMON=false ../../node_modules/.bin/nx storybook github.io --host 0.0.0.0 --port 6008
```

Open the Continuous Integration card story at widths `390x844` and `768x1024`. Verify:

- the five gray applied-evidence tokens remain the first row;
- the thirteen skill tokens form the second row;
- AWS icons retain their full color and are not recolored by `currentColor`;
- Kustomize shows the Kubernetes mark;
- both rows wrap within the card with no horizontal overflow;
- the long Parameter Store token remains within the card and does not overlap another token;
- no visible row heading, hover card, or click affordance was added; and
- Astryx row/token gaps remain unchanged.

Stop only the Storybook process started by this task. Remove any generated debug log and revert only temporary Nx daemon/plugin changes caused by Storybook startup if they are uncommitted and were not part of the feature.

- [ ] **Step 7: Commit the Storybook contract**

```bash
git diff --check
git add apps/github.io/src/app/devops-capability-evidence/dora-capability-card.stories.spec.ts
git diff --cached --check
git commit -m "test(github.io): lock CI skill evidence story"
```

- [ ] **Step 8: Request final review and prepare the handoff gate**

Run `superpowers:requesting-code-review` against the complete branch diff. Resolve valid findings with focused tests and separate conventional commits. Then run `superpowers:verification-before-completion`, report the exact verification results and any unchanged pre-existing TypeScript errors, and stop in the repository's awaiting-handoff state without pushing, merging, or deploying.
