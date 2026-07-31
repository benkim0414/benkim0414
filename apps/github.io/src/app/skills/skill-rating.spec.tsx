import { render, screen } from '@testing-library/react';

import { SkillRating } from './skill-rating';

describe('SkillRating', () => {
  it('renders equal-size Heroicons stars with supporting rating text', () => {
    render(<SkillRating level={4} />);

    expect(screen.getByText('4 out of 5')).toBeTruthy();
    expect(screen.getByText('4/5').closest('[aria-hidden="true"]')).toBeTruthy();

    const stars = screen.getAllByTestId('skill-rating-star');

    expect(stars).toHaveLength(5);
    expect(stars.filter((star) => star.dataset.filled === 'true')).toHaveLength(
      4,
    );
    expect(stars.filter((star) => star.dataset.filled === 'false')).toHaveLength(
      1,
    );

    const classNames = stars.map((star) => star.getAttribute('class'));
    expect(new Set(classNames)).toHaveLength(1);
  });
});
