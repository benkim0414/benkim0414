import { render } from '@testing-library/react';

import { sampleSkills } from './skill-list.data';
import { SkillListItem } from './skill-list-item';

describe('SkillListItem', () => {
  it('renders a skill row with avatar, category, and rating', () => {
    const typeScript = sampleSkills.find((skill) => skill.id === 'typescript');

    expect(typeScript).toBeTruthy();

    const { container, getByRole, getByText } = render(
      <SkillListItem skill={typeScript!} />,
    );
    const avatar = getByRole('img', { name: 'TypeScript' });
    const content = avatar.firstElementChild as HTMLElement;

    expect(container.querySelector('img')).toBeTruthy();
    expect(avatar.getAttribute('data-size')).toBe('small');
    expect(content.style.getPropertyValue('--x-width')).toBe('36px');
    expect(content.style.getPropertyValue('--x-height')).toBe('36px');
    expect(getByText('TypeScript')).toBeTruthy();
    expect(getByText('Language')).toBeTruthy();
    expect(getByText('4 out of 5')).toBeTruthy();
  });

  it('renders compact rows without category badges', () => {
    const typeScript = sampleSkills.find((skill) => skill.id === 'typescript');

    expect(typeScript).toBeTruthy();

    const { getByText, queryByText } = render(
      <SkillListItem skill={typeScript!} variant="compact" />,
    );

    expect(getByText('TypeScript')).toBeTruthy();
    expect(queryByText('Language')).toBeNull();
    expect(getByText('4 out of 5')).toBeTruthy();
  });

  it('uses the Astryx row link contract when href is supplied', () => {
    const typeScript = sampleSkills.find((skill) => skill.id === 'typescript');

    expect(typeScript).toBeTruthy();

    const { getByRole, getByText } = render(
      <SkillListItem href="/skills/typescript" skill={typeScript!} />,
    );
    const link = getByRole('link', { name: /TypeScript/ });
    const avatar = getByRole('img', { name: 'TypeScript' });
    const category = getByText('Language');
    const rating = getByText('4 out of 5');

    expect(link.getAttribute('href')).toBe('/skills/typescript');
    expect(link.contains(avatar)).toBe(true);
    expect(link.contains(category)).toBe(true);
    expect(link.contains(rating)).toBe(true);
    expect(link.querySelectorAll('a, button')).toHaveLength(0);
  });

  it('remains a static Astryx row when href is omitted', () => {
    const typeScript = sampleSkills.find((skill) => skill.id === 'typescript');

    expect(typeScript).toBeTruthy();

    const { queryByRole } = render(<SkillListItem skill={typeScript!} />);

    expect(queryByRole('link')).toBeNull();
  });
});
