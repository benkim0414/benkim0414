import { capabilityEvidenceInitiatives } from './capability-evidence-initiatives';
import { deploymentAutomationEvidenceItems } from './deployment-automation-evidence.data';
import type { CapabilityEvidenceItem } from './devops-capability-evidence.types';
import { flexibleInfrastructureEvidenceItems } from './flexible-infrastructure-evidence.data';

const snapshotDate = '2026-08-09';
const securityGovernance = capabilityEvidenceInitiatives.securityGovernance;
const sharedById = new Map(
  [
    ...flexibleInfrastructureEvidenceItems,
    ...deploymentAutomationEvidenceItems,
  ].map((item) => [item.id, item]),
);

const requiredSharedExperience = (id: string): CapabilityEvidenceItem => {
  const item = sharedById.get(id);
  if (
    !item ||
    item.type !== 'experience' ||
    !item.capabilityKeys.includes('pervasive-security')
  ) {
    throw new Error(
      `Pervasive Security evidence requires shared experience: ${id}`,
    );
  }
  return item;
};

const iamMfaCoverage: CapabilityEvidenceItem = {
  id: 'iam-mfa-coverage',
  title: 'Complete MFA coverage for console identities',
  label: 'MFA coverage',
  type: 'experience',
  capabilityKeys: ['pervasive-security'],
  summary: 'Every verified console-capable identity uses MFA.',
  technologies: ['AWS IAM'],
  details: {
    initiative: securityGovernance,
    period: { startedAt: '2024-06-03' },
    metrics: [
      {
        label: 'Verified console-capable identity MFA coverage',
        value: 100,
        unit: 'percent',
        denominator: 30,
        measuredAt: snapshotDate,
      },
    ],
    facts: ['Every verified console-capable identity uses MFA.'],
  },
  isPublic: true,
  strength: 'primary',
};

export const iamSecurityAlertingEvidenceItem: CapabilityEvidenceItem = {
  id: 'iam-security-alerting',
  title: 'Cloud identity security alerting',
  label: 'IAM security alerts',
  type: 'experience',
  capabilityKeys: ['pervasive-security', 'monitoring-observability'],
  summary:
    'Enabled identity-event rules route notifications and monitor delivery failure.',
  technologies: ['AWS EventBridge', 'AWS Lambda', 'AWS IAM'],
  details: {
    initiative: securityGovernance,
    period: { startedAt: '2024-06-03' },
    metrics: [],
    facts: [
      'Enabled identity-event rules route notifications and monitor delivery failure.',
    ],
  },
  isPublic: true,
  strength: 'strong',
};

const kubernetesRbacGovernance: CapabilityEvidenceItem = {
  id: 'kubernetes-rbac-governance',
  title: 'Declarative Kubernetes RBAC governance',
  label: 'Kubernetes RBAC',
  type: 'experience',
  capabilityKeys: ['pervasive-security'],
  summary:
    'Version-controlled role and binding definitions govern verified cluster access paths.',
  technologies: ['Kubernetes', 'Kubernetes RBAC'],
  details: {
    initiative: securityGovernance,
    period: { startedAt: '2024-06-03' },
    metrics: [],
    facts: [
      'Version-controlled role and binding definitions govern verified cluster access paths.',
    ],
  },
  isPublic: true,
  strength: 'strong',
};

export const pervasiveSecurityEvidenceItems: readonly CapabilityEvidenceItem[] =
  [
    requiredSharedExperience('terraform-scoped-iam'),
    iamMfaCoverage,
    iamSecurityAlertingEvidenceItem,
    requiredSharedExperience('irsa-service-accounts'),
    requiredSharedExperience('automated-sealed-secret-delivery'),
    kubernetesRbacGovernance,
    requiredSharedExperience('image-digest-deployments'),
  ];
