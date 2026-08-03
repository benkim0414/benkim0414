import { getSkillBrand } from './skill-brand';

describe('getSkillBrand', () => {
  it('returns brand metadata for mapped skills', () => {
    const brand = getSkillBrand('Kubernetes');

    expect(brand).toMatchObject({
      name: 'Kubernetes',
      color: '#326CE5',
      foreground: 'var(--color-on-dark)',
    });
    expect(brand?.iconPath).toBeTruthy();
    expect(brand?.iconDataUrl).toContain('data:image/svg+xml;utf8,');
    expect(brand?.iconDataUrl).toContain('fill%3D%22%23326CE5%22');
  });

  it('returns icons for frontend and dotfiles project skills', () => {
    const iconBackedSkills = [
      'React',
      'TypeScript',
      'Nx',
      'GNU Stow',
      'Homebrew',
      'Zsh',
      'GNU Bash',
      'Neovim',
      'Lua',
      'tmux',
      'Ghostty',
      'bat',
      'Starship',
      'Claude Code',
    ];

    for (const skill of iconBackedSkills) {
      expect(getSkillBrand(skill)?.iconPath).toBeTruthy();
    }
  });

  it('returns color-only brand metadata when no logo is available', () => {
    const brand = getSkillBrand('AWS');

    expect(brand).toMatchObject({
      name: 'AWS',
      color: '#FF9900',
      foreground: 'var(--color-on-light)',
    });
    expect(brand?.iconPath).toBeUndefined();
    expect(brand?.iconDataUrl).toBeUndefined();
  });

  it('does not use unrelated icons for dotfiles skills without exact logos', () => {
    for (const skill of ['delta', 'gh-dash']) {
      expect(getSkillBrand(skill)?.iconPath).toBeUndefined();
      expect(getSkillBrand(skill)?.iconDataUrl).toBeUndefined();
    }
  });

  it('returns undefined for skills without Simple Icons metadata', () => {
    expect(getSkillBrand('Forward Proxy')).toBeUndefined();
  });

  it('chooses neutral text for light brand colors', () => {
    expect(getSkillBrand('Docker')?.foreground).toBe('var(--color-on-light)');
  });

  it('chooses inverse text for dark brand colors', () => {
    expect(getSkillBrand('GitHub')?.foreground).toBe('var(--color-on-dark)');
  });
});
