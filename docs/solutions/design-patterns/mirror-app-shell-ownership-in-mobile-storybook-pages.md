---
title: Mirror App Shell Ownership in Mobile Storybook Pages
date: 2026-08-01
last_updated: 2026-08-14
category: design-patterns
module: apps/github.io home page
problem_type: design_pattern
component: testing_framework
severity: medium
applies_when:
  - "Building mobile-only Storybook page stories for app routes"
  - "Verifying multiple Home sections scroll together below global navigation"
  - "Separating global-shell, page-scroll, and component-scroll ownership"
  - "Adding Astryx-native gutters without changing a reusable carousel default"
  - "Testing scroll ownership with browser-observed movement"
related_components:
  - github.io GlobalNavigationLayout
  - github.io HomePage
  - github.io mobile layout verifier
  - github.io SkillCarousel
  - github.io DORA capability cards
tags: [github-io, storybook, mobile, navigation, astryx, home-page, scroll-ownership, layout-content, webdriver-bidi]
---

# Mirror App Shell Ownership in Mobile Storybook Pages

## Context

A page-level Storybook story can verify the wrong layout when it renders only
an inner list, carousel, or card collection. The story must preserve the same
ownership boundaries as the application: the global shell owns persistent
navigation and search, the route content owns vertical page scrolling, and a
carousel owns only its horizontal scrolling.

