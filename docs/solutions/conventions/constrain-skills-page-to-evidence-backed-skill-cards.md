---
title: Constrain Skills Page To Evidence-Backed Skill Cards
date: 2026-08-26
last_updated: 2026-09-08
category: conventions
module: apps/github.io skills
problem_type: convention
component: tooling
severity: medium
applies_when:
  - Rendering the full Skills page from the canonical local skill catalog
  - Promoting DORA capability skill evidence into public skill records
  - Choosing canonical display names for skill records that also appear in capability evidence
  - Deciding whether an evidence label is a standalone skill card or a lower-level concept
related_components:
  - github.io DevOps capability evidence
  - SkillCard
  - SkillList
  - SkillListItem
  - Capability Skill Evidence
tags:
  [
    github-io,
    skills-page,
    skill-cards,
    dora,
    skill-catalog,
    capability-evidence,
    naming,
    astryx,
  ]
---

# Constrain Skills Page To Evidence-Backed Skill Cards

## Context

The `github.io` skills inventory has two separate boundaries: page presentation
and catalog scope. The full Skills page can move to richer `SkillCard`
presentation without rewriting the row-oriented `SkillList` and
`SkillListItem` components. In this implementation, `SkillsPage` imports
`SkillCard` directly and renders sorted full-width cards inside its page-local
layout (`apps/github.io/src/app/skills/skills-page.tsx:7`,
`apps/github.io/src/app/skills/skills-page.tsx:18`,
`apps/github.io/src/app/skills/skills-page.tsx:38`,
`apps/github.io/src/app/skills/skills-page.tsx:40`).

The same page consumes a skill catalog derived partly from DORA capability
evidence. That catalog should contain product, software, library, language,
service, or tool records that can stand as public skill cards. It should not
promote every supporting evidence label into a visible card when the label is a
subfeature, concept, protocol, broad umbrella, or CLI alias better represented
by a canonical skill.

Session history showed the same boundary earlier in the DevOps roadmap
inventory: direct evidence skill tokens had to stay separate from covered
concepts, and rendering every proof label as a skill token was too broad
(session history).

## Guidance

Keep public skill inventory work split across presentation and catalog
ownership.

For presentation, let the target page compose existing components instead of
refactoring legacy list components. `SkillsPage` owns the main landmark,
visible section label, empty state, copied sorting, and card layout
(`apps/github.io/src/app/skills/skills-page.tsx:23`,
`apps/github.io/src/app/skills/skills-page.tsx:27`,
`apps/github.io/src/app/skills/skills-page.tsx:30`,
`apps/github.io/src/app/skills/skills-page.tsx:31`). Its test locks the
semantic page shell, visible h2 label, absence of page-local navigation, and
rendered card entries (`apps/github.io/src/app/skills/skills-page.spec.tsx:29`,
`apps/github.io/src/app/skills/skills-page.spec.tsx:33`,
`apps/github.io/src/app/skills/skills-page.spec.tsx:34`,
`apps/github.io/src/app/skills/skills-page.spec.tsx:36`,
`apps/github.io/src/app/skills/skills-page.spec.tsx:58`).

For catalog additions, normalize DORA evidence to canonical records that read
as standalone skills. The local catalog includes individual AWS services such
as `Amazon ECR`, `Amazon EKS`, `AWS CodeBuild`, `AWS CodePipeline`,
`AWS EventBridge`, `AWS IAM`, `AWS Lambda`, and
`AWS Systems Manager Parameter Store`, rather than a single broad `AWS` card
(`apps/github.io/src/app/skills/skill-list.data.ts:26`,
`apps/github.io/src/app/skills/skill-list.data.ts:36`,
`apps/github.io/src/app/skills/skill-list.data.ts:56`,
`apps/github.io/src/app/skills/skill-list.data.ts:66`,
`apps/github.io/src/app/skills/skill-list.data.ts:76`,
`apps/github.io/src/app/skills/skill-list.data.ts:86`,
`apps/github.io/src/app/skills/skill-list.data.ts:96`,
`apps/github.io/src/app/skills/skill-list.data.ts:106`). Use canonical product
display names for ambiguous entries: the Argo-family skill is `Argo CD` with id
`argo-cd`, not generic `Argo` or informal `ArgoCD`
(`apps/github.io/src/app/skills/skill-list.data.ts:46`,
`apps/github.io/src/app/skills/skill-list.data.ts:47`).

When evidence labels are valid but not good visible card records, map them to
broader canonical skills in tests. The current DORA coverage map covers `AWS`
with `AWS IAM`, `GitOps` with `Argo CD`, `kubectl` with `Kubernetes`,
`promtool` with `Prometheus`, and other lower-level labels with their
canonical catalog records (`apps/github.io/src/app/skills/skill-list.data.spec.ts:11`,
`apps/github.io/src/app/skills/skill-list.data.spec.ts:15`,
`apps/github.io/src/app/skills/skill-list.data.spec.ts:20`,
`apps/github.io/src/app/skills/skill-list.data.spec.ts:21`). The coverage test
then fails only when an evidence-backed skill is neither visible nor
deliberately covered by a canonical card
(`apps/github.io/src/app/skills/skill-list.data.spec.ts:104`,
`apps/github.io/src/app/skills/skill-list.data.spec.ts:114`,
`apps/github.io/src/app/skills/skill-list.data.spec.ts:116`).

