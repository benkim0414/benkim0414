import { render, screen } from '@testing-library/react';

import {
  devOpsCapabilityEvidenceItems,
  doraCapabilityDefinitions,
} from './devops-capability-evidence.data';
import { getCapabilityEvidenceScores } from './devops-capability-evidence.scoring';
import { DevOpsCapabilityBarList } from './devops-capability-bar-list';

describe('DevOpsCapabilityBarList', () => {
  it('renders ranked capabilities with strongest evidence', () => {
    const scores = getCapabilityEvidenceScores(
      devOpsCapabilityEvidenceItems,
      doraCapabilityDefinitions,
    );

    render(
      <DevOpsCapabilityBarList
        evidence={devOpsCapabilityEvidenceItems}
        scores={scores}
      />,
    );

    expect(screen.getByText('Continuous Delivery')).toBeTruthy();
    expect(screen.getByText('CI/CD workflow ownership')).toBeTruthy();
    expect(screen.getAllByText(/3 of 5|4 of 5|5 of 5/).length).toBeGreaterThan(0);
  });

  it('renders nothing without scores', () => {
    const { container } = render(
      <DevOpsCapabilityBarList evidence={devOpsCapabilityEvidenceItems} scores={[]} />,
    );

    expect(container).toBeEmptyDOMElement();
  });
});
