import type {
  CapabilityEvidenceInitiativeId,
  CapabilityEvidenceItem,
  DoraCapabilityScoreProjection,
  EvidenceStrength,
  EvidenceType,
} from './devops-capability-evidence.types';
import { getCapabilityEvidenceScores } from './devops-capability-evidence.scoring';

const capabilityKey = 'continuous-delivery' as const;

function makeEvidence({
  id,
  strength = 'primary',
  type = 'experience',
  initiativeId,
  supportingEvidenceIds,
  isPublic = true,
  isSensitive,
  date = '2025-01-01',
}: {
  id: string;
  strength?: EvidenceStrength;
  type?: EvidenceType;
  initiativeId?: CapabilityEvidenceInitiativeId;
  supportingEvidenceIds?: readonly string[];
  isPublic?: boolean;
  isSensitive?: boolean;
  date?: string;
}): CapabilityEvidenceItem {
  return {
    id,
    title: id,
    type,
    capabilityKeys: [capabilityKey],
    date,
    summary: `${id} summary`,
    isPublic,
    isSensitive,
    strength,
    supportingEvidenceIds,
    details: initiativeId
      ? {
          initiative: { id: initiativeId, label: initiativeId },
          period: { startedAt: '2025-01-01' },
          metrics: [],
          facts: [],
        }
      : undefined,
  };
}

function makeProjection(
  evidenceIds: readonly string[],
): DoraCapabilityScoreProjection {
  return {
    capabilityKey,
    label: 'Delivery',
    evidenceIds,
    evidenceSummary: 'Curated delivery evidence.',
  };
}

function getScore(items: readonly CapabilityEvidenceItem[]) {
  return getCapabilityEvidenceScores(
    [makeProjection(items.map((item) => item.id))],
    items,
  )[0];
}

function exceptionalEvidence(): CapabilityEvidenceItem[] {
  return [
    makeEvidence({
      id: 'primary-one',
      initiativeId: 'aws-codepipeline-platform',
    }),
    makeEvidence({
      id: 'primary-two',
      initiativeId: 'github-actions-monorepo',
    }),
    makeEvidence({
      id: 'primary-three',
      initiativeId: 'delivery-repository-practices',
    }),
    makeEvidence({
      id: 'skill-one',
      type: 'skill',
      supportingEvidenceIds: ['primary-one'],
    }),
    makeEvidence({
      id: 'skill-two',
      type: 'skill',
      supportingEvidenceIds: ['primary-two'],
    }),
    makeEvidence({
      id: 'skill-three',
      type: 'skill',
      supportingEvidenceIds: ['primary-three'],
    }),
  ];
}

