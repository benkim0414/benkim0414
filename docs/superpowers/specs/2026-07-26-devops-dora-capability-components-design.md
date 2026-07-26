# DevOps DORA Capability Components Design

## Goal

Define a set of reusable React components that represent personal DevOps capability using DORA software delivery metrics and supporting evidence.

This is not a dashboard implementation plan. The components should be designed so they can later appear inside panels, cards, timelines, profile sections, or a Grafana-style dashboard layout without each component owning the surrounding page chrome.

## Positioning

The portfolio should present DORA metrics as delivery-system outcomes from a small team where the owner is the primary DevOps-focused engineer. The metrics should not be presented as a generic individual productivity score or as a comparison against other engineers.

The claim should be:

> These delivery and reliability outcomes describe systems I built, operated, automated, or improved.

Every metric-driven component must link back to evidence showing the owner's contribution. If there is no real data source or no contribution evidence, the component should not render in the public portfolio.

## Source Models

DORA defines software delivery performance through four core metrics:

- Deployment frequency: how often production deployments happen over a period.
- Change lead time: how long a change takes from commit to production.
- Change failure rate: the percentage of production changes that cause degraded service or require remediation.
- Failed deployment recovery time: how long it takes to recover from a failed deployment.

DORA's capability catalog also connects delivery outcomes to practices such as continuous delivery, test automation, trunk-based development, working in small batches, flexible infrastructure, monitoring and observability, documentation quality, and visual management.

Google SRE guidance is useful for reliability-adjacent components: SLIs, SLOs, availability, latency, error rate, throughput, and error budgets provide objective service health context alongside DORA recovery and failure metrics.

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
- Prefer anonymized real values over fake precision. If company data is sensitive, use ranges, indexed values, normalized scores, or redacted service names.
- Separate outcomes from attribution. DORA values show delivery-system performance; evidence items explain the owner's personal contribution.
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
  isPublic: boolean;
  confidence: 'low' | 'medium' | 'high';
}

type DoraMetricKind =
  | 'deployment-frequency'
  | 'change-lead-time'
  | 'change-failure-rate'
  | 'failed-deployment-recovery-time';
```

The evidence item is the credibility anchor. DORA metric records can exist separately, but any public DORA component must link to at least one evidence item for the same system or period.

## Component Catalog

Each catalog entry describes a standalone reusable React component. A future page, card, panel, or dashboard can wrap these components, but wrappers must not be required for the component to make sense in Storybook or tests.

### `DeploymentFrequencyTrend`

Purpose: Show how often production deployments happen over time.

Capabilities represented:

- Delivery
- Automation
- Continuous delivery

Recommended visual forms:

- Small stat for current period count.
- Bar chart by week or month.
- Sparkline for trend.

Required data:

- Deployment ID.
- Production deployment timestamp.
- Service or application name.
- Environment, normally `production`.
- Deployment result.
- Deployment source, such as GitHub Actions, manual release, Argo CD, or another pipeline.

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
    id: 'deploy-2026-07-18-001',
    service: 'customer-api',
    environment: 'production',
    deployedAt: '2026-07-18T09:42:00+10:00',
    result: 'success',
    source: 'GitHub Actions',
    releaseTag: '2026.07.18',
    evidenceIds: ['github-actions-prod-pipeline'],
  },
];
```

Visibility rule: render only when there are at least two production deployments in the selected period and at least one evidence item showing the owner built, improved, or operated the deployment process.

Useful claims:

- "Improved release repeatability."
- "Automated production deployment."
- "Enabled more frequent low-risk releases."

### `ChangeLeadTimeDistribution`

Purpose: Show how long code changes take to reach production.

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

- Change ID.
- Commit timestamp or PR opened timestamp.
- Merge timestamp if PR-based.
- Production deployment timestamp.
- Service or application name.

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
    id: 'pr-428',
    service: 'customer-api',
    openedAt: '2026-07-15T14:10:00+10:00',
    mergedAt: '2026-07-16T10:20:00+10:00',
    deployedAt: '2026-07-16T11:05:00+10:00',
    changeType: 'infrastructure',
    evidenceIds: ['ci-gate-standardization'],
  },
];
```

Visibility rule: render only when at least five deployed changes can be measured for the selected period. If commit-to-production data is unavailable, the component can use PR-open-to-production as a clearly labelled proxy.

Useful claims:

- "Reduced delivery waiting time."
- "Made the path from merge to production observable."
- "Improved CI/CD flow for a small product team."

### `ChangeFailureRate`

Purpose: Show the percentage of production deployments that caused user-impacting degradation, rollback, hotfix, or immediate remediation.

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

- Deployment records.
- Failure classification for each deployment.
- Failure timestamp or detection timestamp.
- Linked incident, rollback, hotfix, or remediation record.

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
    deploymentId: 'deploy-2026-07-18-001',
    service: 'customer-api',
    failed: false,
  },
  {
    deploymentId: 'deploy-2026-07-22-001',
    service: 'customer-api',
    failed: true,
    remediationType: 'rollback',
    incidentId: 'inc-2026-07-22',
    evidenceIds: ['rollback-runbook'],
  },
];
```

