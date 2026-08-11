# DORA Kubernetes Certification Evidence Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use `superpowers:subagent-driven-development` to implement this plan task-by-task. The repository instructions preselect this execution mode. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Show the user's concrete KCNA, CKA, and CKAD credentials in labelled certification rows on only the DORA capability cards they directly support.

**Architecture:** Move the three credentials into a certification-owned canonical registry consumed by the Kubernetes skill, DevOps roadmap, and DORA evidence adapter. Adapt each credential into one public capability evidence record, select those stable IDs in the four approved compact projections, and let the existing semantic evidence grouping render a visibly labelled row between experience and skills.

**Tech Stack:** TypeScript, React, Nx, pnpm, Vitest, Testing Library, Storybook, Astryx, StyleX.

## Global Constraints

- Work only in `.worktrees/dora-kubernetes-certifications` on branch `feat/dora-kubernetes-certifications`.
- Keep KCNA mapped only to Flexible Infrastructure.
- Keep CKA mapped only to Flexible Infrastructure and Monitoring & Observability.
- Keep CKAD mapped only to Continuous Delivery, Deployment Automation, and Monitoring & Observability.
- Render the visible label exactly as **Certifications**.
- Keep row order **Relevant experience**, **Certifications**, **Technical skills**.
- Reuse the existing badge images, certificate PDF URLs, expiry timestamps, credential IDs, names, and completion dates without changing their values.
- Preserve the Kubernetes skill order `KCNA`, `CKAD`, `CKA` and DevOps roadmap order `CKA`, `CKAD`, `KCNA`; DORA rows use `KCNA`, `CKA`, `CKAD` progression order when those credentials coexist.
- Do not change curated numeric DORA scores, scoring weights, card width, spacing, typography, citation styling, or dependencies.
- Keep incomplete or generic certification evidence on the existing plain-citation fallback.
- Before UI edits, run the official Astryx principles, layout, typography, Text, and Citation documentation commands required by `apps/github.io/AGENTS.md`.
- Follow TDD: observe every focused test fail for the intended reason before adding its production implementation.
- Commit each task separately with explicit paths and a conventional subject; never use broad staging commands.

---

## File Structure

### New files

- `apps/github.io/src/app/certifications/certification.types.ts` — certification-owned reusable record and metadata contracts.
- `apps/github.io/src/app/certifications/kubernetes-certifications.data.ts` — canonical KCNA, CKA, and CKAD records.
- `apps/github.io/src/app/certifications/kubernetes-certifications.data.spec.ts` — exact canonical record and uniqueness contract.
- `apps/github.io/src/app/devops-capability-evidence/kubernetes-certification-evidence.data.ts` — DORA-specific adaptation and capability mappings.
- `apps/github.io/src/app/devops-capability-evidence/kubernetes-certification-evidence.data.spec.ts` — exact DORA evidence mappings and canonical-field reuse.

### Modified files

- `apps/github.io/src/app/certifications/certification-citation.tsx` — consume and re-export shared metadata type for compatibility.
- `apps/github.io/src/app/skills/skill-list.types.ts` — use the shared certification record contract.
- `apps/github.io/src/app/skills/skill-list.data.ts` — reference canonical credential records.
- `apps/github.io/src/app/skills/skill-list.data.spec.ts` — verify canonical identity and preserved skill ordering.
- `apps/github.io/src/app/devops-roadmap/devops-roadmap.types.ts` — use the shared certification record contract.
- `apps/github.io/src/app/devops-roadmap/devops-roadmap.data.ts` — reference canonical credential records.
- `apps/github.io/src/app/devops-roadmap/devops-roadmap.spec.tsx` — verify canonical identity and preserved roadmap ordering.
- `apps/github.io/src/app/devops-capability-evidence/devops-capability-evidence.types.ts` — carry optional certification metadata.
- `apps/github.io/src/app/devops-capability-evidence/capability-evidence.tsx` — forward metadata to `CertificationCitation`.
- `apps/github.io/src/app/devops-capability-evidence/capability-evidence.spec.tsx` — cover full metadata and plain-citation paths.
- `apps/github.io/src/app/devops-capability-evidence/devops-capability-evidence.data.ts` — compose the three concrete records, remove the generic item, and select certification IDs in four projections.
- `apps/github.io/src/app/devops-capability-evidence/devops-capability-evidence.spec.ts` — update catalog, count, score, and projection contracts.
- `apps/github.io/src/app/devops-capability-evidence/dora-capability-card.evidence.spec.ts` — verify exact production grouped rows and credential ordering.
- `apps/github.io/src/app/devops-capability-evidence/dora-capability-card.tsx` — expose the visible certification label.
- `apps/github.io/src/app/devops-capability-evidence/dora-capability-card.spec.tsx` — cover row content, order, accessible naming, metadata, and unaffected cards.
- `apps/github.io/src/app/devops-capability-evidence/dora-capability-card.stories.spec.ts` — lock the affected Storybook fixtures to approved certifications.

