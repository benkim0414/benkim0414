import {
  doraCapabilityDefinitions,
  evidenceTypeLabels,
  devOpsCapabilityEvidenceItems,
} from './devops-capability-evidence.data';
import {
  getCapabilityEvidenceMatrix,
  getCapabilityEvidenceScores,
  getEvidenceTypeCounts,
  getPublicCapabilityEvidence,
} from './devops-capability-evidence.scoring';
import {
  getCapabilityScoreSummary,
  getEvidenceTypeSummary,
} from './devops-capability-evidence.summary';

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

describe('devOpsCapabilityEvidence scoring', () => {
  it('filters private and unsupported skill evidence out of public scoring', () => {
    const evidence = getPublicCapabilityEvidence([
      ...devOpsCapabilityEvidenceItems,
      {
        id: 'unsupported-skill',
        title: 'Unsupported Tool',
        type: 'skill',
        capabilityKeys: ['test-automation'],
        summary: 'This skill lacks supporting evidence and should not score.',
        isPublic: true,
        strength: 'supporting',
      },
      {
        id: 'private-detail',
        title: 'Private Deployment Record',
        type: 'experience',
        capabilityKeys: ['deployment-automation'],
        summary: 'Private operational detail.',
        isPublic: false,
        strength: 'primary',
      },
    ]);

    expect(evidence.map((item) => item.id)).not.toContain('unsupported-skill');
    expect(evidence.map((item) => item.id)).not.toContain('private-detail');
  });

  it('derives non-zero capability scores from evidence', () => {
    const scores = getCapabilityEvidenceScores(
      devOpsCapabilityEvidenceItems,
      doraCapabilityDefinitions,
    );

    expect(scores.find((score) => score.capabilityKey === 'continuous-delivery')).toMatchObject({
      label: 'Continuous Delivery',
      score: 3,
      maxScore: 5,
      strongestEvidenceId: 'github-actions-delivery',
    });
    expect(scores.some((score) => score.score === 0)).toBe(false);
  });

  it('groups evidence counts by type and capability', () => {
    expect(getEvidenceTypeCounts(devOpsCapabilityEvidenceItems)).toMatchObject({
      experience: 1,
      learning: 1,
      certification: 1,
      project: 1,
      skill: 1,
    });

    expect(
      getCapabilityEvidenceMatrix(
        devOpsCapabilityEvidenceItems,
        doraCapabilityDefinitions,
      ).find((row) => row.capabilityKey === 'flexible-infrastructure'),
    ).toMatchObject({
      label: 'Flexible Infrastructure',
      counts: { certification: 1, learning: 1, skill: 1 },
    });
  });

  it('builds accessible summaries', () => {
    const scores = getCapabilityEvidenceScores(
      devOpsCapabilityEvidenceItems,
      doraCapabilityDefinitions,
    );

    expect(getCapabilityScoreSummary(scores)).toContain('Continuous Delivery 3 of 5');
    expect(getEvidenceTypeSummary(getEvidenceTypeCounts(devOpsCapabilityEvidenceItems))).toBe(
      'Evidence includes 1 skill, 1 learning item, 1 experience item, 1 certification, and 1 project.',
    );
  });
});
