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
  it('renders desktop stars and compact supporting rating text separately', () => {
    render(<SkillRating level={4} />);

    expect(screen.getByText('4 out of 5')).toBeTruthy();
    expect(
      screen.getByText('4/5').closest('[data-testid="skill-rating-compact"]'),
    ).toBeTruthy();

    const desktopStars = screen.getAllByTestId('skill-rating-star');
    const compactStars = screen.getAllByTestId('skill-rating-compact-star');

    expect(desktopStars).toHaveLength(5);
    expect(compactStars).toHaveLength(1);
    expect(
      desktopStars.map((star) => star.getAttribute('data-heroicon-variant')),
    ).toEqual(['solid', 'solid', 'solid', 'solid', 'outline']);
    expect(compactStars[0].getAttribute('data-heroicon-variant')).toBe('solid');

    const desktopClassNames = desktopStars.map((star) =>
      star.getAttribute('class'),
    );
    expect(new Set(desktopClassNames)).toHaveLength(1);
    expect(compactStars[0].getAttribute('class')).toBe(desktopClassNames[0]);
  });
});
