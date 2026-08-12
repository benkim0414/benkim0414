---
title: Mirror App Shell Ownership in Mobile Storybook Pages
date: 2026-08-01
last_updated: 2026-08-12
category: design-patterns
module: apps/github.io home page
problem_type: design_pattern
component: testing_framework
severity: medium
applies_when:
  - "Building mobile-only Storybook page stories for app routes"
  - "Verifying persistent top navigation in scrollable mobile or tablet layouts"
  - "Separating app-shell, page-shell, search, and content ownership"
  - "Adding Astryx-native gutters without changing a reusable carousel default"
  - "Testing Astryx prop contracts represented by generated StyleX classes"
related_components:
  - github.io HomePage
  - github.io Astryx skill components
  - github.io command palette selection
  - github.io DORA capability cards
tags: [github-io, storybook, mobile, navigation, astryx, home-page, spacing, stylex]
---

# Mirror App Shell Ownership in Mobile Storybook Pages

## Context

A page-level Storybook story can verify the wrong layout when it renders only
an inner list, carousel, or card collection. Mobile shell requirements include
the constrained viewport, persistent top navigation, search affordance, fixed
content rails, and the boundary around the vertically scrollable content.
Those concerns must appear in the story at the same ownership level as they do
in the application.

The `github.io` application has two distinct boundaries. `AppShell` supplies
the neutral Astryx theme and chooses whether `HomePage` or the temporary
`SkillDetailPage` is active (`apps/github.io/src/app/app-shell.tsx:9`).
`HomePage` owns the mobile viewport shell, navigation, command palette, fixed
Top skills rail, and scrollable DORA section
(`apps/github.io/src/app/skills/home-page.tsx:77`).

The fullscreen Home story renders `HomePage` directly
(`apps/github.io/src/app/skills/home-page.stories.tsx:6`), while the global
Storybook decorator supplies the same neutral theme
(`apps/github.io/.storybook/preview.ts:9`). This mirrors the page-owned layout
without claiming that the page owns the application theme or active-page
selection.

## Guidance

For a mobile page story, render the component that owns the viewport and scroll
shell. If the behavior being reviewed belongs above that component—such as an
`AppShell` transition—use a route-equivalent wrapper or an app-level story
instead. Do not infer app-level behavior from a page story that cannot exercise
it.

For rails that must remain visible while the body scrolls, place them outside
the vertical scroll container:

```tsx
<div className="mx-auto flex h-dvh min-h-screen w-full max-w-md flex-col overflow-hidden">
  <TopNav className="shrink-0" />
  <VStack className="shrink-0" gap={3} paddingBlock={4}>
    <VStack paddingInline={4}>
      <Text as="h2" type="body" weight="bold">Top skills</Text>
    </VStack>
    <SkillCarousel padding={4} skills={highlightedSkills} variant="compact" />
  </VStack>
  <VStack
    aria-labelledby="home-page-title"
    as="main"
    className="min-h-0 flex-1"
    gap={3}
    isScrollable
    paddingBlock={4}
    paddingInline={4}
  >
    <Text as="h2" type="body" weight="bold">DORA capabilities</Text>
    {doraCapabilityDefinitions.map(renderCapability)}
  </VStack>
</div>
```

`HomePage` follows this structure: the top navigation and Top skills stack are
`shrink-0`, while the DORA `main` is the only `flex-1` scrollable region
(`apps/github.io/src/app/skills/home-page.tsx:79`,
`apps/github.io/src/app/skills/home-page.tsx:122`,
`apps/github.io/src/app/skills/home-page.tsx:140`). Keeping these regions as
siblings avoids hard-coded overlay heights and preserves the carousel's own
horizontal scrolling.

Let each Astryx component own spacing on the axis it implements. The page's
scrollable `VStack` owns its inline gutter and vertical rhythm. `SkillCarousel`
forwards optional `CarouselProps['padding']` to Astryx `Carousel`, allowing the
Home page to opt into spacing step `4` without changing the reusable
carousel's omitted-padding default
(`apps/github.io/src/app/skills/skill-carousel.tsx:12`,
`apps/github.io/src/app/skills/skill-carousel.tsx:39`). For an empty carousel,
only an explicitly padded state receives a `VStack` inline-padding wrapper
(`apps/github.io/src/app/skills/skill-carousel.tsx:27`).

