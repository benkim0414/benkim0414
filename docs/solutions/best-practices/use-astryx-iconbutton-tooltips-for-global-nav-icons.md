---
module: github.io global navigation
date: 2026-08-26
last_updated: 2026-08-28
problem_type: best_practice
component: tooling
severity: low
applies_when:
  - Adding icon-only controls to the github.io global top navigation
  - Adding Astryx tooltips to icon-only navigation affordances
  - Rendering external profile links from an app configured with a RouterLink LinkProvider
resolution_type: workflow_improvement
related_components:
  - github.io Astryx Foundation
  - GlobalNavigationLayout
  - Astryx IconButton
  - Astryx LinkProvider
  - React Router
tags:
  - github-io
  - global-navigation
  - astryx
  - icon-button
  - tooltip
  - external-links
  - react-router
---

# Use Astryx IconButton Tooltips For Global Nav Icons

## Context

The `github.io` global navigation uses Astryx `TopNav` with icon-only `IconButton` controls for compact actions. `GlobalNavigationLayout` now defines a GitHub profile destination as `https://github.com/benkim0414` and renders the Search `IconButton` immediately followed by a GitHub `IconButton` in `TopNav.endContent`.

The app shell also uses Astryx `LinkProvider` with the local `RouterLink`, which maps Astryx-style `href` props into React Router navigation. Internal navigation should keep that provider behavior, but external profile links should render as native anchors instead of being handed to the SPA router.

## Guidance

For icon-only controls in `apps/github.io/src/app/global-navigation-layout.tsx`, use Astryx `IconButton`'s public `tooltip` prop rather than wrapping the control in a separate tooltip component. Keep `label` as the accessible name and set a short tooltip string for controls whose visible content is only an icon.

```tsx
<IconButton
  icon={<Icon color="inherit" icon="search" size="sm" />}
  label="Search"
  size="sm"
  tooltip="Search"
  variant="ghost"
  onClick={() => setIsSearchOpen(true)}
/>
```

For external profile links, set `as="a"` while keeping `href` on the `IconButton`. This overrides the provider-level `RouterLink` for that one control and preserves normal browser link behavior for an absolute URL.

```tsx
<IconButton
  as="a"
  href="https://github.com/benkim0414"
  icon={<GitHubIcon />}
  label="GitHub"
  size="sm"
  tooltip="GitHub"
  variant="ghost"
/>
```

Use provider-backed `href` alone for internal destinations that should participate in app routing, such as the Home icon link's `href="/"`.

## Testing Pattern

Assert the semantic contract instead of hover timing or visual snapshots. For Astryx `IconButton`, the tooltip relationship is observable through `aria-describedby`, and the tooltip node has `role="tooltip"`.

```tsx
function expectTooltipFor(control: HTMLElement, text: string) {
  const describedBy = control.getAttribute('aria-describedby');

  expect(describedBy).toBeTruthy();

  const matchingTooltip = describedBy
    ?.split(' ')
    .map((id) => control.ownerDocument.getElementById(id))
    .find(
      (element) =>
        element?.getAttribute('role') === 'tooltip' &&
        element.textContent?.trim() === text,
    );

  expect(matchingTooltip).toBeTruthy();
}
```

Keep the test focused on user-observable outcomes:

- Home, Search, and GitHub controls describe matching tooltip nodes.
- The GitHub link is role-discoverable by the accessible name `GitHub`.
- The GitHub link uses `https://github.com/benkim0414`.
- The GitHub icon link follows the Search button in document order.
- Icon-only controls contain an SVG but no visible text content.

## Why This Matters

Using the built-in `tooltip` prop keeps tooltip behavior inside the Astryx component contract and avoids adding wrapper markup around controls that `TopNav` already lays out. The same assertion strategy works for both native button controls, like Search, and link controls, like Home and GitHub.

Using `as="a"` for the external GitHub control is the key exception to the app shell's default routing integration. It keeps internal links routed through `RouterLink` while preventing an absolute external profile URL from being treated like an internal route.

Command-palette results need the same internal/external split, but at selection time rather than render time. Relative skill routes should stay in React Router; absolute certification and project URLs should open with `_blank` and `noopener,noreferrer` so embedded Storybook review does not trap an external destination inside the preview canvas. See [Open External Command Palette Results Outside Storybook Iframes](../ui-bugs/external-command-palette-results-storybook-iframe.md) for the regression details.

## Related References

- `docs/solutions/best-practices/assert-global-nav-order-by-accessible-label.md`
- `docs/solutions/ui-bugs/astryx-blue-heroicon-home-navigation.md`
- `docs/solutions/design-patterns/mirror-app-shell-ownership-in-mobile-storybook-pages.md`
- `docs/solutions/workflow-issues/verify-storybook-from-linked-worktree.md`
