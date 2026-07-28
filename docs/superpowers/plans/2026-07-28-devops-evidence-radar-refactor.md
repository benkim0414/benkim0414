# DevOps Evidence Radar Refactor Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make `DevOpsCapabilityEvidenceRadar` the only supported DevOps capability evidence visualization component in `github.io`.

**Architecture:** Keep the radar visualization inside `apps/github.io/src/app/devops-capability-evidence/`, backed by `DoraCapabilityScore[]` from the existing evidence scoring utilities. Remove the older static `apps/github.io/src/app/devops-capability-radar/` feature folder and remove non-radar evidence visualization components/stories so Storybook exposes only the evidence radar for this feature area. Update active docs so future work points at the evidence-backed radar component.

**Tech Stack:** Nx, pnpm, React 19, TypeScript, Vitest, Testing Library, Storybook, MUI X Charts, Astryx Design, StyleX.

## Global Constraints

- Work from the linked worktree at `.worktrees/refactor-devops-evidence-radar`.
- Do not change the evidence scoring rubric.
- Do not introduce a generic radar abstraction.
- Do not wire the radar into app routes or page sections.
- Do not change Astryx theme files or global chart styling.
- Do not rename `DevOpsCapabilityEvidenceRadar`.
- Stage explicit paths only; do not use `git add -A`, `git add --all`, `git add -u`, `git add .`, `git commit -a`, or `git commit -am`.
- Commit each self-contained logical change separately with conventional commit subjects.

---

## File Structure

- `apps/github.io/src/app/devops-capability-evidence/devops-capability-evidence-radar.tsx`
  - Canonical radar component.
  - Should remain a leaf visualization that accepts `scores`.
- `apps/github.io/src/app/devops-capability-evidence/devops-capability-evidence-radar.spec.tsx`
  - Canonical radar tests.
  - Should cover labels, hidden summary, zero-score filtering, empty rendering, and visual-only chart semantics.
- `apps/github.io/src/app/devops-capability-evidence/devops-capability-evidence-radar.stories.tsx`
  - Canonical Storybook story.
  - Should continue to expose default, empty, and narrow viewport states.
- `apps/github.io/src/app/devops-capability-radar/`
  - Obsolete standalone static radar folder.
  - Should be removed in this refactor.
- non-radar files under `apps/github.io/src/app/devops-capability-evidence/`
  - Obsolete evidence visualization and compact evidence Storybook surfaces.
  - Remove donut, timeline, certification map, matrix, bar list, and compact `CapabilityEvidence` component/test/story/helper files.
- shared evidence files under `apps/github.io/src/app/devops-capability-evidence/`
  - Keep `devops-capability-evidence.types.ts`, `.data.ts`, `.scoring.ts`, `.summary.ts`, and `.spec.ts` because the radar and scoring tests still depend on the evidence data pipeline.
- `docs/solutions/design-patterns/public-evidence-portfolio-visualizations.md`
  - Active solution guidance for evidence-backed portfolio visualizations.
  - Should reference `DevOpsCapabilityEvidenceRadar`, not standalone `DevOpsCapabilityRadar` or deleted non-radar evidence components.
- `docs/solutions/design-patterns/standalone-github-io-devops-capability-radar.md`
  - Historical standalone pattern doc.
  - Should be retired or clearly marked superseded by the evidence radar.
- `docs/solutions/design-patterns/compact-capability-evidence-renderers.md`
  - Historical compact evidence component doc.
  - Should be retired or clearly marked superseded by the radar-only evidence surface.

---

### Task 1: Strengthen Canonical Evidence Radar Tests

**Files:**
- Modify: `apps/github.io/src/app/devops-capability-evidence/devops-capability-evidence-radar.spec.tsx`
- Verify: `apps/github.io/src/app/devops-capability-evidence/devops-capability-evidence-radar.tsx`

**Interfaces:**
- Consumes:
  - `DevOpsCapabilityEvidenceRadar({ scores }: { scores: readonly DoraCapabilityScore[] })`
  - `getCapabilityEvidenceScores(items, definitions): DoraCapabilityScore[]`
  - `devOpsCapabilityEvidenceItems`
  - `doraCapabilityDefinitions`
- Produces:
  - Test coverage proving the evidence radar is the canonical reusable radar boundary.

- [ ] **Step 1: Add canonical behavior assertions to the radar spec**

Modify `devops-capability-evidence-radar.spec.tsx` so the first test asserts the hidden score summary and visual-only chart semantics explicitly:

