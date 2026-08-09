# DORA Continuous Delivery Evidence Design

## Goal

Replace the generic Continuous Delivery capability-card evidence with a
public-safe catalog of real atomic experiences and evidence-backed skills. Keep
the compact card intentionally limited to five experiences, retain the complete
catalog for a future capability page, and follow the existing Continuous
Integration architecture and presentation.

## Context

The GitHub Pages app already has the required shared evidence types, catalog,
score-owned compact projections, grouped `Experience` and `Skills` rows,
neutral skill tokens, brand-colored logos, and accessible row semantics. The
current Continuous Delivery score still selects three broad placeholders,
however, and has no skill projection or structured experience summary.

A private evidence source documents two delivery-platform eras from 2019 to
the 2026-08-09 snapshot. It may inform public portfolio records, but its source
identity, private system identifiers, paths, links, and prose must not enter
this repository.

The design follows DORA's published Continuous Delivery and Deployment
Automation terminology. In particular, public records use concepts such as
deployment automation, version control for production artifacts, the same
package for every environment, environment-specific configuration, recreating
environment state from version control, automated database migrations, and
independent deployment.

Official references:

- <https://dora.dev/capabilities/continuous-delivery/>
- <https://dora.dev/capabilities/deployment-automation/>
- <https://dora.dev/capabilities/database-change-management/>
- <https://dora.dev/capabilities/loosely-coupled-teams/>

## Recommended Approach

Extend the shared atomic evidence catalog and keep each capability's compact
projection explicit in its score.

- Add dedicated Continuous Delivery experience and skill data modules.
- Reuse existing Continuous Integration experiences when the same atomic
  accomplishment supports both capabilities.
- Add `continuous-delivery` to those shared records instead of copying their
  facts into competing records.
- Keep capability-specific skill records with focused support relationships.
- Store limitations as structured facts on related experiences, not as
  positive evidence tokens or a new evidence type.
- Add an optional personal evidence summary to the capability score for the
  `7+ years across two delivery platforms` statement.

This approach preserves the Capability Evidence Catalog as the source of truth
and leaves the existing card resolver and token components reusable. A separate
Continuous Delivery catalog would duplicate facts. A generalized evidence graph
with per-capability presentation overrides would add unnecessary domain and UI
complexity for this scope.

## Public Data Contract

### Capability summary

Add an optional field to `DoraCapabilityScore`:

```ts
readonly evidenceSummary?: string;
```

The Continuous Delivery score sets:

```ts
evidenceSummary: '7+ years across two delivery platforms';
```

The summary is personal evidence metadata, so it belongs to the score rather
than the global DORA capability definition. The display text deliberately uses
coarse public duration wording. It is supported by the exact internal evidence
period from `2019-07-05` through the `2026-08-09` snapshot: 7 years, 1 month,
and 4 days. Exact record and metric dates remain structured data for provenance,
chronological ordering, and tests, but are not rendered on compact evidence
tokens.

### Initiatives and dates

Reuse the established AWS CodePipeline and GitHub Actions monorepo initiatives
for the two platform eras. Move their constants to a shared evidence-initiative
module if importing them from the CI dataset would create the wrong ownership
direction.

Reused records retain their existing structured dates and metric snapshot
dates. The new AWS CodePipeline record uses `2019-07-05`, consistent with the
established platform evidence. New GitOps records use `2024-06-03`, the first
observed deployment event, rather than claiming an unproven implementation
date. New measurements use `2026-08-09`. Ongoing records omit `endedAt` because
a subset of the earlier platform remains operational.

Dates are not card content. They support internal ordering and a future detail
view.

## Atomic Experience Catalog

The Continuous Delivery catalog contains 17 experiences: twelve new records
and five reused cross-capability records.

### New AWS CodePipeline record

1. `codepipeline-approval-gated-deployment`
   - Label: `Approval-gated automation`
   - Title: `Approval-gated deployment automation`
   - Captures the automated deployment process through AWS CodePipeline, Helm,
     and Amazon EKS with one explicit manual production approval boundary.
   - Retains the measured 41 of 47 approval-gated pipelines and 561 approval
     observations, including the wait-time distribution.

### New GitOps records

1. `argocd-environment-state-from-version-control`
   - Label: `Environment state`
   - Title: `Environment state from version control`
   - Captures Argo CD reconciliation of demo state declared in version control,
     including automated sync, pruning, and self-healing.
