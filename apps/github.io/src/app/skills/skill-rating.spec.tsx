import { render } from '@testing-library/react';

import { SkillRating } from './skill-rating';

describe('SkillRating', () => {
  it('renders full and compact ratings with accessible rating text', () => {
    const { getByText } = render(<SkillRating level={4} />);
    const rating = getByText('4 out of 5').closest('.skill-rating');
    const stars = rating?.querySelector('.skill-rating__stars');
    const compact = rating?.querySelector('.skill-rating__compact');

    expect(getByText('4 out of 5')).toBeTruthy();
    expect(stars?.textContent).toBe('★★★★☆');
    expect(stars?.getAttribute('aria-hidden')).toBe('true');
    expect(compact?.textContent).toBe('★4/5');
    expect(compact?.getAttribute('aria-hidden')).toBe('true');
  });
});
