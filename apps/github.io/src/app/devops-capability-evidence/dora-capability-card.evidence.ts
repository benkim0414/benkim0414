import type {
  CapabilityEvidenceItem,
  DoraCapabilityKey,
  DoraCapabilityScore,
  EvidenceType,
} from './devops-capability-evidence.types';
import { doraCapabilityDescriptions } from './dora-capability-card.data';
import type {
  DoraCapabilityCardEvidenceGroup,
  DoraCapabilityCardEvidenceRow,
} from './dora-capability-card.types';

export { doraCapabilityDescriptions };

const evidenceGroupOrder = [
  'skills',
  'certifications',
  'other',
] as const satisfies readonly DoraCapabilityCardEvidenceGroup[];

function getEvidenceGroup(type: EvidenceType): DoraCapabilityCardEvidenceGroup {
  if (type === 'skill') {
    return 'skills';
  }

  if (type === 'certification') {
    return 'certifications';
  }

  return 'other';
}

function getOrderedEvidence(
  capabilityKey: DoraCapabilityKey,
  evidence: readonly CapabilityEvidenceItem[],
  scores: readonly DoraCapabilityScore[] | undefined,
): CapabilityEvidenceItem[] {
  const score = scores?.find((entry) => entry.capabilityKey === capabilityKey);

  if (!score) {
    return evidence.filter((item) => item.capabilityKeys.includes(capabilityKey));
  }

  const evidenceById = new Map(evidence.map((item) => [item.id, item]));

  return score.evidenceIds.flatMap((id) => {
    const item = evidenceById.get(id);
    return item ? [item] : [];
  });
}

export function getDoraCapabilityCardEvidenceRows(
  capabilityKey: DoraCapabilityKey,
  evidence: readonly CapabilityEvidenceItem[],
  scores?: readonly DoraCapabilityScore[],
): DoraCapabilityCardEvidenceRow[] {
  const grouped = new Map<
    DoraCapabilityCardEvidenceGroup,
    CapabilityEvidenceItem[]
  >();

  for (const item of getOrderedEvidence(capabilityKey, evidence, scores)) {
    const group = getEvidenceGroup(item.type);
    grouped.set(group, [...(grouped.get(group) ?? []), item]);
  }

  return evidenceGroupOrder.flatMap((group) => {
    const groupEvidence = grouped.get(group) ?? [];

    if (groupEvidence.length === 0) {
      return [];
    }

    return [{ group, evidence: groupEvidence }];
  });
}