---

### Task 1: Establish one canonical Kubernetes credential registry

**Files:**
- Create: `apps/github.io/src/app/certifications/certification.types.ts`
- Create: `apps/github.io/src/app/certifications/kubernetes-certifications.data.ts`
- Create: `apps/github.io/src/app/certifications/kubernetes-certifications.data.spec.ts`
- Modify: `apps/github.io/src/app/certifications/certification-citation.tsx:35-48`
- Modify: `apps/github.io/src/app/skills/skill-list.types.ts:1-38`
- Modify: `apps/github.io/src/app/skills/skill-list.data.ts:1-135`
- Modify: `apps/github.io/src/app/skills/skill-list.data.spec.ts:1-180`
- Modify: `apps/github.io/src/app/devops-roadmap/devops-roadmap.types.ts:1-16`
- Modify: `apps/github.io/src/app/devops-roadmap/devops-roadmap.data.ts:1-125`
- Modify: `apps/github.io/src/app/devops-roadmap/devops-roadmap.spec.tsx:198-275`

**Interfaces:**
- Produces: `CertificationMetadata`, `CertificationRecord`, `KubernetesCertificationId`, and `kubernetesCertifications: Readonly<Record<KubernetesCertificationId, CertificationRecord>>`.
- Preserves: `CertificationCitationProps.metadata?: CertificationMetadata` and the existing skill and roadmap certification array orders.

- [ ] **Step 1: Write the failing canonical registry test**

Create `kubernetes-certifications.data.spec.ts` with the exact identity and lifecycle contract:

```ts
import { cncfCertificationBadges } from './cncf-certification-badges';
import { kubernetesCertifications } from './kubernetes-certifications.data';

describe('kubernetes certifications', () => {
  it('owns the three concrete credentials by stable ID', () => {
    expect(Object.keys(kubernetesCertifications)).toEqual([
      'kcna',
      'cka',
      'ckad',
    ]);
    expect(Object.values(kubernetesCertifications).map(({ id, title }) => ({
      id,
      title,
    }))).toEqual([
      { id: 'kcna', title: 'KCNA' },
      { id: 'cka', title: 'CKA' },
      { id: 'ckad', title: 'CKAD' },
    ]);
  });

  it('keeps every credential complete and visually distinct', () => {
    expect(kubernetesCertifications.kcna).toMatchObject({
      citationIcon: cncfCertificationBadges.KCNA,
      expiresAt: '2028-02-26T10:59:00+11:00',
      skills: ['Kubernetes'],
      url: 'https://ti-user-certificates.s3.amazonaws.com/e0df7fbf-a057-42af-8a1f-590912be5460/10cf307b-dcb8-5917-a301-c854a583ed97-gunwoo-kim-8a295e12-57c5-4008-b8ba-171b09419221-certificate.pdf',
      metadata: {
        id: 'LF-bau2ptq4ve',
        name: 'Kubernetes and Cloud Native Associate',
        completedAt: '2025-03-21',
      },
    });
    expect(kubernetesCertifications.cka).toMatchObject({
      citationIcon: cncfCertificationBadges.CKA,
      expiresAt: '2027-04-20T10:00:00+10:00',
      skills: ['Kubernetes'],
      url: 'https://ti-user-certificates.s3.amazonaws.com/e0df7fbf-a057-42af-8a1f-590912be5460/10cf307b-dcb8-5917-a301-c854a583ed97-gunwoo-kim-02c68021-40fe-473f-8087-6309221395ca-certificate.pdf',
      metadata: {
        id: 'LF-assbyzy17c',
        name: 'Certified Kubernetes Administrator',
        completedAt: '2025-04-20',
      },
    });
    expect(kubernetesCertifications.ckad).toMatchObject({
      citationIcon: cncfCertificationBadges.CKAD,
      expiresAt: '2028-02-25T11:00:00+11:00',
      skills: ['Kubernetes'],
      url: 'https://ti-user-certificates.s3.amazonaws.com/e0df7fbf-a057-42af-8a1f-590912be5460/10cf307b-dcb8-5917-a301-c854a583ed97-gunwoo-kim-83c53ec1-bf5d-4b01-ae0a-c79be21d7cf2-certificate.pdf',
      metadata: {
        id: 'LF-kyh6ajhr7y',
        name: 'Certified Kubernetes Application Developer',
        completedAt: '2026-02-25',
      },
    });
    expect(new Set(Object.values(kubernetesCertifications).map(
      ({ citationIcon }) => citationIcon,
    )).size).toBe(3);
    expect(Object.values(kubernetesCertifications).every(
      ({ url }) => url.startsWith('https://ti-user-certificates.s3.amazonaws.com/'),
    )).toBe(true);
  });
});
```

