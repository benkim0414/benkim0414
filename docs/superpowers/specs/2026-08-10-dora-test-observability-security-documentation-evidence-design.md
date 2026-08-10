# DORA Test, Observability, Security, And Documentation Evidence Design

**Date:** 2026-08-10

## Goal

Complete the four remaining `github.io` DORA capability cards with public-safe,
evidence-backed experience and skill catalogs:

- Test Automation;
- Monitoring and Observability;
- Pervasive Security; and
- Documentation Quality.

The implementation follows the Continuous Integration, Continuous Delivery,
Version Control, Trunk-Based Development, Deployment Automation, and Flexible
Infrastructure precedent. Each capability owns a complete atomic catalog for
future detailed views and an explicit five-experience projection for the
current compact card.

## Source And Privacy Boundary

The private capability evidence packages are design-time research input only.
Their evidence documents, sanitized inventories, designs, and collection notes
establish which claims are supported and how measurements were derived. The
public repository must not depend on, import, link to, or identify that source.

Only positive, portfolio-appropriate evidence may be published. Do not publish:

- repository or organization names;
- filesystem paths, parameter paths, resource names, account-like values, or
  alert destinations;
- private URLs, proof URLs, commit hashes, authorship details, or individual
  identities;
- raw source prose or artifacts;
- security exposures, missing controls, monitoring gaps, stale documentation,
  test gaps, or other deficit-style findings; or
- measurements whose public wording would reveal a private operating context.

Public measurements must be affirmative, dated, finite, non-negative, and
traceable to the sanitized source. Counts and percentages may be used only when
their label, denominator, and date remain meaningful without private context.
The reviewed-public-text allowlist remains a publication contract, not a
substitute for judgment.

## Decisions Carried Forward

This design preserves the decisions made for the six implemented capability
cards:

1. A broad accomplishment is tokenized into independently reusable evidence
   records.
2. Capability modules own complete catalogs; score records own smaller compact
   projections.
3. A shared accomplishment reuses the exact canonical object. A distinct
   object with the same ID is a conflict.
4. Compact projections are literal and stable. They are not derived by
   `slice()`, runtime ranking, strength sorting, date sorting, or catalog order.
5. Skills are separate public evidence records supported by one or more
   capability-compatible non-skill records.
6. Capability-level supplemental copy is achievement-led and owned by the
   score record.
7. Private source dates and measurements are never rendered directly by the
   compact card.
8. The generic card component and resolver remain capability-neutral.

## Scope

### In Scope

- Four capability-owned experience modules and four capability-owned skill
  modules.
- Public structured details for source-derived experience records.
- Canonical reuse of existing CI, delivery, deployment, infrastructure, and
  generic records where the same accomplishment genuinely applies.
- Explicit score projections, strongest evidence, counts, and supplemental
  summaries for all four capabilities.
- Production-data Storybook coverage for all four cards.
- Focused catalog, privacy, referential-integrity, resolver, story, and visual
  regression coverage.

### Out Of Scope

- Recalibrating Test Automation `3/5`, Monitoring and Observability `3/5`,
  Pervasive Security `2/5`, or Documentation Quality `4/5`.
- Dedicated capability detail pages.
- Card or radar redesign.
- Publishing negative findings to explain a score.
- Modifying, recollecting, or committing to the private capability repository.
- The private source's Platform Engineering package or any new public DORA
  capability key.
- Refactoring unrelated capability catalogs.
- Changing existing AWS or AWS IAM logo behavior.

## Architecture

Add these production modules beside the existing capability evidence files:

- `test-automation-evidence.data.ts`
- `test-automation-skill-evidence.data.ts`
- `monitoring-observability-evidence.data.ts`
- `monitoring-observability-skill-evidence.data.ts`
- `pervasive-security-evidence.data.ts`
- `pervasive-security-skill-evidence.data.ts`
- `documentation-quality-evidence.data.ts`
- `documentation-quality-skill-evidence.data.ts`

Each module has a focused `.spec.ts` contract. Experience modules export the
complete capability catalog in an intentional deterministic order. Skill
modules export a separate intentional order and resolve their support against
the complete capability experience catalog.

