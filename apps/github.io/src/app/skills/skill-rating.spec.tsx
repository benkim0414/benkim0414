import { render } from '@testing-library/react';

import { SkillRating } from './skill-rating';

describe('SkillRating', () => {
  it('renders five stars with an accessible rating label', () => {
    const { getByLabelText, getAllByText } = render(<SkillRating level={4} />);

    expect(getByLabelText('4 out of 5')).toBeTruthy();
    expect(getAllByText('★')).toHaveLength(4);
    expect(getAllByText('☆')).toHaveLength(1);
  });
});
