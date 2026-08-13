# Skills Page And Show All Design

## Goal

Add a dedicated, vertically scrolling page that presents every skill, and make
the existing Home page carousel disclose that complete collection through a
right-aligned `Show all` action below the carousel.

The feature must follow Astryx components, component contracts, typography,
layout primitives, and tokens first. Material Design 3 supplies only the
carousel-to-complete-collection pattern that Astryx does not currently define:
a `Show all` action below the carousel that opens a dedicated page containing
all carousel items.

## User Experience

Home continues to show the existing five curated `Top skills` cards. A
low-emphasis `Show all` action appears beneath the carousel, aligned to the
right inside the same padded section. Activating it opens `/skills`.

The Skills page presents the canonical local skill collection as a compact
alphabetical list. Each complete row is a navigation target that opens the
existing `/skills/:skillId` detail route. The page intentionally has no search,
filters, category grouping, or alternate desktop grid.

## Design-System Decision

Use Astryx for all available UI primitives:

- `Button` renders the Home `Show all` link using its supported `href` API,
  `size="sm"`, and low-emphasis `variant="ghost"`.
- `HStack` owns right alignment beneath the carousel.
- `TopNav` and `TopNavHeading` establish the Skills page context.
- `VStack` owns page gutters, vertical rhythm, and the scrollable content
  region.
- `SkillList` continues to compose Astryx `List` and `ListItem`.
- `ListItem` uses its supported `href` API so each row is a semantic link.
- `EmptyState` handles an empty local collection.

Do not introduce a custom link, list row, typography treatment, spacing value,
or color when Astryx already supplies the relevant component or token. Use
StyleX or Astryx-token-backed Tailwind utilities only for page framing that the
component APIs do not express.

