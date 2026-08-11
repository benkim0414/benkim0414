import {
  curatedDevOpsCapabilityRadarScores,
  devOpsCapabilityEvidenceItems,
  doraCapabilityDefinitions,
} from './devops-capability-evidence.data';
import {
  doraCapabilityDescriptions,
  getDoraCapabilityCardEvidenceSummary,
  getDoraCapabilityCardEvidenceRows,
} from './dora-capability-card.evidence';
import type {
  CapabilityEvidenceItem,
  DoraCapabilityScore,
} from './devops-capability-evidence.types';

function evidence(
  overrides: Partial<CapabilityEvidenceItem>,
): CapabilityEvidenceItem {
  return {
    id: 'evidence',
    title: 'Evidence',
    label: 'Evidence',
    type: 'experience',
    capabilityKeys: ['continuous-integration'],
    summary: 'Public-safe DORA card helper test evidence.',
    isPublic: true,
    strength: 'strong',
    ...overrides,
  };
}

describe('doraCapabilityDescriptions', () => {
  it('defines descriptions for every DORA capability definition', () => {
    expect(Object.keys(doraCapabilityDescriptions).sort()).toEqual(
      doraCapabilityDefinitions.map((capability) => capability.key).sort(),
    );

    for (const capability of doraCapabilityDefinitions) {
      expect(doraCapabilityDescriptions[capability.key].length).toBeGreaterThan(
        48,
      );
    }
  });
});

describe('getDoraCapabilityCardEvidenceSummary', () => {
  it.each([
    [
      'continuous-integration',
      'Built and evolved CI from reusable AWS CodePipeline and CodeBuild pipelines to monorepo GitHub Actions, with affected quality gates and immutable artifacts.',
    ],
    [
      'continuous-delivery',
      'Built approval-gated and GitOps delivery across AWS CodePipeline and GitHub Actions, with immutable artifacts, automated migrations, and reliable Kubernetes reconciliation.',
    ],
    [
      'test-automation',
      'Built automated test coverage across database-backed services, affected quality gates, service generators, Prometheus rules, and container health checks.',
    ],
    [
      'monitoring-observability',
      'Built a version-controlled cloud native observability platform with tested workload alerts, routed notifications, suppression controls, and encrypted alert destinations.',
    ],
    [
      'pervasive-security',
      'Implemented Terraform-managed least-privilege access, complete MFA coverage, identity security alerting, IRSA workload identity, and encrypted secret delivery.',
    ],
    [
      'documentation-quality',
      'Maintained a structured, indexed, and current documentation system, integrating documentation with engineering changes and cross-verifying operational claims.',
    ],
  ] as const)('returns the score-owned %s evidence summary', (key, summary) => {
    expect(
      getDoraCapabilityCardEvidenceSummary(
        key,
        curatedDevOpsCapabilityRadarScores,
      ),
    ).toBe(summary);
  });

  it('returns undefined when the score collection has no matching summary', () => {
    expect(
      getDoraCapabilityCardEvidenceSummary('test-automation', []),
    ).toBeUndefined();
    expect(
      getDoraCapabilityCardEvidenceSummary('continuous-delivery', undefined),
    ).toBeUndefined();
  });
});

