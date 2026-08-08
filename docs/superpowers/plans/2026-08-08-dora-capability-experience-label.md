# DORA Capability Experience Label Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the DORA capability card's visible and accessible `Experiences` row label with the conventional singular `Experience` label.

**Architecture:** Keep the existing row-label map and `aria-labelledby` relationship. Change one presentation string and update every component-test query that names that list; no data or layout path changes.

**Tech Stack:** React, TypeScript, Astryx Design, Testing Library, Vitest, Nx, Storybook.

## Global Constraints

- The visible `applied` group label is exactly `Experience`.
- The applied evidence list's accessible name is exactly `Experience` through the existing `aria-labelledby` relationship.
- The `Skills` label remains unchanged.
- Preserve `<Text type="supporting" color="secondary">`, spacing, and all row semantics.
- Do not change evidence data, types, selection, grouping, order, chronology, token styling, icons, card dimensions, or Storybook data.
- Do not add labels for certification or learning rows.

---

### Task 1: Use The Singular Experience Label

**Files:**
- Modify: `apps/github.io/src/app/devops-capability-evidence/dora-capability-card.spec.tsx`
- Modify: `apps/github.io/src/app/devops-capability-evidence/dora-capability-card.tsx`

**Interfaces:**
- Consumes: `visibleEvidenceGroupLabels` and the existing list-to-label `aria-labelledby` relationship.
- Produces: visible and accessible applied-row label `Experience`; unchanged skill-row label `Skills`.

- [ ] **Step 1: Update the component contract to the singular label**

In `dora-capability-card.spec.tsx`, replace only the applied-row visible/list
label string `Experiences` with `Experience` in these assertions and queries:

```tsx
expect(screen.getByText('Experience')).toBeTruthy();
expect(screen.getByRole('list', { name: 'Experience' })).toBe(rows[0]);
```

```tsx
const appliedRow = screen.getByRole('list', { name: 'Experience' });
```

```tsx
const row = screen.getByRole('list', { name: 'Experience' });

expect(row.getAttribute('data-wrap')).toBe('true');
expect(screen.getByRole('list', { name: 'Experience' })).toBe(row);
```

```tsx
expect(screen.queryByText('Experience')).toBeNull();
```

Do not change token-level strings such as `Experience evidence: CI`; those are
separate evidence-type accessible labels.

- [ ] **Step 2: Run the focused test to verify RED**

Run:

```bash
../../node_modules/.bin/vitest run --config apps/github.io/vite.config.ts dora-capability-card.spec.tsx
```

Expected: FAIL because the component still renders and names the list
`Experiences`.

- [ ] **Step 3: Change the presentation label**

In `dora-capability-card.tsx`, change only the applied entry in
`visibleEvidenceGroupLabels`:

```tsx
const visibleEvidenceGroupLabels: Partial<
  Record<DoraCapabilityCardEvidenceGroup, string>
> = {
  applied: 'Experience',
  skills: 'Skills',
};
```

Do not change the `Text`, `VStack`, `useId`, `aria-labelledby`, or fallback
`aria-label` implementation.

- [ ] **Step 4: Run focused tests to verify GREEN**

Run:

```bash
../../node_modules/.bin/vitest run --config apps/github.io/vite.config.ts dora-capability-card.spec.tsx dora-capability-card.stories.spec.ts capability-evidence.spec.tsx
```

Expected: PASS with the singular list label and unchanged evidence/token
contracts.

- [ ] **Step 5: Run project verification**

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
diagnostic may involve the two task files.

- [ ] **Step 6: Validate Storybook responsively**

Serve the built Storybook on loopback and inspect the Continuous Integration
card at `390x844` and `768x1024`. Confirm:

- the visible label is `Experience`, not `Experiences`;
- the applied list is named `Experience` through `aria-labelledby`;
- `Skills`, all 5+13 tokens, chronology, spacing, colors, and icons are
  unchanged; and
- neither the card nor document has horizontal overflow or overlap.

Record screenshots and objective measurements in this plan's ignored SDD
workspace.

- [ ] **Step 7: Commit the implementation**

Inspect `git diff` and `git diff --cached`, stage only the two task files, and
commit:

```bash
git add apps/github.io/src/app/devops-capability-evidence/dora-capability-card.spec.tsx apps/github.io/src/app/devops-capability-evidence/dora-capability-card.tsx
git commit -m "fix(github.io): use singular Experience label"
```
