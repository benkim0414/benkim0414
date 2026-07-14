import { fireEvent, render } from '@testing-library/react';

import { sampleSkills } from './skill-list.data';
import { SkillLogo } from './skill-logo';

describe('SkillLogo', () => {
  it('renders a bundled logo source and falls back to initials when unavailable', () => {
    const typeScript = sampleSkills.find((skill) => skill.id === 'typescript');

    expect(typeScript).toBeTruthy();

    const { container, getByText } = render(<SkillLogo skill={typeScript!} />);
    const image = container.querySelector('img');

    expect(image).toBeTruthy();
    expect(image?.getAttribute('src')).toContain('data:image/svg+xml');

    fireEvent.error(image!);

    expect(container.querySelector('img')).toBeNull();
    expect(getByText('T')).toBeTruthy();
  });

  it('uses initials when the icon slug has no bundled logo', () => {
    const skill = {
      ...sampleSkills[0],
      iconSlug: 'missing-logo',
      name: 'Unknown Skill',
    };
    const { container, getByText } = render(<SkillLogo skill={skill} />);

    expect(container.querySelector('img')).toBeNull();
    expect(getByText('US')).toBeTruthy();
  });
});
