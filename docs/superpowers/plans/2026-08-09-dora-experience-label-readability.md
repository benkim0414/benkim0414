# Continuous Delivery Experience Label Readability Implementation Plan

> **For Codex:** REQUIRED SUB-SKILL: Use `superpowers:subagent-driven-development` to execute this plan task by task.

**Goal:** Replace the five compact Continuous Delivery experience labels with the approved three- or four-word wording while preserving all evidence data, projections, accessibility structure, and styling.

**Architecture:** Keep labels as explicit fields on the existing atomic evidence records. Update exact data, Storybook, and accessible-name assertions before changing production values. Do not add runtime shortening logic or modify rendering components.

**Tech Stack:** TypeScript, React, Vitest, Testing Library, Nx, pnpm, Storybook, Astryx Design.

**Design:** `docs/superpowers/specs/2026-08-09-dora-experience-label-readability-design.md`

## Global Constraints

- Change only the five approved `label` values and assertions that consume them.
- Preserve every evidence ID, title, summary, capability mapping, strength, technology, metric, fact, limitation, initiative, and date.
- Preserve the Continuous Delivery projection: five experiences in the existing order followed by 14 skills.
- Preserve the Continuous Integration projection IDs, order, count, skills, and score; only its shared deployment-process label changes.
- Do not change components, spacing, typography, wrapping, card dimensions, token variants, or logo behavior.
- Do not globally replace matching words inside titles, facts, summaries, or unrelated records.
- Retain all public-data privacy rules from the parent Continuous Delivery design.

### Task 1: Update Explicit Experience Labels And Regressions

**Files:**

- Modify: `apps/github.io/src/app/devops-capability-evidence/continuous-delivery-evidence.data.ts`
- Modify: `apps/github.io/src/app/devops-capability-evidence/continuous-integration-evidence.data.ts`
- Modify: `apps/github.io/src/app/devops-capability-evidence/continuous-delivery-evidence.data.spec.ts`
- Modify: `apps/github.io/src/app/devops-capability-evidence/continuous-integration-evidence.data.spec.ts`
- Modify: `apps/github.io/src/app/devops-capability-evidence/dora-capability-card.stories.spec.ts`
- Modify: `apps/github.io/src/app/devops-capability-evidence/dora-capability-card.spec.tsx`

**Interfaces:**

- Consumes: existing `CapabilityEvidenceItem.label` values and the shared `github-actions-gitops-handoff` record.
- Produces: the five exact approved display labels, with existing IDs and projections unchanged.
- Preserves: every source field except the five `label` strings; all card component APIs and markup.

- [ ] **Step 1: Add the exact failing Continuous Delivery label assertion**

In `continuous-delivery-evidence.data.spec.ts`, add this constant beside the existing exact ID and title constants:

```ts
const expectedLabels = [
  'Approval-gated deployment automation',
  'Version-controlled environment state',
  'Same package across environments',
  'Automated database migrations',
  'Reliable migrations',
  'Production artifacts',
  'Encrypted configuration',
  'Reliable deployment',
  'Independent deployment',
  'Small batches',
  'Deployment health',
  'Failure notification',
] as const;
```

Add this assertion to the exact catalog test:

```ts
expect(continuousDeliveryEvidenceItems.map((item) => item.label)).toEqual(
  expectedLabels,
);
```

Only four of these twelve labels change. The remaining eight values lock the complete catalog against incidental wording churn.

- [ ] **Step 2: Update failing shared CI and compact-card expectations**

In `continuous-integration-evidence.data.spec.ts`, change the shared record expectation to:

```ts
expect(byId.get('github-actions-gitops-handoff')).toMatchObject({
  label: 'Automated deployment process',
  title: 'Automated deployment process',
  capabilityKeys: ['continuous-integration', 'continuous-delivery'],
});
```

In `dora-capability-card.stories.spec.ts`, update the CI experience list's fourth label to:

```ts
'Automated deployment process';
```

Update the Continuous Delivery experience list to exactly:

```ts
[
  'Approval-gated deployment automation',
  'Automated deployment process',
  'Version-controlled environment state',
  'Same package across environments',
  'Automated database migrations',
];
```

