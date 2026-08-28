---
title: Use Primary Use Metadata For Recruiter Skill Context
date: 2026-08-28
category: design-patterns
module: apps/github.io skills
problem_type: design_pattern
component: frontend
severity: medium
applies_when:
  - Adding recruiter-facing metadata to public skill records
  - Summarizing job-function context without inflating self-rated confidence
  - Composing Skill Detail metadata for portfolio hiring audiences
  - Keeping detailed proof in Experience, Projects, or Certifications
related_components:
  - Skill Detail page
  - Skills Page Catalog Projection
  - Skill Detail Evidence Projection
  - Skill Confidence
  - Experience Narrative
tags: [github-io, skills-page, skill-detail, primary-use, skill-confidence, metadata, portfolio, content-design]
---

# Use Primary Use Metadata For Recruiter Skill Context

## Context

The skill detail page is a recruiter-facing portfolio surface. Hiring readers
need to understand not only what a skill is, but what job context the skill is
meant to signal. The `Skill` model now stores that context as `primaryUse`
beside categories and confidence (`apps/github.io/src/app/skills/skill-list.types.ts:23`,
`apps/github.io/src/app/skills/skill-list.types.ts:27`,
`apps/github.io/src/app/skills/skill-list.types.ts:28`,
`apps/github.io/src/app/skills/skill-list.types.ts:29`).

Primary use is distinct from Skill Confidence. Confidence remains the
self-rated comfort signal rendered by `SkillConfidence`, which maps numeric
values to qualitative labels and exposes the visible label as supporting text
(`apps/github.io/src/app/skills/skill-confidence.tsx:21`,
`apps/github.io/src/app/skills/skill-confidence.tsx:34`,
`apps/github.io/src/app/skills/skill-confidence.tsx:35`).

## Guidance

Use Primary Use as the first row in the skill detail metadata list, before
categories and confidence. That order gives the reader a plain-English work
context before they scan taxonomy or self-assessment
(`apps/github.io/src/app/skills/skill-detail-page.tsx:77`,
`apps/github.io/src/app/skills/skill-detail-page.tsx:79`,
`apps/github.io/src/app/skills/skill-detail-page.tsx:83`,
`apps/github.io/src/app/skills/skill-detail-page.tsx:98`).

Keep each label short and outcome-oriented. Prefer phrases like "Cloud-native
platform operations", "Repository automation and CI/CD", or "Infrastructure
provisioning" over generic categories such as "Cloud" or claims such as
"expert Kubernetes". The catalog test locks in that every skill has a
non-empty recruiter-readable label and spot-checks key portfolio skills
(`apps/github.io/src/app/skills/skill-list.data.spec.ts:162`,
`apps/github.io/src/app/skills/skill-list.data.spec.ts:167`,
`apps/github.io/src/app/skills/skill-list.data.spec.ts:169`).

Do not use Primary Use as evidence. Detailed proof still belongs in Experience,
Projects, and Certifications, while Skill Confidence remains a separate modest
self-assessment. The detail page tests assert the metadata order both for an
enriched skill with certifications and for a basic skill without empty
enrichment sections (`apps/github.io/src/app/skills/skill-detail-page.spec.tsx:170`,
`apps/github.io/src/app/skills/skill-detail-page.spec.tsx:173`,
`apps/github.io/src/app/skills/skill-detail-page.spec.tsx:313`,
`apps/github.io/src/app/skills/skill-detail-page.spec.tsx:316`).

## Why This Matters

Recruiters and hiring teams scan skill pages for role fit. Category metadata
helps classify a technology, and confidence helps calibrate self-assessment,
but neither says why the skill matters in this portfolio. Primary Use fills
that gap without turning the metadata list into a proof section or replacing
the evidence model.

This also avoids weakening confidence semantics. Earlier guidance keeps Skill
Confidence as supporting text because it is self-rated metadata, not a status,
category, or verified credential
(`docs/solutions/best-practices/use-astryx-supporting-text-for-skill-confidence.md:29`,
`docs/solutions/best-practices/use-astryx-supporting-text-for-skill-confidence.md:39`,
`docs/solutions/best-practices/use-astryx-supporting-text-for-skill-confidence.md:78`).

## When to Apply

- Adding or revising public skill records in the github.io app.
- Introducing a metadata field whose purpose is reader orientation, not proof.
- Deciding whether a skill detail field should be a category, confidence label,
  primary-use label, or evidence section.
- Reviewing skill detail pages for hiring-team scan clarity.

## Examples

Model the role context directly on each skill:

```ts
{
  id: 'kubernetes',
  name: 'Kubernetes',
  categories: ['Container', 'Cloud'],
  primaryUse: 'Cloud-native platform operations',
  confidence: 4,
}
```

Render the label as plain supporting metadata ahead of taxonomy and
self-assessment:

```tsx
<MetadataListItem label="Primary use">
  <Text type="supporting">{detail.skill.primaryUse}</Text>
</MetadataListItem>
<MetadataListItem label="Categories">...</MetadataListItem>
<MetadataListItem label="Confidence">
  <SkillConfidence confidence={detail.skill.confidence} />
</MetadataListItem>
```

Avoid writing a primary-use label that sounds like proof or seniority:

```ts
primaryUse: 'Expert-level Kubernetes leadership'
```

Prefer the work context, then let experience and certifications prove it:

```ts
primaryUse: 'Cloud-native platform operations'
```

## Related

- `docs/solutions/best-practices/use-astryx-supporting-text-for-skill-confidence.md`
- `docs/solutions/design-patterns/model-skill-experience-as-astryx-narrative-cards.md`
- `docs/solutions/design-patterns/skill-detail-experience-section-labeling.md`
- `docs/solutions/conventions/constrain-skills-page-to-evidence-backed-skill-cards.md`
