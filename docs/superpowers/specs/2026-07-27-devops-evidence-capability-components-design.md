# DevOps Evidence-Backed Capability Visualizations Design

## Goal

Create a suite of reusable React components for the `github.io` app that visualize the owner's DevOps abilities against selected DORA capability areas, using evidence similar to what belongs on a LinkedIn profile: skills, learning, work experience, education, certifications, and projects.

The components should feel like a family of graph/chart/figure components in the same spirit as the existing `DevOpsCapabilityRadar`: compact, portfolio-ready visualizations with every visible capability backed by real evidence.

This is not a full dashboard plan and not a DORA operations-metrics implementation. The deliverable should be a reusable evidence/scoring model plus multiple standalone visual components. A parent can later place those components inside cards, panels, portfolio sections, routes, or dashboard layouts.

## Positioning

The portfolio should show:

> My DevOps capability profile, mapped to DORA capability areas and backed by public or safely summarized career evidence.

The portfolio should not require detailed private company data. DORA software delivery metrics such as deployment frequency, change lead time, change fail rate, deployment rework rate, and failed deployment recovery time can be optional supporting context later, but they are not required for these components.

The credibility rule is:

> A capability appears only when it has evidence that would be reasonable to include on LinkedIn or in a public portfolio.

Examples of acceptable evidence:

- CNCF certifications such as CKA, CKAD, CKS, or KCNA.
- Cloud, security, Linux, Terraform, or platform certifications.
- Formal education, courses, bootcamps, workshops, and training.
- Self-directed learning paths, labs, books, and documentation study.
- Public or safely summarized projects.
- Work experience described without private system details.
- Skills and tools only when linked to at least one evidence item.

## DORA Source Model

DORA's capability catalog includes practices that drive software delivery and operational performance. These components should use selected DORA capabilities as visualization dimensions, not the five DORA delivery metrics as required input data.

Recommended first set of DORA-aligned dimensions:

1. Continuous Delivery
2. Deployment Automation
3. Continuous Integration
4. Test Automation
5. Monitoring and Observability
6. Flexible Infrastructure
7. Pervasive Security
8. Trunk-Based Development
9. Documentation Quality
10. Version Control

These dimensions are intentionally selected from the DORA catalog because they map cleanly to public portfolio evidence. Other DORA capabilities such as generative organizational culture, job satisfaction, team experimentation, work in process limits, and well-being are valuable, but they are harder to evidence credibly in a personal public portfolio and should stay out of the first component set.

References:

- DORA capabilities: https://dora.dev/capabilities/
- DORA continuous delivery: https://dora.dev/capabilities/continuous-delivery/
- DORA software delivery metrics: https://dora.dev/guides/dora-metrics/

## Shared Evidence Data Model

Use a profile-evidence model, not private operational telemetry.

```ts
type DoraCapabilityKey =
  | 'continuous-delivery'
  | 'deployment-automation'
  | 'continuous-integration'
  | 'test-automation'
  | 'monitoring-observability'
  | 'flexible-infrastructure'
  | 'pervasive-security'
  | 'trunk-based-development'
  | 'documentation-quality'
  | 'version-control';

type EvidenceType =
  | 'skill'
  | 'learning'
  | 'experience'
  | 'education'
  | 'certification'
  | 'project';

interface CapabilityEvidenceItem {
  id: string;
  title: string;
  type: EvidenceType;
  capabilityKeys: DoraCapabilityKey[];
  date?: string;
  endDate?: string;
  issuer?: string;
  organization?: string;
  summary: string;
  technologies?: string[];
  proofUrl?: string;
  isPublic: boolean;
  isSensitive?: boolean;
  strength: 'supporting' | 'strong' | 'primary';
}

interface DoraCapabilityScore {
  capabilityKey: DoraCapabilityKey;
  label: string;
  score: number;
  maxScore: 5;
  evidenceIds: string[];
  strongestEvidenceId?: string;
  evidenceCounts: Partial<Record<EvidenceType, number>>;
}
```

`CapabilityEvidenceItem` should be the source of truth. `DoraCapabilityScore` should be derived from evidence, not hand-authored as the primary data source.

## Scoring Rubric

Scores should be explainable and conservative:

```ts
const evidenceStrengthScore = {
  supporting: 1,
  strong: 2,
  primary: 3,
} as const;
```

