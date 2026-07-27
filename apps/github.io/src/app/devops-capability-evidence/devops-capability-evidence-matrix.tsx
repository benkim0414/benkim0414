import type { ReactElement } from 'react';

import type { CapabilityEvidenceMatrixRow } from './devops-capability-evidence.scoring';
import type { EvidenceType } from './devops-capability-evidence.types';

const evidenceTypeOrder: EvidenceType[] = [
  'skill',
  'learning',
  'experience',
  'education',
  'certification',
  'project',
];

export interface DevOpsCapabilityEvidenceMatrixProps {
  rows: readonly CapabilityEvidenceMatrixRow[];
  evidenceTypeLabels: Record<EvidenceType, string>;
}

export function DevOpsCapabilityEvidenceMatrix({
  rows,
  evidenceTypeLabels,
}: DevOpsCapabilityEvidenceMatrixProps): ReactElement | null {
  if (rows.length === 0) {
    return null;
  }

  return (
    <table aria-label="DevOps capability evidence matrix">
      <thead>
        <tr>
          <th>Capability</th>
          {evidenceTypeOrder.map((type) => (
            <th key={type}>{evidenceTypeLabels[type]}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((row) => (
          <tr key={row.capabilityKey}>
            <th scope="row">{row.label}</th>
            {evidenceTypeOrder.map((type) => {
              const count = row.counts[type] ?? 0;
              const singularLabel = evidenceTypeLabels[type].toLowerCase().replace(/s$/, '');

              return (
                <td
                  aria-label={`${row.label} has ${count} ${singularLabel} item${count === 1 ? '' : 's'}`}
                  key={type}
                >
                  {count > 0 ? count : ''}
                </td>
              );
            })}
          </tr>
        ))}
      </tbody>
    </table>
  );
}
