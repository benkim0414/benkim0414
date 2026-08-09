# DORA Version Control And Trunk-Based Development Evidence Design

**Date:** 2026-08-09

## Goal

Replace the generic Version Control and Trunk-Based Development evidence on the
`github.io` DORA capability cards with public-safe, evidence-backed experience
and skill catalogs. Follow the existing Continuous Integration and Continuous
Delivery implementations as the architectural, content, accessibility, and
visual precedent.

The result must preserve complete atomic catalogs for future dedicated
capability pages while presenting an explicitly curated five-experience compact
projection and an achievement-led supplemental summary on each current card.

## Source And Privacy Boundary

The private capability evidence is research input only. Locate the relevant
private source directories rather than encoding or publishing their paths. No
private repository name, path, source file, URL, copied prose, or raw artifact
may enter the public repository.

Public evidence may retain accurate dates, durations, counts, percentages, and
metrics when their subjects are generalized. Public technology and practice
names remain specific when they are not private.

The Version Control and Trunk-Based Development data added or newly selected by
this feature will contain only affirmative, independently supportable
achievements. Negative findings, limitations, adverse metrics, and negative
source wording are excluded from the new catalogs. A positive fact extracted
from mixed evidence is admitted only when it remains accurate and understandable
without the omitted context. If removing context would make a claim misleading,
the entire candidate is omitted.

The selected shared Continuous Delivery records must also become positive-only:
remove negative limitation facts or adverse metrics from those records while
preserving their affirmative achievement, stable ID, public technologies, and
current compact-card presentation.

## Official DORA Framing

Use official DORA terminology where it accurately describes the evidence:

- Version Control emphasizes reproducibility, traceability, auditability, and
  keeping production artifacts, configuration, automation, and supporting
  assets in version control.
- Trunk-Based Development emphasizes one mainline, short-lived branches, small
  batches, frequent integration, and fast automated feedback before or after
  integration.

Official descriptions remain owned by the existing capability definitions.
The new summaries describe personal work and outcomes; they do not restate the
global DORA definitions.

## Recommended Architecture

Use a hybrid shared catalog.

- Reuse existing CI/CD atomic experience records when the accomplishment is
  genuinely identical.
- Add capability-specific experience modules for facts not already represented.
- Add separate capability-specific skill modules with focused
  `supportingEvidenceIds`.
- Compose all records into the existing global evidence catalog.
- Keep each compact projection literal and score-owned.
- Do not duplicate shared facts or add runtime ranking, sorting, or selection.

Add these modules beside the existing CI/CD modules:

- `version-control-evidence.data.ts`
- `version-control-skill-evidence.data.ts`
- `trunk-based-development-evidence.data.ts`
- `trunk-based-development-skill-evidence.data.ts`

The experience modules export the complete capability catalogs, including
references to reused shared records. The skill modules export canonical ordered
skill catalogs. New initiative constants extend the existing structured detail
model only where the current CI/CD initiatives do not describe the work.

## Data Contract

Every new experience remains a normal `CapabilityEvidenceItem` with:

- a stable public-safe ID;
- a concise three-to-four-word recruiting-oriented label where practical;
- a descriptive public title and achievement-led summary;
- `type: "experience"`;
- explicit capability mappings;
- public technologies;
- `isPublic: true` and no sensitive flag;
- evidence strength;
- initiative grouping;
- a structured start and optional end date;
- structured positive metrics; and
- generalized positive facts.

Dates use ISO `YYYY-MM-DD` values for provenance and chronology. They are not
rendered on compact cards. Metrics retain values, units, denominators, and
measurement dates only when the resulting public statement remains affirmative
and independently understandable.

Every skill remains a separate `CapabilityEvidenceItem` with:

- `type: "skill"`;
- a capability-specific stable ID;
- one focused public technology or practice title;
- capability-correct `supportingEvidenceIds`; and
- no duplicated chronology field.

A skill's chronology is derived from the earliest `details.period.startedAt`
among its supporting experiences. Equal dates use logical workflow order rather
than alphabetic order. The application does not sort at runtime; tests derive
the chronology independently and validate the curated array order.

## Version Control Catalog

The complete Version Control catalog contains nine experiences:

1. `codepipeline-webhook-trunk` — reused source-control and webhook-driven
   trunk delivery evidence; add the Version Control mapping.
2. `terraform-codepipeline-platform` — reused versioned delivery-platform
   infrastructure.