## Why This Matters

Skill cards are public portfolio assertions, not a raw import of every
supporting label found in capability evidence. If the catalog accepts every
subfeature, CLI alias, or concept as its own card, the skills page becomes
noisy and implies expertise categories that are too granular to compare. If the
catalog collapses too far into umbrella records such as `AWS`, it hides the
actual services being evidenced.

Separating page presentation from legacy list maintenance keeps the change
small. The all-skills page can use the same reusable Skill Card presentation as
other skill surfaces, while existing list components remain available for row
or list contexts. The home page remains its own surface with a `Top skills`
level-two `Heading` and `SkillCarousel`, giving the full Skills page matching
semantic typography without forcing the carousel interaction
(`apps/github.io/src/app/home/home-page.tsx`).

## When to Apply

Apply this convention when a public skills page, portfolio inventory, or
capability evidence surface is derived from a broader evidence catalog. Add or
retain a visible skill card only when the record is a canonical product,
software package, framework, library, programming language, platform service,
or operational tool that a reader would naturally recognize as a standalone
skill.

Use a hidden coverage map when evidence labels are real and searchable but not
good card records: implementation concepts like GitOps, subfeatures like
Kubernetes RBAC, auth concepts like OpenID Connect, command-line entry points
like `kubectl` or `promtool`, and broad umbrella labels like AWS when
individual AWS service skills already exist. Keep simple setup helpers out of
the public catalog when they do not carry meaningful portfolio weight; here,
`Husky` is covered by `Git` rather than rendered as its own card
(`apps/github.io/src/app/skills/skill-list.data.spec.ts:16`,
`apps/github.io/src/app/skills/skill-list.data.spec.ts:121`,
`apps/github.io/src/app/skills/skill-list.data.spec.ts:127`).

Also apply it when changing a page from list rows to cards. Let the page render
`SkillCard`, sort a copy of supplied skills, preserve route links, and keep
empty-state behavior in the page or in a shared card-list abstraction. The page
test confirms sorted card links and verifies the supplied array order is not
mutated (`apps/github.io/src/app/skills/skills-page.spec.tsx:43`,
`apps/github.io/src/app/skills/skills-page.spec.tsx:59`,
`apps/github.io/src/app/skills/skills-page.spec.tsx:64`).

## Examples

Before, a full skills page can depend on list-row presentation even though the
application already has a richer `SkillCard` component for home and top-skill
contexts. After, the all-skills page imports `SkillCard`, wraps sorted records
in a vertical stack, and renders each card at full width
(`apps/github.io/src/app/skills/skills-page.tsx:7`,
`apps/github.io/src/app/skills/skills-page.tsx:18`,
`apps/github.io/src/app/skills/skills-page.tsx:38`,
`apps/github.io/src/app/skills/skills-page.tsx:40`). The page keeps a hidden h1
for the main landmark and adds a visible level-two `Heading`, matching the home
page's `Top skills` heading through Astryx's documented type scale rather than
local compact-text styling (`apps/github.io/src/app/skills/skills-page.tsx`,
`apps/github.io/src/app/home/home-page.tsx`).

Before, importing DORA skill evidence directly could invite separate cards for
`AWS`, `GitOps`, `kubectl`, `promtool`, `OpenID Connect`, `IRSA`,
`Kubernetes RBAC`, `Conventional Commits`, `GitHub API`, and `Husky`. After,
the catalog renders canonical skills such as `AWS IAM`, `Argo CD`,
`Kubernetes`, `Prometheus`, `Git`, and `GitHub`, while tests preserve the
mapping from hidden labels to their covering catalog names
(`apps/github.io/src/app/skills/skill-list.data.spec.ts:11`,
`apps/github.io/src/app/skills/skill-list.data.spec.ts:22`,
`apps/github.io/src/app/skills/skill-list.data.spec.ts:121`,
`apps/github.io/src/app/skills/skill-list.data.spec.ts:128`).

Before, ambiguous naming could produce `Argo`, `ArgoCD`, or a duplicate between
the two. After, the catalog uses the canonical `Argo CD` display name, and the
test explicitly asserts that `Argo CD` is present while generic `Argo` is
absent (`apps/github.io/src/app/skills/skill-list.data.ts:46`,
`apps/github.io/src/app/skills/skill-list.data.ts:47`,
`apps/github.io/src/app/skills/skill-list.data.spec.ts:99`,
`apps/github.io/src/app/skills/skill-list.data.spec.ts:100`,
`apps/github.io/src/app/skills/skill-list.data.spec.ts:101`).

## Related

- `docs/solutions/conventions/tokenize-dora-capability-evidence.md`
- `docs/solutions/design-patterns/project-skill-icon-mapping.md`
- `docs/solutions/best-practices/astryx-component-owned-typography.md`
- `docs/solutions/design-patterns/astryx-layout-gap-token-spacing.md`
- `docs/solutions/workflow-issues/verify-storybook-from-linked-worktree.md`