describe('getCapabilityEvidenceScores', () => {
  it.each([
    ['primary', 1],
    ['strong', 0.5],
    ['supporting', 0.5],
  ] as const)(
    'calibrates one %s applied outcome to %s',
    (strength, expected) => {
      const item = makeEvidence({ id: strength, strength });

      expect(
        getCapabilityEvidenceScores([makeProjection([item.id])], [item])[0]
          .score,
      ).toBe(expected);
    },
  );

  it('preserves the strong weight before half-point rounding', () => {
    const items = [
      makeEvidence({ id: 'primary' }),
      makeEvidence({ id: 'strong', strength: 'strong' }),
    ];

    expect(getScore(items).score).toBe(1.5);
  });

  it('caps the applied evidence subtotal at 3.5 before calibration', () => {
    const items = Array.from({ length: 5 }, (_, index) =>
      makeEvidence({
        id: `primary-${index + 1}`,
        initiativeId: 'aws-codepipeline-platform',
      }),
    );

    expect(getScore(items).score).toBe(3);
  });

  it('caps initiative breadth at 1 point', () => {
    const initiativeIds = [
      'aws-codepipeline-platform',
      'github-actions-monorepo',
      'delivery-repository-practices',
      'automated-testing-practices',
    ] as const;
    const items = initiativeIds.map((initiativeId, index) =>
      makeEvidence({
        id: `supporting-${index + 1}`,
        strength: 'supporting',
        initiativeId,
      }),
    );

    expect(getScore(items).score).toBe(2.5);
  });

  it('caps five applied outcomes with breadth and skills at an ordinary 4.0', () => {
    const items = [
      makeEvidence({
        id: 'primary-one',
        initiativeId: 'aws-codepipeline-platform',
      }),
      makeEvidence({
        id: 'primary-two',
        initiativeId: 'github-actions-monorepo',
      }),
      makeEvidence({
        id: 'strong-one',
        strength: 'strong',
        initiativeId: 'delivery-repository-practices',
      }),
      makeEvidence({
        id: 'strong-two',
        strength: 'strong',
        initiativeId: 'delivery-repository-practices',
      }),
      makeEvidence({
        id: 'strong-three',
        strength: 'strong',
        initiativeId: 'delivery-repository-practices',
      }),
      makeEvidence({
        id: 'skill-one',
        type: 'skill',
        supportingEvidenceIds: ['primary-one'],
      }),
      makeEvidence({
        id: 'skill-two',
        type: 'skill',
        supportingEvidenceIds: ['primary-two'],
      }),
      makeEvidence({
        id: 'skill-three',
        type: 'skill',
        supportingEvidenceIds: ['strong-one'],
      }),
    ];

    expect(getScore(items).score).toBe(4);
  });

  it('awards 4.5 only to exceptional primary, initiative, and corroborated evidence', () => {
    expect(getScore(exceptionalEvidence()).score).toBe(4.5);
  });

  it.each([
    [
      'a third primary',
      exceptionalEvidence().map((item) =>
        item.id === 'primary-three'
          ? makeEvidence({
              id: 'primary-three',
              strength: 'strong',
              initiativeId: 'delivery-repository-practices',
            })
          : item,
      ),
    ],
    [
      'a third initiative',
      exceptionalEvidence().map((item) =>
        item.id === 'primary-three'
          ? makeEvidence({
              id: 'primary-three',
              initiativeId: 'github-actions-monorepo',
            })
          : item,
      ),
    ],
    [
      'corroboration',
      exceptionalEvidence().filter((item) => item.type !== 'skill'),
    ],
  ])('does not award 4.5 without %s', (_missingRequirement, items) => {
    expect(getScore(items).score).not.toBe(4.5);
  });

  it('limits skill corroboration to one half point', () => {
    const appliedItems = [
      makeEvidence({ id: 'primary-one' }),
      makeEvidence({ id: 'primary-two' }),
    ];
    const threeBackedSkills = [
      makeEvidence({
        id: 'skill-one',
        type: 'skill',
        supportingEvidenceIds: ['primary-one'],
      }),
      makeEvidence({
        id: 'skill-two',
        type: 'skill',
        supportingEvidenceIds: ['primary-one'],
      }),
      makeEvidence({
        id: 'skill-three',
        type: 'skill',
        supportingEvidenceIds: ['primary-two'],
      }),
    ];

    expect(getScore(appliedItems).score).toBe(1.5);
    expect(getScore([...appliedItems, ...threeBackedSkills]).score).toBe(2);
    expect(
      getScore([
        ...appliedItems,
        ...threeBackedSkills,
        makeEvidence({
          id: 'skill-four',
          type: 'skill',
          supportingEvidenceIds: ['primary-two'],
        }),
      ]).score,
    ).toBe(2);
  });

  it.each(['certification', 'education', 'learning'] as const)(
    'uses curated %s evidence as half-point corroboration',
    (type) => {
      const applied = [
        makeEvidence({ id: 'primary-one' }),
        makeEvidence({ id: 'primary-two' }),
      ];
      const corroborating = makeEvidence({ id: type, type });

      expect(getScore([...applied, corroborating]).score).toBe(2);
    },
  );

  it('does not count unsupported skills or skills supported outside the projection', () => {
    const applied = makeEvidence({ id: 'primary' });
    const items = [
      applied,
      makeEvidence({ id: 'unsupported-one', type: 'skill' }),
      makeEvidence({ id: 'unsupported-two', type: 'skill' }),
      makeEvidence({ id: 'unsupported-three', type: 'skill' }),
      makeEvidence({
        id: 'outside-one',
        type: 'skill',
        supportingEvidenceIds: ['outside-applied'],
      }),
      makeEvidence({
        id: 'outside-two',
        type: 'skill',
        supportingEvidenceIds: ['outside-applied'],
      }),
      makeEvidence({
        id: 'outside-three',
        type: 'skill',
        supportingEvidenceIds: ['outside-applied'],
      }),
      makeEvidence({ id: 'outside-applied' }),
    ];
    const projection = makeProjection(
      items
        .filter((item) => item.id !== 'outside-applied')
        .map((item) => item.id),
    );

    expect(getCapabilityEvidenceScores([projection], items)[0].score).toBe(1);
  });

  it('does not use dates when calculating scores', () => {
    const current = makeEvidence({ id: 'primary', date: '2025-01-01' });
    const historical = makeEvidence({ id: 'primary', date: '2010-12-31' });

    expect(getScore([current]).score).toBe(getScore([historical]).score);
  });

  it('derives score metadata in projection order and first strongest-evidence tie order', () => {
    const items = [
      makeEvidence({ id: 'first-strong', strength: 'strong' }),
      makeEvidence({
        id: 'skill',
        type: 'skill',
        strength: 'supporting',
        supportingEvidenceIds: ['first-strong'],
      }),
      makeEvidence({ id: 'second-strong', strength: 'strong' }),
    ];
    const score = getCapabilityEvidenceScores(
      [makeProjection(['second-strong', 'skill', 'first-strong'])],
      items,
    )[0];

    expect(score).toEqual({
      capabilityKey,
      label: 'Delivery',
      score: 1,
      maxScore: 5,
      evidenceIds: ['second-strong', 'skill', 'first-strong'],
      strongestEvidenceId: 'second-strong',
      evidenceCounts: { experience: 2, skill: 1 },
      evidenceSummary: 'Curated delivery evidence.',
    });
  });

  it.each([
    ['missing', makeProjection(['missing']), []],
    [
      'duplicate',
      makeProjection(['primary', 'primary']),
      [makeEvidence({ id: 'primary' })],
    ],
    [
      'private',
      makeProjection(['private']),
      [makeEvidence({ id: 'private', isPublic: false })],
    ],
    [
      'sensitive',
      makeProjection(['sensitive']),
      [makeEvidence({ id: 'sensitive', isSensitive: true })],
    ],
    [
      'wrong-capability',
      makeProjection(['wrong-capability']),
      [
        {
          ...makeEvidence({ id: 'wrong-capability' }),
          capabilityKeys: ['test-automation'],
        },
      ],
    ],
  ] as const)(
    'rejects %s evidence references',
    (_scenario, projection, items) => {
      const evidenceId = projection.evidenceIds[0];

      expect(() => getCapabilityEvidenceScores([projection], items)).toThrow(
        new RegExp(`${capabilityKey}.*${evidenceId}`),
      );
    },
  );
});
