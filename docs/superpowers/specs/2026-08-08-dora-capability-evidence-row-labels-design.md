# DORA Capability Evidence Row Labels Design

## Goal

Add concise visible labels to the experience and skill evidence rows in each
DORA capability card so readers can distinguish the two token groups at a
glance.

## Scope

This change affects presentation and accessibility in the DORA capability
card only. It does not change evidence records, score calculation, evidence
selection, group ordering, token styling, card dimensions, or Storybook data.

The existing `applied` group continues to combine `experience` and `project`
evidence. Its visible label is **Experiences**. The existing `skills` group is
labelled **Skills**.

Certification and learning groups receive no new visible labels in this
change.

## Component Design

`DoraCapabilityEvidenceRow` remains responsible for rendering one grouped
evidence row. It will look up an optional visible label for the row group:

| Evidence group | Visible label |
| --- | --- |
| `applied` | Experiences |
| `skills` | Skills |

For either labelled group, the component renders the label directly above the
existing token list using:

```tsx
<Text type="supporting" color="secondary">
  {label}
</Text>
```

The label and list use a small Astryx-native vertical gap of `spacing-1`. The
existing `spacing-2` gap between evidence groups remains unchanged. This keeps
the labels associated with their rows without increasing the overall card
spacing more than necessary.

Labels are conditional on the row being present because rows are already
omitted when they contain no evidence. No empty label or empty row is
rendered.

## Accessibility

Each visible label receives a stable React-generated ID. Its associated list
uses `aria-labelledby` so the visible text and accessible name stay aligned.
The existing capability article heading continues to provide the surrounding
card context.

Rows without a visible label retain the existing generated `aria-label`, so
certification and learning groups do not lose their accessible names.

The token-level accessible labels and semantics remain unchanged.

## Testing

Focused component tests will verify that:

- the combined `experience` and `project` row is visibly labelled
  **Experiences**;
- the skill row is visibly labelled **Skills**;
- each visible label names its corresponding list;
- labels render only when their corresponding evidence rows exist;
- evidence order and rendered token content remain unchanged; and
- unlabelled certification and learning rows preserve their current accessible
  names.

Final validation will run the focused DORA capability card tests, the full
`github.io` test target, lint, app build, and Storybook build. Storybook will
also be checked at phone and iPad viewports for label spacing, token wrapping,
and horizontal overflow.

## Out Of Scope

- Renaming the underlying `applied` evidence group.
- Adding visible labels for certifications or learning.
- Changing typography weight beyond the requested Astryx `supporting` text
  with the `secondary` color.
- Changing evidence data, scores, ordering, tokens, icons, or card layout
  width.
