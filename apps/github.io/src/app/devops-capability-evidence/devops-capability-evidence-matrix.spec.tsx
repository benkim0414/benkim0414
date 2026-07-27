import { render, screen } from '@testing-library/react';

import {
  devOpsCapabilityEvidenceItems,
  doraCapabilityDefinitions,
  evidenceTypeLabels,
} from './devops-capability-evidence.data';
import { getCapabilityEvidenceMatrix } from './devops-capability-evidence.scoring';
import { DevOpsCapabilityEvidenceMatrix } from './devops-capability-evidence-matrix';

describe('DevOpsCapabilityEvidenceMatrix', () => {
  it('renders capability rows and evidence type columns', () => {
    render(
      <DevOpsCapabilityEvidenceMatrix
        evidenceTypeLabels={evidenceTypeLabels}
        rows={getCapabilityEvidenceMatrix(
          devOpsCapabilityEvidenceItems,
          doraCapabilityDefinitions,
        )}
      />,
    );

    expect(screen.getByText('Flexible Infrastructure')).toBeTruthy();
    expect(screen.getByText('Learning')).toBeTruthy();
    expect(screen.getByText('Skills')).toBeTruthy();
    expect(screen.getByLabelText('Flexible Infrastructure has 1 learning item')).toBeTruthy();
  });
});
