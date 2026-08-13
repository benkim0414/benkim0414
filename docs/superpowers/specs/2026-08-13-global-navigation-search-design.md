# Global Navigation Search Design

## Goal

Provide one consistent, heading-free Astryx top navigation bar across the Home, Skills, and skill-detail surfaces. The navigation owns a global command palette whose first and only searchable result group is Skills, while leaving a clear extension point for certifications, projects, and other site content later.

## Product Decisions

- The top navigation is visually identical on Home, Skills, and skill-detail pages.
- The navigation has no contextual or product heading.
- The search icon and command palette are available on every supported surface.
- Search covers skills only in this change.
- Selecting a skill navigates to `/skills/:skillId` through React Router.
- Certifications, projects, and other entities are explicitly out of scope for current search results.
- Unknown/not-found routes do not need the global navigation.

## Architecture

`AppRoutes` will use a shared route-level application frame for `/`, `/skills`, and `/skills/:skillId`. The frame owns the Astryx `TopNav`, search-button state, command palette, and result navigation. Routed page content renders beneath that shared navigation.

The global search model will describe results in generic navigation terms: stable ID, label, destination, searchable keywords, and group metadata. A skills adapter will produce the initial `Skills` group from the canonical skill catalog. This keeps the global frame independent of the `Skill` domain type and permits later result groups without changing Home, Skills, or detail page components.

## Component Boundaries

### Global navigation frame

- Renders the centered, mobile-width application shell and one heading-free Astryx `TopNav`.
- Renders the existing Astryx search icon button and command palette.
- Owns palette open/close and selected-result state.
- Navigates selected results using React Router rather than page-local callbacks.
- Renders the active child route below the persistent top bar.

### Search result source

- Converts canonical skills into generic command results.
- Preserves skill-name, description, category, and keyword matching.
- Identifies results as members of the `Skills` group.
- Supplies `/skills/:skillId` destinations.
- Does not introduce certification or project data yet.

### Page components

- `HomePage`, `SkillsPage`, and `SkillDetailPage` own page content only.
- They no longer render top navigation or own command-palette state.
- Existing page headings, breadcrumbs, lists, carousel content, and scroll behavior remain intact.
- The route-level frame supplies the single shared navigation without duplication.

## Layout and Interaction

- Continue using Astryx components first: `TopNav`, `IconButton`, `Icon`, `CommandPalette`, and `CommandPaletteInput`.
- Preserve the current centered `max-w-md`, full-height application presentation.
- Keep the navigation outside the page scroll region so it remains visible.
- Keep the search button accessible as `Search skills` while skills are the only result type.
- Opening, dismissing, empty results, and keyboard interaction retain the current Astryx command-palette behavior.

## Routing and State

- `/`, `/skills`, and `/skills/:skillId` share the global frame.
- A selected search result closes through the palette interaction and navigates to its stored destination.
- Direct navigation and browser history continue to resolve through `AppRoutes`.
- The existing Home-only selected-skill state is removed in favor of URL-backed navigation.
- Unknown routes continue to render the existing not-found surface outside the shared frame.

## Testing and Validation

- Assert exactly one global navigation on Home, Skills, and a valid skill-detail route.
- Assert each surface exposes the same heading-free `Search skills` action.
- Assert opening search and choosing a skill navigates to the correct detail URL.
- Assert search still matches skill descriptions, categories, and keywords.
- Assert the generic result/source model is not coupled to `Skill` and preserves the `Skills` group.
- Assert page content, headings, list routes, breadcrumbs, and Home carousel behavior remain unchanged.
- Run focused Vitest coverage, the full `github.io` suite, lint, production build, and Storybook build.
- Perform browser QA at iPad dimensions over the available Tailscale-hosted app when tooling permits.

## Out of Scope

- Searching certifications, projects, DORA capabilities, or other entity types.
- A visible nav title, contextual heading, logo, back button, or additional global actions.
- Changes to result ranking beyond preserving current skill matching.
- Changes to skill-list avatar sizing or detail-page content.

## Risks

- Moving layout ownership upward can accidentally introduce nested height or scroll containers. Tests and visual QA must confirm a single page scroll region beneath the persistent nav.
- Route navigation replaces Home's local detail state, so tests must cover search selection and browser-history-compatible URLs.
- A supposedly generic result contract could still leak skill-specific assumptions. Type-level boundaries and focused tests should keep the frame domain-neutral.
