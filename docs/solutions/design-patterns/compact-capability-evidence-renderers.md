---
title: Use Compact Capability Evidence Renderers
date: 2026-07-28
category: design-patterns
module: github.io DevOps capability evidence
problem_type: design_pattern
component: tooling
severity: medium
applies_when:
  - Rendering one public capability evidence item in compact UI
  - Choosing between token and citation affordances for portfolio evidence
  - Distinguishing evidence categories that can share the same technology label
related_components:
  - github.io DevOpsCapabilityEvidenceRadar
  - Astryx components
  - Storybook
tags: [github-io, react, evidence, astryx, icons, accessibility]
---

# Use Compact Capability Evidence Renderers

## Context

This pattern has been superseded for current `github.io` work. The compact `CapabilityEvidence` renderer and its helper files were removed when the DevOps capability evidence surface was narrowed to the radar chart only.

Use `DevOpsCapabilityEvidenceRadar` for current DevOps capability evidence visualization work. It consumes derived `DoraCapabilityScore[]` from public-safe evidence and leaves evidence details in the shared data/scoring model rather than rendering per-evidence compact UI.

## Guidance

Do not add new `CapabilityEvidence` Storybook stories or compact evidence renderer files unless a new approved spec reintroduces that UI surface. Keep the current DevOps capability evidence Storybook group focused on `GitHub.io/DevOps Capability Evidence/Radar`.

## Why This Matters

Retiring this doc prevents future work from rebuilding removed Storybook entries by following stale guidance.

## When to Apply

- Reviewing historical work that created compact evidence renderers.
- Explaining why the compact evidence renderer files are no longer present.
- Avoiding stale Storybook entries under the DevOps capability evidence group.

## Examples

Current Storybook should expose the evidence radar story only:

```text
GitHub.io/DevOps Capability Evidence/Radar
```

## Related

- `CONCEPTS.md`
- `docs/solutions/design-patterns/public-evidence-portfolio-visualizations.md`
- `docs/solutions/best-practices/astryx-stylex-tailwind-boundaries.md`
