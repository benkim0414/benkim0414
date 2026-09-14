---
title: Keep Routed Pages Under One Shell Scroll Owner
date: 2026-08-14
last_updated: 2026-09-14
category: design-patterns
module: apps/github.io global navigation shell
problem_type: design_pattern
component: testing_framework
severity: medium
applies_when:
  - "Rendering multiple React Router pages below persistent global navigation"
  - "Keeping one vertical scroll owner across client-side route transitions"
  - "Capping and centering routed content on wide screens beneath full-width navigation"
  - "Resetting a reused shell scroller before the destination paints"
  - "Rendering routed app stories without nested routers"
  - "Verifying scroll ownership and SPA transitions in a real browser"
related_components:
  - github.io GlobalNavigationLayout
  - github.io routed pages
  - github.io Storybook preview
  - github.io layout verifier
  - github.io Firefox browser verifier
tags:
  - github-io
  - app-shell
  - react-router
  - scroll-ownership
  - scroll-reset
  - storybook
  - layout-content
  - browser-verification
---

# Keep Routed Pages Under One Shell Scroll Owner

## Context

The `github.io` app renders several React Router pages beneath persistent global
navigation. Giving route pages their own vertical overflow owners competed with
the viewport-height frame: Roadmap rendered inside the shell but could not be
scrolled through. Moving ownership into the persistent shell fixed page
scrolling, but exposed a second consequence: the same DOM scroller survives
client-side navigation and can carry the previous route's offset forward.

The durable boundary is one shell-owned vertical scroller around the routed
outlet. Individual pages contribute a semantic `main`, route-local spacing, and
content; they do not create another `LayoutContent` or vertical overflow owner.

## Guidance

### Put the scroll owner at the persistent route boundary

Render one `LayoutContent` as the global `Layout`'s `content`, attach the scroll
ref there, remove its default padding, and place `Outlet` inside it
(`apps/github.io/src/app/global-navigation-layout.tsx:113`):

```tsx
<Layout
  content={
    <LayoutContent ref={contentRef} padding={0}>
      <Outlet />
    </LayoutContent>
  }
  header={/* persistent navigation */}
/>
```

The outer frame uses the viewport height and clips document-level overflow, so
the shell content is the intended vertical owner rather than the page or body
(`apps/github.io/src/app/global-navigation-layout.tsx:34`). A route such as
Roadmap then renders one full-width semantic main with its own spacing and
content, but no page-local scroll container
(`apps/github.io/src/app/devops-roadmap/roadmap-page.tsx:12`). Nested horizontal
components, such as the skills carousel, can retain their independent axis.

### Apply wide page frames to the existing owner

When routed content needs a maximum width on wide screens, apply that style to
the existing shell `LayoutContent` rather than adding a wrapper around its
`Outlet`. The direct child relationship between `LayoutContent` and each routed
page's semantic `main` is part of the browser verifier's scroll-owner contract:
it selects `.astryx-layout-content:has(> main)`
(`apps/github.io/scripts/verify-mobile-layout-browser.mjs:19`). A wrapper
between those elements makes the intended owner invisible to that selector.

Keep the global `LayoutHeader` outside this cap so navigation continues to span
the shell. The content owner can carry the frame directly through `xstyle`:

```tsx
const styles = stylex.create({
  pageContent: {
    width: '100%',
    maxWidth: '1440px',
    marginInline: 'auto',
  },
});

<LayoutContent ref={contentRef} padding={0} xstyle={styles.pageContent}>
  <Outlet />
  <GlobalNavigationFooter />
</LayoutContent>
```

This keeps one DOM and scroll owner while constraining routed content and the
global footer. The compiled-layout verifier protects the style's width, cap,
centering, and compiled `xstyle` binding
(`apps/github.io/scripts/verify-global-layout-css.mjs:1035-1046`).

### Reset the reused owner before a new route paints

Because React Router swaps the outlet while retaining the shell, reset the
shell element when `location.pathname` changes. A layout effect applies the new
route's initial position before paint (`apps/github.io/src/app/global-navigation-layout.tsx:53`,
`apps/github.io/src/app/global-navigation-layout.tsx:80`):

```tsx
useLayoutEffect(() => {
  if (contentRef.current) {
    contentRef.current.scrollTop = 0;
  }
}, [location.pathname]);
```

