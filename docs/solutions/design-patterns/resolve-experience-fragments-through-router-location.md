---
title: Resolve Experience Fragments Through Router Location
date: 2026-09-15
category: design-patterns
module: github.io skill detail navigation
problem_type: design_pattern
component: frontend
severity: medium
applies_when:
  - An inspector entry links to a fragment-addressable skill-detail card
  - The same detail component runs in BrowserRouter and Storybook MemoryRouter
tags: [github-io, skill-detail, experience, react-router, storybook, fragments]
---

# Resolve Experience Fragments Through Router Location

## Context

The skills-table inspector is a compact projection of the richer skill detail
surface. Its skill-experience `Item` rows link to the canonical skill URL with
an `#experience-<id>` fragment, while the standalone card uses that identifier
as its anchor (`apps/github.io/src/app/skills/skill-experience-card-shell.tsx:149-153`).

Reading `window.location.hash` in the routed detail page focused the wrong
location source in Storybook: its preview supplies a `MemoryRouter`, whose
location state is not required to update the browser global. The component also
renders directly in isolated tests, so it needs a deliberate non-router
fallback.

## Guidance

When router context exists, treat React Router's location as the authoritative
fragment source. Keep the router hook in a routed wrapper and pass its `hash`
to a renderable detail component; only the no-router branch should read
`window.location.hash` (`apps/github.io/src/app/skills/skill-detail-page.tsx:46-62`).

Resolve a supported experience fragment after cards mount. The skill detail
page strips the leading `#`, obtains the card by ID, scrolls it into view, and
focuses it; unknown fragments preserve the normal heading focus
(`apps/github.io/src/app/skills/skill-detail-page.tsx:83-95`). Make the target
card programmatically focusable with `tabIndex={-1}` so the navigation does not
add each card to the ordinary tab sequence
(`apps/github.io/src/app/skills/skill-experience-card-shell.tsx:149-153`).

```tsx
function RoutedSkillDetailPage({ detail }: SkillDetailPageProps) {
  const { hash } = useLocation();
  return <SkillDetailPageContent detail={detail} hash={hash} />;
}

useEffect(() => {
  if (hash.startsWith('#experience-')) {
    const target = document.getElementById(hash.slice(1));
    if (target instanceof HTMLElement) {
      target.scrollIntoView?.({ block: 'start' });
      target.focus();
      return;
    }
  }
  headingRef.current?.focus();
}, [detail.skill.id, hash]);
```

## Why This Matters

The inspector intentionally omits the standalone card's narrative and detailed
content. Its row is therefore a deep link to the matching full record, not a
local disclosure. Router-owned fragments preserve that link in both the app's
browser router and Storybook's memory-backed preview without confusing router
state with the document global.

Moving focus after scrolling gives keyboard and assistive-technology users a
clear destination. The fallback heading focus retains predictable behavior for
initial page loads and unrecognized fragments.

## When to Apply

- A compact list or inspector links to an exact record in a richer routed page.
- A component is rendered under both a production router and `MemoryRouter` in
  Storybook or tests.
- Fragment navigation must move focus to a card without changing normal tab
  order.

## Examples

Seed fragment tests through the router rather than by mutating the browser
global:

```tsx
render(
  <MemoryRouter initialEntries={[`/skills/kubernetes#experience-${experience.id}`]}>
    <SkillDetailPage detail={detail} />
  </MemoryRouter>,
);

expect(experienceCard).toBe(document.activeElement);
```

The focused test lives at
`apps/github.io/src/app/skills/skill-detail-page.spec.tsx:506-519`.

## Related

- [Verify In-Page Navigation Against Shell Scroll Ownership](verify-in-page-navigation-against-shell-scroll-ownership.md)
- [Mirror Route Ownership in Mobile Storybook Pages](mirror-app-shell-ownership-in-mobile-storybook-pages.md)
- [Keep Skill Selection Transition in App Shell](keep-skill-selection-transition-in-app-shell.md)
