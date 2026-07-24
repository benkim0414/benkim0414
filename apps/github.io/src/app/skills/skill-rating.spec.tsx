import { render } from '@testing-library/react';

import { SkillRating } from './skill-rating';

describe('SkillRating', () => {
  it('renders full and compact ratings with accessible rating text', () => {
    const { getByText } = render(<SkillRating level={4} />);

    expect(getByText('4 out of 5')).toBeTruthy();
    expect(getByText('★★★★☆').getAttribute('aria-hidden')).toBe('true');
    expect(getByText('★').closest('[aria-hidden="true"]')?.textContent).toBe(
      '★4/5',
    );
  });
});