3. `reusable-helm-deployment-image` — reused versioned container and Helm
   delivery tooling.
4. `github-actions-gitops-handoff` — reused version-controlled deployment
   automation.
5. `argocd-environment-state-from-version-control` — reused GitOps environment
   state, with its negative limitation fact removed from the public record.
6. `gitops-same-package-environments` — reused immutable package promotion.
7. `argocd-automated-database-migrations` — reused automated migration
   evidence, retaining only affirmative public facts and metrics.
8. `merge-commit-history` — upgrade the existing generic record with measured,
   structured, merge-preserved traceability evidence.
9. `conventional-commit-governance` — new structured Conventional Commits
   governance and conformance evidence.

The explicit compact experience projection is:

1. `terraform-codepipeline-platform`
2. `github-actions-gitops-handoff`
3. `argocd-environment-state-from-version-control`
4. `argocd-automated-database-migrations`
5. `merge-commit-history`

This is a literal score-owned list. It does not use `slice()`, runtime ranking,
strength sorting, or catalog order. The strongest evidence is
`terraform-codepipeline-platform`.

The Version Control score keeps its existing non-visible `4/5` value and sets:

> Built and maintained version-controlled delivery platforms spanning reusable
> Terraform pipelines and GitOps-managed Kubernetes environments, with
> traceable infrastructure, configuration, automation, and database changes.

The complete Version Control skill catalog contains thirteen records in this
chronological order:

1. Git
2. GitHub
3. AWS CodePipeline
4. Terraform
5. Docker
6. Helm
7. Kubernetes
8. Nx
9. GitHub Actions
10. Conventional Commits
11. Husky
12. Kustomize
13. Argo CD

Git, GitHub, and AWS CodePipeline share the earliest supporting experience and
follow source-control workflow order within that cohort. Remaining date ties
follow infrastructure, packaging, orchestration, automation, governance, and
reconciliation workflow order.

The focused Version Control skill relationships are:

| Skill | Supporting experience IDs |
| --- | --- |
| Git | `codepipeline-webhook-trunk`, `merge-commit-history`, `conventional-commit-governance` |
| GitHub | `codepipeline-webhook-trunk`, `github-actions-gitops-handoff`, `merge-commit-history` |
| AWS CodePipeline | `codepipeline-webhook-trunk`, `terraform-codepipeline-platform` |
| Terraform | `terraform-codepipeline-platform` |
| Docker | `reusable-helm-deployment-image`, `gitops-same-package-environments` |
| Helm | `reusable-helm-deployment-image` |
| Kubernetes | `argocd-environment-state-from-version-control`, `argocd-automated-database-migrations` |
| Nx | `github-actions-gitops-handoff` |
| GitHub Actions | `github-actions-gitops-handoff` |
| Conventional Commits | `conventional-commit-governance` |
| Husky | `conventional-commit-governance` |
| Kustomize | `github-actions-gitops-handoff`, `argocd-environment-state-from-version-control`, `gitops-same-package-environments` |
| Argo CD | `github-actions-gitops-handoff`, `argocd-environment-state-from-version-control`, `argocd-automated-database-migrations` |

`commitlint` remains a public supporting technology and implementation fact in
the Conventional Commits evidence. It is not a skill token.

## Trunk-Based Development Catalog

The complete Trunk-Based Development catalog contains six experiences:

1. `single-trunk-repository-flow` — new structured evidence for maintaining a
   primary integration branch across two generalized delivery repositories.
2. `short-lived-branch-flow` — replace the generic content with narrowly scoped
   positive branch-integration measurements.
3. `small-change-landings` — new evidence for independently integrated small
   batches measured in commits, files, and lines.
4. `merge-commit-history` — shared traceable integration history.
5. `nx-affected-quality-gates` — reused affected-change feedback before
   integration.
6. `conventional-commit-governance` — shared small-change governance evidence.

Positive claims remain scoped to their measured population. For example, use
measured median integration times and supported proportions integrated within a
day rather than claiming that every branch was short-lived. Use the resolvable
merge population rather than universal merge wording.

The explicit compact experience projection is:

1. `single-trunk-repository-flow`
2. `short-lived-branch-flow`
3. `small-change-landings`
4. `nx-affected-quality-gates`
5. `merge-commit-history`

This is a literal score-owned list. The strongest evidence is
`single-trunk-repository-flow`.

