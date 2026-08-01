# Skill Command Palette Avatar Design

Date: 2026-08-01

## Goal

Remove skill logos from `SkillCard` because the card became visually too heavy, and show compact skill logos only in command-palette skill results.

## Design

`SkillCard` should not render any avatar or logo. It should return to the compact card information hierarchy: category badges when enabled, skill name, star rating, description, and certifications.

The command palette should render each skill result with a small leading skill logo followed by the skill name. Use the existing Astryx `Avatar size="xsmall"` scale so command results stay compact at 24px, but render those command-palette logos as rounded rectangles with `radiusVars['--radius-element']` instead of circles. The supporting group label remains `Skills`.

## Boundaries

In scope:

- Remove `SkillAvatar` usage from `SkillCard`.
- Remove the card-specific rectangular avatar variant and tests/stories.
- Add `SkillAvatar` to command-palette result rendering with a rectangular shape.
- Preserve existing search behavior, selected-skill filtering, grouping, and mobile shell layout.

Out of scope:

- New skill data.
- API-backed skills.
- Light/dark mode.
- Desktop-specific layouts.
- New custom avatar primitives.

## Validation

- Focused tests should prove `SkillCard` no longer renders a logo.
- Focused tests should prove command-palette skill results render the 24px rectangular avatar before skill text.
- Run `pnpm nx test github.io --skip-nx-cache`, `pnpm nx lint github.io --skip-nx-cache`, `pnpm nx build github.io --skip-nx-cache`, and Storybook for iPad visual review.
