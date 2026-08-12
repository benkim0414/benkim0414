---
title: Verify skill icons against exact brand meaning
date: 2026-08-03
last_updated: 2026-08-12
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
  - Deciding whether a skill token may use a brand-colored background
tags:
  [
    skill-icons,
    skill-tokens,
    simple-icons,
    brand-metadata,
    asset-provenance,
    brand-color-provenance,
    neutral-surfaces,
    fallback-contracts,
  ]
---

# Verify skill icons against exact brand meaning

## Context

Skill tokens show many tool labels through shared brand metadata. A convenient
name match is not enough: Simple Icons has a generic `Delta` icon, but the
portfolio skill means `git-delta`, which does not have a matching logo in the
installed catalog. The same truthfulness constraint applies when selecting a
parent-project mark, vendoring an official asset, or choosing a token
background.

Treat artwork provenance and surface-color provenance as separate decisions. An
approved image settles what artwork may render; do not treat its file format,
white canvas, website treatment, or sampled pixels as background-color evidence.
`SkillBrand` records this distinction explicitly with a required `surface`
alongside its color and optional icon data
(`apps/github.io/src/app/skills/skill-brand.ts:81-90`).

The resolver deliberately supports an inline Simple Icons path, a local or
embedded image URL, color-only metadata, or no metadata. A missing logo is
therefore a supported result, not a gap to fill with a visually similar mark
(`apps/github.io/src/app/skills/skill-brand.ts:273-300`).

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
(`apps/github.io/src/app/skills/skill-brand.ts:128-143`). Tests compare each
fallback directly with its parent icon so the relationship cannot silently
drift (`apps/github.io/src/app/skills/skill-brand.spec.ts:211-241`).

Project-card examples follow the same rule:

- `GNU Stow` uses the `GNU` icon because Stow is a GNU project.
- `GitHub CLI` uses the `GitHub` icon because the label intentionally represents GitHub's command-line tool.
- `delta` stays text-only because the available `Delta` icon is not `git-delta`.
- `gh-dash` uses its pinned project mark rather than the broader GitHub icon.

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
full-color artwork (`apps/github.io/src/app/skills/skill-brand.ts:61-79`,
`apps/github.io/src/app/skills/skill-brand.ts:285-292`). A base64 image should be
a narrow exception: AWS IAM uses one only with a pinned source and documented
SHA-256 (`apps/github.io/src/app/skills/skill-brand.ts:95-96`,
`apps/github.io/src/assets/skills/README.md:21-33`).

### 4. Prefer text to an invented logo

If there is no exact or justified parent mark, keep the label text-only. Color
metadata may still communicate family context, but it must not imply that an
icon exists. IRSA carries AWS orange without an icon mapping
(`apps/github.io/src/app/skills/skill-brand.ts:187-209`), while `SkillToken`
keeps text-only project skills on the Astryx neutral surface
(`apps/github.io/src/app/skills/skill-token.spec.tsx:52-87`).

### 5. Classify token surfaces from verified color provenance

Treat the logo and its surrounding token chrome as independent capabilities.
Use `surface: 'brand'` when the mapping has verified brand-color provenance;
use `surface: 'neutral'` when only the artwork or a local legibility color is
verified. The resolver marks Simple Icons metadata as branded and defaults
other mappings to neutral, with an explicit audit table for custom-image skills
(`apps/github.io/src/app/skills/skill-brand.ts:211-222`,
`apps/github.io/src/app/skills/skill-brand.ts:273-300`).

The consumer resolves surface intent in one visible order: caller override,
resolver metadata, then neutral fallback. Icon rendering remains independent,
so a neutral token can retain a full-color image or a catalog icon's mapped
color (`apps/github.io/src/app/skills/skill-token.tsx:46-85`).

```ts
const brand = getSkillBrand(brandLabel ?? label);
const effectiveVariant = variant ?? brand?.surface ?? 'neutral';
```

Do not promote a token to a brand surface from a PNG versus SVG distinction,
`#FFFFFF`, a sampled logo pixel, a favicon, a screenshot, or a parent-company
palette. Record the source that publishes the applicable brand color before
changing a mapping from neutral to brand.

## Why This Matters

Logo-backed skill tokens communicate more than decoration. A wrong icon can
imply ownership, endorsement, or a distinct product identity that does not
exist. An unsupported background can likewise turn a merely legible color into
an asserted brand color. Text-only or neutral-surface tokens are preferable to
misleading branding.

Provenance makes vendored branding reproducible and reviewable. An immutable
source identifies which artwork was selected, a digest can prove byte identity,
and static-asset inspection protects the browser boundary. That evidence does
not automatically prove a background color, so surface provenance stays
explicit in metadata. Behavior-focused tests then preserve the intended
representation: exact icon, parent-family icon, emitted local asset, embedded
image format, no icon, branded surface, or neutral surface.

## When to Apply

- When adding new skills to `apps/github.io/src/app/projects/project-list.data.ts`
- When extending icon mappings in `apps/github.io/src/app/skills/skill-brand.ts`
- When a Simple Icons candidate has a matching word but not the same product or project identity
- When a catalog adds an exact icon that could replace a local or parent fallback
- When refreshing a vendored asset or upstream branding release
- When a logo is approved but no official source publishes a product-specific background color
- When a consumer needs an intentional contextual override without changing the shared default

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
const textOnlySkills = [{ label: 'delta' }];
```

Guard known false positives in tests:

```ts
expect(getSkillBrand('delta')).toBeUndefined();
```

Guard surface provenance separately from icon availability:

```ts
expect(getSkillBrand('Docker')?.surface).toBe('brand');
expect(getSkillBrand('Yazi')?.surface).toBe('neutral');
```

Then verify the rendered default and caller precedence:

```tsx
expect(
  render(<SkillToken label="Yazi" />)
    .getByTestId('skill-token')
    .getAttribute('style'),
).toBeNull();

expect(
  render(<SkillToken label="Yazi" variant="brand" />)
    .getByTestId('skill-token')
    .getAttribute('style'),
).toContain('--skill-token-background: #FFFFFF');
```

The override proves precedence, not that white is Yazi's official background
color (`apps/github.io/src/app/skills/skill-token.spec.tsx:215-221`).

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
- [`color-only-certification-brand-fallback.md`](../logic-errors/color-only-certification-brand-fallback.md) explains why color and icon availability are separate consumer capabilities.
- [`tokenize-dora-capability-evidence.md`](../conventions/tokenize-dora-capability-evidence.md) applies the shared brand metadata to neutral capability skill tokens.
- [`verify-storybook-from-linked-worktree.md`](../workflow-issues/verify-storybook-from-linked-worktree.md) covers remote Storybook visual verification from an isolated worktree.
