---
title: Treat Astryx Layout Gaps As Spacing Tokens
date: 2026-07-31
category: design-patterns
module: github.io Astryx skill cards
problem_type: design_pattern
component: tooling
severity: low
applies_when:
  - Choosing gap values for Astryx Layout components
  - Translating visual spacing feedback into Astryx token steps
  - Comparing Astryx examples with local component spacing
related_components:
  - github.io Astryx Foundation
  - github.io skill components
  - Astryx Styling Boundary
tags: [astryx, spacing, layout, design-system, github-io]
---

# Treat Astryx Layout Gaps As Spacing Tokens

## Context

`SkillCard` needed category badges above the title, matching the metadata-first
structure of the Astryx Kanban card example. The first implementation followed
the Kanban structure with badges in their own row and the title plus description
in a nested text group, but the visual difference between adjacent gap steps was
too subtle in Storybook.

The confusing part was the numeric `gap` prop. In Astryx `Layout`, a value such
as `gap={4}` reads like it might mean `4px`, but it represents a spacing-token
step. The installed Astryx token scale maps `--spacing-2` to `8px`,
`--spacing-3` to `12px`, and `--spacing-4` to `16px`
(`node_modules/.pnpm/@astryxdesign+core@0.1.4_@stylexjs+stylex@0.19.0_react-dom@19.2.7_react@19.2.7__react@19.2.7/node_modules/@astryxdesign/core/src/theme/tokens.stylex.ts:157`).

## Guidance

When spacing Astryx component groups, choose the semantic relationship first and
then express it with the nearest Astryx spacing token. Do not translate feedback
into arbitrary pixel values.

For compact metadata above a title, keep the internal title and description
group tight, and use a larger parent gap to separate metadata from content:

```tsx
<VStack gap={4} hAlign="start">
  <HStack gap={1} wrap="wrap">
    {skill.categories.map((category) => (
      <SkillCategory key={category} name={category} />
    ))}
  </HStack>
  <VStack gap={1} hAlign="start">
    <Heading id={titleId} level={4} accessibilityLevel={3}>
      {skill.name}
    </Heading>
    <Text type="supporting" as="p">
      {skill.description}
    </Text>
  </VStack>
</VStack>
```

The current `SkillCard` uses that pattern: the outer badge-to-content group is
`gap={4}`, while the nested title-to-description group stays at `gap={1}`
(`apps/github.io/src/app/skills/skill-card.tsx:49`,
`apps/github.io/src/app/skills/skill-card.tsx:56`).

## Why This Matters

Design-system spacing values are not raw measurements. Treating `gap={3}` as an
"odd" size misses that it resolves to `12px`, a common spacing value on a
4px-based scale. Treating `gap={4}` as `16px` makes the design discussion
concrete without leaving Astryx component props.

This keeps local visual polish inside the Astryx Styling Boundary. The component
still uses Astryx `VStack` and `HStack` anatomy, and spacing remains tokenized
even when the selected step differs from the tighter Kanban example.

## When to Apply

- Astryx example code establishes component grouping, but local content needs a
  stronger visual separation.
- A reviewer questions whether a numeric `gap` value is an arbitrary pixel
  value.
- Metadata, badges, or tags should read as related to a card without appearing
  attached to the title text.
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

## Related

- `CONCEPTS.md`
- `docs/solutions/best-practices/astryx-derived-badge-variants.md`
- `docs/solutions/best-practices/astryx-stylex-tailwind-boundaries.md`
