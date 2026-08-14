---
title: Keep Home Sections Under One Page Scroll Owner
date: 2026-08-14
last_updated: 2026-08-14
category: design-patterns
module: apps/github.io home page
problem_type: design_pattern
component: testing_framework
severity: medium
applies_when:
  - "Verifying multiple Home sections scroll together below global navigation"
  - "Separating global-shell, page-scroll, and component-scroll ownership"
  - "Testing scroll ownership with browser-observed movement"
related_components:
  - github.io GlobalNavigationLayout
  - github.io HomePage
  - github.io mobile layout verifier
  - github.io SkillCarousel
  - github.io DORA capability cards
tags: [github-io, mobile, astryx, home-page, scroll-ownership, layout-content, webdriver-bidi]
---

# Keep Home Sections Under One Page Scroll Owner

## Context

The `github.io` mobile shell has three distinct ownership boundaries. The
global layout owns persistent navigation and search, route content owns
vertical page scrolling, and the skills carousel owns only horizontal
scrolling.

An earlier Home layout put Top skills outside a DORA-only vertical scroller.
That made Top skills appear fixed even without sticky or fixed positioning: an
ordinary-flow sibling outside the scroll owner does not move with it.

## Guidance

Use one route-level vertical scroll owner for every section that should move
together. `HomePage` uses one Astryx `LayoutContent` main and renders Top skills
and DORA capabilities as ordinary sibling sections inside it
(`apps/github.io/src/app/skills/home-page.tsx:27`).

```tsx
<LayoutContent label="Home" padding={0} role="main">
  <VStack gap={3} paddingBlock={4}>
    <Text as="h2" id="top-skills-title">Top skills</Text>
    <SkillCarousel padding={4} skills={highlightedSkills} variant="compact" />
  </VStack>

  <VStack gap={3} paddingBlock={4} paddingInline={4}>
    <Text as="h2" id="dora-capabilities-title">DORA capabilities</Text>
    {doraCapabilityDefinitions.map(renderCapability)}
  </VStack>
</LayoutContent>
```

Do not give the DORA stack its own `isScrollable` or `flex-1` allocation.
Astryx `LayoutContent` supplies vertical scrolling, while `SkillCarousel`
retains horizontal scrolling and snap behavior
(`apps/github.io/src/app/skills/skill-carousel.tsx:39`).

Component tests should establish containment: one `LayoutContent`, no
page-local navigation or search, and adjacent Top skills and DORA sections in
the same main (`apps/github.io/src/app/skills/home-page.spec.tsx:48`). Because
jsdom does not perform layout, production browser verification must prove the
motion contract.

The Firefox verifier checks phone and iPad-sized viewports. It finds the sole
vertical scroll owner, requires real overflow, advances `scrollTop`, and
compares the displacement of the Top skills and DORA headings
(`apps/github.io/scripts/verify-mobile-layout-browser.mjs:817`). Both headings
must move by the same nonzero delta as the owner, and no Top skills ancestor
may be sticky or fixed. Negative self-tests cover pinned and non-moving Top
skills sections
(`apps/github.io/scripts/verify-mobile-layout-browser.mjs:1171`).

Selector identity is insufficient on its own: an `overflow-y: auto` element
may have no overflow, or the intended section may sit outside it. Checking only
for the absence of sticky or fixed positioning likewise misses an ordinary
sibling outside the scroller.

## Why This Matters

Scroll ownership is a containment contract. One page owner is intended to give
vertical gestures over either Home section one continuous path, while the
skills carousel remains independently swipeable on its horizontal axis.
Browser-observed movement protects that behavior more reliably than class
names or computed overflow values alone.

## When to Apply

- A page section appears pinned while another section scrolls.
- Multiple mobile sections should move beneath persistent global navigation.
- A nested horizontal component must remain independent of vertical page
  movement.
- Layout behavior depends on overflow, containment, sticky, or fixed positioning
  that jsdom cannot observe.

## Examples

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

## Related

- [Mirror Route Ownership in Mobile Storybook Pages](mirror-app-shell-ownership-in-mobile-storybook-pages.md)
- [Verify Storybook From Linked Worktrees](../workflow-issues/verify-storybook-from-linked-worktree.md)
- [Verify Astryx Component API Contracts Before Styling](../best-practices/astryx-component-api-contracts.md)
