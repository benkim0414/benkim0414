---
title: Keep Skill Navigation Route-Authoritative
date: 2026-08-12
last_updated: 2026-08-28
category: design-patterns
module: github.io skill navigation
problem_type: design_pattern
component: frontend_stimulus
severity: medium
applies_when:
  - 'Multiple UI entry points navigate to the same skill detail destination'
  - 'Skill detail URLs must support browser history, refresh, and direct entry'
  - 'Storybook stories exercise navigation implemented by production routes'
related_components:
  - 'github.io AppRoutes'
  - 'github.io HomePage'
  - 'github.io SkillCard'
  - 'github.io SkillDetailRoute'
  - 'Storybook preview routes'
tags:
  - github-io
  - navigation
  - react-router
  - skill-detail
  - command-palette
  - deep-links
  - storybook
  - testing
---

# Keep Skill Navigation Route-Authoritative

## Context

Skill selection in the `github.io` application is a URL-backed navigation
contract. `AppRoutes` maps `/` to `HomePage`, `/skills/:skillId` to
`SkillDetailRoute`, and all unmatched locations to `NotFoundPage`
(`apps/github.io/src/app/app.tsx:24`). `App` owns the `BrowserRouter`, shared
providers, and route table; it does not hold a selected `Skill` or conditionally
swap pages from component state (`apps/github.io/src/app/app.tsx:34`).

This replaces the earlier placeholder approach in which a shell-owned callback
could switch pages without changing the URL. Browser history, refresh, and
direct entry are now deliberate parts of the behavior, so the current route is
the authority for which page is rendered.

`GlobalNavigationLayout` owns the command-palette mechanics that persist across
routes, such as whether the dialog is open, which result is selected, and how a
selected result is dispatched. Those values control the interaction, not the
active application page. Choosing a resolved internal skill result navigates to
its canonical detail URL (`apps/github.io/src/app/global-navigation-layout.tsx:148`).

## Guidance

Keep every skill-navigation entry point on one path contract. Build that
contract with `getSkillDetailPath`, which URL-encodes the skill ID:

```ts
export function getSkillDetailPath(skillId: string): string {
  return `/skills/${encodeURIComponent(skillId)}`;
}
```

The helper is the single place that defines outbound skill URLs
(`apps/github.io/src/app/skills/skill-route.ts:3`). `SkillCard` supplies its
result directly as the `ClickableCard` `href`
(`apps/github.io/src/app/skills/skill-card.tsx:56`), while the global command
palette resolves the selected result and keeps relative skill paths on React
Router navigation:

```tsx
onValueChange={(resultId) => {
  setSelectedResultId(resultId);
  const result = resultById.get(resultId);

  if (result) {
    if (isExternalHref(result.href)) {
      window.open(result.href, '_blank', 'noopener,noreferrer');
    } else {
      navigate(result.href);
    }
  }
}}
```

This is the current palette handoff
(`apps/github.io/src/app/global-navigation-layout.tsx:148`). Sharing the helper
prevents cards and search results from drifting into different URL shapes or
handling special characters differently. It also lets links retain native link
semantics while imperative internal selection uses React Router navigation.
Absolute certification and project results intentionally leave this internal
route contract and open as external browser destinations.

Keep inbound URL interpretation at the route boundary. `SkillDetailRoute`
reads `skillId`, resolves it against production skill, detail, evidence, and
project data, then renders either `NotFoundPage` or `SkillDetailPage`
(`apps/github.io/src/app/skills/skill-detail-route.tsx:12`). Pages and entry
points should not duplicate that resolution or decide what an unknown route
means.

```tsx
const { skillId = '' } = useParams<{ skillId: string }>();
const resolution = resolveSkillDetail(skillId, {
  skills,
  detailRecords: skillDetailRecords,
  evidenceItems: devOpsCapabilityEvidenceItems,
  projects: sampleProjects,
});

if (resolution.status === 'not-found') {
  return <NotFoundPage />;
}

return <SkillDetailPage detail={resolution.value} />;
```