The aggregate data module imports all eight arrays and appends them to
`devOpsCapabilityEvidenceItems` through
`composeCanonicalCapabilityEvidenceItems`. Existing inline records that become
capability-owned move into the relevant module without changing their stable
IDs. Records retained for other consumers remain in the global catalog even
when removed from a compact projection.

## Initiative And Detail Model

Source-derived experience records use the existing
`CapabilityEvidenceDetails` model:

- one public initiative label;
- an ISO start date and optional end date;
- zero or more public-safe measurements; and
- one or more affirmative facts.

Add these neutral initiative IDs because the existing delivery initiatives
cannot describe the work without distortion:

- `automated-testing-practices` — Automated testing practices;
- `observability-platform` — Observability platform;
- `security-governance` — Security governance; and
- `documentation-system` — Documentation system.

The labels describe the practice, not the private repository or organization.

Dates represent the earliest verified supporting change or the beginning of a
verified period. Snapshot metrics use their collection date as `measuredAt`.
Skill dates derive from the earliest record in `supportingEvidenceIds`; they are
not manually invented.

## Canonical Reuse Contract

Capability modules may import an existing catalog and resolve a required shared
experience by stable ID. The required-record helper must throw when:

- the ID is absent;
- the resolved record is not an experience; or
- the record does not include the requesting capability key.

Before reusing a record, update its single canonical definition to include the
new capability mapping and refine public wording only when it stays truthful for
every existing consumer. Do not copy a record merely to avoid an import.

The aggregate composer continues to:

- keep one occurrence when the same object reference appears more than once;
- preserve first-seen deterministic order; and
- throw for distinct objects carrying the same ID.

## Test Automation Catalog

The complete Test Automation experience catalog covers these positive proof
areas:

1. `codebuild-postgresql-tests` — reuse database-backed CodeBuild test gates and
   add the Test Automation mapping.
2. `tested-ci-automation` — reuse tested delivery-pipeline automation where its
   existing tests are the accomplishment.
3. `jest-testcontainers-postgres` — move the existing inline record into the
   Test Automation module and enrich it with the verified isolated PostgreSQL
   test-data practice.
4. `regression-gates` — move the existing inline pre-merge regression record
   into the Test Automation module.
5. `nx-affected-quality-gates` — reuse affected lint, unit, integration, and
   build gates.
6. `service-generator-unit-tests` — public evidence for unit-tested service
   onboarding generators.
7. `container-health-smoke-tests` — public evidence for building, starting, and
   health-checking container images.
8. `prometheus-alert-rule-tests` — public evidence for pinned-image Prometheus
   rule tests.

The compact projection is exactly:

1. `jest-testcontainers-postgres`
2. `prometheus-alert-rule-tests`
3. `container-health-smoke-tests`
4. `service-generator-unit-tests`
5. `nx-affected-quality-gates`

`jest-testcontainers-postgres` remains the strongest evidence. The score stays
`3/5`. The supplemental summary describes database-backed integration testing,
specialized rule and generator tests, container smoke tests, and affected
quality gates without claiming complete estate-wide test execution.

The exact score-owned summary is:

> Built automated test coverage across database-backed services, affected
> quality gates, service generators, Prometheus rules, and container health
> checks.

### Test Automation Skills

The skill catalog may include only skills supported by the complete experience
catalog. The approved capability-level set is:

1. AWS CodeBuild
2. PostgreSQL
3. AWS Systems Manager Parameter Store
4. Jest
5. Testcontainers
6. Nx
7. GitHub Actions
8. Docker
9. TypeScript
10. Prometheus
11. promtool

The final order is chronological by earliest supporting experience; ties follow
the workflow order within the same accomplishment. Each skill has a
capability-specific stable ID and focused support IDs.

## Monitoring And Observability Catalog

The complete Monitoring and Observability experience catalog covers:

1. `version-controlled-observability-stack` — declarative Prometheus,
   Alertmanager, Loki, Grafana Alloy, and dashboard delivery.
2. `observability-dashboards-and-scrape-coverage` — public-safe evidence of
   actively maintained dashboards and scrape coverage.
3. `prometheus-alert-and-recording-rules` — version-controlled alerting and
   recording-rule engineering.
