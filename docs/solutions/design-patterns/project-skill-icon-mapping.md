---
title: Verify skill icons against exact brand meaning
date: 2026-08-03
category: design-patterns
module: github.io App
problem_type: design_pattern
component: frontend_stimulus
severity: low
applies_when:
  - Adding logo-backed skill tokens to portfolio project cards
  - Mapping project-specific tool labels to shared skill brand metadata
tags: [skill-icons, simple-icons, project-card, brand-metadata]
---

# Verify skill icons against exact brand meaning

## Context

Project cards can show many tool labels through shared skill brand metadata. During the dotfiles ProjectCard work, the initial instinct to map labels by name was too broad: Simple Icons had a generic `Delta` icon, but the project skill meant `git-delta`, which does not have a matching logo in the installed icon set.

## Guidance

Treat a Simple Icons match as valid only when the icon title and slug represent the same tool or an intentionally selected parent brand. Exact examples from this ProjectCard implementation:

- `GNU Stow` uses the `GNU` icon because Stow is a GNU project.
- `GitHub CLI` uses the `GitHub` icon because the label intentionally represents GitHub's command-line tool.
- `delta` stays text-only because the available `Delta` icon is not `git-delta`.
- `gh-dash` stays text-only because the available GitHub icon would overstate a tool-specific logo that does not exist.

When a label uses a parent brand intentionally, express that with `brandLabel` in project data. When no exact or intentional brand exists, leave the skill text-only and add a regression test if the false positive is likely.

## Why This Matters

Logo-backed skill tokens communicate more than decoration. A wrong icon implies a stronger brand or tool relationship than the project evidence supports, which weakens the credibility of the portfolio surface. Text-only tokens are preferable to misleading icons.

## When to Apply

- When adding new skills to `apps/github.io/src/app/projects/project-list.data.ts`
- When extending icon mappings in `apps/github.io/src/app/skills/skill-brand.ts`
- When a Simple Icons candidate has a matching word but not the same product or project identity

## Examples

Use explicit parent-brand intent:

```ts
{ label: 'GitHub CLI', brandLabel: 'GitHub' }
```

Keep false positives text-only:

```ts
{ label: 'delta' }
{ label: 'gh-dash' }
```

Guard known false positives in tests:

```ts
for (const skill of ['delta', 'gh-dash']) {
  expect(getSkillBrand(skill)?.iconPath).toBeUndefined();
  expect(getSkillBrand(skill)?.iconDataUrl).toBeUndefined();
}
```

## Related

- `CONCEPTS.md` defines Skill Brand Metadata as the shared visual metadata for skill labels.
