import { capabilityEvidenceInitiatives } from './capability-evidence-initiatives';
import type { CapabilityEvidenceItem } from './devops-capability-evidence.types';

const snapshotDate = '2026-08-09';
const awsInitiative = capabilityEvidenceInitiatives.awsCodePipelinePlatform;
const githubInitiative = capabilityEvidenceInitiatives.githubActionsMonorepo;

const additionalMetrics = {
  approvalUnderOneHour: {
    label: 'Approvals completed within one hour',
    value: 77.2,
    unit: 'percent',
    measuredAt: snapshotDate,
  },
  productionAutomation: {
    label: 'Automated production applications',
    value: 0,
    denominator: 16,
    unit: 'count',
    measuredAt: snapshotDate,
  },
  databaseMigrationCoverage: {
    label: 'Services with automated database migrations',
    value: 2,
    denominator: 20,
    unit: 'count',
    measuredAt: snapshotDate,
  },
  migrationTimeout: {
    label: 'Database migration timeout',
    value: 600,
    unit: 'seconds',
    measuredAt: snapshotDate,
  },
  encryptedPayloads: {
    label: 'Encrypted secret payloads',
    value: 31,
    unit: 'count',
    measuredAt: snapshotDate,
  },
  livenessCoverage: {
    label: 'Services with liveness probes',
    value: 17,
    denominator: 20,
    unit: 'count',
    measuredAt: snapshotDate,
  },
  explicitReplicaCoverage: {
    label: 'Services with explicit replica counts',
    value: 18,
    denominator: 20,
    unit: 'count',
    measuredAt: snapshotDate,
  },
} as const;

