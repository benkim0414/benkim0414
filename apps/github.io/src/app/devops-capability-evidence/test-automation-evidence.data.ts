import { capabilityEvidenceInitiatives } from './capability-evidence-initiatives';
import { continuousIntegrationEvidenceItems } from './continuous-integration-evidence.data';
import type { CapabilityEvidenceItem } from './devops-capability-evidence.types';

const automatedTestingInitiative =
  capabilityEvidenceInitiatives.automatedTestingPractices;
const sharedById = new Map(
  continuousIntegrationEvidenceItems.map((item) => [item.id, item]),
);

const requiredSharedExperience = (id: string): CapabilityEvidenceItem => {
  const item = sharedById.get(id);
  if (
    !item ||
    item.type !== 'experience' ||
    !item.capabilityKeys.includes('test-automation')
  ) {
    throw new Error(`Test Automation evidence requires shared record: ${id}`);
  }
  return item;
};

const testAutomationAdditionalExperienceItems = [
  {
    id: 'jest-testcontainers-postgres',
    title: 'Jest and Testcontainers PostgreSQL coverage',
    label: 'PostgreSQL test environments',
    type: 'experience',
    capabilityKeys: ['test-automation'],
    summary:
      'Isolated database-backed suites provision and migrate PostgreSQL for each run.',
    technologies: ['Jest', 'Testcontainers', 'PostgreSQL'],
    details: {
      initiative: automatedTestingInitiative,
      period: { startedAt: '2024-02-28' },
      metrics: [],
      facts: [
        'Isolated database-backed suites provision and migrate PostgreSQL for each run.',
      ],
    },
    isPublic: true,
    strength: 'primary',
  },
  {
    id: 'regression-gates',
    title: 'Automated regression gates before merge',
    label: 'Regression gates',
    type: 'experience',
    capabilityKeys: ['test-automation'],
    summary: 'Required regression checks gate merge decisions.',
    technologies: ['CI', 'Jest'],
    details: {
      initiative: automatedTestingInitiative,
      period: { startedAt: '2024-02-28' },
      metrics: [],
      facts: ['Required regression checks gate merge decisions.'],
    },
    isPublic: true,
    strength: 'primary',
  },
  {
    id: 'container-health-smoke-tests',
    title: 'Automated container health smoke tests',
    label: 'Container smoke tests',
    type: 'experience',
    capabilityKeys: ['test-automation'],
    summary: 'Images are built, started, and polled through a health endpoint.',
    technologies: ['Docker', 'GitHub Actions'],
    details: {
      initiative: automatedTestingInitiative,
      period: { startedAt: '2024-02-28' },
      metrics: [],
      facts: [
        'Images are built, started, and polled through a health endpoint.',
      ],
    },
    isPublic: true,
    strength: 'strong',
  },
  {
    id: 'service-generator-unit-tests',
    title: 'Unit-tested service onboarding generators',
    label: 'Generator tests',
    type: 'experience',
    capabilityKeys: ['test-automation'],
    summary: 'Service-generator behavior is protected by focused assertions.',
    technologies: ['TypeScript', 'Jest'],
    details: {
      initiative: automatedTestingInitiative,
      period: { startedAt: '2024-02-28' },
      metrics: [],
      facts: ['Service-generator behavior is protected by focused assertions.'],
    },
    isPublic: true,
    strength: 'strong',
  },
  {
    id: 'prometheus-alert-rule-tests',
    title: 'Automated Prometheus alert-rule tests',
    label: 'Alert-rule tests',
    type: 'experience',
    capabilityKeys: ['test-automation'],
    summary:
      'Alert rules run against declarative test cases using a pinned Prometheus image.',
    technologies: ['Prometheus', 'promtool'],
    details: {
      initiative: automatedTestingInitiative,
      period: { startedAt: '2024-02-28' },
      metrics: [],
      facts: [
        'Alert rules run against declarative test cases using a pinned Prometheus image.',
      ],
    },
    isPublic: true,
    strength: 'strong',
  },
] as const satisfies readonly CapabilityEvidenceItem[];

export const testAutomationEvidenceItems: readonly CapabilityEvidenceItem[] = [
  requiredSharedExperience('codebuild-postgresql-tests'),
  requiredSharedExperience('tested-ci-automation'),
  testAutomationAdditionalExperienceItems[0],
  testAutomationAdditionalExperienceItems[1],
  requiredSharedExperience('nx-affected-quality-gates'),
  testAutomationAdditionalExperienceItems[2],
  testAutomationAdditionalExperienceItems[3],
  testAutomationAdditionalExperienceItems[4],
];
