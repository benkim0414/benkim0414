import { continuousDeliveryEvidenceItems } from './continuous-delivery-evidence.data';
import { continuousIntegrationEvidenceItems } from './continuous-integration-evidence.data';
import { deploymentAutomationEvidenceItems } from './deployment-automation-evidence.data';
import { flexibleInfrastructureEvidenceItems } from './flexible-infrastructure-evidence.data';

const expectedIds = [
  'terraform-managed-cloud-foundations',
  'irsa-service-accounts',
  'terraform-scoped-iam',
  'terraform-codepipeline-platform',
  'argocd-environment-state-from-version-control',
  'deterministic-kubernetes-overlays',
  'reusable-kubernetes-deployment-foundations',
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
});