4. `alertmanager-notification-routing` — routed notifications through a managed
   Alertmanager configuration.
5. `alert-suppression-controls` — tested routing, inhibition, and suppression
   behavior.
6. `encrypted-alert-destinations` — alert destination material delivered as
   encrypted declarative configuration.
7. `tested-kubernetes-workload-alerts` — tested workload failure alerts with
   their limitations documented during implementation.
8. `iam-security-alerting` — reuse the canonical cloud identity alerting record
   when introduced by the Pervasive Security catalog and map it to both
   capabilities.

The compact projection is exactly:

1. `version-controlled-observability-stack`
2. `tested-kubernetes-workload-alerts`
3. `alertmanager-notification-routing`
4. `alert-suppression-controls`
5. `encrypted-alert-destinations`

`version-controlled-observability-stack` is the strongest evidence. The score
stays `3/5`. The supplemental summary emphasizes a version-controlled cloud
native monitoring foundation, tested alerts, routed notifications, and
encrypted destinations without claiming application-level or business-level
coverage not supported by the source.

The exact score-owned summary is:

> Built a version-controlled cloud native observability platform with tested
> workload alerts, routed notifications, suppression controls, and encrypted
> alert destinations.

Existing learning and certification records such as kubectl practice, cluster
operations, and Kubernetes certification remain global records for other
surfaces. They are no longer the compact card's substitute for actual
observability experience.

### Monitoring And Observability Skills

The approved skill domains are:

1. Prometheus
2. promtool
3. Alertmanager
4. Loki
5. Grafana
6. Grafana Alloy
7. Kubernetes
8. Helm
9. Argo CD
10. Kustomize
11. Sealed Secrets
12. AWS EventBridge
13. AWS Lambda

Include EventBridge and Lambda only through the shared identity-alerting record.
The final order follows earliest supporting evidence and stable tie-breaking,
not the technology order above.

## Pervasive Security Catalog

The complete Pervasive Security experience catalog covers:

1. `terraform-scoped-iam` — reuse the canonical Terraform-managed scoped IAM
   record and enrich it only with public-safe least-privilege facts.
2. `iam-mfa-coverage` — public evidence for complete MFA coverage across the
   verified console-capable identity population.
3. `iam-security-alerting` — public evidence for healthy cloud identity event
   alerting and failure notification.
4. `irsa-service-accounts` — reuse the canonical Terraform-managed workload
   identity record.
5. `automated-sealed-secret-delivery` — add Pervasive Security to the canonical
   encrypted secret-delivery record.
6. `kubernetes-rbac-governance` — public evidence for declarative Kubernetes
   access governance, limited to verified positive controls.
7. `image-digest-deployments` — retain the existing immutable digest evidence as
   positive supply-chain hardening in the complete catalog.

The compact projection is exactly:

1. `terraform-scoped-iam`
2. `iam-mfa-coverage`
3. `iam-security-alerting`
4. `irsa-service-accounts`
5. `automated-sealed-secret-delivery`

`terraform-scoped-iam` becomes the strongest evidence because the source
identifies the scoped developer-access boundary as its strongest security
engineering. The score stays `2/5`. The supplemental summary describes scoped
access, MFA, security alerting, workload identity, and encrypted secret delivery
without implying pervasive shift-left, signing, attestation, or complete
governance.

The exact score-owned summary is:

> Implemented Terraform-managed least-privilege access, complete MFA coverage,
> identity security alerting, IRSA workload identity, and encrypted secret
> delivery.

### Pervasive Security Skills

The approved skill domains are:

1. Terraform
2. AWS IAM
3. IRSA
4. OpenID Connect
5. Kubernetes
6. Kubernetes RBAC
7. Sealed Secrets
8. Argo CD
9. AWS EventBridge
10. AWS Lambda
11. Docker
12. Amazon ECR

Skills must link to the smallest meaningful supporting set. Existing AWS and AWS
IAM brand treatment remains unchanged. Do not fabricate icons for IRSA,
Kubernetes RBAC, or security practices.

## Documentation Quality Catalog

The new source package replaces the current two-project compact projection. The
complete Documentation Quality experience catalog covers:

1. `structured-documentation-corpus` — a substantial maintained corpus of
   operational and engineering documentation.
