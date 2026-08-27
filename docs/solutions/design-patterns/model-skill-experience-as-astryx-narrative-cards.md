---
title: Model Skill Experience As Astryx Narrative Cards
date: 2026-08-26
category: design-patterns
module: apps/github.io skills
problem_type: design_pattern
component: frontend
severity: medium
applies_when:
  - Adding reusable public Experience records to skill detail pages
  - Rendering skill-linked experience as focused text-heavy portfolio narrative
  - Choosing how much DORA-style evidence vocabulary should appear on skill detail surfaces
  - Keeping Storybook examples representative for both single-card and list variants
related_components:
  - github.io DevOps capability evidence
  - Astryx typography
  - Storybook
tags:
  [
    github-io,
    skills-page,
    skill-detail,
    experience,
    astryx,
    dora,
    storybook,
    portfolio,
  ]
---

# Model Skill Experience As Astryx Narrative Cards

## Context

Skill detail pages needed a way to show experience such as building an AWS
CodePipeline and CodeBuild deployment pipeline for staging and production.
That content is naturally text heavy: it needs a concise summary, a few
paragraphs of narrative, and links back to relevant skills. It should be
usable on a skill detail page now and reusable by future portfolio surfaces
when more experience records are added.

The reusable model and the visible card have different jobs. The `Experience`
record owns the broad public-safe story and relationships (`skillIds`,
`projectIds`, `capabilityKeys`, `supportingEvidenceIds`, `technologies`) in
`apps/github.io/src/app/experience/experience.types.ts:15`, while the skill
detail card renders a focused projection of that record for one skill context.
That distinction keeps future consumers flexible without making the current
skill detail UI look like a metadata dump.

## Guidance

Author experience as reusable data first, then choose a narrow presentation for
the skill detail surface. The production fixture keeps the AWS CI/CD story in
`apps/github.io/src/app/experience/experience.data.ts:3-35`, including a
summary, paragraphs, environment labels, related skills, technologies, and
supporting portfolio relationships. This is the right place to add future
experience records; consumers should receive selected records rather than
embedding one-off prose inside page components.

Resolve skill detail experience explicitly. `skill-detail-resolver` maps the
detail record's authored `experienceIds`, validates that each experience exists,
and verifies that the experience links back to the current skill before it can
render (`apps/github.io/src/app/skills/skill-detail-resolver.ts:63-76`). It
also derives related skills from `experience.skillIds`, and the card list
renders relevant skill labels by resolving those IDs against the supplied skill
records instead of trusting display-only technology strings
(`apps/github.io/src/app/skills/skill-detail-resolver.ts:121-143` and
`apps/github.io/src/app/skills/skill-experience-card-list.tsx:114-122`).

Render the card with Astryx surface, typography, and layout components.
`SkillExperienceCardList` maps records into list items/cards, and
`SkillExperienceCard` uses Astryx `Card`, `Heading`, `Text`, `VStack`, `HStack`,
and `Token` for the component-owned text and labels
(`apps/github.io/src/app/skills/skill-experience-card-list.tsx:47-120`). Keep
local styling structural: list reset, wrapping, and label alignment can be
local; heading, paragraph, token, and surface semantics should come from
Astryx components.

Keep the visible metadata minimal. The card should show the narrative and a
labeled `Relevant skills` row, not separate role, environment, or raw
technology lists. Technologies can remain on the reusable record for future
surfaces, but the skill detail projection should avoid implying that every
technology string is an evidence-backed skill. The component tests lock that
contract by requiring the labeled relevant-skills list and by confirming an
unresolved technology such as Terraform does not appear as a relevant skill
(`apps/github.io/src/app/skills/skill-experience-card-list.spec.tsx:147-166`).

Compose it as a normal skill detail section. The page renders
`SkillExperienceCardList` only when resolved experience records exist, below
the page's `Experience` heading and separate from the older `In practice`
evidence section (`apps/github.io/src/app/skills/skill-detail-page.tsx:121-128`).
The page-level test asserts that the enriched Kubernetes detail surface shows
the experience card plus the resolved `AWS CodePipeline` and `Kubernetes`
skills (`apps/github.io/src/app/skills/skill-detail-page.spec.tsx:180-195`).

Keep Storybook variants distinct. The single-card story should demonstrate one
AWS CI/CD narrative, while the list story should include multiple records with
different summaries and skill relationships. The current list story adds a
Kubernetes GitOps example beside the production AWS record so the list variant
exercises repeated card spacing and content diversity
(`apps/github.io/src/app/skills/skill-experience-card-list.stories.tsx:18-52`).

## Why This Matters

This pattern keeps the portfolio evidence model reusable without overloading
the first UI. A future page can use `projectIds`, `capabilityKeys`,
`supportingEvidenceIds`, environments, or technologies from the same
`Experience` record, while the skill detail page can stay readable and strongly
tied to the current skill.

It also preserves the DORA evidence boundary. DORA capability cards already
separate reusable evidence records from compact projections and show dense
skill rows with readable labels; skill detail experience should follow the same
ownership split without copying all DORA metadata into the card. The related
guidance in
`docs/solutions/conventions/tokenize-dora-capability-evidence.md` remains the
broader evidence-model rule, while this learning is the skill-detail narrative
projection of that rule.

Astryx ownership matters because this component is prose heavy. If typography
or spacing is recreated locally, future cards will drift from the rest of the
site. The existing typography guidance in
`docs/solutions/best-practices/astryx-component-owned-typography.md` applies
directly: component-owned headings and paragraphs should use Astryx `Heading`
and `Text`; local styles should not become a parallel typography system.

## When to Apply

- Adding another professional experience story that should appear on one or
  more skill detail pages.
- Connecting a single experience to multiple portfolio concepts without
  duplicating prose across components.
- Replacing a metadata-heavy skill detail section with narrative evidence.
- Deciding whether a technology string should render as a skill label.
- Adding or reviewing Storybook coverage for single-card and list-card states.

## Examples

Keep broad relationships in the data record:

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

Render only the skill-detail projection:

```tsx
<SkillExperienceCardList
  experiences={detail.experiences}
  skills={detail.relatedSkills}
/>
```

The visible card should read as a narrative achievement with a labeled
`Relevant skills` row. It should not expose every reusable relationship the
data model carries.

## Related

- `docs/solutions/conventions/tokenize-dora-capability-evidence.md`
- `docs/solutions/best-practices/astryx-component-owned-typography.md`
- `docs/solutions/design-patterns/astryx-layout-gap-token-spacing.md`
