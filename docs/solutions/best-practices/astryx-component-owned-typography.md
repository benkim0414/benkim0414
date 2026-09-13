---
title: Use Astryx Typography For Component-Owned Text
date: 2026-07-31
last_updated: 2026-09-13
category: best-practices
module: github.io Astryx typography
problem_type: best_practice
component: tooling
severity: low
applies_when:
  - Auditing github.io components for design-system typography drift
  - Replacing local raw heading or paragraph styles in Astryx-based UI
  - Deciding whether visible text belongs to Astryx typography or a wrapper boundary
  - Choosing between semantic prose and quote-like visual treatment
  - Deciding whether a contextual Astryx prose list needs its own label
related_components:
  - github.io Astryx Foundation
  - Astryx Styling Boundary
  - github.io DevOps capability evidence
  - github.io DevOps roadmap
tags: [astryx, typography, design-system, accessibility, github-io, react, semantics, dora]
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
- When matching a page-section label to another label, copy both the Astryx
  typography props and the intended heading level. A label that looks like body
  text can still be a semantic section heading.
- Keep StyleX for structural styling such as width, padding, list reset,
  wrapping, borders, shadows, and third-party node geometry.
- Leave accessibility-only wrappers and third-party generated internals in
  their existing wrapper or vendor styling boundary unless there is a clear
  Astryx `Text` or `Heading` boundary around the owned text.

`DoraCapabilityCard` now follows this split. The card imports Astryx `Heading`
and `Text`, keeps StyleX only for card/list structure, and uses the heading id
as the article label (`apps/github.io/src/app/devops-capability-evidence/dora-capability-card.tsx:1-6`,
`apps/github.io/src/app/devops-capability-evidence/dora-capability-card.tsx:35-53`,
`apps/github.io/src/app/devops-capability-evidence/dora-capability-card.tsx:105-123`):

```tsx
<VStack gap={1}>
  <Heading id={titleId} level={3}>
    {capability.label}
  </Heading>
  <Text type="body" color="secondary" as="p">
    {description}
  </Text>
  {evidenceSummary ? (
    <Text type="body" color="secondary" as="p">
      {evidenceSummary}
    </Text>
  ) : null}
</VStack>
```

Choose the Astryx component by what the content is before choosing it for its
appearance. `Blockquote` supplies a useful left rule, but it renders a semantic
`<blockquote>` and its optional attribution as `<footer><cite>`
(`node_modules/@astryxdesign/core/src/Blockquote/Blockquote.tsx:25-33`,
`node_modules/@astryxdesign/core/src/Blockquote/Blockquote.tsx:78-93`). Astryx
documents it for quotations, testimonials, and external excerpts
(`node_modules/@astryxdesign/core/src/Blockquote/Blockquote.doc.mjs:36-42`). An
authored portfolio achievement summary should be treated as supporting prose
unless its content is an actual quotation or attributed external excerpt; a
quote component would otherwise add misleading HTML semantics merely to obtain
a visual treatment.

When a generic capability description and an achievement-led summary belong to
the same compact card, matching `body`/`secondary` paragraphs can be the right
hierarchy. Keep their order, let their wording distinguish their roles, and
omit the summary paragraph when no summary resolves. Do not add a label,
quotation treatment, or local font rules just to make the summary stand out.
The shared DORA card applies this contract at
`apps/github.io/src/app/devops-capability-evidence/dora-capability-card.tsx:120-148`.

Apply the same semantic restraint to short prose lists inside an already named
card. Astryx's general `List` guidance recommends a header, but the component
API makes `header` optional and its ready `ListBulletedFeatures` template omits
one. WAI-ARIA likewise allows an author-provided name for `role="list"` without
requiring it; `Name From: author` means that a name is supported, not mandatory.
Check the separate `Accessible Name Required` characteristic rather than
inferring a requirement from name-source wording.

For skill experience cards, the level-three title and summary already establish
the context for the immediately following outcomes. The shared renderer therefore
uses an unnamed compact, disc-marked Astryx list with primary body text, while
retaining `List`/`ListItem` semantics and omitting empty collections
(`apps/github.io/src/app/skills/skill-key-outcomes.tsx:9-28`). Keep a visible
header when a list is standalone or ambiguous, and add an accessible-only name
only when it gives the group a useful, distinguishing identity. Do not apply
this rule to interactive roles such as `listbox`, whose requirements differ.

`DevOpsRoadmapNode` uses the same rule for node titles: the visible title is an
Astryx `Heading`, while StyleX still owns React Flow node structure and token
list layout (`apps/github.io/src/app/devops-roadmap/devops-roadmap-node.tsx:1-4`,
`apps/github.io/src/app/devops-roadmap/devops-roadmap-node.tsx:23-63`,
`apps/github.io/src/app/devops-roadmap/devops-roadmap-node.tsx:73-87`).

