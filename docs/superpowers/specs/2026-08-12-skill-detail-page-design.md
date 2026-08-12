# Skill Detail Page Design

Date: 2026-08-12

## Summary

Add a dedicated, shareable skill detail page to the `github.io` portfolio app.
The page will use Kubernetes as the first fully authored example and give every
existing skill a valid basic detail view. It will follow Astryx design guidance
first and use Material Design 3 only where Astryx has no applicable guidance.

## Goals

- Support clean skill URLs such as `/skills/kubernetes`.
- Present the skill name, category badges, rating, description, authored usage
  narrative, supporting experience, related projects, and certifications when
  those records exist.
- Make Kubernetes the first complete detail-page example.
- Let all other current skills render useful basic detail pages from existing
  skill data without placeholder narratives.
- Preserve a clear editorial reading flow on phones, iPads, and desktops.
- Reuse existing public-safe evidence, project, skill category, rating, and
  certification records.
- Keep the current skills page behavior unchanged.

## Non-Goals

- Do not make `SkillCard`, `SkillCardList`, or skill list items link to the new
  page.
- Do not change command-palette selection or navigation behavior.
- Do not redesign the mobile skills page.
- Do not author enriched narratives for every skill in this pass.
- Do not add tabs, a desktop facts rail, editing controls, or content-management
  infrastructure.
- Do not redesign existing project or certification components.
- Do not deploy or otherwise change GitHub Pages repository settings.

The list-to-detail navigation surfaces are intentionally excluded because the
mobile skills page is being modified in parallel. They can adopt the new route
in a later change.

## Approved Visual Direction

Use an editorial evidence flow in one centered reading column:

1. Breadcrumbs
2. Skill title and categories
3. Rating and overview description
4. Authored "How I've used this skill" narrative
5. Supporting experience rows
6. Related projects
7. Certifications, when present

The content is full-width within phone padding. On iPad and desktop viewports,
it grows to a comfortable article width and remains centered rather than
staying constrained to the existing phone-width canvas. The exact maximum
width must use an existing Astryx layout capability or semantic spacing-backed
local style selected during implementation; it must preserve readable line
length rather than fill the viewport.

Experience entries render as restrained rows separated by dividers. They are
not wrapped in individual cards. A project may use the existing `ProjectCard`
because it is a self-contained linked portfolio object. Cards must not be
nested.

## Routing Architecture

Add `react-router-dom` as the client-side router with these routes:

- `/` renders the existing skills page.
- `/skills/:skillId` resolves the ID against the existing skill collection and
  renders `SkillDetailPage`.
- Any unknown path or unknown skill ID renders a friendly not-found view with a
  normal link back to `/`.

Use the existing skill `id` as the canonical route segment. Do not introduce a
second slug field.

Add a GitHub Pages single-page-app fallback so direct visits to clean skill URLs
are restored to their original path before the React app resolves the route.
The fallback must remain within built application assets; this feature does not
authorize deployment or repository-setting changes. Route restoration must be
covered by a focused test or deterministic build-artifact check.

The detail page may include a breadcrumb link back to `/`. It must not modify
cards, list items, or command-palette results to create inbound links.

## Data Model

Keep the existing `Skill` interface focused on the summary information already
used by lists and cards. Add a separate detail record keyed by skill ID.

The detail record contains:

- `skillId`: an existing `Skill.id`.
- `experienceSummary`: the authored narrative shown below the overview.
- `experienceEvidenceIds`: explicit IDs of existing public-safe experience
  evidence.
- `projectIds`: explicit IDs of existing project records.

Optional detail-only presentation data may be added only when required by an
approved component contract. The implementation must not duplicate skill name,
description, categories, rating, certifications, evidence summaries, or project
content in the detail record.

Use explicit IDs rather than deriving relationships from display names or
technology labels. Focused integrity tests must verify that every referenced
skill, evidence item, and project exists and that rendered evidence is public
and not marked sensitive.

Kubernetes receives the first complete detail record. Its authored narrative
will summarize experience building and operating Kubernetes delivery platforms,
GitOps environments, and a self-managed homelab. Supporting rows and project
content must come from existing public-safe records rather than newly invented
claims.

If a known skill has no detail record, the page still renders its existing name,
description, categories, rating, and certifications. It omits the experience
and projects sections entirely rather than showing empty headings or placeholder
copy.

## Components and Responsibilities

### Route Composition

The app-level route composition selects either the unchanged skills page, the
skill detail page, or the not-found view. The router owns URL parsing and browser
history. Detail components receive resolved records and do not inspect global
location state.

### `SkillDetailPage`

`SkillDetailPage` owns the document structure and responsive reading column. It
renders:

- Astryx `Breadcrumbs` with `Skills` and the current skill name.
- Astryx `Heading` level 1 for the skill name.
- Existing `SkillCategory` instances for category badges.
- Existing `SkillRating` for the skill level.
- Astryx `Text` for the description and narrative.
- A dedicated experience list when resolved evidence is present.
- Related project content when resolved projects are present.
- Existing certification citations when present.

The page receives a resolved view model. It does not query unrelated data
modules while rendering.

### Detail Resolver

A small pure resolver accepts a skill ID plus the skill, detail, evidence, and
project collections. It returns either:

- a complete view model for a known skill; or
- a not-found result for an unknown skill ID.

It preserves the explicit order of evidence and project IDs from the detail
record. Known skills without enrichment resolve successfully with empty optional
collections.

