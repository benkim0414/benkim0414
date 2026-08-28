---
title: Assert Global Navigation Order By Accessible Label
date: 2026-08-26
last_updated: 2026-08-28
category: best-practices
module: github.io global navigation
problem_type: best_practice
component: testing_framework
severity: low
applies_when:
  - Changing persistent github.io top navigation item order
  - Preserving product-approved labels while reordering route links
  - Adding regression coverage for user-observable navigation behavior
tags: [github-io, global-navigation, top-nav, accessibility, testing, regression-test]
---

# Assert Global Navigation Order By Accessible Label

## Context

The `github.io` global navigation renders its primary links through an Astryx
`TopNav` labelled `Global navigation` in
`apps/github.io/src/app/global-navigation-layout.tsx:169` and
`apps/github.io/src/app/global-navigation-layout.tsx:245`. Home is an
icon-only `IconButton` with `href="/"` and label `Home` at
`apps/github.io/src/app/global-navigation-layout.tsx:199`,
`apps/github.io/src/app/global-navigation-layout.tsx:203`, and
`apps/github.io/src/app/global-navigation-layout.tsx:212`.

When the product decision is to keep the `Roadmap` label but reorder the top
nav to Home, Skills, Roadmap, the regression test belongs at behavior level.
The current implementation renders `Skills` before `Roadmap` while preserving
their hrefs and labels in
`apps/github.io/src/app/global-navigation-layout.tsx:172-195`.

## Guidance

For global navigation ordering, assert the rendered link sequence inside the
navigation landmark. Do not test a component-internal array, and do not collect
links from the whole document. The useful contract is the accessible sequence a
user, browser, or assistive technology observes inside `Global navigation`.

Keep route destinations and selected-state behavior as separate assertions. The
current spec verifies `Home`, `Roadmap`, and `Skills` hrefs independently in
`apps/github.io/src/app/global-navigation-layout.spec.tsx:191-201`, while
selected-state behavior stays in the parameterized `aria-current` test at
`apps/github.io/src/app/global-navigation-layout.spec.tsx:315-326`.

For icon-only links, use the accessible label as the test-visible name. For
text links, visible text is acceptable. The order assertion maps each link to
`aria-label` first and falls back to trimmed `textContent`, which covers the
icon-only Home link and the text-only Skills and Roadmap links
(`apps/github.io/src/app/global-navigation-layout.spec.tsx:202-206`).
The same test also asserts that the GitHub profile icon remains outside the
primary route-link sequence by expecting the full navigation link order to be
Home, Skills, Roadmap, GitHub
(`apps/github.io/src/app/global-navigation-layout.spec.tsx:206`).

Always scope the order query with `within(navigation)`. The layout renders
routed page content through `Outlet` inside `LayoutContent`
(`apps/github.io/src/app/global-navigation-layout.tsx:130-132`), and the test
fixture mounts additional route content
(`apps/github.io/src/app/global-navigation-layout.spec.tsx:114-137`). A
whole-document `getAllByRole('link')` would include any future links rendered
by routed page content and could break a top-nav order test for the wrong
reason.

Use Storybook from the linked worktree for visual QA, but rely on semantic
tests for order regressions. App instructions require Storybook or browser
visual checks when UI changes affect visuals (`apps/github.io/AGENTS.md:60-74`),
and the linked-worktree guidance explains why Storybook should launch from the
worktree app directory
(`docs/solutions/workflow-issues/verify-storybook-from-linked-worktree.md:47-50`).
Visual QA confirms the branch being reviewed; the landmark-scoped semantic test
prevents the ordering regression.

## Why This Matters

Navigation order is a user-observable accessibility and wayfinding contract. A
component-internal assertion can pass while the rendered landmark is wrong, and
a whole-document link-list assertion can fail because routed content added an
unrelated link. Scoping to the named navigation landmark tests the behavior
users experience and keeps the failure tied to the navigation contract.

This follows the same pattern as other Astryx learnings in the repo: verify
component contracts through public behavior rather than inferred implementation
details. The Astryx component API guidance recommends focused tests for the
public contract that matters
(`docs/solutions/best-practices/astryx-component-api-contracts.md:43-45`).

## When to Apply

- Changing the order, labels, hrefs, or selected-state behavior of `TopNav`,
  `SideNav`, tab bars, breadcrumbs, or other primary navigation.
- Adding icon-only navigation links where the accessible label is the stable
  user-facing name.
- Testing shell-level navigation in a routed app where page content can
  introduce unrelated links.
- Reviewing UI changes that need both visual QA and a semantic regression
  guard.

## Examples

Use the named landmark as the boundary, then map the rendered links to their
accessible names:

```tsx
const navigation = getByRole('navigation', { name: 'Global navigation' });

expect(
  within(navigation).getAllByRole('link').map(
    (link) => link.getAttribute('aria-label') ?? link.textContent?.trim(),
  ),
).toEqual(['Home', 'Skills', 'Roadmap']);
```

Keep the neighboring contracts independent:

```tsx
expect(getByRole('link', { name: 'Home' }).getAttribute('href')).toBe('/');
expect(getByRole('link', { name: 'Roadmap' }).getAttribute('href')).toBe(
  '/roadmap',
);
expect(getByRole('link', { name: 'Skills' }).getAttribute('href')).toBe(
  '/skills',
);
```

For this kind of change, verify the affected spec file directly:

```bash
pnpm exec vitest run apps/github.io/src/app/global-navigation-layout.spec.tsx
```

If the full `pnpm nx test github.io` run fails on unrelated exact CSS
class-string equality assertions, do not treat a focused spec run as evidence
that the full suite passed.

## Related

- `docs/solutions/best-practices/astryx-component-api-contracts.md`
- `docs/solutions/workflow-issues/verify-storybook-from-linked-worktree.md`
- `docs/solutions/ui-bugs/astryx-blue-heroicon-home-navigation.md`
- `docs/solutions/design-patterns/mirror-app-shell-ownership-in-mobile-storybook-pages.md`
