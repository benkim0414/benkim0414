# Skill Card Rating Placement Design

## Goal

Add the existing `SkillRating` display to `SkillCard` in the `github.io` app so
each card shows the skill's level without weakening the card's current Astryx
hierarchy.

## Context

`SkillCard` currently renders categories, the skill name, supporting
description, and optional certification citations. Recent Astryx-aligned card
work established categories as lightweight classifiers above the title, the
skill name as the accessible card heading, the description as supporting copy,
and certification citations as bottom-of-card evidence.

`SkillRating` already exists as the app's accessible five-point rating display.
Its visible star UI is decorative to assistive technology, while Astryx
`VisuallyHidden` exposes stable text such as `4 out of 5`.

## Recommended Placement

Render `SkillRating` directly under the skill heading and before the skill
description:

```tsx
<VStack gap={1} hAlign="start">
  <Heading id={titleId} level={4} accessibilityLevel={3}>
    {skill.name}
  </Heading>
  <SkillRating level={skill.level} />
  <Text type="supporting" as="p">
    {skill.description}
  </Text>
</VStack>
```

The resulting card hierarchy is:

1. Categories
2. Skill title
3. Rating
4. Description
5. Certification citations

This makes the rating compact skill metadata. It remains close enough to the
title to summarize the skill, but it does not compete with the category badges
or certification evidence.

## Alternatives Considered

### Inline With The Title

Putting the rating in the same row as the title is more compact, but it makes
the title row busy and creates wrapping risk in the existing narrow card widths.
The skill name should remain the strongest identity signal.

### Above The Title

Putting the rating above the title would compete with categories, which already
own the top metadata row. Rating is an attribute of the skill, not a classifier
used to group the card.

### Below The Description

Putting the rating below the description makes it read like secondary detail or
footer metadata. It also separates the summary rating from the skill title it
describes.

### Certification Footer Area

Putting the rating next to certifications should be avoided. Certifications are
external evidence links and may be absent; the rating is intrinsic summary
metadata for every skill.

## Component Boundaries

- Keep `SkillRating` as the single owner of star rendering, compact mobile
  behavior, and accessible rating text.
- Keep `SkillCard` responsible only for ordering the existing skill fields.
- Do not add a new rating variant unless visual review proves the existing
  component is too large for the card.
- Do not change skill data, rating scale, category placement, search behavior,
  or certification citation behavior.

## Astryx Guidance

Use Astryx layout primitives for the card stack and semantic Astryx typography
for owned text. The title remains `Heading`; the description remains
`Text type="supporting"`. `SkillRating` is allowed to render inline decorative
icons because it already owns the accessible text boundary.

The placement follows the Astryx layout guidance that cards are appropriate for
self-contained gallery entries, and the typography guidance that supporting
text is for secondary information and metadata.

## Accessibility

The skill name remains the `aria-labelledby` target for the card article.
Adding `SkillRating` must not change the article label. The visible stars and
compact visible rating remain hidden from assistive technology by
`SkillRating`, leaving one stable screen-reader phrase for the rating.

## Validation

Implementation should update focused `SkillCard` tests to assert that the
rating renders after the skill heading and before the description. Existing
`SkillRating` tests should remain the source of truth for the rating's internal
accessibility and responsive markup.

Run focused validation for `github.io`:

- `pnpm nx test github.io --testFile=apps/github.io/src/app/skills/skill-card.spec.tsx`
- `pnpm nx test github.io --testFile=apps/github.io/src/app/skills/skill-rating.spec.tsx`
- `pnpm nx lint github.io`

Because this changes visible card hierarchy, inspect the `SkillCard` Storybook
story across desktop and mobile card widths before claiming the UI complete.

## Out Of Scope

- Changing `SkillRating` props or star icon implementation.
- Changing the five-point rating scale.
- Moving categories or certification citations.
- Changing card width, padding, height, or carousel equal-height behavior.
- Adding dependencies.