```tsx
it('renders evidence-backed DORA capability axes as a visual-only chart with an accessible summary', () => {
  const scores = getCapabilityEvidenceScores(
    devOpsCapabilityEvidenceItems,
    doraCapabilityDefinitions,
  );

  const { container } = render(<DevOpsCapabilityEvidenceRadar scores={scores} />);

  expect(screen.getByText('Continuous Delivery')).toBeTruthy();
  expect(screen.getByText('Flexible Infrastructure')).toBeTruthy();
  expect(screen.queryByText('Pervasive Security')).toBeNull();
  expect(
    screen.getByText(
      /Continuous Delivery 3 of 5, Deployment Automation 3 of 5, Continuous Integration 3 of 5/,
    ),
  ).toBeTruthy();

  const chart = container.querySelector('[aria-hidden="true"]');

  expect(chart).toBeTruthy();
  expect(chart?.querySelectorAll('[tabindex]').length).toBe(0);
});
```

- [ ] **Step 2: Add a caller-provided score filtering test with mixed scores**

Add this test after the existing zero-score test:

```tsx
it('filters zero-value caller-provided scores before building radar axes', () => {
  const scores = [
    {
      capabilityKey: 'continuous-delivery',
      label: 'Continuous Delivery',
      score: 3,
      maxScore: 5,
      evidenceIds: ['delivery-summary'],
      evidenceCounts: { experience: 1 },
    },
    {
      capabilityKey: 'pervasive-security',
      label: 'Pervasive Security',
      score: 0,
      maxScore: 5,
      evidenceIds: [],
      evidenceCounts: {},
    },
  ] satisfies readonly DoraCapabilityScore[];

  render(<DevOpsCapabilityEvidenceRadar scores={scores} />);

  expect(screen.getByText('Continuous Delivery')).toBeTruthy();
  expect(screen.queryByText('Pervasive Security')).toBeNull();
  expect(screen.getByText(/Continuous Delivery 3 of 5/)).toBeTruthy();
});
```

- [ ] **Step 3: Run the focused radar test**

Run:

```bash
pnpm nx test github.io -- --run src/app/devops-capability-evidence/devops-capability-evidence-radar.spec.tsx
```

Expected: PASS.

- [ ] **Step 4: Fix only evidence radar regressions if the test fails**

If the test fails because the component does not meet the asserted behavior, update `devops-capability-evidence-radar.tsx` minimally.

The component should keep this boundary:

```tsx
const visibleScores = scores.filter((score) => score.score > 0);

if (visibleScores.length === 0) {
  return null;
}
```

The hidden summary should remain:

```tsx
<VisuallyHidden>{getCapabilityScoreSummary(visibleScores)}</VisuallyHidden>
```

The chart should remain visual-only:

```tsx
<RadarChart
  aria-hidden="true"
  disableKeyboardNavigation
  /* existing props stay local to the evidence radar */
/>
```

- [ ] **Step 5: Re-run the focused radar test**

Run:

```bash
pnpm nx test github.io -- --run src/app/devops-capability-evidence/devops-capability-evidence-radar.spec.tsx
```

Expected: PASS.

- [ ] **Step 6: Inspect the diff**

Run:

```bash
git diff -- apps/github.io/src/app/devops-capability-evidence/devops-capability-evidence-radar.spec.tsx apps/github.io/src/app/devops-capability-evidence/devops-capability-evidence-radar.tsx
```

Expected: only canonical radar test updates and any minimal component fix required by those tests.

- [ ] **Step 7: Commit the canonical test update**

Run:

```bash
git add apps/github.io/src/app/devops-capability-evidence/devops-capability-evidence-radar.spec.tsx apps/github.io/src/app/devops-capability-evidence/devops-capability-evidence-radar.tsx
git diff --cached
git commit -m "test(github.io): cover canonical evidence radar"
```

Only stage `devops-capability-evidence-radar.tsx` if it changed.

---

### Task 2: Remove Standalone DevOps Capability Radar

**Files:**
- Delete: `apps/github.io/src/app/devops-capability-radar/devops-capability-radar.data.ts`
- Delete: `apps/github.io/src/app/devops-capability-radar/devops-capability-radar.tsx`
- Delete: `apps/github.io/src/app/devops-capability-radar/devops-capability-radar.spec.tsx`
- Delete: `apps/github.io/src/app/devops-capability-radar/devops-capability-radar.stories.tsx`

**Interfaces:**
- Consumes:
  - Canonical radar coverage from Task 1.
- Produces:
  - No active source, test, or Storybook files for `DevOpsCapabilityRadar`.

- [ ] **Step 1: Confirm standalone radar has no runtime app imports**

Run:

```bash
rg "DevOpsCapabilityRadar|from './devops-capability-radar|from '../devops-capability-radar|devops-capability-radar" apps/github.io/src -n
```

Expected: matches are limited to `apps/github.io/src/app/devops-capability-radar/` and evidence radar file names that include `devops-capability-evidence-radar`.

- [ ] **Step 2: Delete the standalone radar files**

