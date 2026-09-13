---
title: Verify In-Page Navigation Against Shell Scroll Ownership
date: 2026-09-13
category: design-patterns
module: github.io skill detail navigation
problem_type: architecture_pattern
component: frontend
severity: medium
applies_when:
  - A routed page adds sticky in-page navigation inside the persistent app shell
  - A navigation component tracks sections using scroll events or geometry
  - Responsive behavior depends on compiled media queries and a non-document scroll owner
tags:
  - github-io
  - astryx-outline
  - app-shell
  - scroll-ownership
  - sticky-navigation
  - responsive-layout
  - browser-verification
---

# Verify In-Page Navigation Against Shell Scroll Ownership

## Context

The `github.io` app keeps routed pages under one persistent Page Scroll Owner.
Adding an Astryx `Outline` to a page therefore crosses two ownership boundaries:
the page owns its headings and responsive rail, while the shell owns vertical
movement. Rendering correct fragment links is necessary, but it does not prove
that sticky positioning, smooth navigation, or active-section tracking uses the
same element that users scroll.

The skill detail page makes that boundary explicit by resolving the shell
ancestor from its mounted `main` and passing it to Astryx as
`scrollContainerRef`
(`apps/github.io/src/app/skills/skill-detail-page.tsx:73-74`,
`apps/github.io/src/app/skills/skill-detail-page.tsx:202-226`). It does not add a
second overflow container.

## Guidance

Treat scroll ownership as part of the component integration contract:

1. Keep the route `main` directly beneath the existing shell scroll owner.
2. When the component supports an explicit scroll-container ref, pass the known
   Page Scroll Owner rather than making the page or rail independently
   scrollable.
3. Keep section IDs and labels in one descriptor set, and use the same inclusion
   predicates for both outline items and rendered headings, so navigation cannot
   point to an omitted section
   (`apps/github.io/src/app/skills/skill-detail-page.tsx:29-37`,
   `apps/github.io/src/app/skills/skill-detail-page.tsx:75-83`).
4. Split evidence by capability. DOM tests should prove semantic membership and
   conditional rendering; a production browser should prove compiled responsive
   CSS, sticky geometry, the real scroll owner, URL fragments, and settled active
   state.

For Astryx `Outline`, the relevant integration shape is:

```tsx
const scrollContainerRef = useRef<HTMLElement | null>(null);

<VStack
  as="main"
  ref={(element) => {
    scrollContainerRef.current = element?.closest(
      '.astryx-layout-content',
    ) as HTMLElement | null;
  }}
>
  <Outline
    items={outlineItems}
    label="On this page"
    scrollContainerRef={scrollContainerRef}
  />
</VStack>
```

The production verifier exercises the actual shell owner and checks the Outline
at phone, breakpoint, tablet, and desktop widths
(`apps/github.io/scripts/verify-mobile-layout-browser.mjs:13-18`,
`apps/github.io/scripts/verify-mobile-layout-browser.mjs:1144-1225`).

## Why This Matters

jsdom can establish that links and heading IDs agree, but it cannot establish
media-query application, sticky positioning, scroll geometry, or browser scroll
events. A page can therefore pass component tests while its defining navigation
behavior remains unproved.

Browser checks also need to observe component semantics rather than incidental
serialization or timing. Router-backed anchors may expose a full URL through
`href`, so compare `HTMLAnchorElement.hash` for fragment intent. Astryx updates
the active link with `aria-current="location"` after its navigation settles
(`node_modules/@astryxdesign/core/src/Outline/Outline.tsx:459-467`), so poll for
that state instead of assuming a short fixed sleep is sufficient.

## When to Apply

- A page-level table of contents lives inside `GlobalNavigationLayout`.
- Sticky UI is expected to remain pinned while `.astryx-layout-content` scrolls.
- A third-party or design-system component accepts an explicit scroll root.
- An interaction changes both the URL fragment and an asynchronous active state.
- A breakpoint is part of the feature contract and must work at its exact boundary.

## Examples

Keep fast structural assertions for the stable relationship:

```ts
expect(screen.getByRole('link', { name: 'Experience' })).toHaveAttribute(
  'href',
  '#skill-experience-narrative-heading',
);
expect(document.querySelector('#skill-experience-narrative-heading')).not.toBeNull();
```

Then add production-browser evidence that scrolls the named shell owner, confirms
the sticky rail remains aligned with that owner, activates a link by its parsed
hash, and waits until both `location.hash` and `aria-current="location"` identify
the target (`apps/github.io/scripts/verify-mobile-layout-browser.mjs:1184-1220`).

When that verifier fails, classify the evidence before changing product code.
Confirm that the selector observes the intended DOM property and that the wait
matches the component's asynchronous contract; a test-harness defect is not
proof of a product root cause.

## Related

- [Keep Routed Pages Under One Shell Scroll Owner](keep-home-sections-under-one-page-scroll-owner.md)
- [Mirror Route Ownership in Mobile Storybook Pages](mirror-app-shell-ownership-in-mobile-storybook-pages.md)
- [Stabilize Mobile Drawer Browser Verification](../ui-bugs/stabilize-mobile-drawer-browser-verification.md)
- [Verify Astryx Component API Contracts Before Styling](../best-practices/astryx-component-api-contracts.md)

This learning describes the verified local branch and does not claim that the
change has been merged or released.