In `dora-capability-card.spec.tsx`, update the Continuous Delivery accessible token names to exactly:

```ts
[
  'Experience evidence: Approval-gated deployment automation',
  'Experience evidence: Automated deployment process',
  'Experience evidence: Version-controlled environment state',
  'Experience evidence: Same package across environments',
  'Experience evidence: Automated database migrations',
];
```

Update only the shared CI accessible token name to:

```ts
'Experience evidence: Automated deployment process';
```

- [ ] **Step 3: Run the focused tests to verify the new wording fails**

```bash
NX_DAEMON=false pnpm exec vitest run \
  apps/github.io/src/app/devops-capability-evidence/continuous-delivery-evidence.data.spec.ts \
  apps/github.io/src/app/devops-capability-evidence/continuous-integration-evidence.data.spec.ts \
  apps/github.io/src/app/devops-capability-evidence/dora-capability-card.stories.spec.ts \
  apps/github.io/src/app/devops-capability-evidence/dora-capability-card.spec.tsx
```

Expected: FAIL with old labels such as `Approval-gated automation`, `Deployment automation`, `Environment state`, `Same package`, and `Database migrations` received where the new values are expected.

- [ ] **Step 4: Update only the five production label fields**

In `continuous-delivery-evidence.data.ts`, use these exact label assignments:

```ts
// codepipeline-approval-gated-deployment
label: 'Approval-gated deployment automation',

// argocd-environment-state-from-version-control
label: 'Version-controlled environment state',

// gitops-same-package-environments
label: 'Same package across environments',

// argocd-automated-database-migrations
label: 'Automated database migrations',
```

In `continuous-integration-evidence.data.ts`, update only the shared record:

```ts
// github-actions-gitops-handoff
label: 'Automated deployment process',
```

Do not change the shared record's already matching title. Do not replace `Deployment automation` inside limitation facts or other evidence titles.

- [ ] **Step 5: Run focused tests and formatting checks**

```bash
NX_DAEMON=false pnpm exec vitest run \
  apps/github.io/src/app/devops-capability-evidence/continuous-delivery-evidence.data.spec.ts \
  apps/github.io/src/app/devops-capability-evidence/continuous-integration-evidence.data.spec.ts \
  apps/github.io/src/app/devops-capability-evidence/dora-capability-card.stories.spec.ts \
  apps/github.io/src/app/devops-capability-evidence/dora-capability-card.spec.tsx
pnpm prettier --check \
  apps/github.io/src/app/devops-capability-evidence/continuous-delivery-evidence.data.ts \
  apps/github.io/src/app/devops-capability-evidence/continuous-integration-evidence.data.ts \
  apps/github.io/src/app/devops-capability-evidence/continuous-delivery-evidence.data.spec.ts \
  apps/github.io/src/app/devops-capability-evidence/continuous-integration-evidence.data.spec.ts \
  apps/github.io/src/app/devops-capability-evidence/dora-capability-card.stories.spec.ts \
  apps/github.io/src/app/devops-capability-evidence/dora-capability-card.spec.tsx
git diff --check
```

Expected: all focused tests and checks PASS.

- [ ] **Step 6: Inspect and commit the label change**

```bash
git diff -- \
  apps/github.io/src/app/devops-capability-evidence/continuous-delivery-evidence.data.ts \
  apps/github.io/src/app/devops-capability-evidence/continuous-integration-evidence.data.ts \
  apps/github.io/src/app/devops-capability-evidence/continuous-delivery-evidence.data.spec.ts \
  apps/github.io/src/app/devops-capability-evidence/continuous-integration-evidence.data.spec.ts \
  apps/github.io/src/app/devops-capability-evidence/dora-capability-card.stories.spec.ts \
  apps/github.io/src/app/devops-capability-evidence/dora-capability-card.spec.tsx
git add \
  apps/github.io/src/app/devops-capability-evidence/continuous-delivery-evidence.data.ts \
  apps/github.io/src/app/devops-capability-evidence/continuous-integration-evidence.data.ts \
  apps/github.io/src/app/devops-capability-evidence/continuous-delivery-evidence.data.spec.ts \
  apps/github.io/src/app/devops-capability-evidence/continuous-integration-evidence.data.spec.ts \
  apps/github.io/src/app/devops-capability-evidence/dora-capability-card.stories.spec.ts \
  apps/github.io/src/app/devops-capability-evidence/dora-capability-card.spec.tsx
git diff --cached
git diff --cached --check
git commit -m "feat(github.io): clarify experience evidence labels"
```