Recommended scoring:

- `0`: no evidence; do not render this capability in score-based visualizations.
- `1`: one supporting evidence item, such as a listed skill or introductory learning.
- `2`: multiple supporting items or one strong item, such as a completed course/lab with summary.
- `3`: public project, meaningful learning path, or work summary tied to the capability.
- `4`: strong production work summary, recognized certification, or multiple strong evidence types.
- `5`: primary evidence showing leadership, standardization, certification plus applied work, or measurable improvement that can be safely summarized.

Certification weighting should be high but not absolute. For example, a CNCF certification can strongly support Flexible Infrastructure, Monitoring and Observability, or Pervasive Security, but it should not automatically make every related capability a `5` without applied evidence.

Skills alone should not push a capability above `2`. A skill becomes stronger when connected to learning, certification, project, education, or experience evidence.

## Component Set

### `DevOpsCapabilityEvidenceRadar`

Visual purpose: show the overall evidence-backed capability shape across DORA-aligned dimensions.

Recommended chart: radar chart using the existing `DevOpsCapabilityRadar` charting and Astryx styling pattern.

Required data:

- derived `DoraCapabilityScore[]`;
- capability labels;
- hidden accessible summary;
- visibility rule that excludes score `0` capabilities.

Best use: first-glance portfolio profile.

### `DevOpsCapabilityEvidenceMatrix`

Visual purpose: show which evidence types support each DORA capability.

Recommended chart: matrix or heatmap where rows are DORA capabilities and columns are `skill`, `learning`, `experience`, `education`, `certification`, and `project`.

Required data:

- evidence items;
- capability labels;
- evidence type labels;
- counts grouped by capability and evidence type.

Best use: credibility view that explains why radar axes exist.

### `DevOpsEvidenceTypeDonut`

Visual purpose: show the mix of evidence types behind the capability profile.

Recommended chart: donut, pie, or segmented ring.

Required data:

- evidence items;
- count by evidence type;
- accessible summary of evidence totals.

Best use: quickly communicating whether the profile is mostly certifications, projects, learning, or production experience.

### `DevOpsCapabilityBarList`

Visual purpose: show ranked DORA capability scores in a mobile-friendly, label-friendly format.

Recommended chart: horizontal bars with score, evidence count, and strongest evidence label.

Required data:

- derived `DoraCapabilityScore[]`;
- strongest evidence lookup;
- accessible summary.

Best use: fallback or companion to radar when labels are too dense.

### `DevOpsEvidenceTimeline`

Visual purpose: show growth of capability evidence over time.

Recommended figure: timeline grouped or color-coded by evidence type and capability.

Required data:

- evidence items with `date` or `endDate`;
- capability labels;
- evidence type labels.

Best use: showing learning and career progression without exposing private company details.

### `DevOpsCertificationCapabilityMap`

Visual purpose: show how certifications such as CNCF credentials support DORA capability areas.

Recommended figure: credential badges connected to capability chips, or a compact certification-to-capability matrix.

Required data:

- certification evidence items;
- issuer;
- proof URL or safe proof summary;
- capability labels.

Best use: highlighting external validation without making certifications look disconnected from capability claims.

## Example Evidence

```ts
const evidenceItems: CapabilityEvidenceItem[] = [
  {
    id: 'cka',
    title: 'Certified Kubernetes Administrator',
    type: 'certification',
    issuer: 'Cloud Native Computing Foundation',
    date: '2026-04-10',
    capabilityKeys: ['flexible-infrastructure', 'monitoring-observability'],
    summary: 'Validated Kubernetes cluster operations and troubleshooting knowledge.',
    technologies: ['Kubernetes'],
    proofUrl: 'https://www.credly.com/example',
    isPublic: true,
    strength: 'primary',
  },
  {
    id: 'github-actions-delivery',
    title: 'CI/CD workflow ownership',
    type: 'experience',
    organization: 'Current company',
    capabilityKeys: ['continuous-delivery', 'deployment-automation', 'continuous-integration'],
    summary: 'Owned CI/CD workflow improvements for a four-developer product team using safe public summary only.',
    technologies: ['GitHub Actions', 'Docker'],
    isPublic: true,
    isSensitive: true,
    strength: 'primary',
  },
  {
    id: 'kubernetes-learning',
    title: 'Kubernetes operations learning path',
    type: 'learning',
    date: '2026-03-01',
    endDate: '2026-04-05',
    capabilityKeys: ['flexible-infrastructure', 'monitoring-observability'],
    summary: 'Practiced workloads, services, troubleshooting, kubectl workflows, and cluster operations.',
    technologies: ['Kubernetes'],
    isPublic: true,
    strength: 'strong',
  },
  {
    id: 'devops-roadmap-project',
    title: 'DevOps roadmap portfolio project',
    type: 'project',
    capabilityKeys: ['documentation-quality', 'version-control'],
    summary: 'Built a portfolio visualization that maps DevOps topics, skills, and certifications.',
    technologies: ['React', 'TypeScript', 'Nx'],
    isPublic: true,
    strength: 'strong',
  },
];
```

