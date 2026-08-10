# DORA Deployment Automation And Flexible Infrastructure Evidence Design

**Date:** 2026-08-10

## Goal

Replace the generic Deployment Automation and mixed Flexible Infrastructure
evidence on the `github.io` DORA capability cards with public-safe,
evidence-backed experience and skill catalogs. Follow the existing Continuous
Integration, Continuous Delivery, Version Control, and Trunk-Based Development
implementations as the architectural, content, accessibility, and visual
precedent.

The result preserves complete atomic catalogs for future dedicated capability
pages while presenting an explicitly curated five-experience compact projection
and an achievement-led supplemental summary on each current card.

## Source And Privacy Boundary

The private Deployment Automation capability package is research input only.
Its Deployment Automation findings supply the Deployment Automation catalog;
its Cloud Infrastructure findings supply the Flexible Infrastructure catalog.
There is no requirement for a separate private Flexible Infrastructure package.

No private repository name, filesystem path, source filename, URL, copied prose,
organization, account identifier, personal identity, internal service name,
workflow name, module path, image name, parameter path, or business-domain term
may enter the public repository.

Public evidence may retain accurate dates, durations, counts, percentages, and
metrics when their subjects are generalized. Public technology and practice
names remain specific when they are not private.

New and newly selected evidence contains only affirmative, independently
supportable achievements. Negative findings, limitations, adverse metrics, and
negative source wording are excluded. A positive fact extracted from mixed
evidence is admitted only when it remains accurate and understandable without
the omitted context. If removing context makes a claim misleading, omit the
candidate.

## DORA Framing

Deployment Automation demonstrates that deployment steps are automated,
repeatable, auditable, environment-consistent, and usable without a specialist
performing the routine path by hand.

Flexible Infrastructure uses the source package's Cloud Infrastructure framing:
infrastructure is provisioned and evolved through reusable, version-controlled
automation rather than bespoke console changes or per-service copies.

The public copy must describe demonstrated outcomes rather than restating DORA
definitions or presenting source limitations as portfolio evidence.

## Recommended Architecture

Use a hybrid shared catalog:

- reuse an existing atomic record when the accomplishment is genuinely the same;
- add capability-specific records for facts not already represented;
- add separate capability-owned skill modules with focused
  `supportingEvidenceIds`;
- compose all records into the existing global evidence catalog;
- keep each compact projection literal and score-owned; and
- do not duplicate shared facts or add runtime ranking, sorting, or selection.

Add these modules beside the existing capability modules:

- `deployment-automation-evidence.data.ts`
- `deployment-automation-skill-evidence.data.ts`
- `flexible-infrastructure-evidence.data.ts`
- `flexible-infrastructure-skill-evidence.data.ts`

Each experience module exports the complete capability catalog, including
references to reused shared records. Each skill module exports one canonical
ordered skill catalog. Focused helper functions resolve reused records and fail
during development or testing when an expected record is absent or does not
support the capability.

The production resolver keeps its existing defensive behavior for unresolved
score IDs. No new runtime error UI is introduced.

## Data Contract

Every new experience is a public `CapabilityEvidenceItem` with:

- a stable descriptive ID;
- a concise display label and descriptive title;
- `type: 'experience'`;
- the applicable capability keys;
- a generalized affirmative summary;
- specific public technologies;
- `isPublic: true`;
- an evidence strength;
- a structured period using the exact source dates available to the evidence;
- structured positive facts; and
- structured metrics with valid units and denominators where measured.

Every skill record has:

- a capability-prefixed stable ID;
- the official public technology or practice name;
- `type: 'skill'`;
- exactly one target capability key;
- `isPublic: true`;
- `strength: 'supporting'`; and
- a non-empty, focused list of supporting experience IDs.

Skill support must resolve to public experience records that share the skill's
capability. A technology string alone is not evidence of a skill.

Dates establish chronology for experience records and the earliest supported
date for each skill. Dates do not appear on compact-card evidence tokens.

## Deployment Automation Catalog

