---
title: Keep Certification HoverCards Supplemental to Direct Links
date: 2026-08-04
last_updated: 2026-08-10
category: design-patterns
module: github.io certifications
problem_type: design_pattern
component: tooling
severity: low
applies_when:
  - A linked citation benefits from supplemental read-only credential details
  - Hover and keyboard users need equivalent access to supplemental information
  - Mobile tap must continue to activate the underlying link directly
  - Optional credential metadata may be incomplete or invalid
related_components:
  - testing_framework
tags:
  - accessibility
  - certification-metadata
  - hover-card
  - keyboard-focus
  - mobile-interaction
  - progressive-enhancement
---

# Keep Certification HoverCards Supplemental to Direct Links

## Context

`CertificationCitation` is first an actionable certificate link. Concrete
credentials can also provide an issuer ID, full certificate name, completion
date, and derived status, but that supplemental information must not replace or
weaken the link.

The component is also used for generic capability evidence that may identify a
certification category without identifying one concrete credential. Concrete
skill records can carry optional `CertificationMetadata`, while generic
capability evidence deliberately calls `CertificationCitation` without it
(`apps/github.io/src/app/skills/skill-list.types.ts:21` and
`apps/github.io/src/app/devops-capability-evidence/capability-evidence.tsx:101`).

Treat the metadata card as progressive enhancement: the citation must remain
complete and usable by itself, and the card appears only when its data is
concrete and valid.

Within a complete card, separate the stable content category from the identity
of the concrete record. `Certification` describes what kind of metadata the
card contains; the full certificate name identifies which credential it
describes. Keeping those roles distinct avoids turning a record value into the
card's structural heading.

## Guidance

### Preserve the native link as the trigger

Create the Astryx `Citation` once, including its URL and accessible link
semantics, then pass that same element to `HoverCard`. The enhanced and fallback
branches render the identical citation; neither branch adds a click handler or
a second link
(`apps/github.io/src/app/certifications/certification-citation.tsx:172-182`
and `apps/github.io/src/app/certifications/certification-citation.tsx:193-217`).

This keeps the trigger's native link markup intact. Treat equivalent click,
keyboard `Enter`, and mobile-tap behavior as an overlay contract to verify with
browser and device testing. The URL is already represented by the citation
action, so do not duplicate it as a metadata row. Supplemental content should
not create a second tab stop or require users to enter the card to complete
navigation.

### Gate the enhancement as one complete value

Do not render independent optional rows. Require all inputs needed for a
trustworthy card: a URL, a valid expiry from which status can be derived, a
valid completion date, and nonblank credential ID and name. The implementation
collects those requirements in `hasCompleteMetadata`; failure keeps the plain
citation
(`apps/github.io/src/app/certifications/certification-citation.tsx:146-152`).

Validate calendar dates explicitly. JavaScript can normalize impossible dates
such as February 30 into March. Both expiry and completion validation round-trip
the `YYYY-MM-DD` portion through UTC before accepting it
(`apps/github.io/src/app/certifications/certification-citation.tsx:74-86` and
`apps/github.io/src/app/certifications/certification-citation.tsx:107-121`). Tests
cover blank fields, malformed dates, and impossible calendar dates while
asserting that the citation still renders
(`apps/github.io/src/app/certifications/certification-citation.spec.tsx:289`).

### Keep derived values derived

Store only `id`, `name`, and `completedAt` as credential metadata
(`apps/github.io/src/app/certifications/certification-citation.tsx:35-39`). Derive
`Active` or `Expired` from the validated `expiresAt` timestamp and the current
date instead of persisting another source of truth
(`apps/github.io/src/app/certifications/certification-citation.tsx:89-105`).

Treat completion as a calendar date. Parse midnight UTC and format with a fixed
English locale and UTC timezone so the displayed day does not shift with the
viewer's timezone
(`apps/github.io/src/app/certifications/certification-citation.tsx:67-72` and
`apps/github.io/src/app/certifications/certification-citation.tsx:107-121`).

### Keep supplemental content semantic and read-only

Use `Certification` as the fixed title of one single-column `MetadataList`,
with exactly four rows in this order: `Name`, `ID`, `Status`, and `Completed`.
The category title stays stable while the first row identifies the concrete
credential with its full certificate name
(`apps/github.io/src/app/certifications/certification-citation.tsx:194-210`). Render
status as a non-interactive Astryx `Badge`: use the green variant for `Active`
and the neutral variant for `Expired`, representing a lapsed state without
treating expiration as an error. Keep the visible label so color is never the
only status signal.

The component test verifies the fixed category title outside the definition
list, the name as the first definition-list value, the Badge contract,
`dt`/`dd` semantics, and `aria-describedby` linkage
(`apps/github.io/src/app/certifications/certification-citation.spec.tsx:44-76`).

