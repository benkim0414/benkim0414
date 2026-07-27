import { VisuallyHidden } from '@astryxdesign/core/VisuallyHidden';
import { PieChart } from '@mui/x-charts/PieChart';
import type { ReactElement } from 'react';

import { getEvidenceTypeSummary } from './devops-capability-evidence.summary';
import type { EvidenceType } from './devops-capability-evidence.types';

const evidenceTypeOrder: EvidenceType[] = [
  'skill',
  'learning',
  'experience',
  'education',
  'certification',
  'project',
];

export interface DevOpsEvidenceTypeDonutProps {
  counts: Partial<Record<EvidenceType, number>>;
  evidenceTypeLabels: Record<EvidenceType, string>;
}

export function DevOpsEvidenceTypeDonut({
  counts,
  evidenceTypeLabels,
}: DevOpsEvidenceTypeDonutProps): ReactElement | null {
  const entries = evidenceTypeOrder
    .map((type) => ({ type, count: counts[type] ?? 0 }))
    .filter((entry) => entry.count > 0);

  if (entries.length === 0) {
    return null;
  }

  return (
    <figure aria-label="DevOps evidence type distribution">
      <VisuallyHidden>{getEvidenceTypeSummary(counts)}</VisuallyHidden>
      <PieChart
        aria-hidden="true"
        height={220}
        series={[
          {
            data: entries.map((entry) => ({
              id: entry.type,
              value: entry.count,
              label: evidenceTypeLabels[entry.type],
            })),
            innerRadius: 56,
            outerRadius: 96,
            paddingAngle: 2,
          },
        ]}
        slotProps={{ legend: { hidden: true } }}
        width={220}
      />
      <ul>
        {entries.map((entry) => (
          <li key={entry.type}>
            <span>{evidenceTypeLabels[entry.type]}</span>
            <span>{entry.count}</span>
          </li>
        ))}
      </ul>
    </figure>
  );
}
