# DevOps Evidence-Backed Capability Components Design

## Goal

Define a set of reusable React components that represent personal DevOps capability using evidence that can be safely shown in a public portfolio: CNCF certifications, education, learning history, skills, public projects, and summarized work experience.

This is not a dashboard implementation plan. The components should be designed so they can later appear inside panels, cards, timelines, profile sections, or a Grafana-style dashboard layout without each component owning the surrounding page chrome.

## Positioning

The portfolio should present capability as evidence-backed professional development, not as a public dump of private company delivery data. DORA metrics can still inform the language and optional private summaries, but the main public components should work without detailed deployment logs, incident records, PR timestamps, or other sensitive company information.

The claim should be:

> These DevOps capabilities are supported by verifiable certifications, education, learning, skills, projects, and safely summarized work experience.

Every capability component must link back to evidence showing why that capability is represented. If there is no public or safely summarized evidence for a capability, the component should not render that capability in the public portfolio.

## Source Models

DORA defines software delivery performance through four core metrics:

- Deployment frequency: how often production deployments happen over a period.
- Change lead time: how long a change takes from commit to production.
- Change failure rate: the percentage of production changes that cause degraded service or require remediation.
- Failed deployment recovery time: how long it takes to recover from a failed deployment.

DORA's capability catalog also connects delivery outcomes to practices such as continuous delivery, test automation, trunk-based development, working in small batches, flexible infrastructure, monitoring and observability, documentation quality, and visual management.

DORA and SRE guidance should be treated as context for capability categories and optional outcome summaries. They should not force the portfolio to expose raw company data. For the first implementation wave, prefer credentials, education, learning, skill metadata, public projects, and sanitized work summaries.

References:

- DORA metrics: https://dora.dev/guides/dora-metrics/
- DORA capabilities: https://dora.dev/capabilities/
- DORA continuous delivery: https://dora.dev/capabilities/continuous-delivery/
- Google SRE SLOs: https://sre.google/sre-book/service-level-objectives/
- Google SRE error budgets: https://sre.google/sre-book/embracing-risk/

## Design Principles

- Build reusable components, not dashboard panels. Names should describe the data visualization or evidence object, not its container.
- Keep layout ownership outside each component. A component can define its own internal geometry, but panels, cards, grids, and pages decide placement.
- Render only with evidence. A component that lacks required data should return `null` or expose a typed empty state for a parent to decide whether to show.
- Prefer public evidence and safe summaries over operational telemetry. If company data is sensitive, do not require it.
- Separate capability evidence from private outcomes. DORA values can support an internal score or a sanitized claim, but the public component should stand on evidence the owner is comfortable showing.
- Avoid vanity scoring. Scores must be derived from data and a visible rubric, not arbitrary confidence.

## Core Data Model

All components should consume a shared evidence model. Exact implementation can change later, but the spec should preserve these concepts.

```ts
type DevOpsCapability =
  | 'automation'
  | 'delivery'
  | 'cloud'
  | 'containers'
  | 'reliability'
  | 'security';

type EvidenceType =
  | 'work-experience'
  | 'project'
  | 'certification'
  | 'education'
  | 'learning'
  | 'skill'
  | 'operational-outcome';

interface DevOpsEvidenceItem {
  id: string;
  title: string;
  type: EvidenceType;
  date: string;
  endDate?: string;
  organization?: string;
  role?: string;
  summary: string;
  capabilities: DevOpsCapability[];
  metricLinks?: DoraMetricKind[];
  technologies?: string[];
  proofUrl?: string;
  issuer?: string;
  credentialId?: string;
  sourceLabel?: string;
  isPublic: boolean;
  isSensitive?: boolean;
  confidence: 'low' | 'medium' | 'high';
}

type DoraMetricKind =
  | 'deployment-frequency'
  | 'change-lead-time'
  | 'change-failure-rate'
  | 'failed-deployment-recovery-time';
```

The evidence item is the credibility anchor. A reusable capability component should consume this evidence model directly or consume derived summaries generated from it.

Private work evidence can support a score, but the public UI must only show safe summaries. For example, "owned CI/CD improvements for a four-developer product team" is acceptable, while exact deployment counts, repository URLs, customer names, and incident IDs should stay private unless explicitly approved.

## Component Catalog

Each catalog entry describes a standalone reusable React component. A future page, card, panel, or dashboard can wrap these components, but wrappers must not be required for the component to make sense in Storybook or tests.

