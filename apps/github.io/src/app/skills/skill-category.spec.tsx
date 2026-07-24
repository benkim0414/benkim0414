import { render } from '@testing-library/react';

import { SkillCategory } from './skill-category';

describe('SkillCategory', () => {
  it('renders the category name as metadata', () => {
    const { getByText } = render(<SkillCategory name="Cloud" />);

    expect(getByText('Cloud')).toBeTruthy();
  });
});
