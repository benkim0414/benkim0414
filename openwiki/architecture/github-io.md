---
type: architecture
title: Application architecture
description: Runtime composition, route ownership, and the boundary between source data and presentation.
tags: [react, routing, github-io]
verified:
  - by: openwiki/0.5.0
    at: 2026-09-09T05:56:49.829Z
sources:
  - id: openwiki-source-a099837b8e8614c677082a9d
    resource: repo://apps/github.io/project.json
  - id: openwiki-source-fad285841e7c8c748f5274d9
    resource: repo://apps/github.io/src/app/app.tsx
  - id: openwiki-source-4885e601d28992a8b288dabf
    resource: repo://apps/github.io/src/app/global-navigation-footer.tsx
  - id: openwiki-source-167ebe2e87fa08117553fbbc
    resource: repo://apps/github.io/src/app/release-version.ts
  - id: openwiki-source-27a9eeb6972479f50ad1d034
    resource: repo://apps/github.io/src/app/router-link.tsx
  - id: openwiki-source-d97b9e088d941d15580a0bd7
    resource: repo://apps/github.io/src/app/skills/skill-detail-page.spec.tsx
  - id: openwiki-source-679e425aa4dc519b0748e74d
    resource: repo://apps/github.io/src/app/skills/skill-detail-page.tsx
  - id: openwiki-source-2fe979393541d6de345e3a57
    resource: repo://apps/github.io/src/app/skills/skill-detail-route.tsx
  - id: openwiki-source-fcfa3ced1d03143bb27d5018
    resource: repo://apps/github.io/vite.config.ts
  - id: openwiki-source-6ba748254f38112b13d529da
    resource: repo://nx.json
  - id: openwiki-source-234366370818f39ce649e8e3
    resource: repo://scripts/github-io-nx-release.mjs
  - id: openwiki-source-8df1ce8801fb1bde82edbc9c
    resource: repo://scripts/github-io-version-actions.cjs
generated: { by: "codex", at: "2026-09-09T05:56:49.829Z" }
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

Application versioning is a build boundary rather than authored package data.
Vite injects `__APP_RELEASE__` and `__APP_VERSION__`; ordinary development
resolves that boundary to `dev`, while a release build fails unless
`APP_VERSION` is a canonical stable three-part SemVer without leading zeroes,
suffixes, or trailing whitespace. The footer consumes only the
resulting `appVersion`. Nx marks `github.io` as a deployable project, gives its
build cache explicit inputs for both environment values, and configures an
independent `github.io@{version}` release stream. The release coordinator calls
Nx Release in dry-run mode against an ignored staging manifest and verifies
Nx's baseline, candidate, project, and tag against its own decision. Nx never
commits, tags, or pushes; a small version-actions adapter exists only because
the source app manifest deliberately has no version during bootstrap.

Continue with [evidence semantics](../concepts/evidence.md),
[theme and layout](design-system.md), and [validation](../workflows/validation.md).
The [quickstart](../quickstart.md) covers running the application.
