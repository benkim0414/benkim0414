# DORA Card Summary Typography Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Render the DORA description and experience summary as equally readable Astryx body/secondary prose while preserving their order and semantics.

**Architecture:** Keep the change inside the shared `DoraCapabilityCard` presentation boundary. Use identical supported Astryx `Text` props for both prose passages, and lock their type, color, paragraph markup, order, non-quotation semantics, and missing-summary fallback in the focused component suite.

**Tech Stack:** React 19, TypeScript, Astryx `Text`, Testing Library, Vitest, Nx, pnpm

## Global Constraints

- Keep the sequence: capability heading, DORA description, experience summary, evidence rows.
- Add no visible label for the experience summary.
- Use Astryx `Text` semantic props only; add no local typography styles.
- Render both prose passages with `type="body"`, `color="secondary"`, and `as="p"`.
- Do not use `Blockquote` or otherwise present either passage as a quotation.
- Keep all description and summary copy unchanged.
- Do not change score data, evidence selection, row layout, spacing, card dimensions, or accessibility labels.
- Cards without an experience summary must continue to omit it.
- Work only in the linked worktree at `.worktrees/dora-card-summary-hierarchy` on branch `feat/dora-card-summary-hierarchy`.
- Stage explicit paths only and do not push, open a PR, merge, or deploy.

---

## File Structure

- Modify `apps/github.io/src/app/devops-capability-evidence/dora-capability-card.tsx`: retain the approved uniform Astryx semantic role, color, and paragraph element for both prose values.
- Modify `apps/github.io/src/app/devops-capability-evidence/dora-capability-card.spec.tsx`: replace the superseded hierarchy assertions with the complete uniform-typography contract.

No new file, component, type, style, data record, resolver, or Storybook fixture is needed.

### Task 1: Apply Uniform Astryx Typography To Both Prose Passages

**Files:**
- Modify: `apps/github.io/src/app/devops-capability-evidence/dora-capability-card.tsx:128-135`
- Test: `apps/github.io/src/app/devops-capability-evidence/dora-capability-card.spec.tsx:229-267,520-539`

**Interfaces:**
- Consumes: `description: string` from `DoraCapabilityCardProps` and `evidenceSummary: string | undefined` from `getDoraCapabilityCardEvidenceSummary(capabilityKey, scores)`.
- Produces: unchanged `DoraCapabilityCard(props: DoraCapabilityCardProps): ReactElement`; both present prose values render as Astryx body/secondary paragraphs, and a missing summary renders no second prose paragraph.

- [ ] **Step 1: Run the focused suite to capture the superseded-contract failure**

From `.worktrees/dora-card-summary-hierarchy`, run:

```bash
../../node_modules/.bin/vitest run \
  --config apps/github.io/vite.config.ts \
  apps/github.io/src/app/devops-capability-evidence/dora-capability-card.spec.tsx
```

Expected: FAIL in both parameterized typography cases. The live component
experiment already renders both passages as body/secondary text, while the
tests still require a supporting/secondary description and body/primary
summary. Do not change the component to satisfy the superseded assertions.

- [ ] **Step 2: Replace the hierarchy assertions with the approved contract**

Rename the parameterized test to
`renders the %s description before its experience summary with uniform prose typography`
and replace its assertions with:

```tsx
const card = screen.getByTestId('dora-capability-card');
const descriptionText = screen.getByText(description);
const summaryText = screen.getByText(summary);

expect(descriptionText.tagName).toBe('P');
expect(descriptionText.getAttribute('data-type')).toBe('body');
expect(descriptionText.getAttribute('data-color')).toBe('secondary');
expect(summaryText.tagName).toBe('P');
expect(summaryText.getAttribute('data-type')).toBe('body');
expect(summaryText.getAttribute('data-color')).toBe('secondary');
expect(
  descriptionText.compareDocumentPosition(summaryText) &
    Node.DOCUMENT_POSITION_FOLLOWING,
).toBeTruthy();
expect(card.querySelector('blockquote')).toBeNull();
expect(screen.queryByText(/my experience/i)).toBeNull();
```

Replace the no-summary test body with a content-specific fallback assertion:

```tsx
const description =
  doraCapabilityDescriptions['flexible-infrastructure'];

render(
  <DoraCapabilityCard
    capability={flexibleInfrastructure}
    description={description}
    evidence={devOpsCapabilityEvidenceItems}
    scores={undefined}
  />,
);

const card = screen.getByTestId('dora-capability-card');
const prose = card.querySelectorAll(
  'p[data-type="body"][data-color="secondary"]',
);

expect(prose).toHaveLength(1);
expect(prose.item(0).textContent).toBe(description);
expect(card.querySelector('blockquote')).toBeNull();
```

This replaces the obsolete query for body/primary text, which would pass even
if the summary fallback regressed because body/primary text is no longer part
of the approved design.

- [ ] **Step 3: Verify the component contains only the minimal approved markup**

Keep the inner `VStack` prose markup exactly as:

```tsx
<Text type="body" color="secondary" as="p">
  {description}
</Text>
{evidenceSummary ? (
  <Text type="body" color="secondary" as="p">
    {evidenceSummary}
  </Text>
) : null}
```

Do not add a `Blockquote` import, label, wrapper, local style, or attribution.
Do not change either `VStack` gap, the `Heading`, resolver calls, conditional,
evidence rows, or StyleX styles.

- [ ] **Step 4: Run the focused suite and verify the approved contract passes**

Run:

```bash
../../node_modules/.bin/vitest run \
  --config apps/github.io/vite.config.ts \
  apps/github.io/src/app/devops-capability-evidence/dora-capability-card.spec.tsx
```

Expected: PASS with all `DoraCapabilityCard` tests green, including both
uniform-typography cases, content order, non-quotation semantics, and the
no-summary fallback.

- [ ] **Step 5: Run the complete relevant validation**

Run from the linked worktree:

```bash
../../node_modules/.bin/nx run-many -t lint,test,build -p github.io
```

Expected: lint, test, and build all exit 0. Existing deprecation warnings from
the Nx Vite TypeScript-paths plugin do not fail validation.

- [ ] **Step 6: Verify representative responsive stories**

Use the already-running Storybook when available; otherwise start it with:

```bash
../../node_modules/.bin/nx storybook github.io -- \
  --host 127.0.0.1 --port 6009 --no-open
```

Inspect these production-data stories at `390x844` and `768x1024`:

```text
http://127.0.0.1:6009/iframe.html?id=github-io-devops-capability-evidence-dora-capability-card--continuous-integration&viewMode=story
http://127.0.0.1:6009/iframe.html?id=github-io-devops-capability-evidence-dora-capability-card--continuous-delivery&viewMode=story
```

Confirm the description remains before the experience summary, both passages
have matching body/secondary typography, neither looks like a quotation, both
wrap without clipping or overflow, and evidence-row spacing is unchanged.

- [ ] **Step 7: Review and commit the implementation**

Inspect the scoped diff, stage explicit paths, and verify the staged patch:

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

Confirm the staged diff contains only the approved uniform typography and its
focused tests. In particular, do not stage the unrelated `nx.json` analytics
change. Commit with:

```bash
git commit -m "fix(github.io): align DORA summary typography"
```

Finally run `git status --short --branch`. Leave unrelated pre-existing edits
untouched. Do not push or open a pull request; stop in the repository's
awaiting-handoff state.
