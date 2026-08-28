---
title: Model Skill Experience As Astryx Narrative Cards
date: 2026-08-26
last_updated: 2026-08-28
category: design-patterns
module: apps/github.io skills
problem_type: design_pattern
component: frontend
severity: medium
applies_when:
  - Adding reusable public Experience records to skill detail pages
  - Rendering capability-derived experience evidence on skill detail pages
  - Combining authored experience records with public DevOps capability evidence
  - Deriving relevant skill tokens from evidence without exposing non-canonical labels
  - Keeping Storybook examples representative for both single-card and list variants
related_components:
  - github.io DevOps capability evidence
  - Skill detail page
  - Skill experience cards
  - Astryx typography
  - Storybook
tags:
  [
    github-io,
    skills-page,
    skill-detail,
    experience,
    capability-evidence,
    skill-tokens,
    astryx,
    dora,
    storybook,
    portfolio,
    privacy,
  ]
---

# Model Skill Experience As Astryx Narrative Cards

## Context

Skill detail pages need to show professional experience in two related forms.
Authored `Experience` records own broad public-safe narratives such as building
AWS CodePipeline and CodeBuild delivery automation. DevOps capability evidence
owns shorter public-safe accomplishments, facts, technologies, and support
links that can also prove skill fluency.

The reusable models and the visible cards have different jobs. An `Experience`
record can carry broad relationships such as skills, projects, capability keys,
supporting evidence, and technologies, while the skill detail card renders the
reader-facing narrative for one skill context. A `CapabilityEvidenceItem` can
carry atomic public proof, structured facts, visibility flags, sensitivity
flags, technologies, and supporting evidence links, while the skill detail page
renders only the safe experience-shaped projection.

Keep those source distinctions in the resolver and data model, not in the
reader-facing section taxonomy. The skill detail surface should present both
authored narrative cards and capability-derived evidence cards under one
`Experience` section.

## Guidance

Author broad professional stories as reusable `Experience` data. This remains
the right place for narrative copy, paragraph structure, project relationships,
capability relationships, and explicit skill IDs. Resolve those records
explicitly from the skill detail record, and reject any experience that does not
link back to the current skill before rendering it.

Derive capability evidence in the resolver, not in React components. A skill
detail page can add evidence cards from public, non-sensitive capability skill
evidence that supports the current skill and points at public, non-sensitive
supporting records of type `experience`. The resolver should merge explicit
experience evidence IDs with derived capability evidence and deduplicate by
stable evidence ID.

Match skill relevance through the canonical skill catalog. Capability evidence
may contain technology strings, labels, and titles, but those strings are not
all public skill records. Build related skill rows by matching evidence
technologies against canonical skill names, resolving those matches to skill
records, and deduplicating by skill ID. The card renderer may repeat that
canonical-name match per card so each capability-derived card shows only the
skills its own evidence mentions.

Render both forms as Astryx cards. Authored experience cards should use Astryx
`Card`, `Heading`, `Text`, layout primitives, and `Token` to show the narrative
and a labeled `Relevant skills` row. Capability-derived cards should use the
same card language for title, summary, and secondary detail text instead of
blockquotes or separator-heavy citation treatment.

Show structured facts when they add detail. Capability evidence often carries
`details.facts`; render distinct facts as secondary body text beneath the
summary. Filter facts that equal the summary, and deduplicate repeated facts,
so a card does not repeat the same sentence or produce duplicate React keys.

Keep visible metadata minimal. The skill detail projection should not expose
every capability key, raw technology, project relationship, or internal source
distinction. The visible contract is an experience card with a title, readable
proof text, and canonical relevant skill tokens.

Compose the page as one normal detail section. Render the section when either
authored experiences or capability-derived experience evidence exists. Show
authored narrative cards first, then capability-derived evidence cards. Do not
add a peer `In practice` heading for the derived cards; it reads as a synonym
for `Experience` rather than a distinct reader need.

Keep Storybook examples rich enough to exercise the contract. Single-card and
list stories should cover narrative text, multiple cards, distinct summaries,
and relevant skill relationships. Enriched skill detail page stories should
include capability-derived facts and skill-token rows so visual review catches
sparse cards before the production page does.

## Why This Matters

This pattern keeps portfolio evidence reusable without duplicating copy.
Authored experience records can serve future portfolio surfaces, while
capability evidence catalogs can continue to feed DORA capability cards,
skill-detail experience cards, and other public projections from the same
curated proof.

It also preserves the privacy and correctness boundary. Public/non-sensitive
filtering belongs at the resolver boundary where data enters the page model.
React components should receive already-safe records and focus on presentation.

Canonical skill matching prevents evidence technologies from overstating the
portfolio. A technology string can be specific and useful without being a
standalone skill card; relevant skill tokens should appear only when the same
name exists in the canonical skill catalog.

Astryx ownership matters because these cards are prose heavy. Heading,
paragraph, token, layout, and surface semantics should come from Astryx
components, with local styles limited to structural list reset, wrapping, and
spacing glue.

## When to Apply

- Adding another professional experience story that should appear on one or
  more skill detail pages.
- Showing capability-derived experience on a skill detail page without adding
  one-off component copy.
- Combining authored `Experience` records and capability evidence under one
  reader-facing `Experience` section.
- Deciding whether a technology string should render as a relevant skill token.
- Adding or reviewing Storybook coverage for skill detail experience cards.
- Replacing quote-styled evidence with richer portfolio cards.

## Examples

Keep broad relationships in authored experience data:

```ts
{
  id: 'aws-codepipeline-codebuild-multistage-delivery',
  summary:
    'Built AWS CodePipeline and CodeBuild automation for staging and production delivery...',
  narrative: [
    'Built a delivery pipeline around AWS CodePipeline and AWS CodeBuild...',
    'Modeled staging and production as separate promotion targets...',
  ],
  skillIds: ['aws-codepipeline', 'aws-codebuild', 'kubernetes'],
  projectIds: ['homelab'],
  capabilityKeys: ['continuous-delivery', 'deployment-automation'],
  supportingEvidenceIds: ['terraform-codepipeline-platform'],
  technologies: ['AWS CodePipeline', 'AWS CodeBuild', 'Kubernetes', 'Terraform'],
}
```

Render the authored skill-detail projection:

```tsx
<SkillExperienceCardList
  experiences={detail.experiences}
  skills={detail.relatedSkills}
/>
```

Render the capability-derived projection beside it:

```tsx
<SkillExperienceList
  evidence={detail.experienceEvidence}
  skills={detail.relatedSkills}
/>
```

For a derived-only skill such as GitHub Actions, capability skill evidence can
point at supporting experience records. The resolver follows those support IDs,
keeps only public, non-sensitive experience records, and derives related skills
from the supporting evidence technologies. The resulting cards can show
specific facts and canonical tokens such as GitHub Actions, Nx, Docker, Amazon
ECR, Kustomize, and Argo CD when those names exist in the skill catalog.

For a mixed skill such as Kubernetes, keep the authored narrative card and add
capability-derived cards after it. This preserves the richer curated story
while making the broader capability evidence visible on the same skill detail
surface.

## Related

- `docs/solutions/conventions/tokenize-dora-capability-evidence.md`
- `docs/solutions/design-patterns/skill-detail-experience-section-labeling.md`
- `docs/solutions/conventions/constrain-skills-page-to-evidence-backed-skill-cards.md`
- `docs/solutions/best-practices/astryx-component-owned-typography.md`
- `docs/solutions/design-patterns/astryx-layout-gap-token-spacing.md`
