# DORA Test, Observability, Security, And Documentation Evidence Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Complete the Test Automation, Monitoring and Observability, Pervasive Security, and Documentation Quality DORA cards with public-safe experience and skill catalogs.

**Architecture:** Add capability-owned experience and skill modules, reuse shared accomplishments by canonical object identity, and compose all new arrays through the existing conflict-detecting catalog. Keep each score projection literal, preserve all four numeric scores, and render the new production data through the unchanged resolver and card.

**Tech Stack:** TypeScript, React 19, Vitest, Testing Library, Storybook 10, Nx 23, pnpm, Prettier.

## Global Constraints

- Work only in the linked `feat/dora-remaining-capability-cards` worktree.
- Treat the private capability packages as research input only; never publish their repository name, paths, URLs, raw prose, identifiers, destinations, authorship details, or deficit findings.
- Publish affirmative, public-safe records with ISO dates, finite non-negative metrics, meaningful denominators, and at least one fact.
- Preserve Test Automation `3/5`, Monitoring and Observability `3/5`, Pervasive Security `2/5`, and Documentation Quality `4/5`.
- Every compact projection contains exactly five literal experience IDs followed by a literal skill-ID list.
- Reuse the exact canonical object for shared evidence; a distinct object with the same ID remains an error.
- Every skill resolves to at least one public non-skill record carrying the same capability.
- Do not use `slice()`, runtime ranking, strength sorting, date sorting, or incidental catalog order for compact projections.
- Do not change the generic card layout, radar layout, AWS logo, or AWS IAM logo unless a focused regression proves a generic defect.
- Do not add the private source's Platform Engineering package or a new public capability key.
- Stage explicit paths only and create one conventional commit per task.

---

## File Structure

### New production files

- `apps/github.io/src/app/devops-capability-evidence/test-automation-evidence.data.ts` — complete Test Automation experience catalog.
- `apps/github.io/src/app/devops-capability-evidence/test-automation-skill-evidence.data.ts` — supported Test Automation skills.
- `apps/github.io/src/app/devops-capability-evidence/monitoring-observability-evidence.data.ts` — complete Monitoring and Observability experience catalog.
- `apps/github.io/src/app/devops-capability-evidence/monitoring-observability-skill-evidence.data.ts` — supported Monitoring and Observability skills.
- `apps/github.io/src/app/devops-capability-evidence/pervasive-security-evidence.data.ts` — complete Pervasive Security experience catalog.
- `apps/github.io/src/app/devops-capability-evidence/pervasive-security-skill-evidence.data.ts` — supported Pervasive Security skills.
- `apps/github.io/src/app/devops-capability-evidence/documentation-quality-evidence.data.ts` — complete Documentation Quality experience catalog.
- `apps/github.io/src/app/devops-capability-evidence/documentation-quality-skill-evidence.data.ts` — supported Documentation Quality skills.

### New focused tests

- Create one matching `.data.spec.ts` file for each production file above.

### Modified files

- `apps/github.io/src/app/devops-capability-evidence/devops-capability-evidence.types.ts` — four neutral initiative IDs.
- `apps/github.io/src/app/devops-capability-evidence/capability-evidence-initiatives.ts` — four neutral initiative definitions.
- Existing CI, deployment, and infrastructure evidence modules — capability mappings for canonical reuse.
- `apps/github.io/src/app/devops-capability-evidence/devops-capability-evidence.data.ts` — imports, aggregate composition, inline-record migration, and four literal scores.
- `apps/github.io/src/app/devops-capability-evidence/devops-capability-evidence.spec.ts` — aggregate, canonical, projection, count, and summary contracts.
- `apps/github.io/src/app/devops-capability-evidence/dora-capability-card.stories.tsx` — Test Automation and Pervasive Security production stories.
- `apps/github.io/src/app/devops-capability-evidence/dora-capability-card.stories.spec.ts` — all four story contracts.
- `apps/github.io/src/app/devops-capability-evidence/dora-capability-card.evidence.spec.ts` — exact row and summary projections.
- `apps/github.io/src/app/devops-capability-evidence/dora-capability-card.spec.tsx` — rendered token and accessibility contracts.
- `apps/github.io/src/app/skills/skill-brand.ts` and `skill-brand.spec.ts` — only truthful existing Simple Icons mappings needed by new skills.

---

### Task 1: Add Neutral Initiatives And Canonical Capability Mappings

**Files:**

- Modify: `apps/github.io/src/app/devops-capability-evidence/devops-capability-evidence.types.ts`
- Modify: `apps/github.io/src/app/devops-capability-evidence/capability-evidence-initiatives.ts`
- Modify: `apps/github.io/src/app/devops-capability-evidence/continuous-integration-evidence.data.ts`
- Modify: `apps/github.io/src/app/devops-capability-evidence/deployment-automation-evidence.data.ts`
- Test: existing focused specs for those modules

**Interfaces:**

- Consumes: `CapabilityEvidenceInitiativeId`, `capabilityEvidenceInitiatives`, and existing canonical records.
- Produces: `automatedTestingPractices`, `observabilityPlatform`, `securityGovernance`, and `documentationSystem` initiatives plus capability-compatible shared records.

- [ ] **Step 1: Write the failing initiative and mapping assertions**

Add exact initiative expectations:

