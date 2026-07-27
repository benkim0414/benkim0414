import type { ReactElement } from 'react';

import { getPublicCapabilityEvidence } from './devops-capability-evidence.scoring';
import type {
  CapabilityEvidenceItem,
  EvidenceType,
} from './devops-capability-evidence.types';

export interface DevOpsEvidenceTimelineProps {
  evidence: readonly CapabilityEvidenceItem[];
  evidenceTypeLabels: Record<EvidenceType, string>;
}

export function DevOpsEvidenceTimeline({
  evidence,
  evidenceTypeLabels,
}: DevOpsEvidenceTimelineProps): ReactElement | null {
  const datedEvidence = getPublicCapabilityEvidence(evidence)
    .filter((item) => item.date ?? item.endDate)
    .sort((left, right) =>
      (right.date ?? right.endDate ?? '').localeCompare(left.date ?? left.endDate ?? ''),
    );

  if (datedEvidence.length === 0) {
    return null;
  }

  return (
    <ol aria-label="DevOps capability evidence timeline">
      {datedEvidence.map((item) => {
        const date = item.date ?? item.endDate;

        return (
          <li key={item.id}>
            <time dateTime={date}>{date}</time>
            <strong>{item.title}</strong>
            <span>{evidenceTypeLabels[item.type]}</span>
            <p>{item.summary}</p>
          </li>
        );
      })}
    </ol>
  );
}