2. `gitops-same-package-environments`
   - Label: `Same package`
   - Title: `Same package for every environment`
   - Captures shared Kustomize bases, separate environment configuration, and
     promotion of the same commit-addressed container package without rebuild.
   - Does not claim that manually synchronized production always runs the
     latest declared package.
3. `argocd-automated-database-migrations`
   - Label: `Database migrations`
   - Title: `Automated database migrations`
   - Captures version-controlled Argo CD `PreSync` migrations that fail the sync
     before a workload update.
4. `argocd-reliable-database-migrations`
   - Label: `Reliable migrations`
   - Title: `Reliable database migration process`
   - Captures stale-job cleanup, bounded retries, and the deployment timeout
     that make failed migration jobs recoverable.
5. `production-artifacts-version-control`
   - Label: `Production artifacts`
   - Title: `Version control for production artifacts`
   - Captures application and system configuration, deployment automation,
     infrastructure configuration, and alert rules stored in version control.
6. `sealed-secrets-version-control`
   - Label: `Encrypted configuration`
   - Title: `Version control for encrypted configuration`
   - Captures encrypted secret payloads in version control without plaintext
     secret values.
7. `serialized-deployment-process`
   - Label: `Reliable deployment`
   - Title: `Reliable serialized deployment process`
   - Captures deliberate serialization that prevents successful deployment
     inputs from being skipped.
8. `independent-service-deployment`
   - Label: `Independent deployment`
   - Title: `Independent service deployment`
   - Captures independently versioned service overlays and deployment state.
9. `small-batch-deployments`
   - Label: `Small batches`
   - Title: `Small-batch deployments`
   - Captures the measured 223 of 228 tag-changing commits that changed one
     service, while retaining the shared-library blast-radius limitation.
10. `deployment-health-checks`
    - Label: `Deployment health`
    - Title: `Deployment health checks`
    - Captures Argo CD health assessment and measured readiness, liveness, and
      disruption-budget coverage without claiming low-risk releases broadly.
11. `deployment-failure-notification`
    - Label: `Failure notification`
    - Title: `Deployment failure notification`
    - Captures actionable notification after delivery automation fails.
    - It must not be called proactive failure notification because it reports an
      existing failure rather than a threshold approaching failure.

### Reused cross-capability records

Add `continuous-delivery` to these existing records and refine their public
wording with DORA terminology where it remains accurate for CI:

1. `terraform-codepipeline-platform`
2. `ecr-immutable-promotion`
3. `github-actions-gitops-handoff`
4. `kustomize-tag-update-reliability`
5. `reusable-helm-deployment-image`

`github-actions-gitops-handoff` becomes the approved **Automated deployment
process** experience. Its facts cover the affected-service path from GitHub
Actions and Nx through version-controlled Kustomize configuration. Argo CD
environment reconciliation remains a separate record and responsibility.

Reusing these records may refine a label visible on the CI card. Any refinement
must remain truthful for both capabilities and retain the CI projection and
record identity.

## Compact Projection

Replace the three generic Continuous Delivery placeholders with these exact
five experience IDs in this order:

1. `codepipeline-approval-gated-deployment`
2. `github-actions-gitops-handoff`
3. `argocd-environment-state-from-version-control`
4. `gitops-same-package-environments`
5. `argocd-automated-database-migrations`

This projection deliberately gives one position to the earlier AWS
CodePipeline platform and four to the current GitOps platform. The score remains
4 of 5. The projection is literal score data; it is not derived with `slice()`,
runtime ranking, strength sorting, or catalog order.

Remove the superseded generic records after no projection references them:

- `github-actions-ci`
- `docker-delivery`
- `team-delivery-workflow`

## Structured Metrics and Limitations

Attach metrics to the experience that demonstrates them instead of rendering
metrics as separate experience tokens. Preserve the following public-safe
measurements where relevant:

- 41 of 47 pipelines with production approval gates;
- 561 approval observations, with the measured median, p90, and maximum wait;
- 20 services and 41 live Argo CD applications;
- 448 of 513 environment tag-update events created by automation;
- 223 of 228 tag-changing commits affecting one service;
- 259 automated demo deployments;
- 317-second median and 1,689-second p90 merge-to-demo lead time over 190
  traceable demo deployments; and
- configuration, automated-sync, migration, secret, and health-control counts
  with their real denominators.

The public wording must distinguish these concepts:

- a demo deployment is a completed deployment because demo reconciles
  automatically;
