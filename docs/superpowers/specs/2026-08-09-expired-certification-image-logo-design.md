# Expired Certification Image Logo Design

## Goal

Make an expired `CertificationCitation` visually distinct from an active one
when the citation uses a caller-supplied image logo. Expired image logos should
lose their brand color while retaining full opacity and legibility, matching the
neutral treatment already used for expired Simple Icons.

## Context

`CertificationCitation` supports two icon sources:

- `citationIcon`, a caller-supplied image such as an official CNCF credential
  badge; and
- a generated SVG data URL derived from the first linked skill with Simple
  Icons metadata.

The component already renders an expired generated Simple Icon with the neutral
Astryx citation label color (`#737373`) instead of its brand color. A supplied
`citationIcon` is passed through unchanged, so its active and expired states
currently look identical.

## Recommended Approach

Apply a StyleX `grayscale(1)` filter to the Astryx `Citation` root only when all
of the following conditions are true:

1. `citationIcon` is present;
2. `expiresAt` is a valid calendar date and timestamp; and
3. `expiresAt` is at or before `currentDate`.

The citation text and border are already neutral, so applying grayscale at the
`Citation` root produces a visible change only in the supplied image. The
filter does not affect the surrounding certification hovercard.

This approach requires no new component props, duplicate image assets, caller
changes, or image rewriting. It also works for future supplied credential
images without adding asset-specific logic.

## Component Behavior

`CertificationCitation` continues to derive `active`, `expired`, or absent
status through its existing date validation and comparison logic. It continues
to prefer `citationIcon` over a generated skill icon.

The rendering rules are:

| Icon source | Expiry state | Treatment |
| --- | --- | --- |
| Supplied `citationIcon` | Expired | Original image URL with `grayscale(1)` on the `Citation` root |
| Supplied `citationIcon` | Active | Original image and colors |
| Supplied `citationIcon` | Missing or invalid expiry | Original image and colors |
| Generated Simple Icon | Expired | Existing SVG filled with `#737373` |
| Generated Simple Icon | Active | Existing SVG filled with its brand color |

The expired image remains fully opaque. The certificate link remains enabled,
and its URL, accessible name, status metadata, and hovercard behavior do not
change.

## Styling Boundary

Add a focused StyleX style for the expired supplied-image state and compose it
with the component's existing `Citation` `xstyle` behavior. The condition must
depend on `citationIcon` rather than merely on the presence of any rendered
icon, preventing the generated Simple Icon path from receiving redundant
filtering.

No global selector, Astryx package modification, raster asset variant, or new
icon abstraction is needed.

## Invalid and Missing Data

The existing status semantics remain the source of truth. Missing expiry dates,
invalid timestamps, and impossible calendar dates produce no certification
status and therefore no grayscale filter. The design introduces no new parsing
or runtime error path.

If `citationIcon` is absent, the component preserves its existing generated
Simple Icon and fallback behavior.

## Validation

Automated coverage should verify:

- an expired supplied image receives the grayscale StyleX override;
- an active supplied image does not receive the override;
- supplied images with missing or invalid expiry dates do not receive the
  override;
- the supplied image remains the selected source instead of the linked skill
  icon;
- active generated Simple Icons retain their brand color;
- expired generated Simple Icons retain their existing `#737373` fill; and
- existing citation links, metadata, and hovercard tests continue to pass.

The existing `Active` and `Expired` Certification Citation Storybook stories
both use the CKA badge and provide the visual comparison. Focused `github.io`
tests and lint should pass before handoff.

## Out of Scope

- Fading or changing the opacity of expired logos
- Styling the entire certification as disabled
- Changing certification status badges or hovercard content
- Adding or modifying certification image assets
- Changing callers, certification data, or the public component contract
- Refactoring Astryx `Citation` or global styling conventions
