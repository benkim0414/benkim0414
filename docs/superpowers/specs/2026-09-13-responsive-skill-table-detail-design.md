# Responsive Skill Table Detail Design

## Goal

Use the existing skill table on tablet and desktop while preserving the current card catalog on mobile. Selecting a skill row opens the complete skill detail inside the table experience without navigating away from `/skills`.

## Context

The skills page currently renders a searchable and category-filterable stack of `SkillCard` components at every viewport size. The repository already contains a sortable, filterable `SkillTable`, and the standalone `/skills/:skillId` route resolves and renders complete skill details.

The target interaction follows the Astryx filterable-table master-detail template:

- desktop uses a resizable end panel with independent scrolling;
- tablet uses an overlay drawer so the table and detail are not compressed;
- mobile retains the existing card flow and detail-route navigation.

## Responsive Presentation

The page has one catalog state and two responsive presentations:

- Mobile renders the existing skill cards. Selecting a card continues to navigate to `/skills/:skillId`.
- Tablet and desktop render `SkillTable` instead of cards.
- The switch occurs at the application's Astryx tablet breakpoint rather than through a hardcoded device width.

Search text and category filters are owned by `SkillsPage` and shared by both presentations. Changing viewport size therefore preserves the current query, selected categories, and filtered result set. Table sorting remains table-specific state.

## Table Selection and Detail Behavior

On tablet and desktop, selecting a row:

1. stores the skill ID as temporary state owned by `SkillsPage`;
2. visually marks the selected row;
3. resolves the skill's complete detail from the existing canonical sources;
4. opens the detail surface without changing `/skills` or adding URL state.

Selecting another row replaces the open detail in place. The drawer or panel closes through its close control or Escape. After dismissal, focus returns to the selected row. If filtering removes the selected row from the visible collection, the detail closes and the selection is cleared.

Because selection is intentionally temporary, refresh, direct linking, and browser history do not preserve an open detail. The existing `/skills/:skillId` route remains the shareable full-page experience.

## Desktop and Tablet Layout

Desktop follows the Astryx filterable-table template: the table occupies the content region and the selected detail occupies a resizable end panel. The panel has a fixed initial width budget, is separated from the table by the template's resize handle/divider, and scrolls independently when the detail is long.

Tablet uses the same detail content in an overlay drawer anchored to the end edge of the table region. The drawer obscures part of the table while open rather than shrinking its columns. Closing it restores the unchanged table and its scroll position.

The implementation uses the public Astryx layout, table, drawer/panel, and responsive APIs demonstrated by the installed version's official documentation and template. It does not recreate the master-detail mechanics with custom overlays or hardcoded dimensions.

## Component Boundaries

### `SkillsPage`

Owns search text, selected categories, the filtered skill collection, and the temporary selected skill ID. It chooses the mobile or table presentation with Astryx responsive behavior and resolves the selected detail from canonical application sources.

### `SkillTable`

Renders the tablet/desktop toolbar and sorted rows. It receives shared filter values and change handlers, the selected skill ID, and a row-selection handler. It owns only table-specific sorting state.

### `SkillDetailContent`

Contains the reusable detail body: metadata, certifications, experience narratives, evidence, and projects. It does not own route chrome or master-detail layout.

### `SkillDetailPage`

Remains the standalone route presentation. It wraps `SkillDetailContent` with breadcrumbs, page-level semantics, padding, and route-specific focus behavior.

### Skill detail panel

Owns drawer/panel chrome, close behavior, independent scrolling, responsive overlay versus end-panel presentation, and focus restoration. It renders `SkillDetailContent` for the resolved selection.

## Data Flow and Failure Handling

No new data model is introduced. The drawer uses `resolveSkillDetail` with the same skills, detail records, evidence, projects, and experiences used by `SkillDetailRoute`.

The selected ID is always checked against the current visible collection. A missing or no-longer-visible selection is cleared. If resolution unexpectedly returns `not-found`, the detail surface closes instead of rendering stale, empty, or partial content. Existing resolver integrity errors remain explicit programming errors rather than being silently swallowed.

## Accessibility

- Rows expose an operable selection affordance through the supported Astryx table interaction API.
- Selection is visually and semantically indicated.
- Keyboard users can open a detail from a row, dismiss it with Escape or the labeled close control, and regain focus on the originating row.
- The detail surface has an accessible name based on the selected skill.
- The panel and table retain independent, predictable scrolling.
- The mobile card links preserve their current accessible navigation behavior.

## Testing and Visual Validation

Focused component tests will cover:

- cards on mobile and the table at tablet/desktop breakpoints;
- shared search and category filters across both presentations;
- table sorting after filter state is lifted;
- opening, replacing, and closing a selected skill;
- unchanged `/skills` URL during selection;
- complete metadata, experience, evidence, and project content in the detail surface;
- Escape dismissal and focus restoration;
- clearing selection when filters remove the selected row;
- safe behavior for an unresolved selected ID;
- unchanged standalone `/skills/:skillId` behavior after detail extraction.

Storybook will include a desktop table with an open end panel and a tablet table with an open overlay drawer. Visual QA will check both viewports plus mobile, including long detail scrolling, table preservation, clipping, overlap, and focus visibility.

Relevant verification commands are:

- `pnpm nx test github.io`
- `pnpm nx lint github.io`
- `pnpm nx build github.io`
- focused Storybook and browser checks at mobile, tablet, and desktop widths

## Implementation Boundaries

In scope:

- responsive cards-versus-table presentation;
- shared catalog filters;
- temporary table selection;
- Astryx template-aligned end panel and tablet overlay;
- reuse of the complete existing skill detail;
- focused tests and stories.

Out of scope:

- URL or query-parameter persistence for table selection;
- changing the standalone detail route's public URL;
- redesigning skill content or adding new skill data;
- saved views, grouping, pagination, bulk selection, or other unrelated capabilities from the full Astryx filterable-table template;
- new dependencies or styling systems.
