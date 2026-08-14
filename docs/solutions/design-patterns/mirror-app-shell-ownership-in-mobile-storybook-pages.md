---
title: Mirror Route Ownership in Mobile Storybook Pages
date: 2026-08-01
last_updated: 2026-08-14
category: design-patterns
module: apps/github.io navigation and Storybook
problem_type: design_pattern
component: testing_framework
severity: medium
applies_when:
  - 'Building mobile-only Storybook page stories for app routes'
  - 'Exercising React Router navigation from an isolated Storybook story'
  - 'Verifying persistent navigation across routed mobile pages'
  - 'Resetting stateful preview providers when the selected story changes'
  - 'Testing preview decorators instead of reconstructing approximate wrappers'
related_components:
  - github.io AppRoutes
  - github.io HomePage
  - github.io SkillCard
  - github.io SkillDetailRoute
  - Storybook preview decorators
tags:
  [
    github-io,
    storybook,
    mobile,
    navigation,
    react-router,
    memory-router,
    home-page,
    testing,
  ]
---

# Mirror Route Ownership in Mobile Storybook Pages

## Context

A page-level Storybook story can reproduce a page's layout while still omitting
the application behavior around it. A navigable story also needs the same
route-matching responsibility that turns a URL change into a different page.

The production `github.io` application keeps these responsibilities distinct.
`AppProviders` supplies the Astryx link adapter and theme, while `AppRoutes`
places `/`, `/skills`, and `/skills/:skillId` beneath
`GlobalNavigationLayout`. The global layout owns navigation and search;
`HomePage`, `SkillsPage`, and `SkillDetailRoute` own their route content
(`apps/github.io/src/app/app.tsx:13`,
`apps/github.io/src/app/global-navigation-layout.tsx:57`).

Storybook originally supplied `MemoryRouter` context but rendered every story
directly. A `SkillCard` could follow its canonical detail link
(`apps/github.io/src/app/skills/skill-card.tsx:56`), or another component could
call `navigate`, but no Storybook route table existed to replace the story with
`SkillDetailRoute`. The in-memory location changed while the canvas did not.

## Guidance

Render a mobile story at the ownership level of the behavior under review. A
page story should render the component that owns the route surface under test.
If an interaction navigates beyond that component, add a preview-level route
harness instead of inferring app behavior from a callback, an `href`, or a
location probe.

Treat router setup as two responsibilities:

1. A router such as `MemoryRouter` owns history and supplies location context.
2. `Routes` and `Route` map that location to rendered UI.

The Storybook preview composes both responsibilities with the existing Astryx
providers:

```tsx
(Story, context) =>
  createElement(
    MemoryRouter,
    { key: context.id },
    createElement(
      LinkProvider,
      { component: RouterLink },
      createElement(
        Theme,
        { theme: neutralTheme },
        createElement(StoryRoutes, undefined, createElement(Story)),
      ),
    ),
  );
```

This is the current global decorator composition
(`apps/github.io/.storybook/preview.ts:15`). `StoryRoutes` renders the selected
story at `/` and the real detail route at `/skills/:skillId`:

```tsx
export function StoryRoutes({ children }: StoryRoutesProps): ReactElement {
  return (
    <Routes>
      <Route path="/" element={children} />
      <Route path="/skills/:skillId" element={<SkillDetailRoute />} />
    </Routes>
  );
}
```

The route harness delegates resolution, not-found handling, and detail
rendering to the production route component
(`apps/github.io/.storybook/story-routes.tsx:10`,
`apps/github.io/src/app/skills/skill-detail-route.tsx:12`). Keep this harness
small: it should mirror only the app destinations an isolated story must reach.

Key stateful preview providers to the selected Storybook story when their state
must not leak across stories. `MemoryRouter` preserves its history while React
reuses the same component instance. The preview therefore uses
`key={context.id}` so navigation remains stable within one story but selecting
a different story creates fresh router state
(`apps/github.io/.storybook/preview.ts:18`).

Test the exported preview decorator itself. Reconstructing the expected
providers in a test can pass even when `preview.ts` omits a provider, route
switch, provider order, or lifecycle key. The preview-routing test obtains the
actual decorator (`apps/github.io/.storybook/story-routes.spec.ts:68`) and
protects three transitions:

- A SkillCard click renders the Kubernetes detail heading
  (`apps/github.io/.storybook/story-routes.spec.ts:94`).
- A new Storybook context ID resets the route and renders the next story
  (`apps/github.io/.storybook/story-routes.spec.ts:100`).
- A command-palette selection renders the Terraform detail heading
  (`apps/github.io/.storybook/story-routes.spec.ts:110`).

Keep focused URL and component tests alongside this integration coverage. They
protect useful narrower contracts, but they do not substitute for asserting
that the Storybook canvas renders the destination page.

## Why This Matters

Storybook parity is about ownership, not merely visual similarity. A story can
look correct and expose correct links while omitting the route matcher that
makes those links observable as page transitions. Static app and Storybook
builds can also pass because compilation does not exercise a click, route
matching, detail rendering, or story-switch lifecycle.

The router key addresses a separate isolation risk. Without it, navigating to
a detail route and then choosing another story can leave the canvas on the old
detail page. Keying by Storybook's context ID preserves history where it is
useful—inside the active story—and discards it at the story boundary.

Layout ownership remains independent of navigation ownership. The global shell
owns persistent navigation, each route owns its content and page scroll, and
the preview harness owns only the missing route behavior needed for isolated
stories. Keeping those concerns separate avoids turning reusable route content
into Storybook-aware components.

## When to Apply

- Building a Storybook story for a mobile-only route or page-level experience.
- Debugging a story where the URL changes but the destination UI does not.
- Adding a card, command palette, breadcrumb, or other client-side navigation
  entry point to an isolated story.
- Using a stateful global decorator whose state should reset when Storybook
  changes the selected story.
- Verifying global navigation without moving route logic into a page component.

## Examples

Prefer a fullscreen story that renders the route content under review:

```tsx
const meta: Meta<typeof HomePage> = {
  component: HomePage,
  parameters: {
    layout: 'fullscreen',
  },
  title: 'GitHub.io/Home/Home Page',
};
```

Avoid treating router context as a complete navigation harness:

```tsx
// Location changes, but the story remains the only rendered element.
<MemoryRouter>
  <Story />
</MemoryRouter>
```

Prefer explicit preview routes for destinations the story can reach:

```tsx
<MemoryRouter key={context.id}>
  <StoryRoutes>
    <Story />
  </StoryRoutes>
</MemoryRouter>
```

For device review from a linked worktree, serve that worktree's Storybook and
open the Home story on the target device. The operational details remain in
the linked-worktree verification learning below.

## Related

- [Keep Home Sections Under One Page Scroll Owner](keep-home-sections-under-one-page-scroll-owner.md)
- [Verify Storybook From Linked Worktrees](../workflow-issues/verify-storybook-from-linked-worktree.md)
- [Verify Astryx Component API Contracts Before Styling](../best-practices/astryx-component-api-contracts.md)
- [Keep Astryx StyleX Tailwind Boundaries Explicit](../best-practices/astryx-stylex-tailwind-boundaries.md)
- [Treat Astryx Layout Gaps As Spacing Tokens](astryx-layout-gap-token-spacing.md)
