import { continuousDeliveryEvidenceItems } from './continuous-delivery-evidence.data';
import { continuousIntegrationEvidenceItems } from './continuous-integration-evidence.data';
import { deploymentAutomationEvidenceItems } from './deployment-automation-evidence.data';
import {
  expectPublicSafeEvidence,
  expectPublicSafeText,
} from './public-evidence-safety.test-helpers';

const expectedIds = [
  'merge-triggered-deployment-path',
  'environment-neutral-deployment-mechanism',
  'generator-based-service-onboarding',
  'automated-sealed-secret-delivery',
  'deterministic-kubernetes-overlays',
  'deployment-traceability-chain',
  'codepipeline-approval-gated-deployment',
  'github-actions-gitops-handoff',
  'image-digest-deployments',
] as const;

const byId = new Map(
  deploymentAutomationEvidenceItems.map((item) => [item.id, item]),
);

describe('deploymentAutomationEvidenceItems', () => {
  it('stores the approved Deployment Automation experiences in display order', () => {
    expect(deploymentAutomationEvidenceItems.map(({ id }) => id)).toEqual(
      expectedIds,
    );
  });

  it('reuses the canonical shared CI/CD records by identity', () => {
    const continuousDeliveryById = new Map(
      continuousDeliveryEvidenceItems.map((item) => [item.id, item]),
    );
    const continuousIntegrationById = new Map(
      continuousIntegrationEvidenceItems.map((item) => [item.id, item]),
    );

    expect(byId.get('codepipeline-approval-gated-deployment')).toBe(
      continuousDeliveryById.get('codepipeline-approval-gated-deployment'),
    );
    expect(byId.get('github-actions-gitops-handoff')).toBe(
      continuousIntegrationById.get('github-actions-gitops-handoff'),
    );
  });

  it('keeps every record public, structured, affirmative, and compatible', () => {
    for (const item of deploymentAutomationEvidenceItems) {
      expect(item).toMatchObject({ type: 'experience', isPublic: true });
      expect(item.capabilityKeys).toContain('deployment-automation');
      expect(item.organization).toBeUndefined();
      expect(item.proofUrl).toBeUndefined();
      expect(item.details?.period.startedAt).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(item.details?.facts.length).toBeGreaterThan(0);
      expect(item.technologies?.length).toBeGreaterThan(0);
      expect(item.label?.trim().split(/\s+/).length).toBeLessThanOrEqual(4);
    }
  });

  it('keeps the approved measurements attached to their experiences', () => {
    expect(
      byId.get('merge-triggered-deployment-path')?.details?.metrics,
    ).toEqual([
      {
        label: 'API-triggered deployment runs',
        value: 252,
        denominator: 252,
        unit: 'count',
        measuredAt: '2026-08-09',
      },
      {
        label: 'Automation-authored deployment events',
        value: 448,
        denominator: 513,
        unit: 'count',
        measuredAt: '2026-08-09',
      },
    ]);
    expect(
      byId.get('environment-neutral-deployment-mechanism')?.details?.metrics,
    ).toEqual([
      {
        label: 'Environment-specific deploy scripts',
        value: 0,
        denominator: 11,
        unit: 'count',
        measuredAt: '2026-08-09',
      },
      {
        label: 'Demo environment deployment events',
        value: 259,
        denominator: 513,
        unit: 'count',
        measuredAt: '2026-08-09',
      },
      {
        label: 'Production environment deployment events',
        value: 254,
        denominator: 513,
        unit: 'count',
        measuredAt: '2026-08-09',
      },
    ]);
    expect(
      byId.get('generator-based-service-onboarding')?.details?.metrics,
    ).toEqual([
      {
        label: 'Mean core template conformance',
        value: 79.5,
        unit: 'percent',
        measuredAt: '2026-08-09',
      },
      {
        label: 'Services with all core template files',
        value: 8,
        denominator: 20,
        unit: 'count',
        measuredAt: '2026-08-09',
      },
    ]);
    expect(
      byId.get('automated-sealed-secret-delivery')?.details?.metrics,
    ).toEqual([
      {
        label: 'Encrypted declarative secret payloads',
        value: 31,
        unit: 'count',
        measuredAt: '2026-08-09',
      },
    ]);
    expect(
      byId.get('deterministic-kubernetes-overlays')?.details?.metrics,
    ).toEqual([
      {
        label: 'Deterministic overlay renders',
        value: 39,
        denominator: 39,
        unit: 'count',
        measuredAt: '2026-08-09',
      },
      {
        label: 'Overlay build failures',
        value: 0,
        denominator: 39,
        unit: 'count',
        measuredAt: '2026-08-09',
      },
    ]);
  });

  it('keeps the approved affirmative public summaries', () => {
    expect(
      deploymentAutomationEvidenceItems.map(({ id, summary }) => [id, summary]),
    ).toEqual([
      [
        'merge-triggered-deployment-path',
        'Established a merge-triggered machine-to-machine deployment path through GitHub Actions and the GitHub API.',
      ],
      [
        'environment-neutral-deployment-mechanism',
        'Applied one GitOps base-and-overlay mechanism to update each environment.',
      ],
      [
        'generator-based-service-onboarding',
        'Established reusable Nx generators and templates as a paved road for service onboarding.',
      ],
      [
        'automated-sealed-secret-delivery',
        'Delivered encrypted declarative secrets through automated Kubernetes reconciliation.',
      ],
      [
        'deterministic-kubernetes-overlays',
        'Rendered Kubernetes base-and-overlay configuration deterministically for repeatable deployment state.',
      ],
      [
        'deployment-traceability-chain',
        'Maintained traceability from immutable image references through source and deployment commits to reviewed changes.',
      ],
      [
        'codepipeline-approval-gated-deployment',
        'Automated deployment through a production approval gate using a reusable pipeline platform and deployment tooling.',
      ],
      [
        'github-actions-gitops-handoff',
        'Automated the affected-service deployment process through GitHub Actions, Nx, version-controlled Kustomize configuration, and Argo CD reconciliation.',
      ],
      [
        'image-digest-deployments',
        'Improved deployment supply-chain safety by moving container image references from commit-hash tags to immutable image digests.',
      ],
    ]);
  });

  it('keeps public evidence free of private and negative-source language', () => {
    expectPublicSafeEvidence(deploymentAutomationEvidenceItems);
  });

  it('allows the affirmative deployment-completion guard', () => {
    const affirmativeGuard =
      'Automated deployments completed without manual intervention.';

    expectPublicSafeText([affirmativeGuard, 'Zero build failures.']);
  });
});