Require these behaviors from any overlay component used here: hover and keyboard
focus access, pointer transfer into the content, enough persistence to read it,
and `Escape` dismissal without moving focus. Verify them independently before
relying on the component contract; the semantic unit tests do not exercise
pointer, timing, or focus behavior. Keep required actions out of the card; the
primary task remains following the citation.

## Why This Matters

Supplemental information should not weaken the control it describes. Keeping
the actual link as the trigger preserves familiar activation across pointer,
keyboard, and touch input while still exposing richer context on hover or
focus.

The all-or-nothing metadata boundary prevents plausible-looking partial cards.
A missing URL, blank issuer ID, generic evidence record, or invalid date cannot
silently imply a verified credential. Failure is non-destructive because the
original citation remains available.

Derived status and timezone-stable date formatting also keep every consumer
consistent. Semantic label/value markup associates details with the link
without changing its concise accessible name.

A stable `Certification` heading makes repeated cards easier to scan, while a
Name-first row order presents the most recognizable credential value before its
issuer-specific ID. The name remains inside the same semantic label/value
structure as status and completion date instead of receiving special markup
that consumers must interpret differently.

## When to Apply

- An existing link has concise primary text and optional read-only context helps
  users decide whether to navigate.
- Preview data is already available and can be validated synchronously.
- The trigger remains independently understandable and operable.
- The overlay contains no action required to complete the primary task.

Do not use this pattern when a first mobile tap must open the preview before the
link can be followed, when the overlay needs required interactive controls, or
when the available data describes only a category rather than one concrete
record. Concrete CKA, CKAD, and KCNA records carry metadata, while generic
capability evidence stays on the plain-citation path
(`apps/github.io/src/app/skills/skill-list.data.ts:96` and
`apps/github.io/src/app/devops-capability-evidence/capability-evidence.tsx:114`).

## Examples

Keep the compact label and destination separate from the full supplemental
identity:

```tsx
<CertificationCitation
  title="CKA"
  url={certificateUrl}
  expiresAt="2027-04-20T10:00:00+10:00"
  metadata={{
    id: 'LF-assbyzy17c',
    name: 'Certified Kubernetes Administrator',
    completedAt: '2025-04-20',
  }}
/>
```

This renders the fixed title `Certification` followed by metadata values
`Certified Kubernetes Administrator`, `LF-assbyzy17c`, derived status `Active`,
and `Apr 20, 2025`; the semantic test asserts those values and their row order
(`apps/github.io/src/app/certifications/certification-citation.spec.tsx:44-76`).

The structural change is intentionally small. Replace the record-specific
heading and ID-first rows:

```tsx
<MetadataList columns="single" title={metadata.name}>
  <MetadataListItem label="ID">{metadata.id}</MetadataListItem>
  <MetadataListItem label="Status">...</MetadataListItem>
  <MetadataListItem label="Completed">{completedAt}</MetadataListItem>
</MetadataList>
```

with a stable heading and Name-first semantic rows:

```tsx
<MetadataList columns="single" title="Certification">
  <MetadataListItem label="Name">{metadata.name}</MetadataListItem>
  <MetadataListItem label="ID">{metadata.id}</MetadataListItem>
  <MetadataListItem label="Status">...</MetadataListItem>
  <MetadataListItem label="Completed">{completedAt}</MetadataListItem>
</MetadataList>
```

Lock the hierarchy with one complete-metadata test that asserts the heading,
ordered `dt` labels, and ordered `dd` values. Keep the incomplete and invalid
metadata cases in the same suite so presentation changes cannot accidentally
weaken the plain-citation fallback
(`apps/github.io/src/app/certifications/certification-citation.spec.tsx:44-76`
and `apps/github.io/src/app/certifications/certification-citation.spec.tsx:280-345`).

For generic evidence, omit `metadata` and leave the proof URL on the citation:

```tsx
<CertificationCitation
  title={label}
  url={evidence.proofUrl}
  expiresAt={evidence.endDate}
  skills={evidence.technologies}
/>
```

Validate the pattern with semantic unit tests and device review. The active,
expired, multi-skill, and generic fallback states have explicit Storybook
fixtures (`apps/github.io/src/app/certifications/certification-citation.stories.tsx:14`).
The mobile presentation and direct-touch behavior were manually accepted on an
iPad through Storybook. Desktop pointer transfer, keyboard interaction, and the
accessibility tree were not independently browser-automated in this change, so
do not represent the semantic tests as end-to-end browser coverage.

## Related

- [Use Compact Capability Evidence Renderers](compact-capability-evidence-renderers.md)
- [Verify Astryx Component API Contracts Before Styling](../best-practices/astryx-component-api-contracts.md)
- [Make Certification Badge Storybook Fixtures Explicit](../ui-bugs/storybook-certification-badge-fixtures.md)
- [Make Color-Only Certification Brand Fallbacks Reachable](../logic-errors/color-only-certification-brand-fallback.md)
- [Verify Storybook From Linked Worktrees](../workflow-issues/verify-storybook-from-linked-worktree.md)
