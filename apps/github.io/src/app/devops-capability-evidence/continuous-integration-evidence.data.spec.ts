import {
  continuousIntegrationEvidenceInitiatives,
  continuousIntegrationEvidenceItems,
} from './continuous-integration-evidence.data';
import { capabilityEvidenceInitiatives } from './capability-evidence-initiatives';

const expectedIds = [
  'terraform-codepipeline-platform',
  'codebuild-pr-gates',
  'codebuild-postgresql-tests',
  'codebuild-feedback-tuning',
  'ecr-immutable-promotion',
  'codepipeline-webhook-trunk',
  'nx-monorepo-migration',
  'nx-affected-quality-gates',
  'github-actions-container-verification',
  'github-actions-oidc-ecr-publishing',
  'github-actions-gitops-handoff',
  'kustomize-tag-update-reliability',
  'github-actions-failure-notifications',
  'tested-ci-automation',
  'commitlint-small-batches',
  'reusable-helm-deployment-image',
  'codebuild-status-visibility',
  'codebuild-runtime-upgrades',
];

const isoDate = /^\d{4}-\d{2}-\d{2}$/;
const byId = new Map(
  continuousIntegrationEvidenceItems.map((item) => [item.id, item]),
);
const capabilityKeysById = (id: string) => byId.get(id)?.capabilityKeys ?? [];