- a production tag update records deployment intent, not a completed production
  deployment; and
- retained production sync history is a lower bound, not a total.

Store these public-safe limitations as facts on the related records:

- production deployment requires manual intervention;
- production deployment frequency and lead time are not fully measurable;
- the deployment trigger does not verify successful build completion;
- automated rollback and progressive delivery are absent;
- deployment health controls have partial coverage; and
- production environment drift is not proactively detected.

Limitations are not standalone evidence items and do not appear as positive
tokens on the compact card.

## Skill Catalog

Add fourteen `type: 'skill'` records in this exact chronological and
delivery-flow order:

1. `continuous-delivery-skill-codepipeline` — AWS CodePipeline
2. `continuous-delivery-skill-github` — GitHub
3. `continuous-delivery-skill-docker` — Docker
4. `continuous-delivery-skill-ecr` — Amazon ECR
5. `continuous-delivery-skill-helm` — Helm
6. `continuous-delivery-skill-eks` — Amazon EKS
7. `continuous-delivery-skill-terraform` — Terraform
8. `continuous-delivery-skill-kubernetes` — Kubernetes
9. `continuous-delivery-skill-github-actions` — GitHub Actions
10. `continuous-delivery-skill-openid-connect` — OpenID Connect
11. `continuous-delivery-skill-nx` — Nx
12. `continuous-delivery-skill-kustomize` — Kustomize
13. `continuous-delivery-skill-argo-cd` — Argo CD
14. `continuous-delivery-skill-sealed-secrets` — Sealed Secrets

The earlier-platform skills share their earliest supported period and use the
approved delivery-flow order as the tie-breaker. The GitOps skills follow the
observed automated deployment flow.

Exclude AWS CodeBuild because the available work supports package creation and
testing more directly than delivery. Exclude IRSA, Slack, Prometheus,
Alertmanager, promtool, Loki, and Grafana Alloy from this skill row because they
are implementation mechanisms or stronger evidence for other DORA
capabilities. Do not add Git separately because GitHub already communicates the
version-control platform in this compact skill selection.

## Skill-To-Experience Relationships

Each skill has focused `supportingEvidenceIds`:

| Skill            | Supporting experiences                                                                                               |
| ---------------- | -------------------------------------------------------------------------------------------------------------------- |
| AWS CodePipeline | `codepipeline-approval-gated-deployment`, `terraform-codepipeline-platform`                                          |
| GitHub           | `codepipeline-approval-gated-deployment`, `github-actions-gitops-handoff`                                            |
| Docker           | `gitops-same-package-environments`, `reusable-helm-deployment-image`                                                 |
| Amazon ECR       | `ecr-immutable-promotion`, `gitops-same-package-environments`                                                        |
| Helm             | `codepipeline-approval-gated-deployment`, `reusable-helm-deployment-image`                                           |
| Amazon EKS       | `codepipeline-approval-gated-deployment`                                                                             |
| Terraform        | `terraform-codepipeline-platform`, `production-artifacts-version-control`                                            |
| Kubernetes       | `argocd-environment-state-from-version-control`, `argocd-automated-database-migrations`, `deployment-health-checks`  |
| GitHub Actions   | `github-actions-gitops-handoff`, `serialized-deployment-process`, `deployment-failure-notification`                  |
| OpenID Connect   | `github-actions-gitops-handoff`                                                                                      |
| Nx               | `github-actions-gitops-handoff`                                                                                      |
| Kustomize        | `github-actions-gitops-handoff`, `argocd-environment-state-from-version-control`, `gitops-same-package-environments` |
| Argo CD          | `argocd-environment-state-from-version-control`, `argocd-automated-database-migrations`                              |
| Sealed Secrets   | `sealed-secrets-version-control`                                                                                     |

Every support ID must resolve to a public non-skill experience that also
supports Continuous Delivery. Technology-name presence alone is insufficient.

## Card Presentation

Preserve the card hierarchy and add only the optional score summary:

1. capability heading;
2. existing capability description;
3. `<Text type="supporting" color="secondary">` evidence summary when present;
4. `Experience` evidence row; and
5. `Skills` evidence row.

The Continuous Delivery card renders `7+ years across two delivery platforms`
between its description and evidence rows. Other cards render no extra element
when `evidenceSummary` is absent.

