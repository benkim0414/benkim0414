---
title: Open External Command Palette Results Outside Storybook Iframes
date: 2026-08-28
category: ui-bugs
module: github.io global navigation
problem_type: ui_bug
component: frontend_stimulus
symptoms:
  - Global command palette project results did not show GitHub repository pages during Storybook iPad review.
  - Certification external links appeared visible from the same command palette flow.
  - Internal skill results still navigated correctly through React Router.
  - During Storybook iPad review, project selection behaved like the GitHub page stayed trapped in the preview canvas.
root_cause: logic_error
resolution_type: code_fix
severity: medium
related_components:
  - GlobalNavigationLayout
  - github.io global search results
  - Storybook preview routes
  - React Router
tags: [github-io, global-navigation, command-palette, external-links, storybook, routing, github]
---

# Open External Command Palette Results Outside Storybook Iframes

## Problem

During Storybook/iPad review, global command palette project results behaved like GitHub repository URLs were opening inside the preview canvas instead of a visible top-level page.

## Symptoms

- Certification results appeared to work because they opened external certificate URLs.
- Project results such as `benkim0414/dotfiles` did not visibly leave Storybook.
- The command palette mixed internal app routes and absolute external URLs in one result list.

## What Didn't Work

Treating every selected result as an in-app or same-context navigation target is wrong for absolute URLs. Internal routes are app-owned router paths, but certification and project results are external `https://` destinations, so embedded-preview review can hide or block the destination in ways a top-level navigation would not.

## Solution

Route selected search results by URL type in the command palette selection handler. After resolving the selected result ID, the layout checks `isExternalHref(result.href)` and calls `window.open(result.href, '_blank', 'noopener,noreferrer')` for external URLs; otherwise it preserves SPA behavior with `navigate(result.href)` (`apps/github.io/src/app/global-navigation-layout.tsx:148`).

```tsx
if (result) {
  if (isExternalHref(result.href)) {
    window.open(result.href, '_blank', 'noopener,noreferrer');
  } else {
    navigate(result.href);
  }
}
```

External detection is intentionally narrow: only `http://` and `https://` hrefs match (`apps/github.io/src/app/global-navigation-layout.tsx:256`).

The regression tests cover both branches. Selecting the internal `Terraform` skill result updates the memory-router location to `/skills/terraform` (`apps/github.io/src/app/global-navigation-layout.spec.tsx:353`). Selecting `CKA` and `benkim0414/dotfiles` asserts `window.open` is called with each external URL, `_blank`, and `noopener,noreferrer` (`apps/github.io/src/app/global-navigation-layout.spec.tsx:381`). The same spec locks the generic `Search` label/placeholder and the grouped result order `Certifications`, `Skills`, `Projects` (`apps/github.io/src/app/global-navigation-layout.spec.tsx:353`, `apps/github.io/src/app/global-navigation-layout.spec.tsx:366`).

## Why This Works

Opening absolute URLs with `_blank` escapes Storybook's preview iframe and makes external pages visible in a new browsing context. Keeping relative hrefs on `navigate(result.href)` preserves client-side routing for app pages, so global search remains fast and does not reload the GitHub Pages app for internal destinations.

## Prevention

- Keep command-palette selection tests split by destination type: one assertion for an internal route changing the router location, and one assertion for external certification/project URLs using `window.open` with `_blank` plus `noopener,noreferrer`.
- When adding new global-search content types, classify absolute external hrefs through the same `isExternalHref` branch instead of special-casing by result group.
- Validate external links from Storybook or another embedded preview in a real browser context, because a page that works as a top-level navigation target may refuse to render inside an iframe.

## Related Issues

- [Use Astryx IconButton Tooltips for Global Nav Icons](../best-practices/use-astryx-iconbutton-tooltips-for-global-nav-icons.md) covers the adjacent global-navigation distinction between app-routed links and external GitHub links.
- [Mirror App Shell Ownership in Mobile Storybook Pages](../design-patterns/mirror-app-shell-ownership-in-mobile-storybook-pages.md) covers why Storybook page stories should exercise production-like routing and shell ownership.
- [Keep Skill Selection Transition in App Shell](../design-patterns/keep-skill-selection-transition-in-app-shell.md) covers the internal-route side of command-palette selection.
- [Verify Storybook From Linked Worktree](../workflow-issues/verify-storybook-from-linked-worktree.md) covers the Storybook/iPad validation workflow used to catch this kind of embedded-preview behavior.
