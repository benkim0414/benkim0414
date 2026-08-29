---
title: Filter Skills Page Catalog With Astryx Toolbar Controls
date: 2026-08-29
category: conventions
module: apps/github.io skills
problem_type: convention
component: tooling
severity: medium
applies_when:
  - Adding search or category filtering to the public Skills Page Catalog Projection
  - Composing Astryx Toolbar, TextInput, IconButton, Popover, and CheckboxList controls for an app-page catalog
  - Preserving search and multi-category filter semantics in page-level tests and an interactive Storybook story
related_components:
  - Skills Page Catalog Projection
  - github.io Astryx Foundation
  - Astryx Component Contract
  - SkillsPage
  - SkillCard
  - Storybook
tags:
  - github-io
  - skills-page
  - skill-catalog
  - search
  - category-filtering
  - astryx
  - toolbar
  - popover
  - storybook
  - testing
---

# Filter Skills Page Catalog With Astryx Toolbar Controls

## Context

The Skills Page Catalog Projection needs lightweight discovery controls without
turning a simple in-memory catalog into a power-search experience. Keep the
controls local to `SkillsPage`: a clearable Astryx `TextInput` belongs in a
`Toolbar`, while a labelled funnel `IconButton` opens a `Popover` of category
checkboxes and a conditional Clear filters action.

## Guidance

Keep query and category state separate, then derive the filtered collection
once and sort a copy for display. Match a trimmed, case-insensitive query against a skill's name,
description, categories, and keywords in `skillMatchesQuery`
(`apps/github.io/src/app/skills/skill-search.tsx`). Treat no selected
categories as unrestricted; otherwise use `some` so selected categories are
ORed, then combine the category predicate with the query predicate using AND
in `SkillsPage` (`apps/github.io/src/app/skills/skills-page.tsx`).

Offer only categories represented in the supplied catalog. Keep the text
input's built-in clear action and an explicit Clear filters action. Preserve a
separate empty-catalog state from the no-match state caused by active search or
filter controls.

## Why This Matters

This makes narrowing a portfolio catalog predictable: selecting another
category broadens the category result set, while a query narrows it. Clear,
labelled controls are discoverable and reversible. Distinct empty states tell
readers whether the catalog has no supplied data or their active controls found
no matching skill.

## When to Apply

- A small, in-memory catalog needs free-text search and multi-select grouping
  filters.
- The filtering dimensions are simple enough to compose from standard Astryx
  controls rather than a multi-dimensional PowerSearch surface.
- Storybook should expose an interaction state for reviewers to inspect the
  real filter popover.

## Examples

The page test should cover a description-only query, the query-and-category
intersection, OR behavior across two selected categories, both reset actions,
and the filtered no-results state
(`apps/github.io/src/app/skills/skills-page.spec.tsx`). The
`FilterControlsOpen` Storybook play function clicks the actual labelled filter
button to open the popover for Storybook review
(`apps/github.io/src/app/skills/skills-page.stories.tsx`).

## Related

- [Constrain Skills Page To Evidence-Backed Skill Cards](constrain-skills-page-to-evidence-backed-skill-cards.md)
- [Verify Astryx Component API Contracts Before Styling](../best-practices/astryx-component-api-contracts.md)
- [Mirror Route Ownership in Mobile Storybook Pages](../design-patterns/mirror-app-shell-ownership-in-mobile-storybook-pages.md)
- [Verify Storybook From Linked Worktrees](../workflow-issues/verify-storybook-from-linked-worktree.md)
