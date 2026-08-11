import type {
  CapabilityEvidenceItem,
  DoraCapabilityDefinition,
  DoraCapabilityKey,
  DoraCapabilityScore,
  DoraCapabilityScoreProjection,
  EvidenceStrength,
  EvidenceType,
} from './devops-capability-evidence.types';

export interface CapabilityEvidenceMatrixRow {
  capabilityKey: DoraCapabilityKey;
  label: string;
  counts: Partial<Record<EvidenceType, number>>;
  total: number;
}

const evidenceStrengthScore: Record<EvidenceStrength, number> = {
  supporting: 0.5,
  strong: 0.75,
  primary: 1,
};
const appliedEvidenceTypes = new Set<EvidenceType>(['experience', 'project']);
const corroboratingEvidenceTypes = new Set<EvidenceType>([
  'certification',
  'education',
  'learning',
]);
const APPLIED_SCORE_CAP = 3.5;
const BREADTH_SCORE_CAP = 1;
const CORROBORATION_SCORE = 0.5;
const SCORE_CALIBRATION = 0.8;
const ORDINARY_SCORE_CAP = 4;
const EXCEPTIONAL_SCORE = 4.5;
const MAX_SCORE = 5 as const;

function roundToHalf(value: number): number {
  return Math.round(value * 2) / 2;
}

export function getPublicCapabilityEvidence(
  items: readonly CapabilityEvidenceItem[],
): CapabilityEvidenceItem[] {
  const publicItems = items.filter(
    (item) => item.isPublic && !item.isSensitive,
  );
  const publicItemsById = new Map(publicItems.map((item) => [item.id, item]));

  return publicItems.filter((item) => {
    if (item.type !== 'skill') {
      return true;
    }

    return (item.supportingEvidenceIds ?? []).some((id) => {
      const support = publicItemsById.get(id);

      return Boolean(
        support &&
        support.id !== item.id &&
        support.type !== 'skill' &&
        support.capabilityKeys.some((key) => item.capabilityKeys.includes(key)),
      );
    });
  });
}

export function getEvidenceTypeCounts(
  items: readonly CapabilityEvidenceItem[],
): Partial<Record<EvidenceType, number>> {
  return getPublicCapabilityEvidence(items).reduce<
    Partial<Record<EvidenceType, number>>
  >(
    (counts, item) => ({
      ...counts,
      [item.type]: (counts[item.type] ?? 0) + 1,
    }),
    {},
  );
}

export function getCapabilityEvidenceScores(
  projections: readonly DoraCapabilityScoreProjection[],
  items: readonly CapabilityEvidenceItem[],
): DoraCapabilityScore[] {
  const itemsById = new Map(items.map((item) => [item.id, item]));

  return projections.map((projection) => {
    const projectionEvidenceIds = new Set<string>();
    const evidence = projection.evidenceIds.map((evidenceId) => {
      if (projectionEvidenceIds.has(evidenceId)) {
        throw new Error(
          `Duplicate evidence reference for capability ${projection.capabilityKey}: ${evidenceId}`,
        );
      }

      projectionEvidenceIds.add(evidenceId);
      const item = itemsById.get(evidenceId);

      if (!item) {
        throw new Error(
          `Missing evidence reference for capability ${projection.capabilityKey}: ${evidenceId}`,
        );
      }

      if (!item.isPublic) {
        throw new Error(
          `Private evidence reference for capability ${projection.capabilityKey}: ${evidenceId}`,
        );
      }

      if (item.isSensitive) {
        throw new Error(
          `Sensitive evidence reference for capability ${projection.capabilityKey}: ${evidenceId}`,
        );
      }

      if (!item.capabilityKeys.includes(projection.capabilityKey)) {
        throw new Error(
          `Wrong-capability evidence reference for capability ${projection.capabilityKey}: ${evidenceId}`,
        );
      }

      return item;
    });
    const appliedEvidence = evidence.filter((item) =>
      appliedEvidenceTypes.has(item.type),
    );
    const appliedEvidenceIds = new Set(appliedEvidence.map((item) => item.id));
    const appliedScore = Math.min(
      APPLIED_SCORE_CAP,
      appliedEvidence.reduce(
        (total, item) => total + evidenceStrengthScore[item.strength],
        0,
      ),
    );
    const initiativeCount = new Set(
      appliedEvidence
        .map((item) => item.details?.initiative.id)
        .filter(
          (initiativeId): initiativeId is NonNullable<typeof initiativeId> =>
            Boolean(initiativeId),
        ),
    ).size;
    const breadthScore = Math.min(
      BREADTH_SCORE_CAP,
      Math.max(0, initiativeCount - 1) * 0.5,
    );
    const backedSkillCount = evidence.filter(
      (item) =>
        item.type === 'skill' &&
        (item.supportingEvidenceIds ?? []).some((evidenceId) =>
          appliedEvidenceIds.has(evidenceId),
        ),
    ).length;
    const hasCuratedCorroboration = evidence.some((item) =>
      corroboratingEvidenceTypes.has(item.type),
    );
    const corroborationScore =
      hasCuratedCorroboration || backedSkillCount >= 3
        ? CORROBORATION_SCORE
        : 0;
    const primaryCount = appliedEvidence.filter(
      (item) => item.strength === 'primary',
    ).length;
    const score =
      primaryCount >= 3 && initiativeCount >= 3 && corroborationScore > 0
        ? EXCEPTIONAL_SCORE
        : Math.min(
            ORDINARY_SCORE_CAP,
            roundToHalf(
              (appliedScore + breadthScore + corroborationScore) *
                SCORE_CALIBRATION,
            ),
          );
    const evidenceCounts = evidence.reduce<
      Partial<Record<EvidenceType, number>>
    >(
      (counts, item) => ({
        ...counts,
        [item.type]: (counts[item.type] ?? 0) + 1,
      }),
      {},
    );
    const strongestEvidence = evidence.reduce<
      CapabilityEvidenceItem | undefined
    >(
      (strongest, item) =>
        !strongest ||
        evidenceStrengthScore[item.strength] >
          evidenceStrengthScore[strongest.strength]
          ? item
          : strongest,
      undefined,
    );

    return {
      capabilityKey: projection.capabilityKey,
      label: projection.label,
      score,
      maxScore: MAX_SCORE,
      evidenceIds: evidence.map((item) => item.id),
      strongestEvidenceId: strongestEvidence?.id,
      evidenceCounts,
      evidenceSummary: projection.evidenceSummary,
    } satisfies DoraCapabilityScore;
  });
}

export function getCapabilityEvidenceMatrix(
  items: readonly CapabilityEvidenceItem[],
  definitions: readonly DoraCapabilityDefinition[],
): CapabilityEvidenceMatrixRow[] {
  const publicItems = getPublicCapabilityEvidence(items);

  return definitions
    .map((definition) => {
      const evidence = publicItems.filter((item) =>
        item.capabilityKeys.includes(definition.key),
      );
      const counts = evidence.reduce<Partial<Record<EvidenceType, number>>>(
        (groupedCounts, item) => ({
          ...groupedCounts,
          [item.type]: (groupedCounts[item.type] ?? 0) + 1,
        }),
        {},
      );

      return {
        capabilityKey: definition.key,
        label: definition.label,
        counts,
        total: evidence.length,
      };
    })
    .filter((row) => row.total > 0);
}