The Trunk-Based Development score keeps its existing non-visible `4/5` value
and sets:

> Created and maintained single-trunk delivery repositories, integrating
> short-lived branches and small change batches with merge-preserved history
> and affected quality gates.

The complete Trunk-Based Development skill catalog contains six records in this
chronological and workflow order:

1. Git
2. GitHub
3. Nx
4. GitHub Actions
5. Conventional Commits
6. Husky

The focused Trunk-Based Development skill relationships are:

| Skill | Supporting experience IDs |
| --- | --- |
| Git | `single-trunk-repository-flow`, `short-lived-branch-flow`, `small-change-landings`, `merge-commit-history`, `conventional-commit-governance` |
| GitHub | `single-trunk-repository-flow`, `short-lived-branch-flow`, `merge-commit-history`, `nx-affected-quality-gates` |
| Nx | `nx-affected-quality-gates` |
| GitHub Actions | `nx-affected-quality-gates` |
| Conventional Commits | `conventional-commit-governance` |
| Husky | `conventional-commit-governance` |

## Positive Evidence Measurements

Public structured records may use the following positive measurements after
generalizing their subjects and preserving their measurement scope:

- two delivery repositories using a primary integration branch;
- 575 of 575 resolvable measured pull-request integrations preserving merge
  history;
- median branch integration times measured in minutes or hours;
- measured proportions integrated within one day;
- median landing sizes measured in files, lines, and carried commits; and
- positive Conventional Commits conformance across authored commits.

Evidence dates and measurement dates remain structured provenance. They are not
displayed in compact card content.

## Score Ownership And Referential Integrity

Each score continues to own:

- its literal five-experience projection;
- the ordered IDs from its complete skill catalog;
- `strongestEvidenceId`;
- exact evidence counts;
- its achievement-led `evidenceSummary`; and
- its existing non-visible score and maximum.

The Version Control counts are exactly five compact experiences plus thirteen
skills. The Trunk-Based Development counts are exactly five compact experiences
plus six skills.

Tests must reject:

- missing or duplicate IDs;
- projections that reference absent or capability-incompatible experiences;
- skills with absent or capability-incompatible supporting evidence;
- counts that differ from resolved evidence types;
- a strongest evidence ID that differs from the first compact experience;
- catalog order accidentally controlling compact content; and
- skill ordering inconsistent with supporting-experience chronology.

## Card Data Flow And Presentation

Preserve the existing data flow:

`atomic catalogs -> global evidence catalog -> score-owned projection -> resolver -> card rows`

For both cards:

- the five experience IDs populate `Relevant experience`;
- the complete skill IDs populate `Technical skills`;
- the score-owned summary appears beneath the official DORA description;
- experience records use the existing evidence-token renderer; and
- skills use the neutral `SkillToken` variant.

Recognized technologies retain truthful brand-colored logos. Conventional
Commits and any unsupported brand use the current truthful text-only fallback.
Do not add an invented logo or misleading brand color.

Preserve the existing grouping, dimensions, responsive behavior, wrapping,
visual hierarchy, and accessibility semantics. The lists retain the accessible
names `Relevant experience` and `Technical skills`.

Add production-backed Storybook stories for Version Control and Trunk-Based
Development. Stories select shared production evidence and scores instead of
duplicating fixtures.

For remote visual review, replace the current hard-coded non-local Storybook
allowed host with an environment-provided host. Keep `localhost` available by
default, but do not commit a Tailscale IP address, MagicDNS name, tailnet name,
or other private network identifier.

## Existing Generic Records

- Upgrade `short-lived-branch-flow` and `merge-commit-history` in place with
  real structured evidence and clearer three-to-four-word labels.
- Remove `protected-review-gates`; it does not satisfy the approved
  positive-only evidence rule.
- Remove superseded generic records from the two compact projections.
- Delete any other superseded record only when no score or supporting evidence
  references it.

## Privacy Validation

New and selected shared public records must not contain:

- private repository names or source paths;
- employer, organization, customer, or business-domain identities;
- service, workflow, module, feature, branch, image, or proprietary
  architecture names;
- individual or automation-account identities;
- repository slugs, internal URLs, hostnames, account identifiers, regions, or
  secret and parameter paths;
- copied private prose;
- `organization`, `proofUrl`, or sensitive flags; or
- negative findings, limitation prose, or adverse metrics.

