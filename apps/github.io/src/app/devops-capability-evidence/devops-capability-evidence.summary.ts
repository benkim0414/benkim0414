import type {
  DoraCapabilityScore,
  EvidenceType,
} from './devops-capability-evidence.types';

const evidenceTypeSingular: Record<EvidenceType, string> = {
  skill: 'skill',
  learning: 'learning item',
  experience: 'experience item',
  education: 'education item',
  certification: 'certification',
  project: 'project',
};

const evidenceTypeOrder: EvidenceType[] = [
  'skill',
  'learning',
  'experience',
  'education',
  'certification',
  'project',
];

function joinReadable(parts: readonly string[]): string {
  if (parts.length <= 1) {
    return parts[0] ?? '';
  }

  return `${parts.slice(0, -1).join(', ')}, and ${parts.at(-1)}`;
}

export function getCapabilityScoreSummary(
  scores: readonly DoraCapabilityScore[],
): string {
  return scores
    .map((score) => `${score.label} ${score.score} of ${score.maxScore}`)
    .join(', ')
    .concat('.');
}

export function getEvidenceTypeSummary(
  counts: Partial<Record<EvidenceType, number>>,
): string {
  const parts = evidenceTypeOrder
    .map((type) => [type, counts[type] ?? 0] as const)
    .filter(([, count]) => count > 0)
    .map(([type, count]) => {
      const label = evidenceTypeSingular[type];
      return `${count} ${label}${count === 1 ? '' : 's'}`;
    });

  return `Evidence includes ${joinReadable(parts)}.`;
}
