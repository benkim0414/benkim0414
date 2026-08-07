# DORA Continuous Integration Evidence Design

## Goal

Replace the illustrative evidence in the Continuous Integration DORA capability
card with public-safe, measured evidence from the portfolio owner's real work.
Store each contribution as an atomic record so later sessions can add other DORA
capabilities consistently and a future capability page can present the complete
evidence set.

## Context

`DoraCapabilityCard` already reads from the shared
`devOpsCapabilityEvidenceItems` catalog and uses the ordered `evidenceIds` in
`curatedDevOpsCapabilityRadarScores` to select the compact evidence shown for a
capability. The existing Continuous Integration story therefore has the correct
data flow, but its five selected records are broad and do not preserve the
measured detail now available.

The source material for this work lives in a private evidence repository. It may
inform the public portfolio data, but the private repository, private system
identifiers, and copied source prose must not appear in this repository.

## Recommended Approach

Enrich the existing `CapabilityEvidenceItem` domain model with optional,
structured public details. Keep each contribution in the shared catalog as the
single source of truth. The current card continues to render the compact fields
it already understands, while a future capability page can use the structured
initiative, period, metric, and fact fields.

This approach is preferred over a companion detail registry because it avoids
keeping two records synchronized. It is preferred over a Continuous
Integration-specific dataset because future capability sessions should use the
same evidence model rather than introduce incompatible schemas and adapters.

## Public Data Contract

Add optional structured details to `CapabilityEvidenceItem`:

```ts
type CapabilityEvidenceInitiativeId =
  | 'aws-codepipeline-platform'
  | 'github-actions-monorepo';

interface CapabilityEvidenceDetails {
  initiative: {
    id: CapabilityEvidenceInitiativeId;
    label: string;
  };
  period: {
    startedAt: string;
    endedAt?: string;
  };
  metrics: readonly CapabilityEvidenceMetric[];
  facts: readonly string[];
}

interface CapabilityEvidenceMetric {
  label: string;
  value: number;
  unit: 'count' | 'percent' | 'seconds';
  measuredAt: string;
  denominator?: number;
}
```

`startedAt`, `endedAt`, and `measuredAt` use ISO calendar dates in
`YYYY-MM-DD` form. `denominator` represents an explicit ratio such as 26 of 27
projects; it is omitted for standalone counts, durations, and percentages.
Monthly metrics use the last calendar day of the measured month. A partial
month uses the actual snapshot date.

The two initial initiative identities are reusable constants:

- `aws-codepipeline-platform`: **AWS CodePipeline platform**
- `github-actions-monorepo`: **GitHub Actions monorepo migration**

Every new record remains a normal `CapabilityEvidenceItem` with a compact
`label`, a descriptive `title`, a public-safe `summary`, explicit
`technologies`, `strength`, and `capabilityKeys`. Structured details supplement
those established fields; they do not replace them.

## Privacy Rules

The public catalog must not contain:

- the private evidence repository URL or name;
- employer names;
- private repository, service, workflow, or Terraform module names;
- AWS account IDs or regions;
- secret or AWS SSM parameter paths;
- business-domain identifiers; or
- prose copied directly from the private evidence source.

Use generalized context such as `standalone repositories`, `services`, `source
monorepo`, `operations monorepo`, and `private organization` where context is
needed. New records should omit `organization` and `url` because neither is
required to understand or render this evidence.

Specific public technology and skill terms should remain intact. Approved terms
include AWS CodePipeline, AWS CodeBuild, GitHub Actions, Nx, Terraform, Docker,
Amazon ECR, AWS Systems Manager Parameter Store, PostgreSQL, Kustomize, Argo CD,
Git, GitHub, OIDC, commitlint, Husky, and Slack.

Exact measurements, percentages, and dates are allowed when their labels and
surrounding text use generalized context and reveal no private identifier.

## Atomic Evidence Catalog

### AWS CodePipeline Platform

Store these separate contributions:

1. **Terraform pipelines**: designed a reusable Terraform delivery-platform
   module that provisioned AWS CodePipeline, AWS CodeBuild, and Amazon ECR
   resources consistently.
2. **CodeBuild PR gates**: configured pull-request webhooks, automated test
   execution, and GitHub build-status reporting.
3. **PostgreSQL test gates**: ran database-backed tests with PostgreSQL
   credentials resolved through AWS Systems Manager Parameter Store.
4. **CodeBuild tuning**: adjusted compute capacity and timeouts to maintain fast
   CI feedback across differently sized test suites.
5. **Immutable ECR promotion**: built Docker images once, tagged them by commit
   SHA, and promoted the same Amazon ECR artifact without rebuilding it.
6. **Webhook trunk delivery**: delivered changes from one trunk through
   webhook-driven AWS CodePipeline pipelines without long-lived release
   branches.

The structured details may preserve the generalized fleet measurements from the
source snapshot, including 47 pipelines, 105 build projects, 27 services, 39,114
total builds, 24,779 pull-request test builds, 27 of 27 test projects with
webhooks, 26 of 27 projects with the standard pull-request filter and status
reporting, and a 175-second median test feedback time. Each metric records the
source snapshot date, 2026-08-07.

### GitHub Actions Monorepo Migration

Store these separate contributions:

