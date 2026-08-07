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

  it('resolves the approved top-five Continuous Integration labels', () => {
    const score = curatedDevOpsCapabilityRadarScores.find(
      (entry) => entry.capabilityKey === 'continuous-integration',
    );
    const labels = score?.evidenceIds.map((id) =>
      devOpsCapabilityEvidenceItems.find((item) => item.id === id)?.label,
    );

    expect(labels).toEqual([
      'Terraform pipelines',
      'CodeBuild PR gates',
      'Nx affected',
      'GitOps handoff',
      'Tag reliability',
    ]);
  });
});