2. `indexed-solution-documentation` — complete index reachability for the
   verified solution-document population.
3. `documentation-frontmatter-contracts` — consistent structured metadata that
   supports retrieval by topic and problem domain.
4. `current-documentation-maintenance` — a high proportion of the verified
   corpus edited within the source measurement window.
5. `documentation-change-integration` — documentation delivered alongside a
   meaningful share of system changes and through first-class documentation
   commits.
6. `cross-verified-documentation-claims` — documented operational claims
   independently re-tested by the source capability evidence work.

The compact projection is exactly:

1. `structured-documentation-corpus`
2. `indexed-solution-documentation`
3. `current-documentation-maintenance`
4. `documentation-change-integration`
5. `cross-verified-documentation-claims`

`structured-documentation-corpus` is the strongest evidence. The score stays
`4/5`. The supplemental summary emphasizes a structured, indexed, current
documentation system integrated with engineering changes and subject to
cross-checking. It must not claim automated documentation or link enforcement,
because the source explicitly does not demonstrate such a control.

The exact score-owned summary is:

> Maintained a structured, indexed, and current documentation system,
> integrating documentation with engineering changes and cross-verifying
> operational claims.

`portfolio-radar` and `roadmap-repository` remain in the global catalog for
their existing project and Version Control consumers, but neither appears in
the Documentation Quality compact projection.

### Documentation Quality Skills

The approved skills are intentionally narrow:

1. Markdown
2. YAML
3. Git

The documentation corpus and metadata records support Markdown and YAML. The
change-integration record supports Git. Do not infer GitHub Actions, link-checker,
or documentation-automation skills from collection scripts or unsupported
controls.

## Score Ownership

Each of the four `DoraCapabilityScore` records owns:

- the unchanged numeric score;
- the exact five experience IDs listed above;
- the complete capability-specific skill ID list in approved chronological
  order;
- `strongestEvidenceId` equal to the first compact experience;
- exact experience and skill counts; and
- an exact public-safe supplemental summary.

The exact `evidenceCounts` values are:

- Test Automation: `{ experience: 5, skill: 11 }`;
- Monitoring and Observability: `{ experience: 5, skill: 13 }`;
- Pervasive Security: `{ experience: 5, skill: 12 }`; and
- Documentation Quality: `{ experience: 5, skill: 3 }`.

The score must enumerate skill IDs literally. It must not spread or map the
module array at runtime. This makes skill additions, removals, and ordering
changes visible in the score diff, matching the stricter Version Control,
Trunk-Based Development, Deployment Automation, and Flexible Infrastructure
contract.

## Card Data Flow

The production flow remains:

```text
private research
  -> manually curated public capability modules
  -> conflict-detecting canonical catalog
  -> literal score-owned projection
  -> existing resolver
  -> unchanged DORA capability card
```

The resolver follows score order, resolves public evidence, and renders the
experience row before the skill row. It does not truncate or rank the complete
catalog. Dates and structured detail remain available for future detail views
but are not rendered on the compact card.

## Storybook And Presentation

Add production-data stories for Test Automation and Pervasive Security. Keep the
existing Monitoring and Observability and Documentation Quality stories, now
backed by their complete production catalogs and literal projections.

All four stories must preserve:

- the existing capability title and official description;
- the score and achievement-led summary hierarchy;
- `Relevant experience` and `Technical skills` accessible row names;
- exactly five experience tokens in score order;
- every approved skill token in score order;
- truthful icon and color treatment;
- readable wrapping at phone and tablet widths; and
- no clipping, overlap, or horizontal overflow.

No card CSS or component change is planned. A presentation change is permitted
only when browser verification reveals a regression caused by the new real data
and the fix remains generic for every capability.

## Failure Behavior

Fail early and descriptively when data contracts are broken:

- required shared record missing;
- required shared record has the wrong evidence type;
- required shared record lacks the capability mapping;
- skill support ID absent or capability-incompatible;
- score projection ID absent or capability-incompatible;
- strongest evidence absent from the projection;
- evidence counts disagree with the literal projection;
- distinct objects share an ID;
- a structured date, metric, denominator, or initiative is invalid; or
- public text violates the safety contract or reviewed-text set equality.

