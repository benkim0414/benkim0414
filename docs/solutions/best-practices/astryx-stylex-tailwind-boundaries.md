---
title: Keep Astryx StyleX Tailwind Boundaries Explicit
date: 2026-07-24
category: best-practices
module: github.io Astryx styling
problem_type: best_practice
component: tooling
severity: medium
applies_when:
  - 'Migrating github.io React components to Astryx, StyleX, and Tailwind'
  - 'Choosing between Astryx base components, StyleX overrides, Tailwind utilities, and global CSS'
  - 'Fixing spacing, radius, color, or wrapper styling drift in Astryx-based UI'
related_components:
  - github.io Astryx Foundation
  - github.io skill components
  - github.io DevOps roadmap
  - StyleX Vite integration
tags: [astryx, stylex, tailwind, design-system, github-io, react]
---

# Keep Astryx StyleX Tailwind Boundaries Explicit

## Problem

The `github.io` app uses three styling surfaces at the same time: Astryx components and tokens, StyleX, and Tailwind utilities. During the StyleX migration, component visuals drifted when these surfaces were treated as interchangeable. The same symptoms repeated across citations, skills, and roadmap nodes: wrong base component choice, radius mismatches, spacing that did not match Astryx examples, and hardcoded layout values that bypassed the design system.

## Symptoms

- A component-specific visual fix used a custom border and radius even though the Astryx `Citation` example did not show that treatment.
- Skill category and skill token visuals looked inverted because category text used the token-like surface while branded skills needed the `Token` component.
- The skill list used custom wrapper spacing and a visible `Skills` label that duplicated the containing section.
- Roadmap nodes and React Flow overrides mixed raw CSS values, inline styles, and token fallbacks instead of routing styles through Astryx tokens and StyleX.

## Solution

Use the styling surface that matches the job:

- Astryx components define the semantic and visual base. `SkillCategory` is a `Badge` because categories are status-like labels (`apps/github.io/src/app/skills/skill-category.tsx:1`). `SkillToken` is a `Token` because skill names can render as compact labeled tokens with optional icons (`apps/github.io/src/app/skills/skill-token.tsx:2`). `SkillListItem` delegates row structure to Astryx `ListItem` instead of rebuilding its label and accessory layout (`apps/github.io/src/app/skills/skill-list-item.tsx:15`).
- StyleX owns component-specific overrides and dynamic component styling. `CertificationCitation` keeps the Astryx `Citation` base and only adds an icon-specific `xstyle` for the icon chip spacing mismatch (`apps/github.io/src/app/certifications/certification-citation.tsx:11`, `apps/github.io/src/app/certifications/certification-citation.tsx:74`). Roadmap nodes use StyleX plus typed Astryx token aliases for size, spacing, border, radius, shadow, and type scale (`apps/github.io/src/app/devops-roadmap/devops-roadmap-node.tsx:3`, `apps/github.io/src/app/devops-roadmap/devops-roadmap-node.tsx:20`).
- Tailwind utilities are limited to layout wrappers and utility styling. The app shell and the skill list width use class names for wrapper-level layout, while component interiors stay in Astryx or StyleX (`apps/github.io/src/app/skills/skill-list.tsx:17`).
- Global CSS stays small and scoped to surfaces that cannot be styled through component props. The app CSS imports the Astryx and Tailwind layers in a stable order, then keeps React Flow internals under `.devops-roadmap__flow` selectors (`apps/github.io/src/styles.css:1`, `apps/github.io/src/styles.css:29`).

The Vite StyleX plugin must also match the CSS layer contract. The app places StyleX layers after reset/theme/Astryx layers and before Tailwind utilities, which lets local component overrides win without making utilities unpredictable (`apps/github.io/vite.config.ts:21`, `apps/github.io/src/styles.css:1`).

## Why This Works

The boundaries keep each tool responsible for the layer it is best at:

1. Astryx preserves accessibility, component anatomy, spacing expectations, and default radius.
2. StyleX makes local component variants explicit and gives those variants typed access to Astryx token aliases.
3. Tailwind remains useful for wrappers without becoming a second component styling system.
4. Scoped global CSS handles third-party generated DOM only after the component API and StyleX paths are exhausted.

This also makes reviews easier. A mismatch between expected Astryx visuals and the implementation usually has a clear first question: is the correct Astryx base component being used? If yes, the next question is whether the difference is a narrow component override or just wrapper layout.

## Prevention

- Start from the Astryx component that matches the content role before writing local styles.
- Import Astryx typed token aliases for StyleX styles; do not write raw color, radius, spacing, or shadow values when an Astryx token exists.
- Keep visible headings and wrapper gaps in the containing section, not duplicated in inner reusable list components.
- Reserve `className` for layout wrappers and utilities such as width, max-width, margin, padding, and responsive placement.
- Keep global CSS scoped to third-party internals or root document defaults, and use Astryx CSS variables there.

## Related

- `CONCEPTS.md`
- `docs/solutions/logic-errors/color-only-certification-brand-fallback.md`
- `docs/solutions/workflow-issues/scaffold-nx-react-astryx-with-pnpm.md`