### `EvidenceBackedCapabilityRadar`

Purpose: Evolve the existing `DevOpsCapabilityRadar` concept so each radar axis is backed by real evidence rather than static scores.

Capabilities represented:

- Automation
- Delivery
- Cloud
- Containers
- Reliability
- Security

Recommended visual forms:

- Radar chart with one score per capability.
- Hidden or omitted axes when no evidence exists.
- Tooltip or adjacent summary linking each score to evidence counts and strongest evidence.

Required data:

- Capability keys.
- Evidence items grouped by capability.
- Score rubric.
- Visibility rule for each axis.

Optional data:

- Featured evidence item per capability.
- Evidence count by type.
- Recency weighting.
- DORA metric links for Delivery, Automation, or Reliability when safe.

Example data:

```ts
const capabilitySummaries = [
  {
    capability: 'containers',
    score: 4,
    evidenceIds: ['cka-certification', 'kubernetes-learning-path'],
    strongestEvidenceId: 'cka-certification',
    evidenceTypes: ['certification', 'learning', 'skill'],
  },
  {
    capability: 'delivery',
    score: 4,
    evidenceIds: ['github-actions-prod-pipeline', 'cicd-course'],
    strongestEvidenceId: 'github-actions-prod-pipeline',
    evidenceTypes: ['work-experience', 'education', 'skill'],
  },
];
```

Visibility rule: render an axis only when there is at least one safely displayable evidence item for that capability. A private-only work item can support the score only if a safe public summary is available.

Useful claims:

- "Capability scores are evidence-backed."
- "Container capability is supported by CNCF certification and Kubernetes learning."
- "Delivery capability is supported by safely summarized CI/CD ownership."

### `CertificationCapabilityMap`

Purpose: Show how certifications validate specific DevOps capabilities.

Capabilities represented:

- Cloud
- Containers
- Security
- Reliability
- Delivery when certifications cover CI/CD or platform engineering.

Recommended visual forms:

- Credential list.
- Badge row grouped by capability.
- Mini matrix mapping certification to capabilities.

Required data:

- Certification title.
- Issuer.
- Issue date.
- Capability tags.
- Credential URL or safe proof summary.

Optional data:

- Expiration date.
- Credential ID.
- Logo or issuer brand metadata.
- Related skills.
- Related learning path.

Example data:

```ts
const certifications = [
  {
    id: 'cka-certification',
    title: 'Certified Kubernetes Administrator',
    issuer: 'Cloud Native Computing Foundation',
    date: '2026-04-10',
    capabilities: ['containers', 'reliability'],
    technologies: ['Kubernetes'],
    proofUrl: 'https://www.credly.com/example',
    isPublic: true,
    confidence: 'high',
  },
];
```

Visibility rule: render only certifications with public proof or a safe proof summary. Do not render expired credentials unless the UI clearly labels them as expired.

Useful claims:

- "Container capability has external validation."
- "Cloud-native operations are supported by CNCF credentials."
- "Certifications are mapped to capabilities instead of listed as isolated badges."

### `EducationLearningTimeline`

Purpose: Show structured learning, courses, books, labs, workshops, and study milestones over time.

Capabilities represented:

- Any capability with learning evidence.

Recommended visual forms:

- Timeline.
- Grouped list by capability.
- Learning-progress strip.

Required data:

- Learning title.
- Provider or source.
- Date or date range.
- Capability tags.
- Summary of what was learned.

Optional data:

- Completion proof URL.
- Hours or modules completed.
- Related certification.
- Related project or work application.

Example data:

```ts
const learningItems = [
  {
    id: 'kubernetes-learning-path',
    title: 'Kubernetes operations study path',
    type: 'learning',
    date: '2026-03-01',
    endDate: '2026-04-05',
    sourceLabel: 'Self-directed labs and CNCF preparation',
    summary: 'Practiced cluster operations, workloads, services, troubleshooting, and kubectl workflows.',
    capabilities: ['containers', 'reliability'],
    technologies: ['Kubernetes'],
    isPublic: true,
    confidence: 'medium',
  },
];
```

Visibility rule: render only learning items with enough summary text to explain what capability they support. Do not show generic "watched course" entries unless they connect to a capability.

Useful claims:

- "Learning is continuous and capability-directed."
- "Education supports the same capability model as certifications and work."
- "Learning evidence is visible without revealing company details."

### `SkillCapabilityMatrix`

