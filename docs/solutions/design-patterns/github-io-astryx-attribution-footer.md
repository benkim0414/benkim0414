---
title: GitHub.io React and Astryx Attribution Footer
date: 2026-08-28
last_updated: 2026-09-08
category: design-patterns
module: apps/github.io global navigation shell
problem_type: design_pattern
component: global-navigation-layout
severity: low
applies_when:
  - Adding persistent footer attribution to the github.io app shell
  - Adding a React mark to the existing Astryx attribution
  - Linking a personal GitHub profile from the portfolio footer
  - Reusing the Astryx docsite mark as a compact product attribution
  - Optically balancing inline brand marks without changing their layout slot
  - Displaying the app package version beside the footer attribution
related_components:
  - github.io GlobalNavigationLayout
  - React logo mark
  - Astryx logo mark
  - React Router
  - GitHub profile link
tags:
  - github-io
  - footer
  - attribution
  - astryx
  - react
  - accessibility
  - external-links
  - optical-scaling
---

# GitHub.io React and Astryx Attribution Footer

## Context

The github.io app needs a compact site footer that says "Built with [React]
and [Astryx] by @benkim0414", with `@benkim0414` linking to the public GitHub
profile. Each logo links to the corresponding technology site. The app already
uses Astryx, React Router, a persistent `GlobalNavigationLayout`, and an
Astryx `LayoutContent` scroll owner. The footer also exposes the app package's
semantic version as compact technical metadata.

## Primary Source Findings

Use a semantic `footer` for this attribution. The HTML Standard defines
`footer` as footer content for the nearest sectioning ancestor, or for the page
when there is no nearer sectioning ancestor, and describes footer content as a
natural place for authorship, copyright, and related-document links:
https://html.spec.whatwg.org/multipage/sections.html#the-footer-element. MDN
matches that guidance and notes that `footer` does not create a new document
section:
https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/footer.

Keep it page-level and do not nest it under `main`, `section`, `article`,
`aside`, or `nav` if it should behave as the single page footer landmark. WAI
ARIA APG says `footer` defines a `contentinfo` landmark only when it is in the
body context, and recommends one top-level `contentinfo` landmark per page:
https://www.w3.org/WAI/ARIA/apg/practices/landmark-regions/.

Make the GitHub profile link purpose clear from text or adjacent sentence
context. WCAG 2.4.4 requires each link's purpose to be determinable from the
link text or programmatically related context, and says preceding context is
most usable:
https://www.w3.org/WAI/WCAG22/Understanding/link-purpose-in-context.
`Built with React and Astryx by @benkim0414` gives enough sentence context for the
`@benkim0414` link. Do not override a meaningful visible text link with a
separate accessible label unless the visible text is actually absent, as it
makes assistive technology announce a different phrase from the one sighted
users see.

Avoid forcing links to open in a new tab unless the product explicitly wants
external-link behavior. WAI techniques recommend avoiding new windows unless
necessary, and warning users when a new window is opened:
https://www.w3.org/WAI/WCAG21/Techniques/general/G200 and
https://www.w3.org/WAI/WCAG21/Techniques/general/G201. If the Astryx `Link`
uses `isExternalLink`, Astryx sets `target="_blank"`, adds `rel="noopener
noreferrer"`, and appends screen-reader text announcing the new tab.

The implemented footer mark uses an inline SVG with `viewBox="0 0 40 40"`,
`fill="currentColor"`, `role="img"`, and `aria-label="Astryx"`, matching the
compact logo shape selected from the Astryx docs toolbar. The Astryx docsite
source sets the toolbar `AstryxIcon` color to `var(--color-brand)`. In the
source theme, `--color-brand` maps to `BRAND_BLUE`, whose light value is
`#225BFF`; keep that as a local brand-logo color rather than substituting an app
theme accent token. The installed `@astryxdesign/core`
package is MIT-licensed and describes itself as accessible, themeable React
components.

## Recommendation

Render one compact attribution footer in `GlobalNavigationLayout`, after the
routed page content inside the shared app shell. Use a real `footer` element,
small text, theme tokens, and a two-region flex layout configured to wrap on
narrow viewports. Put the package-derived version in the leading region and
keep the attribution end-aligned.

Prefer this accessible text model:

- Visible text: `Built with [React logo] and [Astryx logo] by @benkim0414`
- App version: `v${version}` from `apps/github.io/package.json`, rendered as
  Astryx `Code` inside supporting `Text`
- React logo accessible name: `React`, because the logo replaces the visible
  word "React"
- React logo link target: `https://react.dev`
- React logo color: the official React cyan, `#61DAFB`
- Astryx logo accessible name: `Astryx`, because the logo replaces the visible
  word "Astryx"
- Astryx logo link target: `https://astryx.atmeta.com`
- Astryx logo color: the official rendered logo blue, `#225BFF`
- GitHub link visible text: `@benkim0414`
- GitHub link accessible name: the visible handle plus Astryx's external-link
  announcement when `isExternalLink` is used
- Link behavior: Astryx `Link` with `isExternalLink` and `isStandalone` when
  the design intentionally wants visible external-link treatment; use a plain
  new-tab Astryx `Link` for the logo when the footer should remain logo-only
  without an appended external-link icon

Avoid adding a large branded footer, copyright block, social-link cluster, or
secondary navigation. The app already has a focused top navigation and the
footer's job is attribution, not discovery.

## Implementation Notes

Keep the footer owned by `GlobalNavigationLayout` so all routed pages get one
consistent footer and pages do not have to duplicate attribution. Preserve the
existing `LayoutContent` scroll-owner model: the footer should live in the same
scrolling content flow as the routed page, without introducing a second vertical
scroll container.

Import `version` from the app's `package.json` so the manifest updated by
Changesets remains the single source of the displayed value. Render it with
Astryx `Code` inside `Text type="supporting"`; set `size="inherit"` and
`color="inherit"` explicitly because `Code` otherwise uses its own code-size
and primary-color defaults.
Keep the outer footer wrapping with `justifyContent: 'space-between'`, and give
the attribution group `marginInlineStart: 'auto'` so it stays end-aligned both
beside the version and after wrapping.

Implement the React mark as a local `ReactLogo` component using the installed
`simple-icons` `siReact.path`. Keep `fill="currentColor"`, `height="1em"`, and
`width="1em"` so its layout slot tracks footer typography. Apply
`transform: scale(1.1)` only to the React SVG when it needs to match Astryx's
optical weight; the transform changes the visible mark without changing the
allocated 1em slot. Set its color to `#61DAFB`, and wrap it in an Astryx `Link`
to `https://react.dev` with the accessible name `React`.

Keep the Astryx mark as a small local `AstryxLogo` component using the official
inline SVG path, with its existing `#225BFF` color and `https://astryx.atmeta.com`
link. Neither product mark needs visible text when its link and SVG expose the
appropriate accessible name.

Test that the footer renders once, uses the `contentinfo` role through the
semantic footer, includes both accessible logo names, and links to
`https://react.dev`, `https://astryx.atmeta.com`, and
`https://github.com/benkim0414`. Assert that React precedes Astryx, that the
visible conjunction is present, and that React retains its cyan color and
`scale(1.1)` transform. Also assert that the package version is a semantic
`code` element in the footer's leading region, precedes the attribution, and
inherits a supporting-text boundary. Keep the GitHub handle typography aligned
with the footer copy and do not add a second `LayoutContent`. Run the focused
footer, Storybook route, and layout tests, then build the app and Storybook when
the shell structure changes.
