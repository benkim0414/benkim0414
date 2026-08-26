---
title: Use Astryx Blue Icon Tokens For Heroicons In Home Navigation
date: 2026-08-26
category: ui-bugs
module: github.io global navigation
problem_type: ui_bug
component: tooling
symptoms:
  - The icon-only Home button rendered in the global navigation but did not visibly appear blue
  - Styling the Home IconButton wrapper alone did not prove the nested Heroicons SVG used the intended blue token
  - The selected Home state could lose the blue treatment if it reused the text navigation selected style
root_cause: logic_error
resolution_type: code_fix
severity: low
related_components:
  - github.io Astryx Foundation
  - GlobalNavigationLayout
  - Astryx IconButton
  - Heroicons
  - StyleX
tags: [github-io, global-navigation, astryx, heroicons, icon-button, color-token, stylex]
---

# Use Astryx Blue Icon Tokens For Heroicons In Home Navigation

## Problem

The `github.io` global navigation needed Home to render as an icon-only Astryx
`IconButton` using Heroicons `HomeModernIcon`, placed in the `TopNav` start slot
while Roadmap and Skills remained centered text links. During visual review in
this session, the Home affordance was accepted only after the SVG itself used
the Astryx blue icon token.

The confusing part was that not every Astryx color token with an accent name is
blue in the active Neutral theme. In `@astryxdesign/theme-neutral` 0.1.4,
`--color-accent` and `--color-icon-accent` are neutral foreground colors, while
`--color-icon-blue` is the categorical blue icon token.

## Symptoms

- Home appeared at the top-left/start side of the global nav as an icon-only
  link, but session visual review reported the icon color was not the expected
  Astryx blue.
- A computed-color test on the parent link was weaker than the actual user
  complaint, because the visible glyph is the nested SVG.
- Reusing the selected text navigation style would have applied
  `--color-text-primary`, which is correct for selected text links but wrong
  for preserving a blue icon affordance.

## What Didn't Work

- Using `colorVars['--color-accent']` on the Home `IconButton` wrapper is the
  wrong token choice for a blue requirement, because the Neutral theme maps
  that token to a neutral foreground.
- Applying `colorVars['--color-icon-blue']` only to the wrapper improved the
  link's computed color, but it still left the important rendering path implicit
  for a third-party SVG.
- Hardcoding a blue hex value would bypass the `github.io` Astryx styling
  rules: normal app styling should use Astryx tokens, StyleX, token-backed
  utilities, or CSS variables rather than inline raw colors.

## Solution

Keep Home as a real Astryx `IconButton` in `TopNav.startContent`, and keep the
center nav for peer route text links only. Apply the Astryx blue icon token at
both relevant layers:

- the `IconButton` wrapper gets a StyleX color backed by
  `colorVars['--color-icon-blue']`;
- the Heroicons SVG receives `color="var(--color-icon-blue)"` directly.

The implementation in
[global-navigation-layout.tsx](../../../apps/github.io/src/app/global-navigation-layout.tsx)
defines one CSS-variable constant and uses it on the SVG:

```tsx
const HOME_NAVIGATION_ICON_COLOR = 'var(--color-icon-blue)';

<IconButton
  href="/"
  icon={
    <HomeModernIcon
      aria-hidden
      color={HOME_NAVIGATION_ICON_COLOR}
      height={16}
      width={16}
    />
  }
  label="Home"
  size="sm"
  variant="ghost"
  xstyle={[
    location.pathname === '/' ? styles.selectedHomeNavigationLink : undefined,
    styles.homeNavigationLink,
  ]}
/>
```

The Home-specific selected style keeps selected hover, pressed, and font-weight
behavior without setting `color`, so it does not override the blue icon token.

## Why This Works

Heroicons outline components render SVGs with `stroke="currentColor"`. Passing
the Astryx CSS variable to the SVG `color` attribute gives that `currentColor`
chain an SVG-local value instead of depending only on inheritance from the
Astryx button wrapper.

Using `var(--color-icon-blue)` rather than a hex value keeps the actual color
owned by the Astryx theme. The installed Neutral theme source documents the
blue token as `--color-icon-blue`, while `--color-accent` remains neutral in
that theme. This preserves the repository's
[Astryx Styling Boundary](../best-practices/astryx-stylex-tailwind-boundaries.md):
Astryx owns component anatomy and tokens, while local StyleX and CSS variables
provide narrow component-specific overrides.

The regression tests in
[global-navigation-layout.spec.tsx](../../../apps/github.io/src/app/global-navigation-layout.spec.tsx)
cover the observable contract:

- Home is an icon-only link at the start of the global navigation.
- The Home link uses the same blue icon color as a token-styled Astryx
  `IconButton`.
- The selected Home link keeps the blue icon styling.
- The rendered Heroicons SVG receives `var(--color-icon-blue)` directly.

## Prevention

- Treat Astryx token names as semantic, not literal. Verify the active theme
  before assuming an accent token is blue.
- For third-party SVG icons that use `currentColor`, test the SVG-facing color
  path when the visual bug is on the glyph itself.
- Keep selected text-nav styles separate from selected icon-nav styles when the
  text style sets `color`.
- Use Astryx CSS variables or typed StyleX token exports for color. Avoid raw
  hex values and inline style objects in normal app styling.
- Keep visual verification in Storybook for navigation changes, because a
  passing link or class assertion can still miss an icon-color mismatch.

## Related Issues

- [Keep Astryx StyleX Tailwind Boundaries Explicit](../best-practices/astryx-stylex-tailwind-boundaries.md)
- [Verify Astryx Component API Contracts Before Styling](../best-practices/astryx-component-api-contracts.md)
- [Keep Home Sections Under One Page Scroll Owner](../design-patterns/keep-home-sections-under-one-page-scroll-owner.md)
- [Mirror Route Ownership in Mobile Storybook Pages](../design-patterns/mirror-app-shell-ownership-in-mobile-storybook-pages.md)
- [Verify Storybook From Linked Worktrees](../workflow-issues/verify-storybook-from-linked-worktree.md)
