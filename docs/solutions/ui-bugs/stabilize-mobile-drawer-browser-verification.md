---
title: Stabilize Mobile Drawer Browser Verification
date: 2026-08-29
category: ui-bugs
module: apps/github.io global navigation
problem_type: ui_bug
component: testing_framework
severity: medium
symptoms:
  - The production Firefox verifier times out waiting for the Navigation drawer after the former top-nav pointer trigger.
  - The route-transition and shell-scroll-reset assertions do not run when the drawer fails to open.
root_cause: logic_error
resolution_type: code_fix
applies_when:
  - Migrating persistent navigation from visible route links to a controlled drawer
  - Verifying a github.io route transition in the production Firefox browser gate
related_components:
  - github.io GlobalNavigationLayout
  - github.io MobileNav
  - github.io production browser verifier
tags: [github-io, mobile-navigation, drawer, webdriver-bidi, regression-test]
---

# Stabilize Mobile Drawer Browser Verification

## Problem

The `github.io` shell now keeps route destinations in an Astryx `MobileNav`
drawer at every viewport. The header exposes Search, GitHub, and the
`Navigation` menu trigger, while `Skills` and `Roadmap` are drawer items
(`apps/github.io/src/app/global-navigation-layout.tsx:182-226`).

## Symptoms

The production browser verifier previously assumed that the destination was a
visible header link. After the navigation moved into the controlled drawer, a
synthetic WebDriver pointer sequence could locate the trigger but did not
reliably open the dialog. The browser gate then timed out before it tested the
route transition or the shell-scroll reset.

## What Didn't Work

Using a low-level WebDriver pointer action for the controlled `Navigation`
trigger made the test depend on the browser automation transport reproducing
the component's expected event sequence. The trigger was visible, but the
dialog did not reliably open after the action.

## Solution

For a controlled drawer, use the named trigger's DOM `click()` to establish
the drawer state, and keep the production pointer interaction for the actual
drawer destination. This separates control activation from the user-visible
route behavior that the verifier must preserve.

```js
await evaluateJson(
  bidi,
  context,
  `document.querySelector('button[aria-label="Navigation"]')?.click(); return true;`,
);
await waitForSelector(
  bidi,
  context,
  'dialog[aria-label="Navigation"][open] a[href="/roadmap"]',
  signal,
);
```

Then measure and pointer-click the visible drawer link, wait for the route's
real readiness selector, and verify the shared shell scroll position returns
to zero. The current implementation follows this sequence in
`apps/github.io/scripts/verify-mobile-layout-browser.mjs:1174-1244`.

## Why This Works

A route assertion alone can pass without proving that the drawer opened or
that its destination is usable. Conversely, a low-level pointer assertion on
the controlled trigger is brittle when the browser automation transport does
not dispatch the event sequence the component expects. The accessible trigger
still verifies the production control exists; the ensuing dialog, pointer
selection, route readiness, and scroll reset cover the user-facing navigation
contract.

## Prevention

- Open a controlled menu, drawer, or popover through its named accessible
  trigger before asserting its destinations.
- Retain a real pointer interaction for the route link and assert both the
  destination readiness and shared shell state after navigation.
- Use the production browser gate at every supported compact-layout viewport.

Run the production gate after changing either the navigation composition or
the verifier:

```sh
pnpm nx verify-mobile-layout-browser github.io
```

## Related

- [Keep Home Sections Under One Page Scroll Owner](../design-patterns/keep-home-sections-under-one-page-scroll-owner.md)
- [Mirror Route Ownership in Mobile Storybook Pages](../design-patterns/mirror-app-shell-ownership-in-mobile-storybook-pages.md)

## Examples

Keep the route destination and its readiness condition explicit at each tested
viewport:

```js
await verifyTopNavScrollReset(
  bidi,
  context,
  viewport,
  '/roadmap',
  'main',
  signal,
);
```
