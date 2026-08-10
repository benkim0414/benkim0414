import { capabilityEvidenceInitiatives } from './capability-evidence-initiatives';
import { continuousDeliveryEvidenceItems } from './continuous-delivery-evidence.data';
import { continuousIntegrationEvidenceItems } from './continuous-integration-evidence.data';
import type { CapabilityEvidenceItem } from './devops-capability-evidence.types';

const snapshotDate = '2026-08-09';
const githubInitiative = capabilityEvidenceInitiatives.githubActionsMonorepo;
const sharedById = new Map(
  [...continuousDeliveryEvidenceItems, ...continuousIntegrationEvidenceItems].map(
    (item) => [item.id, item],
  ),
);

const requiredSharedExperience = (id: string): CapabilityEvidenceItem => {
  const item = sharedById.get(id);
  if (!item || !item.capabilityKeys.includes('deployment-automation')) {
    throw new Error(
      `Deployment Automation evidence requires shared record: ${id}`,
    );
  }
  return item;
};

const deploymentAutomationAdditionalExperienceItems = [
  {
    id: 'merge-triggered-deployment-path',
    label: 'Merge-triggered deployments',
    title: 'Merge-triggered machine-to-machine deployment',
    type: 'experience',
    capabilityKeys: ['deployment-automation'],
    summary:
      'Established a merge-triggered machine-to-machine deployment path through GitHub Actions and the GitHub API.',
    technologies: ['GitHub Actions', 'GitHub API', 'OpenID Connect', 'Nx'],
    details: {
      initiative: githubInitiative,
      period: { startedAt: '2024-06-03' },
      metrics: [
        {
          label: 'API-triggered deployment runs',
          value: 252,
          denominator: 252,
          unit: 'count',
          measuredAt: snapshotDate,
        },
        {
          label: 'Automation-authored deployment events',
          value: 448,
          denominator: 513,
          unit: 'count',
          measuredAt: snapshotDate,
        },
      ],
      facts: [
        'All 252 sampled deployment runs used API-triggered dispatch, and automation authored 448 of 513 deployment events.',
      ],
    },
    isPublic: true,
    strength: 'primary',
  },
  {
    id: 'environment-neutral-deployment-mechanism',
    label: 'Environment-neutral deploys',
    title: 'One environment-neutral deployment mechanism',
    type: 'experience',
    capabilityKeys: ['deployment-automation'],
    summary:
      'Applied one GitOps base-and-overlay mechanism to update each environment.',
    technologies: ['GitOps', 'Kustomize', 'Kubernetes'],
    details: {
      initiative: githubInitiative,
      period: { startedAt: '2024-06-03' },
      metrics: [
        {
          label: 'Environment-specific deploy scripts',
          value: 0,
          denominator: 11,
          unit: 'count',
          measuredAt: snapshotDate,
        },
        {
          label: 'Demo environment deployment events',
          value: 259,
          denominator: 513,
          unit: 'count',
          measuredAt: snapshotDate,
        },
        {
          label: 'Production environment deployment events',
          value: 254,
          denominator: 513,
          unit: 'count',
          measuredAt: snapshotDate,
        },
      ],
      facts: [
        'Eleven inspected deploy definitions used zero environment-specific scripts, while the same path recorded 259 demo and 254 production deployment events.',
      ],
    },
    isPublic: true,
    strength: 'primary',
  },
  {
    id: 'generator-based-service-onboarding',
    label: 'Generator-based onboarding',
    title: 'Generator-based service onboarding',
    type: 'experience',
    capabilityKeys: ['deployment-automation'],
    summary:
      'Established reusable Nx generators and templates as a paved road for service onboarding.',
    technologies: ['Nx', 'TypeScript'],
    details: {
      initiative: githubInitiative,
      period: { startedAt: '2024-06-03' },
      metrics: [
        {
          label: 'Mean core template conformance',
          value: 79.5,
          unit: 'percent',
          measuredAt: snapshotDate,
        },
        {
          label: 'Services with all core template files',
          value: 8,
          denominator: 20,
          unit: 'count',
          measuredAt: snapshotDate,
        },
      ],
      facts: [
        'The twenty-service population recorded 79.5% mean core template conformance, with eight services containing all core template files.',
      ],
    },
    isPublic: true,
    strength: 'strong',
  },
  {
    id: 'automated-sealed-secret-delivery',
    label: 'Automated secret delivery',
    title: 'Automated encrypted secret delivery',
    type: 'experience',
    capabilityKeys: ['deployment-automation'],
    summary:
      'Delivered encrypted declarative secrets through automated Kubernetes reconciliation.',
    technologies: ['Sealed Secrets', 'Argo CD', 'Kubernetes'],
    details: {
      initiative: githubInitiative,
      period: { startedAt: '2024-06-03' },
      metrics: [
        {
          label: 'Encrypted declarative secret payloads',
          value: 31,
          unit: 'count',
          measuredAt: snapshotDate,
        },
      ],
      facts: [
        'The automated delivery path reconciles 31 encrypted declarative secret payloads.',
      ],
    },
    isPublic: true,
    strength: 'strong',
  },
  {
    id: 'deterministic-kubernetes-overlays',
    label: 'Deterministic overlays',
    title: 'Deterministic Kubernetes overlay rendering',
    type: 'experience',
    capabilityKeys: ['deployment-automation', 'flexible-infrastructure'],
    summary:
      'Rendered Kubernetes base-and-overlay configuration deterministically for repeatable deployment state.',
    technologies: ['Kustomize', 'Kubernetes', 'GitOps'],
    details: {
      initiative: githubInitiative,
      period: { startedAt: '2024-06-03' },
      metrics: [
        {
          label: 'Deterministic overlay renders',
          value: 39,
          denominator: 39,
          unit: 'count',
          measuredAt: snapshotDate,
        },
        {
          label: 'Overlay build failures',
          value: 0,
          denominator: 39,
          unit: 'count',
          measuredAt: snapshotDate,
        },
      ],
      facts: [
        'All 39 inspected overlays produced deterministic second renders, with zero overlay build failures.',
      ],
    },
    isPublic: true,
    strength: 'primary',
  },
  {
    id: 'deployment-traceability-chain',
    label: 'Deployment traceability',
    title: 'End-to-end deployment traceability',
    type: 'experience',
    capabilityKeys: ['deployment-automation'],
    summary:
      'Maintained traceability from immutable image references through source and deployment commits to reviewed changes.',
    technologies: ['Docker', 'Amazon ECR', 'GitHub'],
    details: {
      initiative: githubInitiative,
      period: { startedAt: '2024-06-03' },
      metrics: [],
      facts: [
        'Immutable image references, source commits, deployment commits, and reviewed changes form a complete deployment traceability chain.',
      ],
    },
    isPublic: true,
    strength: 'strong',
  },
] as const satisfies readonly CapabilityEvidenceItem[];

const imageDigestDeployments: CapabilityEvidenceItem = {
  id: 'image-digest-deployments',
  title: 'Immutable image digest deployments',
  label: 'Image digests',
  type: 'experience',
  capabilityKeys: ['pervasive-security', 'deployment-automation'],
  summary:
    'Improved deployment supply-chain safety by moving container image references from commit-hash tags to immutable image digests.',
  technologies: ['Docker', 'Kubernetes'],
  details: {
    initiative: githubInitiative,
    period: { startedAt: '2024-06-03' },
    metrics: [],
    facts: [
      'Immutable image digest references provide traceable deployment inputs.',
    ],
  },
  isPublic: true,
  strength: 'strong',
};

export const deploymentAutomationEvidenceItems: readonly CapabilityEvidenceItem[] = [
  ...deploymentAutomationAdditionalExperienceItems,
  requiredSharedExperience('codepipeline-approval-gated-deployment'),
  requiredSharedExperience('github-actions-gitops-handoff'),
  imageDigestDeployments,
];
