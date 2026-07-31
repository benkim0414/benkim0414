# GitHub.io Astryx Typography Audit Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace direct user-visible raw styled typography in `github.io` app components with Astryx `Heading` and `Text`.

**Architecture:** Make two focused component edits that preserve the existing DOM semantics and accessibility contracts while moving owned title/body typography into Astryx components. Keep local StyleX for structural layout, card surfaces, React Flow node geometry, list wrapping, and token spacing.

**Tech Stack:** Nx, pnpm, React, Vitest, Testing Library, Astryx `Card`, `Heading`, `Layout`, `Text`, StyleX, React Flow.

## Global Constraints

- Target only direct user-visible typography drift in `apps/github.io/src/app/**`.
- Use Astryx `Heading` and `Text` for component-owned visible title or body copy.
- Preserve accessibility semantics, especially heading roles, heading levels, `aria-labelledby`, article labels, and list labels.
- Keep layout in Astryx `Layout` components where practical.
- Do not change visual intent beyond aligning typography with Astryx examples.
- Do not replace text inside third-party generated internals unless there is a clear wrapper-level Astryx boundary.
- Keep StyleX and Tailwind for layout, sizing, wrapping, and non-typographic styling only when needed.
- Avoid arbitrary pixel or font values; use Astryx component props and tokens.
- Leave `CapabilityEvidence` accessibility `span role="group"` wrappers unchanged.
- Leave `SkillRating` decorative star/rating spans unchanged.
- Leave `DevOpsCapabilityEvidenceRadar` MUI `sx` axis-label styling unchanged.
- Leave raw text in test mocks unchanged.

---

## File Structure

- Modify `apps/github.io/src/app/devops-capability-evidence/dora-capability-card.tsx`: replace raw styled `h3` and `p` with Astryx `Heading` and `Text`; remove local typography StyleX.
- Modify `apps/github.io/src/app/devops-roadmap/devops-roadmap-node.tsx`: replace raw styled `h3` with Astryx `Heading`; remove local title typography StyleX.
- Modify only if needed `apps/github.io/src/app/devops-capability-evidence/dora-capability-card.spec.tsx`: strengthen existing assertions if heading or article semantics are not covered after the component edit.
- Modify only if needed `apps/github.io/src/app/devops-roadmap/devops-roadmap.spec.tsx`: strengthen existing assertions if roadmap node heading semantics are not covered after the component edit.

### Task 1: DORA Capability Card Astryx Typography

**Files:**
- Modify: `apps/github.io/src/app/devops-capability-evidence/dora-capability-card.tsx`
- Test: `apps/github.io/src/app/devops-capability-evidence/dora-capability-card.spec.tsx`

**Interfaces:**
- Consumes: `DoraCapabilityCardProps`, `getDoraCapabilityCardEvidenceRows`, `CapabilityEvidence`, Astryx `Card`, Astryx `VStack`.
- Produces: `DoraCapabilityCard(props: DoraCapabilityCardProps): ReactElement` with the same public props, article labeling, evidence row rendering, and heading/name behavior.

- [ ] **Step 1: Confirm the existing accessibility test coverage**

Inspect the first `DoraCapabilityCard` test. It must keep an assertion equivalent to:

```tsx
expect(
  screen.getByRole('heading', { name: 'Continuous Integration' }),
).toBeTruthy();
expect(
  screen.getByText(doraCapabilityDescriptions['continuous-integration']),
).toBeTruthy();
expect(screen.getByTestId('dora-capability-card')).toBeTruthy();
```

If that assertion is present, do not add a source-level or snapshot test. If the assertion is missing, add this exact assertion to the existing `renders the full capability title and description` test.

- [ ] **Step 2: Run the focused test before editing**

Run:

```sh
pnpm vitest run apps/github.io/src/app/devops-capability-evidence/dora-capability-card.spec.tsx
```

Expected: PASS. This establishes that the current accessible behavior is covered before the internal component boundary changes.

- [ ] **Step 3: Replace DORA card typography with Astryx components**

In `apps/github.io/src/app/devops-capability-evidence/dora-capability-card.tsx`, change the imports from:

```tsx
import { Card } from '@astryxdesign/core/Card';
import { VStack } from '@astryxdesign/core/Layout';
import {
  colorVars,
  spacingVars,
  typeScaleVars,
} from '@astryxdesign/core/theme/tokens.stylex';
```

