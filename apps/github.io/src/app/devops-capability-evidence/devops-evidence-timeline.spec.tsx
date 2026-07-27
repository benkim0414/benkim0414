import { render, screen } from '@testing-library/react';

import {
  devOpsCapabilityEvidenceItems,
  evidenceTypeLabels,
} from './devops-capability-evidence.data';
import { DevOpsEvidenceTimeline } from './devops-evidence-timeline';

describe('DevOpsEvidenceTimeline', () => {
  it('renders dated evidence in reverse chronological order', () => {
    render(
      <DevOpsEvidenceTimeline
        evidence={devOpsCapabilityEvidenceItems}
        evidenceTypeLabels={evidenceTypeLabels}
      />,
    );

    expect(screen.getByText('Kubernetes operations learning path')).toBeTruthy();
    expect(screen.getByText('Learning')).toBeTruthy();
  });

  it('does not render private or unsupported evidence', () => {
    render(
      <DevOpsEvidenceTimeline
        evidence={[
          ...devOpsCapabilityEvidenceItems,
          {
            ...devOpsCapabilityEvidenceItems[4],
            id: 'unsupported-skill',
            title: 'Unsupported skill',
            supportingEvidenceIds: [],
          },
          {
            ...devOpsCapabilityEvidenceItems[1],
            id: 'private-learning',
            title: 'Private learning',
            isSensitive: true,
          },
        ]}
        evidenceTypeLabels={evidenceTypeLabels}
      />,
    );

    expect(screen.queryByText('Unsupported skill')).toBeNull();
    expect(screen.queryByText('Private learning')).toBeNull();
  });
});