The rendered detail page can then present route-derived context consistently.
Its breadcrumb order is Home, Skills, and the current skill
(`apps/github.io/src/app/skills/skill-detail-page.tsx:70`).

## Why This Matters

Route authority gives every entry point the same observable result: the URL
changes, the route table renders the destination, refresh restores it, and an
unknown ID follows one not-found policy. Application tests protect both common
journeys: a Kubernetes card reaches `/skills/kubernetes`
(`apps/github.io/src/app/app.spec.tsx:97`), and a Terraform command result
reaches `/skills/terraform` (`apps/github.io/src/app/app.spec.tsx:109`). Route
tests separately prove that known IDs render details and unknown skill IDs
render the not-found page (`apps/github.io/src/app/app.spec.tsx:145`,
`apps/github.io/src/app/app.spec.tsx:174`).

The ownership boundary also keeps transient UI state from becoming navigation
state. `HomePage` may track palette selection to operate the command component,
but `BrowserRouter` and `AppRoutes` own location and page selection. This avoids
two sources of truth in which local state says one skill is selected while the
address bar identifies another.

Storybook needs a route-equivalent harness because router context alone cannot
turn a location change into destination UI. `StoryRoutes` maps the story to `/`
and the production `SkillDetailRoute` to `/skills/:skillId`
(`apps/github.io/.storybook/story-routes.tsx:10`). The preview supplies a keyed
`MemoryRouter` together with the production Astryx link and theme providers, so
navigation works within a story and resets when the story ID changes
(`apps/github.io/.storybook/preview.ts:15`). The preview tests cover card
navigation, internal palette navigation, external project-result dispatch, and
route reset on story change (`apps/github.io/.storybook/story-routes.spec.ts:79`).

## When to Apply

- A detail destination must be refreshable, shareable, or reachable directly.
- Multiple controls, such as cards and command results, navigate to the same
  resource.
- Route parameters must be resolved against canonical application data with a
  consistent not-found outcome.
- A Storybook story must exercise a production interaction that navigates beyond
  the component rendered at the initial story route.
- Page-local interaction state risks duplicating browser location as a second
  source of navigation truth.

## Examples

Keep route ownership visible at the application boundary:

```tsx
export function AppRoutes(): ReactElement {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/skills/:skillId" element={<SkillDetailRoute />} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}

export function App(): ReactElement {
  return (
    <BrowserRouter>
      <AppProviders>
        <AppRoutes />
      </AppProviders>
    </BrowserRouter>
  );
}
```

This split is implemented in `apps/github.io/src/app/app.tsx:24` and
`apps/github.io/src/app/app.tsx:34`. Tests that need deterministic locations can
render `AppRoutes` inside `MemoryRouter`, while production keeps `BrowserRouter`
ownership at `App` (`apps/github.io/src/app/app.spec.tsx:145`).

For isolated stories, mirror only the destinations the story can reach and
delegate detail behavior to the production route component:

```tsx
<Routes>
  <Route path="/" element={children} />
  <Route path="/skills/:skillId" element={<SkillDetailRoute />} />
</Routes>
```

Do not replace this with a callback that directly renders a detail page. That
would bypass the path helper, route parameter resolution, browser semantics,
and not-found behavior that the application contract requires.

## Related

- [Mirror Route Ownership in Mobile Storybook Pages](mirror-app-shell-ownership-in-mobile-storybook-pages.md)
- [Verify Astryx Component API Contracts Before Styling](../best-practices/astryx-component-api-contracts.md)
- [Verify Storybook From Linked Worktrees](../workflow-issues/verify-storybook-from-linked-worktree.md)
- [Open External Command Palette Results Outside Storybook Iframes](../ui-bugs/external-command-palette-results-storybook-iframe.md)
