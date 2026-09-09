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
  - id: openwiki-source-27a9eeb6972479f50ad1d034
    resource: repo://apps/github.io/src/app/router-link.tsx
  - id: openwiki-source-d97b9e088d941d15580a0bd7
    resource: repo://apps/github.io/src/app/skills/skill-detail-page.spec.tsx
  - id: openwiki-source-679e425aa4dc519b0748e74d
    resource: repo://apps/github.io/src/app/skills/skill-detail-page.tsx
  - id: openwiki-source-2fe979393541d6de345e3a57
    resource: repo://apps/github.io/src/app/skills/skill-detail-route.tsx
generated: { by: "codex", at: "2026-09-09T04:57:16.606Z" }
verified:
  - by: openwiki/0.5.0
    at: 2026-09-09T06:01:39.198Z
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

Within the detail surface, the Experience section appears when either primary
experience cards or supporting evidence exists, but its adjacent app-level
`CountBadge` reports only the primary-card array length. The badge is a sibling
of the level-two heading so the section's accessible heading name remains
`Experience`; an evidence-only section therefore communicates a count of zero
without hiding its supporting records.

Continue with [evidence semantics](../concepts/evidence.md),
[theme and layout](design-system.md), and [validation](../workflows/validation.md).
The [quickstart](../quickstart.md) covers running the application.
