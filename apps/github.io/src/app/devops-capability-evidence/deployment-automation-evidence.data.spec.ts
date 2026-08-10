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

const approvedPublicCatalogText = [
  'Merge-triggered machine-to-machine deployment',
  'Merge-triggered deployments',
  'Established a merge-triggered machine-to-machine deployment path through GitHub Actions and the GitHub API.',
  'GitHub Actions',
  'GitHub API',
  'OpenID Connect',
  'Nx',
  'GitHub Actions monorepo migration',
  'API-triggered deployment runs',
  'Automation-authored deployment events',
  'All 252 sampled deployment runs used API-triggered dispatch, and automation authored 448 of 513 deployment events.',
  'One environment-neutral deployment mechanism',
  'Environment-neutral deploys',
  'Applied one GitOps base-and-overlay mechanism to update each environment.',
  'GitOps',
  'Kustomize',
  'Kubernetes',
  'Environment-specific deploy scripts',
  'Demo environment deployment events',
  'Production environment deployment events',
  'Eleven inspected deploy definitions used zero environment-specific scripts, while the same path recorded 259 demo and 254 production deployment events.',
  'Generator-based service onboarding',
  'Generator-based onboarding',
  'Established reusable Nx generators and templates as a paved road for service onboarding.',
  'TypeScript',
  'Mean core template conformance',
  'Services with all core template files',
  'The twenty-service population recorded 79.5% mean core template conformance, with eight services containing all core template files.',
  'Automated encrypted secret delivery',
  'Automated secret delivery',
  'Delivered encrypted declarative secrets through automated Kubernetes reconciliation.',
  'Sealed Secrets',
  'Argo CD',
  'Encrypted declarative secret payloads',
  'The automated delivery path reconciles 31 encrypted declarative secret payloads.',
  'Deterministic Kubernetes overlay rendering',
  'Deterministic overlays',
  'Rendered Kubernetes base-and-overlay configuration deterministically for repeatable deployment state.',
  'Deterministic overlay renders',
  'Overlay build failures',
  'All 39 inspected overlays produced deterministic second renders, with zero overlay build failures.',
  'End-to-end deployment traceability',
  'Deployment traceability',
  'Maintained traceability from immutable image references through source and deployment commits to reviewed changes.',
  'Docker',
  'Amazon ECR',
  'GitHub',
  'Immutable image references, source commits, deployment commits, and reviewed changes form a complete deployment traceability chain.',
  'Approval-gated deployment automation',
  'Automated deployment through a production approval gate using a reusable pipeline platform and deployment tooling.',
  'AWS CodePipeline',
  'AWS CodeBuild',
  'Helm',
  'Amazon EKS',
  'AWS CodePipeline platform',
  'Pipelines with production approval',
  'Approval observations',
  'Median approval wait',
  'P90 approval wait',
  'Maximum approval wait',
  'Approvals completed within one hour',
  'Automated deployment progresses through a reusable production approval gate.',
  'Automated deployment process',
  'Automated the affected-service deployment process through GitHub Actions, Nx, version-controlled Kustomize configuration, and Argo CD reconciliation.',
  'Deployment runs',
  'Deployment success',
  'Median deployment handoff',
  'Tag-update runs',
  'Median tag update',
  'Environment tag-update events created by automation',
  'Automated demo deployments',
  'Median merge-to-demo lead time',
  'P90 merge-to-demo lead time',
  'GitHub Actions dispatches affected deployments through version-controlled Kustomize configuration for Argo CD reconciliation.',
  'Immutable image digest deployments',
  'Image digests',
  'Improved deployment supply-chain safety by moving container image references from commit-hash tags to immutable image digests.',
  'Immutable image digest references provide traceable deployment inputs.',
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
    expectPublicSafeEvidence(
      deploymentAutomationEvidenceItems,
      approvedPublicCatalogText,
    );
  });

  it('allows the affirmative deployment-completion guard', () => {
    const affirmativeGuard =
      'Automated deployments completed without manual intervention.';

    expectPublicSafeText([affirmativeGuard, 'Zero build failures.']);
  });
});
