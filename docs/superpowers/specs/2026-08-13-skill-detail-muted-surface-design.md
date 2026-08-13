# Skill Detail Muted Surface Design

## Goal

Make the existing muted metadata Card on the skill detail page visibly distinct
from the application background in both light and dark modes, without changing
the Astryx Neutral theme or any other component.

## Context

`SkillDetailPage` wraps its Categories, Rating, and optional Certifications
metadata in an Astryx `Card` with `variant="muted"`. The application uses the
Astryx Neutral theme and applies `--color-background-body` to the page.

In that theme, `--color-background-muted` and `--color-background-body` have
the same values: `#f1f1f1` in light mode and `#1b1b1b` in dark mode. The muted
Card therefore has no visible surface contrast against the page. Astryx's
component documentation can show stronger separation because the appearance
depends on the active theme and surrounding surface.

## Selected Design

Keep the Card's semantic `variant="muted"` and existing `width="100%"`. Add a
local `xstyle` to this Card that sets its `backgroundColor` to Astryx's
`--color-background-surface` token.

The resulting pairing is:

| Mode | Application body | Metadata Card |
| --- | --- | --- |
| Light | `#f1f1f1` | `#ffffff` |
| Dark | `#1b1b1b` | `#262626` |

The implementation must consume `colorVars['--color-background-surface']`
rather than copying either color value into application code. The hex values
above document the current Neutral theme output; they are not implementation
constants.

This preserves the Card's muted semantic role while using another Astryx
semantic background token for a modest, theme-aware visual distinction.

## Alternatives Considered

### Use `variant="gray"`

Astryx exposes a gray Card background (`#e5e5e5` in the current light Neutral
theme and a translucent neutral layer in dark mode). This would provide clear
contrast, but Astryx positions non-semantic color variants as categorization.
The metadata summary is de-emphasised supporting content, not a category or
status, so the gray variant would weaken the component's semantic intent.

### Use `--color-background-card`

The standard Card token is white in light mode but equals the body background
in the current dark Neutral theme. It would solve only half of the problem.

### Override the Neutral theme's muted token

Changing `--color-background-muted` at the application theme level would make
all muted Astryx surfaces distinct. The request is deliberately limited to one
metadata Card, and other components may rely on the Neutral theme's existing
relationship between body and muted backgrounds.

## Scope and Component Boundaries

The change stays in `SkillDetailPage` because the treatment has one consumer
and introduces no reusable behavior. Add one local StyleX style and apply it to
the existing metadata Card.

Preserve all existing Card and MetadataList behavior:

- Keep `variant="muted"` and `width="100%"`.
- Keep Astryx-managed padding, radius, and transparent stabilising border.
- Keep Categories, Rating, and conditional Certifications in their current
  order.
- Keep the Basic MetadataList defaults and current wrapping behavior.
- Keep the skill heading and description outside the Card.
- Keep all application-level Astryx Neutral theme tokens unchanged.

No new component, prop, data model, route, global class, or theme definition is
required.

## Accessibility and Responsive Behavior

The change is visual only. The Card remains a non-interactive container and the
MetadataList retains its existing `dl`, `dt`, and `dd` semantics. Heading order,
focus behavior, links, and reading order remain unchanged.

At phone, tablet, and desktop widths, the Card continues to fill the existing
content column. Metadata values must continue wrapping without clipping or
horizontal page overflow. Both light and dark appearances must show a subtle
neutral separation between the Card and page.

## Testing and Validation

Update the focused component test to verify that:

- the MetadataList remains inside a full-width Astryx Card with the `muted`
  variant;
- the metadata Card receives the local surface-background StyleX treatment;
- no metadata content, order, or semantics change.

Run the focused skill-detail test using the Vitest 4-compatible project-relative
path:

```bash
pnpm nx test github.io src/app/skills/skill-detail-page.spec.tsx
```

Then run the complete `github.io` test, lint, application build, Storybook
build, and `git diff --check`. Inspect the existing enriched Kubernetes and
basic React skill-detail stories in light and dark modes at phone, tablet, and
desktop widths.

## Out of Scope

- Changing the Astryx Neutral theme or any global color token
- Changing the application body background
- Restyling other muted Cards or Astryx components
- Changing Card padding, radius, border, width, or semantic variant
- Changing metadata content, layout, accessibility, or data resolution
- Introducing a category/status tint or a hardcoded color

## References

- [Astryx Button](https://astryx.atmeta.com/components/Button)
- [Astryx Card](https://astryx.atmeta.com/components/Card)
- [Astryx design tokens](https://astryx.atmeta.com/docs/tokens)
