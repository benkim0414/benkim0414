import { fireEvent, render, screen, within } from '@testing-library/react';
import { afterEach, vi } from 'vitest';

import { devOpsCapabilityEvidenceItems } from '../devops-capability-evidence/devops-capability-evidence.data';
import { skills } from './skill-list.data';
import { SkillExperienceList } from './skill-experience-list';

const experienceFixtures = devOpsCapabilityEvidenceItems.filter((item) =>
  [
    'argocd-environment-state-from-version-control',
    'deterministic-kubernetes-overlays',
  ].includes(item.id),
);

const originalMatchMedia = window.matchMedia;

afterEach(() => {
  window.matchMedia = originalMatchMedia;
});

function useSmallViewport(): void {
  window.matchMedia = vi.fn().mockImplementation((query: string) => ({
    matches: query === '(max-width: 640px)',
    media: query,
    onchange: null,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    addListener: vi.fn(),
    removeListener: vi.fn(),
    dispatchEvent: vi.fn(),
  }));
}

describe('SkillExperienceList', () => {
  it('labels distinct outcomes as highlights in its compact state', () => {
    useSmallViewport();
    const [evidence] = devOpsCapabilityEvidenceItems.filter(
      (item) => item.id === 'github-actions-gitops-handoff',
    );

    expect(evidence).toBeDefined();

    render(<SkillExperienceList evidence={[evidence]} skills={skills} />);

    const disclosure = screen.getByRole('button', {
      name: 'Highlights 1 Relevant skills 6',
    });

    expect(disclosure.getAttribute('aria-expanded')).toBe('false');
    expect(screen.queryByText('1 outcome · 6 skills')).toBeNull();

    fireEvent.click(disclosure);

    expect(disclosure.getAttribute('aria-expanded')).toBe('true');
    expect(disclosure.textContent).toContain('Highlights1');
    expect(disclosure.textContent).not.toContain('Relevant skills');
    expect(screen.getByRole('list', { name: 'Relevant skills' })).toBeTruthy();
    expect(screen.getByText('Relevant skills').parentElement?.textContent).toBe(
      'Relevant skills6',
    );
  });

  it('renders every evidence summary as an Astryx Card', () => {
    expect(experienceFixtures).toHaveLength(2);

    const { container, getAllByRole, getByRole, queryAllByRole } = render(
      <SkillExperienceList evidence={experienceFixtures} />,
    );

    const experienceList = getByRole('list', {
      name: 'Supporting experience',
    });
    const listItems = Array.from(experienceList.children) as HTMLElement[];

    expect(listItems).toHaveLength(experienceFixtures.length);
    expect(getAllByRole('heading', { level: 3 })).toHaveLength(
      experienceFixtures.length,
    );

    expect(container.querySelectorAll('blockquote')).toHaveLength(0);

    const cards = Array.from(container.querySelectorAll('.astryx-card'));

    expect(cards).toHaveLength(experienceFixtures.length);

    cards.forEach((card, index) => {
      const item = experienceFixtures[index];
      const cardQueries = within(card as HTMLElement);
      const spacingWrapper = card.parentElement;

      expect(spacingWrapper).not.toBe(listItems[index]);
      expect(spacingWrapper?.parentElement).toBe(listItems[index]);
      expect(
        spacingWrapper?.querySelectorAll(':scope > .astryx-card'),
      ).toHaveLength(1);

      expect(
        cardQueries.getByRole('heading', {
          level: 3,
          name: item.title,
        }),
      ).toBeTruthy();
      expect(
        cardQueries.getByText(item.summary, { selector: 'p' }),
      ).toBeTruthy();
    });
    expect(queryAllByRole('separator')).toHaveLength(0);
  });

  it('renders evidence facts and relevant skill tokens when skill matches exist', () => {
    const [evidence] = devOpsCapabilityEvidenceItems.filter(
      (item) => item.id === 'github-actions-gitops-handoff',
    );

    expect(evidence).toBeDefined();
    expect(evidence.details?.facts.length).toBeGreaterThan(0);
    expect(evidence.technologies).toContain('GitHub Actions');
    expect(evidence.technologies).toContain('Argo CD');

    const { getByRole, queryByText } = render(
      <SkillExperienceList evidence={[evidence]} skills={skills} />,
    );

    const card = getByRole('heading', {
      level: 3,
      name: evidence.title,
    }).closest('.astryx-card');

    expect(card).not.toBeNull();
    const outcomeLists = within(card as HTMLElement)
      .getAllByRole('list')
      .filter(
        (list) =>
          list.getAttribute('data-density') === 'compact' &&
          list.getAttribute('data-list-style') === 'disc',
      );

    expect(outcomeLists).toHaveLength(1);
    const outcomes = outcomeLists[0];

    if (!outcomes) {
      throw new Error('Expected a compact disc outcome list.');
    }

    expect(queryByText('Key outcomes')).toBeNull();
    expect(outcomes.getAttribute('aria-label')).toBeNull();
    expect(outcomes.getAttribute('aria-labelledby')).toBeNull();
    expect(outcomes.getAttribute('data-density')).toBe('compact');
    expect(outcomes.getAttribute('data-list-style')).toBe('disc');
    expect(
      within(outcomes).getByText(evidence.details?.facts[0] ?? ''),
    ).toBeTruthy();

    const relevantSkills = getByRole('list', { name: 'Relevant skills' });
    const tokens = within(relevantSkills).getAllByTestId('skill-token');
    const links = within(relevantSkills).getAllByRole('link');

    expect(screen.getByText('GitHub Actions')).toBeTruthy();
    expect(screen.getByText('Argo CD')).toBeTruthy();
    expect(screen.getAllByText('Relevant skills')).toHaveLength(1);
    expect(tokens).toHaveLength(6);
    expect(tokens.every((token) => token.getAttribute('style') === null)).toBe(
      true,
    );
    expect(links.map((link) => link.getAttribute('href'))).toEqual([
      '/skills/github',
      '/skills/github-actions',
      '/skills/nx',
      '/skills/amazon-ecr',
      '/skills/kustomize',
      '/skills/argo-cd',
    ]);
  });

  it('does not repeat duplicate evidence facts inside the same card', () => {
    const [evidence] = devOpsCapabilityEvidenceItems.filter(
      (item) => item.id === 'github-actions-gitops-handoff',
    );
    const duplicateFact =
      'Argo CD reconciles the version-controlled manifests.';

    expect(evidence).toBeDefined();
    if (!evidence?.details) {
      throw new Error('Expected GitHub Actions evidence details fixture.');
    }

    const { getAllByText } = render(
      <SkillExperienceList
        evidence={[
          {
            ...evidence,
            details: {
              ...evidence.details,
              facts: [
                evidence.summary,
                duplicateFact,
                duplicateFact,
                'Deployment manifests stay reviewable before rollout.',
              ],
            },
          },
        ]}
        skills={skills}
      />,
    );

    expect(getAllByText(evidence.summary, { selector: 'p' })).toHaveLength(1);
    expect(getAllByText(duplicateFact)).toHaveLength(1);
  });

  it('omits key outcomes when evidence has no distinct facts', () => {
    const [evidence] = experienceFixtures;

    expect(evidence).toBeDefined();

    render(
      <SkillExperienceList
        evidence={[
          {
            ...evidence,
            details: { facts: [evidence.summary] },
          },
        ]}
      />,
    );

    const card = screen
      .getByRole('heading', { level: 3, name: evidence.title })
      .closest('.astryx-card');

    expect(card).not.toBeNull();
    expect(within(card as HTMLElement).queryByRole('list')).toBeNull();
    expect(within(card as HTMLElement).queryByRole('button')).toBeNull();
  });

  it('uses the relevant-skills row as the skills-only disclosure trigger', () => {
    useSmallViewport();
    const [evidence] = devOpsCapabilityEvidenceItems.filter(
      (item) => item.id === 'github-actions-gitops-handoff',
    );

    expect(evidence).toBeDefined();

    render(
      <SkillExperienceList
        evidence={[{ ...evidence, details: { facts: [] } }]}
        skills={skills}
      />,
    );

    const disclosure = screen.getByRole('button', {
      name: 'Relevant skills 6',
    });

    fireEvent.click(disclosure);

    expect(disclosure.getAttribute('aria-expanded')).toBe('true');
    expect(screen.getAllByText('Relevant skills')).toHaveLength(1);
  });
});