Do not silently filter broken records to make a test pass.

## Testing Strategy

### Capability Catalog Tests

For each experience module, assert:

- exact stable IDs and order;
- unique IDs;
- correct capability mappings;
- public, non-sensitive experience type;
- valid structured details and positive measurements;
- at least one affirmative fact;
- required shared-object identity; and
- exact approved public-facing text.

For each skill module, assert:

- exact stable IDs, titles, and order;
- public, non-sensitive skill type;
- non-empty, unique support IDs;
- every support resolves to a non-skill record for the same capability;
- date equals the earliest support date;
- nondecreasing chronological order with deterministic ties; and
- no unsupported skill inferred from a technology mention.

### Aggregate And Score Tests

Extend aggregate tests to assert:

- every record from all eight new modules appears in the global catalog;
- known shared records are the exact canonical objects;
- repeated references compose once;
- cloned same-ID records throw;
- all four scores retain their numeric values;
- exact five-experience projections and literal skill projections;
- exact strongest evidence, counts, and supplemental summaries;
- projection additions cannot follow incidental catalog changes; and
- generic retained records remain available to other consumers.

### Privacy Tests

Run every publication-facing string through the existing safety helper. Extend
the exact reviewed-text sets for the four complete catalogs and score summaries.
Tests must reject URLs, private names, absolute paths, parameter-like paths,
account-like values, resource identifiers, destinations, sensitive flags,
unreviewed text, and stale approved entries.

### Component And Story Tests

Assert that all four stories use shared production data and render:

- exact descriptions;
- unchanged scores;
- exact summaries;
- exactly five experience tokens;
- exact skill tokens;
- correct accessible names; and
- no date text in the compact presentation.

Browser-check the four stories at `390x844` and `768x1024` for hierarchy,
wrapping, card width, clipping, overlap, and horizontal overflow.

## Validation Commands

Implementation verification includes:

```bash
CI=true NX_DAEMON=false pnpm exec vitest run \
  apps/github.io/src/app/devops-capability-evidence/test-automation-evidence.data.spec.ts \
  apps/github.io/src/app/devops-capability-evidence/test-automation-skill-evidence.data.spec.ts \
  apps/github.io/src/app/devops-capability-evidence/monitoring-observability-evidence.data.spec.ts \
  apps/github.io/src/app/devops-capability-evidence/monitoring-observability-skill-evidence.data.spec.ts \
  apps/github.io/src/app/devops-capability-evidence/pervasive-security-evidence.data.spec.ts \
  apps/github.io/src/app/devops-capability-evidence/pervasive-security-skill-evidence.data.spec.ts \
  apps/github.io/src/app/devops-capability-evidence/documentation-quality-evidence.data.spec.ts \
  apps/github.io/src/app/devops-capability-evidence/documentation-quality-skill-evidence.data.spec.ts \
  apps/github.io/src/app/devops-capability-evidence/devops-capability-evidence.spec.ts \
  apps/github.io/src/app/devops-capability-evidence/dora-capability-card.stories.spec.ts \
  apps/github.io/src/app/devops-capability-evidence/dora-capability-card.spec.tsx

CI=true NX_DAEMON=false pnpm nx test github.io --skip-nx-cache
CI=true NX_DAEMON=false pnpm nx lint github.io --skip-nx-cache
CI=true NX_DAEMON=false pnpm nx build github.io --skip-nx-cache
pnpm exec prettier --check <changed-files>
git diff --check
```

The existing Nx Vite TypeScript-paths deprecation and known jsdom/browser-test
warnings are non-blocking unless this change introduces a new failure.

## Success Criteria

The work is complete when:

- all ten DORA capability keys have dedicated evidence-backed compact cards;
- these four capabilities have complete public experience and skill catalogs;
- every compact projection is explicit, stable, and exactly five experiences;
- every skill has focused capability-compatible support;
- all private-source boundaries and public-text contracts pass;
- Documentation Quality no longer relies on the two generic project records;
- Monitoring and Observability no longer relies on learning and certification
  records as a substitute for operational evidence;
- all four current scores remain unchanged;
- automated verification is green; and
- the four production-data stories pass responsive browser inspection.
