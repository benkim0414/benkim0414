---
title: Build Portfolio Capability Visualizations From Public Evidence
date: 2026-07-27
category: design-patterns
module: github.io DevOps capability evidence
problem_type: design_pattern
component: tooling
severity: medium
applies_when:
  - Building reusable portfolio charts from personal capability evidence
  - Mapping LinkedIn-style evidence such as skills, learning, experience, education, certifications, and projects to DORA capability dimensions
  - Rendering public portfolio components when the source experience may contain private company information
related_components:
  - github.io DevOps capability evidence components
  - github.io DevOpsCapabilityEvidenceRadar
  - Storybook
tags: [github-io, react, devops, dora, portfolio, evidence, privacy]
---

# Build Portfolio Capability Visualizations From Public Evidence

## Context

The `github.io` DevOps capability evidence components visualize personal DevOps capability against DORA capability dimensions. Their input shape is intentionally portfolio-like: skills, learning, experience, education, certifications, and projects can all support one or more capabilities. The seed evidence keeps company details public-safe; for example, the CI/CD experience item is public, not sensitive, and uses a generalized summary rather than operational records (`apps/github.io/src/app/devops-capability-evidence/devops-capability-evidence.data.ts:65` through `apps/github.io/src/app/devops-capability-evidence/devops-capability-evidence.data.ts:81`).

The important design constraint is that these components are reusable public portfolio components, not trusted private dashboards. They may appear in cards, panels, Storybook stories, or page sections, and callers can pass evidence or score objects that were not produced by the default utility.

## Guidance

Treat the bundled portfolio evidence as a public projection. Evidence can represent private work experience, but the shipped object should contain only public-safe titles, summaries, technologies, dates, issuers, and capability mappings. Do not depend on client-side filtering to protect confidential raw company data.

Centralize the public evidence rule and reuse it everywhere evidence text can render. `getPublicCapabilityEvidence` first removes items that are not public or are marked sensitive, then keeps skills only when they have distinct public non-skill support with at least one shared capability (`apps/github.io/src/app/devops-capability-evidence/devops-capability-evidence.scoring.ts:23` through `apps/github.io/src/app/devops-capability-evidence/devops-capability-evidence.scoring.ts:47`). Components that show evidence details call that same utility before rendering timelines, certification maps, and strongest-evidence summaries (`apps/github.io/src/app/devops-capability-evidence/devops-evidence-timeline.tsx:18`, `apps/github.io/src/app/devops-capability-evidence/devops-certification-capability-map.tsx:21`, and `apps/github.io/src/app/devops-capability-evidence/devops-capability-bar-list.tsx:22`).

Keep the scoring contract evidence-first. `getCapabilityEvidenceScores` scores only public evidence, sums strength values per capability, caps the score at five, records contributing evidence IDs, identifies the strongest evidence item, and drops capabilities with no evidence (`apps/github.io/src/app/devops-capability-evidence/devops-capability-evidence.scoring.ts:63` through `apps/github.io/src/app/devops-capability-evidence/devops-capability-evidence.scoring.ts:104`). The matrix uses the same public projection and drops rows with no evidence (`apps/github.io/src/app/devops-capability-evidence/devops-capability-evidence.scoring.ts:106` through `apps/github.io/src/app/devops-capability-evidence/devops-capability-evidence.scoring.ts:132`).

Defend the reusable component boundary, even when upstream utilities already filtered the data. The radar filters caller-provided scores again and returns `null` when nothing remains (`apps/github.io/src/app/devops-capability-evidence/devops-capability-evidence-radar.tsx:31` through `apps/github.io/src/app/devops-capability-evidence/devops-capability-evidence-radar.tsx:38`). The bar list filters zero scores, rechecks public evidence before dereferencing `strongestEvidenceId`, and renders the strongest evidence title only when that evidence belongs to the same capability (`apps/github.io/src/app/devops-capability-evidence/devops-capability-bar-list.tsx:22` through `apps/github.io/src/app/devops-capability-evidence/devops-capability-bar-list.tsx:65`).

Make evidence-backed charts responsive and accessible as reusable figures. The radar keeps the MUI X chart visual-only, exposes a hidden text summary, and wraps the chart in a full-width container with a max width rather than assuming a fixed panel size (`apps/github.io/src/app/devops-capability-evidence/devops-capability-evidence-radar.tsx:40` through `apps/github.io/src/app/devops-capability-evidence/devops-capability-evidence-radar.tsx:87`).

## Why This Matters

Portfolio capability charts carry a trust problem that internal dashboards do not. A dashboard can be allowed to know precise deployment counts, incident records, repository names, or customer context; a public portfolio cannot. The public projection keeps the model useful for honest capability storytelling while making the private boundary explicit.

Reusable React components also need their own guardrails. If a component silently trusts `scores`, `evidenceIds`, or `strongestEvidenceId`, a future page or story can accidentally show unsupported skills, private records, unrelated evidence, or empty capability axes. Keeping defensive filtering in both the scoring utility and component boundary makes each chart safe to reuse in panels, cards, or standalone page sections.

## When to Apply

- A personal portfolio needs capability charts backed by real experience without exposing private company information.
- A DORA capability visualization maps profile evidence to capability dimensions instead of reporting company-level DORA delivery metrics.
- A component suite renders the same evidence model in multiple forms, such as radar, bar list, matrix, donut, timeline, and certification map.
- Storybook stories or tests need to prove that empty, private, sensitive, unsupported, or malformed evidence does not leak into visible output.

## Examples

Centralize the public projection before any score or evidence count is derived:

```ts
const publicItems = items.filter(
  (item) => item.isPublic && !item.isSensitive,
);
```

The current implementation applies that rule in `apps/github.io/src/app/devops-capability-evidence/devops-capability-evidence.scoring.ts:26` through `apps/github.io/src/app/devops-capability-evidence/devops-capability-evidence.scoring.ts:28`.

Require a skill to be supported by separate public non-skill evidence that maps to the same capability:

```ts
return Boolean(
  support &&
    support.id !== item.id &&
    support.type !== 'skill' &&
    support.capabilityKeys.some((key) => item.capabilityKeys.includes(key)),
);
```

The tests cover unsupported skills, private evidence, sensitive evidence, self-support, circular skill support, and wrong-capability support (`apps/github.io/src/app/devops-capability-evidence/devops-capability-evidence.spec.ts:75` through `apps/github.io/src/app/devops-capability-evidence/devops-capability-evidence.spec.ts:195`).

Let score-based components hide empty capabilities themselves:

```tsx
const visibleScores = scores.filter((score) => score.score > 0);

if (visibleScores.length === 0) {
  return null;
}
```

The radar follows this boundary at `apps/github.io/src/app/devops-capability-evidence/devops-capability-evidence-radar.tsx:31` through `apps/github.io/src/app/devops-capability-evidence/devops-capability-evidence-radar.tsx:38`, and scoring tests assert that definitions without evidence are omitted from both scores and the matrix (`apps/github.io/src/app/devops-capability-evidence/devops-capability-evidence.spec.ts:197` through `apps/github.io/src/app/devops-capability-evidence/devops-capability-evidence.spec.ts:230`).

## Related

- `CONCEPTS.md`
- `apps/github.io/src/app/devops-capability-evidence/devops-capability-evidence-radar.tsx`
- `docs/solutions/best-practices/astryx-stylex-tailwind-boundaries.md`
