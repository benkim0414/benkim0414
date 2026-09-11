import { render, screen } from '@testing-library/react';

import { SkillConfidence } from './skill-confidence';

const confidenceTooltip =
  'Self-rated comfort; evidence appears in experience, projects, and certifications.';

function expectTooltipFor(control: HTMLElement, text: string) {
  const describedBy = control.getAttribute('aria-describedby');

  expect(describedBy).toBeTruthy();

  const matchingTooltip = describedBy
    ?.split(' ')
    .map((id) => control.ownerDocument.getElementById(id))
    .find(
      (element) =>
        element?.getAttribute('role') === 'tooltip' &&
        element.textContent?.trim() === text,
    );

  expect(matchingTooltip).toBeTruthy();
}

describe('SkillConfidence', () => {
  it.each([
    [1, 'Exploring'],
    [2, 'Familiar'],
    [3, 'Working'],
    [4, 'Confident'],
    [5, 'Proven'],
  ] as const)(
    'renders self-rated confidence %i as the qualitative label %s',
    (confidence, label) => {
      render(<SkillConfidence confidence={confidence} />);

      expect(screen.getByText(label)).toBeTruthy();
      expect(screen.getByText(`Self-rated confidence: ${label}`)).toBeTruthy();
      expect(screen.queryByText(`${confidence}/5`)).toBeNull();
      expect(screen.queryByText(`${confidence} out of 5`)).toBeNull();
    },
  );

  it('renders confidence as compact text metadata without star icons', () => {
    render(<SkillConfidence confidence={4} />);

    expect(screen.getByTestId('skill-confidence')).toBeTruthy();
    expect(screen.queryByTestId('skill-rating-star')).toBeNull();
    expect(screen.queryByTestId('skill-rating-compact-star')).toBeNull();
  });

  it('can render confidence with body text styling', () => {
    render(
      <SkillConfidence
        confidence={4}
        hasTooltip={false}
        textStyle="body"
      />,
    );

    const label = screen.getByText('Confident');

    expect(label.getAttribute('data-type')).toBe('body');
    expect(label.getAttribute('data-color')).toBe('primary');
  });

  it('describes text confidence with a concise tooltip', () => {
    render(<SkillConfidence confidence={4} />);

    expectTooltipFor(
      screen.getByTestId('skill-confidence-tooltip-trigger'),
      confidenceTooltip,
    );
  });

  it('uses the confidence text as the inline tooltip trigger', () => {
    render(<SkillConfidence confidence={4} />);

    const confidence = screen.getByTestId('skill-confidence');
    const trigger = screen.getByTestId('skill-confidence-tooltip-trigger');

    expect(confidence.contains(trigger)).toBe(true);
    expect(trigger.textContent).toBe('Confident');
    expect(trigger.getAttribute('aria-describedby')).toBeTruthy();
    expect(trigger.getAttribute('tabindex')).toBe('0');
  });

  it('can render the confidence tooltip open for visual review', () => {
    render(<SkillConfidence confidence={4} isTooltipOpen />);

    expect(
      screen.getByRole('tooltip', { name: confidenceTooltip }),
    ).toBeTruthy();
  });

  it('renders tooltip copy with a dedicated wrapping hook', () => {
    render(<SkillConfidence confidence={4} isTooltipOpen />);

    const tooltip = screen.getByRole('tooltip', { name: confidenceTooltip });
    const tooltipContent = screen.getByTestId('skill-confidence-tooltip-copy');

    expect(tooltip.contains(tooltipContent)).toBe(true);
    expect(tooltipContent.getAttribute('style')).toBeNull();
    expect(tooltipContent.className).not.toBe('');
  });

  it('renders confidence as an Astryx token when requested', () => {
    render(<SkillConfidence confidence={2} variant="token" />);

    const confidence = screen.getByTestId('skill-confidence');
    const token = confidence.querySelector('.astryx-token');

    expect(screen.getByText('Confidence: Familiar')).toBeTruthy();
    expect(
      screen.queryByText('Familiar', { selector: '.astryx-text' }),
    ).toBeNull();
    expect(token).not.toBeNull();
    expect(token?.getAttribute('data-size')).toBe('sm');
    expect(token?.getAttribute('data-color')).toBe('gray');
    expect(confidence.getAttribute('tabindex')).toBe('0');
    expectTooltipFor(confidence, confidenceTooltip);
  });
});
