---
type: architecture
title: Design system and layout
description: How Astryx, StyleX, theme persistence, and browser layout checks fit together.
tags: [astryx, stylex, theme, layout]
verified:
  - by: openwiki/0.5.0
    at: 2026-09-14T02:12:56.703Z
sources:
  - id: openwiki-source-45b1d77b308bd57403f55ff9
    resource: repo://apps/github.io/.storybook/story-taxonomy.spec.ts
  - id: openwiki-source-a099837b8e8614c677082a9d
    resource: repo://apps/github.io/project.json
  - id: openwiki-source-2bfcdfa6f69acb4ddbe6f2af
    resource: repo://apps/github.io/scripts/verify-mobile-layout-browser.mjs
  - id: openwiki-source-06c5610bae8f93d17bf2ff2d
    resource: repo://apps/github.io/src/app/count-badge.stories.tsx
  - id: openwiki-source-43db7fa7bd3bd05d549bdc0a
    resource: repo://apps/github.io/src/app/count-badge.tsx
  - id: openwiki-source-931cab7abf1d26363f1a35b7
    resource: repo://apps/github.io/src/app/devops-roadmap/devops-roadmap-stepper.tsx
  - id: openwiki-source-0e64d2f01d205d55b34c0576
    resource: repo://apps/github.io/src/app/devops-roadmap/roadmap-page.spec.tsx
  - id: openwiki-source-ddb555a1fa50192a107dbf5f
    resource: repo://apps/github.io/src/app/devops-roadmap/roadmap-page.tsx
  - id: openwiki-source-8d32c84f2bba5106749ff558
    resource: repo://apps/github.io/src/app/global-navigation-footer.spec.tsx
  - id: openwiki-source-4885e601d28992a8b288dabf
    resource: repo://apps/github.io/src/app/global-navigation-footer.tsx
  - id: openwiki-source-5dbaa213d52c3aac678d1838
    resource: repo://apps/github.io/src/app/global-navigation-layout.tsx
  - id: openwiki-source-9a75dff41bf8e0bd1f49b6bc
    resource: repo://apps/github.io/src/app/home/home-page.spec.tsx
  - id: openwiki-source-0e3b0dfb231db070ffd8340f
    resource: repo://apps/github.io/src/app/home/home-page.tsx
  - id: openwiki-source-e15aaceb559c1219a1e6667c
    resource: repo://apps/github.io/src/app/projects/project-card.spec.tsx
  - id: openwiki-source-3796c3fa1eb5ecd3516a1db4
    resource: repo://apps/github.io/src/app/projects/project-card.stories.tsx
  - id: openwiki-source-bd7d75b07e3062c09dcab6e9
    resource: repo://apps/github.io/src/app/projects/project-card.tsx
  - id: openwiki-source-0326a209b3e8f758018bcc41
    resource: repo://apps/github.io/src/app/skills/skill-detail-content.tsx
  - id: openwiki-source-2f8ff13f4c903910f3a587fc
    resource: repo://apps/github.io/src/app/skills/skill-detail-page.stories.tsx
  - id: openwiki-source-679e425aa4dc519b0748e74d
    resource: repo://apps/github.io/src/app/skills/skill-detail-page.tsx
  - id: openwiki-source-61956fea1deed015d3bafd72
    resource: repo://apps/github.io/src/app/skills/skill-experience-card-list.tsx
  - id: openwiki-source-6d3d436c779dec5facaf5f2d
    resource: repo://apps/github.io/src/app/skills/skill-experience-card-shell.tsx
  - id: openwiki-source-ba5c27392181e6c65798f3c4
    resource: repo://apps/github.io/src/app/skills/skill-experience-list.tsx
  - id: openwiki-source-2944a7e4b1284a70a09ee95a
    resource: repo://apps/github.io/src/app/skills/skill-key-outcomes.tsx
  - id: openwiki-source-a08412c702b94999bfa82651
    resource: repo://apps/github.io/src/app/skills/skill-table.stories.tsx
  - id: openwiki-source-c2ac9449940c36fc7db6b3e4
    resource: repo://apps/github.io/src/app/skills/skill-table.tsx
  - id: openwiki-source-4fbf5ecc6f0c1fc5eff98141
    resource: repo://apps/github.io/src/app/skills/skills-page.spec.tsx
  - id: openwiki-source-a845ec3d01c38967df3a4dad
    resource: repo://apps/github.io/src/app/skills/skills-page.tsx
  - id: openwiki-source-dec673c983d1738cf99fce82
    resource: repo://apps/github.io/src/app/theme-mode.tsx
  - id: openwiki-source-74580f69125800ca269fab95
    resource: repo://apps/github.io/src/styles.css
  - id: openwiki-source-fcfa3ced1d03143bb27d5018
    resource: repo://apps/github.io/vite.config.ts
