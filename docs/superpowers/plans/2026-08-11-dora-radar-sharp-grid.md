# DORA Radar Sharp Grid Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Render the DORA capability Radar with ten sharp polygon grid rings instead of circular rings.

**Architecture:** Keep the existing `DevOpsCapabilityEvidenceRadar` and MUI `RadarChart` integration intact. Change only the supported `shape` prop, and lock the rendered grid geometry with a focused DOM regression assertion.

**Tech Stack:** React, TypeScript, MUI X Charts `RadarChart`, Vitest, Testing Library, Nx, Storybook.

## Global Constraints

- Preserve the 0–5 score domain and exactly ten half-step grid divisions.
- Preserve evidence-derived scores, ordering, dimensions, margins, colors, labels, tooltip behavior, accessibility summary, keyboard behavior, and animation settings.
- Do not add a custom grid slot, bespoke SVG, dependency, or unrelated refactor.
- Keep the existing Tailscale-accessible Storybook server available for `Default` and `NarrowViewport` inspection.

---

### Task 1: Render and verify a sharp Radar grid

**Files:**
- Modify: `apps/github.io/src/app/devops-capability-evidence/devops-capability-evidence-radar.tsx:79-105`
- Test: `apps/github.io/src/app/devops-capability-evidence/devops-capability-evidence-radar.spec.tsx:8-52`

**Interfaces:**
- Consumes: MUI `RadarChart` prop `shape: "sharp" | "circular"` and `radarClasses.gridDivider`.
- Produces: the existing `DevOpsCapabilityEvidenceRadar` API with ten polygon grid-divider `<path>` elements and no circular grid-divider `<circle>` elements.

- [ ] **Step 1: Write the failing geometry regression assertion**

Extend the first Radar test immediately after the existing ten-divider assertion:

```tsx
const gridDividerSelector = `.${radarClasses.gridDivider}`;

expect(container.querySelectorAll(gridDividerSelector)).toHaveLength(10);
expect(container.querySelectorAll(`path${gridDividerSelector}`)).toHaveLength(
  10,
);
expect(container.querySelectorAll(`circle${gridDividerSelector}`)).toHaveLength(
  0,
);
```

Replace the existing inline divider selector assertion rather than retaining a duplicate count assertion.

- [ ] **Step 2: Run the focused test and verify RED**

Run:

```bash
node_modules/.bin/vitest run apps/github.io/src/app/devops-capability-evidence/devops-capability-evidence-radar.spec.tsx --reporter=verbose
```

Expected: FAIL because the current circular grid renders zero divider paths and ten divider circles; all unrelated Radar assertions remain passing.

- [ ] **Step 3: Apply the minimal sharp-grid change**

In the existing `RadarChart`, replace:

```tsx
shape="circular"
```

with:

```tsx
shape="sharp"
```

Do not change any other chart prop or styling.

- [ ] **Step 4: Run focused and project verification**

Run:

```bash
node_modules/.bin/vitest run apps/github.io/src/app/devops-capability-evidence/devops-capability-evidence-radar.spec.tsx --reporter=verbose
node_modules/.bin/nx test github.io --skip-nx-cache
node_modules/.bin/nx lint github.io --skip-nx-cache
node_modules/.bin/nx build-storybook github.io --skip-nx-cache
git diff --check
```

Expected: all commands exit 0. The focused test reports ten divider paths and zero divider circles. Existing unrelated warnings may remain but must not be introduced or worsened by this two-file change.

- [ ] **Step 5: Confirm Storybook handoff**

Confirm the running Storybook session hot-reloads without a compile error, then provide these Tailscale URLs for human visual acceptance:

```text
http://100.113.57.51:6006/?path=/story/github-io-devops-capability-evidence-radar--default
http://100.113.57.51:6006/?path=/story/github-io-devops-capability-evidence-radar--narrow-viewport
```

The human acceptance check covers polygon-ring appearance, label legibility, clipping, and horizontal overflow. Do not claim this visual check passed until the user confirms it from the iPad.

- [ ] **Step 6: Commit the implementation**

Stage only the two implementation files:

```bash
git add apps/github.io/src/app/devops-capability-evidence/devops-capability-evidence-radar.tsx apps/github.io/src/app/devops-capability-evidence/devops-capability-evidence-radar.spec.tsx
git diff --cached --check
git diff --cached
git commit -m "feat(github.io): sharpen DORA Radar grid"
```
