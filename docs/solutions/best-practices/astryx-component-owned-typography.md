---
title: Use Astryx Typography For Component-Owned Text
date: 2026-07-31
category: best-practices
module: github.io Astryx typography
problem_type: best_practice
component: tooling
severity: low
applies_when:
  - Auditing github.io components for design-system typography drift
  - Replacing local raw heading or paragraph styles in Astryx-based UI
  - Deciding whether visible text belongs to Astryx typography or a wrapper boundary
related_components:
  - github.io Astryx Foundation
  - Astryx Styling Boundary
  - github.io DevOps capability evidence
  - github.io DevOps roadmap
tags: [astryx, typography, design-system, accessibility, github-io, react]
---

# Use Astryx Typography For Component-Owned Text

## Context

`SkillCard` established the desired `github.io` pattern: component-owned title
and body copy use Astryx `Heading` and `Text`, while `VStack` and `HStack`
express spacing and local StyleX stays structural. A later audit found the same
direct text ownership drifting in `DoraCapabilityCard` and `DevOpsRoadmapNode`.

The drift was not every raw text-like element. Some spans are accessibility
group wrappers around tokens, some text is decorative rating output with a
separate hidden label, and chart labels are generated inside MUI internals. The
useful boundary is narrower: if the app component owns visible heading or body
copy, Astryx should own the typography.

## Guidance

Start with the Astryx component that matches the text role before writing local
typography styles.

- Use `Heading` for component-owned headings, preserving `level`, `id`, and
  labeling relationships.
- Use `Text` for component-owned prose, preserving the semantic element with
  `as` when needed.
- Keep StyleX for structural styling such as width, padding, list reset,
  wrapping, borders, shadows, and third-party node geometry.
- Leave accessibility-only wrappers and third-party generated internals in
  their existing wrapper or vendor styling boundary unless there is a clear
  Astryx `Text` or `Heading` boundary around the owned text.

`DoraCapabilityCard` now follows this split. The card imports Astryx `Heading`
and `Text`, keeps StyleX only for card/list structure, and uses the heading id
as the article label (`apps/github.io/src/app/devops-capability-evidence/dora-capability-card.tsx:1`,
`apps/github.io/src/app/devops-capability-evidence/dora-capability-card.tsx:23`,
`apps/github.io/src/app/devops-capability-evidence/dora-capability-card.tsx:94`):

```tsx
<VStack gap={1}>
  <Heading id={titleId} level={3}>
    {capability.label}
  </Heading>
  <Text type="supporting" as="p">
    {description}
  </Text>
</VStack>
```

`DevOpsRoadmapNode` uses the same rule for node titles: the visible title is an
Astryx `Heading`, while StyleX still owns React Flow node structure and token
list layout (`apps/github.io/src/app/devops-roadmap/devops-roadmap-node.tsx:3`,
`apps/github.io/src/app/devops-roadmap/devops-roadmap-node.tsx:23`,
`apps/github.io/src/app/devops-roadmap/devops-roadmap-node.tsx:69`).

## Why This Matters

Typography is part of component semantics, not only visual styling. Moving
component-owned text into Astryx `Heading` and `Text` keeps the type scale,
accessibility semantics, and design-system defaults aligned with Astryx
examples. It also makes later reviews easier: local CSS that remains near the
text is expected to be structural, not a parallel typography system.

The skip cases are just as important. Replacing `span role="group"` wrappers or
MUI-generated chart labels with Astryx typography would blur ownership rather
than improve it. Those boundaries belong to accessibility grouping or
third-party generated internals, while Astryx owns the app-controlled heading
and prose nodes.

## When to Apply

- A `github.io` component renders a visible `h1`-`h6`, `p`, or styled `span`
  for text it owns.
- StyleX or utility classes set `fontSize`, `fontWeight`, `lineHeight`, or
  text color on local heading or body copy.
- A component already uses Astryx layout or surface primitives, but visible
  title/body text is still hand-styled.
- Accessibility semantics such as heading level or `aria-labelledby` must be
  preserved while moving typography ownership to Astryx.

## Examples

Avoid local typography rules on app-owned text:

```tsx
<h3 id={titleId} {...stylex.props(styles.title)}>
  {capability.label}
</h3>
<p {...stylex.props(styles.description)}>{description}</p>
```

Prefer Astryx typography and keep the existing semantics:

```tsx
<Heading id={titleId} level={3}>
  {capability.label}
</Heading>
<Text type="supporting" as="p">
  {description}
</Text>
```

For roadmap nodes, test the semantic contract rather than implementation
markup. The roadmap node test now asserts the article and heading roles for the
same visible node title (`apps/github.io/src/app/devops-roadmap/devops-roadmap.spec.tsx:261`,
`apps/github.io/src/app/devops-roadmap/devops-roadmap.spec.tsx:262`):

```tsx
expect(getByRole('article', { name: 'Containers' })).toBeTruthy();
expect(getByRole('heading', { name: 'Containers' })).toBeTruthy();
```

## Related

- `CONCEPTS.md`
- `docs/solutions/best-practices/astryx-stylex-tailwind-boundaries.md`
- `docs/solutions/design-patterns/astryx-layout-gap-token-spacing.md`
