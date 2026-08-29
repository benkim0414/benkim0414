---
title: Use a Session-Aware Accessible Home Greeting
date: 2026-08-29
category: design-patterns
module: apps/github.io home page and Storybook
problem_type: design_pattern
component: frontend
severity: medium
applies_when:
  - "Adding a short, progressive welcome sequence to the github.io home page"
  - "Using session-scoped client state to avoid replaying nonessential page animation"
  - "Providing a complete conversational greeting immediately for reduced-motion users"
  - "Exercising a timed isolated component interaction in Storybook"
related_components:
  - HomePage
  - HomeGreeting
  - Astryx Chat
  - Astryx Card
  - Astryx Markdown
  - Astryx Link
  - Storybook preview routing
tags:
  - github-io
  - home-page
  - home-greeting
  - astryx
  - accessibility
  - reduced-motion
  - session-storage
  - storybook
---

# Use a Session-Aware Accessible Home Greeting

## Context

A home-page introduction should feel personal without competing with the skills
and delivery evidence below it. The `HomeGreeting` is a contained conversation
at the start of `HomePage`, directly after the visually hidden page title
(`apps/github.io/src/app/skills/home-page.tsx:28-33`).

The progressive treatment must be additive. Visitors who prefer reduced motion
or have already seen the greeting in the browser session receive the complete,
accessible conversation immediately.

## Guidance

Use Astryx conversation primitives for the message container and bubbles, then
keep the state boundary inside a small page-local component. `HomeGreeting`
uses `Card`, `ChatMessageList`, `ChatMessage`, `ChatMessageBubble`, `Avatar`,
and `Text` rather than recreating chat anatomy (`apps/github.io/src/app/skills/home-greeting.tsx:133-171`).

Make the displayed message count the source of truth. A first non-preview
render starts at zero messages only when reduced motion is not requested and
the `home-greeting-seen` session marker is absent. Reduced-motion and
already-seen states begin with all three messages; preview is the separate
replay case (`apps/github.io/src/app/skills/home-greeting.tsx:65-73`).
The effect records the marker and reveals messages at explicit 0, 450, and
1,050 ms delays, cleaning up its timers on unmount (`apps/github.io/src/app/skills/home-greeting.tsx:110-123`).

Use Markdown for the list structure but provide Astryx `Link` as Markdown's
link component. That keeps the message compact while preserving the app's
link styling and routing integration (`apps/github.io/src/app/skills/home-greeting.tsx:98-108`,
`apps/github.io/src/app/skills/home-greeting.tsx:160-167`). Intercept only the
known DORA fragment and scroll its matching heading; ordinary route links keep
their normal behavior (`apps/github.io/src/app/skills/home-greeting.tsx:75-97`).

Give the component an `isPreview` escape hatch so its isolated Storybook story
can replay the first-visit sequence regardless of session storage while still
respecting reduced motion
(`apps/github.io/src/app/skills/home-greeting.stories.tsx:16-20`).

## Why This Matters

Rendering the complete content for reduced-motion and repeat-session states
means animation never withholds the greeting, its two capability links, or its
semantic region. The receive effect changes only opacity and vertical
translation, using token-based duration and easing
(`apps/github.io/src/app/skills/home-greeting.tsx:34-56`).

Session-scoping avoids repeated interruptions while keeping the first visit
welcoming. Preview mode makes the Storybook canvas deterministic instead of
depending on ambient browser-session state.

## When to Apply

- A landing page benefits from a concise relationship-building introduction.
- The content fits a small ordered set of messages.
- Motion is useful as a first-visit cue but all meaning must remain available
  without it.
- The component needs a standalone Storybook example that demonstrates timed
  state.

## Examples

The excerpts assume the surrounding component state and imports.

Keep the state decision explicit:

```tsx
const [shouldAnimate] = useState(
  () =>
    !reducedMotion &&
    (isPreview || sessionStorage.getItem(greetingSessionKey) !== 'true'),
);
const [visibleMessageCount, setVisibleMessageCount] = useState(
  shouldAnimate ? 0 : 3,
);
```

Delegate Markdown navigation to Astryx `Link` while retaining the special
same-page behavior:

```tsx
const GreetingMarkdownLink = ({href, children}: {
  href: string;
  children: ReactNode;
}) => (
  <Link href={href} onClick={(event) => handleMarkdownLinkClick(href, event)}>
    {children}
  </Link>
);

const greetingMessage = '- Capability link labels are written in Markdown.';

<Markdown components={{link: GreetingMarkdownLink}} density="compact">
  {greetingMessage}
</Markdown>
```

## Related

- [Verify Astryx Component API Contracts Before Styling](../best-practices/astryx-component-api-contracts.md)
- [Keep Routed Pages Under One Shell Scroll Owner](keep-home-sections-under-one-page-scroll-owner.md)
- [Mirror Route Ownership in Mobile Storybook Pages](mirror-app-shell-ownership-in-mobile-storybook-pages.md)
