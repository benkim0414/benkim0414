import { render, screen } from '@testing-library/react';

import {
  devOpsCapabilityEvidenceItems,
  doraCapabilityDefinitions,
} from './devops-capability-evidence.data';
import { getCapabilityEvidenceScores } from './devops-capability-evidence.scoring';
import { DevOpsCapabilityEvidenceRadar } from './devops-capability-evidence-radar';

describe('DevOpsCapabilityEvidenceRadar', () => {
  it('renders evidence-backed DORA capability axes', () => {
    const scores = getCapabilityEvidenceScores(
      devOpsCapabilityEvidenceItems,
      doraCapabilityDefinitions,
    );

    render(<DevOpsCapabilityEvidenceRadar scores={scores} />);

    expect(screen.getByText('Continuous Delivery')).toBeTruthy();
    expect(screen.getByText('Flexible Infrastructure')).toBeTruthy();
    expect(screen.queryByText('Pervasive Security')).toBeNull();
    expect(screen.getByText(/Continuous Delivery 3 of 5/)).toBeTruthy();
  });

  it('renders nothing when no scores exist', () => {
    const { container } = render(<DevOpsCapabilityEvidenceRadar scores={[]} />);

    expect(container).toBeEmptyDOMElement();
  });
});
