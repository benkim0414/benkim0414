# DORA Capability Experience Label Design

## Goal

Use the conventional portfolio category label **Experience** instead of
**Experiences** above applied DORA capability evidence.

## Design

The visible label for the existing `applied` evidence group changes from
`Experiences` to `Experience`. The singular form treats experience as an
uncountable category and pairs naturally with the existing `Skills` label.

The visible `Text` remains `type="supporting"` and `color="secondary"`. The
associated evidence list continues to use the visible label through
`aria-labelledby`, so its accessible name also becomes `Experience`.

The `Skills` label remains unchanged.

## Validation

Update the DORA capability card component tests to expect the visible and
accessible label `Experience`, including the empty-state assertion. Run the
focused card tests, full `github.io` checks, Storybook build, and phone/iPad
visual checks.

## Out Of Scope

- Evidence data, types, selection, grouping, or order.
- Skill chronology or token styling.
- Typography, spacing, card dimensions, icons, and responsive behavior.
- Certification and learning row labels.
