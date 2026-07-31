# GitHub.io Astryx Typography Audit Design

Date: 2026-07-31

## Goal

Align direct user-visible typography in `apps/github.io/src/app/**` with the
Astryx component boundary. Components that own visible title or body copy should
use Astryx `Heading` and `Text` instead of raw HTML elements styled with local
typography rules.

## Context

`SkillCard` already follows the desired pattern: visible title and description
text use Astryx `Heading` and `Text`, while `VStack` and `HStack` own component
spacing and local StyleX remains limited to structural styling.

The audit should apply the same boundary described by:

- `docs/solutions/best-practices/astryx-stylex-tailwind-boundaries.md`
- `docs/solutions/design-patterns/astryx-layout-gap-token-spacing.md`
- `CONCEPTS.md` entries for Astryx Foundation, Astryx Styling Boundary, and
  Astryx Spacing Token

## Scope

This design targets direct user-visible drift only. A finding is in scope when a
local app component owns visible text and styles it as typography through raw
elements, StyleX type-scale fields, Tailwind text utilities, or inline text
styles.

In-scope replacements:

- `apps/github.io/src/app/devops-capability-evidence/dora-capability-card.tsx`
  - Replace the raw styled `h3` capability title with Astryx `Heading`.
  - Replace the raw styled `p` description with Astryx `Text`.
  - Preserve `aria-labelledby`, the title `id`, and the heading role.
- `apps/github.io/src/app/devops-roadmap/devops-roadmap-node.tsx`
  - Replace the raw styled `h3` roadmap node title with Astryx `Heading`.
  - Preserve the node title as a heading and keep the article label unchanged.

Out of scope:

- `CapabilityEvidence` `span role="group"` wrappers, because they are
  accessibility grouping boundaries around Astryx `Token`, `Citation`, or local
  wrapper components.
- `SkillRating` decorative rating spans, because the visible star fragments are
  compact presentation with a `VisuallyHidden` accessible label rather than body
  copy or heading typography.
- `DevOpsCapabilityEvidenceRadar` MUI `sx` axis-label styling, because the text
  nodes are generated inside a third-party chart and there is no wrapper-level
  Astryx `Text` or `Heading` boundary that can own them.
- Test mocks that use raw `span` elements to stand in for child components.

## Recommended Approach

Use a targeted component-by-component cleanup.

In `DoraCapabilityCard`, import Astryx `Heading` and `Text`. Remove local
StyleX typography styles for `title` and `description`, and remove the
`typeScaleVars` import if it becomes unused. Keep `Card`, `VStack`, structural
StyleX, evidence row lists, and list item styling as they are.

The title and description should follow the `SkillCard` pattern:

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

In `DevOpsRoadmapNode`, import Astryx `Heading`. Remove local StyleX typography
for the title and remove `typeScaleVars` if unused. Keep StyleX for the React
Flow node surface, fixed sizing, padding, borders, shadows, and wrapping token
lists.

The title should become:

```tsx
<Heading level={3}>{item.title}</Heading>
```

## Accessibility

Heading semantics must not regress.

- `DoraCapabilityCard` must continue to expose a heading named by the capability
  label and use that heading as the article label through `aria-labelledby`.
- `DevOpsRoadmapNode` must continue to expose the roadmap item title as a
  heading.
- Existing list labels for evidence, skills, and certifications must remain
  unchanged.

## Styling Boundary

Astryx owns typography for the in-scope text. Local StyleX remains appropriate
for structural concerns such as display, width, min height, padding, background,
border, shadow, list reset, wrapping, and token spacing.

Do not introduce arbitrary pixel or font values. Use Astryx component props and
existing Astryx token aliases when structural styles still need local StyleX.

## Testing

Use existing focused tests where they already cover accessible behavior:

- `DoraCapabilityCard` already asserts that the capability title is reachable by
  heading role and that evidence rows keep their labels.
- `DevOpsRoadmap` tests cover roadmap node rendering and list behavior.

Add or adjust focused assertions only if the implementation reveals a semantics
gap, such as a missing heading role or unexpected heading level.

Run:

```sh
pnpm nx test github.io --skip-nx-cache
```

If touched components have stories and the implementation changes visible
composition beyond Astryx typography ownership, inspect those stories. The
expected visual intent is unchanged hierarchy with Astryx-owned text rendering.
