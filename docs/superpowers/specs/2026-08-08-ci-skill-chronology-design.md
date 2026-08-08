# Continuous Integration Skill Chronology Design

## Goal

Order the Continuous Integration capability skills by the chronology of the
experience evidence that supports them, so the token sequence communicates the
move from the AWS CodePipeline platform to the Nx and GitHub Actions monorepo.

## Ordering Rule

The canonical order is oldest experience to newest experience. Each skill is
assigned to the earliest `startedAt` date among the experience records named by
its existing `supportingEvidenceIds`.

When multiple skills share the same earliest date, they are ordered by the
delivery workflow they supported rather than alphabetically. The tie-break
sequence moves from source or control, through build and configuration or
artifact handling, to deployment.

This is a curated data order. The application will not perform runtime date
sorting, and the skill records will not duplicate chronology in a new field.
The existing supporting-evidence relationships and their dated experience
records remain the source of the chronology.

## Canonical Order

| Earliest evidence | Skills in delivery-flow order |
| --- | --- |
| 2019-01-24 | AWS CodePipeline |
| 2019-03-06 | GitHub; AWS CodeBuild; AWS Systems Manager Parameter Store |
| 2019-07-05 | Terraform; Docker; Amazon ECR; Helm |
| 2024-02-28 | Nx; GitHub Actions |
| 2024-05-10 | OpenID Connect; Kustomize; Argo CD |

The resulting full sequence is:

1. AWS CodePipeline
2. GitHub
3. AWS CodeBuild
4. AWS Systems Manager Parameter Store
5. Terraform
6. Docker
7. Amazon ECR
8. Helm
9. Nx
10. GitHub Actions
11. OpenID Connect
12. Kustomize
13. Argo CD

## Data Changes

`continuousIntegrationSkillDefinitions` will be reordered into the canonical
sequence. Because it is the full skill catalog intended for later capability
pages, this makes chronological order the reusable default rather than a
card-only presentation choice.

The Continuous Integration score will retain its five current experience IDs
first and reorder its thirteen skill IDs to match the canonical catalog. The
card therefore continues to render Experiences before Skills while the skill
row tells the chronological migration story.

No skill is added or removed. Skill IDs, names, summaries, technologies,
supporting evidence IDs, icons, colors, evidence counts, score, strongest
evidence, and experience order remain unchanged.

## Validation

The skill-catalog test will resolve each skill's existing supporting evidence,
derive the earliest `details.period.startedAt` date, and assert both the
approved date cohorts and their delivery-flow order. This makes the reason for
the sequence visible in the contract instead of preserving an unexplained
array order.

The shared capability-data and Storybook contracts will assert that:

- the Continuous Integration card still selects five experience records and
  thirteen skill records;
- the five experience records remain unchanged and first;
- the thirteen card skill IDs match the canonical catalog IDs in order; and
- the visible skill titles match the approved sequence.

Final validation will run the focused CI catalog, capability-data, and
Storybook tests; the full `github.io` test, lint, build, and Storybook build
targets; and phone and iPad Storybook checks for wrapping and overflow after
the token reorder.

## Out Of Scope

- Runtime sorting or a generic chronology engine.
- Adding a duplicated first-evidenced date to skill records.
- Changing the five compact-card experience records or their order.
- Changing evidence content, dates, score calculation, visual styling,
  accessibility behavior, icons, or card layout.
- Reordering skills outside the Continuous Integration capability.
