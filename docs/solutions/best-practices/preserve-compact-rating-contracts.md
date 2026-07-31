---
title: Preserve Compact Rating Contracts When Replacing Rating Glyphs
date: 2026-07-31
category: best-practices
module: github.io Astryx skills
problem_type: best_practice
component: tooling
severity: low
applies_when:
  - Replacing text glyph ratings with icon components
  - Maintaining responsive desktop and compact rating presentations
tags: [astryx, skill-rating, responsive-ui, heroicons, accessibility]
---

# Preserve Compact Rating Contracts When Replacing Rating Glyphs

## Context

`SkillRating` originally had two responsive presentations: a full five-star
row for default viewports and a compact one-star plus `{level}/5` presentation
for narrow viewports. During the Heroicons migration, the first implementation
kept five visible icons but moved `{level}/5` outside the compact-only
presentation, so the numeric text appeared in default viewports too.

The corrected component keeps the two display groups explicit. The default
star row is visible until the compact breakpoint, and the compact group is
hidden until that breakpoint in
`apps/github.io/src/app/skills/skill-rating.tsx:22`.

## Guidance

When replacing decorative glyphs with icon components, preserve any existing
responsive contract as a first-class part of the component behavior. Do not
only preserve the visual assets.

For ratings, keep the full and compact render groups separate:

```tsx
const styles = stylex.create({
  stars: {
    display: {
      default: 'inline-flex',
      '@media (max-width: 640px)': 'none',
    },
  },
  compact: {
    display: {
      default: 'none',
      '@media (max-width: 640px)': 'inline-flex',
    },
  },
});
```

Then put viewport-specific content inside the matching group. In the current
`SkillRating`, the desktop group renders five Heroicons stars, while the compact
group renders one solid Heroicons star plus Astryx supporting text:

```tsx
<span {...stylex.props(styles.stars)} aria-hidden="true">
  {Array.from({ length: 5 }, (_, index) => {
    const isFilled = index < level;
    const StarIcon = isFilled ? StarSolidIcon : StarOutlineIcon;

    return <StarIcon {...stylex.props(styles.star)} key={index} />;
  })}
</span>
<span {...stylex.props(styles.compact)} aria-hidden="true">
  <StarSolidIcon {...stylex.props(styles.star)} />
  <Text type="supporting">{level}/5</Text>
</span>
```

Keep shared icon sizing and color in one `star` style so solid, outline, and
compact icons cannot drift. The current component uses Astryx spacing tokens for
width and height, and `colorVars['--color-icon-yellow']` for the star color in
`apps/github.io/src/app/skills/skill-rating.tsx:38`.

## Why This Matters

A visual migration can accidentally change responsive information hierarchy.
The rating's `{level}/5` text was meant to save horizontal space in compact
layouts, not to add extra metadata to the default presentation. Keeping the
compact-only group explicit preserves the previous information density while
still allowing the icon migration.

The accessibility contract should remain independent from the visible
presentation. `SkillRating` keeps one `VisuallyHidden` phrase such as
`4 out of 5`, while the decorative stars and compact text remain hidden from
assistive technology in `apps/github.io/src/app/skills/skill-rating.tsx:50`.

## When to Apply

- A component has different desktop and compact presentations.
- A migration swaps text glyphs, raw SVG, or icon assets for a component icon
  library.
- Supporting text is only meant to appear in a compact breakpoint.
- Visual content is decorative and should be represented by one stable
  accessible phrase.

## Examples

The focused test should protect both the icon variant selection and the
responsive split. The current test mocks Heroicons modules with distinct SVG
markers, checks that the desktop group renders four solid stars plus one
outline star, and checks that the compact group renders exactly one solid star
in `apps/github.io/src/app/skills/skill-rating.spec.tsx:32`.

Avoid a test that only asserts derived state such as `data-filled`; that can
pass even if both branches render the same icon component. Assert the rendered
variant, not only the boolean that selected it.

## Related

- [Use Astryx Typography For Component-Owned Text](astryx-component-owned-typography.md)
- [Keep Astryx StyleX Tailwind Boundaries Explicit](astryx-stylex-tailwind-boundaries.md)