### Experience List

The experience list renders semantic list or section markup with dividers. Each
row uses the existing evidence title or label and summary. Evidence facts,
metrics, dates, and external proof links remain out of scope unless the existing
Astryx component used during implementation exposes a compact, accessible
pattern without expanding the approved page scope.

## Astryx and MD3 Guidance

Astryx is authoritative for component anatomy, layout, spacing, typography,
color, responsive behavior, and interaction.

Official Astryx guidance checked during design:

- `Badge`: category tags may use non-semantic color variants; badges remain
  read-only and concise.
- `Layout`: decide the page frame and responsive contract first, use rows for
  scannable data, and reserve cards for self-contained objects.
- `Typography`: use semantic `Heading` and `Text` variants without manual font
  sizes or line heights.
- Astryx discovery guidance identifies `Breadcrumbs` as the detail-page
  navigation pattern.

The public Astryx Badge component URL supplied for reference was not reachable
from the development environment, so the installed official Astryx CLI and
package documentation are the component API source of truth. Implementation
must run the relevant Astryx CLI component commands again before using or
modifying each component.

Reuse the existing deterministic `SkillCategory` mapping to Astryx's
non-semantic badge variants. Do not make category badges clickable, introduce
custom category colors, or use semantic status variants.

Use MD3 only if implementation encounters a behavior for which Astryx has no
guidance or component. No such gap is currently identified, so the approved
design contains no custom MD3-derived styling.

## Responsive Contract

- Phone: the detail content fills the available width inside semantic page
  padding; category badges wrap; all content remains in one column.
- iPad: the reading column expands beyond the current phone-width canvas but
  remains centered with readable line length.
- Desktop: the same centered reading column is retained; no side rail or
  multi-column content is introduced.
- All sizes: headings, links, badges, project content, and citations must not
  clip or overlap, and interactive targets must remain touch accessible.

## Accessibility

- Render a semantic `main` landmark for the detail page.
- Render one visible `h1` containing the skill name.
- Use sequential `h2` headings for experience, projects, and certifications
  when those sections exist.
- Give breadcrumb navigation an accessible label.
- Use normal link semantics for breadcrumb, project, citation, and not-found
  navigation.
- Do not use category color as the only source of meaning.
- Do not make badges interactive.
- On client-side detail-route changes, move focus to the page heading when this
  can be done without disrupting initial direct navigation.
- Preserve sufficient readable line length, wrapping, and touch spacing on
  phone and iPad viewports.

## Error Handling

- An unknown skill ID renders the friendly not-found view and never falls back
  to an unrelated skill.
- A known skill without enriched detail data renders the basic page and omits
  absent optional sections.
- Broken explicit references are treated as content-integrity failures in tests
  and development. They must not silently display incorrect evidence or project
  content.
- The GitHub Pages fallback must preserve the requested path and avoid redirect
  loops.

## Testing and Visual QA

Add focused automated coverage for:

- `/skills/kubernetes` renders the visible `h1`, description, category badges,
  rating, authored experience summary, selected evidence, related project, and
  certifications.
- A known non-enriched skill renders a basic detail page without empty
  experience or project headings.
- An unknown skill ID and unknown route render the not-found state with a link
  to Skills.
- The detail resolver preserves explicit record order and distinguishes known
  un-enriched skills from unknown skills.
- Every detail reference resolves to an existing public, non-sensitive evidence
  item or project.
- The existing `/` page still renders without changed card, list-item, or
  command-palette navigation behavior.
- The GitHub Pages direct-route fallback preserves a clean skill path without a
  redirect loop.

Add focused Storybook coverage for:

- the fully enriched Kubernetes detail page;
- a basic detail page with no enriched sections;
- the not-found view if it is implemented as a reusable page component.

Run these repository checks after implementation:

```bash
pnpm nx lint github.io
pnpm nx test github.io
pnpm nx build github.io
pnpm nx build-storybook github.io
```

Perform browser visual checks at representative phone, iPad, and desktop
viewports. Confirm reading width, heading hierarchy, badge wrapping, divider
alignment, link focus treatment, and the absence of clipping or overlap.

## Risks and Mitigations

- **GitHub Pages does not natively fall back clean paths to the SPA.** Keep the
  restoration script small, deterministic, and tested against direct skill
  paths and redirect-loop behavior.
- **Parallel mobile-page work could overlap navigation components.** Do not edit
  skill card, list-item, or command-palette navigation in this scope.
- **Display-name relationship matching can drift.** Store explicit skill,
  evidence, and project IDs and validate them.
- **Detail content can become visually fragmented.** Keep one editorial column,
  render experience as divided rows, and avoid nested cards.
- **Professional experience may expose sensitive facts.** Reuse only evidence
  already marked public and not sensitive, and cover that constraint with data
  integrity tests.
- **Empty enrichment can look unfinished.** Render a complete basic overview and
  omit absent optional sections instead of showing placeholders.

## Handoff Criteria

The implementation is ready for review when:

- clean `/skills/:skillId` routes and direct GitHub Pages visits work;
- Kubernetes renders the approved complete editorial detail view;
- every existing skill renders at least a valid basic detail page;
- unknown IDs render the approved not-found state;
- explicit evidence and project references pass integrity and public-safety
  checks;
- existing card, list-item, command-palette, and mobile skills page behavior is
  unchanged;
- focused tests, lint, build, Storybook build, and responsive visual checks pass
  or any unrelated failures are documented.
