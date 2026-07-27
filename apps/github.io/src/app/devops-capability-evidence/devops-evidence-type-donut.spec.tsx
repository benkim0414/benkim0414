import { render, screen } from '@testing-library/react';

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
    expect(screen.getByText('Learning')).toBeTruthy();
    expect(screen.getByText('Projects')).toBeTruthy();
  });
});
