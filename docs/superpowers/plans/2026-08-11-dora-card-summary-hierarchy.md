# DORA Card Summary Hierarchy Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the experience summary the primary prose in every DORA capability card while retaining the generic DORA description as preceding secondary context.

**Architecture:** Change only the shared `DoraCapabilityCard` presentation boundary. Express the hierarchy through supported Astryx `Text` props, and lock the semantic type, color, paragraph markup, and content order in the focused component suite.

**Tech Stack:** React 19, TypeScript, Astryx `Text`, Testing Library, Vitest, Nx, pnpm

## Global Constraints

- Keep the sequence: capability heading, DORA description, experience summary, evidence rows.
- Add no visible label for the experience summary.
- Use Astryx `Text` semantic props only; add no local typography styles.
- Keep all description and summary copy unchanged.
- Do not change score data, evidence selection, row layout, spacing, card dimensions, or accessibility labels.
- Cards without an experience summary must continue to omit it.
- Work only in the linked worktree at `.worktrees/dora-card-summary-hierarchy` on branch `feat/dora-card-summary-hierarchy`.
- Stage explicit paths only and do not push, open a PR, merge, or deploy.

---

## File Structure

- Modify `apps/github.io/src/app/devops-capability-evidence/dora-capability-card.tsx`: assign the approved Astryx semantic role and paragraph element to each prose value.
- Modify `apps/github.io/src/app/devops-capability-evidence/dora-capability-card.spec.tsx`: replace the old summary-markup assertion with the complete hierarchy contract.

No new file, component, type, style, data record, resolver, or Storybook fixture is needed.

### Task 1: Distinguish The Experience Summary With Astryx Typography

**Files:**
- Modify: `apps/github.io/src/app/devops-capability-evidence/dora-capability-card.tsx:128-135`
- Test: `apps/github.io/src/app/devops-capability-evidence/dora-capability-card.spec.tsx:229-254`

**Interfaces:**
- Consumes: `description: string` from `DoraCapabilityCardProps` and `evidenceSummary: string | undefined` from `getDoraCapabilityCardEvidenceSummary(capabilityKey, scores)`.
- Produces: unchanged `DoraCapabilityCard(props: DoraCapabilityCardProps): ReactElement`; the description renders as Astryx supporting/secondary paragraph text, and a present summary renders as Astryx body/primary paragraph text.

- [ ] **Step 1: Write the failing semantic-hierarchy test**

Replace the parameterized test at `dora-capability-card.spec.tsx:229-254` with:

```tsx
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
  'renders the %s description before its primary experience summary',
  (capability, description, summary) => {
    render(
      <DoraCapabilityCard
        capability={capability}
        description={description}
        evidence={devOpsCapabilityEvidenceItems}
        scores={curatedDevOpsCapabilityRadarScores}
      />,
    );

    const descriptionText = screen.getByText(description);
    const summaryText = screen.getByText(summary);

    expect(descriptionText.tagName).toBe('P');
    expect(descriptionText.getAttribute('data-type')).toBe('supporting');
    expect(descriptionText.getAttribute('data-color')).toBe('secondary');
    expect(summaryText.tagName).toBe('P');
    expect(summaryText.getAttribute('data-type')).toBe('body');
    expect(summaryText.getAttribute('data-color')).toBe('primary');
    expect(
      descriptionText.compareDocumentPosition(summaryText) &
        Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
  },
);
```

Keep the existing `does not render a summary for capabilities without one`
test at lines 508-528. It already locks the required fallback behavior.

- [ ] **Step 2: Run the focused test and verify the new contract fails**

From `.worktrees/dora-card-summary-hierarchy`, run:

```bash
../../node_modules/.bin/vitest run \
  --config apps/github.io/vite.config.ts \
  apps/github.io/src/app/devops-capability-evidence/dora-capability-card.spec.tsx
```

Expected: FAIL in both parameterized cases because the current summary is a
`SPAN` with `data-type="supporting"` and `data-color="secondary"` rather than
the approved paragraph with body/primary typography. The existing tests should
otherwise remain green.

- [ ] **Step 3: Implement the minimal Astryx hierarchy**

In `dora-capability-card.tsx`, replace only the description and summary markup
inside the existing inner `VStack` with:

```tsx
<Text type="supporting" color="secondary" as="p">
  {description}
</Text>
{evidenceSummary ? (
  <Text type="body" color="primary" as="p">
    {evidenceSummary}
  </Text>
) : null}
```

Do not change either `VStack` gap, the `Heading`, resolver calls, conditional,
evidence rows, or StyleX styles.

- [ ] **Step 4: Run the focused suite and verify it passes**

Run:

```bash
../../node_modules/.bin/vitest run \
  --config apps/github.io/vite.config.ts \
  apps/github.io/src/app/devops-capability-evidence/dora-capability-card.spec.tsx
```

Expected: PASS with all 20 `DoraCapabilityCard` tests green, including both
semantic-hierarchy cases and the no-summary fallback.

- [ ] **Step 5: Run relevant static and build validation**

Run from the linked worktree:

```bash
../../node_modules/.bin/nx lint github.io
../../node_modules/.bin/nx build github.io
```

Expected: both commands exit 0. Existing deprecation warnings from the Nx Vite
TypeScript-paths plugin do not fail validation.

- [ ] **Step 6: Verify representative responsive stories**

Start Storybook from the linked worktree:

```bash
../../node_modules/.bin/nx storybook github.io -- --host 127.0.0.1 --port 6009 --no-open
```

Inspect these production-data stories at `390x844` and `768x1024`:

```text
http://127.0.0.1:6009/iframe.html?id=github-io-devops-capability-evidence-dora-capability-card--continuous-integration&viewMode=story
http://127.0.0.1:6009/iframe.html?id=github-io-devops-capability-evidence-dora-capability-card--continuous-delivery&viewMode=story
```

Confirm the DORA description remains before the experience summary, the
summary is visibly primary without competing with the capability heading, both
paragraphs wrap without clipping or overflow, evidence rows retain their
spacing, and cards without summaries remain visually unchanged. Stop the
Storybook process after inspection.

- [ ] **Step 7: Review and commit the implementation**

Inspect both unstaged and staged changes:

```bash
git diff -- \
  apps/github.io/src/app/devops-capability-evidence/dora-capability-card.tsx \
  apps/github.io/src/app/devops-capability-evidence/dora-capability-card.spec.tsx
git add \
  apps/github.io/src/app/devops-capability-evidence/dora-capability-card.tsx \
  apps/github.io/src/app/devops-capability-evidence/dora-capability-card.spec.tsx
git diff --cached --check
git diff --cached
```

Confirm the staged diff contains only the approved Astryx hierarchy and its
focused tests, then commit:

```bash
git commit -m "fix(github.io): emphasize DORA experience summaries"
```

Finally run `git status --short --branch` and confirm the feature worktree is
clean. Do not push or open a pull request; stop in the repository's
awaiting-handoff state.
