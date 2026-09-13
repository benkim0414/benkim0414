import { Theme } from '@astryxdesign/core';
import { LinkProvider } from '@astryxdesign/core/Link';
import { neutralTheme } from '@astryxdesign/theme-neutral/built';
import { render, within } from '@testing-library/react';
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
    const { getAllByRole, getByRole } = renderRoadmapPage();
    const heading = getByRole('heading', {
      level: 2,
      name: 'DevOps roadmap',
    });
    const paragraphs = getByRole('main').querySelectorAll('p');
    const [firstParagraph, secondParagraph] = paragraphs;
    const sourceLink = getByRole('link', {
      name: 'roadmap.sh (opens in new tab)',
    });
    const [banner] = getAllByRole('status');
    const learnMore = within(banner).getByRole('link', { name: 'Learn more' });

    expect(firstParagraph.textContent).toBe(
      'This page maps my DevOps capabilities to the topics covered by the roadmap.sh(opens in new tab) DevOps roadmap. Each topic includes relevant skills, certifications, and evidence from my professional experience.',
    );
    expect(secondParagraph.textContent).toBe(
      'Explore the topics to see which areas I have covered and how my experience aligns with the roadmap.',
    );
    expect(firstParagraph.getAttribute('data-color')).toBe('secondary');
    expect(secondParagraph.getAttribute('data-color')).toBe('secondary');
    expect(heading.compareDocumentPosition(firstParagraph)).toBe(
      Node.DOCUMENT_POSITION_FOLLOWING,
    );
    expect(firstParagraph.compareDocumentPosition(secondParagraph)).toBe(
      Node.DOCUMENT_POSITION_FOLLOWING,
    );
    expect(secondParagraph.compareDocumentPosition(banner)).toBe(
      Node.DOCUMENT_POSITION_FOLLOWING,
    );
    expect(sourceLink.getAttribute('href')).toBe('https://roadmap.sh/');
    expect(sourceLink.getAttribute('target')).toBe('_blank');
    expect(sourceLink.getAttribute('rel')).toBe('noopener noreferrer');
    expect(sourceLink.querySelector('svg')).toBeTruthy();
    expect(within(banner).getByText('About roadmap.sh')).toBeTruthy();
    expect(
      within(banner).getByText(
        'roadmap.sh provides community-curated roadmaps, study plans, and resources for developers, including a dedicated DevOps roadmap.',
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