Purpose: Map tools and skills to DevOps capabilities without implying unsupported mastery.

Capabilities represented:

- Automation
- Delivery
- Cloud
- Containers
- Reliability
- Security

Recommended visual forms:

- Matrix.
- Grouped skill chips.
- Capability rows with skill counts.

Required data:

- Skill name.
- Capability tags.
- Evidence IDs that justify showing the skill.

Optional data:

- Brand metadata.
- Skill category.
- Years or recency, only if reliable.
- Public proof link.

Example data:

```ts
const skills = [
  {
    id: 'kubernetes',
    name: 'Kubernetes',
    capabilities: ['containers', 'reliability'],
    evidenceIds: ['cka-certification', 'kubernetes-learning-path'],
  },
  {
    id: 'github-actions',
    name: 'GitHub Actions',
    capabilities: ['automation', 'delivery'],
    evidenceIds: ['github-actions-prod-pipeline'],
  },
];
```

Visibility rule: render a skill only when it has at least one evidence link. Skills without evidence should stay out of public capability components.

Useful claims:

- "Skills are evidence-linked, not keyword stuffing."
- "Each shown tool contributes to a visible capability."
- "Private work tools can be shown through safe summaries."

### `DeploymentFrequencyTrend`

Purpose: Optionally show a sanitized deployment-frequency outcome when safe aggregate data exists.

Capabilities represented:

- Delivery
- Automation
- Continuous delivery

Recommended visual forms:

- Small stat for current period count.
- Bar chart by week or month.
- Sparkline for trend.

Required data:

- Aggregate production deployment count or safe deployment-frequency range.
- Selected period.
- Service or application name.
- Environment, normally `production`.
- Deployment source, such as GitHub Actions, manual release, Argo CD, or another pipeline.
- Evidence item showing the owner built, improved, or operated the deployment process.

Optional data:

- Commit SHA or release tag.
- Pull request IDs included in the deployment.
- Deployment duration.
- Actor, bot, or triggering system.
- Rollback flag.

Example data:

```ts
const deployments = [
  {
    period: '2026-Q2',
    service: 'product-api',
    environment: 'production',
    deploymentFrequency: 'weekly',
    source: 'GitHub Actions',
    evidenceIds: ['github-actions-prod-pipeline'],
  },
];
```

Visibility rule: render only when an aggregate value or range can be safely shown and at least one evidence item explains the owner's contribution. Do not require raw deployment timestamps for the public portfolio.

Useful claims:

- "Improved release repeatability."
- "Automated production deployment."
- "Enabled more frequent low-risk releases."

### `ChangeLeadTimeDistribution`

Purpose: Optionally show a sanitized change lead time outcome when safe aggregate data exists.

Capabilities represented:

- Delivery
- Flow efficiency
- Continuous integration

Recommended visual forms:

- Median lead time stat.
- P75 or P90 lead time stat when there is enough data.
- Histogram or box plot by change.
- Trend line by week or month.

Required data:

- Aggregate median, range, or qualitative bucket for lead time.
- Selected period.
- Service or application name.
- Evidence item showing the owner improved CI/CD flow.

Optional data:

- PR size.
- Review duration.
- CI duration.
- Queue time before deployment.
- Change type, such as feature, fix, dependency, infrastructure, or configuration.

Example data:

```ts
const changes = [
  {
    period: '2026-Q2',
    service: 'product-api',
    leadTimeBucket: 'same-day-to-next-day',
    measurementBasis: 'PR merge to production deployment',
    evidenceIds: ['ci-gate-standardization'],
  },
];
```

Visibility rule: render only when the measurement basis can be described safely. Exact PR timestamps are not required for the public component.

Useful claims:

- "Reduced delivery waiting time."
- "Made the path from merge to production observable."
- "Improved CI/CD flow for a small product team."

### `ChangeFailureRate`

Purpose: Optionally show a sanitized release-quality outcome when safe aggregate data exists.

Capabilities represented:

- Reliability
- Release quality
- Safe delivery
- Security when failed changes involve security controls or vulnerable releases.

Recommended visual forms:

- Percentage stat.
- Stacked success/failure bar by period.
- Small annotations for failed changes.

Required data:

- Aggregate change failure rate, range, or qualitative bucket.
- Selected period.
- Safe explanation of what counts as a failed change.
- Evidence item for release safety, rollback, monitoring, or incident process work.

Optional data:

