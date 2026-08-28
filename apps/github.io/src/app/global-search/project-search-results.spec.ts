import { sampleProjects } from '../projects/project-list.data';
import { createProjectSearchResults } from './project-search-results';

describe('createProjectSearchResults', () => {
  it('creates external repository destinations in the Projects group', () => {
    const [result] = createProjectSearchResults([sampleProjects[0]]);

    expect(result).toMatchObject({
      id: 'project:dotfiles',
      label: 'benkim0414/dotfiles',
      href: 'https://github.com/benkim0414/dotfiles',
      group: 'Projects',
    });
    expect(result).not.toHaveProperty('project');
  });

  it('preserves description and project skill matching data', () => {
    const [result] = createProjectSearchResults([sampleProjects[0]]);

    expect(result.keywords).toEqual([
      sampleProjects[0].description,
      'GNU Stow',
      'Homebrew',
      'Zsh',
      'Bash',
      'GNU Bash',
      'Neovim',
      'Lua',
      'tmux',
      'Ghostty',
      'bat',
      'eza',
      'fzf',
      'ripgrep',
      'Yazi',
      'Starship',
      'zoxide',
      'mise',
      'Git',
      'delta',
      'GitHub CLI',
      'GitHub',
      'gh-dash',
      'LazyGit',
      'SSH',
      'Herdr',
      'Claude Code',
      'Codex',
    ]);
  });
});
