---
title: Build Standalone MUI X Radar Charts With Astryx Tokens
date: 2026-07-25
category: design-patterns
module: github.io DevOpsCapabilityRadar
problem_type: design_pattern
component: tooling
severity: medium
applies_when:
  - Embedding a third-party MUI X chart inside the Astryx-styled github.io React app
  - Preserving Astryx design-system tokens while styling chart labels, fills, stripes, and tooltips
  - Keeping radar metrics on a correct 0-5 radial scale with stable Storybook visibility
related_components:
  - github.io Astryx styling
  - MUI X RadarChart
  - Storybook
tags: [github-io, react, mui-x, radar-chart, astryx, storybook, design-system]
---

# Standalone GitHub.io DevOps Capability Radar

This standalone pattern has been superseded by the evidence-backed radar in `apps/github.io/src/app/devops-capability-evidence/devops-capability-evidence-radar.tsx`.

Use `DevOpsCapabilityEvidenceRadar` for current work. It accepts derived `DoraCapabilityScore[]`, filters empty capability axes, keeps the MUI X chart visual-only, and exposes a hidden accessible summary from public portfolio evidence.

The old standalone `apps/github.io/src/app/devops-capability-radar/` source folder was removed because static radar scores duplicated the evidence-backed model.