```ts
expect(capabilityEvidenceInitiatives).toMatchObject({
  automatedTestingPractices: {
    id: 'automated-testing-practices',
    label: 'Automated testing practices',
  },
  observabilityPlatform: {
    id: 'observability-platform',
    label: 'Observability platform',
  },
  securityGovernance: {
    id: 'security-governance',
    label: 'Security governance',
  },
  documentationSystem: {
    id: 'documentation-system',
    label: 'Documentation system',
  },
});
```

Extend existing record expectations so:

```ts
expect(byId.get('codebuild-postgresql-tests')?.capabilityKeys).toContain(
  'test-automation',
);
expect(byId.get('tested-ci-automation')?.capabilityKeys).toContain(
  'test-automation',
);
expect(byId.get('automated-sealed-secret-delivery')?.capabilityKeys).toContain(
  'pervasive-security',
);
```

Keep the already compatible mappings on `nx-affected-quality-gates`,
`terraform-scoped-iam`, `irsa-service-accounts`, and
`image-digest-deployments` locked in their current specs.

- [ ] **Step 2: Run the focused tests to verify RED**

Run:

```bash
CI=true NX_DAEMON=false pnpm exec vitest run \
  apps/github.io/src/app/devops-capability-evidence/continuous-integration-evidence.data.spec.ts \
  apps/github.io/src/app/devops-capability-evidence/deployment-automation-evidence.data.spec.ts \
  apps/github.io/src/app/devops-capability-evidence/flexible-infrastructure-evidence.data.spec.ts
```

Expected: FAIL because the four initiative IDs and three new mappings are absent.

- [ ] **Step 3: Add the minimal typed initiatives and mappings**

Extend the ID union with:

```ts
| 'automated-testing-practices'
| 'observability-platform'
| 'security-governance'
| 'documentation-system'
```

Add the four initiative objects exactly as asserted and append capability keys
to the three canonical records. Do not rewrite their public accomplishment.

- [ ] **Step 4: Run the focused tests to verify GREEN**

Run the Step 2 command. Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add \
  apps/github.io/src/app/devops-capability-evidence/devops-capability-evidence.types.ts \
  apps/github.io/src/app/devops-capability-evidence/capability-evidence-initiatives.ts \
  apps/github.io/src/app/devops-capability-evidence/continuous-integration-evidence.data.ts \
  apps/github.io/src/app/devops-capability-evidence/continuous-integration-evidence.data.spec.ts \
  apps/github.io/src/app/devops-capability-evidence/deployment-automation-evidence.data.ts \
  apps/github.io/src/app/devops-capability-evidence/deployment-automation-evidence.data.spec.ts
git commit -m "feat(github.io): prepare remaining DORA evidence reuse"
```

---

### Task 2: Add Test Automation Experiences

**Files:**

- Create: `apps/github.io/src/app/devops-capability-evidence/test-automation-evidence.data.ts`
- Create: `apps/github.io/src/app/devops-capability-evidence/test-automation-evidence.data.spec.ts`

**Interfaces:**

- Consumes: `capabilityEvidenceInitiatives.automatedTestingPractices`, CI canonical records, and `CapabilityEvidenceItem`.
- Produces: `testAutomationEvidenceItems: readonly CapabilityEvidenceItem[]` in the approved eight-record order.

- [ ] **Step 1: Write the failing catalog contract**

Lock this order:

```ts
const expectedIds = [
  'codebuild-postgresql-tests',
  'tested-ci-automation',
  'jest-testcontainers-postgres',
  'regression-gates',
  'nx-affected-quality-gates',
  'container-health-smoke-tests',
  'service-generator-unit-tests',
  'prometheus-alert-rule-tests',
] as const;
```

For all eight records assert unique IDs, `type === 'experience'`, public and
non-sensitive status, Test Automation mapping, structured periods, valid
metrics, and at least one fact. Assert exact object identity for the three CI
records.

Use `expectPublicSafeEvidence(testAutomationEvidenceItems, approvedText)` with
an exact allowlist containing every title, label, summary, technology,
initiative label, metric label, and fact.

- [ ] **Step 2: Run the new test to verify RED**

Run:

```bash
CI=true NX_DAEMON=false pnpm exec vitest run \
  apps/github.io/src/app/devops-capability-evidence/test-automation-evidence.data.spec.ts
```

Expected: FAIL because the module does not exist.

- [ ] **Step 3: Implement the required-record helper and five owned records**

Use this boundary:

```ts
const sharedById = new Map(
  continuousIntegrationEvidenceItems.map((item) => [item.id, item]),
);