generated: { by: "codex", at: "2026-09-14T02:09:47.560Z" }
---

# Design system and layout

The application combines Astryx components and neutral theme tokens with
StyleX-authored local styles. The global stylesheet establishes explicit CSS
layers: reset and theme/base layers precede StyleX, with utilities last. It also
imports Astryx's reset, component styles, and neutral theme. Keep third-party
overrides scoped: the existing carousel adjustment targets `.skill-carousel`,
not every card in the application.

App-owned visible headings use Astryx `Heading` at their semantic level rather
than rendering heading tags through `Text`. The Home labels `Top skills` and
`DORA capabilities`, the Skills label, and the DevOps roadmap label are level-two
headings; the filter popover label is level three. This keeps the document
outline intact while allowing Astryx's heading type-scale tokens to determine
their appearance. Focused page tests protect both sides of that contract by
asserting the accessible heading level and the stable `astryx-heading` and
`data-level` surfaces.

Inline technical metadata follows the same ownership rule. The global footer
reads the application package version, renders it with Astryx `Code` inside
supporting `Text`, and explicitly inherits the surrounding size and color. Its
flex layout keeps that version in the leading region and moves the existing
React/Astryx attribution to an end-aligned region that can wrap on narrower
viewports. The focused footer test protects the semantic `code` element,
package-version output, region order, and supporting-text boundary.

Small repeated presentation values belong in reusable app components. For
example, the app-level `CountBadge` exposes a numeric `count` prop and delegates
the rendered label and neutral styling to Astryx's `Badge`; its colocated
Storybook stories are cataloged as `Components/Count Badge` and cover a
representative populated count and zero. The skill-detail page uses this shared
badge beside both its Experience and Projects headings. Each badge sits outside
the heading's accessible name in the same centered horizontal layout. The
Experience badge counts authored experience records, while the Projects badge
counts project cards; capability-derived experience can still make the section
visible independently. This keeps pages from
recreating the design-system contract for count indicators.

Project cards reuse the same count and disclosure conventions for dense skill
evidence. Each card keeps its project heading and description visible, places
the skill tokens inside an Astryx `Collapsible`, and shows the token count beside
the `Skills used` trigger label. The initial viewport seeds that disclosure
closed at or below 640px and open above the breakpoint, while later toggles stay
under visitor control. Repository navigation remains a separate icon-only
Astryx icon-only ghost `Button` rendered as a link in the card header: its GitHub
brand mark has a destination-specific accessible label and tooltip, opens safely
in a new tab, and avoids making the whole card compete with its disclosure and
linked skill tokens. Focused tests
cover both initial viewport states, disclosure interaction, count rendering,
and the external-link contract; a mobile many-skills story keeps the compact
state available for visual review.

The roadmap page frame also stays inside Astryx's public composition surface. A
full-width `VStack` orders the level-two heading, two semantic body `Text`
paragraphs in the secondary color, an informational `Banner`, and the roadmap
content. The first paragraph uses `Link` for explicit roadmap.sh attribution;
the banner keeps its explanatory copy separate and supplies a secondary
`Button` action to the DevOps source. Both external controls retain new-tab
link attributes, while focused tests protect the copy, ordering, secondary text
treatment, and banner-scoped action.

Within that frame, `DevOpsRoadmapStepper` delegates
ordering, vertical connectors, numbered indicators, completed announcements,
and disabled states to Astryx 0.5.4 `Stepper` and `Step`. App-owned StyleX is
limited to the wrapping evidence lists inside each step, while a roadmap-scoped
global selector promotes completed labels and vertical bars to the primary text
token without changing semantic success status; descriptions retain Astryx's
secondary text color. Evidence spacing keeps the token group closer to its own
description than to the following step title. Linked `SkillToken`s,
certification citations, and neutral concept tokens reuse existing components.
The component deliberately has no active step because evidence can complete
non-contiguous topics, so completion is represented by each step's semantic
status rather than by a single progress cursor.

