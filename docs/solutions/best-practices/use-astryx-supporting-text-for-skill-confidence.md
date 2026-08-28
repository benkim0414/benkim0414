---
title: Use Astryx Supporting Text For Skill Confidence
date: 2026-08-26
last_updated: 2026-08-28
category: best-practices
module: github.io Astryx skills
problem_type: best_practice
component: tooling
severity: low
applies_when:
  - Rendering self-rated skill confidence in github.io skill cards, skill rows, or skill detail metadata
  - Replacing numeric or icon-based skill ratings with qualitative confidence metadata
  - Deciding whether Astryx Text, Token, or Badge is appropriate for skill metadata that is not a category, status, or severity
related_components:
  - github.io Astryx typography
  - github.io Astryx tokens
  - github.io Astryx skill badges
  - SkillCard
  - SkillListItem
  - SkillConfidence
tags: [astryx, typography, tokens, skill-confidence, skill-cards, metadata, github-io, accessibility]
---

# Use Astryx Supporting Text For Skill Confidence

## Context

Skill Confidence is self-rated metadata, not a status, severity, category, or
capability tag. The `Skill` model stores a `confidence` value separately from
category labels, so confidence explains the author's comfort level while
categories continue to group skills (`apps/github.io/src/app/skills/skill-list.types.ts:23`,
`apps/github.io/src/app/skills/skill-list.types.ts:27`,
`apps/github.io/src/app/skills/skill-list.types.ts:28`).

Astryx Badge is documented for status or category recognition at a glance, and
the Badge docs explicitly say most metadata should be plain description text
instead of badges (`node_modules/@astryxdesign/core/src/Badge/Badge.doc.mjs:41`,
`node_modules/@astryxdesign/core/src/Badge/Badge.doc.mjs:43`). The dense Badge
guidance names `Text type="supporting"` as the metadata alternative
(`node_modules/@astryxdesign/core/src/Badge/Badge.doc.mjs:111`,
`node_modules/@astryxdesign/core/src/Badge/Badge.doc.mjs:115`,
`node_modules/@astryxdesign/core/src/Badge/Badge.doc.mjs:123`).

The implemented confidence component follows that contract by default: it maps
confidence values to qualitative labels, renders a visually hidden self-rated
context label, and uses Astryx `Text type="supporting"` for the plain metadata
presentation (`apps/github.io/src/app/skills/skill-confidence.tsx:25`,
`apps/github.io/src/app/skills/skill-confidence.tsx:41`,
`apps/github.io/src/app/skills/skill-confidence.tsx:47`).

Compact summary surfaces need one exception. In a skill card or list row,
showing only a label such as "Familiar" under the skill name is ambiguous, so
`SkillConfidence` exposes a `variant="token"` branch that renders an Astryx
`Token` with the explicit label `Confidence: ${label}`. The token is neutral
gray, small, and hidden from assistive technology because the self-rated
confidence text is already available through `VisuallyHidden`
(`apps/github.io/src/app/skills/skill-confidence.tsx:8`,
`apps/github.io/src/app/skills/skill-confidence.tsx:42`,
`apps/github.io/src/app/skills/skill-confidence.tsx:44`).

## Guidance

Render skill confidence as Astryx supporting typography by default, not as a
Badge. Treat the confidence label as descriptive metadata attached to the skill
title, row metadata, or detail metadata, and include hidden context that names
it as self-rated confidence.

Use the Astryx `Token` variant only when the visible value would otherwise lack
its own label in a compact summary surface. Skill cards place the token directly
under the skill heading (`apps/github.io/src/app/skills/skill-card.tsx:75`,
`apps/github.io/src/app/skills/skill-card.tsx:81`,
`apps/github.io/src/app/skills/skill-card.tsx:84`). Skill list items place the
token inside the row metadata cluster
(`apps/github.io/src/app/skills/skill-list-item.tsx:31`,
`apps/github.io/src/app/skills/skill-list-item.tsx:32`,
`apps/github.io/src/app/skills/skill-list-item.tsx:38`). Skill detail metadata
already has a `MetadataListItem` label of "Confidence", so it should keep the
default text variant and avoid repeating the label in the value
(`apps/github.io/src/app/skills/skill-detail-page.tsx:94`,
`apps/github.io/src/app/skills/skill-detail-page.tsx:95`).

