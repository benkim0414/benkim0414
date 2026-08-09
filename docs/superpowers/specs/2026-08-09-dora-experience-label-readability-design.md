# Continuous Delivery Experience Label Readability Design

**Date:** 2026-08-09

## Goal

Improve the scanability of the five Continuous Delivery experience tokens by
using explicit three- or four-word labels. Preserve the full evidence titles
and all existing data, ordering, accessibility, layout, and presentation
contracts.

## Current Problem

The compact card is visually sound, but several experience labels are too
abstract when read without their full evidence titles. In particular,
`Environment state` and `Same package` do not communicate the independently
useful contribution as clearly as the underlying evidence does.

## Approach

Update only the `label` field of each experience selected by the Continuous
Delivery compact projection:

| Evidence ID                                     | Current label             | New label                            |
| ----------------------------------------------- | ------------------------- | ------------------------------------ |
| `codepipeline-approval-gated-deployment`        | Approval-gated automation | Approval-gated deployment automation |
| `github-actions-gitops-handoff`                 | Deployment automation     | Automated deployment process         |
| `argocd-environment-state-from-version-control` | Environment state         | Version-controlled environment state |
| `gitops-same-package-environments`              | Same package              | Same package across environments     |
| `argocd-automated-database-migrations`          | Database migrations       | Automated database migrations        |

These labels remain explicit stored data. They are not derived, truncated, or
ranked at runtime.

## Data And Accessibility

- Preserve every evidence ID, `title`, summary, capability mapping, strength,
  technology, metric, fact, limitation, initiative, and date.
- Preserve the exact five-experience compact projection and its order.
- Preserve the existing 14-skill projection and all skill relationships.
- Experience token accessible names continue to use the public label through
  the existing `CapabilityEvidence` renderer, so the clearer visible wording
  also improves the token's accessible name.
- The shared `github-actions-gitops-handoff` label changes in both Continuous
  Integration and Continuous Delivery projections because both capabilities
  intentionally reference the same atomic evidence record.

## Presentation

No component, spacing, typography, wrapping, card dimension, token variant, or
logo behavior changes are required. The existing flex-wrapped Experience row
must accommodate the longer labels at phone and iPad widths without horizontal
overflow or text clipping.

## Validation

- Update exact data and Storybook projection assertions for all five labels.
- Confirm the CI projection changes only the shared record's label; its IDs,
  ordering, count, skills, and score remain unchanged.
- Confirm the CD projection retains five experiences followed by 14 skills.
- Run focused evidence, card, and Storybook tests.
- Run the complete `github.io` tests and lint.
- Build the app and Storybook.
- Reinspect the Continuous Delivery Storybook example on phone and iPad for
  natural wrapping, row hierarchy, clipping, and horizontal overflow.

## Out Of Scope

- Changing evidence titles or underlying evidence facts.
- Adding a generic label-shortening algorithm.
- Rendering full titles inside compact tokens.
- Changing `CapabilityEvidence`, `DoraCapabilityCard`, `SkillToken`, or Astryx
  component styling.
- Changing experience or skill selection, ordering, scoring, or counts.