A focused integration test first sets a nonzero shell offset, follows the real
Roadmap link, observes the new pathname, and requires the original shell
element reference to be back at zero
(`apps/github.io/src/app/global-navigation-layout.spec.tsx:524-541`).

### Give Storybook exactly one routing owner

The preview decorator owns `MemoryRouter`. Routed application stories provide
an `appRoute` initial entry and render the production route tree directly;
isolated component stories continue through the smaller `StoryRoutes` harness
(`apps/github.io/.storybook/preview.ts:13`). This preserves production route
ownership without rendering a Router inside another Router.

### Prove structure and runtime behavior separately

The static audit resolves local aliases for `Layout`, `LayoutContent`, and
`Outlet`, then inspects only the exported `GlobalNavigationLayout` function's
returned tree. It requires exactly one `Layout`, requires its `content` root to
be the sole `LayoutContent`, and requires that owner to contain the routed
outlet (`apps/github.io/scripts/verify-global-layout-css.mjs:563`). Page audits
reject imported `LayoutContent` aliases and require exactly one returned
semantic main (`apps/github.io/scripts/verify-global-layout-css.mjs:353`).

This fail-closed AST shape matters: raw text counts can be fooled by an aliased
page owner, an off-shell owner, or unused valid-looking JSX. Negative fixtures
must keep those realistic mutations failing.

The Firefox verifier complements the source audit by finding the active
overflow containers in the rendered document and requiring the shell to be the
sole vertical owner. For route-reset coverage it scrolls the shell, plants a
random sentinel on the current document, activates the real navigation link
with pointer input, and requires both a zero destination offset and the same
sentinel (`apps/github.io/scripts/verify-mobile-layout-browser.mjs:1069`,
`apps/github.io/scripts/verify-mobile-layout-browser.mjs:1090`). The sentinel
prevents a full reload—which also starts at zero—from masquerading as a valid
SPA transition.

## Why This Matters

Scroll ownership is an architectural containment contract. A persistent frame
and its routes cannot both assume responsibility for vertical overflow without
creating clipped or nested scrolling. Keeping that responsibility in one shell
lets every routed page move beneath the same navigation and keeps page markup
focused on semantics.

Persistence also creates state. React Router retains the shell while replacing
its outlet, so correct ownership alone does not guarantee the correct starting
position for the next route. Resetting on pathname changes makes the retained
element behave like a fresh page without discarding the shell.

The layered verification protects different failure modes: component tests
prove the navigation-triggered state change, AST checks prove source ownership
even through aliases and decoys, and Firefox proves actual overflow, pointer
navigation, document continuity, and visible scroll position.

## When to Apply

- Multiple routes render beneath persistent navigation or another retained
  application frame.
- A page appears clipped, pinned, or unscrollable inside a height-constrained
  shell.
- A newly selected route inherits the previous route's scroll position.
- Storybook needs to render production routes as well as isolated components.
- Layout correctness depends on overflow and DOM persistence that jsdom cannot
  model.
- Routed content needs a desktop width cap while global navigation remains
  full-width.

## Examples

Avoid route-local ownership inside an already scrollable shell:

```tsx
function RoadmapPage() {
  return (
    <LayoutContent isScrollable>
      <main>{/* route content */}</main>
    </LayoutContent>
  );
}
```

Prefer a semantic route root beneath the shared outlet owner:

```tsx
function RoadmapPage() {
  return <VStack as="main">{/* route content */}</VStack>;
}
```

Avoid introducing a centering wrapper between the shell owner and its route:

```tsx
<LayoutContent padding={0}>
  <div className="page-frame">
    <Outlet />
  </div>
</LayoutContent>
```

Prefer applying the page-frame style to `LayoutContent` itself, retaining the
direct `LayoutContent` → routed `main` relationship.

For browser verification, URL and zero offset are insufficient on their own.
Require a value stored on the original document to survive the pointer-driven
transition before accepting the scroll reset.

## Related

- [Mirror Route Ownership in Mobile Storybook Pages](mirror-app-shell-ownership-in-mobile-storybook-pages.md)
- [Keep Skill Navigation Route-Authoritative](keep-skill-selection-transition-in-app-shell.md)
- [Verify Storybook From Linked Worktrees](../workflow-issues/verify-storybook-from-linked-worktree.md)
