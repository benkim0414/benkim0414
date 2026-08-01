---
title: Treat Astryx Layout Gaps As Spacing Tokens
date: 2026-07-31
last_updated: 2026-08-01
category: design-patterns
module: github.io Astryx skill cards
problem_type: design_pattern
component: tooling
severity: low
applies_when:
  - Choosing gap values for Astryx Layout components
  - Translating visual spacing feedback into Astryx token steps
  - Comparing Astryx examples with local component spacing
  - Grouping card titles with compact metadata such as ratings
related_components:
  - github.io Astryx Foundation
  - github.io skill components
  - Astryx Styling Boundary
tags: [astryx, spacing, layout, design-system, github-io]
---

# Treat Astryx Layout Gaps As Spacing Tokens

## Context

`SkillCard` needed category badges above the title and a `SkillRating` under the
title, matching the metadata-first structure of Astryx card examples without
turning metadata into body copy. The implementation uses badges in their own row,
title and rating in a nested identity group, and description as secondary body
text. Visual QA in Storybook showed that the exact gap step matters at card
scale: adjacent token steps can look subtle, but they still encode different
component relationships.

The confusing part was the numeric `gap` prop. In Astryx `Layout`, a value such
as `gap={4}` reads like it might mean `4px`, but it represents a spacing-token
step. The installed Astryx token scale maps `--spacing-2` to `8px`,
`--spacing-3` to `12px`, and `--spacing-4` to `16px`
(`node_modules/.pnpm/@astryxdesign+core@0.1.4_@stylexjs+stylex@0.19.0_react-dom@19.2.7_react@19.2.7__react@19.2.7/node_modules/@astryxdesign/core/src/theme/tokens.stylex.ts:157`).

## Guidance

When spacing Astryx component groups, choose the semantic relationship first and
then express it with the nearest Astryx spacing token. Do not translate feedback
into arbitrary pixel values.

For compact metadata above and below a title, group by relationship rather than
by visual order alone:

- categories sit in their own wrapping row;
- the skill name and rating sit in a tight nested identity group;
- the description sits outside the identity group as secondary body text;
- certification citations stay at the bottom without a redundant label.

```tsx
<VStack gap={2} hAlign="start">
  <HStack gap={1} wrap="wrap">
    {skill.categories.map((category) => (
      <SkillCategory key={category} name={category} />
    ))}
  </HStack>
  <VStack gap={2} hAlign="start">
    <VStack gap={0.5} hAlign="start">
      <Heading id={titleId} level={3}>
        {skill.name}
      </Heading>
      <SkillRating level={skill.level} />
    </VStack>
    <Text type="body" color="secondary" as="p">
      {skill.description}
    </Text>
  </VStack>
</VStack>
```

The current `SkillCard` uses that pattern: the outer category-to-content group
is `gap={2}`, the title/description area is also `gap={2}`, and the title/rating
identity group is `gap={0.5}` (`apps/github.io/src/app/skills/skill-card.tsx:50`,
`apps/github.io/src/app/skills/skill-card.tsx:57`,
`apps/github.io/src/app/skills/skill-card.tsx:58`). The certification list keeps
its own StyleX flex gap based on `--spacing-2`, because it is a wrapping list
rather than a vertical text stack (`apps/github.io/src/app/skills/skill-card.tsx:27`).

## Why This Matters

Design-system spacing values are not raw measurements. Treating `gap={3}` as an
"odd" size misses that it resolves to `12px`, a common spacing value on a
4px-based scale. Treating `gap={4}` as `16px` makes the design discussion
concrete without leaving Astryx component props.

This keeps local visual polish inside the Astryx Styling Boundary. The component
still uses Astryx `VStack` and `HStack` anatomy, and spacing remains tokenized
even when the selected step changes after Storybook review.

## When to Apply

- Astryx example code establishes component grouping, but local content needs a
  stronger visual separation.
- A reviewer questions whether a numeric `gap` value is an arbitrary pixel
  value.
- Metadata, badges, or tags should read as related to a card without appearing
  attached to the title text.
- Ratings or other compact metadata should belong to the card identity, not the
  prose description.
- Visual QA happens in Storybook and adjacent spacing-token steps are hard to
  distinguish at the component's actual size.

## Examples

Avoid hardcoding local CSS to force a perceived design-system value:

```tsx
<div style={{marginBlockEnd: '16px'}}>
  <SkillCategory name="Cloud" />
</div>
```

Prefer the Astryx layout prop that maps to the same tokenized size:

```tsx
<VStack gap={4} hAlign="start">
  <HStack gap={1} wrap="wrap">{categories}</HStack>
  <VStack gap={1} hAlign="start">{titleAndDescription}</VStack>
</VStack>
```

For title metadata, prefer a separate nested stack instead of attaching rating
markup to the heading or description:

```tsx
<VStack gap={0.5} hAlign="start">
  <Heading id={titleId} level={3}>
    {skill.name}
  </Heading>
  <SkillRating level={skill.level} />
</VStack>
```

## Related

- `CONCEPTS.md`
- `docs/solutions/best-practices/astryx-derived-badge-variants.md`
- `docs/solutions/best-practices/astryx-stylex-tailwind-boundaries.md`
