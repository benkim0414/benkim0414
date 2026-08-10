import { continuousDeliveryEvidenceItems } from './continuous-delivery-evidence.data';
import { continuousIntegrationEvidenceItems } from './continuous-integration-evidence.data';
import { deploymentAutomationEvidenceItems } from './deployment-automation-evidence.data';
import { flexibleInfrastructureEvidenceItems } from './flexible-infrastructure-evidence.data';
import { expectPublicSafeEvidence } from './public-evidence-safety.test-helpers';

const expectedIds = [
  'terraform-managed-cloud-foundations',
  'irsa-service-accounts',
  'terraform-scoped-iam',
  'terraform-codepipeline-platform',
  'argocd-environment-state-from-version-control',
  'deterministic-kubernetes-overlays',
  'reusable-kubernetes-deployment-foundations',
] as const;

const approvedPublicCatalogText = [
  'Terraform-managed cloud foundations',
  'Terraform cloud foundations',
  'Managed reusable cloud foundations and container repositories with Terraform.',
  'Terraform',
  'AWS',
  'Amazon ECR',
  'GitHub Actions monorepo migration',
  'Terraform roots',
  'Terraform-managed container repositories',
  'Terraform manages thirteen roots and three container repositories.',
  'Shared Terraform IRSA modules',
  'Shared IRSA modules',
  'Nine per-service IRSA modules use the shared Terraform module.',
  'AWS IAM',
  'IRSA',
  'Kubernetes',
  'Per-service IRSA modules using the shared module',
  'Terraform-managed scoped IAM policies',
  'Terraform scoped IAM',
  'Terraform manages IRSA service accounts and scoped IAM policies.',
  'Reusable Terraform delivery platform',
  'Reusable Terraform CI pipelines',
  'Designed and built reusable Terraform modules that provisioned consistent delivery pipelines, build projects, container repositories, and scoped IAM roles.',
  'AWS CodePipeline',
  'AWS CodeBuild',
  'AWS CodePipeline platform',
  'Delivery pipelines',
  'Build projects',
  'Services',
  'Lifetime builds',
  'Environment state from version control',
  'Version-controlled environment state',
  'Managed Kubernetes environment state in version control and reconciled it through Argo CD.',
  'Argo CD',
  'Kustomize',
  'Live Argo CD applications',
  'Automated demo applications',
  'Environment configuration is reconciled from version control for repeatable deployment state.',
  'Deterministic Kubernetes overlay rendering',
  'Deterministic overlays',
  'Rendered Kubernetes base-and-overlay configuration deterministically for repeatable deployment state.',
  'GitOps',
  'Deterministic overlay renders',
  'Overlay build failures',
  'All 39 inspected overlays produced deterministic second renders, with zero overlay build failures.',
  'Reusable Kubernetes deployment foundations',
  'Reusable K8s foundations',
  'Maintained reusable Kubernetes deployment foundations with kubectl, Helm, and Docker.',
  'kubectl',
  'Helm',
  'Docker',
  'Reusable Docker and Helm deployment tooling supports Kubernetes deployments.',
] as const;

const byId = new Map(
  flexibleInfrastructureEvidenceItems.map((item) => [item.id, item]),
);

describe('flexibleInfrastructureEvidenceItems', () => {
  it('stores the approved Flexible Infrastructure experiences in display order', () => {
    expect(flexibleInfrastructureEvidenceItems.map(({ id }) => id)).toEqual(
      expectedIds,
    );
  });

  it('reuses the canonical shared CI/CD records by identity', () => {
    const continuousIntegrationById = new Map(
      continuousIntegrationEvidenceItems.map((item) => [item.id, item]),
    );
    const continuousDeliveryById = new Map(
      continuousDeliveryEvidenceItems.map((item) => [item.id, item]),
    );
    const deploymentAutomationById = new Map(
      deploymentAutomationEvidenceItems.map((item) => [item.id, item]),
    );

    expect(byId.get('terraform-codepipeline-platform')).toBe(
      continuousIntegrationById.get('terraform-codepipeline-platform'),
    );
    expect(byId.get('argocd-environment-state-from-version-control')).toBe(
      continuousDeliveryById.get(
        'argocd-environment-state-from-version-control',
      ),
    );
    expect(byId.get('deterministic-kubernetes-overlays')).toBe(
      deploymentAutomationById.get('deterministic-kubernetes-overlays'),
    );
  });

  it('keeps every record public, structured, affirmative, and compatible', () => {
    for (const item of flexibleInfrastructureEvidenceItems) {
      expect(item).toMatchObject({ type: 'experience', isPublic: true });
      expect(item.capabilityKeys).toContain('flexible-infrastructure');
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
      byId.get('terraform-managed-cloud-foundations')?.details?.metrics,
    ).toEqual([
      {
        label: 'Terraform roots',
        value: 13,
        unit: 'count',
        measuredAt: '2026-08-09',
      },
      {
        label: 'Terraform-managed container repositories',
        value: 3,
        unit: 'count',
        measuredAt: '2026-08-09',
      },
    ]);
    expect(byId.get('irsa-service-accounts')?.details?.metrics).toEqual([
      {
        label: 'Per-service IRSA modules using the shared module',
        value: 9,
        denominator: 9,
        unit: 'count',
        measuredAt: '2026-08-09',
      },
    ]);
  });

  it('keeps migrated records free of organization fields', () => {
    expect(byId.get('irsa-service-accounts')?.organization).toBeUndefined();
    expect(byId.get('terraform-scoped-iam')?.organization).toBeUndefined();
  });

  it('keeps migrated summaries grounded in approved facts', () => {
    expect(byId.get('irsa-service-accounts')?.summary).toBe(
      'Nine per-service IRSA modules use the shared Terraform module.',
    );
    expect(byId.get('terraform-scoped-iam')?.summary).toBe(
      'Terraform manages IRSA service accounts and scoped IAM policies.',
    );
  });

  it('keeps the complete catalog public-safe and affirmative', () => {
    expectPublicSafeEvidence(
      flexibleInfrastructureEvidenceItems,
      approvedPublicCatalogText,
    );
  });
});
