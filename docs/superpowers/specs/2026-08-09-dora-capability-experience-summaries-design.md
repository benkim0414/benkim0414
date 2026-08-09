# DORA Capability Experience Summaries Design

**Date:** 2026-08-09

## Goal

Make the Continuous Integration and Continuous Delivery cards communicate what
was accomplished across the complete capability-relevant experience catalog.
Improve the scanability of the five selected CI experience tokens with
explicit three- or four-word labels.

## Card Information Hierarchy

Preserve the existing three-part hierarchy:

1. DORA capability name;
2. generic DORA capability description;
3. résumé-style supplemental experience summary.

The generic DORA description remains the capability definition and must not be
replaced with personal portfolio copy. The supplemental summary remains score-
owned data rendered through the existing
`<Text type="supporting" color="secondary">` element before the evidence rows.

## Approved Summaries

### Continuous Integration

> Built and evolved CI from reusable AWS CodePipeline and CodeBuild pipelines
> to monorepo GitHub Actions, with affected quality gates and immutable
> artifacts.

This sentence synthesizes the complete CI catalog's main progression:

- reusable Terraform-provisioned AWS delivery infrastructure;
- automated pull-request build and test feedback;
- migration from standalone repositories to an Nx monorepo;
- affected-change lint, test, integration, and build gates;
- immutable commit-addressed container artifacts;
- GitHub Actions automation and downstream deployment handoffs.

### Continuous Delivery

> Built approval-gated and GitOps delivery across AWS CodePipeline and GitHub
> Actions, with immutable artifacts, automated migrations, and reliable
> Kubernetes reconciliation.

This sentence synthesizes the complete CD catalog's main practices:

- approval-gated deployment automation;
- GitOps environment state and deployment reconciliation;
- promotion of the same immutable package across environments;
- automated, ordered database migrations;
- independently deployable small batches;
- deployment health and failure notification practices.

These summaries are generalized public portfolio copy. They retain truthful
public technology names but contain no private repository, project, service,
workflow, organization, account, path, URL, or architecture identifiers.

## Approved CI Experience Labels

Update only the labels of the five records selected by the CI compact
projection:

| Evidence ID                        | Current label                | New label                         |
| ---------------------------------- | ---------------------------- | --------------------------------- |
| `terraform-codepipeline-platform`  | Terraform pipelines          | Reusable Terraform CI pipelines   |
| `codebuild-pr-gates`               | CodeBuild PR gates           | Automated pull-request test gates |
| `nx-affected-quality-gates`        | Nx affected                  | Affected-change quality gates     |
| `github-actions-gitops-handoff`    | Automated deployment process | Automated deployment process      |
| `kustomize-tag-update-reliability` | Tag reliability              | Reliable Kustomize tag updates    |

The already approved shared deployment-process label remains unchanged. The
other four labels become explicit stored data; they are not generated,
truncated, or ranked at runtime.

## Data And Reuse

- Add the CI summary through the existing optional
  `DoraCapabilityScore.evidenceSummary` field.
- Replace the current CD duration-only summary with the approved action-oriented
  CD summary.
- Keep both summaries owned by their capability score so production cards and
  Storybook use the same data.
- Preserve the exact five CI experience IDs, five CD experience IDs, and their
  order.
- Preserve all CI and CD skill IDs, order, supporting-evidence relationships,
  counts, strongest evidence, and 4/5 scores.
- Preserve every evidence title, summary, metric, fact, limitation, technology,
  initiative, date, capability mapping, and stable ID.
- The four changed CI labels may appear in other cards that intentionally reuse
  the same atomic records; this is correct shared-data behavior.

## Accessibility And Presentation

- Visible experience-token text and its derived per-token aria-label use the
  same updated public label.
- Preserve the recruiter-friendly row labels `Relevant experience` and
  `Technical skills`.
- Preserve evidence row grouping, list semantics, wrapping, token variants,
  logos, card dimensions, gaps, and typography.
- Both summaries may wrap naturally but must not clip, overflow, or obscure the
  evidence rows at phone or iPad widths.

## Validation

- Assert the exact five CI display labels in the production Storybook
  projection and component accessible names.
- Assert the CI and CD score summaries exactly and verify capabilities without
  summaries still omit the supplemental element.
- Confirm CI remains five experiences plus 13 skills and CD remains five
  experiences plus 14 skills.
- Confirm IDs, projection order, strongest evidence, scores, and underlying
  record titles/data remain unchanged.
- Run focused data, score, resolver, card, Storybook, and privacy tests.
- Run complete `github.io` tests, lint, app build, and Storybook build.
- Reinspect both CI and CD stories on iPad for summary wrapping, token wrapping,
  row hierarchy, clipping, horizontal overflow, and logo stability.

## Out Of Scope

- Replacing or rewriting the generic DORA capability descriptions.
- Adding duration, metrics, dates, or numeric claims to either supplemental
  summary.
- Changing CI or CD evidence selection, ranking, ordering, scores, or counts.
- Changing the card component API, summary renderer, row labels, token
  component, styling, spacing, dimensions, or logos.
- Changing evidence titles or detailed public evidence content.
- Adding runtime summary or label generation.