- [ ] **Step 2: Run the new test and verify the missing-module failure**

Run:

```sh
../../node_modules/.bin/vitest run \
  apps/github.io/src/app/certifications/kubernetes-certifications.data.spec.ts
```

Expected: FAIL because `kubernetes-certifications.data` does not exist.

- [ ] **Step 3: Add the shared types and canonical registry**

Create `certification.types.ts`:

```ts
export interface CertificationMetadata {
  readonly id: string;
  readonly name: string;
  readonly completedAt: string;
}

export interface CertificationRecord {
  readonly id: string;
  readonly title: string;
  readonly url: string;
  readonly skills: readonly string[];
  readonly expiresAt: string;
  readonly citationIcon?: string;
  readonly metadata?: CertificationMetadata;
}
```

Create `kubernetes-certifications.data.ts` with this public interface and copy
the exact existing URL for each matching title from `skill-list.data.ts`
without editing it:

```ts
import { cncfCertificationBadges } from './cncf-certification-badges';
import type { CertificationRecord } from './certification.types';

export type KubernetesCertificationId = 'kcna' | 'cka' | 'ckad';

export const kubernetesCertifications = {
  kcna: {
    id: 'kcna',
    title: 'KCNA',
    citationIcon: cncfCertificationBadges.KCNA,
    skills: ['Kubernetes'],
    expiresAt: '2028-02-26T10:59:00+11:00',
    url: 'https://ti-user-certificates.s3.amazonaws.com/e0df7fbf-a057-42af-8a1f-590912be5460/10cf307b-dcb8-5917-a301-c854a583ed97-gunwoo-kim-8a295e12-57c5-4008-b8ba-171b09419221-certificate.pdf',
    metadata: {
      id: 'LF-bau2ptq4ve',
      name: 'Kubernetes and Cloud Native Associate',
      completedAt: '2025-03-21',
    },
  },
  cka: {
    id: 'cka',
    title: 'CKA',
    citationIcon: cncfCertificationBadges.CKA,
    skills: ['Kubernetes'],
    expiresAt: '2027-04-20T10:00:00+10:00',
    url: 'https://ti-user-certificates.s3.amazonaws.com/e0df7fbf-a057-42af-8a1f-590912be5460/10cf307b-dcb8-5917-a301-c854a583ed97-gunwoo-kim-02c68021-40fe-473f-8087-6309221395ca-certificate.pdf',
    metadata: {
      id: 'LF-assbyzy17c',
      name: 'Certified Kubernetes Administrator',
      completedAt: '2025-04-20',
    },
  },
  ckad: {
    id: 'ckad',
    title: 'CKAD',
    citationIcon: cncfCertificationBadges.CKAD,
    skills: ['Kubernetes'],
    expiresAt: '2028-02-25T11:00:00+11:00',
    url: 'https://ti-user-certificates.s3.amazonaws.com/e0df7fbf-a057-42af-8a1f-590912be5460/10cf307b-dcb8-5917-a301-c854a583ed97-gunwoo-kim-83c53ec1-bf5d-4b01-ae0a-c79be21d7cf2-certificate.pdf',
    metadata: {
      id: 'LF-kyh6ajhr7y',
      name: 'Certified Kubernetes Application Developer',
      completedAt: '2026-02-25',
    },
  },
} as const satisfies Record<KubernetesCertificationId, CertificationRecord>;
```

- [ ] **Step 4: Migrate existing consumers to the registry**

Move `CertificationMetadata` out of `certification-citation.tsx`, import it
from `certification.types.ts`, and re-export it so current type imports remain
compatible:

```ts
import type { CertificationMetadata } from './certification.types';
export type { CertificationMetadata } from './certification.types';
```

Change `SkillCertification` and the roadmap `Certification` alias to
`Omit<CertificationRecord, 'id'>`. This preserves their current public shape
while accepting canonical records structurally. Replace inline arrays with
explicit references that preserve each surface's current order:

```ts
// skill-list.data.ts
certifications: [
  kubernetesCertifications.kcna,
  kubernetesCertifications.ckad,
  kubernetesCertifications.cka,
],

// devops-roadmap.data.ts
certifications: [
  kubernetesCertifications.cka,
  kubernetesCertifications.ckad,
  kubernetesCertifications.kcna,
],
```

Update the existing data tests to assert reference identity as well as order:

```ts
expect(kubernetesSkill?.certifications).toEqual([
  kubernetesCertifications.kcna,
  kubernetesCertifications.ckad,
  kubernetesCertifications.cka,
]);
expect(containerOrchestration?.certifications).toEqual([
  kubernetesCertifications.cka,
  kubernetesCertifications.ckad,
  kubernetesCertifications.kcna,
]);
```