1. **Nx monorepo migration**: migrated standalone repositories into an Nx
   monorepo while preserving fast feedback through affected-only CI.
2. **Nx affected CI**: ran affected lint, unit, integration, and build targets
   for pull requests and the main branch with GitHub Actions.
3. **Container verification**: added end-to-end projects and Docker container
   health-check smoke tests.
4. **OIDC image publishing**: published commit-SHA Docker images to Amazon ECR
   from GitHub Actions through an OIDC-assumed role without static credentials.
5. **GitOps handoff**: dispatched deployment changes from the source monorepo to
   an operations monorepo, updated Kustomize image references, and let Argo CD
   reconcile the desired state.
6. **Tag-update reliability**: reworked unreliable batch tag updates with input
   validation, pinned tooling, compatibility handling, and safe skipping for
   undeployed projects, then measured the improvement.
7. **Failure notifications**: added Slack notification with a workflow-run link
   when deployment automation fails.
8. **Tested CI code**: added unit tests for cross-repository workflow-dispatch
   support code and containerized rule tests for automatically reconciled
   monitoring configuration.
9. **Commit conventions**: enforced conventional, reviewable commits with
   commitlint and Husky.

The structured details may preserve generalized measurements including a
2024-02-28 monorepo migration start, 20 services, 16 end-to-end projects, 15
shared packages, 430 test files, 629 build runs, a 179-second median build time,
249 deployment runs, an 85.9 percent deployment success rate, a 103-second
median deployment time, 251 tag-update runs, and a 15-second median tag-update
time. The reliability record may preserve the measured improvement from 30.4,
44.2, and 61.8 percent in March through May 2026 to 95.2 percent in June and 100
percent in July and August 2026. The August value is month-to-date. Metrics from
the source snapshot use 2026-08-07 as their measurement date; complete monthly
reliability metrics use the applicable month-end date.

## Card Selection

Keep the Continuous Integration score at 4 of 5. Replace its ordered
`evidenceIds` with these five records:

1. `terraform-codepipeline-platform`
2. `codebuild-pr-gates`
3. `nx-affected-quality-gates`
4. `github-actions-gitops-handoff`
5. `kustomize-tag-update-reliability`

Set `strongestEvidenceId` to `terraform-codepipeline-platform`. All five
selected records use the existing `experience` evidence type, so
`evidenceCounts` remains `{ experience: 5 }`.

This creates the approved two-plus-three balance between the established AWS
platform and the newer GitHub Actions/Nx platform. Exact measurements and dates
remain in structured details rather than the compact labels.

Enrich the existing `nx-affected-quality-gates` record instead of creating a
duplicate. Preserve broad evidence records that remain referenced by other DORA
capability scores. Remove `continuous-integration` from a broad record only when
the new atomic catalog completely replaces that CI meaning. Do not revise other
capability scores in this change.

## Storybook And UI Behavior

The existing `ContinuousIntegration` story continues to pass
`devOpsCapabilityEvidenceItems` and `curatedDevOpsCapabilityRadarScores` to
`DoraCapabilityCard`. It must not define a separate personal-data fixture.

The card layout remains unchanged:

- the capability title and description remain as they are;
- one compact evidence row renders the five selected labels in curated order;
- platform initiatives are not visible groups in this card; and
- structured metrics, periods, and facts are not rendered by the compact card.

The future dedicated capability page is responsible for retrieving every public
record mapped to `continuous-integration`, grouping the records by initiative,
and rendering their structured detail. That page is not part of this change.

## Validation And Error Handling

All data is local static TypeScript, so this feature has no loading, network, or
runtime recovery state. Invalid data should fail focused tests rather than
produce partial UI.

Tests must verify:

- evidence IDs are unique;
- every new record is public and maps to Continuous Integration;
- initiative IDs are recognized;
- dates use `YYYY-MM-DD`;
- metric values are finite and non-negative;
- percentages are between 0 and 100;
- denominators are positive when present;
- the curated score resolves exactly five evidence IDs in the approved order;
- the selection contains two AWS and three GitHub Actions/Nx records;
- `strongestEvidenceId` resolves to the first selected record;
- `evidenceCounts` matches the selected evidence types;
- the Storybook story renders the five compact labels from the shared catalog;
  and
- new public records contain no private URL or known private identifier.

Run focused DevOps capability evidence tests during implementation, followed by:

```bash
pnpm nx test github.io
pnpm nx lint github.io
pnpm nx build github.io
pnpm nx build-storybook github.io
```

## Out Of Scope

- Building the dedicated capability page
- Visually grouping the current card by initiative
- Changing the Continuous Integration score or defining a new scoring rubric
- Revising other capability scores
- Publishing or linking the private evidence repository
- Refreshing measurements from private systems
- Changing `DoraCapabilityCard` layout or interaction behavior

## Acceptance Criteria

- The shared public catalog stores the approved Continuous Integration work as
  atomic evidence records with structured initiative, period, metric, and fact
  details.
- Public data uses specific technology names and exact approved measurements
  without exposing private identifiers.
- The existing Continuous Integration card renders the approved top five in the
  agreed two-plus-three platform balance.
- The score remains 4 of 5 and other capability scores retain their behavior.
- The Storybook story uses shared production data rather than a story-only
  personal fixture.
- Focused and project-level validation passes.
