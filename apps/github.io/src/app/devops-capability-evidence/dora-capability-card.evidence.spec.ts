import {
  curatedDevOpsCapabilityRadarScores,
  devOpsCapabilityEvidenceItems,
  doraCapabilityDefinitions,
} from './devops-capability-evidence.data';
import {
  doraCapabilityDescriptions,
  getDoraCapabilityCardEvidenceRows,
} from './dora-capability-card.evidence';
import type {
  CapabilityEvidenceItem,
  DoraCapabilityScore,
} from './devops-capability-evidence.types';

function evidence(
  overrides: Partial<CapabilityEvidenceItem>,
): CapabilityEvidenceItem {
  return {
    id: 'evidence',
    title: 'Evidence',
    label: 'Evidence',
    type: 'experience',
    capabilityKeys: ['continuous-integration'],
    summary: 'Public-safe DORA card helper test evidence.',
    isPublic: true,
    strength: 'strong',
    ...overrides,
  };
}

describe('doraCapabilityDescriptions', () => {
  it('defines descriptions for every DORA capability definition', () => {
    expect(Object.keys(doraCapabilityDescriptions).sort()).toEqual(
      doraCapabilityDefinitions.map((capability) => capability.key).sort(),
    );

    for (const capability of doraCapabilityDefinitions) {
      expect(doraCapabilityDescriptions[capability.key].length).toBeGreaterThan(
        48,
      );
    }
  });
});

describe('getDoraCapabilityCardEvidenceRows', () => {
  it('selects evidence in curated score order', () => {
    const rows = getDoraCapabilityCardEvidenceRows(
      'continuous-integration',
      devOpsCapabilityEvidenceItems,
      curatedDevOpsCapabilityRadarScores,
    );

    expect(rows.map((row) => row.group)).toEqual(['other']);
    expect(rows[0]?.evidence.map((item) => item.id)).toEqual([
      'github-actions-ci',
      'team-delivery-workflow',
      'protected-review-gates',
      'nx-affected-quality-gates',
      'regression-gates',
    ]);
  });

  it('groups selected evidence as skills, certifications, then other evidence', () => {
    const rows = getDoraCapabilityCardEvidenceRows(
      'flexible-infrastructure',
      devOpsCapabilityEvidenceItems,
      curatedDevOpsCapabilityRadarScores,
    );

    expect(rows.map((row) => row.group)).toEqual([
      'skills',
      'certifications',
      'other',
    ]);
    expect(rows[0]?.evidence.map((item) => item.id)).toEqual([
      'kubernetes-skill',
    ]);
    expect(rows[1]?.evidence.map((item) => item.id)).toEqual([
      'cncf-kubernetes-certification',
    ]);
    expect(rows[2]?.evidence.map((item) => item.id)).toEqual([
      'kubernetes-workloads',
      'kubectl-troubleshooting',
      'cluster-operations',
      'irsa-service-accounts',
      'terraform-scoped-iam',
    ]);
  });

  it('falls back to capability key filtering when scores are absent', () => {
    const rows = getDoraCapabilityCardEvidenceRows('test-automation', [
      evidence({
        id: 'test-skill',
        title: 'TypeScript',
        type: 'skill',
        capabilityKeys: ['test-automation'],
      }),
      evidence({
        id: 'test-experience',
        label: 'Regression gates',
        type: 'experience',
        capabilityKeys: ['test-automation'],
      }),
      evidence({
        id: 'unrelated',
        label: 'Unrelated',
        capabilityKeys: ['version-control'],
      }),
    ]);

    expect(rows).toHaveLength(2);
    expect(rows[0]?.group).toBe('skills');
    expect(rows[0]?.evidence.map((item) => item.id)).toEqual(['test-skill']);
    expect(rows[1]?.group).toBe('other');
    expect(rows[1]?.evidence.map((item) => item.id)).toEqual([
      'test-experience',
    ]);
  });

  it('omits curated score ids that are not present in the evidence catalog', () => {
    const scores: DoraCapabilityScore[] = [
      {
        capabilityKey: 'continuous-delivery',
        label: 'Delivery',
        score: 4,
        maxScore: 5,
        evidenceIds: ['missing', 'delivery'],
        strongestEvidenceId: 'delivery',
        evidenceCounts: { experience: 1 },
      },
    ];
    const rows = getDoraCapabilityCardEvidenceRows(
      'continuous-delivery',
      [
        evidence({
          id: 'delivery',
          label: 'Delivery',
          capabilityKeys: ['continuous-delivery'],
        }),
      ],
      scores,
    );

    expect(rows).toHaveLength(1);
    expect(rows[0]?.evidence.map((item) => item.id)).toEqual(['delivery']);
  });

  it('returns an empty array when there is no matching evidence', () => {
    expect(
      getDoraCapabilityCardEvidenceRows('pervasive-security', [
        evidence({ id: 'ci-only', capabilityKeys: ['continuous-integration'] }),
      ]),
    ).toEqual([]);
  });
});
