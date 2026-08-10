# Recruiter-Friendly DORA Evidence Row Labels Implementation Plan

> **For Codex:** REQUIRED SUB-SKILL: Use `superpowers:subagent-driven-development` to execute this plan task by task.

**Goal:** Replace the shared DORA card row labels `Experience` and `Skills` with the recruiter-familiar, capability-neutral labels `Relevant experience` and `Technical skills`.

**Architecture:** Update the existing `visibleEvidenceGroupLabels` map once so every DORA capability card inherits the new visible and accessible list names. Lock the behavior in the shared card component suite across Continuous Delivery, Continuous Integration, mixed evidence groups, and scoreless fallback rendering.

**Tech Stack:** TypeScript, React, Vitest, Testing Library, Nx, pnpm, Storybook, Astryx Design.

**Design:** `docs/superpowers/specs/2026-08-09-dora-recruiter-friendly-row-labels-design.md`

## Global Constraints

- Use exactly `Relevant experience` for the `applied` group and `Technical skills` for the `skills` group.
- Apply the labels through the existing shared map; do not add capability-specific branches or duplicate strings in production code.
- Preserve internal group keys, group order, evidence IDs, tokens, token labels, token accessible names, counts, scores, and data.
- Preserve `Experience evidence: …` as the existing per-token aria-label prefix; this change affects row headings and list names only.
- Preserve `<Text type="supporting" color="secondary">`, `aria-labelledby`, markup, spacing, typography, wrapping, card dimensions, and token/logo behavior.
- Do not expose private source information or change public evidence wording.

### Task 1: Replace Shared Row Labels And Exact Accessibility Regressions

**Files:**

- Modify: `apps/github.io/src/app/devops-capability-evidence/dora-capability-card.tsx`
- Modify: `apps/github.io/src/app/devops-capability-evidence/dora-capability-card.spec.tsx`

**Interfaces:**

- Consumes: `visibleEvidenceGroupLabels: Partial<Record<DoraCapabilityCardEvidenceGroup, string>>` and the existing `aria-labelledby` relationship.
- Produces: visible and accessible list names `Relevant experience` and `Technical skills` for all DORA cards.
- Preserves: internal `applied`/`skills` keys, `rowLabel()` fallbacks for non-visible groups, evidence token aria labels, component props, and presentation.

- [ ] **Step 1: Update the shared card tests to the new visible and accessible names**

In `dora-capability-card.spec.tsx`, replace every exact visible row-label or list-name expectation:

```ts
screen.getByRole('list', { name: 'Relevant experience' });
screen.getByRole('list', { name: 'Technical skills' });
screen.getByText('Relevant experience');
screen.getByText('Technical skills');
```

For assertions that verify labels are absent when no rows render, use:

```ts
expect(screen.queryByText('Relevant experience')).toBeNull();
expect(screen.queryByText('Technical skills')).toBeNull();
```

Update all applicable cases, including:

- the Continuous Delivery card with 5 experience and 14 skill tokens;
- the mixed Flexible Infrastructure rows;
- the Continuous Integration card with 5 experience and 13 skill tokens;
- the scoreless fallback row;
- the no-evidence case.

Do not replace strings such as `Experience evidence: Approval-gated deployment automation`; those are per-token accessible names and remain unchanged.

- [ ] **Step 2: Run the focused component suite to verify the old map fails**

```bash
NX_DAEMON=false pnpm exec vitest run apps/github.io/src/app/devops-capability-evidence/dora-capability-card.spec.tsx
```

Expected: FAIL because the rendered visible headings and list names are still `Experience` and `Skills`.

- [ ] **Step 3: Update the shared production mapping**

In `dora-capability-card.tsx`, change only the two map values:

```ts
const visibleEvidenceGroupLabels: Partial<
  Record<DoraCapabilityCardEvidenceGroup, string>
> = {
  applied: 'Relevant experience',
  skills: 'Technical skills',
};
```

Do not change `evidenceGroupLabels`, `rowLabel()`, `DoraCapabilityEvidenceRow`, or any styles.

- [ ] **Step 4: Run focused component and Storybook regressions**

```bash
NX_DAEMON=false pnpm exec vitest run \
  apps/github.io/src/app/devops-capability-evidence/dora-capability-card.spec.tsx \
  apps/github.io/src/app/devops-capability-evidence/dora-capability-card.stories.spec.ts \
  apps/github.io/src/app/devops-capability-evidence/dora-capability-card.evidence.spec.ts
pnpm prettier --check \
  apps/github.io/src/app/devops-capability-evidence/dora-capability-card.tsx \
  apps/github.io/src/app/devops-capability-evidence/dora-capability-card.spec.tsx
git diff --check
```