- Severity.
- Root cause category.
- Detection source.
- Affected service.
- Customer impact summary.

Example data:

```ts
const deploymentOutcomes = [
  {
    period: '2026-Q2',
    service: 'product-api',
    failureRateBucket: 'low',
    failureDefinition: 'production changes requiring rollback or hotfix',
    evidenceIds: ['rollback-runbook'],
  },
];
```

Visibility rule: render only when the failure definition and aggregate bucket can be shown without exposing private incidents.

Useful claims:

- "Added release safety checks."
- "Created rollback path and incident linkage."
- "Improved quality visibility for production changes."

### `FailedDeploymentRecoveryTime`

Purpose: Optionally show a sanitized recovery outcome when safe aggregate data exists.

Capabilities represented:

- Reliability
- Incident response
- Observability
- Automation

Recommended visual forms:

- Median recovery time stat.
- Incident timeline.
- Scatter plot of failed deployments by recovery duration.

Required data:

- Aggregate recovery time, range, or qualitative bucket.
- Selected period.
- Recovery action.
- Evidence item for rollback automation, alerting, runbooks, or incident response.

Optional data:

- Alert source.
- Rollback duration.
- Time to detect.
- Time to mitigate.
- Postmortem URL or notes.
- Preventative follow-up.

Example data:

```ts
const recoveries = [
  {
    period: '2026-Q2',
    service: 'product-api',
    recoveryTimeBucket: 'under-one-hour',
    recoveryAction: 'rollback',
    evidenceIds: ['rollback-runbook', 'deployment-alerting'],
  },
];
```

Visibility rule: render only when a safe aggregate or bucket is available. Do not expose incident IDs, timestamps, or customer impact details.

Useful claims:

- "Reduced recovery time through rollback automation."
- "Improved alert-to-action path."
- "Owned incident response for deployment failures."

### `DoraOutcomeSummary`

Purpose: Summarize the four DORA metrics as a compact outcome view.

Capabilities represented:

- Delivery
- Automation
- Reliability

Recommended visual forms:

- Four compact metric tiles.
- Mini radar only if all four metrics can be normalized honestly.
- Summary strip showing current period and previous period.

Required data:

- Valid data for deployment frequency.
- Valid data for change lead time.
- Valid data for change failure rate.
- Valid data for failed deployment recovery time, or a documented no-failure period.

Optional data:

- Previous period comparison.
- Benchmark labels, only if sourced and clearly explained.
- Confidence by metric.

Example data:

```ts
const doraSummary = {
  period: '2026-Q3',
  deploymentFrequency: { value: 18, unit: 'deployments/month' },
  changeLeadTime: { value: 16, unit: 'hours', statistic: 'median' },
  changeFailureRate: { value: 5.6, unit: 'percent' },
  failedDeploymentRecoveryTime: { value: 27, unit: 'minutes', statistic: 'median' },
  evidenceIds: ['github-actions-prod-pipeline', 'rollback-runbook'],
};
```

Visibility rule: render only when at least three of the four metric inputs are valid. The missing metric must be shown as unavailable, not inferred.

Useful claims:

- "Owned delivery-system health."
- "Connected delivery speed with operational stability."
- "Measured DevOps improvements with production data."

### `CapabilityEvidenceMatrix`

Purpose: Show which DevOps capabilities have supporting evidence across work, projects, certifications, education, learning, skills, and operational outcomes.

Capabilities represented:

- Automation
- Delivery
- Cloud
- Containers
- Reliability
- Security

Recommended visual forms:

- Matrix or heatmap.
- Capability rows by evidence-type columns.
- Clickable cells that reveal evidence items.

Required data:

- Evidence items with capability tags.
- Evidence type.
- Date.
- Public/private flag.
- Confidence.

Optional data:

- Proof URL.
- Tool tags.
- Related DORA metric.
- Strength score by evidence item.

Example data:

```ts
const evidence = [
  {
    id: 'github-actions-prod-pipeline',
    title: 'Production deployment workflow',
    type: 'project',
    date: '2026-06-12',
    summary: 'Built GitHub Actions workflow for tested production releases.',
    capabilities: ['automation', 'delivery'],
    metricLinks: ['deployment-frequency', 'change-lead-time'],
    technologies: ['GitHub Actions', 'Docker'],
    isPublic: false,
    confidence: 'high',
  },
];
```

Visibility rule: render a capability row only when it has at least one public or safely summarized evidence item. Render an evidence-type cell only when at least one item exists for that capability and type.

