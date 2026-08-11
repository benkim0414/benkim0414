# DORA Card Summary Typography Design

## Goal

Present the generic DORA capability description and the portfolio owner's
experience summary as equally readable supporting prose. Keep their existing
content order and let their wording communicate their different roles without
adding stronger visual or quotation semantics.

## Context

The first implementation made the generic description supporting, secondary
text and the experience summary body, primary text. Visual review in Storybook
showed that this hierarchy made the summary unnecessarily prominent.

Astryx `Blockquote` was also considered because its left rule distinguishes a
passage while retaining secondary text color. The component is documented for
quotations, testimonials, and externally sourced excerpts. These achievement-
led summaries are portfolio statements rather than quotations, so using
`Blockquote` would add misleading HTML and content semantics.

## Design

Keep the card sequence unchanged:

1. capability heading;
2. generic DORA capability description;
3. experience summary, when the selected score provides one; and
4. evidence rows.

Render the generic description as an Astryx paragraph with body, secondary
typography:

```tsx
<Text type="body" color="secondary" as="p">
  {description}
</Text>
```

Render the experience summary with the same body, secondary typography:

```tsx
<Text type="body" color="secondary" as="p">
  {evidenceSummary}
</Text>
```

The explicit color documents the intended supporting role. Astryx continues
to own font size, weight, line height, color tokens, and theme behavior. The
description and summary are distinguished by their content and sequence, not
by typography. Do not add a label, `Blockquote`, italic styling, custom font
rules, a divider, or another component.

## Component Boundary And Data Flow

The change stays inside the shared `DoraCapabilityCard` presentation boundary.
The existing data flow remains:

`score-owned evidenceSummary -> summary resolver -> DoraCapabilityCard`

Do not change score records, summary copy, capability descriptions, evidence
selection, row grouping, token rendering, or card props. Every card with an
experience summary inherits the uniform typography from the shared component.
A card without a summary continues to omit that paragraph.

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
- the description and experience summary both use Astryx body, secondary text;
- a card without a summary still omits the summary cleanly.

Run the focused DORA capability card tests, then the relevant `github.io` lint
and build checks. Review representative Storybook cards at phone and tablet
widths to confirm that both prose passages remain readable, wrap naturally,
and do not compete with the capability heading.

## Out Of Scope

- Rewriting descriptions or experience summaries.
- Moving the experience summary before the DORA description.
- Adding a visible label such as "My experience."
- Presenting the experience summary as a quotation or pull-quote.
- Changing evidence data, scores, tokens, rows, spacing, or card dimensions.
- Introducing local typography styles or changing the Astryx theme.

## Acceptance Criteria

- The generic DORA description remains first.
- The following experience summary has the same body, secondary typography.
- Both passages use supported Astryx `Text` props only.
- Neither passage is presented with quotation semantics.
- All existing card content, ordering, responsive behavior, and accessibility
  relationships remain intact.
- Cards without an experience summary remain unchanged.
