---
title: Differentiate Expired Certification Image Logos
date: 2026-08-09
category: ui-bugs
module: github.io certification citations
problem_type: ui_bug
component: rails_view
symptoms:
  - Expired caller-supplied certification image logos remained visually identical to active image logos.
  - Generated Simple Icon logos were neutralized on expiry while supplied image logos retained their full-color appearance.
root_cause: logic_error
resolution_type: code_fix
severity: low
related_components:
  - github.io CertificationCitation
  - Astryx Citation
  - StyleX
tags: [github-io, certifications, image-logos, expired-state, grayscale, stylex]
---

# Differentiate Expired Certification Image Logos

## Problem

`CertificationCitation` can render either a generated Simple Icons SVG or a
caller-supplied image. Before this local fix, generated icons switched to a
neutral fill when expired, but a supplied image kept its original brand colors
and could look active after expiration
(`apps/github.io/src/app/certifications/certification-citation.tsx:156`).

## Symptoms

- Before the fix, an expired certification with a supplied image looked the
  same as its active state, while an expired generated Simple Icon used the
  neutral citation color.
- Active, missing-expiry, and invalid-expiry supplied images needed to retain
  their existing appearance.
- The supplied image still needed to take precedence over the generated skill
  icon and preserve the existing certificate link.

## What Didn't Work

Changing only the generated Simple Icon color cannot affect a supplied image.
The generated icon color is embedded into an SVG data URL, while `citationIcon`
bypasses that construction and is selected directly as the rendered icon
(`apps/github.io/src/app/certifications/certification-citation.tsx:124` and
`apps/github.io/src/app/certifications/certification-citation.tsx:162`). A
raster or external image therefore needs its state treatment at the rendering
boundary, not in the SVG-generation path.

The focused contract observes whether the `xstyle` prop received by the mocked
Astryx `Citation` is present for expired images and absent for active, missing,
and invalid expiry values
(`apps/github.io/src/app/certifications/certification-citation-xstyle.spec.tsx:62`).

## Solution

Define a narrowly scoped StyleX rule that adds a grayscale filter without
setting opacity:

```tsx
expiredCitationIcon: {
  filter: 'grayscale(1)',
},
```

The override is passed to the Astryx `Citation` root. It visibly desaturates
the supplied image while leaving the already-neutral citation styling
unchanged, and it does not set opacity
(`apps/github.io/src/app/certifications/certification-citation.tsx:30`).

Reuse the component's derived status and compose the rule only when the caller
supplied an image and that status is expired:

```tsx
const hasExpiredCitationIcon = Boolean(
  citationIcon && status === 'expired',
);
const citationXstyle = hasSkillLogo
  ? [
      styles.sourceWithIcon,
      hasExpiredCitationIcon && styles.expiredCitationIcon,
    ]
  : hasExpiredCitationIcon && styles.expiredCitationIcon;
```

This preserves the existing icon-spacing rule while adding the filter only for
the supplied-image expired state
(`apps/github.io/src/app/certifications/certification-citation.tsx:163`). The
chosen icon and URL continue through the existing Astryx `Citation` source
object (`apps/github.io/src/app/certifications/certification-citation.tsx:172`).

Focused tests cover an expired supplied image, the exact expiry instant, and
active, missing, and invalid expiry values
(`apps/github.io/src/app/certifications/certification-citation-xstyle.spec.tsx:62`).
Existing component tests continue to cover supplied-image precedence, generated
icon colors, and citation link behavior
(`apps/github.io/src/app/certifications/certification-citation.spec.tsx:136`).

## Why This Works

The defect came from applying expiration treatment only inside the generated
SVG path. The new condition uses the same `getCertificationStatus` result that
drives the component's status metadata, avoiding a second date comparison
(`apps/github.io/src/app/certifications/certification-citation.tsx:89` and
`apps/github.io/src/app/certifications/certification-citation.tsx:142`). Because
the status is active only when expiration is strictly later than the current
time, equality is expired
(`apps/github.io/src/app/certifications/certification-citation.tsx:104`).

The condition explicitly checks `citationIcon`, so generated Simple Icons keep
their existing neutral-fill behavior and do not receive a redundant filter
(`apps/github.io/src/app/certifications/certification-citation.tsx:156` and
`apps/github.io/src/app/certifications/certification-citation.tsx:163`).

## Prevention

- Keep expiration parsing and boundary semantics centralized in
  `getCertificationStatus`; consumers should branch on its derived status.
- Apply visual state at the primitive that owns the affected pixels: generated
  SVG fills belong in `iconDataUrl`, while supplied images need styling through
  the `Citation` rendering boundary.
- Preserve tests for future, equal, past, missing, and invalid expiration
  values.
- Test the `xstyle` prop received by the component boundary without coupling the
  assertion to StyleX-generated keys.
- As non-blocking hardening, add a mixed expired case with both `citationIcon`
  and a known `skills` entry so the array composition explicitly proves that
  icon spacing and grayscale remain present together.

## Related Issues

- [Make Certification Badge Storybook Fixtures Explicit](storybook-certification-badge-fixtures.md)
  distinguishes supplied credential images from skill-logo fallbacks.
- [Make Color-Only Certification Brand Fallbacks Reachable](../logic-errors/color-only-certification-brand-fallback.md)
  documents the generated-icon and color-only brand states.
- [Keep Astryx StyleX Tailwind Boundaries Explicit](../best-practices/astryx-stylex-tailwind-boundaries.md)
  explains why this narrow component variant belongs in StyleX.
- [Keep Certification HoverCards Supplemental to Direct Links](../design-patterns/accessible-certification-metadata-hovercard.md)
  documents the validated expiry-to-status model reused here.
- The design and implementation plan are
  `docs/superpowers/specs/2026-08-09-expired-certification-image-logo-design.md`
  and
  `docs/superpowers/plans/2026-08-09-expired-certification-image-logo.md`.
- The change is on the local `feat/expired-certification-logo-state` branch and
  is awaiting handoff; this document does not claim it has been merged or
  deployed.
