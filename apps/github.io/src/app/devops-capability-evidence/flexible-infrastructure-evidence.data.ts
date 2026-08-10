import { capabilityEvidenceInitiatives } from './capability-evidence-initiatives';
import { continuousDeliveryEvidenceItems } from './continuous-delivery-evidence.data';
import { continuousIntegrationEvidenceItems } from './continuous-integration-evidence.data';
import { deploymentAutomationEvidenceItems } from './deployment-automation-evidence.data';
import type { CapabilityEvidenceItem } from './devops-capability-evidence.types';

const snapshotDate = '2026-08-09';
const awsInitiative = capabilityEvidenceInitiatives.awsCodePipelinePlatform;
const githubInitiative = capabilityEvidenceInitiatives.githubActionsMonorepo;
const sharedById = new Map(
  [
    ...continuousIntegrationEvidenceItems,
    ...continuousDeliveryEvidenceItems,
    ...deploymentAutomationEvidenceItems,
  ].map((item) => [item.id, item]),
);

const requiredSharedExperience = (id: string): CapabilityEvidenceItem => {
  const item = sharedById.get(id);
  if (!item || !item.capabilityKeys.includes('flexible-infrastructure')) {
    throw new Error(
      `Flexible Infrastructure evidence requires shared record: ${id}`,
    );
  }
  return item;
};

const flexibleInfrastructureOwnedExperienceItems = [
  {
    id: 'terraform-managed-cloud-foundations',
    label: 'Terraform cloud foundations',
    title: 'Terraform-managed cloud foundations',
    type: 'experience',
    capabilityKeys: ['flexible-infrastructure'],
    summary:
      'Managed reusable cloud foundations and container repositories with Terraform.',
    technologies: ['Terraform', 'AWS', 'Amazon ECR'],
    details: {
      initiative: githubInitiative,
      period: { startedAt: '2024-06-03' },
      metrics: [
        {
          label: 'Terraform roots',
          value: 13,
          unit: 'count',
          measuredAt: snapshotDate,
        },
        {
          label: 'Terraform-managed container repositories',
          value: 3,
          unit: 'count',
          measuredAt: snapshotDate,
        },
      ],
      facts: [
        'Terraform manages thirteen roots and three container repositories.',
      ],
    },
    isPublic: true,
    strength: 'primary',
  },
  {
    id: 'irsa-service-accounts',
    label: 'Shared IRSA modules',
    title: 'Shared Terraform IRSA modules',
    type: 'experience',
    capabilityKeys: ['flexible-infrastructure', 'pervasive-security'],
    summary: 'Nine per-service IRSA modules use the shared Terraform module.',
    technologies: ['Terraform', 'AWS IAM', 'IRSA', 'Kubernetes'],
    details: {
      initiative: githubInitiative,
      period: { startedAt: '2024-06-03' },
      metrics: [
        {
          label: 'Per-service IRSA modules using the shared module',
          value: 9,
          denominator: 9,
          unit: 'count',
          measuredAt: snapshotDate,
        },
      ],
      facts: ['Nine per-service IRSA modules use the shared Terraform module.'],
    },
    isPublic: true,
    strength: 'strong',
  },
  {
    id: 'terraform-scoped-iam',
    label: 'Terraform scoped IAM',
    title: 'Terraform-managed scoped IAM policies',
    type: 'experience',
    capabilityKeys: ['flexible-infrastructure', 'pervasive-security'],
    summary: 'Terraform manages IRSA service accounts and scoped IAM policies.',
    technologies: ['Terraform', 'AWS IAM', 'IRSA'],
    details: {
      initiative: githubInitiative,
      period: { startedAt: '2024-06-03' },
      metrics: [],
      facts: [
        'Terraform manages IRSA service accounts and scoped IAM policies.',
      ],
    },
    isPublic: true,
    strength: 'strong',
  },
  {
    id: 'reusable-kubernetes-deployment-foundations',
    label: 'Reusable K8s foundations',
    title: 'Reusable Kubernetes deployment foundations',
    type: 'experience',
    capabilityKeys: ['flexible-infrastructure'],
    summary:
      'Maintained reusable Kubernetes deployment foundations with kubectl, Helm, and Docker.',
    technologies: ['Kubernetes', 'kubectl', 'Helm', 'Docker'],
    details: {
      initiative: awsInitiative,
      period: { startedAt: '2019-07-05' },
      metrics: [],
      facts: [
        'Reusable Docker and Helm deployment tooling supports Kubernetes deployments.',
      ],
    },
    isPublic: true,
    strength: 'strong',
  },
] as const satisfies readonly CapabilityEvidenceItem[];

export const flexibleInfrastructureEvidenceItems: readonly CapabilityEvidenceItem[] =
  [
    flexibleInfrastructureOwnedExperienceItems[0],
    flexibleInfrastructureOwnedExperienceItems[1],
    flexibleInfrastructureOwnedExperienceItems[2],
    requiredSharedExperience('terraform-codepipeline-platform'),
    requiredSharedExperience('argocd-environment-state-from-version-control'),
    requiredSharedExperience('deterministic-kubernetes-overlays'),
    flexibleInfrastructureOwnedExperienceItems[3],
  ];
