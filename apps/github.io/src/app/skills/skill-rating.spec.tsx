import { render, screen } from '@testing-library/react';
import type { SVGProps } from 'react';
import { vi } from 'vitest';

import { SkillRating } from './skill-rating';

function MockSolidStar(props: SVGProps<SVGSVGElement>) {
  return <svg {...props} data-heroicon-variant="solid" />;
}

function MockOutlineStar(props: SVGProps<SVGSVGElement>) {
  return <svg {...props} data-heroicon-variant="outline" />;
}

vi.mock('@heroicons/react/24/solid', () => ({
  StarIcon: MockSolidStar,
}));

vi.mock('@heroicons/react/24/outline', () => ({
  StarIcon: MockOutlineStar,
}));

describe('SkillRating', () => {
  it('renders equal-size Heroicons stars with supporting rating text', () => {
    render(<SkillRating level={4} />);

    expect(screen.getByText('4 out of 5')).toBeTruthy();
    expect(screen.getByText('4/5').closest('[aria-hidden="true"]')).toBeTruthy();

    const stars = screen.getAllByTestId('skill-rating-star');

    expect(stars).toHaveLength(5);
    expect(
      stars.map((star) => star.getAttribute('data-heroicon-variant')),
    ).toEqual(['solid', 'solid', 'solid', 'solid', 'outline']);

    const classNames = stars.map((star) => star.getAttribute('class'));
    expect(new Set(classNames)).toHaveLength(1);
  });
});
