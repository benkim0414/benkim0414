import type { ReactElement } from 'react';

import type {
  CapabilityEvidenceItem,
  DoraCapabilityScore,
} from './devops-capability-evidence.types';
import { getPublicCapabilityEvidence } from './devops-capability-evidence.scoring';

export interface DevOpsCapabilityBarListProps {
  scores: readonly DoraCapabilityScore[];
  evidence: readonly CapabilityEvidenceItem[];
}

export function DevOpsCapabilityBarList({
  scores,
  evidence,
}: DevOpsCapabilityBarListProps): ReactElement | null {
  if (scores.length === 0) {
    return null;
  }

  const evidenceById = new Map(
    getPublicCapabilityEvidence(evidence).map((item) => [item.id, item]),
  );
  const rankedScores = scores
    .filter((score) => score.score > 0)
    .sort((left, right) => right.score - left.score);

  if (rankedScores.length === 0) {
    return null;
  }

  return (
    <div aria-label="DevOps capability score list">
      {rankedScores.map((score) => {
        const strongestEvidence =
          score.strongestEvidenceId && score.evidenceIds.includes(score.strongestEvidenceId)
            ? evidenceById.get(score.strongestEvidenceId)
            : undefined;
        const width = `${(score.score / score.maxScore) * 100}%`;

        return (
          <div key={score.capabilityKey}>
            <div>
              <span>{score.label}</span>
              <span>
                {score.score} of {score.maxScore}
              </span>
            </div>
            <div aria-hidden="true" style={{ background: 'var(--color-border)', height: 8 }}>
              <div
                style={{
                  background: 'var(--color-text-purple)',
                  height: 8,
                  width,
                }}
              />
            </div>
            {strongestEvidence ? <p>{strongestEvidence.title}</p> : null}
          </div>
        );
      })}
    </div>
  );
}