Expected: all tests and checks PASS. Confirm existing token aria-label assertions still begin with `Experience evidence:` and skill-token labels remain unchanged.

- [ ] **Step 5: Inspect and commit the shared-label change**

```bash
git diff -- \
  apps/github.io/src/app/devops-capability-evidence/dora-capability-card.tsx \
  apps/github.io/src/app/devops-capability-evidence/dora-capability-card.spec.tsx
git add \
  apps/github.io/src/app/devops-capability-evidence/dora-capability-card.tsx \
  apps/github.io/src/app/devops-capability-evidence/dora-capability-card.spec.tsx
git diff --cached
git diff --cached --check
git commit -m "feat(github.io): clarify DORA evidence row labels"
```

### Task 2: Run Full Validation And Renew iPad Approval

**Files:**

- Verify: `apps/github.io/src/app/devops-capability-evidence/`
- Verify: `apps/github.io/src/app/skills/`
- Verify: `apps/github.io/src/assets/skills/`
- Expected source changes: none

**Interfaces:**

- Consumes: Task 1's shared row-label mapping and the running Continuous Delivery Storybook story.
- Produces: complete automated verification plus user confirmation that both recruiter-friendly labels remain readable on iPad.
- Preserves: clean worktree and no empty validation commit.

- [ ] **Step 1: Run complete automated validation**

Run each separately and require exit code 0:

```bash
NX_DAEMON=false pnpm nx test github.io --skip-nx-cache
NX_DAEMON=false pnpm nx lint github.io --skip-nx-cache
NX_DAEMON=false pnpm nx build github.io --skip-nx-cache
NX_DAEMON=false pnpm nx build-storybook github.io --skip-nx-cache
```

Expected: all commands PASS. Record test and build totals and only pre-existing accepted warnings.

- [ ] **Step 2: Run focused semantics, projection, and privacy contracts**

```bash
NX_DAEMON=false pnpm exec vitest run --reporter=verbose \
  apps/github.io/src/app/devops-capability-evidence/dora-capability-card.spec.tsx \
  apps/github.io/src/app/devops-capability-evidence/dora-capability-card.stories.spec.ts \
  apps/github.io/src/app/devops-capability-evidence/dora-capability-card.evidence.spec.ts \
  apps/github.io/src/app/devops-capability-evidence/devops-capability-evidence.spec.ts \
  apps/github.io/src/app/devops-capability-evidence/continuous-delivery-evidence.data.spec.ts \
  apps/github.io/src/app/devops-capability-evidence/continuous-delivery-skill-evidence.data.spec.ts \
  apps/github.io/src/app/devops-capability-evidence/continuous-integration-evidence.data.spec.ts \
  apps/github.io/src/app/skills/skill-brand.spec.ts
```

Expected: PASS. Confirm both shared row names, unchanged token aria labels, 17 unique CD experiences, five selected experiences, 14 ordered CD skills, 13 ordered CI skills, and public-data assertions.

- [ ] **Step 3: Verify the refreshed Storybook endpoint**

Use the existing server on port 6009 if healthy. Otherwise start:

```bash
NX_DAEMON=false pnpm nx storybook github.io --host 0.0.0.0 --port 6009
```

Verify local HTTP 200 and provide the user this direct Tailscale URL:

```text
http://TAILSCALE_IP:6009/iframe.html?id=github-io-devops-capability-evidence-dora-capability-card--continuous-delivery&viewMode=story
```

- [ ] **Step 4: Record manual iPad approval**

Require user confirmation that:

- `Relevant experience` clearly describes the accomplishment tokens;
- `Technical skills` clearly describes the technology tokens;
- both labels fit without clipping or horizontal overflow;
- row hierarchy, token wrapping, logo stability, and centered full-card visibility remain correct.

If the user reports a defect, add a focused regression, implement the smallest correction, rerun Steps 1-3, and commit the fix separately. If approved, record it in the SDD report and create no validation commit.

- [ ] **Step 5: Verify final repository state**

```bash
git diff --check
git status --short --branch
git log -6 --oneline
```

Expected: clean worktree on `feat/dora-continuous-delivery-evidence`; no empty verification commit and no push, merge, or deployment.

## Completion Criteria

- Every DORA card uses `Relevant experience` and `Technical skills` for visible row headings and list accessible names.
- Internal groups, tokens, token aria labels, data, order, counts, scores, and styling remain unchanged.
- Focused and complete automated checks pass.
- Storybook responds over the established Tailscale route.
- The user approves the two labels and responsive hierarchy on iPad.
- The worktree is clean and all source changes are committed locally.
