import { render } from '@testing-library/react';

import { SkillRating } from './skill-rating';

describe('SkillRating', () => {
  it('renders five stars with accessible rating text', () => {
    const { getByText, getAllByText } = render(<SkillRating level={4} />);

    expect(getByText('4 out of 5')).toBeTruthy();
    expect(getAllByText('★')).toHaveLength(4);
    expect(getAllByText('☆')).toHaveLength(1);
  });
});
