---
title: Use Astryx Supporting Text For Skill Confidence
date: 2026-08-26
category: best-practices
module: github.io Astryx skills
problem_type: best_practice
component: tooling
severity: low
applies_when:
  - Rendering self-rated skill confidence in github.io skill cards, skill rows, or skill detail metadata
  - Replacing numeric or icon-based skill ratings with qualitative confidence metadata
  - Deciding whether an Astryx Badge is appropriate for skill metadata that is not a category, status, or severity
related_components:
  - github.io Astryx typography
  - github.io Astryx skill badges
  - SkillCard
  - SkillListItem
  - SkillConfidence
tags: [astryx, typography, skill-confidence, skill-cards, metadata, github-io, accessibility]
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

The implemented confidence component follows that contract: it maps confidence
values to qualitative labels, renders a visually hidden self-rated context
label, and shows the visible label through Astryx `Text type="supporting"`
rather than `Badge` (`apps/github.io/src/app/skills/skill-confidence.tsx:21`,
`apps/github.io/src/app/skills/skill-confidence.tsx:34`,
`apps/github.io/src/app/skills/skill-confidence.tsx:35`).

## Guidance

Render skill confidence as Astryx supporting typography, not as a Badge. Treat
the confidence label as descriptive metadata attached to the skill title or row
metadata, and include hidden context that names it as self-rated confidence.

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
behavior, center alignment, letter spacing, and wrapping; it does not create a competing
typography treatment (`apps/github.io/src/app/skills/skill-confidence.tsx:11`,
`apps/github.io/src/app/skills/skill-confidence.tsx:13`,
`apps/github.io/src/app/skills/skill-confidence.tsx:16`,
`apps/github.io/src/app/skills/skill-confidence.tsx:17`).

## Why This Matters

Badges draw scanning attention and imply that a value is a status to notice or
a category used to group items. Astryx calls out that every status badge steals
attention and that metadata should use supporting text instead
(`node_modules/@astryxdesign/core/src/Badge/Badge.doc.mjs:45`,
`node_modules/@astryxdesign/core/src/Badge/Badge.doc.mjs:51`). A self-rated
confidence label such as "Working" or "Confident" can look like a verified
status if it is placed in a badge, especially near real category badges.

Supporting text keeps confidence present without overclaiming authority. It
also preserves the repo's established component boundary: Astryx components
provide the semantic and visual base, StyleX provides only local structure, and
category badges stay visually distinct from descriptive skill metadata
(`docs/solutions/best-practices/astryx-stylex-tailwind-boundaries.md:36`,
`docs/solutions/best-practices/astryx-stylex-tailwind-boundaries.md:38`,
`docs/solutions/best-practices/astryx-stylex-tailwind-boundaries.md:49`).

## When to Apply

- A skill metadata value describes the author's self-assessment, recency,
  duration, count, evidence summary, or other supporting detail.
- The value is useful context but does not require user attention or action.
- The value is not used for filtering or grouping like `SkillCategory`.
- The UI already has real badges nearby, and adding another badge would blur
  category or status semantics.
- Local styling is being considered for text that the component owns and
  Astryx `Text` can express.

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