Page-level section labels use Astryx `Heading` at their semantic level so the
document outline and themed heading type scale stay aligned. The home page keeps
its page `h1` visually hidden while rendering `Top skills` and
`DORA capabilities` as `Heading level={2}`. The visible Skills and DevOps
roadmap labels follow the same H2 contract, while the filter popover uses
`Heading level={3}` for its nested label. Focused tests assert both the
accessible level and Astryx's stable `astryx-heading` and `data-level` surfaces.

## Why This Matters

Typography is part of component semantics, not only visual styling. Moving
component-owned text into Astryx `Heading` and `Text` keeps the type scale,
accessibility semantics, and design-system defaults aligned with Astryx
examples. It also makes later reviews easier: local CSS that remains near the
text is expected to be structural, not a parallel typography system.

Semantic restraint matters as much as visual consistency. A component that
looks appropriate but misstates the content's provenance creates a weaker
contract for assistive technology and future maintainers. Matching paragraphs
keep the capability heading dominant, preserve honest HTML, and leave theme
behavior with Astryx rather than introducing card-specific emphasis.

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
- A user asks for one visible page-section label to match another, and the
  source label's semantic heading level is part of the desired match.
- A compact card pairs generic explanatory context with an authored summary,
  and neither passage is a quotation, testimonial, callout, or second heading.
- A visually distinctive Astryx component is being considered mainly for its
  border, spacing, or typography rather than its content semantics.
- A short, non-interactive prose list follows a card heading and summary, and a
  repeated generic label would add no distinguishing information.

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
<Text type="body" color="secondary" as="p">
  {description}
</Text>
{evidenceSummary ? (
  <Text type="body" color="secondary" as="p">
    {evidenceSummary}
  </Text>
) : null}
```

Lock the content contract rather than only taking a snapshot. The focused DORA
card tests assert paragraph markup, matching `body`/`secondary` props,
description-before-summary order, absence of `blockquote` and label text, and a
single description paragraph when no summary resolves
(`apps/github.io/src/app/devops-capability-evidence/dora-capability-card.spec.tsx:251-290`,
`apps/github.io/src/app/devops-capability-evidence/dora-capability-card.spec.tsx:545-566`):

```tsx
expect(descriptionText.tagName).toBe('P');
expect(summaryText.getAttribute('data-type')).toBe('body');
expect(summaryText.getAttribute('data-color')).toBe('secondary');
expect(card.querySelector('blockquote')).toBeNull();
expect(screen.queryByText(/my experience/i)).toBeNull();
```

Automated semantic assertions do not prove that two prose passages remain calm
and readable in a compact card. Inspect representative production-data stories
at `390x844` and `768x1024`; confirm order, wrapping, matching treatment, and
absence of horizontal overflow
(`docs/superpowers/plans/2026-08-11-dora-card-summary-hierarchy.md:156-174`).

For roadmap nodes, test the semantic contract rather than implementation
markup. The roadmap node test now asserts the article and heading roles for the
same visible node title (`apps/github.io/src/app/devops-roadmap/devops-roadmap.spec.tsx:262`,
`apps/github.io/src/app/devops-roadmap/devops-roadmap.spec.tsx:263`):

```tsx
expect(getByRole('article', { name: 'Containers' })).toBeTruthy();
expect(getByRole('heading', { name: 'Containers' })).toBeTruthy();
```

When a page label intentionally mirrors another page label, make the test assert
the semantic level, not only that text appears. The roadmap page test protects
the `h2` contract at `apps/github.io/src/app/devops-roadmap/roadmap-page.spec.tsx:54`:

```tsx
expect(
  getByRole('heading', { level: 2, name: 'DevOps roadmap' }),
).toBeTruthy();
```

For a contextually obvious outcome list, preserve the list semantics without
adding repeated visual or spoken chrome:

```tsx
<List density="compact" listStyle="disc">
  {outcomes.map((outcome) => (
    <ListItem
      key={outcome}
      label={
        <Text type="body" color="primary">
          {outcome}
        </Text>
      }
    />
  ))}
</List>
```

Test both halves of that contract: the semantic list and items remain, while
the redundant label and its programmatic naming attributes stay absent
(`apps/github.io/src/app/skills/skill-experience-card-list.spec.tsx:72-88`,
`apps/github.io/src/app/skills/skill-experience-list.spec.tsx:82-103`). If the
card can contain another list, identify outcomes by their stable presentation
contract rather than DOM order.

## Related

- `CONCEPTS.md`
- `docs/solutions/best-practices/astryx-stylex-tailwind-boundaries.md`
- `docs/solutions/conventions/tokenize-dora-capability-evidence.md`
- `docs/solutions/design-patterns/compact-capability-evidence-renderers.md`
- `docs/solutions/design-patterns/astryx-layout-gap-token-spacing.md`
- `docs/solutions/design-patterns/model-skill-experience-as-astryx-narrative-cards.md`
- `docs/solutions/design-patterns/skill-detail-experience-section-labeling.md`
- `docs/solutions/design-patterns/constrain-devops-roadmap-skill-inventory-nodes.md`
