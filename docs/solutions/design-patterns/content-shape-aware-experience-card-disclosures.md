---
title: Make Experience Card Disclosures Content-Shape-Aware
date: 2026-09-14
category: design-patterns
module: apps/github.io skills
problem_type: design_pattern
component: frontend
severity: medium
applies_when:
  - Rendering compact Experience Narrative cards on small screens
  - Placing disclosure labels and chevrons for optional card sections
  - Supporting highlights-only, skills-only, mixed, and empty content shapes
related_components:
  - Experience Narrative
  - Skill Token
  - DevOps Capability Evidence
  - Astryx components
tags:
  - github-io
  - skills-page
  - experience
  - skill-tokens
  - responsive-design
  - disclosure
  - accessibility
  - astryx
---

# Make Experience Card Disclosures Content-Shape-Aware

## Context

Experience cards compact long supporting evidence behind one disclosure on
small screens. The disclosure can contain highlights, relevant skills, both, or
neither. A placement rule based only on open state is insufficient because the
label that may move into the panel is also the only meaningful trigger label in
a skills-only card.

An intermediate implementation replaced the expanded skills-only label with
visually hidden collapse text. That preserved an accessible name, but left the
chevron visibly detached on a row above the skill section. Rendering the label
in both places instead produced duplicate `Relevant skills` labels. The durable
invariant is therefore about visible ownership: the chevron must stay attached
to the label of the only section it controls.

## Guidance

Model disclosure presentation as a content-shape matrix, not an `isOpen`
toggle alone:

| Content shape | Collapsed trigger | Expanded trigger | Expanded panel |
| --- | --- | --- | --- |
| Highlights and skills | `Highlights [N]`, `Relevant skills [N]` | `Highlights [N]` | Highlights, then `Relevant skills [N]` and tokens |
| Highlights only | `Highlights [N]` | `Highlights [N]` | Highlights |
| Skills only | `Relevant skills [N]` | `Relevant skills [N]` | Tokens without another heading |
| Neither | No disclosure | No disclosure | Nothing |

The shared shell owns trigger composition. It keeps the skills segment visible
when the card is closed or when no highlight segment can identify the open
control (`apps/github.io/src/app/skills/skill-experience-card-shell.tsx:40-66`):

```tsx
{skillCount > 0 && (!isOpen || outcomeCount === 0) ? (
  <>
    <Text type="supporting" color="secondary">
      Relevant skills
    </Text>
    <CountBadge count={skillCount} />
  </>
) : null}
```

Each renderer owns its expanded section markup. It renders the inner skills
heading only when the corresponding highlight collection is non-empty, while
always rendering available tokens
(`apps/github.io/src/app/skills/skill-experience-card-list.tsx:94-126`,
`apps/github.io/src/app/skills/skill-experience-list.tsx:65-95`). This division
keeps viewport and disclosure state out of the renderers, and keeps the shell
from inspecting arbitrary children.

## Why This Matters

Visible and accessible naming are related but not interchangeable. Hidden text
can name an icon-only button for assistive technology, but cannot give sighted
users the visual relationship between that control and its content. Conversely,
duplicating the visible label in trigger and panel makes the section hierarchy
noisy and suggests two separate groups.

The content-shape matrix also makes empty-state behavior explicit. The shell
derives `hasDetails` from both counts and omits the entire `Collapsible` when
both are zero (`apps/github.io/src/app/skills/skill-experience-card-shell.tsx:27-40`).
That prevents a chevron with nothing to reveal.

## When to Apply

- A disclosure summarizes two or more independently optional sections.
- A section label changes location between collapsed and expanded states.
- The same controlled shell accepts panel content from multiple renderers.
- A single-section state would otherwise leave an icon or chevron without a
  visible label on the same row.

## Examples

Protect the invariant at every renderer boundary, not only in a shell unit
test. After expanding a skills-only card, assert that the same semantic button
name and element remain, and that only one visible label exists:

```tsx
const disclosure = screen.getByRole('button', {
  name: 'Relevant skills 1',
});

fireEvent.click(disclosure);

expect(disclosure.getAttribute('aria-expanded')).toBe('true');
expect(screen.getByRole('button', { name: 'Relevant skills 1' })).toBe(
  disclosure,
);
expect(screen.getAllByText('Relevant skills')).toHaveLength(1);
```

The authored-card and capability-evidence suites each exercise this contract
through their own data path
(`apps/github.io/src/app/skills/skill-experience-card-list.spec.tsx:166-189`,
`apps/github.io/src/app/skills/skill-experience-list.spec.tsx:236-262`). Keep
separate mixed-content and empty-content cases so a later placement change
cannot satisfy one state by breaking another.

## Related

- [Model Skill Experience As Astryx Narrative Cards](model-skill-experience-as-astryx-narrative-cards.md)
- [Astryx Component-Owned Typography](../best-practices/astryx-component-owned-typography.md)
- [Astryx Component API Contracts](../best-practices/astryx-component-api-contracts.md)
- [Experience disclosure label research](../../research/2026-09-14-experience-disclosure-label.md)