Keep the current card width, spacing, token wrapping, row labels, list
semantics, accessible names, and citation behavior. Skills use the existing
neutral `SkillToken` variant: neutral surface, brand color only in a truthful
logo. Reuse existing local or Simple Icons assets. Add official local AWS assets
when required, record their provenance, and use text-only fallback when no
accurate logo exists.

## Privacy Rules

Public data must not contain:

- the private evidence source's repository name, URL, or path;
- employer, customer, organization, or regulated business-domain identity;
- private repository, project, service, application, workflow, script, module,
  image, or architecture names;
- contributor names, usernames, bot names, commit SHAs, or private commit
  subjects;
- AWS account IDs, regions, role ARNs, parameter paths, or other identifiers;
- internal API fields, proof links, Jira references, or Slack destinations; or
- prose copied from the private source.

Specific public technology names remain intact. Exact approved counts,
percentages, durations, and dates may be stored when their subjects are
generalized. Use phrases such as `services`, `version-controlled deployment
configuration`, `source monorepo`, `operations monorepo`, and `governance
requirements` where context is necessary.

New public records omit `organization` and `proofUrl`, set `isPublic: true`, and
must not set `isSensitive: true`.

## Error Handling and Integrity

The runtime resolver retains its current defensive behavior and skips unresolved
evidence IDs without crashing. Committed data must never rely on that fallback:
integrity tests reject unresolved IDs, type-count mismatches, unsupported
capability relationships, empty support arrays, skill-to-skill support, and
support IDs that do not resolve to Continuous Delivery experiences.

An unknown skill brand uses the existing truthful text-only fallback. Missing or
inaccurate icons must not be replaced with a visually similar but incorrect
brand.

## Validation

Focused data tests must assert:

- exactly 17 Continuous Delivery experiences;
- exactly 14 approved skills in exact order;
- exactly five compact experiences followed by all fourteen skill IDs;
- exact skill-to-experience relationships;
- shared records support both intended capabilities without duplicated facts;
- the three generic placeholder records are no longer referenced or stored;
- all experience and skill records are public-safe and capability-correct;
- every experience has structured facts and defensible internal chronology;
- metrics have valid values, units, denominators, and ISO snapshot dates;
- production tag updates are never labelled completed deployments;
- limitations remain attached to the relevant records;
- `evidenceSummary` is exactly `7+ years across two delivery platforms`;
- privacy assertions reject URLs, account-like values, parameter paths, private
  identity classes, and copied source identifiers without recording those
  identifiers in the public test suite; and
- adding unselected catalog evidence cannot change the compact projection.

Component and story tests must assert:

- the optional score summary renders with supporting secondary text;
- cards without a summary remain unchanged;
- the Continuous Delivery story uses shared production data;
- the visible `Experience` and `Skills` labels provide the accessible row names;
- the five experience tokens and fourteen skill tokens render in projection
  order; and
- neutral skill tokens retain accurate brand-colored logos or truthful
  text-only fallbacks.

Run focused data and component tests, then:

```bash
NX_DAEMON=false pnpm nx test github.io --skip-nx-cache
NX_DAEMON=false pnpm nx lint github.io --skip-nx-cache
NX_DAEMON=false pnpm nx build github.io --skip-nx-cache
NX_DAEMON=false pnpm nx build-storybook github.io --skip-nx-cache
```

Complete real-browser Storybook checks at `390x844` and `768x1024`. Verify the
summary, both evidence labels, token order, brand marks, wrapping, card width,
and absence of overflow or overlap.

## Out of Scope

- Building the dedicated Continuous Delivery capability page
- Fixing gaps in the private delivery systems
- Changing the Continuous Delivery score from 4 of 5
- Adding a new evidence type for limitations
- Displaying exact dates on compact evidence tokens
- Adding public proof links or private proof material
- Reworking other DORA capability datasets beyond shared record mappings
- Redesigning the shared card, evidence token, or skill token components

## Acceptance Criteria

- The public catalog stores the approved Continuous Delivery work as atomic,
  structured, public-safe records.
- Shared CI/CD accomplishments have one record and support both capabilities.
- Every displayed skill has focused supporting Continuous Delivery experience.
- The compact card shows the approved five experiences, fourteen skills, and
  `7+ years across two delivery platforms` summary in the agreed hierarchy.
- Evidence wording uses DORA capability terminology and does not overstate
  production automation or outcome measurement.
- The full catalog preserves approved metrics and limitations for a future
  detail page without exposing private source context.
- Focused, project-level, build, Storybook, accessibility, privacy, and
  responsive visual validation pass.
