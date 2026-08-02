---
title: Verify Astryx Component API Contracts Before Styling
date: 2026-07-31
last_updated: 2026-08-02
category: best-practices
module: github.io Astryx components
problem_type: best_practice
component: tooling
severity: medium
applies_when:
  - Choosing Astryx component props for github.io UI work
  - Translating design feedback into component sizes, slots, or variants
  - Reviewing local wrappers around Astryx components
tags: [astryx, design-system, component-api, github-io]
---

# Verify Astryx Component API Contracts Before Styling

## Context

The mobile skills page work exposed a subtle sizing mistake in `SkillAvatar`.
The implementation used Astryx `Avatar` correctly, but it relied on the default
avatar size and inferred the effective size from rendered output. The requested
design was a 24px skill avatar, while the installed Astryx `Avatar` API maps
the `tiny` named size to 20px, `xsmall` to 24px, `small` to 36px, and `medium`
to 48px.

The same branch also needed a real mobile top nav. The corrected shell uses
Astryx `TopNav` and `TopNavHeading` directly in
`apps/github.io/src/app/app-shell.tsx:2` and renders the mobile navigation
landmark at `apps/github.io/src/app/app-shell.tsx:11`.

## Guidance

When a visual requirement names an Astryx-owned concern, verify the component
contract before writing local styles or relying on defaults:

1. Run the relevant Astryx docs topic, such as `pnpm exec astryx docs layout`
   for shell/navigation work or `pnpm exec astryx docs principles` for design
   system rules.
2. Inspect the installed component type/source when the CLI does not expose a
   component-specific docs topic.
3. Express the requirement through the Astryx component prop when the API
   supports it.
4. Add a focused test for the public contract you care about.

For the skill avatar, the local wrapper keeps Astryx ownership intact by
typing its `size` prop from Astryx and passing that value through to
`Avatar` (`apps/github.io/src/app/skills/skill-avatar.tsx:1`,
`apps/github.io/src/app/skills/skill-avatar.tsx:65`):

```tsx
export interface SkillAvatarProps {
  skill: Skill;
  size?: AvatarSize;
}

export function SkillAvatar({ skill, size = 'medium' }: SkillAvatarProps) {
  return <Avatar name={skill.name} size={size} />;
}
```

The important detail is not the literal DOM style; it is that each surface asks
Astryx for the named size that the design system defines. Command-palette
results use `size="tiny"` for compact inline search results
(`apps/github.io/src/app/skills/mobile-skills-page.tsx:42`), while
`SkillListItem` uses `size="small"` for a stronger leading row visual
(`apps/github.io/src/app/skills/skill-list-item.tsx:33`). Regression tests can
still assert rendered CSS custom properties as a guard, but production code
should stay on the component API surface.

## Why This Matters

Inferring Astryx behavior from rendered DOM, shorthand names, or memory creates design-system
drift. A component default may be valid for the design system while still being
wrong for a specific UI requirement. In this case, the valid Astryx size names
were full words such as `tiny`, `small`, and `medium`; shorthand names such as
`sm` and `md` were design feedback, not component API values.

Using the verified component API keeps the UI inside the Astryx Styling
Boundary: component anatomy and accessibility stay with Astryx, while local
code only supplies product-specific data and wrapper layout. It also makes code
review sharper because reviewers can compare the requirement to a documented
prop instead of guessing whether a CSS override is intentional.

## When to Apply

- Use this for Astryx component size, spacing, slot, navigation, typography,
  badge, citation, carousel, or layout decisions.
- Use this when tests assert rendered design-system output, so the production
  code can be checked against the source API rather than the test artifact.
- Use this before adding StyleX, Tailwind, or scoped CSS to change an
  Astryx-owned visual detail.

## Examples

Before, the wrapper relied on the Avatar default:

```tsx
<Avatar
  className="flex-none"
  name={skill.name}
  src={skillAvatarPresentation(skill.iconSlug)}
/>
```

After, the wrapper exposes the design-system size and each consumer chooses the
right named size for its surface:

```tsx
<SkillAvatar skill={skill} size="tiny" />
<SkillAvatar skill={skill} size="small" />
```

For Storybook fixtures that are meant to prove logo behavior, derive long-name
or edge-case rows from the specific branded skill instead of relying on sample
array order. The long-name list-item story explicitly starts from the TypeScript
skill before replacing the display name
(`apps/github.io/src/app/skills/skill-list-item.stories.tsx:8`,
`apps/github.io/src/app/skills/skill-list-item.stories.tsx:44`).

For shell navigation, prefer the Astryx shell/navigation component instead of
hand-building a raw header:

```tsx
<TopNav
  label="Mobile navigation"
  heading={<TopNavHeading heading="Ben Kim" subheading="Skills" />}
/>
```

## Related

- [Keep Astryx StyleX Tailwind Boundaries Explicit](astryx-stylex-tailwind-boundaries.md)
- [Treat Astryx Layout Gaps As Spacing Tokens](../design-patterns/astryx-layout-gap-token-spacing.md)
- [Use Astryx Typography For Component-Owned Text](astryx-component-owned-typography.md)