Keep page-local and application-level state distinct. `HomePage` owns search
visibility, the controlled palette value, the command source, and the
`onSkillSelect` callback boundary
(`apps/github.io/src/app/skills/home-page.tsx:41`,
`apps/github.io/src/app/skills/home-page.tsx:52`). `AppShell` owns the selected
`Skill` that replaces the Home page with the minimal detail page
(`apps/github.io/src/app/app-shell.tsx:10`). A Home page story can verify the
callback and all Home layout; the app integration test verifies the resulting
page transition.

Use matched Astryx controls when jsdom must verify a semantic prop through
generated StyleX classes. Compare the component under test with a direct
Astryx control using the expected props and with an otherwise identical
negative control. This protects the public prop contract without coupling the
test to a generated class hash.

The carousel tests compare padded and default `SkillCarousel` instances with
matching Astryx `Carousel` controls, and separately compare the padded empty
state with `VStack paddingInline={4}`
(`apps/github.io/src/app/skills/skill-carousel.spec.tsx:85`,
`apps/github.io/src/app/skills/skill-carousel.spec.tsx:123`). The Home page
test applies the same technique to `VStack isScrollable` and asserts that the
carousel rail is a sibling before `main`, not its descendant
(`apps/github.io/src/app/skills/home-page.spec.tsx:129`,
`apps/github.io/src/app/skills/home-page.spec.tsx:172`).

## Why This Matters

Storybook parity is about ownership, not merely visual similarity. An inner
content story can look correct while omitting the persistent navigation,
search control, fixed rail, theme context, or scroll boundary the user sees on
device.

The scroll-container boundary matters more than the positioning keyword.
`sticky` can be appropriate inside a known scroller, but it does not prove that
an application rail remains visible while a different region scrolls. Sibling
rails outside `main` make that relationship explicit in both markup and tests.

The same ownership rule prevents interaction drift. The Home page test proves
that selecting a text-only Terraform result emits the matching `Skill`, while
the app integration test proves that the shell replaces Home with the
Terraform heading (`apps/github.io/src/app/skills/home-page.spec.tsx:273`,
`apps/github.io/src/app/app.spec.tsx:83`). Each test protects the boundary its
component owns.

Component-native spacing also preserves carousel snap alignment and keeps
values on the Astryx token scale. Wrapper padding may look similar, but it does
not express the same `Carousel.padding` contract and can shift the wrong box.

## When to Apply

- Building a Storybook story for a mobile-only route or page-level experience
  in `apps/github.io`.
- Debugging a visual review where navigation, shell spacing, search, or theme
  is missing in Storybook but expected in the application.
- Implementing a top rail that must remain visible while DORA cards or other
  page content scroll below it.
- Adding local carousel gutters while preserving the reusable carousel's
  omitted-padding behavior.
- Separating a page-local selection callback from an app-shell-owned page
  transition.
- Verifying Astryx props whose observable jsdom output is a generated class.

## Examples

Prefer a fullscreen story that renders the shell-owning page:

```tsx
const meta: Meta<typeof HomePage> = {
  component: HomePage,
  parameters: {
    layout: 'fullscreen',
  },
  title: 'GitHub.io/Home/Home Page',
};
```

Avoid rendering only the scrollable content when the requirement concerns the
whole page:

```tsx
// Too narrow for navigation, search, fixed-rail, or scroll-shell review.
export const DORACardsOnly = {
  render: () => doraCapabilityDefinitions.map(renderCapability),
};
```

Avoid moving native carousel content padding to an outer wrapper:

```tsx
<div className="px-4">
  <SkillCarousel skills={highlightedSkills} />
</div>
```

Prefer the component contract at the page call site:

```tsx
<SkillCarousel padding={4} skills={highlightedSkills} variant="compact" />
```

For device review from a linked worktree, serve that worktree's Storybook and
open the Home story on the target device. The workflow details remain in the
linked-worktree verification learning below.

## Related

- [Keep Skill Selection Transition in AppShell](keep-skill-selection-transition-in-app-shell.md)
- [Verify Storybook From Linked Worktrees](../workflow-issues/verify-storybook-from-linked-worktree.md)
- [Verify Astryx Component API Contracts Before Styling](../best-practices/astryx-component-api-contracts.md)
- [Keep Astryx StyleX Tailwind Boundaries Explicit](../best-practices/astryx-stylex-tailwind-boundaries.md)
- [Treat Astryx Layout Gaps As Spacing Tokens](astryx-layout-gap-token-spacing.md)
