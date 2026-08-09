import meta, {
  ContinuousDelivery,
  ContinuousIntegration,
  TrunkBasedDevelopment,
  VersionControl,
} from './dora-capability-card.stories';
import {
  curatedDevOpsCapabilityRadarScores,
  devOpsCapabilityEvidenceItems,
} from './devops-capability-evidence.data';

describe('DoraCapabilityCard stories', () => {
  it('uses shared production data for Continuous Integration', () => {
    expect(meta.args?.evidence).toBe(devOpsCapabilityEvidenceItems);
    expect(meta.args?.scores).toBe(curatedDevOpsCapabilityRadarScores);
    expect(ContinuousIntegration.args?.evidence).toBeUndefined();
    expect(ContinuousIntegration.args?.scores).toBeUndefined();
  });

  it('resolves the approved Continuous Integration evidence and skills', () => {
    const score = curatedDevOpsCapabilityRadarScores.find(
      (entry) => entry.capabilityKey === 'continuous-integration',
    );
    const selected = score?.evidenceIds.map((id) =>
      devOpsCapabilityEvidenceItems.find((item) => item.id === id),
    );

    expect(selected?.slice(0, 5).map((item) => item?.label)).toEqual([
      'Reusable Terraform CI pipelines',
      'Automated pull-request test gates',
      'Affected-change quality gates',
      'Automated deployment process',
      'Reliable Kustomize tag updates',
    ]);
    expect(selected?.slice(5).map((item) => item?.title)).toEqual([
      'AWS CodePipeline',
      'GitHub',
      'AWS CodeBuild',
      'AWS Systems Manager Parameter Store',
      'Terraform',
      'Docker',
      'Amazon ECR',
      'Helm',
      'Nx',
      'GitHub Actions',
      'OpenID Connect',
      'Kustomize',
      'Argo CD',
    ]);
  });

  it('uses shared production data for Continuous Delivery', () => {
    expect(meta.args?.evidence).toBe(devOpsCapabilityEvidenceItems);
    expect(meta.args?.scores).toBe(curatedDevOpsCapabilityRadarScores);
    expect(ContinuousDelivery.args?.evidence).toBeUndefined();
    expect(ContinuousDelivery.args?.scores).toBeUndefined();
  });

  it('resolves the approved Continuous Delivery evidence and skills', () => {
    const score = curatedDevOpsCapabilityRadarScores.find(
      (entry) => entry.capabilityKey === 'continuous-delivery',
    );
    const selected = score?.evidenceIds.map((id) =>
      devOpsCapabilityEvidenceItems.find((item) => item.id === id),
    );

    expect(selected?.slice(0, 5).map((item) => item?.label)).toEqual([
      'Approval-gated deployment automation',
      'Automated deployment process',
      'Version-controlled environment state',
      'Same package across environments',
      'Automated database migrations',
    ]);
    expect(selected?.slice(5).map((item) => item?.title)).toEqual([
      'AWS CodePipeline',
      'GitHub',
      'Docker',
      'Amazon ECR',
      'Helm',
      'Amazon EKS',
      'Terraform',
      'Kubernetes',
      'GitHub Actions',
      'OpenID Connect',
      'Nx',
      'Kustomize',
      'Argo CD',
      'Sealed Secrets',
    ]);
  });

  it('inherits shared production data for Version Control', () => {
    expect(meta.args?.evidence).toBe(devOpsCapabilityEvidenceItems);
    expect(meta.args?.scores).toBe(curatedDevOpsCapabilityRadarScores);
    expect(VersionControl.args?.evidence).toBeUndefined();
    expect(VersionControl.args?.scores).toBeUndefined();
  });

  it('inherits shared production data for Trunk-Based Development', () => {
    expect(meta.args?.evidence).toBe(devOpsCapabilityEvidenceItems);
    expect(meta.args?.scores).toBe(curatedDevOpsCapabilityRadarScores);
    expect(TrunkBasedDevelopment.args?.evidence).toBeUndefined();
    expect(TrunkBasedDevelopment.args?.scores).toBeUndefined();
  });

  it.each([
    [
      'version-control',
      [
        'Reusable Terraform CI pipelines',
        'Automated deployment process',
        'Version-controlled environment state',
        'Automated database migrations',
        'Merge-preserved history',
      ],
      [
        'Git',
        'GitHub',
        'AWS CodePipeline',
        'Terraform',
        'Docker',
        'Helm',
        'Conventional Commits',
        'Husky',
        'Nx',
        'GitHub Actions',
        'Kustomize',
        'Argo CD',
        'Kubernetes',
      ],
    ],
    [
      'trunk-based-development',
      [
        'Single trunk repositories',
        'Short-lived branch flow',
        'Small change landings',
        'Affected-change quality gates',
        'Merge-preserved history',
      ],
      [
        'Git',
        'GitHub',
        'Nx',
        'GitHub Actions',
        'Conventional Commits',
        'Husky',
      ],
    ],
  ] as const)(
    'resolves the approved %s evidence and skills',
    (capabilityKey, experienceLabels, skillTitles) => {
      const score = curatedDevOpsCapabilityRadarScores.find(
        (entry) => entry.capabilityKey === capabilityKey,
      );
      const selected = score?.evidenceIds.map((id) =>
        devOpsCapabilityEvidenceItems.find((item) => item.id === id),
      );

      expect(selected?.slice(0, 5).map((item) => item?.label)).toEqual(
        experienceLabels,
      );
      expect(selected?.slice(5).map((item) => item?.title)).toEqual(
        skillTitles,
      );
    },
  );
});
