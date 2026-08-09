# DORA Capability Experience Summaries Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add action-oriented supplemental experience summaries to the Continuous Integration and Continuous Delivery cards and replace four terse CI experience labels with the approved three- or four-word copy.

**Architecture:** Keep the existing atomic evidence catalog and score-owned `evidenceSummary` model. Store the four changed labels on their existing CI evidence records, add or replace the two summaries on the existing curated scores, and rely on the current resolver and card renderer to project that data into production and Storybook. Update focused data, resolver, component, and Storybook tests to lock the exact copy, accessibility names, selection order, counts, and summary omission behavior.

**Tech Stack:** TypeScript, React 19, Astryx Design, Vitest, Testing Library, Storybook 10, Nx, pnpm.

## Global Constraints

- Preserve the generic DORA capability descriptions; the new copy is supplemental experience context.
- Use the exact approved CI summary: `Built and evolved CI from reusable AWS CodePipeline and CodeBuild pipelines to monorepo GitHub Actions, with affected quality gates and immutable artifacts.`
- Use the exact approved CD summary: `Built approval-gated and GitOps delivery across AWS CodePipeline and GitHub Actions, with immutable artifacts, automated migrations, and reliable Kubernetes reconciliation.`
- Keep the five CI and five CD experience IDs, their explicit order, strongest evidence IDs, 4/5 scores, evidence counts, skill IDs, skill order, and supporting-evidence relationships unchanged.
- Change only the four approved CI labels; preserve every evidence ID, title, summary, metric, fact, limitation, technology, initiative, date, and capability mapping.
- Do not add private repository, project, service, workflow, module, image, organization, customer, architecture, URL, account, parameter-path, or proof-link identifiers.
- Keep public technology names exact.
- Preserve the existing card API, renderer, row labels, semantics, styling, spacing, dimensions, token variants, and logos.
- Commit each logical task separately using explicit paths only.

## File Structure

- Modify `apps/github.io/src/app/devops-capability-evidence/continuous-integration-evidence.data.ts`: own the four revised atomic CI evidence labels.
- Modify `apps/github.io/src/app/devops-capability-evidence/continuous-integration-evidence.data.spec.ts`: assert exact stored labels, unchanged titles, and existing privacy invariants.
- Modify `apps/github.io/src/app/devops-capability-evidence/devops-capability-evidence.data.ts`: own the CI and CD score summaries.
- Modify `apps/github.io/src/app/devops-capability-evidence/devops-capability-evidence.spec.ts`: assert exact summaries plus unchanged projections, counts, scores, and strongest evidence.
- Modify `apps/github.io/src/app/devops-capability-evidence/dora-capability-card.evidence.spec.ts`: assert resolver output for both summaries and omission for an unsummarized capability.
- Modify `apps/github.io/src/app/devops-capability-evidence/dora-capability-card.spec.tsx`: assert rendered summaries, CI accessible experience names, row counts, and summary omission.
- Modify `apps/github.io/src/app/devops-capability-evidence/dora-capability-card.stories.spec.ts`: assert Storybook resolves the exact five CI display labels from shared production data.
- Do not modify `dora-capability-card.tsx`, `dora-capability-card.evidence.ts`, `dora-capability-card.stories.tsx`, shared types, or styles; their current interfaces already support this feature.

---

### Task 1: Store Approved Labels And Score Summaries

**Files:**

- Modify: `apps/github.io/src/app/devops-capability-evidence/continuous-integration-evidence.data.spec.ts`
- Modify: `apps/github.io/src/app/devops-capability-evidence/devops-capability-evidence.spec.ts`
- Modify: `apps/github.io/src/app/devops-capability-evidence/continuous-integration-evidence.data.ts`
- Modify: `apps/github.io/src/app/devops-capability-evidence/devops-capability-evidence.data.ts`

**Interfaces:**

- Consumes: existing `CapabilityEvidenceItem.label` and optional `DoraCapabilityScore.evidenceSummary` fields.
- Produces: four revised labels in `continuousIntegrationEvidenceItems` and exact CI/CD summaries in `curatedDevOpsCapabilityRadarScores`.

- [ ] **Step 1: Add failing atomic-label assertions**

Add this test to `continuous-integration-evidence.data.spec.ts` before the shared GitOps terminology test:

```ts
it('stores the approved compact-card labels without changing record titles', () => {
  expect(
    [
      'terraform-codepipeline-platform',
      'codebuild-pr-gates',
      'nx-affected-quality-gates',
      'github-actions-gitops-handoff',
      'kustomize-tag-update-reliability',
    ].map((id) => {
      const item = byId.get(id);
      return [item?.id, item?.label, item?.title];
    }),
  ).toEqual([
    [
      'terraform-codepipeline-platform',
      'Reusable Terraform CI pipelines',
      'Reusable Terraform delivery platform',
    ],
    [
      'codebuild-pr-gates',
      'Automated pull-request test gates',
      'Pull-request test gates with AWS CodeBuild',
    ],
    [
      'nx-affected-quality-gates',
      'Affected-change quality gates',
      'Nx affected quality gates',
    ],
    [
      'github-actions-gitops-handoff',
      'Automated deployment process',
      'Automated deployment process',
    ],
    [
      'kustomize-tag-update-reliability',
      'Reliable Kustomize tag updates',
      'Reliable Kustomize batch tag updates',
    ],
  ]);
});
```

- [ ] **Step 2: Add failing score-summary assertions**

In `devops-capability-evidence.spec.ts`, extend the existing CI curation test with:

```ts
expect(score).toMatchObject({
  score: 4,
  maxScore: 5,
  strongestEvidenceId: 'terraform-codepipeline-platform',
  evidenceCounts: { experience: 5, skill: 13 },
  evidenceSummary:
    'Built and evolved CI from reusable AWS CodePipeline and CodeBuild pipelines to monorepo GitHub Actions, with affected quality gates and immutable artifacts.',
});
```

Replace the CD test's duration-only `evidenceSummary` expectation with:

```ts
evidenceSummary:
  'Built approval-gated and GitOps delivery across AWS CodePipeline and GitHub Actions, with immutable artifacts, automated migrations, and reliable Kubernetes reconciliation.',
```

Keep all existing exact evidence-ID, order, skill-order, score, count, and strongest-evidence assertions.

- [ ] **Step 3: Run the focused tests and verify RED**

Run:

```bash
pnpm nx test github.io -- --run \
  src/app/devops-capability-evidence/continuous-integration-evidence.data.spec.ts \
  src/app/devops-capability-evidence/devops-capability-evidence.spec.ts
```

Expected: FAIL because the four catalog labels still contain their old values, CI has no summary, and CD still has `7+ years across two delivery platforms`.

- [ ] **Step 4: Apply the minimal catalog label changes**

In `continuous-integration-evidence.data.ts`, make only these replacements:

```ts
// terraform-codepipeline-platform
label: 'Reusable Terraform CI pipelines',

// codebuild-pr-gates
label: 'Automated pull-request test gates',

// nx-affected-quality-gates
label: 'Affected-change quality gates',

// kustomize-tag-update-reliability
label: 'Reliable Kustomize tag updates',
```

Leave `github-actions-gitops-handoff` as `Automated deployment process`.

- [ ] **Step 5: Add and replace the score-owned summaries**

In the `continuous-integration` score in `devops-capability-evidence.data.ts`, add:

```ts
evidenceSummary:
  'Built and evolved CI from reusable AWS CodePipeline and CodeBuild pipelines to monorepo GitHub Actions, with affected quality gates and immutable artifacts.',
```

In the `continuous-delivery` score, replace the duration-only summary with:

```ts
evidenceSummary:
  'Built approval-gated and GitOps delivery across AWS CodePipeline and GitHub Actions, with immutable artifacts, automated migrations, and reliable Kubernetes reconciliation.',
```

- [ ] **Step 6: Run focused data tests and verify GREEN**

Run:

```bash
pnpm nx test github.io -- --run \
  src/app/devops-capability-evidence/continuous-integration-evidence.data.spec.ts \
  src/app/devops-capability-evidence/devops-capability-evidence.spec.ts
```

Expected: PASS. The existing privacy test must also pass, confirming the revised public text contains no blocked identifiers.

- [ ] **Step 7: Inspect and commit the data slice**

Run:

```bash
git diff --check
git diff -- \
  apps/github.io/src/app/devops-capability-evidence/continuous-integration-evidence.data.ts \
  apps/github.io/src/app/devops-capability-evidence/continuous-integration-evidence.data.spec.ts \
  apps/github.io/src/app/devops-capability-evidence/devops-capability-evidence.data.ts \
  apps/github.io/src/app/devops-capability-evidence/devops-capability-evidence.spec.ts
git add \
  apps/github.io/src/app/devops-capability-evidence/continuous-integration-evidence.data.ts \
  apps/github.io/src/app/devops-capability-evidence/continuous-integration-evidence.data.spec.ts \
  apps/github.io/src/app/devops-capability-evidence/devops-capability-evidence.data.ts \
  apps/github.io/src/app/devops-capability-evidence/devops-capability-evidence.spec.ts
git diff --cached
git commit -m "feat(github.io): summarize DORA capability experience"
```

Expected: one commit containing only the four catalog/test files above.

---

### Task 2: Lock Resolver, Accessibility, And Storybook Contracts

**Files:**

