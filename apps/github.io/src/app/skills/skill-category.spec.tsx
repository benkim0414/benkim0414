import { render } from '@testing-library/react';

import { SkillCategory } from './skill-category';

describe('SkillCategory', () => {
  it('renders the category name as a badge', () => {
    const { getByText } = render(<SkillCategory name="Cloud" />);

    expect(getByText('Cloud')).toBeTruthy();
  });
});
