---
title: Mirror App Shell Ownership In Mobile Storybook Pages
date: 2026-08-01
last_updated: 2026-08-06
category: design-patterns
module: apps/github.io mobile skills page
problem_type: design_pattern
component: testing_framework
severity: medium
applies_when:
  - "Building mobile-only Storybook page stories for app routes"
  - "Verifying persistent top navigation in scrollable mobile or tablet layouts"
  - "Separating route-level shell, nav, search, and content ownership"
  - "Adding Astryx-native gutters without changing a reusable carousel default"
  - "Testing Astryx prop contracts represented by generated StyleX classes"
related_components:
  - github.io Astryx skill components
  - github.io command palette filtering
  - github.io mobile navigation
tags: [github-io, storybook, mobile, navigation, astryx, skills, spacing, stylex]
---

# Mirror App Shell Ownership In Mobile Storybook Pages

## Context

The `github.io` mobile skills page work exposed a visual verification gap: an iPad Storybook review kept showing that the expected top navigation was not present or persistent while scrolling. The reusable lesson is about ownership boundaries. A mobile-only page story should render the same page-level shell concerns that the app route renders: theme context, mobile viewport shell, top navigation, search affordance, highlighted content rail, and scrollable content.

The current route-level shell is thin. `AppShell` applies the Astryx neutral
theme and renders `MobileSkillsPage` directly
(`apps/github.io/src/app/app-shell.tsx:6`). The fullscreen page story also
renders `MobileSkillsPage` directly
(`apps/github.io/src/app/skills/mobile-skills-page.stories.tsx:6`), while the
global Storybook decorator supplies the same neutral theme
(`apps/github.io/.storybook/preview.ts:9`). Storybook therefore verifies the
same page-owned layout shell without implying that the page owns its theme.

The mobile page owns the scroll model. Its root is a constrained full-height
mobile column with `h-dvh`, `max-w-md`, `flex-col`, and `overflow-hidden`
(`apps/github.io/src/app/skills/mobile-skills-page.tsx:87`). `TopNav` and the
horizontally scrollable highlighted carousel are fixed vertical shell rails,
and the full skills list is the only vertically scrollable shell region. The list region is an
Astryx `VStack` with `isScrollable`, `min-h-0 flex-1`, `gap={3}`,
`paddingBlock={4}`, and `paddingInline={4}`
(`apps/github.io/src/app/skills/mobile-skills-page.tsx:131`).

## Guidance

For mobile-only Storybook page stories, render the same page component that owns the route-level mobile shell. If production ownership sits above the content component, either move that ownership into the page component or create a route-equivalent story wrapper. Do not verify a route-level mobile behavior with a story that renders only the inner list or carousel.

For "always visible while scrolling" mobile requirements, prefer a non-scrolling shell rail over a sticky element inside the same scrolling content. A robust pattern is:

```tsx
<div className="mx-auto flex h-dvh min-h-screen w-full max-w-md flex-col overflow-hidden">
  <TopNav className="shrink-0" />
  <div className="shrink-0 pt-4">
    <SkillCarousel padding={4} skills={highlightedSkills} />
  </div>
  <VStack
    aria-labelledby="skills-page-title"
    as="main"
    className="min-h-0 flex-1"
    gap={3}
    isScrollable
    paddingBlock={4}
    paddingInline={4}
  >
    <VisuallyHidden as="h1" id="skills-page-title">Skills</VisuallyHidden>
    <Text as="h2" type="body" weight="bold">All skills</Text>
    <SkillCardList heading="All skills" skills={visibleSkills} />
  </VStack>
</div>
```

This keeps the nav and top-five carousel visible because they are outside the
vertical scroll container. Only the lower content list scrolls vertically; the
carousel retains its own horizontal scrolling. It also avoids hard-coding a
carousel height just to offset content below a fixed overlay.

Let each Astryx component own the spacing on the axis it implements. The page's
scrollable `VStack` owns the list gutter and vertical rhythm. The outer carousel
wrapper owns only top separation and fixed-shell behavior. `SkillCarousel`
forwards an optional `CarouselProps['padding']` to Astryx `Carousel`, so the
mobile page can opt into spacing step `4` without changing the reusable
carousel's omitted-padding default
(`apps/github.io/src/app/skills/skill-carousel.tsx:12`,
`apps/github.io/src/app/skills/skill-carousel.tsx:39`). An empty carousel has no
scroller to receive native content padding, so only the opted-in empty state is
wrapped in `VStack paddingInline={padding}`; the default empty state remains
unwrapped (`apps/github.io/src/app/skills/skill-carousel.tsx:27`).

Keep search ownership with the nav that opens it. `MobileSkillsPage` owns
`isSearchOpen`, `selectedSkillId`, and the Astryx `CommandPalette` source
(`apps/github.io/src/app/skills/mobile-skills-page.tsx:48`). Filtering is scoped
to `visibleSkills`, while the highlighted carousel remains supplied
independently (`apps/github.io/src/app/skills/mobile-skills-page.tsx:77`). Cap
overlay widths to the mobile shell on wide devices; the command palette uses
`min(calc(100vw - 32px), 448px)`
(`apps/github.io/src/app/skills/mobile-skills-page.tsx:101`).

