# Skill outcome list label research

Date: 2026-09-13

## Recommendation

Remove the visible `Key outcomes` text and leave the Astryx `List` unnamed.

```tsx
<List density="compact" listStyle="disc">
  {outcomes.map((outcome) => (
    <ListItem key={outcome} label={/* wrapping primary body Text */} />
  ))}
</List>
```

The surrounding card already establishes the visual hierarchy with an `h3`
experience title and a summary paragraph. Disc markers then make the following
content visibly recognizable as a collection of supporting points. Repeating
`Key outcomes` in every card adds another typographic stop without resolving
an ambiguity for sighted readers.

An accessible-only name is not necessary. WAI-ARIA allows an author-provided
name for `role="list"`, but—unlike `listbox`—does not mark that name as
required. Repeating the same generic accessible name on every card would add
verbosity without helping users distinguish one list from another
([WAI-ARIA 1.2, `list` role](https://www.w3.org/TR/wai-aria-1.2/#list)).

## What Astryx requires and recommends

Astryx 0.5.4 exposes `header?: ReactNode`; the question mark makes the prop
optional at the TypeScript API level. In implementation, Astryx adds an
`aria-labelledby` relationship only when `header` is present, and deliberately
preserves a consumer-provided `aria-label` or external `aria-labelledby` when
there is no header. The tests cover all three states: generated association for
`header`, no generated association without it, and forwarded consumer ARIA
attributes
([List source](/home/benkim0414/workspace/benkim0414/node_modules/@astryxdesign/core/src/List/List.tsx),
[List tests](/home/benkim0414/workspace/benkim0414/node_modules/@astryxdesign/core/src/List/List.test.tsx)).

Astryx documentation is stronger as design guidance: its anatomy marks `List
title` as required and its best practices say to provide a header to label the
list and give screen-reader context. That is a **recommendation encoded in
documentation**, not an enforced component/API requirement
([List docs](/home/benkim0414/workspace/benkim0414/node_modules/@astryxdesign/core/src/List/List.doc.mjs)).

The shipped `ListBulletedFeatures` template is the closest content analogue to
these outcome bullets. It renders `<List listStyle="disc">` with three
non-interactive feature statements and **no header**. Its template metadata
describes this as a “Bulleted list of feature highlights” and marks the example
ready. This demonstrates that Astryx accepts a headerless visible treatment
for a short, contextually obvious prose list, even though the general docs
recommend a header
([template source](/home/benkim0414/workspace/benkim0414/node_modules/@astryxdesign/cli/assets/templates/blocks/components/List/ListBulletedFeatures.tsx),
[template metadata](/home/benkim0414/workspace/benkim0414/node_modules/@astryxdesign/cli/assets/templates/blocks/components/List/ListBulletedFeatures.doc.mjs)).

The template does not supply an accessible name either. This aligns both its
visual treatment and semantics with the recommended card treatment.

## What HTML and accessibility standards require

- WHATWG defines `ul` as an unordered list of items and does not require a
  visible heading or caption. The outcome statements qualify when their order
  is not material
  ([HTML Standard, `ul`](https://html.spec.whatwg.org/dev/grouping-content.html#the-ul-element)).
- WAI recommends semantic unordered lists to group information and provide
  orientation; its examples do not add a visible heading to every list
  ([WAI Content Structure tutorial](https://www.w3.org/WAI/tutorials/page-structure/content/#lists)).
- WAI-ARIA 1.2 defines `list` as a section containing `listitem` elements and
  supports name-from-author, but does not make an accessible name required
  ([WAI-ARIA 1.2, `list` role](https://www.w3.org/TR/wai-aria-1.2/#list)).
- WCAG does not state that every list needs a separately visible label.
  WCAG's structure guidance is to convey relationships programmatically and
  use headings/labels where they describe topic or purpose. The experience
  title already heads the card; adding a peer-looking outcome heading is a UX
  choice rather than a WCAG requirement
  ([WCAG 2.2 SC 1.3.1](https://www.w3.org/TR/WCAG22/#info-and-relationships),
  [WCAG 2.2 SC 2.4.6](https://www.w3.org/TR/WCAG22/#headings-and-labels)).

## Option comparison

| Option | Visual effect | Semantics/accessibility | Assessment |
| --- | --- | --- | --- |
| Retain visible `Key outcomes` | Explicit, but repeats the same label in every card and inserts a new stop between summary and bullets. | Astryx `header` creates `aria-labelledby`, so the list is named. | Valid, but unnecessarily heavy in this surrounding context. |
| Rename or make the label subtler (`Highlights`, supporting text) | Shorter wording may feel less formal, but remains repeated chrome; secondary color also makes an important structural cue visually weaker. | Still named when passed through `header`. | Use only if user testing shows sighted readers cannot infer the bullets' relationship to the summary. `Highlights` is the better visible wording if needed. |
| Accessible-only `Key outcomes` | No repeated visible chrome; title → summary → bullets reads directly. | Names the list, but repeats a generic name on every card. A visually hidden `header` also leaves Astryx's `--spacing-2` header margin. | Valid, but unnecessary unless testing shows the list needs a programmatic name. |
| No label of any kind | Matches Astryx's bulleted-features template and HTML allows an uncaptioned `ul`. | Preserves native list semantics; WAI-ARIA does not require a list name. The containing card supplies the reading context. | **Recommended.** |

## Why an accessible-only label is unnecessary here

Astryx does provide a `VisuallyHidden` primitive for content that assistive
technology should perceive while sighted users should not
([VisuallyHidden source](/home/benkim0414/workspace/benkim0414/node_modules/@astryxdesign/core/src/VisuallyHidden/VisuallyHidden.tsx)).
It could be passed as the `header`, and Astryx would associate the header
wrapper through `aria-labelledby`. However, `List` always gives its header
wrapper `marginBottom: --spacing-2`; visually hiding only the header content
would leave otherwise unexplained layout space. A direct `aria-label` avoids
that artifact, but is still redundant for these short, contextual lists.

Do not point `aria-labelledby` only at the experience `h3`. That would name the
list after the experience itself rather than describe the collection as its
outcomes, and the same heading already identifies the containing card.

## Validation implications

- Query each outcome list with `getByRole('list')` within its card.
- Assert that visible text `Key outcomes` is absent.
- Preserve complete, wrapping outcome text and semantic list items.
- Visually check that removal of the header closes only its intended
  `--spacing-2` gap and that the parent card's existing `VStack gap={3}` still
  separates summary, outcomes, and relevant skills.
- If future user testing demonstrates that the bullet group is visually
  ambiguous, introduce the shorter visible header `Highlights`; that is a
  reversible content choice, not a semantic dependency.

## Primary sources inspected

Installed Astryx Core, CLI templates, and tests are version `0.5.4`, pinned by
the repository lockfile. Relevant sources were found with:

```sh
find -L /home/benkim0414/workspace/benkim0414/node_modules/@astryxdesign/cli \
  -type f | rg 'ListBulletedFeatures|List.*\.doc\.mjs'
rg -n 'aria-label|aria-labelledby|header=|listStyle="disc"' \
  /home/benkim0414/workspace/benkim0414/node_modules/@astryxdesign/core/src/List \
  /home/benkim0414/workspace/benkim0414/node_modules/@astryxdesign/cli/assets/templates/blocks/components/List
```
