import {
  curatedDevOpsCapabilityRadarScores,
  devOpsCapabilityEvidenceItems,
  doraCapabilityDefinitions,
} from './devops-capability-evidence.data';
import {
  doraCapabilityDescriptions,
  getDoraCapabilityCardEvidenceSummary,
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

describe('getDoraCapabilityCardEvidenceSummary', () => {
  it.each([
    [
      'continuous-integration',
      'Built and evolved CI from reusable AWS CodePipeline and CodeBuild pipelines to monorepo GitHub Actions, with affected quality gates and immutable artifacts.',
    ],
    [
      'continuous-delivery',
      'Built approval-gated and GitOps delivery across AWS CodePipeline and GitHub Actions, with immutable artifacts, automated migrations, and reliable Kubernetes reconciliation.',
    ],
  ] as const)('returns the score-owned %s evidence summary', (key, summary) => {
    expect(
      getDoraCapabilityCardEvidenceSummary(
        key,
        curatedDevOpsCapabilityRadarScores,
      ),
    ).toBe(summary);
  });

  it('returns undefined when the capability or score collection has no summary', () => {
    expect(
      getDoraCapabilityCardEvidenceSummary(
        'test-automation',
        curatedDevOpsCapabilityRadarScores,
      ),
    ).toBeUndefined();
    expect(
      getDoraCapabilityCardEvidenceSummary('continuous-delivery', undefined),
    ).toBeUndefined();
  });
});

describe('getDoraCapabilityCardEvidenceRows', () => {
  it('selects evidence in curated score order', () => {
    const rows = getDoraCapabilityCardEvidenceRows(
      'continuous-integration',
      devOpsCapabilityEvidenceItems,
      curatedDevOpsCapabilityRadarScores,
    );

    expect(rows.map((row) => row.group)).toEqual(['applied', 'skills']);
    expect(rows[0]?.evidence.map((item) => item.id)).toEqual([
      'terraform-codepipeline-platform',
      'codebuild-pr-gates',
      'nx-affected-quality-gates',
      'github-actions-gitops-handoff',
      'kustomize-tag-update-reliability',
    ]);
    expect(rows[1]?.evidence).toHaveLength(13);
  });

  it('groups each evidence type under semantic evidence groups', () => {
    const rows = getDoraCapabilityCardEvidenceRows('continuous-integration', [
      evidence({ id: 'experience', type: 'experience' }),
      evidence({ id: 'project', type: 'project' }),
      evidence({ id: 'certification', type: 'certification' }),
      evidence({ id: 'skill', type: 'skill' }),
      evidence({ id: 'learning', type: 'learning' }),
      evidence({ id: 'education', type: 'education' }),
    ]);

    expect(rows.map((row) => row.group)).toEqual([
      'applied',
      'certifications',
      'skills',
      'learning',
    ]);
    expect(rows.map((row) => row.evidence.map((item) => item.id))).toEqual([
      ['experience', 'project'],
      ['certification'],
      ['skill'],
      ['learning', 'education'],
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
    expect(rows[0]?.group).toBe('applied');
    expect(rows[0]?.evidence.map((item) => item.id)).toEqual([
      'test-experience',
    ]);
    expect(rows[1]?.group).toBe('skills');
    expect(rows[1]?.evidence.map((item) => item.id)).toEqual(['test-skill']);
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
