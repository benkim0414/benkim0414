---
title: Build Portfolio Capability Radar From Public Evidence
date: 2026-07-27
last_updated: 2026-08-09
category: design-patterns
module: github.io DevOps capability evidence
problem_type: design_pattern
component: tooling
severity: medium
applies_when:
  - Building a reusable portfolio radar from personal capability evidence
  - Mapping LinkedIn-style evidence such as skills, learning, experience, education, certifications, and projects to DORA capability dimensions
  - Rendering public portfolio components when the source experience may contain private company information
related_components:
  - github.io DevOps capability evidence radar
  - github.io DevOpsCapabilityEvidenceRadar
  - Storybook
tags: [github-io, react, devops, dora, portfolio, evidence, privacy]
---

# Build Portfolio Capability Radar From Public Evidence

## Context

The `github.io` DevOps capability evidence radar visualizes personal DevOps capability against DORA capability dimensions. Its input shape is intentionally portfolio-like: skills, learning, experience, education, certifications, and projects can all support one or more capabilities. The bundled evidence catalogs keep company details public-safe, while scoring tests reject private, sensitive, and unsupported evidence (`apps/github.io/src/app/devops-capability-evidence/devops-capability-evidence.spec.ts:542-662`).

The important design constraint is that the radar is a reusable public portfolio component, not a trusted private dashboard. It may appear in cards, panels, Storybook stories, or page sections, and callers can pass score objects that were not produced by the default utility.

## Guidance

Treat the bundled portfolio evidence as a public projection. Evidence can represent private work experience, but the shipped object should contain only public-safe titles, summaries, technologies, dates, issuers, and capability mappings. Do not depend on client-side filtering to protect confidential raw company data.

Centralize the public evidence rule before deriving radar scores. `getPublicCapabilityEvidence` first removes items that are not public or are marked sensitive, then keeps skills only when they have distinct public non-skill support with at least one shared capability (`apps/github.io/src/app/devops-capability-evidence/devops-capability-evidence.scoring.ts:23` through `apps/github.io/src/app/devops-capability-evidence/devops-capability-evidence.scoring.ts:47`).

Keep the scoring contract evidence-first. `getCapabilityEvidenceScores` scores only public evidence, sums strength values per capability, caps the score at five, records contributing evidence IDs, identifies the strongest evidence item, and drops capabilities with no evidence (`apps/github.io/src/app/devops-capability-evidence/devops-capability-evidence.scoring.ts:63` through `apps/github.io/src/app/devops-capability-evidence/devops-capability-evidence.scoring.ts:104`).

Defend the reusable component boundary, even when upstream utilities already filtered the data. The radar filters caller-provided scores again and returns `null` when nothing remains (`apps/github.io/src/app/devops-capability-evidence/devops-capability-evidence-radar.tsx:31` through `apps/github.io/src/app/devops-capability-evidence/devops-capability-evidence-radar.tsx:38`).

Make evidence-backed charts responsive and accessible as reusable figures. The radar keeps the MUI X chart visual-only, exposes a hidden text summary, and wraps the chart in a full-width container with a max width rather than assuming a fixed panel size (`apps/github.io/src/app/devops-capability-evidence/devops-capability-evidence-radar.tsx:40` through `apps/github.io/src/app/devops-capability-evidence/devops-capability-evidence-radar.tsx:87`).

## Why This Matters

Portfolio capability charts carry a trust problem that internal dashboards do not. A dashboard can be allowed to know precise deployment counts, incident records, repository names, or customer context; a public portfolio cannot. The public projection keeps the model useful for honest capability storytelling while making the private boundary explicit.

Reusable React components also need their own guardrails. If the radar silently trusts `scores`, a future page or story can accidentally show empty capability axes. Keeping defensive filtering in both the scoring utility and component boundary makes the chart safe to reuse in panels, cards, or standalone page sections.

## When to Apply

- A personal portfolio needs capability charts backed by real experience without exposing private company information.
- A DORA capability visualization maps profile evidence to capability dimensions instead of reporting company-level DORA delivery metrics.
- The same public evidence model supports radar and compact capability-card surfaces with surface-specific renderers.
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

The `filters private and unsupported skill evidence out of public scoring` and `requires a public non-skill support item with a shared capability for skills` tests cover unsupported skills, private evidence, sensitive evidence, self-support, circular skill support, and wrong-capability support.

Let score-based components hide empty capabilities themselves:

```tsx
const visibleScores = scores.filter((score) => score.score > 0);

if (visibleScores.length === 0) {
  return null;
}
```

The exported `DevOpsCapabilityEvidenceRadar` component follows this boundary, and the `omits definitions without evidence from scores and the matrix` test asserts that definitions without evidence are omitted from scores.

## Related

- `CONCEPTS.md`
- `apps/github.io/src/app/devops-capability-evidence/devops-capability-evidence-radar.tsx`
- `docs/solutions/conventions/tokenize-dora-capability-evidence.md`
- `docs/solutions/design-patterns/compact-capability-evidence-renderers.md`
- `docs/solutions/best-practices/astryx-stylex-tailwind-boundaries.md`
