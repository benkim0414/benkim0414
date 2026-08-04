# Certification Citation HoverCard Design

## Goal

Add an Astryx `HoverCard` to concrete `CertificationCitation` links so pointer
and keyboard users can preview the credential ID, full certificate name,
current status, and completion date without navigating away. Preserve the
existing citation link as the primary action and keep generic certification
citations unchanged.

## Context

`CertificationCitation` is shared by skill cards, DevOps roadmap nodes, and
capability evidence. It currently accepts a compact title, certificate URL,
linked skills, expiry date, credential-specific badge, fallback icon, citation
number, and injectable current date. It derives active or expired status from
the expiry date and renders an Astryx `Citation`.

The concrete CKA, CKAD, and KCNA records have enough information to show a
credential preview, but the shared model does not yet carry the credential ID,
full certificate name, or completion date. Generic capability evidence does
not necessarily identify one credential and must not display an incomplete
preview.

## Design System Guidance

Use the existing Astryx components rather than creating local overlay or
key-value-list primitives:

- `HoverCard` is intended for supplementary link previews opened by hover or
  focus. Its content must not contain required actions.
- `MetadataList` and `MetadataListItem` provide semantic definition-list markup
  for read-only label/value data.
- Keep Astryx default placement, collision handling, spacing, surface styling,
  and open and close delays.
- Do not add custom component-library dependencies or a second styling system.

WCAG 2.2 Success Criterion 1.4.13 requires content shown on hover or focus to
be dismissible, hoverable, and persistent. Astryx `HoverCard` supplies focus
opening, pointer transfer into the card, `Escape` dismissal, and an
`aria-describedby` relationship to the trigger. The implementation should use
those behaviors without replacing them locally.

## Public Component Contract

Add a focused value object to the certification citation module:

```ts
export interface CertificationMetadata {
  id: string;
  name: string;
  completedAt: string;
}
```

Extend `CertificationCitationProps` with:

```ts
metadata?: CertificationMetadata;
```

The fields mean:

- `id`: the issuer-provided credential identifier.
- `name`: the full certificate name. The existing `title` remains the compact
  citation label such as `CKA`.
- `completedAt`: an ISO calendar date in `YYYY-MM-DD` form.

Do not add status to `CertificationMetadata`. `CertificationCitation` remains
the single owner of active or expired status and continues deriving it from
`expiresAt` and `currentDate`.

Keeping the metadata in one optional object creates a clear completeness
boundary and avoids a collection of independently optional props. It also
keeps the component reusable rather than introducing a registry of known
certification titles.

## Concrete Credential Data

Add the metadata object to the concrete Kubernetes certification records used
by the skill catalog and DevOps roadmap:

| Citation | ID | Full name | Completed |
| --- | --- | --- | --- |
| CKA | `LF-assbyzy17c` | Certified Kubernetes Administrator | `2025-04-20` |
| CKAD | `LF-kyh6ajhr7y` | Certified Kubernetes Application Developer | `2026-02-25` |
| KCNA | `LF-bau2ptq4ve` | Kubernetes and Cloud Native Associate | `2025-03-21` |

Update `SkillCertification` so its concrete records can carry the optional
metadata object. The roadmap certification type already derives from
`CertificationCitationProps` and should inherit the new field. Do not add
credential metadata to the generic capability-evidence record because it does
not identify one specific certificate.

## Rendering And Data Flow

`CertificationCitation` continues resolving status, skill brand, badge image,
and fallback icon exactly as it does today. It then chooses between two render
paths:

1. When `metadata`, a valid `expiresAt`, and `url` are present, render the
   existing Astryx `Citation` as the `HoverCard` trigger.
2. Otherwise, render the existing citation without a HoverCard.

The HoverCard contains one single-column `MetadataList` with four rows in this
order:

1. `ID`
2. `Name`
3. `Status`
4. `Completed`

Status is displayed as `Active` or `Expired`. Completion dates use a fixed
English formatter with abbreviated month, numeric day, and four-digit year,
for example `Apr 20, 2025`. Treat the ISO value as a calendar date and format
it without allowing the browser timezone to shift the displayed day.

