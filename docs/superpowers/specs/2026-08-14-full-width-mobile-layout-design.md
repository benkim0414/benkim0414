# Full-Width Mobile Layout Design

## Goal

Make the application fill the complete viewport width at every viewport size while retaining its existing mobile-first, single-column interface. Tablet and desktop layouts will be redesigned separately later.

## Product Decisions

- Home, Skills, and skill-detail pages use `width: 100%` at every viewport size.
- The global navigation spans the complete viewport width.
- Remove the global 448 px maximum width and automatic horizontal centering constraint.
- Preserve the current mobile UI composition even when viewed on iPad or desktop.
- Do not add responsive breakpoints, alternate tablet/desktop structures, or width-specific content constraints.
- Preserve the existing `100dvh` frame and one page-owned scroll region beneath the persistent navigation.

## Architecture

The route-level `GlobalNavigationLayout` remains the sole application frame. Its emitted StyleX frame rules will continue to provide full viewport height, clipped outer overflow, and full width, but will no longer publish a maximum width or centered inline margins.

Page components remain unchanged unless a page contains an independent maximum-width rule that prevents it from filling the global frame. The Home, Skills, and detail surfaces retain their present Astryx layouts, mobile spacing, single-column flow, carousel behavior, list rows, breadcrumbs, and search navigation.

## Layout Behavior

- Frame width: `100%`.
- Frame maximum width: none.
- Frame inline margins: no centering margins.
- Frame height: exactly `100dvh`, without a conflicting `100vh` minimum.
- Outer overflow: clipped or hidden according to the existing emitted StyleX frame rule.
- Inner scrolling: owned by the active page's Astryx `LayoutContent` or documented page scroll region.
- Navigation: persistent, heading-free, full width, and identical across supported routes.

Large screens intentionally receive the same mobile-first presentation stretched to the available width. This is a temporary product choice, not an attempt at responsive desktop design.

## Testing and Validation

- Update global-frame tests to require full width and reject the former 448 px maximum-width contract.
- Update the production CSS verifier to prove the wired global frame emits `width: 100%`, `height: 100dvh`, and outer overflow containment.
- Make the verifier fail if the global frame regains `max-width: 448px`, `margin-inline: auto`, or `min-height: 100vh`.
- Preserve route, global navigation, search, landmark, carousel, skill-list, avatar-size, detail, and scroll-ownership tests.
- Run focused tests, the full `github.io` test suite, lint, production build, Storybook build, and compiled layout-CSS verification.
- Review Home, Skills, and skill detail on iPad in portrait and landscape over Tailscale, confirming full-width rendering, persistent navigation, no horizontal overflow, and no nested-scroll trap.

## Out of Scope

- Tablet-specific or desktop-specific layouts.
- Responsive breakpoints.
- Multi-column page content.
- New maximum widths on page sections or detail content.
- Changes to navigation, search results, routes, content, avatar sizing, spacing tokens, typography, or component variants.

## Risks

- A page-local maximum-width rule could silently preserve the old narrow appearance after the frame constraint is removed. Source inspection and iPad QA must cover every supported route.
- Removing centering must not disturb Astryx `Layout` slot sizing or reintroduce document scrolling.
- Unit tests that inspect source class names can false-pass when styles are not emitted, so the compiled CSS verifier remains a required validation gate.