### Task 2: Run Full Validation And Refresh Manual Storybook QA

**Files:**

- Verify: `apps/github.io/src/app/devops-capability-evidence/`
- Verify: `apps/github.io/src/app/skills/`
- Verify: `apps/github.io/src/assets/skills/`
- Verify: `apps/github.io/.storybook/`
- Expected source changes: none

**Interfaces:**

- Consumes: Task 1's five label values and the existing Tailscale-accessible Continuous Delivery Storybook story.
- Produces: complete automated verification evidence and manual iPad approval of the updated wrapping.
- Preserves: a clean worktree; no empty verification commit.

- [ ] **Step 1: Run complete automated validation**

Run each command separately and require exit code 0:

```bash
NX_DAEMON=false pnpm nx test github.io --skip-nx-cache
NX_DAEMON=false pnpm nx lint github.io --skip-nx-cache
NX_DAEMON=false pnpm nx build github.io --skip-nx-cache
NX_DAEMON=false pnpm nx build-storybook github.io --skip-nx-cache
```

Expected: all four commands PASS. Record test totals, build module totals, and only pre-existing accepted warnings.

- [ ] **Step 2: Re-run exact projection and privacy contracts**

```bash
NX_DAEMON=false pnpm exec vitest run --reporter=verbose \
  apps/github.io/src/app/devops-capability-evidence/continuous-delivery-evidence.data.spec.ts \
  apps/github.io/src/app/devops-capability-evidence/continuous-delivery-skill-evidence.data.spec.ts \
  apps/github.io/src/app/devops-capability-evidence/continuous-integration-evidence.data.spec.ts \
  apps/github.io/src/app/devops-capability-evidence/devops-capability-evidence.spec.ts \
  apps/github.io/src/app/devops-capability-evidence/dora-capability-card.stories.spec.ts \
  apps/github.io/src/app/devops-capability-evidence/dora-capability-card.spec.tsx \
  apps/github.io/src/app/skills/skill-brand.spec.ts
```

Expected: PASS. Confirm 17 unique Continuous Delivery experiences, 14 ordered skills, five selected experiences, exact new labels, valid support IDs, and public-data assertions.

- [ ] **Step 3: Refresh the running Storybook and verify its endpoint**

Use the existing Storybook server on port 6009 when it is still healthy. Otherwise start it with:

```bash
NX_DAEMON=false pnpm nx storybook github.io --host 0.0.0.0 --port 6009
```

Verify the direct story returns HTTP 200:

```text
http://TAILSCALE_IP:6009/iframe.html?id=github-io-devops-capability-evidence-dora-capability-card--continuous-delivery&viewMode=story
```

- [ ] **Step 4: Record manual iPad responsive approval**

Ask the user to inspect the refreshed direct story on iPad. Require confirmation that:

- all five Experience tokens show the approved wording;
- token text wraps naturally without clipping or horizontal overflow;
- the Experience and Skills rows retain clear separation and hierarchy;
- skill logos load without shifting row height;
- the card remains fully visible and centered.

If the user reports a defect, add a focused regression test, implement the smallest correction, rerun Steps 1-3, and create a separate conventional commit for that fix. If the user approves, record the approval in the SDD report and create no verification commit.

- [ ] **Step 5: Verify final repository state**

```bash
git diff --check
git status --short --branch
git log -6 --oneline
```

Expected: clean worktree on `feat/dora-continuous-delivery-evidence`; no empty validation commit and no push, merge, or deployment.

## Completion Criteria

- All five compact experience labels exactly match the approved wording.
- The five experience IDs/order and 14 skills remain unchanged.
- The shared CI record uses `Automated deployment process` without other CI projection drift.
- Focused and complete automated checks pass.
- The refreshed Storybook endpoint responds over Tailscale.
- The user approves iPad wrapping and hierarchy after the label update.
- The worktree is clean and all changes are committed locally.
