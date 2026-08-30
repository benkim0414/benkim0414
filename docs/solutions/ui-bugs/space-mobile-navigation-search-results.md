---
title: Space Mobile Navigation Search Results
date: 2026-08-30
category: ui-bugs
module: apps/github.io global navigation
problem_type: ui_bug
component: tooling
severity: low
symptoms:
  - The mobile navigation divider visually overlapped the searchable skills input border.
  - The first searchable skill result crowded the search input instead of leaving a clear vertical gap.
root_cause: logic_error
resolution_type: code_fix
related_components:
  - GlobalNavigationLayout
  - github.io MobileNav
  - github.io production browser verifier
  - Astryx Divider
  - Astryx TextInput
  - StyleX
tags: [github-io, global-navigation, mobile-navigation, drawer, skills-search, stylex, spacing, browser-verification]
---

# Space Mobile Navigation Search Results

## Problem

The controlled Astryx `MobileNav` gained a local skill search below its route
links, but its vertical boundaries did not have enough intentional separation.
In the mobile drawer, the divider could visually merge with the search field
border and the first filtered skill began too close to the field.

## Symptoms

Recorded during investigation: the pre-fix field-to-first-skill gap measured
6px, below the intended 8px. The issue was visible in the open navigation
drawer at both 375x667 and 820x1180 viewports.

## What Didn't Work

This project's jsdom unit tests do not exercise rendered pixel geometry.
Treating a rendered field or divider as proof of spacing would therefore miss
this regression.

## Solution

Define the separation with existing spacing tokens in
`apps/github.io/src/app/global-navigation-layout.tsx:83-88`:
`mobileNavigationDivider` applies `marginBlock: spacingVars['--spacing-2']`,
and `mobileNavigationSearch` applies
`marginBlockEnd: spacingVars['--spacing-2']`. Apply those styles to the
drawer's `Divider` and `TextInput` at
`apps/github.io/src/app/global-navigation-layout.tsx:170-180`.

Keep the visual contract in the Firefox verifier.
`apps/github.io/scripts/verify-mobile-layout-browser.mjs:1271-1325` opens the
drawer, reads the divider, input, and first local-skill rectangles, and asserts
an 8px divider bottom margin, a search input whose top edge is below the
divider bottom, and at least 8px from the input to the first skill. The
verifier runs this check for every configured viewport.

## Why This Works

The two margins address different adjacent boundaries: the divider's block
margins isolate the separator from surrounding controls, while the input's
block-end margin reserves space before result links. Using `--spacing-2` makes
the target 8px gap token-backed rather than dependent on incidental component
layout. The browser test validates the divider's computed bottom margin and
element rectangles, so it observes the actual CSS layout that jsdom unit tests
do not cover.

## Prevention

- When adding controls between drawer navigation items and dynamic result
  links, specify both boundaries explicitly and use a theme spacing token.
- Keep DOM/unit tests for filtering and navigation, but put pixel geometry
  assertions in a real-browser check.
- Run `pnpm nx run github.io:verify-mobile-layout-browser` after changing the
  drawer structure or component styles.

## Related

- [Stabilize Mobile Drawer Browser Verification](stabilize-mobile-drawer-browser-verification.md)
  covers controlled-drawer activation; this learning covers its rendered
  spacing contract.
- [Astryx Layout Gap Token Spacing](../design-patterns/astryx-layout-gap-token-spacing.md)
  describes the related token vocabulary.

## Examples

Expected Firefox geometry after the fix:

- Divider computed `margin-bottom`: 8px.
- Search field top: strictly below the divider bottom.
- First local skill top minus search field bottom: at least 8px, allowing the
  verifier's subpixel tolerance.

The relevant verification suite is focused unit tests, lint, full tests, a
build, and browser verification. This learning does not imply the change has
been merged or committed.
