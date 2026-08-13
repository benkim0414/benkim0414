---
title: Distinguish Muted Skill Detail Card Surface
date: 2026-08-13
category: ui-bugs
module: github.io skill-detail metadata
problem_type: ui_bug
component: tooling
symptoms:
  - The skill-detail metadata Card blended into the page in the Astryx Neutral light theme
  - The skill-detail metadata Card blended into the page in the Astryx Neutral dark theme
root_cause: logic_error
resolution_type: code_fix
severity: low
related_components:
  - github.io Astryx Foundation
  - SkillDetailPage
  - Astryx Card
  - StyleX
tags: [github-io, skill-detail, muted-card, surface-token, astryx, stylex, neutral-theme]
---

# Distinguish Muted Skill Detail Card Surface

## Problem

The skill-detail page correctly used an Astryx `Card` with
`variant="muted"` for its supporting metadata, but the Card had no visible
separation from the application canvas in either color mode. The approved
design spec records that the active Astryx Neutral theme assigns the same
values to its body and muted background tokens, so semantic de-emphasis did
not imply visual contrast.

The page applies `--color-background-body` to both `html` and `body` in
[styles.css](../../../apps/github.io/src/styles.css), while the theme values
and selected surface pairing are recorded in the approved
[design spec](../../superpowers/specs/2026-08-13-skill-detail-muted-surface-design.md).

## Symptoms

- The full-width metadata Card appeared to be an uncontained metadata list in
  light mode.
- The same Card blended into the dark page background rather than forming a
  subtle supporting surface.
- Card padding and radius still existed, but background color no longer
  communicated the container boundary.

## What Didn't Work

- Relying on `variant="muted"` alone could not create contrast because the
  Neutral theme intentionally maps the muted and body tokens to the same
  values.
- Changing to `variant="gray"` would produce contrast, but would repurpose a
  color variant for content that is neither a category nor a status.
- Using `--color-background-card` would separate the Card in light mode but
  still match the body in the current dark Neutral theme.
- Overriding `--color-background-muted` at the application theme level would
  change every muted Astryx consumer to solve a one-consumer requirement.

## Solution

Preserve the Card's semantic variant and apply a component-local StyleX
background using Astryx's surface token. The implementation in
[skill-detail-page.tsx](../../../apps/github.io/src/app/skills/skill-detail-page.tsx)
imports `colorVars`, defines one private style, and applies it only to the
metadata Card:

```tsx
const styles = stylex.create({
  metadataCard: {
    backgroundColor: colorVars['--color-background-surface'],
  },
});

<Card variant="muted" width="100%" xstyle={styles.metadataCard}>
  <MetadataList data-testid="skill-metadata">...</MetadataList>
</Card>
```

Do not change the global theme, the page background, or the metadata subtree.
The implementation retains the Card's existing `muted` variant, full width,
and metadata children while adding only the local background style.

## Why This Works

The semantic variant and the visible surface answer different questions.
`variant="muted"` continues to identify the metadata as subordinate content;
`--color-background-surface` supplies the small amount of visual lift needed
against the Neutral body. The override references the theme-managed Astryx
semantic token rather than copying light and dark color values into the
component.

Scoping the rule through the existing Card `xstyle` boundary does not alter
the global token definitions or other consumers in this component. This
follows the repository's established
[Astryx Styling Boundary](../best-practices/astryx-stylex-tailwind-boundaries.md):
Astryx owns component anatomy and semantics, while StyleX owns narrow,
token-backed component overrides.

## Prevention

- Verify the resolved theme-token relationship instead of assuming a named
  Card variant always contrasts with its surrounding canvas.
- Preserve the component variant that matches the content role; use a local
  Astryx-token-backed override when only one bounded consumer needs different
  visual separation.
- Prefer a theme-level token change only when every consumer should adopt the
  new relationship.
- Keep a regression contract for both semantics and styling scope. The
  [skill-detail test](../../../apps/github.io/src/app/skills/skill-detail-page.spec.tsx)
  asserts the exact surface token, local `xstyle`, retained `muted` variant,
  full width, and metadata containment.
- Validate this class of change in light and dark Storybook views at narrow
  and wide widths so token contrast and unchanged wrapping are both visible.

## Related Issues

- [Keep Astryx StyleX Tailwind Boundaries Explicit](../best-practices/astryx-stylex-tailwind-boundaries.md)
- [Skill carousel card height alignment](skill-carousel-card-height.md)
- [Keep Skill Navigation Route-Authoritative](../design-patterns/keep-skill-selection-transition-in-app-shell.md)
