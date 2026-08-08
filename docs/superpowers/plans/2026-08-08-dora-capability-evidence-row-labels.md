# DORA Capability Evidence Row Labels Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add visible, accessible **Experiences** and **Skills** labels above the corresponding evidence-token rows in DORA capability cards.

**Architecture:** Keep evidence grouping and ordering in `getDoraCapabilityCardEvidenceRows` unchanged. Add presentation-only label metadata inside `dora-capability-card.tsx`; `DoraCapabilityEvidenceRow` renders the optional label and uses it as the list's accessible name while preserving the generated accessible name for unlabelled groups.

**Tech Stack:** React, TypeScript, Astryx Design `Text` and `VStack`, StyleX spacing tokens, Testing Library, Vitest, Nx, Storybook.

## Global Constraints

- The existing `applied` group continues to combine `experience` and `project` evidence.
- The `applied` group visible label is exactly `Experiences`.
- The `skills` group visible label is exactly `Skills`.
- Both labels use `<Text type="supporting" color="secondary">` with no explicit weight.
- Use Astryx `spacing-1` between a visible label and its token list.
- Preserve the existing `spacing-2` between evidence groups.
- Render a label only when its corresponding evidence row exists.
- Use each visible label as its list's accessible name through `aria-labelledby`.
- Preserve the existing generated `aria-label` for unlabelled certification and learning rows.
- Do not change evidence data, score calculation, evidence selection, group order, token styling, icons, card width, or Storybook data.

---

### Task 1: Label Experience And Skill Evidence Rows

**Files:**
- Modify: `apps/github.io/src/app/devops-capability-evidence/dora-capability-card.spec.tsx`
- Modify: `apps/github.io/src/app/devops-capability-evidence/dora-capability-card.tsx`

**Interfaces:**
- Consumes: `DoraCapabilityCardEvidenceRow` with `group: 'applied' | 'certifications' | 'skills' | 'learning'` and the existing ordered `row.evidence` array.
- Produces: visible `Experiences` and `Skills` supporting-text labels; lists named by those visible labels; unchanged fallback accessible names for unlabelled groups.

- [ ] **Step 1: Update the row-rendering contract test to require visible labels**

In `dora-capability-card.spec.tsx`, rename the existing test beginning
`renders evidence rows in applied...` to:

```tsx
it('labels experience and skill rows without changing group order', () => {
```

Keep the existing four-row order assertion, then replace the old no-label
assertions with:

```tsx
expect(screen.getByText('Experiences')).toBeTruthy();
expect(screen.getByText('Skills')).toBeTruthy();
expect(screen.queryByText('Certifications')).toBeNull();
expect(screen.queryByText('Learning')).toBeNull();

expect(screen.getByRole('list', { name: 'Experiences' })).toBe(rows[0]);
expect(
  screen.getByRole('list', {
    name: 'Flexible Infrastructure certification evidence',
  }),
).toBe(rows[1]);
expect(screen.getByRole('list', { name: 'Skills' })).toBe(rows[2]);
expect(
  screen.getByRole('list', {
    name: 'Flexible Infrastructure learning evidence',
  }),
).toBe(rows[3]);
```

This verifies visible copy, accessible-name linkage, unchanged ordering, and
fallback accessible names for the two unlabelled groups.

- [ ] **Step 2: Update existing list queries and empty-state assertions**

In the test `uses curated score order within each evidence group`, replace the
two list queries with:

```tsx
const appliedRow = screen.getByRole('list', { name: 'Experiences' });
const skillRow = screen.getByRole('list', { name: 'Skills' });
```

In `marks evidence rows as wrapping lists`, query the row by its new accessible
name in both places:

```tsx
const row = screen.getByRole('list', { name: 'Experiences' });

expect(row.getAttribute('data-wrap')).toBe('true');
expect(screen.getByRole('list', { name: 'Experiences' })).toBe(row);
```

Extend `omits evidence rows when no evidence matches` to prove labels do not
render without their rows:

```tsx
expect(screen.queryByText('Experiences')).toBeNull();
expect(screen.queryByText('Skills')).toBeNull();
```

- [ ] **Step 3: Run the focused test to verify RED**

Run:

```bash
../../node_modules/.bin/vitest run --config apps/github.io/vite.config.ts dora-capability-card.spec.tsx
```

Expected: FAIL because `Experiences` and `Skills` are not visible and the
current lists are still named with generated capability/group labels.

- [ ] **Step 4: Add presentation-only visible label metadata**

In `dora-capability-card.tsx`, keep `evidenceGroupLabels` for the unlabelled
group fallback and add:

```tsx
const visibleEvidenceGroupLabels: Partial<
  Record<DoraCapabilityCardEvidenceGroup, string>
> = {
  applied: 'Experiences',
  skills: 'Skills',
};
```

Do not add certifications or learning to this map.

- [ ] **Step 5: Render each optional label and connect it to its list**

At the start of `DoraCapabilityEvidenceRow`, generate a stable ID and read the
optional label:

```tsx
const labelId = useId();
const visibleLabel = visibleEvidenceGroupLabels[row.group];
```

Replace its direct `<ul>` return with this structure:

```tsx
return (
  <VStack gap={1}>
    {visibleLabel ? (
      <Text id={labelId} type="supporting" color="secondary">
        {visibleLabel}
      </Text>
    ) : null}
    <ul
      {...stylex.props(styles.evidenceRow)}
      aria-label={
        visibleLabel ? undefined : rowLabel(capabilityLabel, row.group)
      }
      aria-labelledby={visibleLabel ? labelId : undefined}
      data-group={row.group}
      data-testid="dora-capability-evidence-row"
      data-wrap="true"
    >
      {row.evidence.map((item, index) => (
        <li {...stylex.props(styles.evidenceItem)} key={item.id}>
          <CapabilityEvidence evidence={item} citationNumber={index + 1} />
        </li>
      ))}
    </ul>
  </VStack>
);
```

Use the existing imports of `Text`, `VStack`, and `useId`. Do not add a new
StyleX spacing rule: Astryx `VStack gap={1}` supplies the required
`spacing-1`, while `styles.evidenceRows` preserves `spacing-2` between groups.

- [ ] **Step 6: Run focused tests to verify GREEN**

Run:

```bash
../../node_modules/.bin/vitest run --config apps/github.io/vite.config.ts dora-capability-card.spec.tsx dora-capability-card.stories.spec.ts capability-evidence.spec.tsx
```

Expected: PASS with the updated card contract, unchanged production Storybook
data, and unchanged token rendering.

- [ ] **Step 7: Run project verification**

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

- [ ] **Step 8: Validate the existing CI Storybook card responsively**

Serve the built Storybook on loopback and inspect the existing Continuous
Integration card at `390x844` and `768x1024`. Confirm:

- `Experiences` appears immediately above the five applied tokens;
- `Skills` appears immediately above the thirteen skill tokens;
- both labels use supporting-size secondary text;
- label-to-row spacing is smaller than group-to-group spacing;
- token order, neutral surfaces, and brand-colored icons are unchanged; and
- the card and document have no horizontal overflow or incoherent overlap.

Record screenshots and objective overflow measurements in this plan's ignored
SDD workspace.

- [ ] **Step 9: Commit the implementation**

Inspect `git diff` and `git diff --cached`, stage only the two task files, and
commit:

```bash
git add apps/github.io/src/app/devops-capability-evidence/dora-capability-card.spec.tsx apps/github.io/src/app/devops-capability-evidence/dora-capability-card.tsx
git commit -m "feat(github.io): label capability evidence rows"
```
