---
title: Derive Astryx Badge Variants Instead Of Custom Colors
date: 2026-07-30
category: best-practices
module: github.io Astryx skill badges
problem_type: best_practice
component: tooling
severity: low
applies_when:
  - Adding deterministic colors to Astryx category badges
  - Mapping text labels to theme-safe visual variants
  - Testing generated design-system palette choices
related_components:
  - github.io Astryx Foundation
  - github.io skill components
  - Astryx Styling Boundary
tags: [astryx, badges, design-system, testing, github-io]
---

# Derive Astryx Badge Variants Instead Of Custom Colors

## Context

`SkillCategory` needed stable category badge colors derived from category text.
The tempting implementation was to hash the text into a hex, RGB, or HSL color,
but that would bypass Astryx theme semantics and require separate foreground and
contrast decisions.

The current implementation keeps `SkillCategory` as an Astryx `Badge` and maps
category names onto a controlled non-status Badge palette
(`apps/github.io/src/app/skills/skill-category.tsx:5`,
`apps/github.io/src/app/skills/skill-category.tsx:34`).

## Guidance

For text-derived category colors in Astryx UI, hash the label into an approved
component variant instead of a raw color.

Use the component's own theme-aware variant API:

```tsx
<Badge label={name} variant={getSkillCategoryVariant(name)} />
```

Keep the generated palette limited to category-like variants. In
`SkillCategory`, the allowed generated variants are `blue`, `cyan`, `green`,
`orange`, `pink`, `purple`, `teal`, and `yellow`
(`apps/github.io/src/app/skills/skill-category.tsx:5`).

Exclude semantic status variants such as `neutral`, `success`, `warning`, and
`error` from generated category colors. Those variants communicate state or
severity, while skill categories are grouping labels.

Tests should not use the implementation palette as their only oracle. Declare
the approved palette independently in the test, assert that the exported palette
equals it, and then verify production categories map into that independent set
(`apps/github.io/src/app/skills/skill-category.spec.tsx:36`).

## Why This Matters

Mapping text directly to arbitrary hex values makes every generated color a
local design decision. That creates contrast, theme, and visual consistency
work that Astryx already handles through Badge variants.

Mapping text to Astryx variants keeps the color deterministic while preserving
the component's accessibility, token, and theme behavior. The independent
palette test is the important guardrail: it catches accidental drift into
status colors or unsupported Badge variants.

## When to Apply

- A category, tag, or grouping label needs a stable generated color.
- The design system already exposes a finite theme-aware variant palette.
- The color should differentiate groups without implying status, severity, or
  completion.
- The component API can express the desired visual treatment directly.

## Examples

Avoid generating arbitrary colors for a themed component:

```ts
const background = textToHex(categoryName);
```

Prefer mapping deterministic text input onto the component's supported variants:

```ts
const approvedVariants = ['blue', 'cyan', 'green', 'orange'] as const;
const variant = approvedVariants[hash(categoryName) % approvedVariants.length];
```

When testing the palette, do not write a self-referential assertion:

```ts
const allowedVariants = new Set(skillCategoryBadgeVariants);
```

Instead, make the approved palette independent from the implementation under
test:

```ts
const approvedVariants = [
  'blue',
  'cyan',
  'green',
  'orange',
  'pink',
  'purple',
  'teal',
  'yellow',
];

expect(skillCategoryBadgeVariants).toEqual(approvedVariants);
```

## Related

- `CONCEPTS.md`
- `docs/solutions/best-practices/astryx-stylex-tailwind-boundaries.md`