- [ ] **Step 5: Run focused certification, skill, and roadmap tests**

Run:

```sh
../../node_modules/.bin/vitest run \
  apps/github.io/src/app/certifications/kubernetes-certifications.data.spec.ts \
  apps/github.io/src/app/certifications/certification-citation.spec.tsx \
  apps/github.io/src/app/skills/skill-list.data.spec.ts \
  apps/github.io/src/app/skills/skill-card.spec.tsx \
  apps/github.io/src/app/devops-roadmap/devops-roadmap.spec.tsx
```

Expected: PASS with the prior citation metadata and surface ordering intact.

- [ ] **Step 6: Review and commit the canonical registry**

```sh
git diff --check
git diff -- \
  apps/github.io/src/app/certifications \
  apps/github.io/src/app/skills \
  apps/github.io/src/app/devops-roadmap
git add \
  apps/github.io/src/app/certifications/certification.types.ts \
  apps/github.io/src/app/certifications/kubernetes-certifications.data.ts \
  apps/github.io/src/app/certifications/kubernetes-certifications.data.spec.ts \
  apps/github.io/src/app/certifications/certification-citation.tsx \
  apps/github.io/src/app/skills/skill-list.types.ts \
  apps/github.io/src/app/skills/skill-list.data.ts \
  apps/github.io/src/app/skills/skill-list.data.spec.ts \
  apps/github.io/src/app/devops-roadmap/devops-roadmap.types.ts \
  apps/github.io/src/app/devops-roadmap/devops-roadmap.data.ts \
  apps/github.io/src/app/devops-roadmap/devops-roadmap.spec.tsx
git diff --cached
git commit -m "refactor(github.io): centralize Kubernetes certifications"
```

---

### Task 2: Adapt concrete credentials into capability evidence

**Files:**
- Create: `apps/github.io/src/app/devops-capability-evidence/kubernetes-certification-evidence.data.ts`
- Create: `apps/github.io/src/app/devops-capability-evidence/kubernetes-certification-evidence.data.spec.ts`
- Modify: `apps/github.io/src/app/devops-capability-evidence/devops-capability-evidence.types.ts:1-86`
- Modify: `apps/github.io/src/app/devops-capability-evidence/capability-evidence.tsx:95-125`
- Modify: `apps/github.io/src/app/devops-capability-evidence/capability-evidence.spec.tsx:170-260`
- Modify: `apps/github.io/src/app/devops-capability-evidence/devops-capability-evidence.data.ts:1-45,344-455`

**Interfaces:**
- Consumes: `kubernetesCertifications` from Task 1.
- Produces: `kubernetesCertificationEvidenceItems: readonly CapabilityEvidenceItem[]` with IDs `cncf-kcna-certification`, `cncf-cka-certification`, and `cncf-ckad-certification`.
- Extends: `CapabilityEvidenceItem.certificationMetadata?: CertificationMetadata`.

- [ ] **Step 1: Write failing DORA adaptation and metadata-forwarding tests**

Create the adapter test:

```ts
import { kubernetesCertifications } from '../certifications/kubernetes-certifications.data';
import { kubernetesCertificationEvidenceItems } from './kubernetes-certification-evidence.data';

describe('Kubernetes certification capability evidence', () => {
  it('maps each canonical credential to its approved DORA capabilities', () => {
    expect(kubernetesCertificationEvidenceItems.map((item) => ({
      id: item.id,
      capabilityKeys: item.capabilityKeys,
    }))).toEqual([
      {
        id: 'cncf-kcna-certification',
        capabilityKeys: ['flexible-infrastructure'],
      },
      {
        id: 'cncf-cka-certification',
        capabilityKeys: ['flexible-infrastructure', 'monitoring-observability'],
      },
      {
        id: 'cncf-ckad-certification',
        capabilityKeys: [
          'continuous-delivery',
          'deployment-automation',
          'monitoring-observability',
        ],
      },
    ]);
  });

  it('reuses every canonical citation field', () => {
    const cka = kubernetesCertificationEvidenceItems.find(
      ({ id }) => id === 'cncf-cka-certification',
    );
    expect(cka).toMatchObject({
      title: kubernetesCertifications.cka.metadata.name,
      label: kubernetesCertifications.cka.title,
      proofUrl: kubernetesCertifications.cka.url,
      endDate: kubernetesCertifications.cka.expiresAt,
      citationIcon: kubernetesCertifications.cka.citationIcon,
      technologies: kubernetesCertifications.cka.skills,
      certificationMetadata: kubernetesCertifications.cka.metadata,
      issuer: 'Cloud Native Computing Foundation',
      isPublic: true,
      strength: 'primary',
      type: 'certification',
    });
  });
});
```

