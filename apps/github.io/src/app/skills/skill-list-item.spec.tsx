import { render } from '@testing-library/react';

import { sampleSkills } from './skill-list.data';
import { SkillListItem } from './skill-list-item';

describe('SkillListItem', () => {
  it('renders a skill row with avatar, category, and rating', () => {
    const typeScript = sampleSkills.find((skill) => skill.id === 'typescript');

    expect(typeScript).toBeTruthy();

    const { container, getByText } = render(
      <SkillListItem skill={typeScript!} />
    );

    expect(container.querySelector('img')).toBeTruthy();
    expect(getByText('TypeScript')).toBeTruthy();
    expect(getByText('Language')).toBeTruthy();
    expect(getByText('5 out of 5')).toBeTruthy();
  });
});
