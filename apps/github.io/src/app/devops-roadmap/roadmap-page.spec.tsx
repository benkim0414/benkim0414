import { Theme } from '@astryxdesign/core';
import { LinkProvider } from '@astryxdesign/core/Link';
import { neutralTheme } from '@astryxdesign/theme-neutral/built';
import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { vi } from 'vitest';

import { RouterLink } from '../router-link';
import { RoadmapPage } from './roadmap-page';

const { devOpsRoadmapStepperSpy } = vi.hoisted(() => ({
  devOpsRoadmapStepperSpy: vi.fn(),
}));

vi.mock('./devops-roadmap-stepper', () => ({
  DevOpsRoadmapStepper: (props: Record<string, unknown>) => {
    devOpsRoadmapStepperSpy(props);

    return <ol aria-label="DevOps roadmap" />;
  },
}));

function renderRoadmapPage() {
  return render(
    <MemoryRouter>
      <LinkProvider component={RouterLink}>
        <Theme theme={neutralTheme}>
          <RoadmapPage />
        </Theme>
      </LinkProvider>
    </MemoryRouter>,
  );
}

describe('RoadmapPage', () => {
  beforeEach(() => {
    devOpsRoadmapStepperSpy.mockClear();
  });

  it('renders a full-width mobile page without a width cap', () => {
    const { getByRole } = renderRoadmapPage();
    const main = getByRole('main');

    expect(main.style.width).toBe('100%');
    expect(main.style.maxWidth).toBe('');
    expect(main.style.minHeight).toBe('100vh');
  });

  it('renders the approved roadmap introduction and external source action', () => {
    const { getByRole, getByText } = renderRoadmapPage();
    const learnMore = getByRole('link', { name: 'Learn more' });

    expect(
      getByRole('heading', { level: 2, name: 'DevOps roadmap' }),
    ).toBeTruthy();
    expect(getByText('About this roadmap')).toBeTruthy();
    expect(
      getByText(
        'This roadmap presents my DevOps capabilities using the learning path published by roadmap.sh as a reference framework. Each topic highlights relevant skills and certifications, providing a structured overview of my experience across the DevOps discipline.',
      ),
    ).toBeTruthy();
    expect(learnMore.getAttribute('href')).toBe('https://roadmap.sh/devops');
    expect(learnMore.getAttribute('target')).toBe('_blank');
    expect(learnMore.getAttribute('rel')).toBe('noopener noreferrer');
  });

  it('uses the Astryx H2 type scale for the roadmap label', () => {
    const { getByRole } = renderRoadmapPage();
    const heading = getByRole('heading', {
      level: 2,
      name: 'DevOps roadmap',
    });

    expect(heading.className).toContain('astryx-heading');
    expect(heading.getAttribute('data-level')).toBe('2');
  });

  it('composes the roadmap Stepper without overriding its default data', () => {
    const { getByRole } = renderRoadmapPage();

    expect(getByRole('list', { name: 'DevOps roadmap' })).toBeTruthy();
    expect(devOpsRoadmapStepperSpy).toHaveBeenCalledTimes(1);
    expect(devOpsRoadmapStepperSpy).toHaveBeenCalledWith({});
  });
});