Keep Badge for actual category tags in the skills UI. `SkillCategory` imports
Astryx `Badge`, maps category names onto non-status color variants, and renders
each category name as the badge label
(`apps/github.io/src/app/skills/skill-category.tsx:1`,
`apps/github.io/src/app/skills/skill-category.tsx:5`,
`apps/github.io/src/app/skills/skill-category.tsx:34`). Existing guidance
already documents that categories can use derived Badge variants because they
are grouping labels, while generated category colors should avoid semantic
status variants
(`docs/solutions/best-practices/astryx-derived-badge-variants.md:29`,
`docs/solutions/best-practices/astryx-derived-badge-variants.md:45`,
`docs/solutions/best-practices/astryx-derived-badge-variants.md:50`).

Keep the typography boundary with Astryx. Existing repo guidance says
app-owned visible body copy should use Astryx `Text`, while StyleX should
remain structural
(`docs/solutions/best-practices/astryx-component-owned-typography.md:40`,
`docs/solutions/best-practices/astryx-component-owned-typography.md:45`,
`docs/solutions/best-practices/astryx-component-owned-typography.md:50`). The
confidence component's local StyleX root only handles inline layout, flex
behavior, center alignment, letter spacing, and wrapping; it does not create a
competing typography treatment (`apps/github.io/src/app/skills/skill-confidence.tsx:16`,
`apps/github.io/src/app/skills/skill-confidence.tsx:18`,
`apps/github.io/src/app/skills/skill-confidence.tsx:19`,
`apps/github.io/src/app/skills/skill-confidence.tsx:20`,
`apps/github.io/src/app/skills/skill-confidence.tsx:21`).

## Why This Matters

Badges draw scanning attention and imply that a value is a status to notice or
a category used to group items. Astryx calls out that every status badge steals
attention and that metadata should use supporting text instead
(`node_modules/@astryxdesign/core/src/Badge/Badge.doc.mjs:45`,
`node_modules/@astryxdesign/core/src/Badge/Badge.doc.mjs:51`). A self-rated
confidence label such as "Working" or "Confident" can look like a verified
status if it is placed in a badge, especially near real category badges.

Supporting text keeps confidence present without overclaiming authority in
labeled metadata contexts. A neutral token keeps the same boundary in compact
summary contexts because it names the metadata value without styling confidence
as a category badge or semantic status. In both forms, Astryx components provide
the semantic and visual base, StyleX provides only local structure, and category
badges stay visually distinct from descriptive skill metadata
(`docs/solutions/best-practices/astryx-stylex-tailwind-boundaries.md:36`,
`docs/solutions/best-practices/astryx-stylex-tailwind-boundaries.md:38`,
`docs/solutions/best-practices/astryx-stylex-tailwind-boundaries.md:49`).

## When to Apply

- A skill metadata value describes the author's self-assessment, recency,
  duration, count, evidence summary, or other supporting detail.
- The value is useful context but does not require user attention or action.
- The value is not used for filtering or grouping like `SkillCategory`.
- The UI already has real badges nearby, and adding a Badge would blur
  category or status semantics.
- Local styling is being considered for text that the component owns and
  Astryx `Text` can express.
- The visible summary surface needs an explicit label such as "Confidence:
  Familiar" because a bare confidence value would be hard to understand.

## Examples

Avoid making self-rated confidence look like a category or status badge:

```tsx
<Badge label={confidenceLabels[confidence]} variant="neutral" />
```

Prefer supporting text with explicit accessible context:

```tsx
<span {...stylex.props(styles.root)} data-testid="skill-confidence">
  <VisuallyHidden>{`Self-rated confidence: ${label}`}</VisuallyHidden>
  <Text aria-hidden="true" type="supporting">
    {label}
  </Text>
</span>
```

Use a neutral small token when a compact card or row needs the visible value to
carry its label:

```tsx
<SkillConfidence confidence={skill.confidence} variant="token" />
```

Keep categories as badges because they are grouping tags:

```tsx
<SkillCategory name="Cloud" />
<SkillConfidence confidence={4} />
```

## Related

- [Use Astryx Typography For Component-Owned Text](astryx-component-owned-typography.md)
- [Derive Astryx Badge Variants Instead Of Custom Colors](astryx-derived-badge-variants.md)
- [Keep Astryx StyleX Tailwind Boundaries Explicit](astryx-stylex-tailwind-boundaries.md)
- [Preserve Compact Rating Contracts When Replacing Rating Glyphs](preserve-compact-rating-contracts.md)
