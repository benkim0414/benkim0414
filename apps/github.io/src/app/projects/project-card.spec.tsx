import { render, screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { sampleProjects } from './project-list.data';
import { ProjectCard } from './project-card';
import * as stories from './project-card.stories';

describe('project data', () => {
  it('provides stable project data for ProjectCard surfaces', () => {
    expect(sampleProjects).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: 'dotfiles',
          title: 'benkim0414/dotfiles',
          githubUrl: 'https://github.com/benkim0414/dotfiles',
          skills: expect.arrayContaining([
            expect.objectContaining({ label: 'GNU Stow' }),
            expect.objectContaining({ label: 'Homebrew' }),
            expect.objectContaining({ label: 'Zsh' }),
            expect.objectContaining({ label: 'Neovim' }),
            expect.objectContaining({ label: 'Lua' }),
            expect.objectContaining({ label: 'tmux' }),
            expect.objectContaining({ label: 'ripgrep' }),
            expect.objectContaining({ label: 'delta' }),
            expect.objectContaining({
              label: 'GitHub CLI',
              brandLabel: 'GitHub',
            }),
            expect.objectContaining({ label: 'gh-dash' }),
            expect.objectContaining({ label: 'Herdr' }),
            expect.objectContaining({ label: 'Claude Code' }),
          ]),
        }),
      ]),
    );
  });

  it('keeps future evidence linkage as optional project metadata', () => {
    const project = sampleProjects.find(
      (item) => item.id === 'dotfiles',
    );

    expect(project?.evidenceIds).toEqual(
      expect.arrayContaining(['dotfiles-project']),
    );
    expect(project?.capabilityKeys).toEqual(
      expect.arrayContaining(['developer-experience']),
    );
  });
});

describe('ProjectCard', () => {
  const project = sampleProjects[0];

  it('renders the project title, description, skills, and GitHub source', () => {
    render(<ProjectCard project={project} />);

    expect(screen.getByRole('article', { name: project.title })).toBeTruthy();
    expect(
      screen.getByRole('heading', { name: project.title, level: 3 }),
    ).toBeTruthy();
    expect(screen.getByText(project.description)).toBeTruthy();

    const skills = screen.getByRole('list', { name: 'Skills used' });
    for (const skill of project.skills) {
      expect(within(skills).getByText(skill.label)).toBeTruthy();
    }

    const source = screen.getByRole('doc-noteref', {
      name: 'Citation 1: GitHub',
    });
    expect(source.getAttribute('href')).toBe(project.githubUrl);
  });

  it('renders card section labels as supporting secondary text', () => {
    const { container } = render(<ProjectCard project={project} />);

    const labels = Array.from(container.querySelectorAll('p')).filter((node) =>
      ['Skills used', 'Source'].includes(node.textContent ?? ''),
    );

    expect(labels).toHaveLength(2);
    for (const label of labels) {
      expect(label.className).toContain('astryx-text');
      expect(label.getAttribute('data-type')).toBe('supporting');
      expect(label.getAttribute('data-color')).toBe('secondary');
    }
  });

  it('uses the GitHub brand icon for the repository citation', () => {
    const { container } = render(<ProjectCard project={project} />);

    const githubIcon = container.querySelector('img[src^="data:image/svg+xml"]');

    expect(githubIcon).toBeTruthy();
  });

  it('supports full-width cards without changing content', () => {
    render(<ProjectCard isFullWidth project={project} />);

    expect(
      screen.getByRole('heading', { name: project.title, level: 3 }),
    ).toBeTruthy();
    const source = screen.getByRole('doc-noteref', {
      name: 'Citation 1: GitHub',
    });
    expect(source.getAttribute('href')).toBe(project.githubUrl);
  });
});

describe('ProjectCard stories', () => {
  it('exports the expected story fixtures', () => {
    expect(stories.Default.args?.project?.id).toBe('dotfiles');
    expect(stories.ManySkills.args?.project?.skills.length).toBeGreaterThan(8);
    expect(stories.LongCopy.args?.project?.title).toContain('observability');
    expect(stories.FullWidth.parameters?.viewport?.defaultViewport).toBe(
      'mobile1',
    );
  });
});