const requiredSharedExperience = (id: string): CapabilityEvidenceItem => {
  const item = sharedById.get(id);
  if (
    !item ||
    item.type !== 'experience' ||
    !item.capabilityKeys.includes('test-automation')
  ) {
    throw new Error(`Test Automation evidence requires shared record: ${id}`);
  }
  return item;
};
```

Create public records with these exact public concepts:

| ID                             | Title                                       | Label                        | Technologies                     | Positive proof                                                                  |
| ------------------------------ | ------------------------------------------- | ---------------------------- | -------------------------------- | ------------------------------------------------------------------------------- |
| `jest-testcontainers-postgres` | Jest and Testcontainers PostgreSQL coverage | PostgreSQL test environments | Jest, Testcontainers, PostgreSQL | Isolated database-backed suites provision and migrate PostgreSQL for each run.  |
| `regression-gates`             | Automated regression gates before merge     | Regression gates             | CI, Jest                         | Required regression checks gate merge decisions.                                |
| `container-health-smoke-tests` | Automated container health smoke tests      | Container smoke tests        | Docker, GitHub Actions           | Images are built, started, and polled through a health endpoint.                |
| `service-generator-unit-tests` | Unit-tested service onboarding generators   | Generator tests              | TypeScript, Jest                 | Service-generator behavior is protected by focused assertions.                  |
| `prometheus-alert-rule-tests`  | Automated Prometheus alert-rule tests       | Alert-rule tests             | Prometheus, promtool             | Alert rules run against declarative test cases using a pinned Prometheus image. |

Use the neutral automated-testing initiative, verified ISO periods, source-safe
metrics only, `organization: undefined`, `proofUrl: undefined`, and strengths
matching the design: Testcontainers `primary`, the three specialized tests
`strong`, regression gates `primary`.

Export the five owned objects interleaved with the three required shared objects
in `expectedIds` order.

- [ ] **Step 4: Run the focused test to verify GREEN**

Run the Step 2 command. Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add \
  apps/github.io/src/app/devops-capability-evidence/test-automation-evidence.data.ts \
  apps/github.io/src/app/devops-capability-evidence/test-automation-evidence.data.spec.ts
git commit -m "feat(github.io): add test automation evidence"
```

---

### Task 3: Add Test Automation Skills

**Files:**

- Create: `apps/github.io/src/app/devops-capability-evidence/test-automation-skill-evidence.data.ts`
- Create: `apps/github.io/src/app/devops-capability-evidence/test-automation-skill-evidence.data.spec.ts`

**Interfaces:**

- Consumes: `testAutomationEvidenceItems`.
- Produces: `testAutomationSkillEvidenceItems: readonly CapabilityEvidenceItem[]`.

- [ ] **Step 1: Write the failing skill contract**

Lock the exact set and stable IDs before applying the chronological display
contract:

```ts
const expectedSkillSet = [
  ['test-automation-skill-aws-codebuild', 'AWS CodeBuild'],
  ['test-automation-skill-postgresql', 'PostgreSQL'],
  [
    'test-automation-skill-parameter-store',
    'AWS Systems Manager Parameter Store',
  ],
  ['test-automation-skill-jest', 'Jest'],
  ['test-automation-skill-testcontainers', 'Testcontainers'],
  ['test-automation-skill-nx', 'Nx'],
  ['test-automation-skill-github-actions', 'GitHub Actions'],
  ['test-automation-skill-docker', 'Docker'],
  ['test-automation-skill-typescript', 'TypeScript'],
  ['test-automation-skill-prometheus', 'Prometheus'],
  ['test-automation-skill-promtool', 'promtool'],
] as const;
```

Assert set equality against `expectedSkillSet`. Separately resolve the earliest
support date for every skill and assert nondecreasing order; records sharing an
earliest date follow the workflow order represented in `expectedSkillSet`.
Assert focused support IDs, public skill shape, same-capability support, and
`expectPublicSafeEvidence` set equality. The production array's resulting order
becomes the literal order copied into the score in Task 10.

- [ ] **Step 2: Run the focused test to verify RED**

```bash
CI=true NX_DAEMON=false pnpm exec vitest run \
  apps/github.io/src/app/devops-capability-evidence/test-automation-skill-evidence.data.spec.ts
```

Expected: FAIL because the module does not exist.

- [ ] **Step 3: Implement the supported skill records**

Use a definition table and mapper:

```ts
const definitions = [
  {
    id: 'test-automation-skill-aws-codebuild',
    name: 'AWS CodeBuild',
    supports: ['codebuild-postgresql-tests'],
  },
  {
    id: 'test-automation-skill-postgresql',
    name: 'PostgreSQL',
    supports: ['codebuild-postgresql-tests', 'jest-testcontainers-postgres'],
  },
  {
    id: 'test-automation-skill-parameter-store',
    name: 'AWS Systems Manager Parameter Store',
    supports: ['codebuild-postgresql-tests'],
  },
  {
    id: 'test-automation-skill-jest',
    name: 'Jest',
    supports: [
      'jest-testcontainers-postgres',
      'regression-gates',
      'service-generator-unit-tests',
    ],
  },
  {
    id: 'test-automation-skill-testcontainers',
    name: 'Testcontainers',
    supports: ['jest-testcontainers-postgres'],
  },
  {
    id: 'test-automation-skill-nx',
    name: 'Nx',
    supports: ['nx-affected-quality-gates'],
  },
  {
    id: 'test-automation-skill-github-actions',
    name: 'GitHub Actions',
    supports: ['nx-affected-quality-gates', 'container-health-smoke-tests'],
  },
  {
    id: 'test-automation-skill-docker',
    name: 'Docker',
    supports: ['container-health-smoke-tests'],
  },
  {
    id: 'test-automation-skill-typescript',
    name: 'TypeScript',
    supports: ['service-generator-unit-tests'],
  },
  {
    id: 'test-automation-skill-prometheus',
    name: 'Prometheus',
    supports: ['prometheus-alert-rule-tests'],
  },
  {
    id: 'test-automation-skill-promtool',
    name: 'promtool',
    supports: ['prometheus-alert-rule-tests'],
  },
] as const;
```

Map each definition to a public supporting skill with `capabilityKeys:
['test-automation']`, `technologies: [name]`, `strength: 'supporting'`, and no
details, organization, proof URL, or date fields.

