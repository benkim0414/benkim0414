import { fireEvent, render } from '@testing-library/react';

import { sampleSkills } from './skill-list.data';
import { SkillAvatar } from './skill-avatar';

function svgContent(source: string | null | undefined) {
  expect(source).toBeTruthy();

  return decodeURIComponent(source!.replace('data:image/svg+xml,', ''));
}

describe('SkillAvatar', () => {
  it('renders a bundled logo source and falls back to initials when unavailable', () => {
    const typeScript = sampleSkills.find((skill) => skill.id === 'typescript');

    expect(typeScript).toBeTruthy();

    const { container, getByRole, getByText } = render(
      <SkillAvatar skill={typeScript!} />
    );
    const image = container.querySelector('img');

    expect(getByRole('img', { name: 'TypeScript' })).toBeTruthy();
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
    const { container, getByText } = render(<SkillAvatar skill={skill} />);

    expect(container.querySelector('img')).toBeNull();
    expect(getByText('US')).toBeTruthy();
  });

  it('uses initials for AWS because Simple Icons has no AWS logo', () => {
    const aws = sampleSkills.find((skill) => skill.id === 'aws');

    expect(aws).toBeTruthy();

    const { container, getByText } = render(<SkillAvatar skill={aws!} />);

    expect(container.querySelector('img')).toBeNull();
    expect(getByText('A')).toBeTruthy();
  });

  it('uses official Simple Icons art for Nx and GitHub Actions', () => {
    const nx = sampleSkills.find((skill) => skill.id === 'nx');
    const githubActions = sampleSkills.find(
      (skill) => skill.id === 'github-actions'
    );

    expect(nx).toBeTruthy();
    expect(githubActions).toBeTruthy();

    const nxAvatar = render(<SkillAvatar skill={nx!} />);
    const githubActionsAvatar = render(<SkillAvatar skill={githubActions!} />);

    expect(
      svgContent(nxAvatar.container.querySelector('img')?.getAttribute('src'))
    ).toContain('<title>Nx</title>');
    expect(
      svgContent(
        githubActionsAvatar.container
          .querySelector('img')
          ?.getAttribute('src')
      )
    ).toContain('<title>GitHub Actions</title>');
  });

  it('lets Astryx Avatar own image sizing inside the circular mask', () => {
    const nx = sampleSkills.find((skill) => skill.id === 'nx');

    expect(nx).toBeTruthy();

    const nxAvatar = render(<SkillAvatar skill={nx!} />);

    expect(
      (nxAvatar.container.firstElementChild as HTMLElement).style.getPropertyValue(
        '--skill-avatar-padding'
      )
    ).toBe('');
  });
});
