import {
  doraCapabilityDefinitions,
  evidenceTypeLabels,
  devOpsCapabilityEvidenceItems,
} from './devops-capability-evidence.data';

describe('devOpsCapabilityEvidence data', () => {
  it('defines the first DORA capability dimensions in order', () => {
    expect(doraCapabilityDefinitions.map((capability) => capability.key)).toEqual([
      'continuous-delivery',
      'deployment-automation',
      'continuous-integration',
      'test-automation',
      'monitoring-observability',
      'flexible-infrastructure',
      'pervasive-security',
      'trunk-based-development',
      'documentation-quality',
      'version-control',
    ]);
  });

  it('defines LinkedIn-style evidence type labels', () => {
    expect(evidenceTypeLabels).toEqual({
      skill: 'Skills',
      learning: 'Learning',
      experience: 'Experience',
      education: 'Education',
      certification: 'Certifications',
      project: 'Projects',
    });
  });

  it('keeps all seed evidence public or safely summarized', () => {
    expect(devOpsCapabilityEvidenceItems.length).toBeGreaterThan(0);

    for (const item of devOpsCapabilityEvidenceItems) {
      expect(item.summary.length).toBeGreaterThan(24);
      expect(item.capabilityKeys.length).toBeGreaterThan(0);
      expect(['supporting', 'strong', 'primary']).toContain(item.strength);
      expect(item.summary).not.toMatch(/incident-\d+|deploy-\d+|private repo|customer name/i);
    }
  });
});