- [ ] **Step 4: Run both Test Automation tests to verify GREEN**

Run both Task 2 and Task 3 spec files. Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add \
  apps/github.io/src/app/devops-capability-evidence/test-automation-skill-evidence.data.ts \
  apps/github.io/src/app/devops-capability-evidence/test-automation-skill-evidence.data.spec.ts
git commit -m "feat(github.io): add test automation skills"
```

---

### Task 4: Add Pervasive Security Experiences

**Files:**

- Create: `apps/github.io/src/app/devops-capability-evidence/pervasive-security-evidence.data.ts`
- Create: `apps/github.io/src/app/devops-capability-evidence/pervasive-security-evidence.data.spec.ts`

**Interfaces:**

- Consumes: infrastructure and deployment catalogs plus `securityGovernance`.
- Produces: `pervasiveSecurityEvidenceItems` and the canonical `iam-security-alerting` record reused by Monitoring.

- [ ] **Step 1: Write the failing seven-record contract**

```ts
const expectedIds = [
  'terraform-scoped-iam',
  'iam-mfa-coverage',
  'iam-security-alerting',
  'irsa-service-accounts',
  'automated-sealed-secret-delivery',
  'kubernetes-rbac-governance',
  'image-digest-deployments',
] as const;
```

Assert canonical identity for four reused records and the same public,
structured, metric, fact, capability, and exact-text contracts used by Task 2.

- [ ] **Step 2: Run the focused test to verify RED**

```bash
CI=true NX_DAEMON=false pnpm exec vitest run \
  apps/github.io/src/app/devops-capability-evidence/pervasive-security-evidence.data.spec.ts
```

Expected: FAIL because the module does not exist.

- [ ] **Step 3: Implement shared lookup and three owned records**

Resolve shared records from the flexible-infrastructure and
deployment-automation arrays, checking `type === 'experience'` and the
`pervasive-security` capability key.

Create:

| ID                           | Title                                        | Label               | Technologies                         | Positive proof                                                                        |
| ---------------------------- | -------------------------------------------- | ------------------- | ------------------------------------ | ------------------------------------------------------------------------------------- |
| `iam-mfa-coverage`           | Complete MFA coverage for console identities | MFA coverage        | AWS IAM                              | Every verified console-capable identity uses MFA.                                     |
| `iam-security-alerting`      | Cloud identity security alerting             | IAM security alerts | AWS EventBridge, AWS Lambda, AWS IAM | Enabled identity-event rules route notifications and monitor delivery failure.        |
| `kubernetes-rbac-governance` | Declarative Kubernetes RBAC governance       | Kubernetes RBAC     | Kubernetes, Kubernetes RBAC          | Version-controlled role and binding definitions govern verified cluster access paths. |

Give `iam-security-alerting` both `pervasive-security` and
`monitoring-observability` capability keys. Use only aggregate MFA metrics; do
not publish identity names, destinations, regions, resource names, or exposure
findings.

- [ ] **Step 4: Run the focused test to verify GREEN**

Run Step 2. Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add \
  apps/github.io/src/app/devops-capability-evidence/pervasive-security-evidence.data.ts \
  apps/github.io/src/app/devops-capability-evidence/pervasive-security-evidence.data.spec.ts
git commit -m "feat(github.io): add pervasive security evidence"
```

---

### Task 5: Add Pervasive Security Skills

**Files:**

- Create: `apps/github.io/src/app/devops-capability-evidence/pervasive-security-skill-evidence.data.ts`
- Create: `apps/github.io/src/app/devops-capability-evidence/pervasive-security-skill-evidence.data.spec.ts`

**Interfaces:**

- Consumes: `pervasiveSecurityEvidenceItems`.
- Produces: twelve supported Pervasive Security skill records.

- [ ] **Step 1: Write the failing skill set and support contract**

Lock IDs for Terraform, AWS IAM, IRSA, OpenID Connect, Kubernetes, Kubernetes
RBAC, Sealed Secrets, Argo CD, AWS EventBridge, AWS Lambda, Docker, and Amazon
ECR as a set. Assert chronological earliest support, deterministic ties in that
listed workflow order, exact focused supports, public skill shape, and
public-text set equality. Freeze the resulting production order for Task 10.

- [ ] **Step 2: Run the focused test to verify RED**

```bash
CI=true NX_DAEMON=false pnpm exec vitest run \
  apps/github.io/src/app/devops-capability-evidence/pervasive-security-skill-evidence.data.spec.ts
```

Expected: FAIL because the module does not exist.

- [ ] **Step 3: Implement exact support relationships**

Use these minimum supports:

```ts
const expectedSupport = {
  Terraform: ['terraform-scoped-iam', 'irsa-service-accounts'],
  'AWS IAM': [
    'terraform-scoped-iam',
    'iam-mfa-coverage',
    'irsa-service-accounts',
  ],
  IRSA: ['irsa-service-accounts'],
  'OpenID Connect': ['irsa-service-accounts'],
  Kubernetes: [
    'irsa-service-accounts',
    'automated-sealed-secret-delivery',
    'kubernetes-rbac-governance',
  ],
  'Kubernetes RBAC': ['kubernetes-rbac-governance'],
  'Sealed Secrets': ['automated-sealed-secret-delivery'],
  'Argo CD': ['automated-sealed-secret-delivery'],
  'AWS EventBridge': ['iam-security-alerting'],
  'AWS Lambda': ['iam-security-alerting'],
  Docker: ['image-digest-deployments'],
  'Amazon ECR': ['image-digest-deployments'],
} as const;
```

