import { deploymentAutomationEvidenceItems } from './deployment-automation-evidence.data';
import { flexibleInfrastructureEvidenceItems } from './flexible-infrastructure-evidence.data';
import { pervasiveSecurityEvidenceItems } from './pervasive-security-evidence.data';
import { expectPublicSafeEvidence } from './public-evidence-safety.test-helpers';

const expectedIds = [
  'terraform-scoped-iam',
  'iam-mfa-coverage',
  'iam-security-alerting',
  'irsa-service-accounts',
  'automated-sealed-secret-delivery',
  'kubernetes-rbac-governance',
  'image-digest-deployments',
] as const;

const approvedPublicCatalogText = [
  'Terraform-managed scoped IAM policies',
  'Terraform scoped IAM',
  'Terraform manages IRSA service accounts and scoped IAM policies.',
  'Terraform',
  'AWS IAM',
  'IRSA',
  'GitHub Actions monorepo migration',
  'Complete MFA coverage for console identities',
  'MFA coverage',
  'Every verified console-capable identity uses MFA.',
  'Security governance',
  'Verified console-capable identity MFA coverage',
  'Cloud identity security alerting',
  'IAM security alerts',
  'Enabled identity-event rules route notifications and monitor delivery failure.',
  'AWS EventBridge',
  'AWS Lambda',
  'Shared Terraform IRSA modules',
  'Shared IRSA modules',
  'Nine per-service IRSA modules use the shared Terraform module.',
  'Kubernetes',
  'Per-service IRSA modules using the shared module',
  'Automated encrypted secret delivery',
  'Automated secret delivery',
  'Delivered encrypted declarative secrets through automated Kubernetes reconciliation.',
  'Sealed Secrets',
  'Argo CD',
  'Encrypted declarative secret payloads',
  'The automated delivery path reconciles 31 encrypted declarative secret payloads.',
  'Declarative Kubernetes RBAC governance',
  'Kubernetes RBAC',
  'Version-controlled role and binding definitions govern verified cluster access paths.',
  'Kubernetes RBAC',
  'Immutable image digest deployments',
  'Image digests',
  'Improved deployment supply-chain safety by moving container image references from commit-hash tags to immutable image digests.',
  'Docker',
  'Immutable image digest references provide traceable deployment inputs.',
] as const;

const isoDate = /^\d{4}-\d{2}-\d{2}$/;
const isIsoCalendarDate = (value: string): boolean => {
  if (!isoDate.test(value)) {
    return false;
  }

  const [year, month, day] = value.split('-').map(Number);
  const daysInMonth = [
    31,
    year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0) ? 29 : 28,
    31,
    30,
    31,
    30,
    31,
    31,
    30,
    31,
    30,
    31,
  ];

  return (
    month >= 1 &&
    month <= 12 &&
    day >= 1 &&
    day <= (daysInMonth[month - 1] ?? 0)
  );
};

const byId = new Map(
  pervasiveSecurityEvidenceItems.map((item) => [item.id, item]),
);
const flexibleInfrastructureById = new Map(
  flexibleInfrastructureEvidenceItems.map((item) => [item.id, item]),
);
const deploymentAutomationById = new Map(
  deploymentAutomationEvidenceItems.map((item) => [item.id, item]),
);