The certificate URL is not repeated in the Metadata List. The citation itself
remains the certificate link.

## Interaction And Accessibility

The HoverCard is supplementary and read-only:

- Pointer hover over the citation opens it.
- Moving the pointer from the citation into the card keeps it open.
- Keyboard focus on the citation opens it.
- `Escape` closes it without activating the link and leaves focus on the
  citation.
- Moving focus away closes it.
- The card does not close on a reading timeout while the trigger or card stays
  hovered or focused.
- Click or `Enter` keeps the existing citation behavior and opens the
  certificate URL.
- A mobile tap opens the certificate URL directly; there is no mobile-only
  popover or two-step activation.

Keep the Metadata List free of links, buttons, or other focusable controls.
Allow Astryx `HoverCard` to attach `aria-describedby` to the actual Citation
link, and retain the existing visually hidden status for generic citations
that do not receive a HoverCard. Do not add another tab stop or change the
Citation accessible name.

## Fallbacks And Invalid Data

There is no loading or network state because all metadata is local static data.
The citation must remain usable when optional preview data is unavailable.

- Missing metadata, URL, or expiry data renders the current citation without a
  HoverCard.
- Empty metadata fields or invalid completion or expiry dates must not produce
  a partial or misleading HoverCard.
- Unknown skill branding and missing credential badge images retain the
  existing Citation icon fallback behavior.
- Invalid optional preview data must not prevent the citation from rendering or
  change its link target.

## Scope Boundaries

In scope:

- The shared `CertificationCitation` contract and rendering.
- Concrete CKA, CKAD, and KCNA metadata in skill and roadmap data.
- Focused unit tests and Storybook stories for complete and generic states.
- Desktop pointer and keyboard review plus mobile regression review.

Out of scope:

- A central registry that teaches `CertificationCitation` about known
  credentials.
- A click-triggered mobile Popover or modal.
- Interactive controls inside the HoverCard.
- Repeating or shortening the certificate URL inside the card.
- Changing certificate URLs, expiry dates, citation ordering, badge assets, or
  skill branding.
- Adding metadata to generic capability evidence.

## Testing And Validation

Add focused `CertificationCitation` tests that verify:

- Complete metadata produces a HoverCard with semantic `ID`, `Name`, `Status`,
  and `Completed` rows in the required order.
- The three representative credential values render exactly.
- Future and past expiry dates display `Active` and `Expired` respectively.
- ISO completion dates format as the requested English calendar dates without
  timezone drift.
- The Citation link retains its existing URL, accessible name, target, badge,
  numbering, and status attributes.
- The Citation trigger receives the HoverCard `aria-describedby`
  relationship.
- Generic and incomplete certification data does not produce a HoverCard.
- Existing skill-brand and fallback-icon paths continue to work.

Update Storybook with complete active and expired credential examples while
retaining a generic citation example. Visually review:

- Desktop hover opening and pointer movement into the card.
- Keyboard focus, `Escape` dismissal, and `Enter` link activation.
- Long full-name wrapping without clipping or overlap.
- Mobile citation layout and direct-link behavior without a popup dependency.

Run the focused project checks:

```sh
pnpm nx lint github.io
pnpm nx test github.io
pnpm nx build github.io
```

Run the relevant Storybook target or browser review for the updated component.

## Risks

- Wrapping the Citation incorrectly could attach HoverCard behavior to a
  non-focusable wrapper instead of the actual link. Tests must assert the
  `aria-describedby` relationship on the Citation trigger.
- Parsing `YYYY-MM-DD` through the local timezone can display the previous day.
  The formatter must treat completion values as calendar dates.
- The skill catalog and roadmap duplicate concrete certification records.
  Both data surfaces and their tests must be updated together so preview
  metadata does not drift.
- The full certificate name is substantially longer than the compact citation
  label. Storybook review must verify wrapping within the Astryx surface at
  relevant desktop widths.
