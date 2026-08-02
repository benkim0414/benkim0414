---
title: Make Certification Badge Storybook Fixtures Explicit
date: 2026-08-02
category: ui-bugs
module: github.io CNCF certification Storybook stories
problem_type: ui_bug
component: testing_framework
symptoms:
  - Direct CertificationCitation and CapabilityEvidence certification stories still rendered the Kubernetes skill-logo fallback during iPad visual review.
  - The CNCF badge implementation appeared absent in Storybook even though production certification data supplied explicit badge assets.
root_cause: test_isolation
resolution_type: code_fix
severity: low
related_components:
  - github.io CertificationCitation
  - github.io CapabilityEvidence
  - github.io CNCF certification badge data
  - Storybook
tags: [github-io, storybook, certifications, cncf, badges, visual-regression, test-fixtures]
---

# Make Certification Badge Storybook Fixtures Explicit

## Problem

CNCF credential badges were present in production data, but the direct `CertificationCitation` and capability-evidence Storybook fixtures did not supply them. On iPad Storybook review, those fixtures therefore displayed the Kubernetes skill fallback instead of the CKA, CKAD, or KCNA badge.

## Symptoms

- Certification stories with `skills: ['Kubernetes']` showed the Kubernetes brand icon rather than their credential-specific image.
- The discrepancy was limited to visual-review fixtures: the skills data already assigns KCNA, CKAD, and CKA their corresponding badge constants, as does the DevOps roadmap.
- The direct component stories looked unchanged even after `CertificationCitation` had been updated to prefer caller-supplied credential icons.

## What Didn't Work

Updating production skill and roadmap records alone did not update Storybook. Stories are independent arguments, and the affected fixtures still exercised skill-logo selection through their Kubernetes skill list rather than passing the explicit credential image.

The renderer was behaving as designed. `CertificationCitation` can derive a primary brand from `skills`, generate a skill-logo icon, and then choose `citationIcon ?? skillIcon` (`apps/github.io/src/app/certifications/certification-citation.tsx:37`, `apps/github.io/src/app/certifications/certification-citation.tsx:77`, `apps/github.io/src/app/certifications/certification-citation.tsx:83`). Without `citationIcon`, the Storybook fixtures were still testing the fallback path.

## Solution

Use the centralized badge map in every certification-oriented Storybook fixture. The badge map imports the local PNG assets and exposes stable `KCNA`, `CKAD`, and `CKA` keys (`apps/github.io/src/app/certifications/cncf-certification-badges.ts:1`, `apps/github.io/src/app/certifications/cncf-certification-badges.ts:5`).

```tsx
args: {
  citationIcon: cncfCertificationBadges.CKA,
  skills: ['Kubernetes'],
  title: 'CKA',
}
```

The direct citation stories now provide CKA for active and expired examples and CKAD for the multi-skill example (`apps/github.io/src/app/certifications/certification-citation.stories.tsx:16`, `apps/github.io/src/app/certifications/certification-citation.stories.tsx:27`, `apps/github.io/src/app/certifications/certification-citation.stories.tsx:38`).

Capability-evidence certification fixtures likewise pass CKA or KCNA on their evidence objects (`apps/github.io/src/app/devops-capability-evidence/capability-evidence.stories.tsx:160`, `apps/github.io/src/app/devops-capability-evidence/capability-evidence.stories.tsx:175`, `apps/github.io/src/app/devops-capability-evidence/capability-evidence.stories.tsx:191`).

Add fixture tests that assert the exact badge constant, so omission of `citationIcon` fails before visual review:

- `apps/github.io/src/app/certifications/certification-citation.stories.spec.ts:5`
- `apps/github.io/src/app/devops-capability-evidence/capability-evidence.stories.spec.ts:9`

## Why This Works

`CertificationCitation` selects `citationIcon` before the skill-generated icon. Passing the CNCF asset prevents `skills: ['Kubernetes']` from determining the displayed logo, while retaining skills for the component's other metadata and fallback coverage.

The fix also preserves the intentional fallback stories. The unbranded citation story still omits `citationIcon` and uses an unknown skill (`apps/github.io/src/app/certifications/certification-citation.stories.tsx:47`), so fallback behavior remains reviewable without confusing it with badge review.

## Prevention

- Treat Storybook certification stories as explicit visual fixtures, not as implicit consumers of production datasets.
- Add `citationIcon` whenever a story represents a credential with a dedicated image.
- Keep one intentionally unbranded story for fallback coverage.
- When adding a new credential badge, update each direct and capability-evidence certification story and assert its `args` value against the shared badge constants.
- During tablet or iPad Storybook review, first confirm the story under review is exercising the same prop path as the production surface being validated.

## Related Issues

- [Make Color-Only Certification Brand Fallbacks Reachable](../logic-errors/color-only-certification-brand-fallback.md) covers the production fallback-state model. This learning covers Storybook fixtures that accidentally exercised that fallback instead of the explicit credential image path.
- [Use Compact Capability Evidence Renderers](../design-patterns/compact-capability-evidence-renderers.md) documents the broader capability-evidence renderer model.
- [Verify Storybook From Linked Worktrees](../workflow-issues/verify-storybook-from-linked-worktree.md) captures the workflow side of running the correct Storybook source for visual review.
