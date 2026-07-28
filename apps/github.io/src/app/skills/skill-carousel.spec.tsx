import { render } from '@testing-library/react';

import { SkillCarousel } from './skill-carousel';
import { sampleSkills } from './skill-list.data';

describe('SkillCarousel', () => {
  it('renders one skill card for each supplied skill', () => {
    const { getAllByTestId, getByRole } = render(
      <SkillCarousel skills={sampleSkills.slice(0, 3)} />,
    );

    expect(getAllByTestId('skill-card')).toHaveLength(3);
    expect(getByRole('heading', { name: sampleSkills[0].name })).toBeTruthy();
    expect(getByRole('heading', { name: sampleSkills[1].name })).toBeTruthy();
    expect(getByRole('heading', { name: sampleSkills[2].name })).toBeTruthy();
  });

  it('renders an empty state when no skills are supplied', () => {
    const { getByRole, getByText, queryByTestId } = render(
      <SkillCarousel skills={[]} />,
    );

    expect(getByRole('status')).toBeTruthy();
    expect(getByText('No skills have been supplied.')).toBeTruthy();
    expect(queryByTestId('skill-card')).toBeNull();
  });

  it('uses a non-visible carousel accessibility label without rendering a visible label', () => {
    const { getByLabelText, queryByRole } = render(
      <SkillCarousel skills={sampleSkills.slice(0, 2)} />,
    );

    expect(getByLabelText('Skills carousel')).toBeTruthy();
    expect(queryByRole('heading', { name: 'Skills carousel' })).toBeNull();
  });
});