The complete Deployment Automation experience catalog contains nine records in
this order:

1. `merge-triggered-deployment-path` — a merge initiates a machine-to-machine
   deployment path. Preserve the positive measurements that all 252 sampled
   dispatches used the API-triggered path and 448 of 513 deployment events were
   automation-authored.
2. `environment-neutral-deployment-mechanism` — one base-and-overlay mechanism
   updates each environment without environment-specific deploy scripts.
   Preserve the positive measurements of 259 and 254 environment events through
   the same path and zero environment-named scripts among eleven inspected.
3. `generator-based-service-onboarding` — reusable Nx generators and templates
   provide a paved road for service onboarding. Preserve the measured population
   of twenty services, 79.5% mean core conformance, and eight services with all
   nine core files. Describe conformance, not unverifiable generator invocation.
4. `automated-sealed-secret-delivery` — encrypted declarative secrets reconcile
   to workloads through the automated delivery path. Preserve the positive
   inventory of 31 SealedSecret payloads; do not publish the manual creation
   limitation.
5. `deterministic-kubernetes-overlays` — all 39 inspected overlays build and
   reproduce byte-identical output on a second render, with zero build failures.
   This shared record supports both target capabilities.
6. `deployment-traceability-chain` — deployed artifacts remain traceable through
   immutable image references, source commits, deployment commits, and reviewed
   changes. Include only the independently complete positive traceability chain.
7. `codepipeline-approval-gated-deployment` — reuse the existing approval-gated
   delivery record after adding the Deployment Automation capability mapping.
8. `github-actions-gitops-handoff` — reuse the existing automated handoff record
   after adding the Deployment Automation capability mapping.
9. `image-digest-deployments` — reuse the existing immutable image digest record,
   preserving its stable ID and affirmative accomplishment.

The following private-source findings are deliberately excluded:

- unversioned or over-broad authorization;
- shared or unattributed release identities;
- failing or unwired regression suites;
- service-onboarding defects and worktree incompatibility;
- manual secret creation;
- manual deployment residue;
- deployment incidents, delayed releases, and blast radius; and
- any percentage whose omitted denominator or caveat would make it misleading.

### Deployment Automation Skills

The complete ordered skill catalog contains thirteen skills:

| Skill ID                                       | Title            | Focused support                                                                                                     |
| ---------------------------------------------- | ---------------- | ------------------------------------------------------------------------------------------------------------------- |
| `deployment-automation-skill-aws-codepipeline` | AWS CodePipeline | `codepipeline-approval-gated-deployment`                                                                            |
| `deployment-automation-skill-docker`           | Docker           | `deployment-traceability-chain`, `image-digest-deployments`                                                         |
| `deployment-automation-skill-amazon-ecr`       | Amazon ECR       | `deployment-traceability-chain`, `image-digest-deployments`                                                         |
| `deployment-automation-skill-terraform`        | Terraform        | `codepipeline-approval-gated-deployment`                                                                            |
| `deployment-automation-skill-kubernetes`       | Kubernetes       | `environment-neutral-deployment-mechanism`, `automated-sealed-secret-delivery`, `deterministic-kubernetes-overlays` |
| `deployment-automation-skill-github-actions`   | GitHub Actions   | `merge-triggered-deployment-path`, `github-actions-gitops-handoff`                                                  |
| `deployment-automation-skill-openid-connect`   | OpenID Connect   | `merge-triggered-deployment-path`                                                                                   |
| `deployment-automation-skill-nx`               | Nx               | `generator-based-service-onboarding`, `merge-triggered-deployment-path`                                             |
| `deployment-automation-skill-github-api`       | GitHub API       | `merge-triggered-deployment-path`                                                                                   |
| `deployment-automation-skill-kustomize`        | Kustomize        | `environment-neutral-deployment-mechanism`, `deterministic-kubernetes-overlays`                                     |
| `deployment-automation-skill-argo-cd`          | Argo CD          | `github-actions-gitops-handoff`, `automated-sealed-secret-delivery`                                                 |
| `deployment-automation-skill-gitops`           | GitOps           | `github-actions-gitops-handoff`, `environment-neutral-deployment-mechanism`                                         |
| `deployment-automation-skill-sealed-secrets`   | Sealed Secrets   | `automated-sealed-secret-delivery`                                                                                  |

