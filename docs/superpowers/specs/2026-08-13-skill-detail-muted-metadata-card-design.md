# Skill Detail Muted Metadata Card Design

## Goal

Present the skill detail page's existing metadata as one visually grouped,
de-emphasised summary using Astryx's documented muted Card treatment. The
change must preserve the existing Basic MetadataList structure and remain
usable at phone, iPad, and desktop widths.

## Context

The skill detail page currently places its Basic `MetadataList` directly below
the skill title and description. The list contains Categories, Rating, and an
optional Certifications row. The page already uses Astryx components for this
content and intentionally leaves the MetadataList on its Basic defaults.

Astryx defines `Card` as a container for a discrete, self-contained item and
provides the semantic `muted` variant for a subtle, de-emphasised surface. A
single metadata summary fits that purpose. Astryx also cautions against using
stacked full-width cards as general page structure, so this design limits the
new card to the metadata summary only.

## Recommended Design

Wrap the existing `MetadataList` directly in an Astryx `Card` configured with
`variant="muted"` and `width="100%"`. Use the Card's theme-managed default
padding. Do not add custom background, border, radius, or padding styles.

The card contains only the metadata rows. The skill title and description stay
on the page surface above it, and the card has no visible heading. The
MetadataList remains the first and only child of the Card.

The page order remains:

1. Breadcrumbs
2. Skill title and description
3. Muted metadata card
4. In practice, when evidence exists
5. Projects, when projects exist

## Component Boundaries

Keep this composition in `SkillDetailPage`. Do not introduce a
`SkillMetadataCard` component because there is one consumer and no additional
behavior to isolate.

Preserve the existing metadata contents and rendering rules:

- Categories uses the current skill category components and wrapping list.
- Rating uses the current skill rating component.
- Certifications uses the current certification citations and appears only
  when certifications exist.
- `MetadataList` receives no `columns`, `label`, or `orientation` override.

No resolver, route, data model, experience evidence, project, or navigation
changes are required.

## Visual and Responsive Behavior

The Card spans the existing content column at phone, iPad, and desktop widths.
Astryx owns its muted background, radius, transparent stabilising border, and
default padding. The active Astryx theme selects the appropriate muted color
for light and dark modes; the app must not hardcode a color value.

The MetadataList retains its current Basic layout. Category and certification
values continue wrapping within the available width. The card must not cause
horizontal page overflow or clip metadata at narrow widths.

The global application background and all other surfaces remain unchanged.

## Accessibility

The Card is a non-interactive visual container and introduces no additional
landmark or heading. The nested MetadataList continues to expose its existing
description-list semantics through `dl`, `dt`, and `dd` elements. The row order
remains Categories, Rating, then Certifications when present.

Skills without certifications render no empty Certifications row or
placeholder. Existing focus management, breadcrumb semantics, heading order,
and link behavior remain unchanged.

## Testing and Validation

Update the skill detail component tests to verify:

- The metadata list is nested inside an Astryx Card using the `muted` variant.
- The Card is configured to span the available width.
- The MetadataList still uses Astryx Basic defaults without `columns`, `label`,
  or `orientation` overrides.
- Enriched skills preserve Categories, Rating, and Certifications in order.
- Basic skills preserve Categories and Rating and omit Certifications.
- Existing `dl`, `dt`, and `dd` semantics and wrapped values remain intact.

Run focused skill-detail tests, the relevant `github.io` test and lint targets,
the app build, and the Storybook build. Inspect the enriched Kubernetes and
basic React Storybook stories at phone, iPad, and desktop widths, checking the
muted surface, full-width behavior, light/dark theme response, and absence of
overflow. Keep Storybook reachable through the existing Tailscale workflow for
the user's physical iPad review.

## Out of Scope

- Changing the global app background or Astryx theme palette
- Adding a visible Overview or Metadata heading
- Moving the skill title or description into the Card
- Changing MetadataList layout options or metadata content
- Adding links from skill cards, lists, or the command palette
- Refactoring other cards or page sections
- Changing routing, data resolution, or fallback behavior

## References

- [Astryx Card](https://astryx.atmeta.com/components/Card)
- [Astryx MetadataList](https://astryx.atmeta.com/components/MetadataList)
- [Astryx layout guidance](https://astryx.atmeta.com/docs/layout)
- [Astryx design tokens](https://astryx.atmeta.com/docs/tokens)
