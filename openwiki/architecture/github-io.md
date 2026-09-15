---
type: architecture
title: Application architecture
description: Runtime composition, route ownership, and the boundary between source data and presentation.
tags: [react, routing, github-io]
sources:
  - id: openwiki-source-6120c05e6c28f6f4f5433722
    resource: repo://apps/github.io/src/app/app.spec.tsx
  - id: openwiki-source-fad285841e7c8c748f5274d9
    resource: repo://apps/github.io/src/app/app.tsx
  - id: openwiki-source-c3b9a31667eeb1ba07c1e2e1
    resource: repo://apps/github.io/src/app/devops-capability-evidence/dora-capability-card.tsx
  - id: openwiki-source-931cab7abf1d26363f1a35b7
    resource: repo://apps/github.io/src/app/devops-roadmap/devops-roadmap-stepper.tsx
  - id: openwiki-source-0e64d2f01d205d55b34c0576
    resource: repo://apps/github.io/src/app/devops-roadmap/roadmap-page.spec.tsx
  - id: openwiki-source-ddb555a1fa50192a107dbf5f
    resource: repo://apps/github.io/src/app/devops-roadmap/roadmap-page.tsx
  - id: openwiki-source-5dbaa213d52c3aac678d1838
    resource: repo://apps/github.io/src/app/global-navigation-layout.tsx
  - id: openwiki-source-fd1efcdf5558ec437c218583
    resource: repo://apps/github.io/src/app/home/dora-capability-masonry.tsx
  - id: openwiki-source-0e3b0dfb231db070ffd8340f
    resource: repo://apps/github.io/src/app/home/home-page.tsx
  - id: openwiki-source-bd7d75b07e3062c09dcab6e9
    resource: repo://apps/github.io/src/app/projects/project-card.tsx
  - id: openwiki-source-2afbe5e95b136e7b3bda73e7
    resource: repo://apps/github.io/src/app/responsive-collapsible.ts
  - id: openwiki-source-27a9eeb6972479f50ad1d034
    resource: repo://apps/github.io/src/app/router-link.tsx
  - id: openwiki-source-0326a209b3e8f758018bcc41
    resource: repo://apps/github.io/src/app/skills/skill-detail-content.tsx
  - id: openwiki-source-d97b9e088d941d15580a0bd7
    resource: repo://apps/github.io/src/app/skills/skill-detail-page.spec.tsx
  - id: openwiki-source-679e425aa4dc519b0748e74d
    resource: repo://apps/github.io/src/app/skills/skill-detail-page.tsx
  - id: openwiki-source-2fe979393541d6de345e3a57
    resource: repo://apps/github.io/src/app/skills/skill-detail-route.tsx
  - id: openwiki-source-2c64c0f3573e21fe75b82d6d
    resource: repo://apps/github.io/src/app/skills/skill-detail-sources.ts
  - id: openwiki-source-61956fea1deed015d3bafd72
    resource: repo://apps/github.io/src/app/skills/skill-experience-card-list.tsx
  - id: openwiki-source-6d3d436c779dec5facaf5f2d
    resource: repo://apps/github.io/src/app/skills/skill-experience-card-shell.tsx
  - id: openwiki-source-ba5c27392181e6c65798f3c4
    resource: repo://apps/github.io/src/app/skills/skill-experience-list.tsx
  - id: openwiki-source-b7cc9784bea6b15d468f9f23
    resource: repo://apps/github.io/src/app/skills/skill-table-detail-layout.tsx
generated: { by: "codex", at: "2026-09-15T04:37:16.458Z" }
verified:
  - by: openwiki/0.5.0
    at: 2026-09-15T04:37:16.458Z
---

# Application architecture

`main.tsx` loads the React Flow and application styles and mounts `App` under
React StrictMode. `App` establishes a browser router using Vite's `BASE_URL`,
then composes the providers and routes. The provider order is theme-mode state,
Astryx's neutral theme, then its link adapter. `RouterLink` translates Astryx's
anchor-style `href` into React Router's `to` while forwarding the anchor ref.

The route ownership map is small:

| Route | Owner | Navigation shell |
| --- | --- | --- |
| `/` | HomePage | GlobalNavigationLayout |
| `/roadmap` | RoadmapPage | GlobalNavigationLayout |
| `/skills` | SkillsPage | GlobalNavigationLayout |
| `/skills/:skillId` | SkillDetailRoute | GlobalNavigationLayout |
| Unmatched URL | NotFoundPage, recovery to home | Outside the shell |

The shared shell owns navigation/search state and theme controls rather than
duplicating them in each page. New top-level pages should deliberately choose
whether to join that layout route. A skill detail's domain-level not-found
result is different from an unmatched URL: `SkillDetailRoute` renders the
full-width not-found component within its existing route.