Add this `CapabilityEvidence` test, importing `within` from Testing Library:

```tsx
it('forwards complete certification metadata to the hover card', () => {
  render(
    <CapabilityEvidence
      evidence={evidence({
        certificationMetadata: {
          id: 'LF-assbyzy17c',
          name: 'Certified Kubernetes Administrator',
          completedAt: '2025-04-20',
        },
        endDate: '2099-01-01T00:00:00+00:00',
        label: 'CKA',
        proofUrl: 'https://example.com/cka',
        technologies: ['Kubernetes'],
        type: 'certification',
      })}
    />,
  );

  const hoverCard = screen.getByRole('dialog', { hidden: true });
  expect(within(hoverCard).getByText('Certified Kubernetes Administrator')).toBeTruthy();
  expect(within(hoverCard).getByText('LF-assbyzy17c')).toBeTruthy();
  expect(within(hoverCard).getByText('Active')).toBeTruthy();
});
```

- [ ] **Step 2: Run the focused tests and verify intended failures**

```sh
../../node_modules/.bin/vitest run \
  apps/github.io/src/app/devops-capability-evidence/kubernetes-certification-evidence.data.spec.ts \
  apps/github.io/src/app/devops-capability-evidence/capability-evidence.spec.tsx
```

Expected: FAIL because the adapter module and `certificationMetadata` contract
do not exist.

- [ ] **Step 3: Add the evidence metadata field and forwarding path**

Import the shared metadata type into `devops-capability-evidence.types.ts` and
add the optional field:

```ts
import type { CertificationMetadata } from '../certifications/certification.types';

export interface CapabilityEvidenceItem {
  // existing fields remain unchanged
  certificationMetadata?: CertificationMetadata;
}
```

Forward it in `CertificationEvidenceCitation`:

```tsx
<CertificationCitation
  citationIcon={
    evidence.citationIcon ?? getCapabilityEvidenceCitationIcon(iconData)
  }
  expiresAt={evidence.endDate}
  metadata={evidence.certificationMetadata}
  number={citationNumber}
  skills={evidence.technologies}
  title={label}
  url={evidence.proofUrl}
/>
```

Do not alter `CertificationCitation` fallback rules.

- [ ] **Step 4: Implement the DORA adapter and replace the generic record**

Create `kubernetes-certification-evidence.data.ts`:

```ts
import { kubernetesCertifications } from '../certifications/kubernetes-certifications.data';
import type { KubernetesCertificationId } from '../certifications/kubernetes-certifications.data';
import type {
  CapabilityEvidenceItem,
  DoraCapabilityKey,
} from './devops-capability-evidence.types';

const doraDetails = {
  kcna: {
    capabilityKeys: ['flexible-infrastructure'],
    summary:
      'Validated foundational Kubernetes, container orchestration, and cloud-native architecture knowledge.',
  },
  cka: {
    capabilityKeys: [
      'flexible-infrastructure',
      'monitoring-observability',
    ],
    summary:
      'Validated hands-on Kubernetes cluster administration, networking, storage, and troubleshooting skills.',
  },
  ckad: {
    capabilityKeys: [
      'continuous-delivery',
      'deployment-automation',
      'monitoring-observability',
    ],
    summary:
      'Validated hands-on Kubernetes application design, deployment, configuration, observability, and maintenance skills.',
  },
} as const satisfies Record<
  KubernetesCertificationId,
  {
    readonly capabilityKeys: readonly DoraCapabilityKey[];
    readonly summary: string;
  }
>;

export const kubernetesCertificationEvidenceItems = (
  ['kcna', 'cka', 'ckad'] as const
).map((id): CapabilityEvidenceItem => {
  const certification = kubernetesCertifications[id];
  const details = doraDetails[id];

  return {
    id: `cncf-${id}-certification`,
    title: certification.metadata.name,
    label: certification.title,
    type: 'certification',
    issuer: 'Cloud Native Computing Foundation',
    capabilityKeys: details.capabilityKeys,
    date: certification.metadata.completedAt,
    endDate: certification.expiresAt,
    citationIcon: certification.citationIcon,
    summary: details.summary,
    technologies: certification.skills,
    proofUrl: certification.url,
    certificationMetadata: certification.metadata,
    isPublic: true,
    strength: 'primary',
  };
});
```

Import and spread this collection into `devOpsCapabilityEvidenceItems` where
the generic inline item currently sits, then delete
`cncf-kubernetes-certification` completely.

- [ ] **Step 5: Run focused evidence tests**

```sh
../../node_modules/.bin/vitest run \
  apps/github.io/src/app/devops-capability-evidence/kubernetes-certification-evidence.data.spec.ts \
  apps/github.io/src/app/devops-capability-evidence/capability-evidence.spec.tsx \
  apps/github.io/src/app/certifications/certification-citation.spec.tsx
```

