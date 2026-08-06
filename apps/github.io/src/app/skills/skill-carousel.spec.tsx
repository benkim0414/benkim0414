import { render, within } from '@testing-library/react';
import { Carousel } from '@astryxdesign/core/Carousel';
import { VStack } from '@astryxdesign/core/Layout';
import type { MockInstance } from 'vitest';
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
  let consoleErrorSpy: MockInstance<typeof console.error>;

  beforeEach(() => {
    consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {
      // React duplicate-key warnings are asserted by individual tests.
    });
  });

  afterEach(() => {
    consoleErrorSpy.mockRestore();
  });

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

  it('forwards Astryx content padding to populated carousels without changing the default', () => {
    const { getAllByTestId, getByLabelText } = render(
      <>
        <SkillCarousel
          ariaLabel="Padded skills"
          padding={4}
          skills={sampleSkills.slice(0, 2)}
        />
        <SkillCarousel
          ariaLabel="Default skills"
          skills={sampleSkills.slice(0, 2)}
        />
        <Carousel
          aria-label="Padded control"
          gap={3}
          hasSnap
          padding={4}
        >
          <span>Padded control item</span>
        </Carousel>
        <Carousel aria-label="Default control" gap={3} hasSnap>
          <span>Default control item</span>
        </Carousel>
      </>,
    );
    const paddedScroller = getByLabelText('Padded skills').firstElementChild;
    const defaultScroller = getByLabelText('Default skills').firstElementChild;
    const paddedControlScroller =
      getByLabelText('Padded control').firstElementChild;
    const defaultControlScroller =
      getByLabelText('Default control').firstElementChild;

    expect(getAllByTestId('skill-card')).toHaveLength(4);
    expect(paddedScroller?.className).toBe(paddedControlScroller?.className);
    expect(defaultScroller?.className).toBe(defaultControlScroller?.className);
    expect(paddedScroller?.className).not.toBe(defaultScroller?.className);
  });

  it('applies Astryx inline padding to empty states without changing the default', () => {
    const { getByRole, getByTestId } = render(
      <>
        <SkillCarousel
          emptyMessage="Padded empty skills"
          padding={4}
          skills={[]}
        />
        <VStack data-testid="padded-empty-control" paddingInline={4} />
      </>,
    );
    const paddedStatus = getByRole('status');
    const paddedWrapper = paddedStatus.parentElement;
    const paddedControl = getByTestId('padded-empty-control');

    expect(paddedWrapper?.className).toBe(paddedControl.className);

    const defaultEmpty = render(<SkillCarousel skills={[]} />);
    const defaultStatus = within(defaultEmpty.container).getByRole('status');

    expect(defaultStatus.parentElement?.className).not.toBe(
      paddedWrapper?.className,
    );
    expect(defaultStatus.parentElement?.className).not.toContain(
      'astryx-stack',
    );
  });

  it('uses a non-visible carousel accessibility label without rendering a visible label', () => {
    const { getByLabelText, queryByRole } = render(
      <SkillCarousel skills={sampleSkills.slice(0, 2)} />,
    );

    expect(getByLabelText('Skills carousel')).toBeTruthy();
    expect(queryByRole('heading', { name: 'Skills carousel' })).toBeNull();
  });

  it('supports a reusable non-visible accessibility label', () => {
    const { getByLabelText, queryByRole } = render(
      <SkillCarousel ariaLabel="Platform skills" skills={sampleSkills} />,
    );

    expect(getByLabelText('Platform skills')).toBeTruthy();
    expect(queryByRole('heading', { name: 'Platform skills' })).toBeNull();
  });

  it('supports rendering duplicate skill entries without duplicate-key warnings', () => {
    render(
      <SkillCarousel skills={[sampleSkills[0], sampleSkills[0]]} />,
    );

    expect(consoleErrorSpy).not.toHaveBeenCalledWith(
      expect.stringContaining('Encountered two children with the same key'),
      expect.anything(),
    );
  });
});