describe('pervasiveSecurityEvidenceItems', () => {
  it('rejects impossible calendar dates in the catalog contract', () => {
    expect(isIsoCalendarDate('2024-02-29')).toBe(true);
    expect(isIsoCalendarDate('2024-02-30')).toBe(false);
  });

  it('stores the complete approved catalog in display order and reuses canonical records', () => {
    expect(pervasiveSecurityEvidenceItems.map((item) => item.id)).toEqual(
      expectedIds,
    );
    expect(
      new Set(pervasiveSecurityEvidenceItems.map((item) => item.id)).size,
    ).toBe(7);

    expect(byId.get('terraform-scoped-iam')).toBe(
      flexibleInfrastructureById.get('terraform-scoped-iam'),
    );
    expect(byId.get('irsa-service-accounts')).toBe(
      flexibleInfrastructureById.get('irsa-service-accounts'),
    );
    expect(byId.get('automated-sealed-secret-delivery')).toBe(
      deploymentAutomationById.get('automated-sealed-secret-delivery'),
    );
    expect(byId.get('image-digest-deployments')).toBe(
      deploymentAutomationById.get('image-digest-deployments'),
    );
  });

  it('keeps every record public, structured, and compatible with Pervasive Security', () => {
    for (const item of pervasiveSecurityEvidenceItems) {
      expect(item.type).toBe('experience');
      expect(item.capabilityKeys).toContain('pervasive-security');
      expect(item.isPublic).toBe(true);
      expect(item.isSensitive).not.toBe(true);
      expect(item.organization).toBeUndefined();
      expect(item.proofUrl).toBeUndefined();
      expect(item.details).toBeDefined();
      expect(item.details?.period.startedAt).toSatisfy(isIsoCalendarDate);
      if (item.details?.period.endedAt) {
        expect(item.details.period.endedAt).toSatisfy(isIsoCalendarDate);
      }
      expect(item.details?.facts.length).toBeGreaterThan(0);
      expect(item.technologies?.length).toBeGreaterThan(0);
      expect(item.details?.metrics).toBeDefined();

      for (const metric of item.details?.metrics ?? []) {
        expect(metric.label.trim().length).toBeGreaterThan(0);
        expect(Number.isFinite(metric.value)).toBe(true);
        expect(metric.value).toBeGreaterThanOrEqual(0);
        expect(metric.measuredAt).toSatisfy(isIsoCalendarDate);

        if (metric.unit === 'percent') {
          expect(metric.value).toBeLessThanOrEqual(100);
        }

        if (metric.denominator !== undefined) {
          expect(Number.isFinite(metric.denominator)).toBe(true);
          expect(metric.denominator).toBeGreaterThan(0);
          expect(metric.value).toBeLessThanOrEqual(metric.denominator);
        }
      }
    }
  });

  it('keeps the three owned experiences at their reviewed public values', () => {
    expect(
      [
        'iam-mfa-coverage',
        'iam-security-alerting',
        'kubernetes-rbac-governance',
      ].map((id) => {
        const item = byId.get(id);
        return [
          item?.id,
          item?.title,
          item?.label,
          item?.summary,
          item?.technologies,
          item?.strength,
          item?.details?.initiative,
          item?.details?.period,
          item?.details?.metrics,
          item?.details?.facts,
          item?.capabilityKeys,
        ];
      }),
    ).toEqual([
      [
        'iam-mfa-coverage',
        'Complete MFA coverage for console identities',
        'MFA coverage',
        'Every verified console-capable identity uses MFA.',
        ['AWS IAM'],
        'primary',
        { id: 'security-governance', label: 'Security governance' },
        { startedAt: '2024-06-03' },
        [
          {
            label: 'Verified console-capable identity MFA coverage',
            value: 100,
            unit: 'percent',
            measuredAt: '2026-08-09',
          },
        ],
        ['Every verified console-capable identity uses MFA.'],
        ['pervasive-security'],
      ],
      [
        'iam-security-alerting',
        'Cloud identity security alerting',
        'IAM security alerts',
        'Enabled identity-event rules route notifications and monitor delivery failure.',
        ['AWS EventBridge', 'AWS Lambda', 'AWS IAM'],
        'strong',
        { id: 'security-governance', label: 'Security governance' },
        { startedAt: '2024-06-03' },
        [],
        [
          'Enabled identity-event rules route notifications and monitor delivery failure.',
        ],
        ['pervasive-security', 'monitoring-observability'],
      ],
      [
        'kubernetes-rbac-governance',
        'Declarative Kubernetes RBAC governance',
        'Kubernetes RBAC',
        'Version-controlled role and binding definitions govern verified cluster access paths.',
        ['Kubernetes', 'Kubernetes RBAC'],
        'strong',
        { id: 'security-governance', label: 'Security governance' },
        { startedAt: '2024-06-03' },
        [],
        [
          'Version-controlled role and binding definitions govern verified cluster access paths.',
        ],
        ['pervasive-security'],
      ],
    ]);
  });

  it('allows the shared identity alerting record to serve Monitoring and Observability', () => {
    expect(byId.get('iam-security-alerting')?.capabilityKeys).toContain(
      'monitoring-observability',
    );
  });

  it('keeps publication text reviewed, affirmative, and public-safe', () => {
    expectPublicSafeEvidence(
      pervasiveSecurityEvidenceItems,
      approvedPublicCatalogText,
    );
  });
});
