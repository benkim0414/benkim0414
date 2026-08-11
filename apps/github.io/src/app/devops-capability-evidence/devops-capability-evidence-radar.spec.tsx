import { render, screen } from '@testing-library/react';
import { radarClasses } from '@mui/x-charts/RadarChart';

import { curatedDevOpsCapabilityRadarScores } from './devops-capability-evidence.data';
import { DevOpsCapabilityEvidenceRadar } from './devops-capability-evidence-radar';
import type { DoraCapabilityScore } from './devops-capability-evidence.types';

describe('DevOpsCapabilityEvidenceRadar', () => {
  it('renders curated DevOps capability axes as a visual-only chart with an accessible summary', () => {
    const { container } = render(
      <DevOpsCapabilityEvidenceRadar
        scores={curatedDevOpsCapabilityRadarScores}
      />,
    );

    for (const label of [
      'Versioning',
      'Trunk',
      'CI',
      'Tests',
      'Security',
      'Delivery',
      'Deploys',
      'Infrastructure',
      'Observability',
      'Docs',
    ]) {
      expect(screen.getByText(label)).toBeTruthy();
    }

    expect(screen.queryByText('Continuous Delivery')).toBeNull();
    expect(screen.queryByText('Deployment Automation')).toBeNull();
    expect(screen.queryByText('Pervasive Security')).toBeNull();
    expect(
      screen.getByText(
        /Versioning 4.5 of 5, Trunk 3.5 of 5, CI 3.5 of 5, Tests 3.5 of 5, Security 3.5 of 5, Delivery 3.5 of 5, Deploys 3 of 5, Infrastructure 3.5 of 5, Observability 3 of 5, Docs 3 of 5/,
      ),
    ).toBeTruthy();
    expect(
      curatedDevOpsCapabilityRadarScores.some((score) => score.score === 5),
    ).toBe(false);

    const chart = container.querySelector('[aria-hidden="true"]');

    expect(chart).toBeTruthy();
    expect(chart?.querySelectorAll('[tabindex]').length).toBe(0);
    expect(
      container.querySelectorAll(`.${radarClasses.gridDivider}`),
    ).toHaveLength(10);
  });

  it('renders nothing when no scores exist', () => {
    const { container } = render(<DevOpsCapabilityEvidenceRadar scores={[]} />);

    expect(container.childElementCount).toBe(0);
  });

  it('renders nothing when every caller-provided score is zero', () => {
    const zeroScores = [
      {
        capabilityKey: 'pervasive-security',
        label: 'Security',
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
        label: 'Delivery',
        score: 3,
        maxScore: 5,
        evidenceIds: ['delivery-summary'],
        evidenceCounts: { experience: 1 },
      },
      {
        capabilityKey: 'pervasive-security',
        label: 'Security',
        score: 0,
        maxScore: 5,
        evidenceIds: [],
        evidenceCounts: {},
      },
    ] satisfies readonly DoraCapabilityScore[];

    render(<DevOpsCapabilityEvidenceRadar scores={scores} />);

    expect(screen.getByText('Delivery')).toBeTruthy();
    expect(screen.queryByText('Security')).toBeNull();
    expect(screen.getByText(/Delivery 3 of 5/)).toBeTruthy();
  });
});
