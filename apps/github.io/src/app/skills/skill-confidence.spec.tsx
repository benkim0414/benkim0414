import { render, screen } from '@testing-library/react';

import { SkillConfidence } from './skill-confidence';

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
  });
});
