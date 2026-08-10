# Certification Metadata Name Design

## Goal

Make the `CertificationCitation` hover-card hierarchy clearer by using a
stable category title and showing the concrete certification name as the first
metadata value.

## Background

`CertificationCitation` currently uses `metadata.name` as the
`MetadataList` title and renders three rows: `ID`, `Status`, and `Completed`.
This makes the card title record-specific while omitting the name from the
label/value metadata structure.

The requested presentation uses `Certification` as the fixed list title and
moves the certification name into the metadata list. The human-readable name
should precede the credential ID because it identifies the record more readily.

## Design

Keep the existing `CertificationCitation` component boundary and public props.
For a complete certification record, render one single-column `MetadataList`
with:

- Title: `Certification`
- Row 1: `Name` with `metadata.name`
- Row 2: `ID` with `metadata.id`
- Row 3: `Status` with the existing derived status badge
- Row 4: `Completed` with the existing formatted completion date

No new data transformation or state is required. The component continues to
derive status from `expiresAt`, format `metadata.completedAt`, and pass the
resulting content to the existing `HoverCard`.

## Validation and Fallback Behavior

Preserve the existing all-or-nothing metadata gate. The hover card renders only
when the citation has a URL, a valid derived status, a valid completion date,
and nonblank metadata name and ID. Missing, blank, malformed, or impossible
values continue to fall back to the plain actionable citation.

The certification name remains required even though it moves from the list
title into a row. The change does not alter status labels, badge variants,
date formatting, citation icon treatment, link behavior, or hidden accessible
status text.

## Accessibility

Retain the semantic `MetadataList` and `MetadataListItem` structure so each
visible label remains associated with its value. Preserve the existing
`HoverCard` relationship that connects the citation trigger to supplemental
content with `aria-describedby`.

The fixed `Certification` heading describes the content category. The first
`Name` row identifies the concrete credential without changing the citation's
concise accessible name or making the supplemental card interactive.

## Tests and Documentation

Update the existing `CertificationCitation` component test to assert:

- the metadata title is `Certification`;
- the definition list contains four label/value pairs in the order `Name`,
  `ID`, `Status`, and `Completed`;
- the `Name` value is the supplied `metadata.name`;
- the existing status badge, semantic markup, and `aria-describedby` behavior
  remain intact.

Keep the existing incomplete and invalid metadata tests unchanged except where
their expectations depend directly on the list title or row count.

Update the durable certification hover-card design-pattern documentation to
describe the fixed title and four-row order. Existing Storybook fixtures already
supply certification names and cover active, expired, and fallback states, so
no fixture or caller-data changes are needed.

Focused validation commands:

```sh
pnpm nx test github.io
pnpm nx lint github.io
```

## Boundaries

This change does not modify component props, certification data, callers,
styles, icons, hover-card interaction, status logic, date formatting, or the
generic citation fallback. It does not add new metadata fields or redesign the
popover beyond its title and name-row placement.

## Risks

The main risk is leaving tests or durable documentation coupled to the previous
record-specific title and three-row structure. Updating both with the component
keeps the UI contract explicit. The additional row may increase card height,
but the existing single-column layout and supplied certification names require
no new responsive behavior.
