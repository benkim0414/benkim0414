import { render, screen } from '@testing-library/react';

import {
  DEVOPS_CAPABILITY_RADAR_LABEL,
  DEVOPS_CAPABILITY_RADAR_SERIES_LABEL,
  devOpsCapabilityRadarMetrics,
  devOpsCapabilityRadarScores,
  getDevOpsCapabilityRadarSummary,
} from './devops-capability-radar.data';
import { DevOpsCapabilityRadar } from './devops-capability-radar';

describe('devOpsCapabilityRadar data', () => {
  it('uses the approved accessible label and series label', () => {
    expect(DEVOPS_CAPABILITY_RADAR_LABEL).toBe('DevOps capability radar');
    expect(DEVOPS_CAPABILITY_RADAR_SERIES_LABEL).toBe('DevOps capability');
  });

  it('uses the approved capability axes in order', () => {
    expect(devOpsCapabilityRadarMetrics.map((metric) => metric.name)).toEqual([
      'Automation',
      'Delivery',
      'Cloud',
      'Containers',
      'Reliability',
      'Security',
    ]);
  });

  it('uses a 1-5 scale and the approved scores', () => {
    expect(devOpsCapabilityRadarMetrics.map((metric) => metric.min)).toEqual([
      1, 1, 1, 1, 1, 1,
    ]);
    expect(devOpsCapabilityRadarMetrics.map((metric) => metric.max)).toEqual([
      5, 5, 5, 5, 5, 5,
    ]);
    expect(devOpsCapabilityRadarScores).toEqual([4, 5, 4, 4, 4, 3]);
  });

  it('summarizes scores for non-visual chart access', () => {
    expect(getDevOpsCapabilityRadarSummary()).toBe(
      'Automation 4 of 5, Delivery 5 of 5, Cloud 4 of 5, Containers 4 of 5, Reliability 4 of 5, Security 3 of 5.',
    );
  });
});

describe('DevOpsCapabilityRadar', () => {
  it('renders a standalone labelled chart region', () => {
    render(<DevOpsCapabilityRadar />);

    expect(
      screen.getByRole('figure', { name: 'DevOps capability radar' }),
    ).toBeTruthy();
    expect(
      screen.getByText(
        'Automation 4 of 5, Delivery 5 of 5, Cloud 4 of 5, Containers 4 of 5, Reliability 4 of 5, Security 3 of 5.',
      ),
    ).toBeTruthy();
  });

  it('renders all six capability axes', () => {
    render(<DevOpsCapabilityRadar />);

    for (const metric of devOpsCapabilityRadarMetrics) {
      expect(screen.getByText(metric.name)).toBeTruthy();
    }
  });
});
