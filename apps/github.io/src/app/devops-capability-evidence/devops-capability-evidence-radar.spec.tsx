import { render, screen } from '@testing-library/react';

import {
  devOpsCapabilityEvidenceItems,
  doraCapabilityDefinitions,
} from './devops-capability-evidence.data';
import { getCapabilityEvidenceScores } from './devops-capability-evidence.scoring';
import { DevOpsCapabilityEvidenceRadar } from './devops-capability-evidence-radar';
import type { DoraCapabilityScore } from './devops-capability-evidence.types';

describe('DevOpsCapabilityEvidenceRadar', () => {
  it('renders evidence-backed DORA capability axes as a visual-only chart with an accessible summary', () => {
    const scores = getCapabilityEvidenceScores(
      devOpsCapabilityEvidenceItems,
      doraCapabilityDefinitions,
    );

    const { container } = render(
      <DevOpsCapabilityEvidenceRadar scores={scores} />,
    );

    expect(screen.getByText('Continuous Delivery')).toBeTruthy();
    expect(screen.getByText('Flexible Infrastructure')).toBeTruthy();
    expect(screen.queryByText('Pervasive Security')).toBeNull();
    expect(
      screen.getByText(
        /Continuous Delivery 3 of 5, Deployment Automation 3 of 5, Continuous Integration 3 of 5/,
      ),
    ).toBeTruthy();

    const chart = container.querySelector('[aria-hidden="true"]');

    expect(chart).toBeTruthy();
    expect(chart?.querySelectorAll('[tabindex]').length).toBe(0);
  });

  it('renders nothing when no scores exist', () => {
    const { container } = render(<DevOpsCapabilityEvidenceRadar scores={[]} />);

    expect(container.childElementCount).toBe(0);
  });

  it('renders nothing when every caller-provided score is zero', () => {
    const zeroScores = [
      {
        capabilityKey: 'pervasive-security',
        label: 'Pervasive Security',
        score: 0,
        maxScore: 5,
        evidenceIds: [],
        evidenceCounts: {},
      },
    ] satisfies readonly DoraCapabilityScore[];

    const { container } = render(
      <DevOpsCapabilityEvidenceRadar scores={zeroScores} />,
    );

    expect(container.childElementCount).toBe(0);
  });

  it('filters zero-value caller-provided scores before building radar axes', () => {
    const scores = [
      {
        capabilityKey: 'continuous-delivery',
        label: 'Continuous Delivery',
        score: 3,
        maxScore: 5,
        evidenceIds: ['delivery-summary'],
        evidenceCounts: { experience: 1 },
      },
      {
        capabilityKey: 'pervasive-security',
        label: 'Pervasive Security',
        score: 0,
        maxScore: 5,
        evidenceIds: [],
        evidenceCounts: {},
      },
    ] satisfies readonly DoraCapabilityScore[];

    render(<DevOpsCapabilityEvidenceRadar scores={scores} />);

    expect(screen.getByText('Continuous Delivery')).toBeTruthy();
    expect(screen.queryByText('Pervasive Security')).toBeNull();
    expect(screen.getByText(/Continuous Delivery 3 of 5/)).toBeTruthy();
  });
});
