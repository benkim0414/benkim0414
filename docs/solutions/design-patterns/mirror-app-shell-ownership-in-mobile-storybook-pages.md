---
title: Mirror Route Ownership in Mobile Storybook Pages
date: 2026-08-01
last_updated: 2026-08-30
category: design-patterns
module: apps/github.io navigation and Storybook
problem_type: design_pattern
component: testing_framework
severity: medium
applies_when:
  - 'Building responsive Storybook page stories for app routes'
  - 'Exercising React Router navigation from an isolated Storybook story'
  - 'Verifying persistent navigation across routed mobile pages'
  - 'Separating canonical page stories from global-navigation component stories'
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
places Home, Roadmap, Skills, and skill-detail routes beneath
`GlobalNavigationLayout` (`apps/github.io/src/app/app.tsx:15`,
`apps/github.io/src/app/app.tsx:27`). The global layout owns persistent
navigation, search, and the shared vertical scroll region; each route owns its
semantic main content.

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
providers. It distinguishes full application-route stories from isolated
component stories through `parameters.appRoute`:

```tsx
(Story, context) => {
  const appRoute = context.parameters?.appRoute;
  const rendersAppRoutes = typeof appRoute === 'string';
  const story = createElement(Story);

  return createElement(
    MemoryRouter,
    {
      initialEntries: rendersAppRoutes ? [appRoute] : undefined,
      key: context.id,
    },
    createElement(
      LinkProvider,
      { component: RouterLink },
      createElement(
        Theme,
        { theme: neutralTheme },
        rendersAppRoutes
          ? story
          : createElement(StoryRoutes, undefined, story),
      ),
    ),
  );
};
```

This is the global decorator's current ownership split
(`apps/github.io/.storybook/preview.ts:13`). The canonical `Pages` story's
component is production `AppRoutes`; each page variant sets an initial entry
such as `/roadmap` and renders directly inside the one preview router
(`apps/github.io/src/app/app-routes.stories.tsx:3`,
`apps/github.io/src/app/app-routes.stories.tsx:14`). It must not add another
story-local Router. An isolated component story still uses `StoryRoutes`,
which renders the selected component at `/` and the real detail route at
`/skills/:skillId`:

```tsx
export function StoryRoutes({ children }: StoryRoutesProps): ReactElement {
  return (
    <Routes>
      <Route path="/*" element={children} />
      <Route path="/skills/:skillId" element={<SkillDetailRoute />} />
    </Routes>
  );
}
```

The wildcard permits a focused component story to supply nested routes without
React Router warning that its parent cannot match deeper paths. The route
harness delegates resolution, not-found handling, and detail rendering to the
production route component
(`apps/github.io/.storybook/story-routes.tsx:10`,
`apps/github.io/src/app/skills/skill-detail-route.tsx:12`). Keep this harness
small: it should mirror only the app destinations an isolated story must reach.

Key stateful preview providers to the selected Storybook story when their state
must not leak across stories. `MemoryRouter` preserves its history while React
reuses the same component instance. The preview therefore uses
`key={context.id}` so navigation remains stable within one story but selecting
a different story creates fresh router state
(`apps/github.io/.storybook/preview.ts:24`).

Test the exported preview decorator itself. Reconstructing the expected
providers in a test can pass even when `preview.ts` omits a provider, route
switch, provider order, or lifecycle key. The preview-routing test obtains the
actual decorator (`apps/github.io/.storybook/story-routes.spec.ts:112`) and
protects both routing branches:

- The focused global-navigation story opens its drawer with no page item
  selected and emits no nested-route warning
  (`apps/github.io/.storybook/story-routes.spec.ts:159`).
- A SkillCard click renders the Kubernetes detail heading
  (`apps/github.io/.storybook/story-routes.spec.ts:195`).
- A new Storybook context ID resets the route and renders the next story
  (`apps/github.io/.storybook/story-routes.spec.ts:195`).
- A command-palette selection renders the Terraform detail heading
  (`apps/github.io/.storybook/story-routes.spec.ts:259`).
- An external project result opens through `window.open` with `_blank` and
  `noopener,noreferrer`, so the Storybook preview canvas does not become the
  external-page target (`apps/github.io/.storybook/story-routes.spec.ts:348`).

Keep focused URL and component tests alongside this integration coverage. They
protect useful narrower contracts, but they do not substitute for asserting
that the Storybook canvas renders an internal destination page or that external
destinations leave the preview frame.

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

Layout ownership remains independent of Storybook's router ownership. The
global shell owns persistent navigation and the shared Page Scroll Owner;
routes own their semantic content; and the preview owns the single
`MemoryRouter`. `StoryRoutes` supplies only the additional route table needed
for isolated components, while `appRoute` stories supply the production route
tree themselves. Keeping those concerns separate avoids both nested Routers and
Storybook-aware production components.

## When to Apply

- Building a Storybook story for a responsive route or page-level experience.
- Debugging a story where the URL changes but the destination UI does not.
- Adding a card, command palette, breadcrumb, or other client-side navigation
  entry point to an isolated story.
- Using a stateful global decorator whose state should reset when Storybook
  changes the selected story.
- Verifying global navigation without moving route logic into a page component.

## Examples

Use the production route tree for canonical page coverage; keep all real route
variants under `Pages`:

```tsx
const meta: Meta<typeof AppRoutes> = {
  component: AppRoutes,
  parameters: { layout: 'fullscreen' },
  title: 'Pages',
};

export const Roadmap = { parameters: { appRoute: '/roadmap' } };
```

For navigation-component review, render `GlobalNavigationLayout` with a
neutral nested outlet rather than duplicating the page catalogue:

```tsx
export const Default = {
  render: () => (
    <Routes>
      <Route element={<GlobalNavigationLayout />}>
        <Route index element={<main aria-label="Navigation preview" />} />
      </Route>
    </Routes>
  ),
};
```

Avoid treating router context as a complete navigation harness:

```tsx
// Location changes, but the story remains the only rendered element.
<MemoryRouter>
  <Story />
</MemoryRouter>
```

For isolated components, prefer the preview's explicit route harness for
destinations the story can reach:

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

- [Keep Routed Pages Under One Shell Scroll Owner](keep-home-sections-under-one-page-scroll-owner.md)
- [Verify Storybook From Linked Worktrees](../workflow-issues/verify-storybook-from-linked-worktree.md)
- [Verify Astryx Component API Contracts Before Styling](../best-practices/astryx-component-api-contracts.md)
- [Keep Astryx StyleX Tailwind Boundaries Explicit](../best-practices/astryx-stylex-tailwind-boundaries.md)
- [Treat Astryx Layout Gaps As Spacing Tokens](astryx-layout-gap-token-spacing.md)
- [Open External Command Palette Results Outside Storybook Iframes](../ui-bugs/external-command-palette-results-storybook-iframe.md)
