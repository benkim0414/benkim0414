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
  - id: openwiki-source-931cab7abf1d26363f1a35b7
    resource: repo://apps/github.io/src/app/devops-roadmap/devops-roadmap-stepper.tsx
  - id: openwiki-source-ddb555a1fa50192a107dbf5f
    resource: repo://apps/github.io/src/app/devops-roadmap/roadmap-page.tsx
  - id: openwiki-source-5dbaa213d52c3aac678d1838
    resource: repo://apps/github.io/src/app/global-navigation-layout.tsx
  - id: openwiki-source-27a9eeb6972479f50ad1d034
    resource: repo://apps/github.io/src/app/router-link.tsx
  - id: openwiki-source-d97b9e088d941d15580a0bd7
    resource: repo://apps/github.io/src/app/skills/skill-detail-page.spec.tsx
  - id: openwiki-source-679e425aa4dc519b0748e74d
    resource: repo://apps/github.io/src/app/skills/skill-detail-page.tsx
  - id: openwiki-source-2fe979393541d6de345e3a57
    resource: repo://apps/github.io/src/app/skills/skill-detail-route.tsx
  - id: openwiki-source-61956fea1deed015d3bafd72
    resource: repo://apps/github.io/src/app/skills/skill-experience-card-list.tsx
  - id: openwiki-source-6d3d436c779dec5facaf5f2d
    resource: repo://apps/github.io/src/app/skills/skill-experience-card-shell.tsx
  - id: openwiki-source-ba5c27392181e6c65798f3c4
    resource: repo://apps/github.io/src/app/skills/skill-experience-list.tsx
generated: { by: "codex", at: "2026-09-14T00:43:22.692Z" }
verified:
  - by: openwiki/0.5.0
    at: 2026-09-14T00:43:22.692Z
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

`RoadmapPage` owns the `/roadmap` page framing: its heading, redesign notice,
roadmap.sh attribution, and content spacing. It now selects
`DevOpsRoadmapStepper`, whose default input is the curated 22-topic inventory.
That component translates each item's title and description into an Astryx
step, derives completed or upcoming presentation from visible evidence, and
renders the evidence through existing skill, certification, and token
components. The earlier React Flow `DevOpsRoadmap` implementation remains in
the codebase for compatibility and comparison, but the route no longer renders
it.

Skill detail illustrates the data boundary. The route obtains `skillId` and
passes authored skills, detail records, evidence, projects, and experiences to
`resolveSkillDetail`. The resolver returns a typed resolution; the route selects
error recovery or passes the resolved value to `SkillDetailPage`. Keep reference
validation in the resolver rather than burying it in view components.

The detail page remains a direct child of the shared shell's sole scrollable
`LayoutContent`; its responsive two-column grid does not introduce another
scroll owner. Enriched details add an Astryx `Outline` labeled `On this page`
in a sticky end rail on tablet and desktop widths. The page resolves the shared
`LayoutContent` from its mounted `main` and supplies it as Outline's explicit
`scrollContainerRef`, aligning fragment navigation and active-section tracking
with the shell-owned scroll path. The outline starts with the Overview heading
and conditionally follows the same Experience and Projects availability checks
as the rendered sections. A basic detail with no enriched sections stays
single-column and does not render a one-item outline.

Within the detail surface, the Experience section appears when either primary
experience cards or supporting evidence exists, but its adjacent app-level
`CountBadge` reports only the primary-card array length. The badge is a sibling
of the level-two heading so the section's accessible heading name remains
`Experience`; an evidence-only section therefore communicates a count of zero
without hiding its supporting records. Focused tests locate that badge within
the heading's horizontal container, distinguishing it from the additional
numeric badges inside descendant experience cards.

The two experience renderers keep their source-specific projection work at the
boundary. Authored records pass ordered narrative strings onward; capability
evidence deduplicates detail facts and removes facts equal to the summary first.
Both provide those narrative points or facts and a separate canonical
relevant-skill projection to `SkillExperienceCardShell`. The shell keeps the
heading and summary visible and reveals the shared list and skill tokens
together. Its controlled trigger labels and counts only non-empty projections.
When both exist, expansion restores the relevant-skill label and count above its
accessible token list while the trigger retains `Highlights`; a skills-only
card also moves its sole visible label above the tokens and gives the icon-only
collapse control a hidden accessible name. An entirely empty projection has no
disclosure.
This presentation reuse does not merge the underlying authored-experience and
capability-evidence models.

Continue with [evidence semantics](../concepts/evidence.md),
[theme and layout](design-system.md), and [validation](../workflows/validation.md).
The [quickstart](../quickstart.md) covers running the application.