Use `pervasive-security-skill-<slug>` IDs and the standard supporting-skill
shape.

- [ ] **Step 4: Run both security specs to verify GREEN**

Run Task 4 and Task 5 specs. Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add \
  apps/github.io/src/app/devops-capability-evidence/pervasive-security-skill-evidence.data.ts \
  apps/github.io/src/app/devops-capability-evidence/pervasive-security-skill-evidence.data.spec.ts
git commit -m "feat(github.io): add pervasive security skills"
```

---

### Task 6: Add Monitoring And Observability Experiences

**Files:**

- Create: `apps/github.io/src/app/devops-capability-evidence/monitoring-observability-evidence.data.ts`
- Create: `apps/github.io/src/app/devops-capability-evidence/monitoring-observability-evidence.data.spec.ts`

**Interfaces:**

- Consumes: `observabilityPlatform` and `pervasiveSecurityEvidenceItems`.
- Produces: `monitoringObservabilityEvidenceItems` in eight-record order.

- [ ] **Step 1: Write the failing catalog contract**

```ts
const expectedIds = [
  'version-controlled-observability-stack',
  'observability-dashboards-and-scrape-coverage',
  'prometheus-alert-and-recording-rules',
  'alertmanager-notification-routing',
  'alert-suppression-controls',
  'encrypted-alert-destinations',
  'tested-kubernetes-workload-alerts',
  'iam-security-alerting',
] as const;
```

Assert the standard public structured contract and exact object identity for
`iam-security-alerting`.

- [ ] **Step 2: Run the focused test to verify RED**

```bash
CI=true NX_DAEMON=false pnpm exec vitest run \
  apps/github.io/src/app/devops-capability-evidence/monitoring-observability-evidence.data.spec.ts
```

Expected: FAIL because the module does not exist.

- [ ] **Step 3: Implement seven owned records and one required shared record**

Use these public concepts:

| ID                                             | Title                                                   | Label                     | Technologies                                                    | Positive proof                                                                                      |
| ---------------------------------------------- | ------------------------------------------------------- | ------------------------- | --------------------------------------------------------------- | --------------------------------------------------------------------------------------------------- |
| `version-controlled-observability-stack`       | Version-controlled cloud native observability stack     | Observability stack       | Prometheus, Alertmanager, Loki, Grafana, Grafana Alloy, Argo CD | Monitoring components are delivered declaratively from version control.                             |
| `observability-dashboards-and-scrape-coverage` | Maintained dashboards and scrape coverage               | Dashboards and targets    | Grafana, Prometheus                                             | Public-safe aggregate dashboard and active-target measurements show maintained collection coverage. |
| `prometheus-alert-and-recording-rules`         | Version-controlled Prometheus alert and recording rules | Alert and recording rules | Prometheus                                                      | Alert and recording rules are managed declaratively.                                                |
| `alertmanager-notification-routing`            | Managed Alertmanager notification routing               | Notification routing      | Alertmanager                                                    | Alert routing is configured and delivered as part of the monitoring stack.                          |
| `alert-suppression-controls`                   | Tested alert suppression controls                       | Alert suppression         | Alertmanager, promtool                                          | Route and inhibition behavior is tested before delivery.                                            |
| `encrypted-alert-destinations`                 | Encrypted alert destination delivery                    | Encrypted destinations    | Sealed Secrets, Argo CD, Kubernetes                             | Alert destination material is delivered as encrypted declarative configuration.                     |
| `tested-kubernetes-workload-alerts`            | Tested Kubernetes workload failure alerts               | Workload alerts           | Prometheus, promtool, Kubernetes                                | Workload failure alerts include declarative test cases and documented operating limits.             |

Use public-safe aggregate metrics only. Do not publish receiver names,
destinations, cluster labels, resource names, blind-spot details, or durations
that describe a past absence of alerting.

- [ ] **Step 4: Run the focused test to verify GREEN**

Run Step 2. Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add \
  apps/github.io/src/app/devops-capability-evidence/monitoring-observability-evidence.data.ts \
  apps/github.io/src/app/devops-capability-evidence/monitoring-observability-evidence.data.spec.ts
git commit -m "feat(github.io): add observability evidence"
```

---

### Task 7: Add Monitoring And Observability Skills

**Files:**

- Create: `apps/github.io/src/app/devops-capability-evidence/monitoring-observability-skill-evidence.data.ts`
- Create: `apps/github.io/src/app/devops-capability-evidence/monitoring-observability-skill-evidence.data.spec.ts`

**Interfaces:**

- Consumes: `monitoringObservabilityEvidenceItems`.
- Produces: thirteen supported skill records.

- [ ] **Step 1: Write the failing skill and support contract**

Lock IDs for Prometheus, promtool, Alertmanager, Loki, Grafana, Grafana Alloy,
Kubernetes, Helm, Argo CD, Kustomize, Sealed Secrets, AWS EventBridge, and AWS
Lambda as a set. Assert chronological display order, deterministic ties in that
listed workflow order, support resolution, public shape, and exact text. Freeze
the resulting production order for Task 10.

- [ ] **Step 2: Run the focused test to verify RED**

```bash
CI=true NX_DAEMON=false pnpm exec vitest run \
  apps/github.io/src/app/devops-capability-evidence/monitoring-observability-skill-evidence.data.spec.ts
```