`HomePage` keeps its top-skills carousel and DORA capability section in normal
page flow. The DORA section maps canonical definitions through their existing
evidence-backed cards, with its heading and explanatory Banner outside an
app-owned masonry component. The component initially renders one column below
736 px of available width and two equal flexible columns at or above that
breakpoint, then measures natural card heights and packs each next source-order
card into the shortest column using Astryx spacing-4 for both gaps. This
responsive presentation decision does not change the evidence model, card
semantics, or DOM and keyboard order.

`SkillsPage` owns one filter state across two responsive projections. At table
widths it renders the page introduction above `SkillTableDetailLayout`; inside
the full-width Astryx card, a padded `LayoutHeader` groups controls above the
edge-to-edge table and adjacent in-card inspector. The inspector presents the
skill name and far-right close control in one row, then description, same-tab detail link, full-width
dividers, metadata, and an always-visible level-three Experience heading with its aggregate count; Projects remain on the standalone detail route. Pointer or
keyboard row activation opens resolved skill detail and returns focus to the
originating row.
Compact widths render the card catalog with toolbar search and category filters
instead; changing to compact mode, filtering out the active skill, or failing
detail resolution clears the table selection.

The table/detail split and Experience disclosures consume the same shared
compact-surface query. A compact match selects the bottom sheet and seeds newly
mounted Experience cards closed; a non-compact match selects the adjacent panel
and seeds them open. The seed is not synchronized after mount, so later viewport
changes preserve each visitor's disclosure choice.

Project cards reuse that same seed for their `Skills used` disclosure. Their
repository action is a labelled GitHub icon link rather than a card-wide link,
so the external navigation stays independent from disclosure interaction.

`RoadmapPage` owns the `/roadmap` page framing: its heading, two explanatory
paragraphs, roadmap.sh attribution, informational source banner, external
DevOps roadmap action, and content spacing. The introduction explains that the
page maps portfolio capabilities and evidence to the roadmap.sh structure, then
guides visitors to explore the covered topics. The page selects
`DevOpsRoadmapStepper`, whose default input is the curated 22-topic inventory.
That component translates each item's title and description into an Astryx
step, derives completed or upcoming presentation from visible evidence, and
renders the evidence through existing skill, certification, and token
components. The earlier React Flow `DevOpsRoadmap` implementation remains in
the codebase for compatibility and comparison, but the route no longer renders
it.

Skill detail illustrates the data boundary. `skillDetailSources` gathers the
authored skills, detail records, evidence, projects, and experiences. The route
obtains `skillId` and passes that source bundle to `resolveSkillDetail`. The
resolver returns a typed resolution; the route selects
error recovery or passes the resolved value to `SkillDetailPage`. Keep reference
validation in the resolver rather than burying it in view components.

The detail page remains a direct child of the shared shell's sole scrollable
`LayoutContent`, which caps routed content at 1440 pixels and centers it on
wide viewports without constraining the global navigation; its responsive
two-column grid does not introduce another scroll owner. Enriched details add
an Astryx `Outline` labeled `On this page`
in a sticky end rail on tablet and desktop widths. The page resolves the shared
`LayoutContent` from its mounted `main` and supplies it as Outline's explicit
`scrollContainerRef`, aligning fragment navigation and active-section tracking
with the shell-owned scroll path. The outline starts with the Overview heading
and conditionally follows the same Experience and Projects availability checks
as the rendered sections. A basic detail with no enriched sections stays
single-column and does not render a one-item outline.

Within either detail presentation, the Experience section appears when either
primary experiences or supporting evidence exists. On the standalone route, an
adjacent app-level `CountBadge` reports their combined rendered-item count. The
badge is a sibling of the heading so the section's accessible heading name
remains `Experience`; the standalone heading is level two and the inspector
heading is level three, both with the aggregate count. Only the standalone route
renders Projects.

The two experience renderers keep their source-specific projection work at the
boundary. Authored records pass ordered narrative strings to the shared
`SkillKeyOutcomes` presentation; capability evidence deduplicates detail facts
and removes facts equal to the summary first. Both then use the same unnamed
Astryx outcome list, while relevant skills remain a separate canonical-token
projection below it. This shared presentation does not merge the underlying
authored-experience and capability-evidence models.

Both projections then enter the same controlled experience shell. The
standalone route uses its card-framed disclosures, while the table inspector uses
unframed always-visible, router-aware Astryx `Item` rows with title and summary
in zero-gap authored and supporting stacks; every Item row targets the corresponding standalone card fragment. Mixed entries show both counts while closed, retain
`Highlights` in the open trigger,
and move `Relevant skills` above the token list. Skills-only cards keep the
skill label, count, and chevron together in the trigger in both states, while
their renderers omit the duplicate panel heading. Entries without either
projection do not render a disclosure.

Continue with [evidence semantics](../concepts/evidence.md),
[theme and layout](design-system.md), and [validation](../workflows/validation.md).
The [quickstart](../quickstart.md) covers running the application.