The fallback placement follows the [Material Design 3 carousel
guidance](https://m3.material.io/components/carousel/guidelines): the action is
below the carousel rather than beside its heading, and it opens a dedicated
vertically scrolling page of all items.

## Architecture And Routing

Add a route at `/skills` in `AppRoutes`. The route renders `SkillsPage` inside
the neutral Astryx theme, matching the existing skill-detail route boundary.
Keep `/skills/:skillId` as the canonical detail route.

The resulting route hierarchy is:

```text
/
└── Home
    └── Show all → /skills
                      └── skill row → /skills/:skillId
```

Use route-native links rather than adding a Skills page state to `AppShell`.
This preserves refresh, direct-link, browser-history, and open-in-new-tab
behavior and avoids parallel in-memory and URL navigation models.

Update the skill-detail breadcrumb so its `Skills` item points to `/skills`.
The current breadcrumb labels `/` as `Skills`, which becomes inaccurate once
the dedicated collection route exists.

Home command-palette selection remains unchanged. Broader consolidation of
its in-memory detail transition with route navigation is outside this feature.

## Components

### Home Page

Retain the current `Top skills` heading and `SkillCarousel`. After the
carousel, add an Astryx `HStack` with the same section-level inline padding and
right alignment. It contains an Astryx `Button` labelled `Show all` with
`href="/skills"`, `size="sm"`, and `variant="ghost"`.

The action belongs to the `Top skills` section and remains outside the
horizontal scroll container. It must not change the carousel's five-card data,
height, snapping, padding, or scroll behavior.

### SkillsPage

`SkillsPage` is a focused page component with an injectable readonly `skills`
prop that defaults to the canonical skills collection. It owns:

- the centered, mobile-width viewport frame already established by Home;
- an Astryx `TopNav`/`TopNavHeading` labelled `Skills`;
- one vertically scrollable main content region;
- one visually hidden level-one `Skills` heading that labels the main region
  without duplicating the visible TopNav title; and
- an Astryx-based `SkillList` containing the alphabetized skills.

Preserve the current mobile-first product decision at every viewport: the page
remains a centered mobile-width frame on large screens rather than becoming a
desktop grid or multi-column shell.

### SkillList And SkillListItem

Keep `SkillList` presentational and reusable. Add an optional skill-link
resolver such as `(skill: Skill) => string | undefined`. For each item,
`SkillList` resolves the URL and forwards it to `SkillListItem`; the item then
passes it to Astryx `ListItem` through the native `href` prop.

When no resolver is supplied, current static list behavior remains intact.
This preserves existing stories and consumers while keeping route construction
at the page boundary.

Rows retain their existing compact content contract: skill avatar, skill name,
categories, and rating. The full Astryx row is the single navigation target;
do not nest an additional anchor or button inside it.

## Data Flow

The canonical skills array remains the single source of truth. `SkillsPage`
creates a copied array and sorts it by skill name with `localeCompare` before
rendering. It must not mutate the exported readonly collection.

Home continues to consume the separate curated `highlightedSkills` array. The
`Show all` action does not derive, filter, or modify either collection.

All data is local and synchronous, so there is no loading state or network
error state. An empty collection renders the existing Astryx compact
`EmptyState`. Unknown detail identifiers continue through `SkillDetailRoute`
to `NotFoundPage`.

## Accessibility

- Give `SkillsPage` one visually hidden, accessible level-one heading and use it
  to label `main`.
- Preserve semantic Astryx list markup.
- Make the complete skill row a semantic link through `ListItem href`.
- Preserve Astryx focus indication and touch-target sizing; do not override
  those states locally.
- Keep alphabetical visual order and DOM order identical.
- Keep `Show all` outside the carousel's horizontal scroll region so it remains
  a stable keyboard and pointer target.
- Use descriptive navigation labels for the TopNav, Skills list, and skill
  breadcrumb.

## Testing And Visual Validation

Add or update focused tests to verify:

- `/skills` renders every canonical skill exactly once;
- the rendered skill names are alphabetically ordered;
- Home renders `Show all` after the highlighted carousel with `/skills` as its
  destination;
- Home still renders exactly the existing five highlighted cards;
- a link resolver gives each Astryx skill row the expected
  `/skills/:skillId` URL;
- omitting the resolver preserves static list and empty-state behavior;
- `/skills/:skillId` still renders the matching detail page; and
- the detail breadcrumb's `Skills` link points to `/skills`.

Add focused Storybook coverage for the default and empty `SkillsPage` states,
and update Home coverage to include the below-carousel action. Render stories
at the page ownership level so the viewport frame, TopNav, scroll ownership,
and gutters match the application.

Perform browser or Storybook visual review at a mobile viewport and a large
viewport. Confirm:

- the mobile-width frame stays centered;
- `Show all` is beneath the carousel and right-aligned;
- the action is not clipped or included in horizontal scrolling;
- the list scrolls vertically while TopNav remains outside that scroll region;
- rows and labels do not clip; and
- keyboard focus remains visible.

Run the focused project checks:

```bash
pnpm nx test github.io
pnpm nx lint github.io
pnpm nx build github.io
pnpm nx build-storybook github.io
```

## Scope Boundaries

This feature does not add:

- search or filtering on the Skills page;
- category grouping;
- a responsive card grid or alternate desktop layout;
- changes to skill content, ratings, categories, or highlighted selection;
- a carousel redesign;
- a network data source or asynchronous states; or
- broader replacement of Home's command-palette selection flow.

## Risks And Mitigations

- **Two navigation models remain temporarily.** The new collection and detail
  links are route-native, while Home command-palette selection remains
  in-memory. Keeping the existing behavior out of scope prevents an unrelated
  navigation refactor; route tests document the new canonical paths.
- **Shared list behavior could regress.** Make link resolution optional and
  retain tests for the existing static and empty variants.
- **The action could be mistaken for carousel content.** Place it in its own
  padded Astryx layout row below, not inside `SkillCarousel`.
- **Alphabetization could mutate shared data.** Sort a copied array only.
- **Local styling could drift from Astryx.** Verify component props against the
  installed Astryx package and use supported props before adding local styles.

## Handoff Criteria

The implementation is ready for review when the new route and links satisfy
the approved behavior, focused tests pass, lint/build/Storybook checks pass,
and visual QA confirms the mobile and large-viewport layouts without clipping
or competing scroll regions.