Expected: PASS, including the existing incomplete-metadata plain citation.

- [ ] **Step 6: Review and commit the evidence adapter**

```sh
git diff --check
git diff -- \
  apps/github.io/src/app/devops-capability-evidence/devops-capability-evidence.types.ts \
  apps/github.io/src/app/devops-capability-evidence/capability-evidence.tsx \
  apps/github.io/src/app/devops-capability-evidence/capability-evidence.spec.tsx \
  apps/github.io/src/app/devops-capability-evidence/kubernetes-certification-evidence.data.ts \
  apps/github.io/src/app/devops-capability-evidence/kubernetes-certification-evidence.data.spec.ts \
  apps/github.io/src/app/devops-capability-evidence/devops-capability-evidence.data.ts
git add \
  apps/github.io/src/app/devops-capability-evidence/devops-capability-evidence.types.ts \
  apps/github.io/src/app/devops-capability-evidence/capability-evidence.tsx \
  apps/github.io/src/app/devops-capability-evidence/capability-evidence.spec.tsx \
  apps/github.io/src/app/devops-capability-evidence/kubernetes-certification-evidence.data.ts \
  apps/github.io/src/app/devops-capability-evidence/kubernetes-certification-evidence.data.spec.ts \
  apps/github.io/src/app/devops-capability-evidence/devops-capability-evidence.data.ts
git diff --cached
git commit -m "feat(github.io): add Kubernetes certification evidence"
```

---

### Task 3: Select certifications in the approved DORA projections

**Files:**
- Modify: `apps/github.io/src/app/devops-capability-evidence/devops-capability-evidence.data.ts:83-337`
- Modify: `apps/github.io/src/app/devops-capability-evidence/devops-capability-evidence.spec.ts:90-230,620-760,1030-1060,1200-1265,1440-1477`
- Modify: `apps/github.io/src/app/devops-capability-evidence/dora-capability-card.evidence.spec.ts:1-265`
- Modify: `apps/github.io/src/app/devops-capability-evidence/dora-capability-card.stories.spec.ts:1-280`

**Interfaces:**
- Consumes: the three stable evidence IDs from Task 2.
- Produces: four compact score projections containing certification IDs after five experience IDs and before skill IDs.
- Preserves: all numeric `score`, `maxScore`, `strongestEvidenceId`, and `evidenceSummary` values.

- [ ] **Step 1: Update projection tests first**

Change the exact production-row cases in
`dora-capability-card.evidence.spec.ts` so each case accepts
`certificationIds`. Assert these rows:

```ts
expect(rows.map((row) => row.group)).toEqual(
  certificationIds.length > 0
    ? ['applied', 'certifications', 'skills']
    : ['applied', 'skills'],
);
expect(rows.find(({ group }) => group === 'certifications')?.evidence.map(
  ({ id }) => id,
)).toEqual(certificationIds.length > 0 ? certificationIds : undefined);
```

Use exactly:

```ts
const expectedCertificationIds = {
  'continuous-delivery': ['cncf-ckad-certification'],
  'deployment-automation': ['cncf-ckad-certification'],
  'monitoring-observability': [
    'cncf-cka-certification',
    'cncf-ckad-certification',
  ],
  'flexible-infrastructure': [
    'cncf-kcna-certification',
    'cncf-cka-certification',
  ],
} as const;
```

Add catalog assertions for three certification records, affected capability
counts of `1`, `1`, `2`, and `2`, and the aggregate summary text using
`3 certifications`.

- [ ] **Step 2: Run projection and catalog tests to verify failure**

```sh
../../node_modules/.bin/vitest run \
  apps/github.io/src/app/devops-capability-evidence/dora-capability-card.evidence.spec.ts \
  apps/github.io/src/app/devops-capability-evidence/devops-capability-evidence.spec.ts \
  apps/github.io/src/app/devops-capability-evidence/dora-capability-card.stories.spec.ts
```

Expected: FAIL because the curated score records still contain no
certification IDs and still report the old counts.

- [ ] **Step 3: Insert stable IDs and update evidence counts**

In each affected `evidenceIds` array, insert these IDs after the fifth
experience ID and before the first skill ID:

```ts
// Continuous Delivery and Deployment Automation
'cncf-ckad-certification',

// Flexible Infrastructure
'cncf-kcna-certification',
'cncf-cka-certification',

// Monitoring & Observability
'cncf-cka-certification',
'cncf-ckad-certification',
```

Update only `evidenceCounts`:

```ts
// Continuous Delivery
{ experience: 5, certification: 1, skill: 14 }

// Deployment Automation
{ experience: 5, certification: 1, skill: 13 }

// Flexible Infrastructure
{ experience: 5, certification: 2, skill: 12 }

// Monitoring & Observability
{ experience: 5, certification: 2, skill: 13 }
```

