# DORA Card Summary Hierarchy Design

## Goal

Make each DORA capability card distinguish the generic DORA capability
description from the portfolio owner's experience summary. The experience
summary should draw attention first while remaining after the description in
the existing content order.

## Context

`DoraCapabilityCard` currently renders both sentences with Astryx `Text` using
the `supporting` type. The experience summary also sets `color="secondary"`,
which is already the default color for supporting text. The two different
content roles therefore receive effectively identical typography.

Astryx defines `supporting` text for secondary information and `body` text for
primary prose. Its guidance recommends expressing intent through these
semantic types rather than setting local font size, line height, or raw font
weight values.

## Design

Keep the card sequence unchanged:

1. capability heading;
2. generic DORA capability description;
3. experience summary, when the selected score provides one; and
4. evidence rows.

Render the generic description as an Astryx paragraph with supporting,
secondary typography:

```tsx
<Text type="supporting" color="secondary" as="p">
  {description}
</Text>
```

Render the experience summary as an Astryx paragraph with body, primary
typography:

```tsx
<Text type="body" color="primary" as="p">
  {evidenceSummary}
</Text>
```

The explicit colors document the intended hierarchy even though they match
Astryx defaults. Astryx continues to own font size, weight, line height, color
tokens, and theme behavior. Do not add a label, italic styling, custom font
rules, a divider, or another component.

## Component Boundary And Data Flow

The change stays inside the shared `DoraCapabilityCard` presentation boundary.
The existing data flow remains:

`score-owned evidenceSummary -> summary resolver -> DoraCapabilityCard`

Do not change score records, summary copy, capability descriptions, evidence
selection, row grouping, token rendering, or card props. Every card with an
experience summary inherits the new hierarchy from the shared component. A
card without a summary continues to omit that paragraph.

## Layout And Accessibility

Preserve the current Astryx `Card`, `Heading`, and `VStack` anatomy, including
all padding and gaps. Both prose values should use paragraph semantics. The
capability heading remains the article's accessible name, and evidence-row
labels and list semantics remain unchanged.

No new runtime error state is required. A missing score or missing
`evidenceSummary` already resolves to no summary, which remains the intended
fallback.

## Validation

Update the focused `DoraCapabilityCard` component tests to verify:

- the description and experience summary both render;
- the description precedes the experience summary;
- both values use paragraph semantics;
- the description uses Astryx supporting, secondary text;
- the experience summary uses Astryx body, primary text; and
- a card without a summary still omits the summary cleanly.

Run the focused DORA capability card tests, then the relevant `github.io` lint
and build checks. Review representative Storybook cards at phone and tablet
widths to confirm that the stronger experience summary remains readable,
wraps naturally, and does not compete with the capability heading.

## Out Of Scope

- Rewriting descriptions or experience summaries.
- Moving the experience summary before the DORA description.
- Adding a visible label such as "My experience."
- Changing evidence data, scores, tokens, rows, spacing, or card dimensions.
- Introducing local typography styles or changing the Astryx theme.

## Acceptance Criteria

- The generic DORA description remains first and reads as secondary context.
- The following experience summary is visibly primary without a label.
- The distinction uses supported Astryx `Text` props only.
- All existing card content, ordering, responsive behavior, and accessibility
  relationships remain intact.
- Cards without an experience summary remain unchanged.
