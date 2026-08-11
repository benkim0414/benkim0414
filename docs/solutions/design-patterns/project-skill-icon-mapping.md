---
title: Verify skill icons against exact brand meaning
date: 2026-08-03
last_updated: 2026-08-10
category: design-patterns
module: github.io App
problem_type: design_pattern
component: frontend_stimulus
severity: low
applies_when:
  - Adding logo-backed skill tokens to portfolio project cards
  - Mapping project-specific tool labels to shared skill brand metadata
  - Vendoring an official logo that is absent from the installed icon catalog
  - Defining a truthful parent-logo or text-only fallback
tags:
  [
    skill-icons,
    simple-icons,
    brand-metadata,
    asset-provenance,
    fallback-contracts,
  ]
---

# Verify skill icons against exact brand meaning

## Context

Skill tokens show many tool labels through shared brand metadata. A convenient
name match is not enough: Simple Icons has a generic `Delta` icon, but the
portfolio skill means `git-delta`, which does not have a matching logo in the
installed catalog. The same truthfulness constraint applies when selecting a
parent-project mark or vendoring an official asset.

The resolver deliberately supports three outcomes: an inline Simple Icons path,
a local or embedded image URL, or color-only metadata. If none applies, it
returns no brand metadata (`apps/github.io/src/app/skills/skill-brand.ts:67-76`,
`apps/github.io/src/app/skills/skill-brand.ts:221-246`). A missing logo is
therefore a supported result, not a gap to fill with a visually similar mark.

## Guidance

Choose a mapping in four tiers, stopping at the first truthful match.

### 1. Use an exact catalog icon

Use a Simple Icons export only when its title and project identity match the
label. The resolver converts the catalog path and color into icon-backed brand
metadata (`apps/github.io/src/app/skills/skill-brand.ts:81-139`,
`apps/github.io/src/app/skills/skill-brand.ts:215-218`). Jest, Markdown, and
Prometheus are examples of exact catalog matches.

### 2. Reuse a parent or platform mark intentionally

Reuse a mark only when the relationship is factual and the UI is communicating
project-family or platform context rather than claiming a distinct sub-brand.
The current mappings intentionally use Prometheus for Alertmanager and
`promtool`, and Kubernetes for Kubernetes RBAC, Kustomize, and `kubectl`
(`apps/github.io/src/app/skills/skill-brand.ts:110-124`). Tests compare each
fallback directly with its parent icon so the relationship cannot silently
drift (`apps/github.io/src/app/skills/skill-brand.spec.ts:113-143`).

Project-card examples follow the same rule:

- `GNU Stow` uses the `GNU` icon because Stow is a GNU project.
- `GitHub CLI` uses the `GitHub` icon because the label intentionally represents GitHub's command-line tool.
- `delta` stays text-only because the available `Delta` icon is not `git-delta`.
- `gh-dash` stays text-only because the available GitHub icon would overstate a tool-specific logo that does not exist.

When project data selects a parent brand, express that intent with `brandLabel`.

### 3. Vendor a pinned official asset

When no truthful catalog export exists but the project publishes a distinct
official mark, vendor that asset and record its provenance in
`apps/github.io/src/assets/skills/README.md`. Record the upstream organization,
immutable commit or release, source path, retrieval date, applicable terms, and
a digest when byte identity matters. The current provenance ledger covers the
AWS wordmark and IAM architecture icon, Grafana Loki and Alloy artwork, and the
Testcontainers project mark (`apps/github.io/src/assets/skills/README.md:3-54`).

Inspect SVGs before shipping them. They should be static artwork without scripts,
event handlers, external references, or browser-active content. When artwork is
transformed only to remove editor metadata or declarations, compare it with the
upstream rendering; when exact bytes matter, record and verify a digest.

Import vendored SVGs with `?no-inline` and expose the emitted URL through
`iconDataUrl`. This keeps third-party markup out of injected HTML and preserves
full-color artwork (`apps/github.io/src/app/skills/skill-brand.ts:55-65`,
`apps/github.io/src/app/skills/skill-brand.ts:237-239`). A base64 image should be
a narrow exception: AWS IAM uses one only with a pinned source and documented
SHA-256 (`apps/github.io/src/app/skills/skill-brand.ts:78-79`,
`apps/github.io/src/assets/skills/README.md:21-33`).

### 4. Prefer text to an invented logo

If there is no exact or justified parent mark, keep the label text-only. Color
metadata may still communicate family context, but it must not imply that an
icon exists. IRSA carries AWS orange without an icon mapping
(`apps/github.io/src/app/skills/skill-brand.ts:141-169`), while `SkillToken`
renders both unmapped and color-only labels without logo styling
(`apps/github.io/src/app/skills/skill-token.spec.tsx:52-72`).

## Why This Matters

Logo-backed skill tokens communicate more than decoration. A wrong icon can
imply ownership, endorsement, or a distinct product identity that does not
exist. Text-only tokens are preferable to misleading icons.

Provenance makes vendored branding reproducible and reviewable. An immutable
source identifies which artwork was selected, a digest can prove byte identity,
and static-asset inspection protects the browser boundary. Behavior-focused
tests then preserve the intended representation: exact icon, parent-family
icon, emitted local asset, embedded image format, or no icon.

## When to Apply

- When adding new skills to `apps/github.io/src/app/projects/project-list.data.ts`
- When extending icon mappings in `apps/github.io/src/app/skills/skill-brand.ts`
- When a Simple Icons candidate has a matching word but not the same product or project identity
- When a catalog adds an exact icon that could replace a local or parent fallback
- When refreshing a vendored asset or upstream branding release

Review the result in Storybook as well as tests. Source contracts establish
identity and fallback behavior; visual review catches small-size clipping,
contrast, and legibility problems.

## Examples

Use explicit parent-brand intent:

```ts
const githubCliSkill = { label: 'GitHub CLI', brandLabel: 'GitHub' };
```

Keep false positives text-only:

```ts
const textOnlySkills = [{ label: 'delta' }, { label: 'gh-dash' }];
```

Guard known false positives in tests:

```ts
for (const skill of ['delta', 'gh-dash']) {
  expect(getSkillBrand(skill)?.iconPath).toBeUndefined();
  expect(getSkillBrand(skill)?.iconDataUrl).toBeUndefined();
}
```

Contract intentional family reuse by identity:

```ts
expect(getSkillBrand('promtool')?.iconPath).toBe(
  getSkillBrand('Prometheus')?.iconPath,
);
```

Contract the consumer-visible fallback, not only the resolver map:

```tsx
const { container } = render(<SkillToken label="IRSA" />);

expect(container.querySelector('svg')).toBeNull();
expect(container.querySelector('img')).toBeNull();
```

## Related

- `CONCEPTS.md` defines Skill Brand Metadata as the shared visual metadata for skill labels.
- [`tokenize-dora-capability-evidence.md`](../conventions/tokenize-dora-capability-evidence.md) applies the shared brand metadata to neutral capability skill tokens.
- [`verify-storybook-from-linked-worktree.md`](../workflow-issues/verify-storybook-from-linked-worktree.md) covers remote Storybook visual verification from an isolated worktree.