to:

```tsx
import { Card } from '@astryxdesign/core/Card';
import { Heading } from '@astryxdesign/core/Heading';
import { VStack } from '@astryxdesign/core/Layout';
import { Text } from '@astryxdesign/core/Text';
import { spacingVars } from '@astryxdesign/core/theme/tokens.stylex';
```

Remove these StyleX entries completely:

```tsx
title: {
  margin: 0,
  color: colorVars['--color-text-primary'],
  fontSize: typeScaleVars['--text-heading-3-size'],
  lineHeight: typeScaleVars['--text-heading-3-leading'],
},
description: {
  margin: 0,
  color: colorVars['--color-text-secondary'],
  fontSize: typeScaleVars['--text-body-size'],
  lineHeight: typeScaleVars['--text-body-leading'],
},
```

Replace the raw title and description JSX:

```tsx
<h3 id={titleId} {...stylex.props(styles.title)}>
  {capability.label}
</h3>
<p {...stylex.props(styles.description)}>{description}</p>
```

with:

```tsx
<Heading id={titleId} level={3}>
  {capability.label}
</Heading>
<Text type="supporting" as="p">
  {description}
</Text>
```

- [ ] **Step 4: Run the focused test after editing**

Run:

```sh
pnpm vitest run apps/github.io/src/app/devops-capability-evidence/dora-capability-card.spec.tsx
```

Expected: PASS. The capability title remains reachable by heading role, the description remains visible, the article keeps `aria-labelledby`, and evidence rows keep their existing list labels.

- [ ] **Step 5: Inspect the component diff**

Run:

```sh
git diff -- apps/github.io/src/app/devops-capability-evidence/dora-capability-card.tsx apps/github.io/src/app/devops-capability-evidence/dora-capability-card.spec.tsx
```

Expected: the diff only imports Astryx typography components, removes local title/body typography StyleX, replaces raw `h3`/`p` with `Heading`/`Text`, and includes no changes to evidence row grouping or ordering.

### Task 2: DevOps Roadmap Node Astryx Heading

**Files:**
- Modify: `apps/github.io/src/app/devops-roadmap/devops-roadmap-node.tsx`
- Test: `apps/github.io/src/app/devops-roadmap/devops-roadmap.spec.tsx`

**Interfaces:**
- Consumes: `DevOpsRoadmapItem`, Astryx token aliases, React Flow `Handle`, `Position`, `SkillToken`, `CertificationCitation`.
- Produces: `DevOpsRoadmapNode({ item }: { item: DevOpsRoadmapItem })` with the same article label, heading name, list labels, node width constants, and React Flow handles.

- [ ] **Step 1: Strengthen the existing roadmap node heading assertion if needed**

Inspect the `renders the core node title and purple-ticked skill tokens` test. It must assert the node title through the heading role:

```tsx
expect(getByRole('heading', { name: 'Containers' })).toBeTruthy();
```

If the test already has an equivalent heading-role assertion, keep it. If it only asserts raw text, replace that title assertion with the exact heading-role assertion above.

- [ ] **Step 2: Run the focused roadmap test before editing**

Run:

```sh
pnpm vitest run apps/github.io/src/app/devops-roadmap/devops-roadmap.spec.tsx
```

Expected: PASS. This establishes that roadmap node behavior is covered before the internal typography boundary changes.

- [ ] **Step 3: Replace roadmap node title typography with Astryx Heading**

In `apps/github.io/src/app/devops-roadmap/devops-roadmap-node.tsx`, add the Astryx `Heading` import:

```tsx
import { Heading } from '@astryxdesign/core/Heading';
```

Change the token imports from:

```tsx
import {
  borderVars,
  colorVars,
  radiusVars,
  shadowVars,
  spacingVars,
  typeScaleVars,
} from '@astryxdesign/core/theme/tokens.stylex';
```

to:

```tsx
import {
  borderVars,
  colorVars,
  radiusVars,
  shadowVars,
  spacingVars,
} from '@astryxdesign/core/theme/tokens.stylex';
```

Remove this StyleX entry completely:

```tsx
title: {
  margin: 0,
  fontSize: typeScaleVars['--text-heading-3-size'],
  lineHeight: typeScaleVars['--text-heading-3-leading'],
},
```

Replace:

```tsx
<h3 {...stylex.props(styles.title)}>{item.title}</h3>
```

with:

```tsx
<Heading level={3}>{item.title}</Heading>
```

- [ ] **Step 4: Run the focused roadmap test after editing**

Run:

```sh
pnpm vitest run apps/github.io/src/app/devops-roadmap/devops-roadmap.spec.tsx
```

Expected: PASS. The roadmap node title remains reachable by heading role, skill and certification lists keep their labels, width constants remain unchanged, and React Flow handles remain rendered.

- [ ] **Step 5: Inspect the component diff**

Run:

```sh
git diff -- apps/github.io/src/app/devops-roadmap/devops-roadmap-node.tsx apps/github.io/src/app/devops-roadmap/devops-roadmap.spec.tsx
```

Expected: the diff only imports Astryx `Heading`, removes local title typography StyleX, replaces raw `h3` with `Heading`, and includes no changes to node sizing, handles, token lists, or certification lists.

### Task 3: Audit Confirmation And Full Verification

**Files:**
- Verify: `apps/github.io/src/app/devops-capability-evidence/dora-capability-card.tsx`
- Verify: `apps/github.io/src/app/devops-roadmap/devops-roadmap-node.tsx`
- Verify unchanged: `apps/github.io/src/app/devops-capability-evidence/capability-evidence.tsx`
- Verify unchanged: `apps/github.io/src/app/skills/skill-rating.tsx`
- Verify unchanged: `apps/github.io/src/app/devops-capability-evidence/devops-capability-evidence-radar.tsx`

**Interfaces:**
- Consumes: completed Task 1 and Task 2 component edits.
- Produces: a verified branch where direct user-visible typography drift is removed and intentionally skipped cases remain unchanged.

- [ ] **Step 1: Re-run the audit search**

Run:

```sh
rg -n "className=\\{?['\"][^'\"]*text-|fontSize|fontWeight|lineHeight|<h[1-6][ >]|<p[ >]|<span[ >]|<small[ >]|<strong[ >]|style=\\{\\{" apps/github.io/src/app -g '*.tsx' -g '*.ts'
```

Expected remaining findings:

```text
apps/github.io/src/app/skills/skill-rating.tsx: decorative rating spans
apps/github.io/src/app/devops-capability-evidence/capability-evidence.tsx: accessibility group spans
apps/github.io/src/app/devops-capability-evidence/devops-capability-evidence-radar.tsx: MUI generated axis label sx typography
apps/github.io/src/app/devops-roadmap/devops-roadmap.spec.tsx: raw span in test mock
```

Expected removed findings:

```text
apps/github.io/src/app/devops-capability-evidence/dora-capability-card.tsx: raw h3, raw p, title fontSize, title lineHeight, description fontSize, description lineHeight
apps/github.io/src/app/devops-roadmap/devops-roadmap-node.tsx: raw h3, title fontSize, title lineHeight
```

- [ ] **Step 2: Run the full requested project test**

Run:

```sh
pnpm nx test github.io --skip-nx-cache
```

Expected: PASS.

- [ ] **Step 3: Inspect the full diff**

Run:

```sh
git diff -- apps/github.io/src/app/devops-capability-evidence/dora-capability-card.tsx apps/github.io/src/app/devops-capability-evidence/dora-capability-card.spec.tsx apps/github.io/src/app/devops-roadmap/devops-roadmap-node.tsx apps/github.io/src/app/devops-roadmap/devops-roadmap.spec.tsx
```

Expected: only the two direct-drift components changed, plus test assertion adjustments if they were necessary. No third-party chart internals, rating spans, capability evidence wrappers, or test mocks changed.

- [ ] **Step 4: Commit the implementation**

Stage explicit paths only:

```sh
git add apps/github.io/src/app/devops-capability-evidence/dora-capability-card.tsx
git add apps/github.io/src/app/devops-roadmap/devops-roadmap-node.tsx
```

If test files changed, stage only the changed test files:

```sh
git add apps/github.io/src/app/devops-capability-evidence/dora-capability-card.spec.tsx
git add apps/github.io/src/app/devops-roadmap/devops-roadmap.spec.tsx
```

Commit:

```sh
git commit -m "fix(github.io): use Astryx typography in app cards"
```

Expected: one focused implementation commit after the already committed design and plan documents.