- Modify: `apps/github.io/src/app/devops-capability-evidence/dora-capability-card.evidence.spec.ts`
- Modify: `apps/github.io/src/app/devops-capability-evidence/dora-capability-card.spec.tsx`
- Modify: `apps/github.io/src/app/devops-capability-evidence/dora-capability-card.stories.spec.ts`

**Interfaces:**

- Consumes: the Task 1 `DoraCapabilityScore.evidenceSummary` values and revised `CapabilityEvidenceItem.label` values.
- Produces: exact regression contracts for resolver output, rendered supporting copy, accessible token names, summary omission, and Storybook projection.

- [ ] **Step 1: Run the presentation tests and verify the old contracts fail**

Run:

```bash
pnpm nx test github.io -- --run \
  src/app/devops-capability-evidence/dora-capability-card.evidence.spec.ts \
  src/app/devops-capability-evidence/dora-capability-card.spec.tsx \
  src/app/devops-capability-evidence/dora-capability-card.stories.spec.ts
```

Expected: FAIL because the tests still expect the CD duration summary, no CI summary, and the old CI labels.

- [ ] **Step 2: Assert both score-owned resolver summaries**

Replace the summary tests in `dora-capability-card.evidence.spec.ts` with:

```ts
it.each([
  [
    'continuous-integration',
    'Built and evolved CI from reusable AWS CodePipeline and CodeBuild pipelines to monorepo GitHub Actions, with affected quality gates and immutable artifacts.',
  ],
  [
    'continuous-delivery',
    'Built approval-gated and GitOps delivery across AWS CodePipeline and GitHub Actions, with immutable artifacts, automated migrations, and reliable Kubernetes reconciliation.',
  ],
] as const)('returns the score-owned %s evidence summary', (key, summary) => {
  expect(
    getDoraCapabilityCardEvidenceSummary(
      key,
      curatedDevOpsCapabilityRadarScores,
    ),
  ).toBe(summary);
});

it('returns undefined when the capability or score collection has no summary', () => {
  expect(
    getDoraCapabilityCardEvidenceSummary(
      'flexible-infrastructure',
      curatedDevOpsCapabilityRadarScores,
    ),
  ).toBeUndefined();
  expect(
    getDoraCapabilityCardEvidenceSummary('continuous-delivery', undefined),
  ).toBeUndefined();
});
```

- [ ] **Step 3: Assert both rendered summaries and omission behavior**

In `dora-capability-card.spec.tsx`, replace the old CD-only summary test with a parameterized test that renders CI and CD and asserts the exact summary appears as a `SPAN`:

```ts
it.each([
  [
    continuousIntegration,
    doraCapabilityDescriptions['continuous-integration'],
    'Built and evolved CI from reusable AWS CodePipeline and CodeBuild pipelines to monorepo GitHub Actions, with affected quality gates and immutable artifacts.',
  ],
  [
    continuousDelivery,
    doraCapabilityDescriptions['continuous-delivery'],
    'Built approval-gated and GitOps delivery across AWS CodePipeline and GitHub Actions, with immutable artifacts, automated migrations, and reliable Kubernetes reconciliation.',
  ],
] as const)(
  'renders the %s experience summary as supporting context',
  (capability, description, text) => {
    render(
      <DoraCapabilityCard
        capability={capability}
        description={description}
        evidence={devOpsCapabilityEvidenceItems}
        scores={curatedDevOpsCapabilityRadarScores}
      />,
    );

    expect(screen.getByText(text).tagName).toBe('SPAN');
  },
);
```

Update the no-summary test to render `flexibleInfrastructure` and assert neither approved summary is present. Do not use CI for this assertion because CI now intentionally has a summary.

- [ ] **Step 4: Update CI accessible token-name expectations**

In the existing `uses curated score order within each evidence group` test, keep the five-experience and 13-skill counts, group order, and row names. Replace only the expected accessible group names with:

```ts
[
  'Experience evidence: Reusable Terraform CI pipelines',
  'Experience evidence: Automated pull-request test gates',
  'Experience evidence: Affected-change quality gates',
  'Experience evidence: Automated deployment process',
  'Experience evidence: Reliable Kustomize tag updates',
];
```

- [ ] **Step 5: Update the Storybook production projection contract**

In `dora-capability-card.stories.spec.ts`, replace only the five expected CI labels with:

```ts
[
  'Reusable Terraform CI pipelines',
  'Automated pull-request test gates',
  'Affected-change quality gates',
  'Automated deployment process',
  'Reliable Kustomize tag updates',
];
```

Keep the shared-data identity assertions and the exact 13-skill order unchanged.

- [ ] **Step 6: Run presentation tests and verify GREEN**

Run:

