import { render, screen } from '@testing-library/react';

import {
  DEVOPS_CAPABILITY_RADAR_LABEL,
  devOpsCapabilityRadarMetrics,
  devOpsCapabilityRadarScores,
  getDevOpsCapabilityRadarSummary,
} from './devops-capability-radar.data';
import { DevOpsCapabilityRadar } from './devops-capability-radar';

describe('devOpsCapabilityRadar data', () => {
  it('uses the approved accessible label', () => {
    expect(DEVOPS_CAPABILITY_RADAR_LABEL).toBe('DevOps capability radar');
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

  it('uses a five-division radial scale and the approved scores', () => {
    expect(devOpsCapabilityRadarMetrics.map((metric) => metric.min)).toEqual([
      0, 0, 0, 0, 0, 0,
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
  it('renders only the radar chart visually', () => {
    render(<DevOpsCapabilityRadar />);

    expect(screen.queryByRole('figure')).toBeNull();
    expect(
      screen.queryByRole('heading', { name: 'DevOps capability radar' }),
    ).toBeNull();
    expect(screen.queryByText('DevOps capability')).toBeNull();
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

  it('uses a readable contrast token for axis labels', () => {
    render(<DevOpsCapabilityRadar />);

    for (const metric of devOpsCapabilityRadarMetrics) {
      expect(
        screen.getByText(metric.name).closest('text')?.getAttribute('fill'),
      ).toBe('var(--color-text-blue)');
    }
  });

  it('gives the standalone chart a stable visible viewport', () => {
    const { container } = render(<DevOpsCapabilityRadar />);
    const chart = container.querySelector('svg');

    expect(chart?.getAttribute('viewBox')).toBe('0 0 360 360');
    expect(chart?.getAttribute('aria-hidden')).toBe('true');
  });

  it('plots the Security mark at three fifths of the radial scale', () => {
    const { container } = render(<DevOpsCapabilityRadar />);
    const marks = container.querySelectorAll('.MuiRadarChart-seriesMark');
    const securityMark = marks[5];

    expect(Number(securityMark?.getAttribute('cx'))).toBeCloseTo(
      115.56621995843782,
    );
    expect(Number(securityMark?.getAttribute('cy'))).toBeCloseTo(
      142.79999999999995,
    );
  });

  it('does not expose tabbable chart content from the hidden visual wrapper', () => {
    const { container } = render(<DevOpsCapabilityRadar />);
    const chartWrapper = container.querySelector('[aria-hidden="true"]');

    expect(chartWrapper).toBeTruthy();
    expect(
      chartWrapper?.querySelectorAll(
        'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
      ),
    ).toHaveLength(0);
  });
});
