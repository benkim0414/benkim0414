---
title: Use Astryx Typography For Component-Owned Text
date: 2026-07-31
last_updated: 2026-08-26
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
as the article label (`apps/github.io/src/app/devops-capability-evidence/dora-capability-card.tsx:1`,
`apps/github.io/src/app/devops-capability-evidence/dora-capability-card.tsx:23`,
`apps/github.io/src/app/devops-capability-evidence/dora-capability-card.tsx:103`):

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

`DevOpsRoadmapNode` uses the same rule for node titles: the visible title is an
Astryx `Heading`, while StyleX still owns React Flow node structure and token
list layout (`apps/github.io/src/app/devops-roadmap/devops-roadmap-node.tsx:3`,
`apps/github.io/src/app/devops-roadmap/devops-roadmap-node.tsx:23`,
`apps/github.io/src/app/devops-roadmap/devops-roadmap-node.tsx:69`).

Page-level labels can use Astryx `Text` when their visual role is a compact
section label rather than a large page title. The home page `Top skills` label
renders as `Text as="h2" type="body" weight="bold"` at
`apps/github.io/src/app/skills/home-page.tsx:33`, while the page `h1` is kept
separate as a visually hidden `Home` heading at
`apps/github.io/src/app/skills/home-page.tsx:28`. To make the DevOps roadmap
label match that contract, `RoadmapPage` uses the same `Text as="h2"` body-bold
pattern instead of `Heading level={1}` at
`apps/github.io/src/app/devops-roadmap/roadmap-page.tsx:22`.

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
(`apps/github.io/src/app/devops-capability-evidence/dora-capability-card.spec.tsx:241-267`,
`apps/github.io/src/app/devops-capability-evidence/dora-capability-card.spec.tsx:523-544`):

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
same visible node title (`apps/github.io/src/app/devops-roadmap/devops-roadmap.spec.tsx:261`,
`apps/github.io/src/app/devops-roadmap/devops-roadmap.spec.tsx:262`):

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

## Related

- `CONCEPTS.md`
- `docs/solutions/best-practices/astryx-stylex-tailwind-boundaries.md`
- `docs/solutions/conventions/tokenize-dora-capability-evidence.md`
- `docs/solutions/design-patterns/compact-capability-evidence-renderers.md`
- `docs/solutions/design-patterns/astryx-layout-gap-token-spacing.md`
