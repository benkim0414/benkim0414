import { render, screen, within } from '@testing-library/react';

import {
  devOpsCapabilityEvidenceItems,
  evidenceTypeLabels,
} from './devops-capability-evidence.data';
import { getEvidenceTypeCounts } from './devops-capability-evidence.scoring';
import { DevOpsEvidenceTypeDonut } from './devops-evidence-type-donut';

describe('DevOpsEvidenceTypeDonut', () => {
  it('renders accessible evidence type distribution', () => {
    render(
      <DevOpsEvidenceTypeDonut
        counts={getEvidenceTypeCounts(devOpsCapabilityEvidenceItems)}
        evidenceTypeLabels={evidenceTypeLabels}
      />,
    );

    expect(screen.getByText(/Evidence includes/)).toBeTruthy();
    const evidenceList = screen.getByRole('list');

    expect(within(evidenceList).getByText('Learning')).toBeTruthy();
    expect(within(evidenceList).getByText('Projects')).toBeTruthy();
  });
});