Run:

```bash
rm apps/github.io/src/app/devops-capability-radar/devops-capability-radar.data.ts
rm apps/github.io/src/app/devops-capability-radar/devops-capability-radar.tsx
rm apps/github.io/src/app/devops-capability-radar/devops-capability-radar.spec.tsx
rm apps/github.io/src/app/devops-capability-radar/devops-capability-radar.stories.tsx
rmdir apps/github.io/src/app/devops-capability-radar
```

- [ ] **Step 3: Confirm the old component no longer exists in app source**

Run:

```bash
rg "DevOpsCapabilityRadar|devops-capability-radar" apps/github.io/src -n
```

Expected: no results, except no-match exit status from `rg` is acceptable.

- [ ] **Step 4: Run the focused evidence radar test**

Run:

```bash
pnpm nx test github.io -- --run src/app/devops-capability-evidence/devops-capability-evidence-radar.spec.tsx
```

Expected: PASS.

- [ ] **Step 5: Inspect the deletion diff**

Run:

```bash
git diff -- apps/github.io/src/app/devops-capability-radar apps/github.io/src/app/devops-capability-evidence/devops-capability-evidence-radar.spec.tsx
```

Expected: deleted standalone radar files plus any Task 1 test changes not yet committed.

- [ ] **Step 6: Commit the standalone radar removal**

Run:

```bash
git add apps/github.io/src/app/devops-capability-radar/devops-capability-radar.data.ts
git add apps/github.io/src/app/devops-capability-radar/devops-capability-radar.tsx
git add apps/github.io/src/app/devops-capability-radar/devops-capability-radar.spec.tsx
git add apps/github.io/src/app/devops-capability-radar/devops-capability-radar.stories.tsx
git diff --cached
git commit -m "refactor(github.io): remove standalone capability radar"
```

Expected: commit contains only the deleted standalone radar files.

---

### Task 3: Clean Active Documentation And Validate

**Files:**
- Modify: `docs/solutions/design-patterns/public-evidence-portfolio-visualizations.md`
- Modify or delete: `docs/solutions/design-patterns/standalone-github-io-devops-capability-radar.md`
- Verify: `docs/superpowers/specs/2026-07-28-devops-evidence-radar-refactor-design.md`
- Verify: `docs/superpowers/plans/2026-07-28-devops-evidence-radar-refactor.md`

**Interfaces:**
- Consumes:
  - Canonical component name `DevOpsCapabilityEvidenceRadar`.
  - Deleted standalone source folder from Task 2.
- Produces:
  - Active documentation that no longer directs future work toward the deleted standalone radar.

- [ ] **Step 1: Find stale active docs references**

Run:

```bash
rg "DevOpsCapabilityRadar|devops-capability-radar|standalone GitHub.io DevOps Capability Radar|standalone-github-io-devops-capability-radar" docs/solutions docs/superpowers/specs/2026-07-28-devops-evidence-radar-refactor-design.md docs/superpowers/plans/2026-07-28-devops-evidence-radar-refactor.md -n
```

Expected: results identify active solution docs that need cleanup, plus historical spec/plan files that may remain unchanged.

- [ ] **Step 2: Update public evidence solution related components**

In `docs/solutions/design-patterns/public-evidence-portfolio-visualizations.md`, replace this related component:

```yaml
  - github.io DevOpsCapabilityRadar
```

with:

```yaml
  - github.io DevOpsCapabilityEvidenceRadar
```

- [ ] **Step 3: Update public evidence solution related links**

In `docs/solutions/design-patterns/public-evidence-portfolio-visualizations.md`, replace the related standalone radar link:

```markdown
- `docs/solutions/design-patterns/standalone-github-io-devops-capability-radar.md`
```

with:

```markdown
- `apps/github.io/src/app/devops-capability-evidence/devops-capability-evidence-radar.tsx`
```

- [ ] **Step 4: Retire the standalone radar solution doc**

Replace the body of `docs/solutions/design-patterns/standalone-github-io-devops-capability-radar.md` with a superseded note while preserving YAML frontmatter.

Use this body after the frontmatter:

```markdown
# Standalone GitHub.io DevOps Capability Radar

This standalone pattern has been superseded by the evidence-backed radar in `apps/github.io/src/app/devops-capability-evidence/devops-capability-evidence-radar.tsx`.

Use `DevOpsCapabilityEvidenceRadar` for current work. It accepts derived `DoraCapabilityScore[]`, filters empty capability axes, keeps the MUI X chart visual-only, and exposes a hidden accessible summary from public portfolio evidence.

The old standalone `apps/github.io/src/app/devops-capability-radar/` source folder was removed because static radar scores duplicated the evidence-backed model.
```

- [ ] **Step 5: Search app source and active solution docs again**