Privacy tests use generalized forbidden-pattern classes rather than embedding
private identifiers. The temporary private clone and all raw evidence artifacts
remain outside the feature worktree and are never committed.

## Validation

Focused Version Control tests assert:

- exactly nine complete-catalog experiences;
- exactly thirteen skills in the approved order;
- exact skill-to-experience relationships;
- exactly five compact experiences in the approved order;
- exact strongest evidence, evidence counts, and summary;
- valid public structured details and positive metrics;
- all reused records are capability-correct; and
- adding an unselected catalog record cannot change the compact projection.

Focused Trunk-Based Development tests assert:

- exactly six complete-catalog experiences;
- exactly six skills in the approved order;
- exact skill-to-experience relationships;
- exactly five compact experiences in the approved order;
- exact strongest evidence, evidence counts, and summary;
- valid public structured details and positive metrics; and
- adding an unselected catalog record cannot change the compact projection.

Shared data and privacy tests assert:

- stable, unique, resolvable IDs;
- exact capability mappings and evidence-type counts;
- valid initiative IDs and ISO dates;
- finite non-negative metric values, valid units, valid percentages, and
  positive denominators;
- no private or negative content in new and selected shared records;
- no evidence dates in compact-card presentation; and
- no `slice()`, runtime ranking, runtime date sorting, or incidental catalog
  ordering in projections.

Component and Storybook tests assert:

- both new stories consume shared production data and scores;
- achievement summaries render exactly;
- five experience tokens precede the complete skill sequence;
- the row lists have accessible names `Relevant experience` and
  `Technical skills`;
- neutral skill surfaces preserve accurate brand-colored logos;
- Conventional Commits uses a truthful text fallback; and
- capabilities without supplemental evidence remain unchanged.

Run:

```bash
NX_DAEMON=false pnpm nx test github.io --skip-nx-cache
NX_DAEMON=false pnpm nx lint github.io --skip-nx-cache
NX_DAEMON=false pnpm nx build github.io --skip-nx-cache
NX_DAEMON=false pnpm nx build-storybook github.io --skip-nx-cache
```

Perform real-browser Storybook QA for both new stories at:

- phone: `390x844`;
- iPad: `768x1024`.

Inspect summary hierarchy, row labels, token order, brand marks, wrapping, card
width, clipping, overlap, and horizontal overflow. Stop for user visual approval
before running final code review and compounding the solution.

For the user iPad gate:

1. Resolve the workstation's current Tailscale IPv4 address at runtime.
2. Pass that address to Storybook through the environment-provided allowed-host
   setting.
3. Start the `github.io` Storybook target on `0.0.0.0:6006`.
4. Share the resulting Tailscale-only URL in the live session, never in a
   repository file or commit.
5. Keep the server running while the user reviews both new stories from an iPad
   connected to the same tailnet.
6. Record approval or requested visual changes, then stop the server when the
   review is complete.

## Error Handling

All evidence is local static TypeScript. This feature introduces no loading,
network, or runtime recovery state. Invalid data fails focused tests rather than
being silently filtered or partially rendered.

## Out Of Scope

- Recalibrating either `4/5` capability score.
- Rendering score values on cards.
- Dedicated capability detail pages.
- Runtime evidence ranking or filtering.
- New card layouts, dimensions, responsive rules, or evidence groups.
- Displaying evidence dates.
- Publishing negative evidence or private source material.
- Publishing a Tailscale address, MagicDNS name, or tailnet identifier.
- Refactoring unrelated DORA capabilities.
- Pushing, merging, deploying, or opening a pull request.

## Acceptance Criteria

- Version Control and Trunk-Based Development cards show real, public-safe,
  achievement-led evidence following the CI/CD precedent.
- Each capability retains a complete atomic experience catalog and a separate,
  chronologically validated skill catalog.
- Each compact card uses an explicit five-experience projection and a
  score-owned achievement summary.
- All skills have focused, valid supporting evidence relationships.
- New and selected shared public content contains no negative evidence or
  private identifiers.
- Existing card grouping, labels, accessibility, responsive behavior, and
  visual hierarchy remain unchanged.
- Focused tests, complete `github.io` tests, lint, app build, Storybook build,
  and phone/iPad Storybook QA pass.
- The user approves the visual result from an iPad over the Tailscale VPN before
  final code review and durable solution documentation.
- No push, merge, deployment, or handoff occurs without a separate explicit
  request.