describe('continuousIntegrationEvidenceItems', () => {
  it('exposes neutral public initiatives for the remaining DORA capabilities', () => {
    expect(capabilityEvidenceInitiatives).toMatchObject({
      automatedTestingPractices: {
        id: 'automated-testing-practices',
        label: 'Automated testing practices',
      },
      observabilityPlatform: {
        id: 'observability-platform',
        label: 'Observability platform',
      },
      securityGovernance: {
        id: 'security-governance',
        label: 'Security governance',
      },
      documentationSystem: {
        id: 'documentation-system',
        label: 'Documentation system',
      },
    });
  });

  it('stores every approved contribution as one atomic record', () => {
    expect(continuousIntegrationEvidenceItems.map((item) => item.id)).toEqual(
      expectedIds,
    );
    expect(new Set(expectedIds)).toHaveProperty('size', expectedIds.length);
  });

  it('uses the two approved public initiative identities', () => {
    expect(continuousIntegrationEvidenceInitiatives).toEqual({
      awsCodePipelinePlatform: {
        id: 'aws-codepipeline-platform',
        label: 'AWS CodePipeline platform',
      },
      githubActionsMonorepo: {
        id: 'github-actions-monorepo',
        label: 'GitHub Actions monorepo migration',
      },
    });

    const counts = Object.fromEntries(
      Object.values(continuousIntegrationEvidenceInitiatives).map(
        (initiative) => [
          initiative.id,
          continuousIntegrationEvidenceItems.filter(
            (item) => item.details?.initiative.id === initiative.id,
          ).length,
        ],
      ),
    );

    expect(counts).toEqual({
      'aws-codepipeline-platform': 9,
      'github-actions-monorepo': 9,
    });
  });

  it('stores the approved additional AWS CI platform records', () => {
    const byId = new Map(
      continuousIntegrationEvidenceItems.map((item) => [item.id, item]),
    );

    expect(byId.get('reusable-helm-deployment-image')).toMatchObject({
      type: 'experience',
      technologies: [
        'AWS CodeBuild',
        'Amazon ECR',
        'Docker',
        'Helm',
        'Amazon EKS',
      ],
      details: {
        initiative:
          continuousIntegrationEvidenceInitiatives.awsCodePipelinePlatform,
        metrics: [
          {
            label: 'Build projects using reusable image',
            value: 44,
            denominator: 105,
            unit: 'count',
            measuredAt: '2026-08-07',
          },
          {
            label: 'Contributed image changes',
            value: 24,
            denominator: 51,
            unit: 'count',
            measuredAt: '2026-08-07',
          },
        ],
      },
    });

    expect(byId.get('codebuild-status-visibility')?.details?.metrics).toEqual([
      {
        label: 'Projects with build badges',
        value: 98,
        denominator: 105,
        unit: 'count',
        measuredAt: '2026-08-07',
      },
      {
        label: 'Projects reporting GitHub status',
        value: 91,
        denominator: 105,
        unit: 'count',
        measuredAt: '2026-08-07',
      },
    ]);

    expect(byId.get('codebuild-runtime-upgrades')).toMatchObject({
      technologies: ['AWS CodeBuild', 'Terraform'],
      details: {
        period: { startedAt: '2019-07-05', endedAt: '2025-03-18' },
        metrics: [],
        facts: [
          'Upgraded the AWS CodeBuild standard image from generation 5 to 6 in March 2023.',
          'Upgraded the AWS CodeBuild standard image from generation 6 to 7 in March 2025.',
        ],
      },
    });
  });

  it('stores valid public structured details', () => {
    const initiativeIds = new Set(
      Object.values(continuousIntegrationEvidenceInitiatives).map(
        (initiative) => initiative.id,
      ),
    );

    for (const item of continuousIntegrationEvidenceItems) {
      expect(item.type).toBe('experience');
      expect(item.capabilityKeys).toContain('continuous-integration');
      expect(item.isPublic).toBe(true);
      expect(item.isSensitive).not.toBe(true);
      expect(item.organization).toBeUndefined();
      expect(item.proofUrl).toBeUndefined();
      expect(item.details).toBeDefined();
      expect(initiativeIds).toContain(item.details?.initiative.id);
      expect(item.details?.period.startedAt).toMatch(isoDate);

      if (item.details?.period.endedAt) {
        expect(item.details.period.endedAt).toMatch(isoDate);
      }

      expect(item.details?.facts.length).toBeGreaterThan(0);

      for (const metric of item.details?.metrics ?? []) {
        expect(Number.isFinite(metric.value)).toBe(true);
        expect(metric.value).toBeGreaterThanOrEqual(0);
        expect(metric.measuredAt).toMatch(isoDate);

        if (metric.unit === 'percent') {
          expect(metric.value).toBeLessThanOrEqual(100);
        }

        if (metric.denominator !== undefined) {
          expect(metric.denominator).toBeGreaterThan(0);
          expect(metric.value).toBeLessThanOrEqual(metric.denominator);
        }
      }
    }
  });

  it('keeps public text free of direct private-source identifiers', () => {
    const publicText = JSON.stringify(continuousIntegrationEvidenceItems);

    expect(publicText).not.toMatch(/https?:\/\//);
    expect(publicText).not.toMatch(/\b\d{12}\b/);
    expect(publicText).not.toMatch(/parameter[- ]?path/i);
    expect(publicText).not.toMatch(/employer|customer|client/i);
  });

  it('maps only the approved shared CI experiences to Continuous Delivery', () => {
    expect(
      continuousIntegrationEvidenceItems
        .filter((item) => item.capabilityKeys.includes('continuous-delivery'))
        .map((item) => item.id),
    ).toEqual([
      'terraform-codepipeline-platform',
      'ecr-immutable-promotion',
      'github-actions-gitops-handoff',
      'kustomize-tag-update-reliability',
      'reusable-helm-deployment-image',
    ]);
  });

  it('stores the approved compact-card labels without changing record titles', () => {
    expect(
      [
        'terraform-codepipeline-platform',
        'codebuild-pr-gates',
        'nx-affected-quality-gates',
        'github-actions-gitops-handoff',
        'kustomize-tag-update-reliability',
      ].map((id) => {
        const item = byId.get(id);
        return [item?.id, item?.label, item?.title];
      }),
    ).toEqual([
      [
        'terraform-codepipeline-platform',
        'Reusable Terraform CI pipelines',
        'Reusable Terraform delivery platform',
      ],
      [
        'codebuild-pr-gates',
        'Automated pull-request test gates',
        'Pull-request test gates with AWS CodeBuild',
      ],
      [
        'nx-affected-quality-gates',
        'Affected-change quality gates',
        'Nx affected quality gates',
      ],
      [
        'github-actions-gitops-handoff',
        'Automated deployment process',
        'Automated deployment process',
      ],
      [
        'kustomize-tag-update-reliability',
        'Reliable Kustomize tag updates',
        'Reliable Kustomize batch tag updates',
      ],
    ]);
  });

  it('uses DORA deployment terminology for the shared GitOps record', () => {
    expect(byId.get('github-actions-gitops-handoff')).toMatchObject({
      label: 'Automated deployment process',
      title: 'Automated deployment process',
      capabilityKeys: [
        'continuous-integration',
        'continuous-delivery',
        'version-control',
        'deployment-automation',
      ],
    });
  });

  it('keeps the shared GitOps handoff fact affirmative and public-safe', () => {
    expect(byId.get('github-actions-gitops-handoff')?.details?.facts).toEqual([
      'GitHub Actions dispatches affected deployments through version-controlled Kustomize configuration for Argo CD reconciliation.',
    ]);
  });

  it('maps shared CI experiences to Version Control without changing their IDs', () => {
    expect(capabilityKeysById('codepipeline-webhook-trunk')).toContain(
      'version-control',
    );
    expect(capabilityKeysById('terraform-codepipeline-platform')).toContain(
      'version-control',
    );
    expect(byId.get('terraform-codepipeline-platform')?.capabilityKeys).toEqual([
      'continuous-integration',
      'continuous-delivery',
      'version-control',
      'flexible-infrastructure',
    ]);
    expect(capabilityKeysById('reusable-helm-deployment-image')).toContain(
      'version-control',
    );
    expect(capabilityKeysById('github-actions-gitops-handoff')).toContain(
      'version-control',
    );
    expect(
      byId.get('github-actions-gitops-handoff')?.capabilityKeys,
    ).toContain('deployment-automation');
  });

  it('maps reusable CI evidence to Test Automation', () => {
    expect(byId.get('codebuild-postgresql-tests')?.capabilityKeys).toContain(
      'test-automation',
    );
    expect(byId.get('tested-ci-automation')?.capabilityKeys).toContain(
      'test-automation',
    );
  });
});
