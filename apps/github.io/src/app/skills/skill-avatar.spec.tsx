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
      <SkillAvatar skill={typeScript!} />,
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

  it('uses official Simple Icons art for Kubernetes', () => {
    const kubernetes = sampleSkills.find((skill) => skill.id === 'kubernetes');

    expect(kubernetes).toBeTruthy();

    const kubernetesAvatar = render(<SkillAvatar skill={kubernetes!} />);

    expect(
      svgContent(
        kubernetesAvatar.container.querySelector('img')?.getAttribute('src'),
      ),
    ).toContain('<title>Kubernetes</title>');
  });

  it('uses official Simple Icons art for Nx and GitHub Actions', () => {
    const nx = sampleSkills.find((skill) => skill.id === 'nx');
    const githubActions = sampleSkills.find(
      (skill) => skill.id === 'github-actions',
    );

    expect(nx).toBeTruthy();
    expect(githubActions).toBeTruthy();

    const nxAvatar = render(<SkillAvatar skill={nx!} />);
    const githubActionsAvatar = render(<SkillAvatar skill={githubActions!} />);

    expect(
      svgContent(nxAvatar.container.querySelector('img')?.getAttribute('src')),
    ).toContain('<title>Nx</title>');
    expect(
      svgContent(
        githubActionsAvatar.container.querySelector('img')?.getAttribute('src'),
      ),
    ).toContain('<title>GitHub Actions</title>');
  });

  it('uses official Simple Icons art for new local tool skills', () => {
    const claudeCode = sampleSkills.find((skill) => skill.id === 'claude-code');
    const neovim = sampleSkills.find((skill) => skill.id === 'neovim');
    const tmux = sampleSkills.find((skill) => skill.id === 'tmux');

    expect(claudeCode).toBeTruthy();
    expect(neovim).toBeTruthy();
    expect(tmux).toBeTruthy();

    const claudeCodeAvatar = render(<SkillAvatar skill={claudeCode!} />);
    const neovimAvatar = render(<SkillAvatar skill={neovim!} />);
    const tmuxAvatar = render(<SkillAvatar skill={tmux!} />);

    expect(
      svgContent(
        claudeCodeAvatar.container.querySelector('img')?.getAttribute('src'),
      ),
    ).toContain('<title>Claude Code</title>');
    expect(
      svgContent(
        neovimAvatar.container.querySelector('img')?.getAttribute('src'),
      ),
    ).toContain('<title>Neovim</title>');
    expect(
      svgContent(
        tmuxAvatar.container.querySelector('img')?.getAttribute('src'),
      ),
    ).toContain('<title>tmux</title>');
  });

  it('lets Astryx Avatar own image sizing inside the circular mask', () => {
    const nx = sampleSkills.find((skill) => skill.id === 'nx');

    expect(nx).toBeTruthy();

    const nxAvatar = render(<SkillAvatar skill={nx!} />);

    expect(
      (
        nxAvatar.container.firstElementChild as HTMLElement
      ).style.getPropertyValue('--skill-avatar-padding'),
    ).toBe('');
  });

  it('uses the documented 48px Astryx avatar size by default', () => {
    const typeScript = sampleSkills.find((skill) => skill.id === 'typescript');

    expect(typeScript).toBeTruthy();

    const { getByRole } = render(<SkillAvatar skill={typeScript!} />);
    const avatar = getByRole('img', { name: 'TypeScript' });
    expect(avatar.getAttribute('data-size')).toBe('lg');
  });
});
