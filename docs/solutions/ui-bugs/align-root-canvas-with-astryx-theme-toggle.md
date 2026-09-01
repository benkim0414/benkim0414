---
title: Align Root Canvas With Astryx Theme Toggle
date: 2026-08-30
category: ui-bugs
module: github.io Astryx theming
problem_type: ui_bug
component: tooling
symptoms:
  - Light-mode Astryx content appeared against a dark system canvas in transparent navigation and page areas
  - Top-nav icon buttons and headings, including All skills and DORA capabilities, could become invisible in light mode
root_cause: logic_error
resolution_type: code_fix
severity: medium
related_components:
  - github.io Astryx Foundation
  - GlobalNavigationLayout
  - root document canvas
tags: [github-io, astryx, theme-toggle, light-mode, dark-mode, color-scheme, root-canvas, accessibility]
---

# Align Root Canvas With Astryx Theme Toggle

## Problem

During light-mode verification of the `github.io` app, transparent navigation
and page areas rendered against a dark canvas while Astryx content used
light-mode semantic foregrounds. The root document surface needed an explicit,
application-owned scheme declaration alongside its semantic canvas rules.

## Symptoms

- Light mode left transparent navigation and page areas on a dark canvas.
- Astryx semantic foregrounds became difficult or impossible to read in those
  areas, including top-nav icon buttons and headings such as All skills and
  DORA capabilities.
- The root document surface owns the mismatch because `html` and `body` use
  `--color-background-body`, while `body` also uses `--color-text-primary` in
  [styles.css](../../../apps/github.io/src/styles.css).

## What Didn't Work

- Relying on the default Astryx reset mapping left the application root scheme
  owned by a zero-specificity rule in the lowest-priority reset layer. That is
  a sensible library default, but it is not the right ownership boundary for
  an application-level root canvas contract.
- Changing individual component foregrounds or adding opaque page wrappers
  would only conceal the root-canvas mismatch and duplicate responsibility.
- Replacing Astryx semantic variables with literal colours would bypass the
  existing token-based root styling.

## Solution

Synchronize the root document scheme with the `data-theme` state set by the
theme provider, while retaining Astryx semantic variables for the canvas:

```css
html[data-theme="light"] {
  color-scheme: light;
}

html[data-theme="dark"] {
  color-scheme: dark;
}
```

Keep the root canvas token-based:

```css
html {
  background: var(--color-background-body);
}

body {
  color: var(--color-text-primary);
  background: var(--color-background-body);
}
```

The application-specific mapping belongs adjacent to those root rules in
[styles.css](../../../apps/github.io/src/styles.css). It intentionally wins
over Astryx's lower-priority reset default, without replacing Astryx component
theming.

## Why This Works

`color-scheme` determines how the `light-dark()` values underlying Astryx
semantic variables resolve. Astryx deliberately exposes its reset selectors
through `:where()` in its low-priority reset layer so consumers can override
them. Matching the application-owned root declaration to `data-theme` gives
the document canvas, transparent navigation, and component content one mode.
The existing `--color-background-body` and `--color-text-primary` variables
then continue to provide the actual colours, rather than local hardcoded
light- and dark-mode values.

## Prevention

- Treat root-canvas theming as a document concern whenever `html` or `body`
  uses semantic background or foreground variables.
- Verify resolved canvas, heading, and navigation-control contrast in each
  supported mode across Home, Roadmap, Skills, Skill Detail, and Not Found.
- Keep root scheme selection next to the root canvas rules; do not distribute
  compensating colours across page components.
- Preserve Astryx semantic variables and add the mode mapping instead of
  hardcoding colours.

## Related Issues

- [Keep Astryx StyleX Tailwind Boundaries Explicit](../best-practices/astryx-stylex-tailwind-boundaries.md)
- [Use Astryx Blue Icon Tokens For Heroicons In Home Navigation](astryx-blue-heroicon-home-navigation.md)
- [Verify Storybook From Linked Worktrees](../workflow-issues/verify-storybook-from-linked-worktree.md)
