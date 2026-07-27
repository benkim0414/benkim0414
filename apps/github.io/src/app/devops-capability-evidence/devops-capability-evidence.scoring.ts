import type {
  CapabilityEvidenceItem,
  DoraCapabilityDefinition,
  DoraCapabilityKey,
  DoraCapabilityScore,
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
  supporting: 1,
  strong: 2,
  primary: 3,
};

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
  items: readonly CapabilityEvidenceItem[],
  definitions: readonly DoraCapabilityDefinition[],
): DoraCapabilityScore[] {
  const publicItems = getPublicCapabilityEvidence(items);

  return definitions
    .map((definition) => {
      const evidence = publicItems.filter((item) =>
        item.capabilityKeys.includes(definition.key),
      );
      const rawScore = evidence.reduce(
        (total, item) => total + evidenceStrengthScore[item.strength],
        0,
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
      const strongestEvidence = [...evidence].sort(
        (left, right) =>
          evidenceStrengthScore[right.strength] -
          evidenceStrengthScore[left.strength],
      )[0];

      return {
        capabilityKey: definition.key,
        label: definition.label,
        score: Math.min(5, rawScore),
        maxScore: 5,
        evidenceIds: evidence.map((item) => item.id),
        strongestEvidenceId: strongestEvidence?.id,
        evidenceCounts,
      } satisfies DoraCapabilityScore;
    })
    .filter((score) => score.score > 0);
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
