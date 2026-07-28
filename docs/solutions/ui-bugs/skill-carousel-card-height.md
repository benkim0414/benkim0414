---
title: Skill carousel card height alignment
date: 2026-07-28
category: ui-bugs
module: apps/github.io skills
problem_type: ui_bug
component: tooling
symptoms:
  - Kubernetes appeared taller than other SkillCarousel cards because it had certification citations
  - A fixed carousel card height made Kubernetes in SkillCarousel taller than the standalone SkillCard story
root_cause: logic_error
resolution_type: code_fix
severity: low
related_components:
  - github.io Astryx Foundation
  - github.io skill components
  - testing_framework
tags: [github-io, skills, astryx, carousel, card-height, storybook]
---

# Skill carousel card height alignment

## Problem

The `github.io` skill carousel needed all cards in the row to share one visual height without making a certification-heavy skill card taller than the same card in its standalone Storybook story. Kubernetes exposed the issue because it has multiple certification citations, so it naturally needed more vertical space than skills with title and description only.

## Symptoms

- Kubernetes appeared taller than the other cards in `SkillCarousel` when card height was entirely content-driven.
- A fixed carousel-only card height aligned the row, but made the Kubernetes card in `SkillCarousel` taller than the standalone `SkillCard` rendering.
- The fixed-height approach also reintroduced blank card space, which conflicted with the Astryx `Card` default/content-driven height expectation.

## What Didn't Work

- Setting a custom `minHeight` on `SkillCard` created excessive blank space and made standalone cards drift from Astryx Card defaults.
- Passing a fixed `height` from `SkillCarousel` made carousel cards equal, but the Kubernetes card no longer matched its standalone natural height.
- Relying only on Astryx Carousel defaults did not equalize the cards because Astryx Carousel centers its internal item row on the cross-axis.

## Solution

Keep `SkillCard` content-driven and use Astryx Card defaults. `SkillCard` renders an Astryx `Card` with the documented default padding scale and no `height` or `minHeight` prop in [skill-card.tsx](../../../apps/github.io/src/app/skills/skill-card.tsx) at line 57.

```tsx
<Card padding={4} xstyle={styles.root}>
```

Keep `SkillCarousel` responsible for carousel layout only. The carousel supplies a non-visible accessible label, consistent Astryx gap, snap behavior, and a scoped class for the equal-height row in [skill-carousel.tsx](../../../apps/github.io/src/app/skills/skill-carousel.tsx) at line 24.

```tsx
<Carousel
  aria-label={ariaLabel}
  className="skill-carousel"
  gap={3}
  hasSnap
>
```

Apply equal-height behavior through the carousel layout scope instead of the card API. The scoped CSS stretches Astryx Carousel's internal scroller/items and makes each `.astryx-card` fill that stretched item height in [styles.css](../../../apps/github.io/src/styles.css) at line 48.

```css
.skill-carousel > div {
  align-items: stretch;
}

.skill-carousel > div > div {
  align-self: stretch;
}

.skill-carousel > div > div > .astryx-card {
  height: 100%;
}
```

The carousel also accepts an `ariaLabel` prop and keys rendered items by skill id plus render index in [skill-carousel.tsx](../../../apps/github.io/src/app/skills/skill-carousel.tsx) at line 30, so duplicate skill entries can render without React duplicate-key warnings.

## Why This Works

The tallest natural card in the carousel row now determines the row height. Shorter cards stretch to that row height, but the tallest card is not inflated by an arbitrary fixed pixel value. This keeps standalone `SkillCard` and `SkillCarousel` aligned with Astryx Card guidance: cards remain discrete, self-contained items using consistent padding rather than local min-height overrides.

The CSS override is intentionally scoped. Astryx Carousel currently exposes root `xstyle` and `className`, but not direct scroller/item styling hooks, so the implementation documents the internal DOM dependency next to the selector in [styles.css](../../../apps/github.io/src/styles.css) at line 43. Keeping the selector under `.skill-carousel` prevents the override from changing other carousel instances.

## Prevention

- Keep `SkillCard` free of arbitrary `height` or `minHeight` props unless a specific consumer owns that layout decision.
- Test standalone card rendering for content-driven Card defaults. The current `SkillCard` test asserts that standalone cards do not receive `--x-height` or `--x-minHeight` in [skill-card.spec.tsx](../../../apps/github.io/src/app/skills/skill-card.spec.tsx) at line 18.
- Test carousel rendering separately for layout behavior. The current `SkillCarousel` tests assert that carousel cards do not receive fixed height props, opt into the scoped equal-height class, support a custom non-visible accessibility label, and handle duplicate skill entries without duplicate-key warnings in [skill-carousel.spec.tsx](../../../apps/github.io/src/app/skills/skill-carousel.spec.tsx) at line 49.
- When using Astryx components, prefer public component props and StyleX first; use scoped global CSS only for generated or internal DOM that the component API does not expose.

## Related Issues

- [Keep Astryx StyleX Tailwind Boundaries Explicit](../best-practices/astryx-stylex-tailwind-boundaries.md)