At table-width viewports, the Skills page integrates the reusable `SkillTable`
with a detail sheet; compact viewports retain the card catalog, toolbar search,
and category popover. The table composes Astryx's table, compact text input,
multi-selector, button, layout, and empty-state primitives with the app's
smallest `SkillAvatar`, colored `SkillCategory`, and text-only
`SkillConfidence` components. Its four columns remain sortable and derive pixel
widths from the longest supplied values; confidence starts high-to-low with name
as a deterministic tiebreaker. Name search is case-insensitive and combines
with an OR-across-selected-categories filter, while the category choices come
from the supplied skill collection. The result count, clear action, and distinct
empty states belong to the table component. Rows support pointer and keyboard
activation, expose the active row through `aria-current`, and open the selected
skill in the adjacent detail layout. Storybook supplies explicit desktop-table
and compact-card viewport scenarios for visual review.

Text-heavy skill experience cards keep their summary as primary body copy and
delegate repeated details to `SkillKeyOutcomes`. The shared component renders an
unnamed, compact, disc-marked Astryx `List`; each `ListItem` receives primary
body `Text` as rich content so long outcomes wrap, and an empty collection
renders nothing. The card heading and summary already identify the following
points, so the repeated `Key outcomes` header and accessible name are omitted
without removing the list and list-item semantics.

The shared `SkillExperienceCardShell` keeps each card heading and summary
visible while placing non-empty detail projections inside Astryx `Collapsible`.
Closed mixed-content triggers show both `Highlights` and `Relevant skills`
counts; opening retains `Highlights` in the trigger and places the skill label
above its accessible token list. A skills-only card keeps `Relevant skills` and
its count beside the chevron in both states, so each renderer omits the duplicate
panel heading. Cards with neither projection omit the disclosure entirely. The
initial viewport seeds the disclosure closed at or below 640px and open above
that breakpoint without later resizing overriding the visitor's choice.

Long skill detail pages use Astryx `Outline` for page-local navigation rather
than recreating a contents list. A token-spaced Astryx `Grid` reserves a 208px
end rail from 768px upward while keeping the article track flexible; below that
threshold the rail is absent, so phone layouts remain single-column. The rail
is sticky inside the existing shell scroll owner. The page resolves that owner
from its mounted `main` and passes it through Outline's `scrollContainerRef`, so
Astryx observes the same container that owns route scrolling without introducing
a page-local overflow region. Its `On this page` label distinguishes it from
global navigation, and its ordered items reuse the same section descriptors as
the rendered heading IDs. Overview is always available, Experience and Projects
follow their rendered sections, and a page with only Overview omits the outline
entirely. The focused tablet Storybook story exposes the responsive composition
for visual review; production Firefox checks establish breakpoint visibility,
sticky geometry, fragment navigation, and settled `aria-current="location"`
behavior against the real shell owner.

Vite compiles StyleX before its React and Nx path plugins. Test mode uses
`css-only` and removes the StyleX development-server hooks; production and local
development use `full`. Thus a passing DOM test is not evidence that production
CSS behaves correctly.

`ThemeModeProvider` owns light/dark state. Only a stored `light` value selects
light mode; missing, unexpected, unavailable, or inaccessible storage defaults
to dark. Updates change React state even if writing the `theme-mode` preference
fails. Calling `useThemeMode` outside the provider throws. Global CSS maps the
root theme attribute to the browser's `color-scheme`.

The navigation frame occupies `100dvh` with hidden overflow and resets its
content scroll position when the pathname changes. Treat scroll ownership as a
layout contract, not a cosmetic tweak. Both `verify-global-layout-css` and
`verify-mobile-layout-browser` depend on a production build. Run them when
changing layout or the compiled styling pipeline.

See [application ownership](github-io.md), [validation](../workflows/validation.md),
and the [workspace quickstart](../quickstart.md). Canonical Astryx agent guidance
is maintained by `pnpm astryx:agents`; use `pnpm astryx:agents:check` to detect drift.