Useful claims:

- "Capability coverage is evidence-backed."
- "Security is hidden or marked developing until real evidence exists."
- "Learning and certifications are separated from production experience."

### `DevOpsEvidenceLog`

Purpose: Provide the reusable source-of-truth list behind all capability and DORA components.

Capabilities represented:

- Attribution
- Credibility
- Auditability

Recommended visual forms:

- Filterable list.
- Compact table.
- Timeline-ready data source.

Required data:

- Evidence item ID.
- Title.
- Type.
- Date or date range.
- Summary.
- Capability tags.
- Public/private flag.
- Confidence.

Optional data:

- Organization.
- Role.
- Proof URL.
- Technologies.
- DORA metric links.
- Related component IDs.

Example data:

```ts
const evidenceLog = [
  {
    id: 'rollback-runbook',
    title: 'Rollback runbook and release recovery path',
    type: 'work-experience',
    date: '2026-07-01',
    organization: 'Current company',
    role: 'DevOps owner',
    summary: 'Documented and automated rollback flow for failed deployments.',
    capabilities: ['reliability', 'automation', 'delivery'],
    metricLinks: ['change-failure-rate', 'failed-deployment-recovery-time'],
    technologies: ['GitHub Actions', 'Docker', 'Monitoring'],
    isPublic: false,
    confidence: 'high',
  },
];
```

Visibility rule: render only evidence items that are public or safe to summarize. Private evidence can support aggregate metrics but should not expose confidential details.

Useful claims:

- "Every metric has backing evidence."
- "Work experience, education, learning, certifications, and skills are distinct evidence types."
- "Portfolio claims can be inspected instead of merely asserted."

### `CapabilityScore`

Purpose: Convert evidence into a compact capability maturity indicator without pretending the score is a pure DORA measurement.

Capabilities represented:

- Any individual DevOps capability.

Recommended visual forms:

- Score chip.
- Progress bar.
- Small radial indicator.
- Text summary with evidence count.

Required data:

- Capability key.
- Evidence items for that capability.
- Scoring rubric.
- Evidence strength values.

Optional data:

- DORA metric links for delivery, automation, and reliability.
- Recency weighting.
- Certification weighting.

Example rubric:

```ts
const capabilityRubric = [
  { score: 0, label: 'No evidence' },
  { score: 1, label: 'Basic learning evidence' },
  { score: 2, label: 'Guided labs or coursework' },
  { score: 3, label: 'Personal or internal project evidence' },
  { score: 4, label: 'Production work evidence' },
  { score: 5, label: 'Led, improved, or standardized production practice with measurable outcome' },
];
```

Visibility rule: do not render scores of `0`. A capability with only learning evidence should be labelled as developing, not production-proven.

Useful claims:

- "Delivery capability is high because DORA outcomes and production release evidence exist."
- "Security capability is shown only if backed by security controls, certifications, incidents, or implementation evidence."
- "Education supports capability but does not replace operational evidence."

### `ExperienceCapabilityTimeline`

Purpose: Show how capability evidence accumulates over time.

Capabilities represented:

- Capability growth
- Career progression
- Learning momentum

Recommended visual forms:

- Timeline.
- Swimlanes by capability.
- Milestone markers by evidence type.

Required data:

- Evidence items with dates.
- Capability tags.
- Evidence type.
- Summary.

Optional data:

- Organization.
- Role.
- Proof URL.
- DORA metric link.
- Outcome value.

Example data:

```ts
const timelineItems = [
  {
    id: 'aws-saa',
    title: 'AWS Solutions Architect Associate',
    type: 'certification',
    date: '2025-11-20',
    capabilities: ['cloud'],
    summary: 'Validated cloud architecture fundamentals.',
    isPublic: true,
    confidence: 'medium',
  },
  {
    id: 'deployment-alerting',
    title: 'Deployment alerting added',
    type: 'operational-outcome',
    date: '2026-07-08',
    capabilities: ['reliability', 'delivery'],
    metricLinks: ['failed-deployment-recovery-time'],
    summary: 'Added alerting to detect failed production deployments faster.',
    isPublic: false,
    confidence: 'high',
  },
];
```

Visibility rule: render only when at least three dated evidence items exist. Otherwise the same data is better shown through `DevOpsEvidenceLog`.

Useful claims:

- "Capability has progressed from learning to production ownership."
- "Recent work shows active DevOps growth."
- "Certifications and work outcomes are visible as different kinds of proof."

## Recommended Build Order

1. `DevOpsEvidenceLog`
2. `EvidenceBackedCapabilityRadar`
3. `CertificationCapabilityMap`
4. `EducationLearningTimeline`
5. `SkillCapabilityMatrix`
6. `CapabilityEvidenceMatrix`
7. `CapabilityScore`
8. `ExperienceCapabilityTimeline`
9. Optional DORA outcome components only if safe aggregate data is available:
   `DeploymentFrequencyTrend`, `ChangeLeadTimeDistribution`, `ChangeFailureRate`,
   `FailedDeploymentRecoveryTime`, and `DoraOutcomeSummary`.

The evidence log should come first because it becomes the shared source for every later claim. The radar should come second because it matches the existing `DevOpsCapabilityRadar` direction and can immediately become evidence-backed without needing private company telemetry. Certification, education, learning, and skill components should come before DORA outcome components because they rely on safer public or personally controlled data.

## Data Collection Checklist

For certifications:

- Certification title.
- Issuer, such as CNCF, AWS, Microsoft, HashiCorp, or Linux Foundation.
- Issue date.
- Expiration date if relevant.
- Credential URL or safe proof summary.
- Capability tags.
- Related skills and technologies.

For education:

- Program, course, degree, workshop, or training title.
- Institution or provider.
- Date or date range.
- Capability tags.
- Short summary of what it proves.
- Public proof URL if available.

For learning:

- Learning title.
- Source, such as course, book, lab, documentation path, workshop, or self-directed study.
- Date or date range.
- Capability tags.
- Technologies practiced.
- Completion proof or safe summary.
- Related certification, project, or work application if available.

For skills:

- Skill or technology name.
- Capability tags.
- Evidence IDs proving why the skill should be shown.
- Brand metadata if already available in the app.
- Public proof or safe summary where possible.

For public or summarized work experience:

- Role or responsibility.
- Date range.
- Capability tags.
- Tools and systems used.
- Safe summary of what the owner built, changed, automated, documented, operated, or led.
- Evidence type, such as work experience, project, or operational outcome.
- Confidentiality flag.

For optional deployment frequency:

- Aggregate production deployment frequency or safe range.
- Service or app name.
- Deployment source or pipeline.
- Evidence showing contribution to the deployment process.

For optional change lead time:

- Aggregate lead time bucket, range, or median if safe.
- Measurement basis, such as PR merge to production.
- Service or app name.
- Evidence showing contribution to CI/CD flow.

For optional change failure rate:

- Aggregate failure rate bucket, range, or percentage if safe.
- Safe definition of failed change.
- Evidence showing contribution to release safety.

For optional failed deployment recovery time:

- Aggregate recovery bucket, range, or median if safe.
- Safe recovery action category.
- Evidence showing contribution to recovery, alerting, rollback, or runbooks.

For personal attribution:

- What the owner built, changed, automated, documented, operated, or led.
- Date range.
- Tools and systems used.
- Outcome connected to the DORA metric.
- Public proof URL where possible.
- Safe private summary when proof cannot be public.

## Confidentiality Rules

- Use anonymized service names when needed, such as `customer-api`, `internal-admin`, or `worker-service`.
- Use rounded values, qualitative buckets, or ranges when exact company metrics are sensitive.
- Do not expose customer names, revenue impact, internal incident IDs, private repository URLs, secrets, vendors under NDA, or screenshots containing confidential data.
- When using private evidence, label it as private work evidence and summarize the contribution without exposing protected details.

## Out Of Scope

- Building a complete dashboard now.
- Creating route-level integration.
- Comparing the owner against teammates.
- Publishing raw company logs.
- Requiring private DORA source data before building useful portfolio components.
- Claiming DORA metrics are individual productivity metrics.
- Adding generic chart abstractions before a concrete component needs them.
- Replacing the existing `DevOpsCapabilityRadar` unless a later implementation plan explicitly chooses to evolve it.

## Validation For Future Implementation

Each component should have focused tests for:

- rendering only when required data exists;
- hiding or returning an explicit empty state when evidence is missing;
- correct capability derivation from evidence;
- correct optional DORA calculation logic only for DORA-specific components;
- accessible text summary for chart values;
- links between metric records and evidence items;
- redaction behavior for private evidence.

Visual review should happen in Storybook before a component is used in the public portfolio.