The implementation derives each skill's earliest date from these exact support
IDs and verifies that the display order is nondecreasing by that chronology.

### Deployment Automation Compact Projection

Keep the existing non-visible score at `4/5`. The score owns these five literal
experience IDs, followed by all thirteen literal skill IDs in their canonical
order:

1. `merge-triggered-deployment-path`
2. `environment-neutral-deployment-mechanism`
3. `generator-based-service-onboarding`
4. `automated-sealed-secret-delivery`
5. `deterministic-kubernetes-overlays`

Set:

- `strongestEvidenceId: 'merge-triggered-deployment-path'`;
- `evidenceCounts: { experience: 5, skill: 13 }`; and
- `evidenceSummary` to:
  `Built merge-triggered deployment automation across environments, with
generator-based onboarding, automated secret delivery, and deterministic
Kubernetes rendering.`

## Flexible Infrastructure Catalog

The complete Flexible Infrastructure experience catalog contains seven records
in this order:

1. `terraform-managed-cloud-foundations` — Terraform owns the reusable cloud
   foundations. Preserve the positive inventory of thirteen Terraform roots and
   three managed container repositories without publishing private module paths.
2. `irsa-service-accounts` — preserve this stable shared ID while upgrading the
   legacy generic record to describe nine per-service IRSA modules, all nine
   wrapping the shared module. Remove the organization field and add structured
   public details.
3. `terraform-scoped-iam` — preserve this stable shared ID while upgrading the
   legacy generic record to current affirmative, organization-free, structured
   evidence.
4. `terraform-codepipeline-platform` — reuse the existing Terraform-provisioned
   delivery-platform record after adding the Flexible Infrastructure mapping.
5. `argocd-environment-state-from-version-control` — reuse the existing GitOps
   environment-state record after adding the Flexible Infrastructure mapping.
6. `deterministic-kubernetes-overlays` — reuse the shared record defined in the
   Deployment Automation catalog.
7. `reusable-kubernetes-deployment-foundations` — represent reusable Kubernetes
   deployment foundations supported by the existing public Helm and Kubernetes
   delivery evidence, without duplicating the underlying accomplishment.

The existing Kubernetes learning records, CNCF certification record, and generic
Kubernetes skill remain intact in the global catalog for other consumers. The
new Flexible Infrastructure compact card does not select them. It uses the same
five-experiences-plus-skills presentation model as the previously approved DORA
cards.

### Flexible Infrastructure Skills

The complete ordered skill catalog contains twelve skills:

| Skill ID                                   | Title      | Focused support                                                                                                                                             |
| ------------------------------------------ | ---------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `flexible-infrastructure-skill-terraform`  | Terraform  | `terraform-managed-cloud-foundations`, `irsa-service-accounts`, `terraform-scoped-iam`, `terraform-codepipeline-platform`                                   |
| `flexible-infrastructure-skill-aws`        | AWS        | `terraform-managed-cloud-foundations`, `terraform-codepipeline-platform`                                                                                    |
| `flexible-infrastructure-skill-aws-iam`    | AWS IAM    | `irsa-service-accounts`, `terraform-scoped-iam`                                                                                                             |
| `flexible-infrastructure-skill-irsa`       | IRSA       | `irsa-service-accounts`, `terraform-scoped-iam`                                                                                                             |
| `flexible-infrastructure-skill-kubernetes` | Kubernetes | `irsa-service-accounts`, `argocd-environment-state-from-version-control`, `deterministic-kubernetes-overlays`, `reusable-kubernetes-deployment-foundations` |
| `flexible-infrastructure-skill-kubectl`    | kubectl    | `reusable-kubernetes-deployment-foundations`                                                                                                                |
| `flexible-infrastructure-skill-kustomize`  | Kustomize  | `argocd-environment-state-from-version-control`, `deterministic-kubernetes-overlays`                                                                        |
| `flexible-infrastructure-skill-helm`       | Helm       | `reusable-kubernetes-deployment-foundations`                                                                                                                |
| `flexible-infrastructure-skill-argo-cd`    | Argo CD    | `argocd-environment-state-from-version-control`                                                                                                             |
| `flexible-infrastructure-skill-gitops`     | GitOps     | `argocd-environment-state-from-version-control`, `deterministic-kubernetes-overlays`                                                                        |
| `flexible-infrastructure-skill-docker`     | Docker     | `terraform-codepipeline-platform`, `reusable-kubernetes-deployment-foundations`                                                                             |
| `flexible-infrastructure-skill-amazon-ecr` | Amazon ECR | `terraform-managed-cloud-foundations`, `terraform-codepipeline-platform`                                                                                    |