Use behavioral tests to encode the shell contract, but do not hard-code a
generated StyleX class or accept any class difference as proof of a prop.
Render a direct Astryx control with the expected props beside the wrapper under
test, then compare their rendered class output. Render an otherwise identical
negative control for the semantic prop being protected.

The carousel spec compares padded and default `SkillCarousel` scrollers with
matched Astryx `Carousel` controls using `gap={3}` and `hasSnap`. It also
compares the padded empty-state wrapper with `VStack paddingInline={4}` and
proves that the default empty state remains unwrapped
(`apps/github.io/src/app/skills/skill-carousel.spec.tsx:85`). The page spec
compares `main` with matched scrollable and non-scrollable `VStack` controls,
then separately asserts that the carousel wrapper is the direct sibling before
`main` and is not contained by it
(`apps/github.io/src/app/skills/mobile-skills-page.spec.tsx:101`,
`apps/github.io/src/app/skills/mobile-skills-page.spec.tsx:146`).

## Why This Matters

Storybook can verify the wrong thing if a page story omits route-owned UI. A content component can render correctly while the actual page still lacks the persistent nav, search button, theme wrapper, or scroll shell that the user sees on device.

The scroll-container boundary matters more than the positioning keyword. `sticky` can be correct for a section header inside a known scroller, but it does not prove that a mobile app rail remains visible while the lower page body scrolls. Placing the nav and carousel outside the scrollable region makes the requirement explicit and easier to test.

Keeping the command palette and filtering in the page component prevents drift between Storybook and the route. The app-level command-palette test opens the search UI, verifies the `Skills` group, filters to Terraform, and confirms the carousel remains unchanged while only the full list changes in `apps/github.io/src/app/app.spec.tsx:82`.

Component-native spacing keeps the values on Astryx's token scale and keeps
carousel scroll padding and snap alignment inside the component that implements
them. Wrapper-level horizontal padding may look similar, but it does not express
the same `Carousel.padding` contract. Keeping the prop optional prevents a
page-specific mobile gutter from becoming an accidental default for every
`SkillCarousel` consumer.

Matched controls protect the public Astryx prop contract without coupling tests
to generated identifiers. A broad `astryx-stack` assertion can still pass after
`isScrollable` or a padding prop disappears; a hard-coded StyleX hash can fail
after an unrelated generation change. The positive and negative controls catch
the semantic regression while tolerating hash churn.

## When to Apply

- Building a Storybook story for a mobile-only route or page-level experience in `apps/github.io`.
- Debugging a visual review where navigation, shell spacing, search, or theme is missing in Storybook but expected in the route.
- Implementing a mobile top rail that must remain visible while the content below it scrolls.
- Keeping highlighted content, such as a top-five carousel, visible above a scrollable full list.
- Adding jsdom tests for shell behavior where real scroll physics cannot be measured but ownership, roles, and class contracts can still be protected.
- Adding local carousel gutters while preserving the reusable carousel's
  omitted-padding behavior.
- Verifying Astryx props whose observable jsdom output is a generated class.

## Examples

Prefer a page story that renders the shell-owning page:

```tsx
const meta: Meta<typeof MobileSkillsPage> = {
  component: MobileSkillsPage,
  parameters: {
    layout: 'fullscreen',
  },
  title: 'GitHub.io/Skills/Mobile Skills Page',
};
```

Avoid stories that render only the content slice when the requirement is about page shell behavior:

```tsx
// Too narrow for route-level mobile visual verification.
export const Default = {
  render: () => <SkillCardList skills={skills} />,
};
```

For a mobile skills list, keep the one-column stack explicit by using a wrapper
like `SkillCardList`. It renders an Astryx `EmptyState` for empty data and a
`VStack` of full-width `SkillCard` components
(`apps/github.io/src/app/skills/skill-card-list.tsx:7`).

Avoid moving the carousel gutter to its outer rail:

```tsx
<div className="shrink-0 px-4">
  <SkillCarousel skills={highlightedSkills} />
</div>
```

Prefer the component-native content-padding contract at the page call site:

```tsx
<div className="shrink-0 pt-4">
  <SkillCarousel padding={4} skills={highlightedSkills} />
</div>
```

The branch verification covered 26 test files with 193 tests, lint, the app
build, and the Storybook build. The default mobile-skills story was visually
approved on an iPad. A 390x844 phone viewport and the non-default single-skill
and empty stories were not explicitly recorded, so those remain visual
validation gaps rather than claimed coverage. This change is still pending on
the unmerged `feat/mobile-skills-spacing` branch as of 2026-08-06.

## Related

- [Verify Storybook From Linked Worktrees](../workflow-issues/verify-storybook-from-linked-worktree.md)
- [Verify Astryx Component API Contracts Before Styling](../best-practices/astryx-component-api-contracts.md)
- [Keep Astryx StyleX Tailwind Boundaries Explicit](../best-practices/astryx-stylex-tailwind-boundaries.md)
- [Treat Astryx Layout Gaps As Spacing Tokens](astryx-layout-gap-token-spacing.md)