## Derived Examples

```ts
const scores: DoraCapabilityScore[] = [
  {
    capabilityKey: 'continuous-delivery',
    label: 'Continuous Delivery',
    score: 4,
    maxScore: 5,
    evidenceIds: ['github-actions-delivery'],
    strongestEvidenceId: 'github-actions-delivery',
    evidenceCounts: { experience: 1 },
  },
  {
    capabilityKey: 'flexible-infrastructure',
    label: 'Flexible Infrastructure',
    score: 4,
    maxScore: 5,
    evidenceIds: ['cka', 'kubernetes-learning'],
    strongestEvidenceId: 'cka',
    evidenceCounts: { certification: 1, learning: 1 },
  },
];
```

The radar and bar list should not render dimensions with score `0`. The matrix can show only rows that have evidence. If only a few dimensions have evidence, the bar list should remain useful even when a radar would feel sparse.

## Visual Behavior

The components must remain reusable:

- Do not include card or panel chrome inside these components.
- Do not include page headings or route-level layout.
- Keep dimensions stable so each visualization can be placed in different containers.
- Use existing Astryx styling boundaries: Astryx components and tokens where useful, StyleX for component-local styling, and chart-library styling only where needed.
- Provide accessible summary text for chart values and grouped evidence counts.
- Use Storybook stories for each component with realistic evidence.

Recommended interactions:

- Basic hover tooltip may show score, evidence count, and strongest evidence.
- Click/drilldown can be deferred. If implemented later, components should expose selected capability or evidence through props/callbacks rather than owning modals.

## Visibility Rules

- Render a capability only if at least one evidence item for that capability is public or safely summarized.
- Do not show skills that are not linked to evidence.
- Do not show private company details, raw deployment counts, raw incident records, PR links, private repository URLs, customer names, or screenshots containing confidential information.
- If evidence is sensitive, show only the safe summary and mark it internally with `isSensitive`.
- If certification proof is unavailable, the item can still render only if the summary is safe and honest.
- Expired certifications must either be hidden or clearly labelled as expired.

## Out Of Scope

- Building a full dashboard.
- Requiring DORA delivery metrics as input data.
- Publishing private company telemetry.
- Comparing the owner with teammates or industry benchmarks.
- Creating route-level integration.
- Replacing the existing `DevOpsCapabilityRadar` unless the implementation plan chooses to evolve it into these evidence-backed components.

## Recommended Build Order

1. Define DORA capability keys, labels, evidence types, and seed evidence data.
2. Implement evidence grouping and score derivation utilities with tests.
3. Build `DevOpsCapabilityEvidenceRadar`.
4. Build `DevOpsCapabilityBarList`.
5. Build `DevOpsCapabilityEvidenceMatrix`.
6. Build `DevOpsEvidenceTypeDonut`.
7. Build `DevOpsEvidenceTimeline`.
8. Build `DevOpsCertificationCapabilityMap`.
9. Decide later where to place the components in the `github.io` app.

This order keeps the work aligned with the actual goal: multiple evidence-backed chart and figure components first, composition later.

## Validation For Future Implementation

Focused tests should cover:

- evidence-to-score derivation;
- hiding capabilities with no evidence;
- skills requiring evidence links;
- sensitive evidence using safe summaries;
- certifications mapping to the intended DORA capabilities;
- grouped evidence counts by capability and evidence type;
- accessible text summaries for each rendered visualization;
- Storybook visual review for dense and sparse evidence sets.