Expected: FAIL because the module does not exist.

- [ ] **Step 3: Implement focused supports**

Link platform technologies to `version-controlled-observability-stack`,
Prometheus to the stack/rule/workload records, promtool to suppression/workload
tests, Sealed Secrets to `encrypted-alert-destinations`, and EventBridge/Lambda
only to `iam-security-alerting`. Use `monitoring-observability-skill-<slug>` IDs
and the standard supporting-skill shape.

- [ ] **Step 4: Run both observability specs to verify GREEN**

Run Task 6 and Task 7 specs. Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add \
  apps/github.io/src/app/devops-capability-evidence/monitoring-observability-skill-evidence.data.ts \
  apps/github.io/src/app/devops-capability-evidence/monitoring-observability-skill-evidence.data.spec.ts
git commit -m "feat(github.io): add observability skills"
```

---

### Task 8: Add Documentation Quality Experiences

**Files:**

- Create: `apps/github.io/src/app/devops-capability-evidence/documentation-quality-evidence.data.ts`
- Create: `apps/github.io/src/app/devops-capability-evidence/documentation-quality-evidence.data.spec.ts`

**Interfaces:**

- Consumes: `documentationSystem`.
- Produces: `documentationQualityEvidenceItems` in six-record order.

- [ ] **Step 1: Write the failing catalog contract**

```ts
const expectedIds = [
  'structured-documentation-corpus',
  'indexed-solution-documentation',
  'documentation-frontmatter-contracts',
  'current-documentation-maintenance',
  'documentation-change-integration',
  'cross-verified-documentation-claims',
] as const;
```

Assert the standard public structured contract, exact text, positive metrics,
and absence of organization names, repository names, paths, authorship facts,
staleness findings, and unsupported automation claims.

- [ ] **Step 2: Run the focused test to verify RED**

```bash
CI=true NX_DAEMON=false pnpm exec vitest run \
  apps/github.io/src/app/devops-capability-evidence/documentation-quality-evidence.data.spec.ts
```

Expected: FAIL because the module does not exist.

- [ ] **Step 3: Implement the six source-derived records**

Use these public concepts:

| ID                                    | Title                                             | Label                  | Technologies   | Positive proof                                                                                                 |
| ------------------------------------- | ------------------------------------------------- | ---------------------- | -------------- | -------------------------------------------------------------------------------------------------------------- |
| `structured-documentation-corpus`     | Structured engineering documentation corpus       | Documentation corpus   | Markdown       | A substantial maintained body of engineering and operational prose is managed with the system.                 |
| `indexed-solution-documentation`      | Indexed solution documentation                    | Indexed solutions      | Markdown       | Every verified solution document is reachable from a maintained index.                                         |
| `documentation-frontmatter-contracts` | Structured documentation metadata                 | Documentation metadata | Markdown, YAML | Verified solution documents carry consistent retrieval metadata.                                               |
| `current-documentation-maintenance`   | Actively maintained documentation                 | Documentation currency | Markdown, Git  | A high proportion of the verified corpus was updated within the measured window.                               |
| `documentation-change-integration`    | Documentation integrated with engineering changes | Docs with changes      | Markdown, Git  | Documentation accompanies a meaningful share of engineering changes and is also committed as first-class work. |
| `cross-verified-documentation-claims` | Cross-verified operational documentation          | Verified claims        | Markdown       | Operational claims were independently checked by the related capability evidence work.                         |

Use only affirmative aggregate metrics. Do not claim automated documentation
validation, link checking, required documentation review, or a perception-survey
result.

- [ ] **Step 4: Run the focused test to verify GREEN**

Run Step 2. Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add \
  apps/github.io/src/app/devops-capability-evidence/documentation-quality-evidence.data.ts \
  apps/github.io/src/app/devops-capability-evidence/documentation-quality-evidence.data.spec.ts
git commit -m "feat(github.io): add documentation quality evidence"
```

---

### Task 9: Add Documentation Quality Skills

**Files:**

- Create: `apps/github.io/src/app/devops-capability-evidence/documentation-quality-skill-evidence.data.ts`
- Create: `apps/github.io/src/app/devops-capability-evidence/documentation-quality-skill-evidence.data.spec.ts`

**Interfaces:**

- Consumes: `documentationQualityEvidenceItems`.
- Produces: Markdown, YAML, and Git skill records.

- [ ] **Step 1: Write the failing exact skill contract**

```ts
const expectedSkills = [
  ['documentation-quality-skill-markdown', 'Markdown'],
  ['documentation-quality-skill-yaml', 'YAML'],
  ['documentation-quality-skill-git', 'Git'],
] as const;
```

Support Markdown from the corpus, index, metadata, maintenance, change, and
cross-verification records; YAML from metadata; and Git from maintenance and
change integration. Assert set equality, public shape, earliest-support
chronology, deterministic ties in the listed order, and exact text. Freeze the
resulting production order for Task 10.

- [ ] **Step 2: Run the focused test to verify RED**

```bash
CI=true NX_DAEMON=false pnpm exec vitest run \
  apps/github.io/src/app/devops-capability-evidence/documentation-quality-skill-evidence.data.spec.ts
```

Expected: FAIL because the module does not exist.

- [ ] **Step 3: Implement the three supported skills**

Use the standard mapper with `capabilityKeys: ['documentation-quality']`,
`technologies: [name]`, `strength: 'supporting'`, and the exact support sets from
Step 1. Do not add GitHub Actions, Python, or link-checker skills.

