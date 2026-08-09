import meta, { ContinuousIntegration } from './dora-capability-card.stories';
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
      'Terraform pipelines',
      'CodeBuild PR gates',
      'Nx affected',
      'Deployment automation',
      'Tag reliability',
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
});
