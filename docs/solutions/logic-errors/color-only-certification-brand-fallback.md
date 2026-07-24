---
title: Make Color-Only Certification Brand Fallbacks Reachable
date: 2026-07-24
category: logic-errors
module: github.io certification citations
problem_type: logic_error
component: rails_view
symptoms:
  - "A no-logo certification fallback existed in the component contract but no real skill could exercise it"
  - "Skill brand metadata required icon fields even when a certification only needed a brand color"
root_cause: logic_error
resolution_type: code_fix
severity: medium
related_components:
  - github.io skill tokens
  - github.io skill brand metadata
tags: [certifications, citations, skill-brands, fallback-state, frontend]
---

# Make Color-Only Certification Brand Fallbacks Reachable

## Problem

Certification citations needed two branding paths: use the linked skill logo when one exists, or use the linked skill brand color as a Citation border accent when no logo exists. The no-logo path was designed into the component but unreachable because skill brand metadata only represented Simple Icons-backed brands.

## Symptoms

- `CertificationCitation` had logic for a brand without a skill logo, but every returned `SkillBrand` had `iconPath`.
- Skills without Simple Icons metadata returned `undefined`, so they could not drive the border-color fallback.
- Reusing brand metadata directly in `SkillToken` risked turning color-only skills into brand-colored tokens even though the token had no logo.

## What Didn't Work

- Treating "has brand color" and "has logo" as the same condition made the fallback dead code. It also collapsed two different presentation needs: certification citations can use color-only metadata, while skill tokens should only switch to the brand treatment when a visible icon is present.
- Relying on a mock-only no-logo case would have proved the branch in isolation but not that the production data model can reach it.

## Solution

Separate brand color availability from logo availability.

`SkillBrand` now allows optional icon fields, and `getSkillBrand` can return a color-only brand when a skill has a known brand color but no Simple Icons logo. The production fixture is `AWS`, which returns `color` and `foreground` without `iconPath` or `iconDataUrl` (`apps/github.io/src/app/skills/skill-brand.ts:26`, `apps/github.io/src/app/skills/skill-brand.ts:58`, `apps/github.io/src/app/skills/skill-brand.ts:109`).

`SkillToken` gates brand-colored token styling on `brand.iconPath`, not on `brand` itself. That preserves the normal text-only purple treatment for color-only skills (`apps/github.io/src/app/skills/skill-token.tsx:10`, `apps/github.io/src/app/skills/skill-token.tsx:25`).

`CertificationCitation` treats the first linked skill with brand metadata as the primary brand. If that brand has an icon path, the Citation receives an icon; if it only has a color, the Citation keeps secondary text color and receives the brand color as a border accent (`apps/github.io/src/app/certifications/certification-citation.tsx:18`, `apps/github.io/src/app/certifications/certification-citation.tsx:40`, `apps/github.io/src/app/certifications/certification-citation.tsx:63`).

The regression tests cover the real fallback path:

- `getSkillBrand('AWS')` returns color-only metadata with no icon fields (`apps/github.io/src/app/skills/skill-brand.spec.ts:17`).
- `SkillToken label="AWS"` stays text-only and purple (`apps/github.io/src/app/skills/skill-token.spec.tsx:55`).
- `CertificationCitation` with `skills={['AWS']}` applies the AWS border color and renders no image (`apps/github.io/src/app/certifications/certification-citation.spec.tsx:88`).

## Why This Works

The component model now distinguishes three states instead of two:

1. No brand metadata: render the default Citation treatment.
2. Brand color without a logo: use the color only where the component has a meaningful no-logo fallback.
3. Brand color with a logo: render the logo and use the status-specific icon color.

That distinction keeps `CertificationCitation` reusable for certifications linked to multiple skills while preventing unrelated skill UI from adopting brand color solely because a color exists.

## Prevention

- Model optional visual assets explicitly. A color, logo path, and data URL are different capabilities; do not require all of them unless every consumer truly needs all of them.
- Add at least one real fixture for every fallback state. For this area, a color-only skill is required so tests prove the no-logo certification path is reachable through production code.
- Test shared metadata from each consumer boundary. A valid `SkillBrand` should be tested both by the metadata helper and by each component that interprets it differently.

## Related Issues

- `CONCEPTS.md`
