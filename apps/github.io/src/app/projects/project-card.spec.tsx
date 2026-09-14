import { fireEvent, render, screen, within } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { sampleProjects } from './project-list.data';
import { ProjectCard } from './project-card';
import * as stories from './project-card.stories';

const originalMatchMedia = window.matchMedia;

afterEach(() => {
  window.matchMedia = originalMatchMedia;
});

function setSmallViewport(matches: boolean): void {
  window.matchMedia = vi.fn().mockImplementation((query: string) => ({
    matches,
    media: query,
    onchange: null,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    addListener: vi.fn(),
    removeListener: vi.fn(),
    dispatchEvent: vi.fn(),
  }));
}

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

  it('provides evidence-backed homelab project data', () => {
    const project = sampleProjects.find((item) => item.id === 'homelab');

    expect(project).toEqual({
      id: 'homelab',
      title: 'benkim0414/homelab',
      description:
        'Self-managed K3s homelab automated with Argo CD and Helm, with private networking, encrypted secrets, distributed storage, observability, databases, and off-site backups.',
      skills: [
        { label: 'K3s' },
        { label: 'Argo CD' },
        { label: 'Helm' },
        { label: 'Ansible' },
        { label: 'kubectl' },
        { label: 'Tailscale' },
        { label: 'Sealed Secrets' },
        { label: 'Traefik' },
        { label: 'Longhorn' },
        { label: 'MetalLB' },
        { label: 'kube-vip' },
        { label: 'Prometheus' },
        { label: 'Grafana' },
        { label: 'Loki' },
        { label: 'Alloy' },
        { label: 'PostgreSQL' },
        { label: 'Redis' },
        { label: 'NFS' },
        { label: 'Amazon S3' },
        { label: 'Renovate' },
      ],
      githubUrl: 'https://github.com/benkim0414/homelab',
      evidenceIds: ['homelab-project'],
      capabilityKeys: [
        'deployment-automation',
        'flexible-infrastructure',
        'monitoring-observability',
        'pervasive-security',
      ],
    });

    const skillLabels = project?.skills.map(({ label }) => label) ?? [];

    expect(skillLabels).not.toEqual(
      expect.arrayContaining(['Kubernetes', 'GitOps', 'Bash', 'mise']),
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

  it('uses a full-width card surface by default', () => {
    const { container } = render(<ProjectCard project={project} />);

    const cardSurface = container.querySelector('.astryx-card');

    expect(cardSurface).toBeInstanceOf(HTMLElement);
    expect((cardSurface as HTMLElement).style.getPropertyValue('--x-width')).toBe(
      '100%',
    );
  });

  it('renders the project title, description, skills, and GitHub repository link', async () => {
    setSmallViewport(false);
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

    const repositoryLink = screen.getByRole('link', {
      name: `Open ${project.title} on GitHub`,
    });
    expect(repositoryLink.getAttribute('href')).toBe(project.githubUrl);
    expect(repositoryLink.getAttribute('target')).toBe('_blank');
    expect(repositoryLink.getAttribute('rel')).toContain('noopener');
    expect(repositoryLink.getAttribute('rel')).toContain('noreferrer');
    expect(repositoryLink.className).toContain('astryx-button');
    expect(repositoryLink.getAttribute('data-variant')).toBe('ghost');
    fireEvent.mouseEnter(repositoryLink);
    expect(
      await screen.findByRole('tooltip', { name: repositoryLinkLabel(project) }),
    ).toBeTruthy();
  });

  it('shows the skill count beside its supporting label', () => {
    const { container } = render(<ProjectCard project={project} />);

    const label = screen.getByText('Skills used');
    const badge = screen.getByText(String(project.skills.length));

    expect(label.className).toContain('astryx-text');
    expect(label.getAttribute('data-type')).toBe('supporting');
    expect(label.getAttribute('data-color')).toBe('secondary');
    expect(badge.closest('.astryx-badge')).toBeTruthy();
  });

  it('uses the GitHub brand icon for the repository action', () => {
    const { container } = render(<ProjectCard project={project} />);

    const githubIcon = container.querySelector('img[src^="data:image/svg+xml"]');

    expect(githubIcon).toBeTruthy();
  });

  it('starts collapsed on small screens and reveals skills on request', () => {
    setSmallViewport(true);
    render(<ProjectCard project={project} />);

    const disclosure = screen.getByRole('button', { name: /Skills used/ });

    expect(disclosure.getAttribute('aria-expanded')).toBe('false');
    fireEvent.click(disclosure);
    expect(disclosure.getAttribute('aria-expanded')).toBe('true');
    expect(screen.getByRole('list', { name: 'Skills used' })).toBeTruthy();
  });

  it('starts expanded above the small-screen breakpoint', () => {
    setSmallViewport(false);
    render(<ProjectCard project={project} />);

    expect(
      screen
        .getByRole('button', { name: /Skills used/ })
        .getAttribute('aria-expanded'),
    ).toBe('true');
  });

  it('supports full-width cards without changing content', () => {
    setSmallViewport(false);
    render(<ProjectCard isFullWidth project={project} />);

    expect(
      screen.getByRole('heading', { name: project.title, level: 3 }),
    ).toBeTruthy();
    const repositoryLink = screen.getByRole('link', {
      name: `Open ${project.title} on GitHub`,
    });
    expect(repositoryLink.getAttribute('href')).toBe(project.githubUrl);
    expect(screen.queryByText('Source')).toBeNull();
  });
});

function repositoryLinkLabel(project: { title: string }): string {
  return `Open ${project.title} on GitHub`;
}

describe('ProjectCard stories', () => {
  it('exports the expected story fixtures', () => {
    expect(stories.Default.args?.project?.id).toBe('dotfiles');
    expect(stories.Homelab.args?.project?.id).toBe('homelab');
    expect(stories.Homelab.args?.project?.title).toBe('benkim0414/homelab');
    expect(stories.Homelab.args?.project?.skills).toHaveLength(20);
    expect(stories.ManySkills.args?.project?.skills.length).toBeGreaterThan(8);
    expect(stories.LongCopy.args?.project?.title).toContain('observability');
    expect(stories.FullWidth.parameters?.viewport?.defaultViewport).toBe(
      'mobile1',
    );
    expect(stories.MobileCollapsed.parameters?.viewport?.defaultViewport).toBe(
      'mobile1',
    );
  });
});
