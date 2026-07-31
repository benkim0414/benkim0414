import { render, screen } from '@testing-library/react';
import { existsSync, readFileSync } from 'node:fs';
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
  it('uses half-size stars from the Astryx spacing scale', () => {
    const sourcePath = existsSync('src/app/skills/skill-rating.tsx')
      ? 'src/app/skills/skill-rating.tsx'
      : 'apps/github.io/src/app/skills/skill-rating.tsx';
    const source = readFileSync(sourcePath, 'utf8');

    expect(source).toContain("width: spacingVars['--spacing-2']");
    expect(source).toContain("height: spacingVars['--spacing-2']");
  });

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