The implementation derives each skill's earliest date from these exact support
IDs and verifies that the display order is nondecreasing by that chronology.

### Flexible Infrastructure Compact Projection

Keep the existing non-visible score at `4/5`. The score owns these five literal
experience IDs, followed by all twelve literal skill IDs in their canonical
order:

1. `terraform-managed-cloud-foundations`
2. `irsa-service-accounts`
3. `terraform-scoped-iam`
4. `terraform-codepipeline-platform`
5. `argocd-environment-state-from-version-control`

Set:

- `strongestEvidenceId: 'terraform-managed-cloud-foundations'`;
- `evidenceCounts: { experience: 5, skill: 12 }`; and
- `evidenceSummary` to:
  `Built reusable Terraform and Kubernetes foundations with workload identity,
scoped IAM, delivery-platform provisioning, and GitOps-managed environments.`

## Score Ownership And Referential Integrity

Each score owns:

- its literal five-experience projection;
- every literal skill ID in canonical order;
- `strongestEvidenceId`;
- exact evidence counts;
- its achievement-led `evidenceSummary`; and
- its unchanged non-visible score and maximum.

Do not use `slice()`, runtime ranking, runtime date sorting, catalog spreading,
or incidental catalog order to derive score evidence IDs. Adding an unselected
catalog record must not change either compact card.

Tests reject:

- missing or duplicate IDs;
- absent or capability-incompatible projection records;
- skills with absent, non-experience, or capability-incompatible support;
- counts that differ from resolved evidence types;
- a strongest evidence ID that differs from the first compact experience;
- catalog order accidentally controlling compact content; and
- skill ordering inconsistent with supporting-experience chronology.

## Card Data Flow And Presentation

The data flow remains:

```text
capability modules
  -> global evidence catalog
  -> score-owned literal ID projection
  -> existing card evidence resolver
  -> DoraCapabilityCard and production Storybook stories
```

Add production Storybook stories for both target capabilities. Each story uses
the real shared evidence catalog, capability description, and curated score.

Each card renders:

1. the capability title and existing DORA description;
2. the score-owned achievement summary;
3. a `Relevant experience` row with exactly five tokens; and
4. a `Technical skills` row with the complete ordered skill sequence.

Preserve the existing card component, resolver, typography, neutral skill-token
surface, accurate brand-colored logos, accessible token names, and responsive
behavior. Do not add capability-specific rendering branches.

## Privacy Validation

Focused privacy tests cover every new record and every reused record newly
selected by the two projections. Reject:

- non-public evidence;
- organization fields;
- proof URLs;
- private source or repository names;
- filesystem and parameter paths;
- employer, customer, client, and business-domain language;
- 12-digit account-like identifiers;
- internal service, workflow, module, and image names;
- raw personal identities; and
- narrowly defined negative or limitation wording.

The negative-language matcher must remain narrow enough to permit affirmative
phrases such as `without manual intervention` and `zero build failures`.

## Validation

Focused Deployment Automation tests assert:

