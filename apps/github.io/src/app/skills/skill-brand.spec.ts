import { getSkillBrand, hasSkillBrandIcon } from './skill-brand';

const ciSkillNames = [
  'Terraform',
  'AWS CodePipeline',
  'AWS CodeBuild',
  'Amazon ECR',
  'GitHub',
  'AWS Systems Manager Parameter Store',
  'Docker',
  'Nx',
  'GitHub Actions',
  'OpenID Connect',
  'Kustomize',
  'Helm',
  'Argo CD',
];

describe('getSkillBrand', () => {
  it('resolves an icon for every selected CI skill', () => {
    for (const skill of ciSkillNames) {
      expect(hasSkillBrandIcon(getSkillBrand(skill))).toBe(true);
    }
  });

  it.each([
    'AWS CodePipeline',
    'AWS CodeBuild',
    'Amazon ECR',
    'AWS Systems Manager Parameter Store',
  ])('uses a local full-color AWS asset for %s', (skill) => {
    const brand = getSkillBrand(skill);

    expect(brand?.iconPath).toBeUndefined();
    expect(brand?.iconDataUrl).toMatch(/assets\/.*\.svg/);
  });

  it('uses the Kubernetes Simple Icon as the documented Kustomize fallback', () => {
    expect(getSkillBrand('Kustomize')?.iconPath).toBe(
      getSkillBrand('Kubernetes')?.iconPath,
    );
  });

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
