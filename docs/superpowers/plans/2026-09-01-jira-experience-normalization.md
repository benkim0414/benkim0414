# Jira-Sourced Experience Normalization Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add six public-safe professional Experience entries (derived from delivered work history) to the github.io app, distinguish professional from personal experience with a new `kind` field, add the one missing skill (Sentry) to the catalog, and link the new experiences into skill detail pages.

**Architecture:** Pure data + type change. The `Experience` model gains a required `kind: 'professional' | 'personal'` discriminator. Six new entries are appended to `experience.data.ts`. `skill-list.data.ts` gains a `sentry` skill (the only catalog gap). `skill-detail.data.ts` records are extended/added so the new experiences actually render on skill detail pages (experiences only render through these records). No UI component changes.

**Tech Stack:** TypeScript, React, Nx monorepo, Vitest (specs run via `pnpm nx test github.io`), Storybook.

**Spec:** `docs/superpowers/specs/2026-09-01-jira-experience-normalization-design.md`

## Global Constraints

- Sanitization (from spec, applies to ALL committed text including this repo's tests): no employer name, no internal system or service names, no customer or person names, no ticket keys (pattern `\b[A-Z][A-Z0-9]+-\d+\b`), no incident dates, no infrastructure identifiers. Narratives describe capability and approach only.
- Every experience entry: `isPublic: true`, `isSensitive` never set, exactly 3 narrative paragraphs.
- `skillIds` must resolve against `skill-list.data.ts`; `projectIds` is `[]` on professional entries; `supportingEvidenceIds` omitted on professional entries.
- Commit style: conventional commits, one logical change per commit, stage specific files only (never `git add -A`). No `Co-Authored-By` trailers (user instruction for this work).
- Verification commands: `pnpm nx test github.io`, `pnpm nx lint github.io`, `pnpm nx build github.io`, `pnpm nx build-storybook github.io`. Known environment hazard: if pnpm fails with `[ERR_SQLITE_ERROR] unable to open database file`, that is a local pnpm store issue, not a code failure — retry once, then report it rather than claiming success or failure.
- All paths below are relative to the repo root (the worktree). App source lives in `apps/github.io/src/app/`.

---

### Task 1: Add `kind` field to the Experience model

**Files:**
- Modify: `apps/github.io/src/app/experience/experience.types.ts`
- Modify: `apps/github.io/src/app/experience/experience.data.ts`
- Test: `apps/github.io/src/app/experience/experience.data.spec.ts`

**Interfaces:**
- Consumes: existing `Experience` interface.
- Produces: `Experience.kind: 'professional' | 'personal'` (required, readonly). Task 3 relies on this field existing and on the homelab entry carrying `kind: 'personal'`.

- [ ] **Step 1: Write the failing test**

Add to the existing `describe('experiences', ...)` block in `apps/github.io/src/app/experience/experience.data.spec.ts`:

```ts
it('declares a kind on every entry', () => {
  for (const experience of experiences) {
    expect(['professional', 'personal']).toContain(experience.kind);
  }
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm nx test github.io -- src/app/experience/experience.data.spec.ts`
Expected: FAIL — `experience.kind` is `undefined` (and TypeScript may report the property does not exist; either failure mode is the expected red).

- [ ] **Step 3: Write minimal implementation**

In `apps/github.io/src/app/experience/experience.types.ts`, add to the `Experience` interface (after `readonly title: string;` line, keeping field order readable):

```ts
export interface Experience {
  readonly id: string;
  readonly kind: 'professional' | 'personal';
  readonly title: string;
  // ...rest unchanged...
}
```

In `apps/github.io/src/app/experience/experience.data.ts`, add to the existing homelab-backed entry (immediately after `id: 'aws-codepipeline-codebuild-multistage-delivery',`):

```ts
    kind: 'personal',
```

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm nx test github.io -- src/app/experience/experience.data.spec.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add apps/github.io/src/app/experience/experience.types.ts apps/github.io/src/app/experience/experience.data.ts apps/github.io/src/app/experience/experience.data.spec.ts
git commit -m "feat(experience): distinguish professional and personal entries with kind field"
```

---

### Task 2: Add Sentry to the skill catalog

**Files:**
- Modify: `apps/github.io/src/app/skills/skill-list.data.ts`
- Modify: `apps/github.io/src/app/skills/skill-brand.ts`
- Test: `apps/github.io/src/app/skills/skill-list.data.spec.ts`

**Interfaces:**
- Consumes: `Skill` interface from `skill-list.types.ts`.
- Produces: catalog skill with `id: 'sentry'`, `name: 'Sentry'`. Task 3 entries reference `'sentry'` in `skillIds`; Task 4 adds a detail record with `skillId: 'sentry'`.

- [ ] **Step 1: Write the failing test**

`skill-list.data.spec.ts` contains a test `'stores the requested local skill catalog'` with an exact ordered array of skill ids. Insert `'sentry'` between `'sealed-secrets'` and `'storybook'` in that array.

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm nx test github.io -- src/app/skills/skill-list.data.spec.ts`
Expected: FAIL — received array does not contain `'sentry'`.

- [ ] **Step 3: Write minimal implementation**

In `apps/github.io/src/app/skills/skill-list.data.ts`, insert after the `sealed-secrets` entry and before the `storybook` entry (the catalog is alphabetically ordered):

```ts
  {
    id: 'sentry',
    name: 'Sentry',
    description:
      'Error tracking and session replay for application monitoring and release health.',
    categories: ['Observability'],
    primaryUse: 'Error tracking and release health',
    confidence: 3,
    iconSlug: 'sentry',
    keywords: ['errors', 'session replay', 'monitoring', 'observability'],
  },
```

In `apps/github.io/src/app/skills/skill-brand.ts`: add `siSentry` to the `simple-icons` import list (alphabetical position among the existing `si*` imports), and add a `Sentry: siSentry` entry to the icon map that keys brands by skill display name (the map `getSkillBrand` reads via `skillIcons[label]` — follow the existing entries' exact key style, e.g. how `Prometheus: siPrometheus` appears). If `skill-brand.spec.ts` enumerates covered brands, add `'Sentry'` there in the same style as neighboring entries.

- [ ] **Step 4: Run tests to verify they pass**

Run: `pnpm nx test github.io -- src/app/skills/skill-list.data.spec.ts src/app/skills/skill-brand.spec.ts`
Expected: PASS (both files).

- [ ] **Step 5: Commit**

```bash
git add apps/github.io/src/app/skills/skill-list.data.ts apps/github.io/src/app/skills/skill-list.data.spec.ts apps/github.io/src/app/skills/skill-brand.ts
git commit -m "feat(skills): add Sentry to skill catalog"
```

(Include `apps/github.io/src/app/skills/skill-brand.spec.ts` in the `git add` only if it was modified.)

---

### Task 3: Add six professional experience entries

**Files:**
- Modify: `apps/github.io/src/app/experience/experience.data.ts`
- Test: `apps/github.io/src/app/experience/experience.data.spec.ts`

**Interfaces:**
- Consumes: `Experience` with `kind` (Task 1); `'sentry'` skill id (Task 2).
- Produces: experience ids `nx-monorepo-service-consolidation`, `eks-platform-operations`, `production-observability-stack`, `production-reliability-engineering`, `gitops-deployment-reliability`, `identity-access-hardening`. Task 4 references these ids from skill detail records.

- [ ] **Step 1: Write the failing tests**

Add to `experience.data.spec.ts` inside `describe('experiences', ...)`:

```ts
const professionalExperienceIds = [
  'nx-monorepo-service-consolidation',
  'eks-platform-operations',
  'production-observability-stack',
  'production-reliability-engineering',
  'gitops-deployment-reliability',
  'identity-access-hardening',
] as const;

it('contains the six professional experience entries', () => {
  const ids = experiences.map(({ id }) => id);

  for (const professionalId of professionalExperienceIds) {
    expect(ids).toContain(professionalId);
  }
});

it('authors professional entries as public-safe capability narratives', () => {
  const professionalExperiences = experiences.filter(
    ({ kind }) => kind === 'professional',
  );

  expect(professionalExperiences.map(({ id }) => id).sort()).toEqual(
    [...professionalExperienceIds].sort(),
  );

  for (const experience of professionalExperiences) {
    expect(experience.narrative).toHaveLength(3);
    expect(experience.role).toBe('Platform engineer');
    expect(experience.organization).toBeUndefined();
    expect(experience.projectIds).toEqual([]);
    expect(experience.supportingEvidenceIds).toBeUndefined();
    expect(experience.period?.startedAt).toMatch(/^\d{4}-\d{2}$/);
    expect(experience.period?.endedAt).toBeUndefined();
  }
});

it('contains no issue-tracker ticket references in any entry', () => {
  const ticketKeyPattern = /\b[A-Z][A-Z0-9]+-\d+\b/;

  for (const experience of experiences) {
    expect(JSON.stringify(experience)).not.toMatch(ticketKeyPattern);
  }
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm nx test github.io -- src/app/experience/experience.data.spec.ts`
Expected: FAIL — the six ids are missing.

- [ ] **Step 3: Add the six entries**

Append the following entries to the `experiences` array in `apps/github.io/src/app/experience/experience.data.ts`, after the existing homelab entry. This is the exact final content:

```ts
  {
    id: 'nx-monorepo-service-consolidation',
    kind: 'professional',
    title: 'Backend service consolidation into an Nx monorepo',
    summary:
      'Migrated standalone backend services into an Nx monorepo, consolidating duplicated services and decommissioning legacy repositories and delivery pipelines.',
    narrative: [
      'Migrated a fleet of standalone backend services into a single Nx monorepo so shared tooling, linting, testing, and build workflows could be applied uniformly instead of being maintained per repository.',
      'Consolidated duplicated services along the way, collapsing parallel implementations into single well-tested services with typed RPC interfaces and relational storage, and cut each service over environment by environment with validation at every step.',
      'Decommissioned legacy repositories, delivery pipelines, and static credentials once each migration completed, shrinking the operational surface to one delivery path per service.',
    ],
    role: 'Platform engineer',
    period: { startedAt: '2024-02' },
    environments: [{ label: 'Staging' }, { label: 'Production' }],
    skillIds: ['nx', 'typescript', 'postgresql', 'docker'],
    projectIds: [],
    capabilityKeys: [
      'version-control',
      'continuous-integration',
      'trunk-based-development',
    ],
    technologies: ['Nx', 'TypeScript', 'Node.js', 'Connect RPC', 'PostgreSQL'],
    isPublic: true,
  },
  {
    id: 'eks-platform-operations',
    kind: 'professional',
    title: 'Production Kubernetes platform operations on Amazon EKS',
    summary:
      'Operated and hardened a production Amazon EKS platform through version upgrades, capacity right-sizing, availability remediation, and managed-service migrations.',
    narrative: [
      'Operated a production Amazon EKS platform through multiple Kubernetes version upgrades and recurring maintenance cycles, keeping workloads current without service interruption.',
      'Right-sized cluster and node resources, remediated availability-zone gaps, expanded production capacity for redundancy, and moved stateful dependencies out of the cluster onto managed services.',
      'Hardened the cluster against accumulated technical debt and security risks, adding health probes and production-readiness checks across services so the platform could run multi-replica workloads reliably.',
    ],
    role: 'Platform engineer',
    period: { startedAt: '2024-02' },
    environments: [{ label: 'Production' }],
    skillIds: ['kubernetes', 'amazon-eks', 'terraform', 'helm', 'kustomize'],
    projectIds: [],
    capabilityKeys: ['flexible-infrastructure'],
    technologies: ['Amazon EKS', 'Kubernetes', 'Terraform', 'Helm', 'Kustomize'],
    isPublic: true,
  },
  {
    id: 'production-observability-stack',
    kind: 'professional',
    title: 'Production observability stack',
    summary:
      'Built out metrics, logging, error tracking, and alerting for a production platform, from service instrumentation to centralised dashboards and alert routing.',
    narrative: [
      'Built out the observability stack for a production platform: Prometheus metrics collection and Grafana dashboards for cluster and service visibility, starting from instrumenting services to export request metrics.',
      'Enabled centralised log aggregation with Loki so operational troubleshooting no longer required direct access to individual workloads, and kept the metrics and dashboard stack upgraded across major versions.',
      'Rolled out Sentry error tracking with session replay for client applications and added alerting on infrastructure saturation signals, routing alerts into team messaging so failures surface where engineers work.',
    ],
    role: 'Platform engineer',
    period: { startedAt: '2021-03' },
    environments: [{ label: 'Production' }],
    skillIds: [
      'grafana',
      'prometheus',
      'loki',
      'alertmanager',
      'alloy',
      'sentry',
    ],
    projectIds: [],
    capabilityKeys: ['monitoring-observability'],
    technologies: ['Prometheus', 'Grafana', 'Loki', 'Alertmanager', 'Sentry'],
    isPublic: true,
  },
  {
    id: 'production-reliability-engineering',
    kind: 'professional',
    title: 'Production reliability engineering',
    summary:
      'Diagnosed and eliminated recurring production failure modes, from connection exhaustion and memory leaks to silently failing jobs, and closed each with prevention.',
    narrative: [
      'Investigated and eliminated recurring production failure modes: database connection exhaustion, connection leaks in service-to-service RPC, and memory leaks that forced restarts every few days.',
      'Worked from evidence such as metrics, logs, and reproduction to attribute each failure to its source before changing systems, then fixed the root cause rather than the symptom.',
      'Closed each failure with prevention: saturation alerting, bounded resource limits, health probes tuned to real startup behaviour, and batch jobs that fail loudly instead of exiting silently.',
    ],
    role: 'Platform engineer',
    period: { startedAt: '2025-11' },
    environments: [{ label: 'Production' }],
    skillIds: ['kubernetes', 'postgresql', 'prometheus', 'grafana'],
    projectIds: [],
    capabilityKeys: ['monitoring-observability', 'deployment-automation'],
    technologies: ['Kubernetes', 'PostgreSQL', 'Prometheus', 'Grafana', 'gRPC'],
    isPublic: true,
  },
  {
    id: 'gitops-deployment-reliability',
    kind: 'professional',
    title: 'GitOps deployment reliability',
    summary:
      'Made multi-service GitOps delivery reliable with Argo CD, eliminating silent deployment skips and decoupling database migrations from service startup.',
    narrative: [
      'Improved a GitOps delivery platform built on Argo CD so every service deployment is declared, reconciled, and verifiable from version control.',
      'Made the multi-service deploy pipeline reliable by eliminating failure modes where a service could be silently skipped during release, and adopted remaining workloads into GitOps management.',
      'Decoupled database migrations from service boot with pre-sync jobs, so schema changes run as controlled deployment steps instead of racing application startup.',
    ],
    role: 'Platform engineer',
    period: { startedAt: '2026-06' },
    environments: [{ label: 'Staging' }, { label: 'Production' }],
    skillIds: ['argo-cd', 'kustomize', 'sealed-secrets', 'github-actions'],
    projectIds: [],
    capabilityKeys: ['continuous-delivery', 'deployment-automation'],
    technologies: ['Argo CD', 'Kustomize', 'Sealed Secrets', 'GitHub Actions'],
    isPublic: true,
  },
  {
    id: 'identity-access-hardening',
    kind: 'professional',
    title: 'Identity and access hardening',
    summary:
      'Hardened cloud identity and access management with scoped IAM policies, role-based access in place of static credentials, MFA, and complete offboarding.',
    narrative: [
      'Hardened cloud identity and access management: audited and scoped IAM policies, removed static credentials in favour of role-based access, and established credential-hygiene conventions for the team.',
      'Implemented engineer offboarding across cloud IAM and Kubernetes access so departures revoke access completely and promptly.',
      'Rolled out multi-factor authentication and least-privilege permission restrictions for platform users and clients, reducing the blast radius of any single compromised account.',
    ],
    role: 'Platform engineer',
    period: { startedAt: '2024-04' },
    environments: [{ label: 'Production' }],
    skillIds: ['aws-iam', 'terraform', 'kubernetes'],
    projectIds: [],
    capabilityKeys: ['pervasive-security'],
    technologies: ['AWS IAM', 'Terraform', 'Kubernetes RBAC'],
    isPublic: true,
  },
```

Note: entries keep the array's `as const satisfies readonly Experience[]` form — do not change that declaration.

- [ ] **Step 4: Run the experience specs**

Run: `pnpm nx test github.io -- src/app/experience/experience.data.spec.ts`
Expected: PASS — including the pre-existing tests (`links only to existing skills, projects, and supporting evidence` now validates the new entries' `skillIds` against the catalog, which is why Task 2 must land first).

- [ ] **Step 5: Commit**

```bash
git add apps/github.io/src/app/experience/experience.data.ts apps/github.io/src/app/experience/experience.data.spec.ts
git commit -m "feat(experience): add six professional experience entries"
```

---

### Task 4: Link professional experiences into skill detail pages

Experiences render only through `skillDetailRecords` — without this task the new entries are invisible.

**Files:**
- Modify: `apps/github.io/src/app/skills/skill-detail.data.ts`
- Test: create `apps/github.io/src/app/skills/skill-detail.data.spec.ts`

**Interfaces:**
- Consumes: experience ids from Task 3; `resolveSkillDetail(skillId, sources)` from `skill-detail-resolver.ts`; `SkillDetailRecord` from `skill-detail.types.ts`.
- Produces: extended `skillDetailRecords` covering every skill referenced by a professional experience.

- [ ] **Step 1: Write the failing test**

Create `apps/github.io/src/app/skills/skill-detail.data.spec.ts`:

```ts
import { devOpsCapabilityEvidenceItems } from '../devops-capability-evidence/devops-capability-evidence.data';
import { experiences } from '../experience/experience.data';
import { sampleProjects } from '../projects/project-list.data';
import { skillDetailRecords } from './skill-detail.data';
import { resolveSkillDetail } from './skill-detail-resolver';
import { skills } from './skill-list.data';

describe('skillDetailRecords', () => {
  const sources = {
    skills,
    detailRecords: skillDetailRecords,
    evidenceItems: devOpsCapabilityEvidenceItems,
    experiences,
    projects: sampleProjects,
  };

  it('resolves every record without errors', () => {
    for (const record of skillDetailRecords) {
      const resolution = resolveSkillDetail(record.skillId, sources);

      expect(resolution.status).toBe('found');
    }
  });

  it('surfaces every experience through at least one skill detail record', () => {
    const linkedExperienceIds = new Set(
      skillDetailRecords.flatMap((record) => record.experienceIds),
    );

    for (const experience of experiences) {
      expect(linkedExperienceIds.has(experience.id)).toBe(true);
    }
  });

  it('links each skill only to experiences that declare the skill', () => {
    const experienceById = new Map(
      experiences.map((experience) => [experience.id, experience]),
    );

    for (const record of skillDetailRecords) {
      for (const experienceId of record.experienceIds) {
        const experience = experienceById.get(experienceId);

        expect(experience).toBeDefined();
        expect(experience?.skillIds).toContain(record.skillId);
      }
    }
  });
});
```

If the `sources` object shape does not satisfy `SkillDetailSources` exactly (check `skill-detail.types.ts` and how `skill-detail-route.tsx` assembles it), mirror the route's assembly instead — the route file is the canonical consumer.

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm nx test github.io -- src/app/skills/skill-detail.data.spec.ts`
Expected: FAIL on `'surfaces every experience through at least one skill detail record'` — the six new experience ids are not linked yet.

- [ ] **Step 3: Extend `skill-detail.data.ts`**

Modify the existing records and append new ones so the file's records are:

- `kubernetes` (existing record — extend `experienceIds`): `['aws-codepipeline-codebuild-multistage-delivery', 'eks-platform-operations', 'production-reliability-engineering', 'identity-access-hardening']`
- `amazon-eks` (extend): `['aws-codepipeline-codebuild-multistage-delivery', 'eks-platform-operations']`
- `terraform` (extend): `['aws-codepipeline-codebuild-multistage-delivery', 'eks-platform-operations', 'identity-access-hardening']`
- Existing `aws-codepipeline`, `aws-codebuild`, `amazon-ecr` records: unchanged.

Append new records (each with `experienceEvidenceIds: []` and `projectIds: []`):

```ts
  {
    skillId: 'nx',
    experienceIds: ['nx-monorepo-service-consolidation'],
    experienceEvidenceIds: [],
    projectIds: [],
  },
  {
    skillId: 'typescript',
    experienceIds: ['nx-monorepo-service-consolidation'],
    experienceEvidenceIds: [],
    projectIds: [],
  },
  {
    skillId: 'postgresql',
    experienceIds: [
      'nx-monorepo-service-consolidation',
      'production-reliability-engineering',
    ],
    experienceEvidenceIds: [],
    projectIds: [],
  },
  {
    skillId: 'docker',
    experienceIds: ['nx-monorepo-service-consolidation'],
    experienceEvidenceIds: [],
    projectIds: [],
  },
  {
    skillId: 'helm',
    experienceIds: ['eks-platform-operations'],
    experienceEvidenceIds: [],
    projectIds: [],
  },
  {
    skillId: 'kustomize',
    experienceIds: ['eks-platform-operations', 'gitops-deployment-reliability'],
    experienceEvidenceIds: [],
    projectIds: [],
  },
  {
    skillId: 'grafana',
    experienceIds: [
      'production-observability-stack',
      'production-reliability-engineering',
    ],
    experienceEvidenceIds: [],
    projectIds: [],
  },
  {
    skillId: 'prometheus',
    experienceIds: [
      'production-observability-stack',
      'production-reliability-engineering',
    ],
    experienceEvidenceIds: [],
    projectIds: [],
  },
  {
    skillId: 'loki',
    experienceIds: ['production-observability-stack'],
    experienceEvidenceIds: [],
    projectIds: [],
  },
  {
    skillId: 'alertmanager',
    experienceIds: ['production-observability-stack'],
    experienceEvidenceIds: [],
    projectIds: [],
  },
  {
    skillId: 'alloy',
    experienceIds: ['production-observability-stack'],
    experienceEvidenceIds: [],
    projectIds: [],
  },
  {
    skillId: 'sentry',
    experienceIds: ['production-observability-stack'],
    experienceEvidenceIds: [],
    projectIds: [],
  },
  {
    skillId: 'argo-cd',
    experienceIds: ['gitops-deployment-reliability'],
    experienceEvidenceIds: [],
    projectIds: [],
  },
  {
    skillId: 'sealed-secrets',
    experienceIds: ['gitops-deployment-reliability'],
    experienceEvidenceIds: [],
    projectIds: [],
  },
  {
    skillId: 'github-actions',
    experienceIds: ['gitops-deployment-reliability'],
    experienceEvidenceIds: [],
    projectIds: [],
  },
  {
    skillId: 'aws-iam',
    experienceIds: ['identity-access-hardening'],
    experienceEvidenceIds: [],
    projectIds: [],
  },
```

- [ ] **Step 4: Run the skill detail specs**

Run: `pnpm nx test github.io -- src/app/skills/skill-detail.data.spec.ts src/app/skills/skill-detail-resolver.spec.ts src/app/skills/skill-detail-page.spec.tsx`
Expected: PASS (all three files).

- [ ] **Step 5: Commit**

```bash
git add apps/github.io/src/app/skills/skill-detail.data.ts apps/github.io/src/app/skills/skill-detail.data.spec.ts
git commit -m "feat(skills): surface professional experiences on skill detail pages"
```

---

### Task 5: Full verification

**Files:** none modified (verification only; fix-forward if anything fails, splitting fixes into their own commits).

- [ ] **Step 1: Run the full app test suite**

Run: `pnpm nx test github.io`
Expected: PASS.

- [ ] **Step 2: Lint**

Run: `pnpm nx lint github.io`
Expected: PASS. If Prettier formatting is flagged, run `pnpm exec prettier --write` on the touched files and amend the relevant commit only if uncommitted; otherwise add a `chore` formatting commit.

- [ ] **Step 3: Build app and Storybook**

Run: `pnpm nx build github.io && pnpm nx build-storybook github.io`
Expected: both succeed.

- [ ] **Step 4: Sanitization review (manual, mandatory)**

Re-read the full diff (`git diff main...HEAD`) checking every added string against the Global Constraints sanitization list — employer name, internal service/system names, customer/person names, ticket keys, incident dates, infrastructure identifiers. This review is the enforcement mechanism for the rules the tests cannot encode.