- exactly nine complete-catalog experiences in the approved order;
- exactly thirteen skills in the approved order;
- exact skill-to-experience relationships;
- exactly five compact experiences in the approved order;
- the complete literal skill suffix;
- exact strongest evidence, counts, summary, and unchanged score;
- valid public structured details and positive metrics;
- capability-correct reused records; and
- catalog insertion or reordering cannot change the compact projection.

Focused Flexible Infrastructure tests assert:

- exactly seven complete-catalog experiences in the approved order;
- exactly twelve skills in the approved order;
- exact skill-to-experience relationships;
- exactly five compact experiences in the approved order;
- the complete literal skill suffix;
- exact strongest evidence, counts, summary, and unchanged score;
- valid public structured details and positive metrics;
- capability-correct reused records;
- legacy learning and certification evidence remains available but unselected;
  and
- catalog insertion or reordering cannot change the compact projection.

Shared data tests assert:

- stable, unique, resolvable IDs;
- exact capability mappings and evidence-type counts;
- valid initiative IDs and ISO dates;
- finite non-negative metrics, valid units, valid percentages, and positive
  denominators;
- no private or negative content in new and selected shared records;
- no dates in compact-card presentation; and
- no dynamic or incidental projection construction.

Component and Storybook tests assert:

- both stories consume shared production data and scores;
- achievement summaries render exactly;
- five experience tokens precede the complete skill sequence;
- row lists have accessible names `Relevant experience` and
  `Technical skills`;
- neutral skill surfaces preserve accurate brand-colored logos; and
- unrelated capability cards remain unchanged.

Run:

```bash
NX_DAEMON=false pnpm nx test github.io --skip-nx-cache
NX_DAEMON=false pnpm nx lint github.io --skip-nx-cache
NX_DAEMON=false pnpm nx build github.io --skip-nx-cache
NX_DAEMON=false pnpm nx build-storybook github.io --skip-nx-cache
```

Perform real-browser Storybook QA for both stories at:

- phone: `390x844`;
- iPad: `768x1024`.

Inspect summary hierarchy, row labels, token order, brand marks, wrapping, card
width, clipping, overlap, and horizontal overflow. Stop for user visual approval
before final code review.

For the user iPad gate:

1. Resolve the workstation's current Tailscale IPv4 address at runtime.
2. Pass that address through the existing environment-provided Storybook
   allowed-host setting.
3. Start the `github.io` Storybook target on `0.0.0.0:6006`.
4. Share the resulting Tailscale-only URL in the live session, never in a
   repository file or commit.
5. Keep the server running while the user reviews both stories from an iPad on
   the same tailnet.
6. Record approval or requested visual changes, then stop the server.

## Error Handling

Invalid data is a development-time contract failure, not a user-facing state.
Focused catalog resolution and integrity tests fail on absent, duplicated,
unsupported, private, malformed, or capability-incompatible evidence. The
existing production resolver continues to omit unresolved IDs defensively.

## Out Of Scope

- Changing either target capability's `4/5` score.
- Redesigning the DORA card or radar.
- Changing other capability projections except required shared capability keys.
- Publishing negative findings or private source artifacts.
- Modifying, recollecting, or committing to the private capability repository.
- Building dedicated capability pages.
- Adding new evidence types.
- Adding runtime ranking, sorting, truncation, or selection logic.
- Broad refactors unrelated to the two target catalogs.

## Acceptance Criteria

The design is implemented when:

- both complete public catalogs and both complete skill catalogs exist;
- every record satisfies the public structured-data contract;
- both score projections contain exactly five literal experiences followed by
  every literal skill ID in canonical order;
- the two summaries, strongest evidence IDs, counts, and unchanged scores are
  exact and tested;
- the Flexible Infrastructure card no longer selects legacy learning,
  certification, or the generic Kubernetes skill;
- both production Storybook stories render the intended shared data with the
  established accessible two-row hierarchy;
- focused and full verification commands pass;
- phone QA passes; and
- the user approves both cards at the iPad visual gate.