On the `github.io` Home page, `GlobalNavigationLayout` owns the full-height
frame, `TopNav`, global command palette, and route outlet
([global-navigation-layout.tsx](../../../apps/github.io/src/app/global-navigation-layout.tsx#L24)).
`HomePage` renders one Astryx `LayoutContent` main containing Top skills and
DORA capabilities as ordinary sibling sections
([home-page.tsx](../../../apps/github.io/src/app/skills/home-page.tsx#L27)).

The earlier layout put Top skills outside a DORA-only vertical scroller. That
made the highlighted skills look fixed even though the requirement was for
both sections to move together beneath global navigation. Removing sticky or
fixed positioning alone would not have corrected that containment error: an
ordinary-flow sibling outside the scroll owner still does not move with it.

## Guidance

### Match ownership at every scroll axis

Use one route-level vertical scroll owner for every section that should move
together. Let the global shell remain outside that owner, and let nested
components own only their intentional independent axis.

```tsx
<LayoutContent aria-label="Home" padding={0} role="main">
  <VStack aria-labelledby="top-skills-heading" gap={3} paddingBlock={4}>
    <Text as="h2" id="top-skills-heading">Top skills</Text>
    <SkillCarousel padding={4} skills={highlightedSkills} variant="compact" />
  </VStack>

  <VStack aria-labelledby="dora-capabilities-heading" gap={3} paddingBlock={4}>
    <Text as="h2" id="dora-capabilities-heading">DORA capabilities</Text>
    {doraCapabilityDefinitions.map(renderCapability)}
  </VStack>
</LayoutContent>
```

Do not add `isScrollable` to the DORA stack or allocate it as a nested
`flex-1` region. Astryx `LayoutContent` supplies the page's vertical scrolling,
while `SkillCarousel` retains horizontal scrolling and snap behavior
([skill-carousel.tsx](../../../apps/github.io/src/app/skills/skill-carousel.tsx#L39)).

Let Astryx components own spacing on the axis they implement. The Home page
passes spacing step `4` through `SkillCarousel.padding`; the reusable carousel
keeps its omitted-padding default, and its empty state only adds matching
inline padding when requested
([skill-carousel.tsx](../../../apps/github.io/src/app/skills/skill-carousel.tsx#L12)).

### Use the right Storybook surface

The Home story uses fullscreen layout and renders `HomePage` directly
([home-page.stories.tsx](../../../apps/github.io/src/app/skills/home-page.stories.tsx#L5)).
That is sufficient for reviewing route content. Use the global-navigation
story or the routed application when reviewing persistent navigation, search,
or page-scroll ownership and movement, because those concerns depend on
`GlobalNavigationLayout`, not `HomePage` alone.

### Test containment and real movement

Component tests should establish the intended structure: one
`LayoutContent`, no page-local navigation or search, and adjacent Top skills
and DORA sections inside the same main
([home-page.spec.tsx](../../../apps/github.io/src/app/skills/home-page.spec.tsx#L48)).
This prevents accidental nested-scroller classes, but jsdom cannot prove how
the browser lays out or scrolls those elements.

The production browser verifier therefore checks both phone and iPad-sized
viewports. It scans the rendered document for the sole vertical scroll owner,
requires that owner to have real overflow, advances its `scrollTop`, and
compares the observed displacement of the Top skills and DORA headings
([verify-mobile-layout-browser.mjs](../../../apps/github.io/scripts/verify-mobile-layout-browser.mjs#L817)).
Both headings must move by the same nonzero delta as the scroll owner, and no
Top skills ancestor may be sticky or fixed. Negative self-tests cover a pinned
Top skills section and a non-moving Top skills section
([verify-mobile-layout-browser.mjs](../../../apps/github.io/scripts/verify-mobile-layout-browser.mjs#L1171)).

Selector identity alone is not enough: an `overflow-y: auto` element may have
no overflow, and the intended section may still sit outside it. Likewise,
checking only for the absence of `sticky` or `fixed` misses an ordinary sibling
that remains stationary because it is outside the scroller.

## Why This Matters

Storybook parity is about ownership, not merely visual similarity. A narrow
story can look plausible while omitting the global shell or introducing a
scroll boundary the real route does not have.

One page scroll owner is intended to give vertical gestures over either Home
section one continuous page-scroll path, while the skills carousel remains
independently swipeable on its horizontal axis. Browser-observed movement
makes the containment contract durable rather than relying on class names or
computed overflow values alone.

## When to Apply

- Building or reviewing a mobile-only route in `apps/github.io`.
- Deciding whether navigation, search, page content, or a nested component
  owns a layout or scroll behavior.
- Fixing a page where one content section appears pinned while another scrolls.
- Adding component-local carousel gutters without changing shared defaults.
- Writing layout regression tests for sticky, fixed, overflow, or containment
  behavior that jsdom cannot observe.

## Examples

Prefer a fullscreen route-content story:

```tsx
const meta: Meta<typeof HomePage> = {
  component: HomePage,
  parameters: { layout: 'fullscreen' },
  title: 'GitHub.io/Home/Home Page',
};
```

Avoid a DORA-only story when the requirement concerns whole-page movement:

```tsx
// Too narrow to verify the shared page scroll owner.
export const DORACardsOnly = {
  render: () => doraCapabilityDefinitions.map(renderCapability),
};
```

Avoid a nested DORA scroller when Top skills should move with it:

```tsx
<TopSkills />
<VStack className="min-h-0 flex-1" isScrollable>
  <DORACapabilities />
</VStack>
```

Prefer component-native carousel padding at the page call site:

```tsx
<SkillCarousel padding={4} skills={highlightedSkills} variant="compact" />
```

For device review from a linked worktree, serve that worktree's Storybook and
open the relevant route or story on the target device. The network and
worktree details remain in the linked-worktree verification learning below.

## Related

- [Keep Skill Selection Transition in AppShell](keep-skill-selection-transition-in-app-shell.md)
- [Verify Storybook From Linked Worktrees](../workflow-issues/verify-storybook-from-linked-worktree.md)
- [Verify Astryx Component API Contracts Before Styling](../best-practices/astryx-component-api-contracts.md)
- [Keep Astryx StyleX Tailwind Boundaries Explicit](../best-practices/astryx-stylex-tailwind-boundaries.md)
- [Treat Astryx Layout Gaps As Spacing Tokens](astryx-layout-gap-token-spacing.md)
