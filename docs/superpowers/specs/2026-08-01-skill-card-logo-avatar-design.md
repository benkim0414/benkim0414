# Skill Card Logo Avatar Design

Date: 2026-08-01

## Goal

Add each skill's logo to `SkillCard` using the existing skill avatar data and rendering path, while making card logos read as product/technology logo tiles rather than circular person avatars.

## Context

The mobile skills page now renders the complete skill list as one-column `SkillCard` items, with the fixed top-five carousel above it. `SkillListItem` already uses `SkillAvatar` in the leading slot, and `SkillAvatar` already maps skill `iconSlug` values to bundled Simple Icons with initials fallback.

Astryx exposes `Avatar`, `Thumbnail`, `List`, `Item`, and `Card` patterns. Its local `Avatar` implementation resolves `xsmall` to 24px, `small` to 36px, and `medium` to 48px, and applies a full circular radius by default. Astryx public docs describe Avatar as a person/team representation, while List/Item support leading visuals and Thumbnail covers square image previews. Material fallback guidance supports leading image/avatar visuals for scannability, with Material Web list tokens documenting 40px leading avatars and 56px leading images.

Sources:

- https://astryx.atmeta.com/components
- https://astryx.atmeta.com/components/Avatar
- https://astryx.atmeta.com/components/Item
- https://github.com/material-components/material-web/blob/main/docs/components/list.md

## Recommended Design

Place the skill logo in the SkillCard header at the top-left, aligned with the title and rating:

`[logo tile] [skill name + star rating]`

Use a 36px by 36px rounded rectangle for card logos. This matches Astryx `small` avatar scale, gives cards more visual weight than the existing 24px list avatar, and remains compact on mobile. Use an 8px or Astryx `radiusVars['--radius-element']` corner radius so the shape is smooth but clearly not circular.

Keep the existing list avatar behavior at 24px. The list and command-palette surfaces should continue to use the compact Astryx `Avatar size="xsmall"` pattern unless a future screen-specific design changes them.

## Component Design

Extend `SkillAvatar` with a visual variant instead of adding a second logo mapper:

- `variant="list"`: default behavior, Astryx `Avatar size="xsmall"`, circular 24px.
- `variant="card"`: Astryx Avatar-powered source/fallback, 36px, rectangular rounded tile.

The card variant should reuse the existing icon source and fallback initials behavior. It may use `xstyle` to override the rendered mask and background shape, but the data source, accessible name, and fallback behavior should remain centralized in `SkillAvatar`.

`SkillCard` should render the card avatar in the header before the title/rating stack. Categories, description, rating, and certifications should keep their current variant behavior.

## Boundaries

In scope:

- Add the logo tile to `SkillCard`.
- Preserve `SkillListItem` avatar behavior.
- Keep mobile card layout compact and one-column friendly.
- Add or update tests for card avatar rendering, shape/size contract, and fallback behavior where practical.
- Add Storybook coverage for the card logo layout.

Out of scope:

- New skill data.
- API-backed skills.
- Desktop-specific expanded skill card layouts.
- Light/dark mode changes.
- Replacing Astryx components with custom primitives.

## Accessibility

The logo should keep the existing accessible image name from `SkillAvatar`, based on the skill name. The logo tile must not replace visible text; the skill name remains the primary label. Fallback initials should stay readable inside the rounded rectangle.

## Risks

The Astryx `Avatar` component applies its circular mask to an internal content element, so the card variant may need a narrow StyleX selector or wrapper strategy. Keep that override local to `SkillAvatar` and cover it with a focused test so future Astryx changes are visible.

## Validation

Run focused checks:

- `pnpm nx test github.io --skip-nx-cache`
- `pnpm nx lint github.io --skip-nx-cache`
- `pnpm nx build github.io --skip-nx-cache`

For visual validation, run Storybook on the Tailscale host and inspect the mobile skills page and SkillCard stories on iPad.