```bash
pnpm nx test github.io -- --run \
  src/app/devops-capability-evidence/dora-capability-card.evidence.spec.ts \
  src/app/devops-capability-evidence/dora-capability-card.spec.tsx \
  src/app/devops-capability-evidence/dora-capability-card.stories.spec.ts
```

Expected: PASS with exact CI/CD summaries, exact CI labels, five/13 CI rows, five/14 CD rows, accessible token names, and omission for Flexible Infrastructure.

- [ ] **Step 7: Inspect and commit the presentation contract slice**

Run:

```bash
git diff --check
git diff -- \
  apps/github.io/src/app/devops-capability-evidence/dora-capability-card.evidence.spec.ts \
  apps/github.io/src/app/devops-capability-evidence/dora-capability-card.spec.tsx \
  apps/github.io/src/app/devops-capability-evidence/dora-capability-card.stories.spec.ts
git add \
  apps/github.io/src/app/devops-capability-evidence/dora-capability-card.evidence.spec.ts \
  apps/github.io/src/app/devops-capability-evidence/dora-capability-card.spec.tsx \
  apps/github.io/src/app/devops-capability-evidence/dora-capability-card.stories.spec.ts
git diff --cached
git commit -m "test(github.io): cover DORA experience summaries"
```

Expected: one test-only commit containing exactly the three contract files above.

---

### Task 3: Complete Verification And Responsive Storybook QA

**Files:**

- Verify only; no planned source changes.

**Interfaces:**

- Consumes: the complete Task 1 and Task 2 implementation.
- Produces: automated verification evidence plus phone and iPad visual approval for the CI and CD stories.

- [ ] **Step 1: Run the complete application test suite**

Run:

```bash
pnpm nx test github.io -- --run
```

Expected: every `github.io` Vitest file passes, including data privacy, exact catalog, projection, resolver, accessibility, and Storybook contracts.

- [ ] **Step 2: Run lint and production builds**

Run each command independently:

```bash
pnpm nx lint github.io
pnpm nx build github.io
pnpm nx build-storybook github.io
```

Expected: all three commands exit successfully with no lint errors, TypeScript/build errors, or Storybook build errors.

- [ ] **Step 3: Verify the final diff and repository state**

Run:

```bash
git diff --check
git status --short --branch
git diff HEAD~2..HEAD -- \
  apps/github.io/src/app/devops-capability-evidence/continuous-integration-evidence.data.ts \
  apps/github.io/src/app/devops-capability-evidence/continuous-integration-evidence.data.spec.ts \
  apps/github.io/src/app/devops-capability-evidence/devops-capability-evidence.data.ts \
  apps/github.io/src/app/devops-capability-evidence/devops-capability-evidence.spec.ts \
  apps/github.io/src/app/devops-capability-evidence/dora-capability-card.evidence.spec.ts \
  apps/github.io/src/app/devops-capability-evidence/dora-capability-card.spec.tsx \
  apps/github.io/src/app/devops-capability-evidence/dora-capability-card.stories.spec.ts
```

Expected: no whitespace errors or uncommitted implementation changes; the diff contains only the two summaries, four CI labels, and their contract tests. Confirm no evidence IDs, titles, detailed content, skill records, card implementation, types, or styles changed.

- [ ] **Step 4: Serve Storybook over Tailscale**

Reuse the existing Storybook server on port `6009` if it responds. Otherwise run:

```bash
pnpm nx storybook github.io -- --host 0.0.0.0 --port 6009 --no-open
```

Verify both story endpoints return HTTP 200:

```text
http://TAILSCALE_IP:6009/iframe.html?id=github-io-devops-capability-evidence-dora-capability-card--continuous-integration&viewMode=story
http://TAILSCALE_IP:6009/iframe.html?id=github-io-devops-capability-evidence-dora-capability-card--continuous-delivery&viewMode=story
```

- [ ] **Step 5: Perform phone and iPad visual QA**

Inspect both stories at `390x844` phone and `768x1024` iPad portrait viewports. Confirm:

- the generic DORA description remains visible above the supplemental summary;
- each summary wraps naturally without clipping or horizontal overflow;
- `Relevant experience` and `Technical skills` remain visually distinct;
- all five experience tokens remain readable and wrap without overlap;
- CI shows 13 skill tokens and CD shows 14 skill tokens in the existing order;
- token surfaces, brand-colored logos, row gaps, card dimensions, and typography remain unchanged;
- no content obscures subsequent rows at either viewport.

Record the user-approved iPad result in the implementation handoff. Do not claim responsive approval until the user has inspected the Tailscale Storybook stories.

- [ ] **Step 6: Report the verified result**

Report both commits, focused and complete command results, Storybook URLs, and the manual QA status. If any command or viewport check fails, keep the branch in implementation state and resolve the issue before requesting review.