Update aggregate expectations from one to three certification records. Keep
all numeric score fields byte-for-byte unchanged.

- [ ] **Step 4: Update Storybook fixture contracts**

Extend the current story-table test with an expected certification-title array
and assert `score.evidenceIds` resolves to:

```ts
{
  'continuous-delivery': ['CKAD'],
  'deployment-automation': ['CKAD'],
  'monitoring-observability': ['CKA', 'CKAD'],
  'flexible-infrastructure': ['KCNA', 'CKA'],
}
```

All other story rows must resolve to an empty certification array.

- [ ] **Step 5: Run focused projection and aggregate tests**

```sh
../../node_modules/.bin/vitest run \
  apps/github.io/src/app/devops-capability-evidence/kubernetes-certification-evidence.data.spec.ts \
  apps/github.io/src/app/devops-capability-evidence/dora-capability-card.evidence.spec.ts \
  apps/github.io/src/app/devops-capability-evidence/devops-capability-evidence.spec.ts \
  apps/github.io/src/app/devops-capability-evidence/dora-capability-card.stories.spec.ts
```

Expected: PASS with exact selected credential IDs and unchanged score values.

- [ ] **Step 6: Review and commit the curated projections**

```sh
git diff --check
git diff -- \
  apps/github.io/src/app/devops-capability-evidence/devops-capability-evidence.data.ts \
  apps/github.io/src/app/devops-capability-evidence/devops-capability-evidence.spec.ts \
  apps/github.io/src/app/devops-capability-evidence/dora-capability-card.evidence.spec.ts \
  apps/github.io/src/app/devops-capability-evidence/dora-capability-card.stories.spec.ts
git add \
  apps/github.io/src/app/devops-capability-evidence/devops-capability-evidence.data.ts \
  apps/github.io/src/app/devops-capability-evidence/devops-capability-evidence.spec.ts \
  apps/github.io/src/app/devops-capability-evidence/dora-capability-card.evidence.spec.ts \
  apps/github.io/src/app/devops-capability-evidence/dora-capability-card.stories.spec.ts
git diff --cached
git commit -m "feat(github.io): curate DORA certification evidence"
```

---

### Task 4: Render the labelled certification row and verify the feature

**Files:**
- Modify: `apps/github.io/src/app/devops-capability-evidence/dora-capability-card.tsx:19-34`
- Modify: `apps/github.io/src/app/devops-capability-evidence/dora-capability-card.spec.tsx:60-695`

**Interfaces:**
- Consumes: grouped production rows from Task 3.
- Produces: visible and accessible `Certifications` row labels through the existing `aria-labelledby` path.
- Preserves: wrapping list markup, card sizing, typography, spacing, and generic row fallback labels.

- [ ] **Step 1: Read the official Astryx contracts before UI edits**

Run from the dependency-bearing checkout. If pnpm attempts network access, use
the existing local CLI binary without installing or upgrading packages.

```sh
pnpm exec astryx docs principles
pnpm exec astryx docs layout
pnpm exec astryx docs typography
pnpm exec astryx docs Text
pnpm exec astryx docs component Citation
```

Expected: each command prints installed official documentation. If the exact
component subcommand differs, run `pnpm exec astryx docs --help`, use the
listed Text or Citation command, and record the actual command in the task
notes. Confirm that the existing `Text type="supporting" color="secondary"`
contract and citation usage remain supported.

- [ ] **Step 2: Write failing card presentation tests**

Replace the old assertion that Flexible Infrastructure omits Certifications.
Assert the three-row order and accessible names:

```ts
const rows = screen.getAllByTestId('dora-capability-evidence-row');
const experienceRow = screen.getByRole('list', {
  name: 'Relevant experience',
});
const certificationRow = screen.getByRole('list', {
  name: 'Certifications',
});
const skillRow = screen.getByRole('list', { name: 'Technical skills' });

expect(rows.map((row) => row.getAttribute('data-group'))).toEqual([
  'applied',
  'certifications',
  'skills',
]);
expect(certificationRow).toBe(rows[1]);
expect(
  within(certificationRow)
    .getAllByRole('doc-noteref')
    .map((citation) => citation.textContent),
).toEqual(['KCNA', 'CKA']);
expect(
  experienceRow.compareDocumentPosition(certificationRow) &
    Node.DOCUMENT_POSITION_FOLLOWING,
).toBeTruthy();
expect(
  certificationRow.compareDocumentPosition(skillRow) &
    Node.DOCUMENT_POSITION_FOLLOWING,
).toBeTruthy();
```

Add parameterized assertions for `CKAD`, `CKAD`, `CKA + CKAD`, and
`KCNA + CKA` on the four affected cards. For an unaffected card, assert
`queryByRole('list', { name: 'Certifications' })` is null. Retain the empty-row
test and assert it also omits the visible Certifications text.

