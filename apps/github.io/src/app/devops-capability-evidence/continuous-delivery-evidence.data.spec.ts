import { continuousDeliveryEvidenceItems } from './continuous-delivery-evidence.data';

const expectedIds = [
  'codepipeline-approval-gated-deployment',
  'argocd-environment-state-from-version-control',
  'gitops-same-package-environments',
  'argocd-automated-database-migrations',
  'argocd-reliable-database-migrations',
  'production-artifacts-version-control',
  'sealed-secrets-version-control',
  'serialized-deployment-process',
  'independent-service-deployment',
  'small-batch-deployments',
  'deployment-health-checks',
  'deployment-failure-notification',
] as const;

const expectedTitles = [
  'Approval-gated deployment automation',
  'Environment state from version control',
  'Same package for every environment',
  'Automated database migrations',
  'Reliable database migration process',
  'Version control for production artifacts',
  'Version control for encrypted configuration',
  'Reliable serialized deployment process',
  'Independent service deployment',
  'Small-batch deployments',
  'Deployment health checks',
  'Deployment failure notification',
] as const;

const byId = new Map(
  continuousDeliveryEvidenceItems.map((item) => [item.id, item]),
);
const isoDate = /^\d{4}-\d{2}-\d{2}$/;

describe('continuousDeliveryEvidenceItems', () => {
  it('stores exactly the approved new atomic experiences', () => {
    expect(continuousDeliveryEvidenceItems.map((item) => item.id)).toEqual(
      expectedIds,
    );
    expect(continuousDeliveryEvidenceItems.map((item) => item.title)).toEqual(
      expectedTitles,
    );
  });

  it('keeps approval automation metrics precise', () => {
    expect(
      byId.get('codepipeline-approval-gated-deployment')?.details?.metrics,
    ).toEqual(
      expect.arrayContaining([
        {
          label: 'Pipelines with production approval',
          value: 41,
          denominator: 47,
          unit: 'count',
          measuredAt: '2026-08-09',
        },
        {
          label: 'Approval observations',
          value: 561,
          unit: 'count',
          measuredAt: '2026-08-09',
        },
        {
          label: 'Median approval wait',
          value: 271,
          unit: 'seconds',
          measuredAt: '2026-08-09',
        },
        {
          label: 'P90 approval wait',
          value: 164299,
          unit: 'seconds',
          measuredAt: '2026-08-09',
        },
        {
          label: 'Maximum approval wait',
          value: 604920,
          unit: 'seconds',
          measuredAt: '2026-08-09',
        },
      ]),
    );
  });

  it('keeps GitOps measurements attached to the relevant experience', () => {
    expect(
      byId.get('argocd-environment-state-from-version-control')?.details
        ?.metrics,
    ).toEqual(
      expect.arrayContaining([
        {
          label: 'Services',
          value: 20,
          unit: 'count',
          measuredAt: '2026-08-09',
        },
        {
          label: 'Live Argo CD applications',
          value: 41,
          unit: 'count',
          measuredAt: '2026-08-09',
        },
        {
          label: 'Automated demo applications',
          value: 17,
          denominator: 18,
          unit: 'count',
          measuredAt: '2026-08-09',
        },
      ]),
    );

    expect(
      byId.get('small-batch-deployments')?.details?.metrics,
    ).toContainEqual({
      label: 'Single-service tag-changing commits',
      value: 223,
      denominator: 228,
      unit: 'count',
      measuredAt: '2026-08-09',
    });

    expect(byId.get('deployment-health-checks')?.details?.metrics).toEqual(
      expect.arrayContaining([
        {
          label: 'Services with readiness probes',
          value: 17,
          denominator: 20,
          unit: 'count',
          measuredAt: '2026-08-09',
        },
        {
          label: 'Services with PodDisruptionBudgets',
          value: 10,
          denominator: 20,
          unit: 'count',
          measuredAt: '2026-08-09',
        },
      ]),
    );
  });

  it('stores the approved public-safe maturity limitations as facts', () => {
    const publicFacts = JSON.stringify(
      continuousDeliveryEvidenceItems.flatMap(
        (item) => item.details?.facts ?? [],
      ),
    );

    expect(publicFacts).toMatch(/manual intervention/i);
    expect(publicFacts).toMatch(/does not verify successful build completion/i);
    expect(publicFacts).toMatch(/automated rollback.*absent/i);
    expect(publicFacts).toMatch(/progressive delivery.*absent/i);
    expect(publicFacts).toMatch(/partial coverage/i);
    expect(publicFacts).toMatch(/drift.*not proactively detected/i);
  });

  it('stores valid structured public evidence', () => {
    for (const item of continuousDeliveryEvidenceItems) {
      expect(item.type).toBe('experience');
      expect(item.capabilityKeys).toContain('continuous-delivery');
      expect(item.isPublic).toBe(true);
      expect(item.isSensitive).not.toBe(true);
      expect(item.organization).toBeUndefined();
      expect(item.proofUrl).toBeUndefined();
      expect(item.details?.period.startedAt).toMatch(isoDate);
      expect(item.details?.facts.length).toBeGreaterThan(0);

      for (const metric of item.details?.metrics ?? []) {
        expect(Number.isFinite(metric.value)).toBe(true);
        expect(metric.value).toBeGreaterThanOrEqual(0);
        expect(metric.measuredAt).toMatch(isoDate);
        if (metric.denominator !== undefined) {
          expect(metric.denominator).toBeGreaterThan(0);
          expect(metric.value).toBeLessThanOrEqual(metric.denominator);
        }
      }
    }
  });

  it('keeps public CD evidence free of direct private-source identifiers', () => {
    const publicText = JSON.stringify(continuousDeliveryEvidenceItems);

    expect(publicText).not.toMatch(/https?:\/\//);
    expect(publicText).not.toMatch(/\b\d{12}\b/);
    expect(publicText).not.toMatch(/parameter[- ]?path/i);
    expect(publicText).not.toMatch(/employer|customer|client|organization/i);
    expect(publicText).not.toMatch(
      /repository name|service name|workflow name/i,
    );
  });

  it('does not overstate incomplete production delivery outcomes', () => {
    const publicText = JSON.stringify(continuousDeliveryEvidenceItems);

    expect(publicText).not.toMatch(/254 production deployments/i);
    expect(publicText).not.toMatch(/fully automated production/i);
    expect(publicText).not.toMatch(/proactive failure notification/i);
    expect(publicText).not.toMatch(/automated rollback implemented/i);
  });
});
