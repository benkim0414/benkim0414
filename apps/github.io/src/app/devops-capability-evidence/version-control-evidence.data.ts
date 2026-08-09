import { capabilityEvidenceInitiatives } from './capability-evidence-initiatives';
import { continuousDeliveryEvidenceItems } from './continuous-delivery-evidence.data';
import { continuousIntegrationEvidenceItems } from './continuous-integration-evidence.data';
import type { CapabilityEvidenceItem } from './devops-capability-evidence.types';

const versionControlSharedExperienceIds = [
  'codepipeline-webhook-trunk',
  'terraform-codepipeline-platform',
  'reusable-helm-deployment-image',
  'github-actions-gitops-handoff',
  'argocd-environment-state-from-version-control',
  'gitops-same-package-environments',
  'argocd-automated-database-migrations',
] as const;

const sharedExperienceById = new Map(
  [
    ...continuousIntegrationEvidenceItems,
    ...continuousDeliveryEvidenceItems,
  ].map((item) => [item.id, item]),
);

const versionControlSharedExperienceItems =
  versionControlSharedExperienceIds.map((id) => {
    const item = sharedExperienceById.get(id);

    if (!item) {
      throw new Error(`Version Control evidence requires shared record: ${id}`);
    }

    return item;
  });

const versionControlAdditionalExperienceItems = [
  {
    id: 'merge-commit-history',
    title: 'Merge-preserved integration history',
    label: 'Merge-preserved history',
    type: 'experience',
    capabilityKeys: ['trunk-based-development', 'version-control'],
    summary:
      'Preserved traceable pull-request integration history with merge commits across measured delivery repositories.',
    details: {
      initiative: capabilityEvidenceInitiatives.deliveryRepositoryPractices,
      period: { startedAt: '2024-02-28' },
      metrics: [
        {
          label: 'Resolvable integrations preserving merge history',
          value: 575,
          unit: 'count',
          denominator: 575,
          measuredAt: '2026-08-09',
        },
      ],
      facts: [
        'All 575 resolvable measured pull-request integrations preserved two-parent merge history.',
      ],
    },
    technologies: ['Git', 'GitHub'],
    isPublic: true,
    strength: 'strong',
  },
  {
    id: 'conventional-commit-governance',
    title: 'Conventional commit governance',
    label: 'Conventional commit governance',
    type: 'experience',
    capabilityKeys: ['trunk-based-development', 'version-control'],
    summary:
      'Applied Conventional Commits with commit-time automation and measured strong authored-commit conformance across delivery repositories.',
    details: {
      initiative: capabilityEvidenceInitiatives.deliveryRepositoryPractices,
      period: { startedAt: '2024-02-28' },
      metrics: [
        {
          label: 'Authored commit conformance in one repository',
          value: 91.4,
          unit: 'percent',
          denominator: 1021,
          measuredAt: '2026-08-09',
        },
        {
          label: 'Authored commit conformance in another repository',
          value: 99,
          unit: 'percent',
          denominator: 1367,
          measuredAt: '2026-08-09',
        },
      ],
      facts: [
        'Applied Conventional Commits through commitlint and Husky-supported commit-time governance.',
      ],
    },
    technologies: ['Git', 'Conventional Commits', 'commitlint', 'Husky'],
    isPublic: true,
    strength: 'strong',
  },
] as const satisfies readonly CapabilityEvidenceItem[];

export const versionControlEvidenceItems: readonly CapabilityEvidenceItem[] = [
  ...versionControlSharedExperienceItems,
  ...versionControlAdditionalExperienceItems,
];