- [ ] **Step 3: Run the DORA card suite and verify the missing-label failure**

```sh
../../node_modules/.bin/vitest run \
  apps/github.io/src/app/devops-capability-evidence/dora-capability-card.spec.tsx
```

Expected: FAIL because the certification list still has the generated
capability-specific `aria-label` and no visible **Certifications** label.

- [ ] **Step 4: Add the visible label through the existing mapping**

Change only the shared label map:

```ts
const visibleEvidenceGroupLabels: Partial<
  Record<DoraCapabilityCardEvidenceGroup, string>
> = {
  applied: 'Relevant experience',
  certifications: 'Certifications',
  skills: 'Technical skills',
};
```

Do not change `DoraCapabilityEvidenceRow`; its current conditional `Text`,
`useId`, and `aria-labelledby` logic already provides the approved visual and
accessibility behavior.

- [ ] **Step 5: Run focused component and Storybook contract tests**

```sh
../../node_modules/.bin/vitest run \
  apps/github.io/src/app/devops-capability-evidence/capability-evidence.spec.tsx \
  apps/github.io/src/app/devops-capability-evidence/dora-capability-card.evidence.spec.ts \
  apps/github.io/src/app/devops-capability-evidence/dora-capability-card.spec.tsx \
  apps/github.io/src/app/devops-capability-evidence/dora-capability-card.stories.spec.ts \
  apps/github.io/src/app/devops-capability-evidence/capability-evidence.stories.spec.ts
```

Expected: PASS with labelled rows, exact citation order, concrete metadata,
and unaffected-card omission.

- [ ] **Step 6: Run full static and application verification**

Use the local dependency installation when sandboxed:

```sh
NX_DAEMON=false ../../node_modules/.bin/nx test github.io --skip-nx-cache
NX_DAEMON=false ../../node_modules/.bin/nx lint github.io --skip-nx-cache
NX_DAEMON=false ../../node_modules/.bin/nx build github.io --skip-nx-cache
NX_DAEMON=false ../../node_modules/.bin/nx build-storybook github.io --skip-nx-cache
```

Expected: all four targets succeed. Record the pre-existing Nx Vite path-plugin
deprecation warning if it still appears; do not broaden this feature to fix it.

- [ ] **Step 7: Run Storybook and inspect affected cards visually**

```sh
NX_DAEMON=false ../../node_modules/.bin/nx storybook github.io --skip-nx-cache --host 127.0.0.1 --port 6009
```

Inspect these story IDs at phone, iPad, and desktop widths:

```text
github-io-devops-capability-evidence-dora-capability-card--flexible-infrastructure
github-io-devops-capability-evidence-dora-capability-card--continuous-delivery
github-io-devops-capability-evidence-dora-capability-card--deployment-automation
github-io-devops-capability-evidence-dora-capability-card--monitoring-and-observability
```

Confirm **Certifications** follows **Relevant experience**, precedes
**Technical skills**, and stays associated with wrapped citations without
clipping, overlap, or horizontal overflow. Open each citation hover card and
confirm badge, Name, ID, Status, and Completed content.

- [ ] **Step 8: Review the complete implementation and commit the UI contract**

Run the available Codex review workflow against the complete branch diff. Fix
all in-scope findings and repeat focused tests for changed files. Then:

```sh
git diff --check
git status --short
git diff -- \
  apps/github.io/src/app/devops-capability-evidence/dora-capability-card.tsx \
  apps/github.io/src/app/devops-capability-evidence/dora-capability-card.spec.tsx
git add \
  apps/github.io/src/app/devops-capability-evidence/dora-capability-card.tsx \
  apps/github.io/src/app/devops-capability-evidence/dora-capability-card.spec.tsx
git diff --cached
git commit -m "feat(github.io): label DORA certification rows"
git status --short --branch
```

Expected: the branch is clean after four logical commits, all verification is
green, and no push, PR, merge, deployment, or handoff action has occurred.

---

## Completion Criteria

- The canonical registry is the only source of KCNA, CKA, and CKAD credential facts.
- Kubernetes skill and roadmap surfaces preserve their existing content and order.
- The generic Kubernetes certification evidence item no longer exists.
- Exactly three concrete certification evidence records exist with approved mappings.
- Only four DORA cards show a **Certifications** row, with exact approved content and order.
- Concrete DORA citations expose badge, proof link, active/expired status, and complete metadata.
- Unaffected cards and incomplete certification fallbacks remain unchanged.
- Curated numeric scores remain unchanged while evidence counts reflect selected certifications.
- Focused tests, full test, lint, app build, Storybook build, and responsive visual review pass.
- Work remains local on `feat/dora-kubernetes-certifications`, awaiting explicit handoff approval.
