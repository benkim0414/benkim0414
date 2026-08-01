---
title: Mirror App Shell Ownership In Mobile Storybook Pages
date: 2026-08-01
category: design-patterns
module: apps/github.io mobile skills page
problem_type: design_pattern
component: testing_framework
severity: medium
applies_when:
  - "Building mobile-only Storybook page stories for app routes"
  - "Verifying persistent top navigation in scrollable mobile or tablet layouts"
  - "Separating route-level shell, nav, search, and content ownership"
related_components:
  - github.io Astryx skill components
  - github.io command palette filtering
  - github.io mobile navigation
tags: [github-io, storybook, mobile, navigation, astryx, skills]
---

# Mirror App Shell Ownership In Mobile Storybook Pages

## Context

The `github.io` mobile skills page work exposed a visual verification gap: an iPad Storybook review kept showing that the expected top navigation was not present or persistent while scrolling. The reusable lesson is about ownership boundaries. A mobile-only page story should render the same page-level shell concerns that the app route renders: theme context, mobile viewport shell, top navigation, search affordance, highlighted content rail, and scrollable content.

The current route-level shell is thin. `AppShell` applies the Astryx neutral theme and renders `MobileSkillsPage` directly in `apps/github.io/src/app/app-shell.tsx:6`. The page story also renders `MobileSkillsPage` directly with fullscreen layout in `apps/github.io/src/app/skills/mobile-skills-page.stories.tsx:6`, so Storybook verifies the same page-owned shell instead of a smaller content slice.

The mobile page owns the scroll model. Its root is a constrained full-height mobile column with `h-dvh`, `max-w-md`, `flex-col`, and `overflow-hidden` in `apps/github.io/src/app/skills/mobile-skills-page.tsx:76`. `TopNav` is a non-scrolling top rail at `apps/github.io/src/app/skills/mobile-skills-page.tsx:77`, the highlighted carousel is another non-scrolling rail at `apps/github.io/src/app/skills/mobile-skills-page.tsx:108`, and the full skills list is the only scrollable area through `min-h-0 flex-1 overflow-y-auto` in `apps/github.io/src/app/skills/mobile-skills-page.tsx:116`.

## Guidance

For mobile-only Storybook page stories, render the same page component that owns the route-level mobile shell. If production ownership sits above the content component, either move that ownership into the page component or create a route-equivalent story wrapper. Do not verify a route-level mobile behavior with a story that renders only the inner list or carousel.

For "always visible while scrolling" mobile requirements, prefer a non-scrolling shell rail over a sticky element inside the same scrolling content. A robust pattern is:

```tsx
<div className="mx-auto flex h-dvh min-h-screen w-full max-w-md flex-col overflow-hidden">
  <TopNav className="shrink-0" />
  <div className="shrink-0">
    <SkillCarousel />
  </div>
  <main className="min-h-0 flex-1 overflow-y-auto">
    <SkillCardList />
  </main>
</div>
```

This keeps the nav and top-five carousel visible because they are outside the scroll container. Only the lower content list scrolls. It also avoids hard-coding a carousel height just to offset content below a fixed overlay.

Keep search ownership with the nav that opens it. `MobileSkillsPage` owns `isSearchOpen`, `selectedSkillId`, and the Astryx `CommandPalette` source in `apps/github.io/src/app/skills/mobile-skills-page.tsx:40`. Filtering is scoped to `visibleSkills` in `apps/github.io/src/app/skills/mobile-skills-page.tsx:66`, while the highlighted carousel remains supplied independently. Cap overlay widths to the mobile shell on wide devices; the command palette uses `min(calc(100vw - 32px), 448px)` in `apps/github.io/src/app/skills/mobile-skills-page.tsx:102`.

Use behavioral tests to encode the shell contract. The page spec checks that the shell is a flex column with `overflow-hidden`, the nav is `shrink-0`, and `main` owns the scroll in `apps/github.io/src/app/skills/mobile-skills-page.spec.tsx:48`. It also checks that the carousel wrapper is `shrink-0` above the full skills region in `apps/github.io/src/app/skills/mobile-skills-page.spec.tsx:66`. The app spec repeats the route-level shell expectations in `apps/github.io/src/app/app.spec.tsx:46`.

## Why This Matters

Storybook can verify the wrong thing if a page story omits route-owned UI. A content component can render correctly while the actual page still lacks the persistent nav, search button, theme wrapper, or scroll shell that the user sees on device.

The scroll-container boundary matters more than the positioning keyword. `sticky` can be correct for a section header inside a known scroller, but it does not prove that a mobile app rail remains visible while the lower page body scrolls. Placing the nav and carousel outside the scrollable region makes the requirement explicit and easier to test.

Keeping the command palette and filtering in the page component prevents drift between Storybook and the route. The app-level command-palette test opens the search UI, verifies the `Skills` group, filters to Terraform, and confirms the carousel remains unchanged while only the full list changes in `apps/github.io/src/app/app.spec.tsx:82`.

## When to Apply

- Building a Storybook story for a mobile-only route or page-level experience in `apps/github.io`.
- Debugging a visual review where navigation, shell spacing, search, or theme is missing in Storybook but expected in the route.
- Implementing a mobile top rail that must remain visible while the content below it scrolls.
- Keeping highlighted content, such as a top-five carousel, visible above a scrollable full list.
- Adding jsdom tests for shell behavior where real scroll physics cannot be measured but ownership, roles, and class contracts can still be protected.

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

For a mobile skills list, keep the one-column stack explicit by using a wrapper like `SkillCardList`. It renders an Astryx `EmptyState` for empty data and a `VStack` of full-width `SkillCard` components in `apps/github.io/src/app/skills/skill-card-list.tsx:14`. Keep rating presentation centralized in `SkillRating`; the Heroicons star implementation and accessible hidden text live in `apps/github.io/src/app/skills/skill-rating.tsx:49`.

## Related

- [Verify Storybook From Linked Worktrees](../workflow-issues/verify-storybook-from-linked-worktree.md)
- [Verify Astryx Component API Contracts Before Styling](../best-practices/astryx-component-api-contracts.md)
- [Keep Astryx StyleX Tailwind Boundaries Explicit](../best-practices/astryx-stylex-tailwind-boundaries.md)
