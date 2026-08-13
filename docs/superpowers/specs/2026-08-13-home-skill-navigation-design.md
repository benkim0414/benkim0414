# Home Skill Navigation Design

## Goal

Make `HomePage` the root page of the `github.io` app, remove the remaining
`MobileSkillsPage`-era app-shell component and Storybook surface, and make both
skill cards and command-palette skill results navigate to durable skill detail
URLs.

Update `SkillDetailPage` breadcrumbs to reserve the future skills index in the
hierarchy:

`Home / Skills / [Skill name]`

## Context

The app already exposes clean skill detail routes at `/skills/:skillId`, but
the root route renders `AppShell`. `AppShell` owns temporary selected-skill
state and replaces `HomePage` with `SkillDetailPage` without updating the URL.
It also has a Storybook story titled `Mobile Skills Page`, even though the page
component was previously renamed to `HomePage`.

`HomePage` already reports command-palette selections through
`onSkillSelect`. `SkillCard` currently has no navigation behavior, including
when it is rendered inside `SkillCarousel` or `SkillCardList`. The detail-page
breadcrumb currently presents `Skills / [Skill name]` and links `Skills` to
the root route.

## Chosen Approach

Use route-native navigation and remove selection state as a competing source
of page state.

- `App` owns `BrowserRouter` and the shared neutral Astryx theme.
- `AppRoutes` maps `/` directly to `HomePage`.
- Skill cards are semantic React Router links to their detail routes.
- Command-palette selection navigates to the same detail route.
- The URL is authoritative for the active page and skill.

This approach preserves browser history, direct linking, refresh behavior, and
the existing not-found route while avoiding callback plumbing or URL/state
synchronization.

## Application Structure

Move the neutral `Theme` boundary above `AppRoutes`, inside `App`, so all route
elements share one theme wrapper. The route table becomes:

- `/` renders `HomePage`.
- `/skills/:skillId` renders `SkillDetailRoute`.
- `*` renders `NotFoundPage`.

Delete `app-shell.tsx` and `app-shell.stories.tsx`. No replacement shell or
selection controller is introduced. Keep `HomePage` and its Storybook stories
as the canonical home surface.

Centralize detail URL construction in a small skill-route helper that accepts a
skill ID and returns `/skills/:skillId`. `SkillCard` and `HomePage` use this
helper so card and command-palette destinations cannot drift.

## Skill Card Navigation

Every `SkillCard` links to the detail route for its supplied skill, regardless
of whether it is rendered standalone, in `SkillCarousel`, or in
`SkillCardList`. Navigation belongs to `SkillCard`, so current and future card
collections do not need to thread callbacks or reconstruct URLs.

Use a React Router `Link` as a full-card overlay and keep it as a sibling of the
article content. `SkillCard` can contain certification citation links, so
wrapping the card content in the route link would create invalid nested links.
Place citation links above the overlay so they retain their independent targets
while the rest of the card navigates to the skill detail route.

Preserve the existing Astryx `Card`, article structure, visual variants,
dimensions, content ordering, and certification behavior. Associate the route
link and article with the existing generated title ID so the interactive card
has an accessible name based on the skill heading. Give the overlay a visible
keyboard focus treatment that follows the card boundary. Do not introduce
click handlers, button semantics, nested links, or duplicate visible link text.

Router-dependent `SkillCard` consumers in tests and Storybook receive a
memory-router context. The navigation change must not redesign the card or
alter carousel sizing.

## Command-Palette Navigation

`HomePage` uses React Router navigation when `CommandPalette` reports a selected
skill ID. Resolve the selected item from the existing command item collection,
construct the same detail path used by `SkillCard`, and navigate to it.

Remove `HomePageProps.onSkillSelect`; temporary selection is no longer an
external concern. Keep the current searchable fields, text-only skill result
rendering, empty states, dimensions, and palette labels. Successful navigation
unmounts the home page, naturally removing the open dialog and its local state.

## Skill Detail Breadcrumbs

Render three breadcrumb items in this order:

1. `Home`, linked to `/`.
2. `Skills`, plain text because `/skills` is not implemented yet.
3. The current skill name, marked current and not linked.

Keep the existing `Skill breadcrumb` accessible label. Do not add a `/skills`
route, placeholder page, disabled link, or redirect. A later `SkillsPage`
change can turn the middle breadcrumb into a link without changing the current
hierarchy.

## Error Handling and Route Behavior

`SkillDetailRoute` remains responsible for resolving the route parameter and
rendering `NotFoundPage` for unknown skill IDs. Valid direct URLs, page refresh,
and browser back/forward navigation continue to use the router as the source of
truth. The wildcard route continues to render the existing not-found surface.

No new runtime error state is required. Canonical skill data supplies the IDs
used by both navigation entry points, and the existing detail resolver owns
unknown-ID handling.

## Storybook and Tests

Delete the `AppShell` Storybook story. Keep the `HomePage`, `SkillCard`,
`SkillCarousel`, `SkillCardList`, and `SkillDetailPage` stories and provide
router context where their linked components require it. Historical design and
solution documents remain unchanged.

Focused coverage must verify:

- `/` renders `HomePage` directly under the shared theme.
- Clicking a skill card updates the route and renders the matching detail page.
- Selecting a command-palette skill updates the route and renders the matching
  detail page.
- `SkillCard` exposes the expected semantic link destination while preserving
  its existing content and accessibility contracts.
- Direct valid detail routes and unknown routes retain their existing results.
- Breadcrumbs render `Home / Skills / [Skill name]` in order, with only `Home`
  linked and the skill marked current.
- No `AppShell` or `Mobile Skills Page` app/story reference remains in active
  `github.io` source.

Run the focused `github.io` tests during development, followed by:

```sh
pnpm nx test github.io
pnpm nx lint github.io
pnpm nx build github.io
pnpm nx build-storybook github.io
```

## Scope Boundaries

In scope:

- Root route and shared theme ownership.
- Removal of `AppShell` and its Storybook story.
- Skill card and command-palette navigation.
- Skill detail breadcrumbs.
- Directly affected tests and Storybook router setup.

Out of scope:

- Creating `SkillsPage` or a `/skills` route.
- Adding other home-page navigation.
- Redesigning cards, the command palette, breadcrumbs, or detail content.
- Changing skill IDs, skill detail resolution, or canonical skill data.
- Rewriting historical specs or solution documents that describe earlier
  architecture.

## Risks and Validation Points

- The full-card overlay can accidentally obscure certification links, interfere
  with text layout, or lose visible keyboard focus. Interaction tests must
  exercise both route and citation links, while visual Storybook verification
  and existing sizing tests confirm the card remains unchanged.
- Router-native components fail outside router context. Component tests and
  stories must establish that context deliberately.
- Moving the theme boundary can accidentally double-wrap or omit route
  surfaces. App route tests must cover home, valid detail, and not-found paths.
- Command-palette selection must navigate exactly once and retain text-only
  results. Its focused test must assert both the destination and rendered detail
  page.
