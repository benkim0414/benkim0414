import { render, screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { sampleProjects } from './project-list.data';
import { ProjectCard } from './project-card';

describe('project data', () => {
  it('provides stable project data for ProjectCard surfaces', () => {
    expect(sampleProjects).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: 'github-io-portfolio',
          title: 'GitHub.io portfolio',
          githubUrl: 'https://github.com/benkim0414/benkim0414',
          skills: expect.arrayContaining([
            expect.objectContaining({ label: 'React' }),
            expect.objectContaining({ label: 'TypeScript' }),
            expect.objectContaining({ label: 'GitHub' }),
          ]),
        }),
      ]),
    );
  });

  it('keeps future evidence linkage as optional project metadata', () => {
    const project = sampleProjects.find(
      (item) => item.id === 'github-io-portfolio',
    );

    expect(project?.evidenceIds).toEqual(
      expect.arrayContaining(['devops-roadmap-project']),
    );
    expect(project?.capabilityKeys).toEqual(
      expect.arrayContaining(['deployment-automation']),
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
    expect(within(skills).getByText('React')).toBeTruthy();
    expect(within(skills).getByText('TypeScript')).toBeTruthy();
    expect(within(skills).getByText('GitHub')).toBeTruthy();

    const source = screen.getByRole('link', {
      name: /github repository/i,
    });
    expect(source).toHaveAttribute('href', project.githubUrl);
  });

  it('renders card section labels as supporting secondary text', () => {
    const { container } = render(<ProjectCard project={project} />);

    const labels = Array.from(container.querySelectorAll('p')).filter((node) =>
      ['Skills used', 'Source'].includes(node.textContent ?? ''),
    );

    expect(labels).toHaveLength(2);
    for (const label of labels) {
      expect(label.className).toContain('astryx-text');
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
    expect(
      screen.getByRole('link', { name: /github repository/i }),
    ).toHaveAttribute('href', project.githubUrl);
  });
});