Visibility rule: render only when deployment records and failure classification are available for the same period. If failures are manually classified, the public UI should say so.

Useful claims:

- "Added release safety checks."
- "Created rollback path and incident linkage."
- "Improved quality visibility for production changes."

### `FailedDeploymentRecoveryTime`

Purpose: Show how quickly the team recovers when a production deployment fails.

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

- Failed deployment ID.
- Failure start or detection timestamp.
- Recovery timestamp.
- Recovery action.
- Linked incident or remediation record.

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
    deploymentId: 'deploy-2026-07-22-001',
    detectedAt: '2026-07-22T15:04:00+10:00',
    recoveredAt: '2026-07-22T15:31:00+10:00',
    recoveryAction: 'rollback',
    incidentId: 'inc-2026-07-22',
    evidenceIds: ['rollback-runbook', 'deployment-alerting'],
  },
];
```

Visibility rule: render only when at least one failed deployment has both detection and recovery timestamps. If there are no failed deployments in the selected period, render a parent-controlled positive empty state only when deployment records prove the zero-failure period.

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
2. `DeploymentFrequencyTrend`
3. `ChangeLeadTimeDistribution`
4. `ChangeFailureRate`
5. `FailedDeploymentRecoveryTime`
6. `DoraOutcomeSummary`
7. `CapabilityEvidenceMatrix`
8. `CapabilityScore`
9. `ExperienceCapabilityTimeline`

The evidence log should come first because it becomes the shared source for every later claim. Deployment frequency should come next because it usually requires the simplest production data: timestamps, service names, and outcomes. The DORA summary should wait until the four metric components have working data contracts, because otherwise it would become a hand-authored dashboard tile instead of a derived reusable component.

## Data Collection Checklist

For deployment frequency:

- Production deployment timestamps.
- Service or app name.
- Deployment result.
- Deployment source or pipeline.
- Release tag, commit SHA, or workflow run URL if safe.

For change lead time:

- Commit timestamp or PR opened timestamp.
- Merge timestamp.
- Production deployment timestamp.
- Change ID.
- Service or app name.

For change failure rate:

- Deployment list for the period.
- Failed deployment classification.
- Rollback, hotfix, remediation, or incident link.
- Failure cause category.
- Severity or customer impact if safe.

For failed deployment recovery time:

- Failed deployment ID.
- Detection timestamp.
- Recovery timestamp.
- Recovery action.
- Incident or rollback evidence.

For personal attribution:

- What the owner built, changed, automated, documented, operated, or led.
- Date range.
- Tools and systems used.
- Outcome connected to the DORA metric.
- Public proof URL where possible.
- Safe private summary when proof cannot be public.

## Confidentiality Rules

- Use anonymized service names when needed, such as `customer-api`, `internal-admin`, or `worker-service`.
- Use rounded values or ranges when exact company metrics are sensitive.
- Do not expose customer names, revenue impact, internal incident IDs, private repository URLs, secrets, vendors under NDA, or screenshots containing confidential data.
- When using private evidence, label it as private work evidence and summarize the contribution without exposing protected details.

## Out Of Scope

- Building a complete dashboard now.
- Creating route-level integration.
- Comparing the owner against teammates.
- Publishing raw company logs.
- Claiming DORA metrics are individual productivity metrics.
- Adding generic chart abstractions before a concrete component needs them.
- Replacing the existing `DevOpsCapabilityRadar` unless a later implementation plan explicitly chooses to evolve it.

## Validation For Future Implementation

Each component should have focused tests for:

- rendering only when required data exists;
- hiding or returning an explicit empty state when evidence is missing;
- correct DORA calculation logic;
- accessible text summary for chart values;
- links between metric records and evidence items;
- redaction behavior for private evidence.

Visual review should happen in Storybook before a component is used in the public portfolio.