- [ ] **Step 4: Run both Documentation Quality specs to verify GREEN**

Run Task 8 and Task 9 specs. Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add \
  apps/github.io/src/app/devops-capability-evidence/documentation-quality-skill-evidence.data.ts \
  apps/github.io/src/app/devops-capability-evidence/documentation-quality-skill-evidence.data.spec.ts
git commit -m "feat(github.io): add documentation quality skills"
```

---

### Task 10: Compose All Catalogs And Curate Four Scores

**Files:**

- Modify: `apps/github.io/src/app/devops-capability-evidence/devops-capability-evidence.data.ts`
- Modify: `apps/github.io/src/app/devops-capability-evidence/devops-capability-evidence.spec.ts`

**Interfaces:**

- Consumes: all eight new arrays.
- Produces: globally resolvable canonical items and exact card projections.

- [ ] **Step 1: Write failing aggregate and score contracts**

Lock these experience projections before literal skill IDs:

```ts
const expectedExperiences = {
  'test-automation': [
    'jest-testcontainers-postgres',
    'prometheus-alert-rule-tests',
    'container-health-smoke-tests',
    'service-generator-unit-tests',
    'nx-affected-quality-gates',
  ],
  'monitoring-observability': [
    'version-controlled-observability-stack',
    'tested-kubernetes-workload-alerts',
    'alertmanager-notification-routing',
    'alert-suppression-controls',
    'encrypted-alert-destinations',
  ],
  'pervasive-security': [
    'terraform-scoped-iam',
    'iam-mfa-coverage',
    'iam-security-alerting',
    'irsa-service-accounts',
    'automated-sealed-secret-delivery',
  ],
  'documentation-quality': [
    'structured-documentation-corpus',
    'indexed-solution-documentation',
    'current-documentation-maintenance',
    'documentation-change-integration',
    'cross-verified-documentation-claims',
  ],
} as const;
```

Assert unchanged scores; strongest IDs equal the first experience; counts equal
`{ experience: 5, skill: 11 }`, `{ experience: 5, skill: 13 }`,
`{ experience: 5, skill: 12 }`, and `{ experience: 5, skill: 3 }`; and exact
summaries from the design spec. Assert all new module records occur in the
aggregate and shared records compose once by object identity.

Add a source-level assertion that these four score blocks do not contain
`.map(`, `slice(`, sorting, or a spread of a skill module.

- [ ] **Step 2: Run the aggregate test to verify RED**

```bash
CI=true NX_DAEMON=false pnpm exec vitest run \
  apps/github.io/src/app/devops-capability-evidence/devops-capability-evidence.spec.ts
```

Expected: FAIL because the new modules are not composed and the score records
still use generic projections.

- [ ] **Step 3: Compose arrays and remove migrated inline definitions**

Import all eight arrays and append them inside the existing
`composeCanonicalCapabilityEvidenceItems([...])` call. Remove the inline
definitions of `jest-testcontainers-postgres` and `regression-gates`; their
stable IDs now come from `testAutomationEvidenceItems`. Keep `portfolio-radar`,
`roadmap-repository`, Kubernetes learning, certification, and generic skill
records in the global catalog.

- [ ] **Step 4: Replace the four score records literally**

After each five-experience list, enumerate every skill ID from its approved
skill spec. Set exact strongest IDs, counts, and these summaries:

```ts
const summaries = {
  'test-automation':
    'Built automated test coverage across database-backed services, affected quality gates, service generators, Prometheus rules, and container health checks.',
  'monitoring-observability':
    'Built a version-controlled cloud native observability platform with tested workload alerts, routed notifications, suppression controls, and encrypted alert destinations.',
  'pervasive-security':
    'Implemented Terraform-managed least-privilege access, complete MFA coverage, identity security alerting, IRSA workload identity, and encrypted secret delivery.',
  'documentation-quality':
    'Maintained a structured, indexed, and current documentation system, integrating documentation with engineering changes and cross-verifying operational claims.',
} as const;
```

Add these four summaries to the aggregate test's reviewed public-text set and
assert bidirectional set equality so neither unreviewed nor stale score copy can
ship.

- [ ] **Step 5: Run aggregate and all eight module tests to verify GREEN**

Run the nine spec files. Expected: PASS with canonical reuse and exact literal
projections.

- [ ] **Step 6: Commit**

```bash
git add \
  apps/github.io/src/app/devops-capability-evidence/devops-capability-evidence.data.ts \
  apps/github.io/src/app/devops-capability-evidence/devops-capability-evidence.spec.ts
git commit -m "feat(github.io): curate remaining DORA cards"
```

---

### Task 11: Add Production Stories And Rendering Contracts

**Files:**

- Modify: `apps/github.io/src/app/devops-capability-evidence/dora-capability-card.stories.tsx`
- Modify: `apps/github.io/src/app/devops-capability-evidence/dora-capability-card.stories.spec.ts`
- Modify: `apps/github.io/src/app/devops-capability-evidence/dora-capability-card.evidence.spec.ts`
- Modify: `apps/github.io/src/app/devops-capability-evidence/dora-capability-card.spec.tsx`
- Modify when supported: `apps/github.io/src/app/skills/skill-brand.ts`
- Modify when supported: `apps/github.io/src/app/skills/skill-brand.spec.ts`

**Interfaces:**

- Consumes: production catalog, scores, descriptions, and existing card component.
- Produces: four verified production-data stories with truthful skill treatment.

- [ ] **Step 1: Write failing story and resolver assertions**

Assert `TestAutomation`, `MonitoringAndObservability`, `PervasiveSecurity`, and
`DocumentationQuality` use production evidence and scores. For each capability,
assert exact summary, five experience IDs in the approved order, exact skill
IDs, `Relevant experience` before `Technical skills`, and no rendered date.

- [ ] **Step 2: Run focused presentation tests to verify RED**

```bash
CI=true NX_DAEMON=false pnpm exec vitest run \
  apps/github.io/src/app/devops-capability-evidence/dora-capability-card.stories.spec.ts \
  apps/github.io/src/app/devops-capability-evidence/dora-capability-card.evidence.spec.ts \
  apps/github.io/src/app/devops-capability-evidence/dora-capability-card.spec.tsx \
  apps/github.io/src/app/skills/skill-brand.spec.ts
```

Expected: FAIL because Test Automation and Pervasive Security stories are
absent and old projections remain in expectations.

- [ ] **Step 3: Add the two missing stories**

Resolve definitions at module scope and add:

```ts
export const TestAutomation: Story = {
  args: {
    capability: testAutomation,
    description: doraCapabilityDescriptions['test-automation'],
  },
};

export const PervasiveSecurity: Story = {
  args: {
    capability: pervasiveSecurity,
    description: doraCapabilityDescriptions['pervasive-security'],
  },
};
```

Keep Monitoring and Documentation using the same production-data meta defaults.

- [ ] **Step 4: Add only truthful existing brand mappings**

Reuse available Simple Icons for Git, GitHub Actions, Docker, Grafana,
Prometheus, PostgreSQL, TypeScript, and YAML when already exported by the pinned
`simple-icons` package. Use color-only fallback for names without a truthful
icon. Leave AWS and AWS IAM unchanged; do not fabricate IRSA, promtool,
Kubernetes RBAC, Alertmanager, Loki, Alloy, or Sealed Secrets icons.

- [ ] **Step 5: Run focused presentation tests to verify GREEN**

Run Step 2. Expected: PASS with exact accessible rows and skill brands.

- [ ] **Step 6: Commit**

```bash
git add \
  apps/github.io/src/app/devops-capability-evidence/dora-capability-card.stories.tsx \
  apps/github.io/src/app/devops-capability-evidence/dora-capability-card.stories.spec.ts \
  apps/github.io/src/app/devops-capability-evidence/dora-capability-card.evidence.spec.ts \
  apps/github.io/src/app/devops-capability-evidence/dora-capability-card.spec.tsx \
  apps/github.io/src/app/skills/skill-brand.ts \
  apps/github.io/src/app/skills/skill-brand.spec.ts
git commit -m "feat(github.io): add remaining DORA card stories"
```

---

### Task 12: Full Verification, Browser QA, And Review Gate

**Files:**

- Modify only files implicated by a verified scoped defect.

**Interfaces:**

- Consumes: the complete branch implementation.
- Produces: green automated gates, responsive visual evidence, and a review-ready branch.

- [ ] **Step 1: Run every focused DORA data and presentation test**

Run:

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
  apps/github.io/src/app/devops-capability-evidence/dora-capability-card.evidence.spec.ts \
  apps/github.io/src/app/devops-capability-evidence/dora-capability-card.spec.tsx \
  apps/github.io/src/app/skills/skill-brand.spec.ts
```

Expected: PASS.

- [ ] **Step 2: Run project-wide gates**

```bash
CI=true NX_DAEMON=false pnpm nx test github.io --skip-nx-cache
CI=true NX_DAEMON=false pnpm nx lint github.io --skip-nx-cache
CI=true NX_DAEMON=false pnpm nx build github.io --skip-nx-cache
```

Expected: PASS. Record the existing Nx Vite path-plugin deprecation and known
jsdom warnings as non-blocking only when no new warning or failure appears.

- [ ] **Step 3: Run formatting and diff checks**

```bash
pnpm exec prettier --check \
  apps/github.io/src/app/devops-capability-evidence \
  apps/github.io/src/app/skills/skill-brand.ts \
  apps/github.io/src/app/skills/skill-brand.spec.ts
git diff --check
git status --short --branch
```

Expected: Prettier passes, no whitespace errors, and only intentional changes
remain.

- [ ] **Step 4: Inspect all four stories in a real browser**

Start Storybook on loopback and inspect Test Automation, Monitoring and
Observability, Pervasive Security, and Documentation Quality at `390x844` and
`768x1024`. Verify title and summary hierarchy, exact token order, truthful
logos, wrapping, card width, clipping, overlap, and horizontal overflow. Stop
the server after inspection.

- [ ] **Step 5: Request code review and resolve blocking findings**

Invoke `superpowers:requesting-code-review` against the approved spec and this
plan. Treat correctness, privacy, canonical identity, capability compatibility,
literal projection ownership, unsupported claims, accessibility, and regression
coverage as blocking. Apply each scoped concern with a focused failing test and
a separate conventional fix commit, then rerun Steps 1-3.

- [ ] **Step 6: Commit a verification fix only when files changed**

Stage only the files changed by verified review or browser findings and use a
scoped conventional subject such as:

```bash
git commit -m "fix(github.io): correct remaining DORA card evidence"
```

If no files changed, do not create an empty commit.