const continuousDeliveryEvidenceItemCatalog = [
  {
    id: 'codepipeline-approval-gated-deployment',
    label: 'Approval-gated deployment automation',
    title: 'Approval-gated deployment automation',
    type: 'experience',
    capabilityKeys: ['continuous-delivery'],
    isPublic: true,
    strength: 'primary',
    summary:
      'Automated deployment through a production approval gate using a reusable pipeline platform and deployment tooling.',
    technologies: ['AWS CodePipeline', 'AWS CodeBuild', 'Helm', 'Amazon EKS'],
    details: {
      initiative: awsInitiative,
      period: { startedAt: '2019-07-05' },
      metrics: [
        {
          label: 'Pipelines with production approval',
          value: 41,
          denominator: 47,
          unit: 'count',
          measuredAt: snapshotDate,
        },
        {
          label: 'Approval observations',
          value: 561,
          unit: 'count',
          measuredAt: snapshotDate,
        },
        {
          label: 'Median approval wait',
          value: 271,
          unit: 'seconds',
          measuredAt: snapshotDate,
        },
        {
          label: 'P90 approval wait',
          value: 164299,
          unit: 'seconds',
          measuredAt: snapshotDate,
        },
        {
          label: 'Maximum approval wait',
          value: 604920,
          unit: 'seconds',
          measuredAt: snapshotDate,
        },
        additionalMetrics.approvalUnderOneHour,
      ],
      facts: [
        'Production deployment requires one manual intervention after the automated process completes.',
        'Production deployment frequency and lead time are not fully measurable from retained deployment history.',
      ],
    },
  },
  {
    id: 'argocd-environment-state-from-version-control',
    label: 'Version-controlled environment state',
    title: 'Environment state from version control',
    type: 'experience',
    capabilityKeys: ['continuous-delivery'],
    isPublic: true,
    strength: 'primary',
    summary:
      'Managed Kubernetes environment state in version control and reconciled it through Argo CD.',
    technologies: ['Argo CD', 'Kubernetes', 'Kustomize'],
    details: {
      initiative: githubInitiative,
      period: { startedAt: '2024-06-03' },
      metrics: [
        {
          label: 'Services',
          value: 20,
          unit: 'count',
          measuredAt: snapshotDate,
        },
        {
          label: 'Live Argo CD applications',
          value: 41,
          unit: 'count',
          measuredAt: snapshotDate,
        },
        {
          label: 'Automated demo applications',
          value: 17,
          denominator: 18,
          unit: 'count',
          measuredAt: snapshotDate,
        },
        additionalMetrics.productionAutomation,
      ],
      facts: [
        'Environment configuration is reconciled from version control for repeatable deployment state.',
        'Configuration drift beyond reconciliation is not proactively detected.',
      ],
    },
  },
  {
    id: 'gitops-same-package-environments',
    label: 'Same package across environments',
    title: 'Same package for every environment',
    type: 'experience',
    capabilityKeys: ['continuous-delivery'],
    isPublic: true,
    strength: 'primary',
    summary:
      'Promoted the same immutable container package across environments through Kustomize configuration.',
    technologies: ['Docker', 'Amazon ECR', 'Kustomize'],
    details: {
      initiative: githubInitiative,
      period: { startedAt: '2024-06-03' },
      metrics: [],
      facts: [
        'Environment promotion changes the referenced image tag without rebuilding the container package.',
      ],
    },
  },
  {
    id: 'argocd-automated-database-migrations',
    label: 'Automated database migrations',
    title: 'Automated database migrations',
    type: 'experience',
    capabilityKeys: ['continuous-delivery'],
    isPublic: true,
    strength: 'primary',
    summary:
      'Ran database migrations as part of Argo CD-managed Kubernetes deployments.',
    technologies: ['Argo CD', 'Kubernetes'],
    details: {
      initiative: githubInitiative,
      period: { startedAt: '2024-06-03' },
      metrics: [additionalMetrics.databaseMigrationCoverage],
      facts: [
        'Automated database migrations have partial coverage across services.',
      ],
    },
  },
  {
    id: 'argocd-reliable-database-migrations',
    label: 'Reliable migrations',
    title: 'Reliable database migration process',
    type: 'experience',
    capabilityKeys: ['continuous-delivery'],
    isPublic: true,
    strength: 'strong',
    summary:
      'Bound database migrations with explicit deployment ordering and a fixed execution timeout.',
    technologies: ['Argo CD', 'Kubernetes'],
    details: {
      initiative: githubInitiative,
      period: { startedAt: '2024-06-03' },
      metrics: [additionalMetrics.migrationTimeout],
      facts: [
        'Migration execution is ordered before application rollout and has a bounded timeout.',
        'Automated rollback for database migrations is absent.',
      ],
    },
  },
  {
    id: 'production-artifacts-version-control',
    label: 'Production artifacts',
    title: 'Version control for production artifacts',
    type: 'experience',
    capabilityKeys: ['continuous-delivery'],
    isPublic: true,
    strength: 'primary',
    summary:
      'Stored infrastructure and deployment configuration for production artifacts in version control.',
    technologies: ['GitHub', 'Terraform', 'Kubernetes', 'Kustomize', 'Argo CD'],
    details: {
      initiative: githubInitiative,
      period: { startedAt: '2024-06-03' },
      metrics: [],
      facts: [
        'Infrastructure definitions, Kubernetes resources, and deployment configuration are version controlled.',
      ],
    },
  },
  {
    id: 'sealed-secrets-version-control',
    label: 'Encrypted configuration',
    title: 'Version control for encrypted configuration',
    type: 'experience',
    capabilityKeys: ['continuous-delivery'],
    isPublic: true,
    strength: 'strong',
    summary:
      'Stored encrypted Kubernetes configuration in version control using Sealed Secrets.',
    technologies: ['Sealed Secrets', 'Kubernetes', 'GitHub'],
    details: {
      initiative: githubInitiative,
      period: { startedAt: '2024-06-03' },
      metrics: [additionalMetrics.encryptedPayloads],
      facts: [
        'Encrypted configuration can be reviewed and promoted with the deployment state without exposing plaintext values.',
      ],
    },
  },
  {
    id: 'serialized-deployment-process',
    label: 'Reliable deployment',
    title: 'Reliable serialized deployment process',
    type: 'experience',
    capabilityKeys: ['continuous-delivery'],
    isPublic: true,
    strength: 'strong',
    summary:
      'Serialized affected-service deployment automation to avoid conflicting environment updates.',
    technologies: ['GitHub Actions', 'Nx'],
    details: {
      initiative: githubInitiative,
      period: { startedAt: '2024-06-03' },
      metrics: [],
      facts: [
        'The deployment process serializes environment updates but does not verify successful build completion before dispatch.',
      ],
    },
  },
  {
    id: 'independent-service-deployment',
    label: 'Independent deployment',
    title: 'Independent service deployment',
    type: 'experience',
    capabilityKeys: ['continuous-delivery'],
    isPublic: true,
    strength: 'strong',
    summary:
      'Deployed services independently by updating service-specific Kustomize configuration for Argo CD reconciliation.',
    technologies: ['Kustomize', 'Argo CD', 'Kubernetes'],
    details: {
      initiative: githubInitiative,
      period: { startedAt: '2024-06-03' },
      metrics: [],
      facts: [
        'Services can be promoted through independent deployment configuration changes.',
        'Progressive delivery automation is absent.',
      ],
    },
  },
  {
    id: 'small-batch-deployments',
    label: 'Small batches',
    title: 'Small-batch deployments',
    type: 'experience',
    capabilityKeys: ['continuous-delivery'],
    isPublic: true,
    strength: 'strong',
    summary:
      'Kept deployment configuration changes focused on single-service image tag updates.',
    technologies: ['GitHub', 'Kustomize'],
    details: {
      initiative: githubInitiative,
      period: { startedAt: '2024-06-03' },
      metrics: [
        {
          label: 'Single-service tag-changing commits',
          value: 223,
          denominator: 228,
          unit: 'count',
          measuredAt: snapshotDate,
        },
      ],
      facts: ['Most measured image tag changes update one service at a time.'],
    },
  },
  {
    id: 'deployment-health-checks',
    label: 'Deployment health',
    title: 'Deployment health checks',
    type: 'experience',
    capabilityKeys: ['continuous-delivery'],
    isPublic: true,
    strength: 'supporting',
    summary:
      'Applied Kubernetes health and availability controls to support reliable Argo CD rollouts.',
    technologies: ['Argo CD', 'Kubernetes'],
    details: {
      initiative: githubInitiative,
      period: { startedAt: '2024-06-03' },
      metrics: [
        {
          label: 'Services with readiness probes',
          value: 17,
          denominator: 20,
          unit: 'count',
          measuredAt: snapshotDate,
        },
        {
          label: 'Services with PodDisruptionBudgets',
          value: 10,
          denominator: 20,
          unit: 'count',
          measuredAt: snapshotDate,
        },
        additionalMetrics.livenessCoverage,
        additionalMetrics.explicitReplicaCoverage,
      ],
      facts: [
        'Health probes, replica declarations, and disruption budgets provide partial coverage across services.',
      ],
    },
  },
  {
    id: 'deployment-failure-notification',
    label: 'Failure notification',
    title: 'Deployment failure notification',
    type: 'experience',
    capabilityKeys: ['continuous-delivery'],
    isPublic: true,
    strength: 'supporting',
    summary:
      'Reported deployment automation failures to Slack with context for follow-up.',
    technologies: ['GitHub Actions', 'Slack'],
    details: {
      initiative: githubInitiative,
      period: { startedAt: '2024-06-03' },
      metrics: [],
      facts: [
        'Notifications report automation failures after workflow execution.',
        'Production synchronization remains manual.',
      ],
    },
  },
] as const satisfies readonly CapabilityEvidenceItem[];

export const continuousDeliveryEvidenceItems: readonly CapabilityEvidenceItem[] =
  continuousDeliveryEvidenceItemCatalog;
