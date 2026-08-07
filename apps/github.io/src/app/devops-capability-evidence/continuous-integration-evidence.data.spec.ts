import {
  continuousIntegrationEvidenceInitiatives,
  continuousIntegrationEvidenceItems,
} from './continuous-integration-evidence.data';

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
];

const isoDate = /^\d{4}-\d{2}-\d{2}$/;

describe('continuousIntegrationEvidenceItems', () => {
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
      'aws-codepipeline-platform': 6,
      'github-actions-monorepo': 9,
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
});
