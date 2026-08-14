import { Theme } from '@astryxdesign/core';
import { LinkProvider } from '@astryxdesign/core/Link';
import { neutralTheme } from '@astryxdesign/theme-neutral/built';
import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { vi } from 'vitest';

import { RouterLink } from '../router-link';
import { RoadmapPage } from './roadmap-page';

const { devOpsRoadmapSpy } = vi.hoisted(() => ({
  devOpsRoadmapSpy: vi.fn(),
}));

vi.mock('./devops-roadmap', () => ({
  DevOpsRoadmap: (props: Record<string, unknown>) => {
    devOpsRoadmapSpy(props);

    return <div aria-label="DevOps roadmap diagram" role="group" />;
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
    devOpsRoadmapSpy.mockClear();
  });

  it('renders the approved roadmap introduction and external source action', () => {
    const { getByRole, getByText } = renderRoadmapPage();
    const main = getByRole('main');
    const learnMore = getByRole('link', { name: 'Learn more' });

    expect(main.className).toContain('mx-auto');
    expect(
      getByRole('heading', { level: 1, name: 'DevOps roadmap' }),
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

  it('composes the existing roadmap without overriding its default data', () => {
    const { getByRole } = renderRoadmapPage();

    expect(getByRole('group', { name: 'DevOps roadmap diagram' })).toBeTruthy();
    expect(devOpsRoadmapSpy).toHaveBeenCalledTimes(1);
    expect(devOpsRoadmapSpy).toHaveBeenCalledWith({});
  });
});
