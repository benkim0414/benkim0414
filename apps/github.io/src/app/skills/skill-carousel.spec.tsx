import { render } from '@testing-library/react';
import { vi } from 'vitest';

import { SkillCarousel } from './skill-carousel';
import { sampleSkills } from './skill-list.data';

vi.stubGlobal(
  'ResizeObserver',
  class ResizeObserverMock {
    observe(): void {
      // Astryx only needs the observer API to exist in jsdom.
    }

    unobserve(): void {
      // Astryx only needs the observer API to exist in jsdom.
    }

    disconnect(): void {
      // Astryx only needs the observer API to exist in jsdom.
    }
  },
);

describe('SkillCarousel', () => {
  it('renders one skill card for each supplied skill', () => {
    const { getAllByTestId, getByRole } = render(
      <SkillCarousel skills={sampleSkills.slice(0, 3)} />,
    );

    expect(getAllByTestId('skill-card')).toHaveLength(3);
    expect(getByRole('heading', { name: sampleSkills[0].name })).toBeTruthy();
    expect(getByRole('heading', { name: sampleSkills[1].name })).toBeTruthy();
    expect(getByRole('heading', { name: sampleSkills[2].name })).toBeTruthy();
  });

  it('lets carousel skill cards keep their content-driven Card height', () => {
    const { container } = render(<SkillCarousel skills={sampleSkills} />);
    const cardStyles = Array.from(
      container.querySelectorAll('.astryx-card'),
      (card) => card.getAttribute('style') ?? '',
    );

    expect(cardStyles).toHaveLength(sampleSkills.length);
    expect(cardStyles.every((style) => !style.includes('--x-height'))).toBe(
      true,
    );
    expect(cardStyles.every((style) => !style.includes('--x-minHeight'))).toBe(
      true,
    );
  });

  it('opts into carousel-scoped equal-height card layout', () => {
    const { getByLabelText } = render(<SkillCarousel skills={sampleSkills} />);

    expect(getByLabelText('Skills carousel').className).toContain(
      'skill-carousel',
    );
  });

  it('renders an empty state when no skills are supplied', () => {
    const { getByRole, getByText, queryByTestId } = render(
      <SkillCarousel skills={[]} />,
    );

    expect(getByRole('status')).toBeTruthy();
    expect(getByText('No skills have been supplied.')).toBeTruthy();
    expect(queryByTestId('skill-card')).toBeNull();
  });

  it('uses a non-visible carousel accessibility label without rendering a visible label', () => {
    const { getByLabelText, queryByRole } = render(
      <SkillCarousel skills={sampleSkills.slice(0, 2)} />,
    );

    expect(getByLabelText('Skills carousel')).toBeTruthy();
    expect(queryByRole('heading', { name: 'Skills carousel' })).toBeNull();
  });
});
