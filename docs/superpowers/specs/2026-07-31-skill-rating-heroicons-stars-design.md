# Skill Rating Heroicons Stars Design

## Goal

Update `SkillRating` in the `github.io` app so the visible rating uses Heroicons star icons instead of text star glyphs, while keeping the existing five-point rating meaning and accessible text.

## Recommended Approach

Render five equal-size Heroicons stars for every rating:

- Earned stars use the solid `StarIcon`.
- Unearned stars use the outline `StarIcon`.
- All stars use Astryx yellow from the official token set: `colorVars['--color-icon-yellow']`.
- The numeric companion text renders as Astryx `Text type="supporting"` with content like `4/5`.
- The screen-reader text remains available through Astryx `VisuallyHidden` as `4 out of 5`.

This keeps the visible five-star scale, replaces raw glyphs with the requested Heroicons, and moves the visible numeric rating into the design-system typography boundary.

## Component Boundary

Only `apps/github.io/src/app/skills/skill-rating.tsx` owns behavior and markup changes. Tests for `SkillRating` must be updated to assert the same accessibility contract and the new visible numeric text. Existing consumers such as `SkillListItem` and `SkillCard` must continue using `<SkillRating level={skill.level} />` without prop changes.

The component should remain presentational and pure. It should derive the five star states from `level` during render and should not introduce local state or effects.

## Styling

Use StyleX for component-specific layout:

- Keep the root as an inline-flex element that does not grow or wrap unexpectedly.
- Keep the star row and `{level}/5` text aligned on the same baseline.
- Use the same dimensions for solid and outline star icons so changing `level` cannot shift layout.
- Use Astryx spacing tokens for the gap between stars and between the star group and supporting text.
- Use the Astryx typed token export for yellow icon color rather than hardcoded yellow, hex, RGB, or HSL values.

The color token is `colorVars['--color-icon-yellow']`, confirmed from `pnpm exec astryx docs tokens` on July 31, 2026.

## Accessibility

The visible Heroicons stars and visible `{level}/5` text should be hidden from assistive technology so screen readers receive a single stable phrase from `VisuallyHidden`: `{level} out of 5`.

No interactive affordance should be introduced. The rating remains read-only display content.

## Dependencies

`@heroicons/react` is already installed in the root package. The implementation should import star icons from the installed Heroicons package and should not add new dependencies.

## Validation

Run focused validation for the `github.io` app:

- `pnpm nx test github.io --testFile=apps/github.io/src/app/skills/skill-rating.spec.tsx`
- `pnpm nx lint github.io`

Because this is a visible UI component, inspect the `Skill Rating` Storybook story before claiming the implementation complete. If Storybook cannot run in the implementation environment, record the exact blocker and use the best available browser or DOM-rendered visual check.

## Out Of Scope

- Changing the `SkillRating` public props.
- Changing skill levels or skill data.
- Redesigning `SkillCard`, `SkillListItem`, or the skills page layout.
- Adding a new rating component variant.
- Adding new dependencies.
