import { capabilityEvidenceInitiatives } from './capability-evidence-initiatives';
import { continuousIntegrationEvidenceItems } from './continuous-integration-evidence.data';
import type { CapabilityEvidenceItem } from './devops-capability-evidence.types';
import { versionControlEvidenceItems } from './version-control-evidence.data';

const sharedExperienceById = new Map(
  [...versionControlEvidenceItems, ...continuousIntegrationEvidenceItems].map(
    (item) => [item.id, item],
  ),
);

const requiredSharedExperience = (id: string): CapabilityEvidenceItem => {
  const item = sharedExperienceById.get(id);

  if (!item) {
    throw new Error(`Trunk-Based Development evidence requires record: ${id}`);
  }

  return item;
};

const trunkBasedDevelopmentAdditionalExperienceItems = [
  {
    id: 'single-trunk-repository-flow',
    title: 'Single-trunk repository delivery',
    label: 'Single trunk repositories',
    type: 'experience',
    capabilityKeys: ['trunk-based-development'],
    summary:
      'Maintained one primary integration branch across two delivery repositories to provide a consistent mainline for change integration.',
    details: {
      initiative: capabilityEvidenceInitiatives.deliveryRepositoryPractices,
      period: { startedAt: '2024-02-28' },
      metrics: [
        {
          label: 'Delivery repositories using one primary integration branch',
          value: 2,
          unit: 'count',
          measuredAt: '2026-08-09',
        },
      ],
      facts: [
        'Maintained a single primary integration branch across two delivery repositories.',
      ],
    },
    technologies: ['Git', 'GitHub'],
    isPublic: true,
    strength: 'primary',
  },
  {
    id: 'short-lived-branch-flow',
    title: 'Measured short-lived branch integration',
    label: 'Short-lived branch flow',
    type: 'experience',
    capabilityKeys: ['trunk-based-development'],
    summary:
      'Integrated short-lived branches into the mainline quickly, with most measured integrations completing within one day in both delivery repositories.',
    details: {
      initiative: capabilityEvidenceInitiatives.deliveryRepositoryPractices,
      period: { startedAt: '2024-02-28' },
      metrics: [
        {
          label: 'Median integration time in one repository',
          value: 972,
          unit: 'seconds',
          measuredAt: '2026-08-09',
        },
        {
          label: 'Integrations within one day in one repository',
          value: 85,
          unit: 'percent',
          denominator: 214,
          measuredAt: '2026-08-09',
        },
        {
          label: 'Median integration time in another repository',
          value: 6006,
          unit: 'seconds',
          measuredAt: '2026-08-09',
        },
        {
          label: 'Integrations within one day in another repository',
          value: 71.2,
          unit: 'percent',
          denominator: 378,
          measuredAt: '2026-08-09',
        },
      ],
      facts: [
        'Most measured integrations completed within one day in both delivery repositories.',
      ],
    },
    technologies: ['Git', 'GitHub'],
    isPublic: true,
    strength: 'strong',
  },
  {
    id: 'small-change-landings',
    title: 'Small change batch integration',
    label: 'Small change landings',
    type: 'experience',
    capabilityKeys: ['trunk-based-development'],
    summary:
      'Integrated independently reviewable change batches with compact median file, line, and commit sizes across measured delivery repositories.',
    details: {
      initiative: capabilityEvidenceInitiatives.deliveryRepositoryPractices,
      period: { startedAt: '2024-02-28' },
      metrics: [
        {
          label: 'Median files per landing in one repository',
          value: 3,
          unit: 'count',
          denominator: 211,
          measuredAt: '2026-08-09',
        },
        {
          label: 'Median lines per landing in one repository',
          value: 60,
          unit: 'count',
          denominator: 211,
          measuredAt: '2026-08-09',
        },
        {
          label: 'Median commits per landing in one repository',
          value: 2,
          unit: 'count',
          denominator: 211,
          measuredAt: '2026-08-09',
        },
        {
          label: 'Median files per landing in another repository',
          value: 4,
          unit: 'count',
          denominator: 304,
          measuredAt: '2026-08-09',
        },
        {
          label: 'Median lines per landing in another repository',
          value: 146,
          unit: 'count',
          denominator: 304,
          measuredAt: '2026-08-09',
        },
        {
          label: 'Median commits per landing in another repository',
          value: 2,
          unit: 'count',
          denominator: 304,
          measuredAt: '2026-08-09',
        },
      ],
      facts: [
        'Measured change landings remained compact at medians of three to four files and two commits.',
      ],
    },
    technologies: ['Git'],
    isPublic: true,
    strength: 'strong',
  },
] as const satisfies readonly CapabilityEvidenceItem[];

export const trunkBasedDevelopmentEvidenceItems: readonly CapabilityEvidenceItem[] = [
  ...trunkBasedDevelopmentAdditionalExperienceItems,
  requiredSharedExperience('merge-commit-history'),
  requiredSharedExperience('nx-affected-quality-gates'),
  requiredSharedExperience('conventional-commit-governance'),
];