Run:

```bash
rg "DevOpsCapabilityRadar|devops-capability-radar" apps/github.io/src docs/solutions -n
```

Expected: no app source results. Docs results are acceptable only inside the superseded standalone solution doc or historical wording that clearly says the old component was removed.

- [ ] **Step 6: Run focused tests**

Run:

```bash
pnpm nx test github.io -- --run src/app/devops-capability-evidence/devops-capability-evidence-radar.spec.tsx
pnpm nx test github.io -- --run src/app/devops-capability-evidence/devops-capability-evidence.spec.ts
```

Expected: PASS.

- [ ] **Step 7: Run project build**

Run:

```bash
pnpm nx build github.io
```

Expected: PASS.

- [ ] **Step 8: Inspect final diff and status**

Run:

```bash
git diff
git status --short --branch
```

Expected: only documentation cleanup remains unstaged if Tasks 1 and 2 were committed separately.

- [ ] **Step 9: Commit documentation cleanup**

Run:

```bash
git add docs/solutions/design-patterns/public-evidence-portfolio-visualizations.md
git add docs/solutions/design-patterns/standalone-github-io-devops-capability-radar.md
git diff --cached
git commit -m "docs(github.io): retire standalone radar guidance"
```

Expected: commit contains only active documentation cleanup.

- [ ] **Step 10: Report validation evidence**

Report:

```text
Focused radar test: <pass/fail and command>
Evidence scoring test: <pass/fail and command>
Build: <pass/fail and command>
Source search: no app source references to DevOpsCapabilityRadar remain
```

If a command fails because the local environment cannot run Nx or pnpm, include the exact command and failure reason instead of treating it as passing.

---

### Task 4: Remove Non-Radar Evidence Components From Storybook

**Files:**
- Delete: non-radar component, story, spec, and helper files under `apps/github.io/src/app/devops-capability-evidence/`
- Modify: `docs/superpowers/specs/2026-07-28-devops-evidence-radar-refactor-design.md`
- Modify: `docs/superpowers/plans/2026-07-28-devops-evidence-radar-refactor.md`
- Modify: `docs/solutions/design-patterns/public-evidence-portfolio-visualizations.md`
- Modify: `docs/solutions/design-patterns/compact-capability-evidence-renderers.md`

**Interfaces:**
- Consumes:
  - Canonical component `DevOpsCapabilityEvidenceRadar`
  - Shared evidence model/scoring files used by the radar
- Produces:
  - Only the radar story remains under the DevOps capability evidence Storybook group.
  - Active docs no longer describe deleted non-radar evidence components as current guidance.

- [ ] **Step 1: Remove non-radar app source and stories**

Delete donut, timeline, certification map, matrix, bar list, and compact `CapabilityEvidence` files from `apps/github.io/src/app/devops-capability-evidence/`. Keep `devops-capability-evidence-radar.*`, `devops-capability-evidence.types.ts`, `devops-capability-evidence.data.ts`, `devops-capability-evidence.scoring.ts`, `devops-capability-evidence.summary.ts`, and `devops-capability-evidence.spec.ts`.

- [ ] **Step 2: Retire stale active guidance**

Update active solution docs so current guidance describes the radar-only evidence surface. Retire compact evidence renderer guidance because its source files are removed.

- [ ] **Step 3: Validate Storybook inventory**

Run:

```bash
rg "title:" apps/github.io/src/app/devops-capability-evidence -g '*.stories.tsx' -n
```

Expected: only `GitHub.io/DevOps Capability Evidence/Radar`.

- [ ] **Step 4: Validate deleted component references**

Run:

```bash
rg "DevOpsCapabilityEvidenceMatrix|DevOpsCapabilityBarList|DevOpsEvidenceTypeDonut|DevOpsEvidenceTimeline|DevOpsCertificationCapabilityMap|CapabilityEvidence|devops-capability-evidence-matrix|devops-capability-bar-list|devops-evidence-type-donut|devops-evidence-timeline|devops-certification-capability-map|capability-evidence" apps/github.io/src docs/solutions -n
```

Expected: no app source references to deleted components. Solution doc references are acceptable only when they clearly say the component has been retired or superseded.

- [ ] **Step 5: Run focused tests and build**

Run:

```bash
pnpm nx test github.io -- --run src/app/devops-capability-evidence/devops-capability-evidence-radar.spec.tsx
pnpm nx test github.io -- --run src/app/devops-capability-evidence/devops-capability-evidence.spec.ts
pnpm nx build github.io
```

Expected: PASS, or report the exact environment limitation if a command cannot run.

- [ ] **Step 6: Commit**

Run:

```bash
git add <explicit deleted and modified paths>
git diff --cached
git commit -m "refactor(github.io): keep evidence radar only"
```