describe('getDoraCapabilityCardEvidenceRows', () => {
  const expectedCertificationIds = {
    'continuous-delivery': ['cncf-ckad-certification'],
    'deployment-automation': ['cncf-ckad-certification'],
    'monitoring-observability': [
      'cncf-cka-certification',
      'cncf-ckad-certification',
    ],
    'flexible-infrastructure': [
      'cncf-kcna-certification',
      'cncf-cka-certification',
    ],
  } as const;

  it.each([
    [
      'continuous-delivery',
      [
        'codepipeline-approval-gated-deployment',
        'github-actions-gitops-handoff',
        'argocd-environment-state-from-version-control',
        'gitops-same-package-environments',
        'argocd-automated-database-migrations',
      ],
      [
        'continuous-delivery-skill-codepipeline',
        'continuous-delivery-skill-github',
        'continuous-delivery-skill-docker',
        'continuous-delivery-skill-ecr',
        'continuous-delivery-skill-helm',
        'continuous-delivery-skill-eks',
        'continuous-delivery-skill-terraform',
        'continuous-delivery-skill-kubernetes',
        'continuous-delivery-skill-github-actions',
        'continuous-delivery-skill-openid-connect',
        'continuous-delivery-skill-nx',
        'continuous-delivery-skill-kustomize',
        'continuous-delivery-skill-argo-cd',
        'continuous-delivery-skill-sealed-secrets',
      ],
      expectedCertificationIds['continuous-delivery'],
    ],
    [
      'deployment-automation',
      [
        'merge-triggered-deployment-path',
        'environment-neutral-deployment-mechanism',
        'generator-based-service-onboarding',
        'automated-sealed-secret-delivery',
        'deterministic-kubernetes-overlays',
      ],
      [
        'deployment-automation-skill-aws-codepipeline',
        'deployment-automation-skill-terraform',
        'deployment-automation-skill-github-actions',
        'deployment-automation-skill-argo-cd',
        'deployment-automation-skill-gitops',
        'deployment-automation-skill-docker',
        'deployment-automation-skill-amazon-ecr',
        'deployment-automation-skill-kubernetes',
        'deployment-automation-skill-openid-connect',
        'deployment-automation-skill-nx',
        'deployment-automation-skill-github-api',
        'deployment-automation-skill-kustomize',
        'deployment-automation-skill-sealed-secrets',
      ],
      expectedCertificationIds['deployment-automation'],
    ],
    [
      'test-automation',
      [
        'jest-testcontainers-postgres',
        'prometheus-alert-rule-tests',
        'container-health-smoke-tests',
        'service-generator-unit-tests',
        'nx-affected-quality-gates',
      ],
      [
        'test-automation-skill-aws-codebuild',
        'test-automation-skill-postgresql',
        'test-automation-skill-parameter-store',
        'test-automation-skill-jest',
        'test-automation-skill-testcontainers',
        'test-automation-skill-nx',
        'test-automation-skill-github-actions',
        'test-automation-skill-docker',
        'test-automation-skill-typescript',
        'test-automation-skill-prometheus',
        'test-automation-skill-promtool',
      ],
      [],
    ],
    [
      'monitoring-observability',
      [
        'version-controlled-observability-stack',
        'tested-kubernetes-workload-alerts',
        'alertmanager-notification-routing',
        'alert-suppression-controls',
        'encrypted-alert-destinations',
      ],
      [
        'monitoring-observability-skill-prometheus',
        'monitoring-observability-skill-promtool',
        'monitoring-observability-skill-alertmanager',
        'monitoring-observability-skill-loki',
        'monitoring-observability-skill-grafana',
        'monitoring-observability-skill-grafana-alloy',
        'monitoring-observability-skill-kubernetes',
        'monitoring-observability-skill-helm',
        'monitoring-observability-skill-argo-cd',
        'monitoring-observability-skill-kustomize',
        'monitoring-observability-skill-sealed-secrets',
        'monitoring-observability-skill-aws-eventbridge',
        'monitoring-observability-skill-aws-lambda',
      ],
      expectedCertificationIds['monitoring-observability'],
    ],
    [
      'flexible-infrastructure',
      [
        'terraform-managed-cloud-foundations',
        'irsa-service-accounts',
        'terraform-scoped-iam',
        'terraform-codepipeline-platform',
        'argocd-environment-state-from-version-control',
      ],
      [
        'flexible-infrastructure-skill-terraform',
        'flexible-infrastructure-skill-aws',
        'flexible-infrastructure-skill-kubernetes',
        'flexible-infrastructure-skill-kubectl',
        'flexible-infrastructure-skill-helm',
        'flexible-infrastructure-skill-docker',
        'flexible-infrastructure-skill-amazon-ecr',
        'flexible-infrastructure-skill-aws-iam',
        'flexible-infrastructure-skill-irsa',
        'flexible-infrastructure-skill-kustomize',
        'flexible-infrastructure-skill-argo-cd',
        'flexible-infrastructure-skill-gitops',
      ],
      expectedCertificationIds['flexible-infrastructure'],
    ],
    [
      'pervasive-security',
      [
        'terraform-scoped-iam',
        'iam-mfa-coverage',
        'iam-security-alerting',
        'irsa-service-accounts',
        'automated-sealed-secret-delivery',
      ],
      [
        'pervasive-security-skill-terraform',
        'pervasive-security-skill-aws-iam',
        'pervasive-security-skill-irsa',
        'pervasive-security-skill-openid-connect',
        'pervasive-security-skill-kubernetes',
        'pervasive-security-skill-kubernetes-rbac',
        'pervasive-security-skill-sealed-secrets',
        'pervasive-security-skill-argo-cd',
        'pervasive-security-skill-aws-eventbridge',
        'pervasive-security-skill-aws-lambda',
        'pervasive-security-skill-docker',
        'pervasive-security-skill-amazon-ecr',
      ],
      [],
    ],
    [
      'documentation-quality',
      [
        'structured-documentation-corpus',
        'indexed-solution-documentation',
        'current-documentation-maintenance',
        'documentation-change-integration',
        'cross-verified-documentation-claims',
      ],
      [
        'documentation-quality-skill-markdown',
        'documentation-quality-skill-yaml',
        'documentation-quality-skill-git',
      ],
      [],
    ],
  ] as const)(
    'selects the exact production %s evidence rows',
    (key, experienceIds, skillIds, certificationIds) => {
      const rows = getDoraCapabilityCardEvidenceRows(
        key,
        devOpsCapabilityEvidenceItems,
        curatedDevOpsCapabilityRadarScores,
      );

      expect(rows.map((row) => row.group)).toEqual(
        certificationIds.length > 0
          ? ['applied', 'certifications', 'skills']
          : ['applied', 'skills'],
      );
      expect(
        rows
          .find(({ group }) => group === 'certifications')
          ?.evidence.map(({ id }) => id),
      ).toEqual(certificationIds.length > 0 ? certificationIds : undefined);
      expect(
        rows
          .find(({ group }) => group === 'applied')
          ?.evidence.map((item) => item.id),
      ).toEqual(experienceIds);
      expect(
        rows
          .find(({ group }) => group === 'skills')
          ?.evidence.map((item) => item.id),
      ).toEqual(skillIds);
    },
  );

  it('selects evidence in curated score order', () => {
    const rows = getDoraCapabilityCardEvidenceRows(
      'continuous-integration',
      devOpsCapabilityEvidenceItems,
      curatedDevOpsCapabilityRadarScores,
    );

    expect(rows.map((row) => row.group)).toEqual(['applied', 'skills']);
    expect(rows[0]?.evidence.map((item) => item.id)).toEqual([
      'terraform-codepipeline-platform',
      'codebuild-pr-gates',
      'nx-affected-quality-gates',
      'github-actions-gitops-handoff',
      'kustomize-tag-update-reliability',
    ]);
    expect(rows[1]?.evidence).toHaveLength(13);
  });

  it('groups each evidence type under semantic evidence groups', () => {
    const rows = getDoraCapabilityCardEvidenceRows('continuous-integration', [
      evidence({ id: 'experience', type: 'experience' }),
      evidence({ id: 'project', type: 'project' }),
      evidence({ id: 'certification', type: 'certification' }),
      evidence({ id: 'skill', type: 'skill' }),
      evidence({ id: 'learning', type: 'learning' }),
      evidence({ id: 'education', type: 'education' }),
    ]);

    expect(rows.map((row) => row.group)).toEqual([
      'applied',
      'certifications',
      'skills',
      'learning',
    ]);
    expect(rows.map((row) => row.evidence.map((item) => item.id))).toEqual([
      ['experience', 'project'],
      ['certification'],
      ['skill'],
      ['learning', 'education'],
    ]);
  });

  it('falls back to capability key filtering when scores are absent', () => {
    const rows = getDoraCapabilityCardEvidenceRows('test-automation', [
      evidence({
        id: 'test-skill',
        title: 'TypeScript',
        type: 'skill',
        capabilityKeys: ['test-automation'],
      }),
      evidence({
        id: 'test-experience',
        label: 'Regression gates',
        type: 'experience',
        capabilityKeys: ['test-automation'],
      }),
      evidence({
        id: 'unrelated',
        label: 'Unrelated',
        capabilityKeys: ['version-control'],
      }),
    ]);

    expect(rows).toHaveLength(2);
    expect(rows[0]?.group).toBe('applied');
    expect(rows[0]?.evidence.map((item) => item.id)).toEqual([
      'test-experience',
    ]);
    expect(rows[1]?.group).toBe('skills');
    expect(rows[1]?.evidence.map((item) => item.id)).toEqual(['test-skill']);
  });

  it('omits curated score ids that are not present in the evidence catalog', () => {
    const scores: DoraCapabilityScore[] = [
      {
        capabilityKey: 'continuous-delivery',
        label: 'Delivery',
        score: 4,
        maxScore: 5,
        evidenceIds: ['missing', 'delivery'],
        strongestEvidenceId: 'delivery',
        evidenceCounts: { experience: 1 },
      },
    ];
    const rows = getDoraCapabilityCardEvidenceRows(
      'continuous-delivery',
      [
        evidence({
          id: 'delivery',
          label: 'Delivery',
          capabilityKeys: ['continuous-delivery'],
        }),
      ],
      scores,
    );

    expect(rows).toHaveLength(1);
    expect(rows[0]?.evidence.map((item) => item.id)).toEqual(['delivery']);
  });

  it('returns an empty array when there is no matching evidence', () => {
    expect(
      getDoraCapabilityCardEvidenceRows('pervasive-security', [
        evidence({ id: 'ci-only', capabilityKeys: ['continuous-integration'] }),
      ]),
    ).toEqual([]);
  });
});
