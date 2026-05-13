## Why

`DESIGN.md` now defines a distinct dark, technical, violet-accented visual system for the `github.io` showcase, but the app still needs an implementation contract that keeps that design centralized. This change applies the design through theme tokens so future visual changes can happen in one theme layer rather than through component-by-component restyling.

## What Changes

- Map the `DESIGN.md` palette, radius, border, ring, and typography guidance into the app theme layer.
- Keep shadcn's CSS-variable theming model as the mechanism for applying the theme.
- Add reusable theme-level support for violet accents, small signal colors, developer-font accents, crisp borders, and subtle bits-inspired surface treatment.
- Require app UI to consume semantic tokens and reusable utilities instead of hard-coded per-component color systems.
- Keep shadcn component generation, search behavior, data modeling, and deployment out of scope.

## Capabilities

### New Capabilities

- `github-io-design-theme`: Covers centralized application of `DESIGN.md` through theme tokens and reusable theme utilities.

### Modified Capabilities

None.

## Impact

- Affects `apps/github.io/src/styles.css` and the styling contract used by `apps/github.io`.
- May require small markup class adjustments so existing UI consumes centralized theme utilities.
- Does not add dependencies, change Node or pnpm versions, alter search behavior, or create new shadcn components.
