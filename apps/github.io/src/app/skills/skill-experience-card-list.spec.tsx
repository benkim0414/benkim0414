import { fireEvent, render, screen, within } from '@testing-library/react';
import { afterEach, vi } from 'vitest';

import type { Experience } from '../experience/experience.types';
import type { Skill } from './skill-list.types';
import {
  SkillExperienceCard,
  SkillExperienceCardList,
} from './skill-experience-card-list';
import { COMPACT_SURFACE_QUERY } from './skill-table-responsive';

const ciCdExperience: Experience = {
  id: 'aws-codepipeline-codebuild-multistage-delivery',
  kind: 'professional',
  title: 'Multi-stage AWS CI/CD delivery pipeline',
  summary:
    'Built AWS CodePipeline and CodeBuild automation for staging and production delivery with build validation, artifact handoff, and controlled promotion.',
  narrative: [
    'Built a delivery pipeline around AWS CodePipeline and AWS CodeBuild so application changes could move through repeatable validation before reaching runtime environments.',
    'Separated staging and production delivery concerns so changes could be exercised in a pre-production stage before production promotion, with the pipeline carrying the same build output through the release path.',
  ],
  role: 'Platform engineer',
  environments: [{ label: 'Staging' }, { label: 'Production' }],
  skillIds: ['aws-codepipeline'],
  projectIds: ['homelab'],
  capabilityKeys: ['continuous-integration', 'continuous-delivery'],
  technologies: ['AWS CodePipeline', 'AWS CodeBuild', 'Terraform'],
  isPublic: true,
};

const ciCdSkills: readonly Skill[] = [
  {
    id: 'aws-codepipeline',
    name: 'AWS CodePipeline',
    description: 'Pipeline orchestration.',
    categories: ['CI/CD'],
    primaryUse: 'Approval-gated delivery',
    confidence: 4,
    iconSlug: 'aws-codepipeline',
    keywords: [],
  },
  {
    id: 'aws-codebuild',
    name: 'AWS CodeBuild',
    description: 'Build automation.',
    categories: ['CI/CD'],
    primaryUse: 'Managed CI validation',
    confidence: 4,
    iconSlug: 'aws-codebuild',
    keywords: [],
  },
];

const originalMatchMedia = window.matchMedia;

afterEach(() => {
  window.matchMedia = originalMatchMedia;
});

function setCompactSurface(isCompact: boolean): void {
  window.matchMedia = vi.fn().mockImplementation((query: string) => ({
    matches:
      query ===
      COMPACT_SURFACE_QUERY
        ? isCompact
        : false,
    media: query,
    onchange: null,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    addListener: vi.fn(),
    removeListener: vi.fn(),
    dispatchEvent: vi.fn(),
  }));
}

describe('SkillExperienceCard', () => {
  it('starts collapsed on a coarse tablet compact surface and reveals details on request', () => {
    setCompactSurface(true);

    render(
      <SkillExperienceCard
        experience={ciCdExperience}
        relevantSkillLabels={['AWS CodePipeline', 'AWS CodeBuild']}
      />,
    );

    const disclosure = screen.getByRole('button', {
      name: 'Highlights 2 Relevant skills 2',
    });

    expect(disclosure.getAttribute('aria-expanded')).toBe('false');
    expect(screen.queryByText('2 outcomes · 2 skills')).toBeNull();

    fireEvent.click(disclosure);

    expect(disclosure.getAttribute('aria-expanded')).toBe('true');
    expect(disclosure.getAttribute('aria-label')).toBeNull();
    expect(disclosure.textContent).toBe('Highlights');
    expect(disclosure.textContent).not.toContain('Relevant skills');
    expect(screen.getAllByRole('list')).toHaveLength(2);
    expect(screen.getByText(ciCdExperience.narrative[0])).toBeTruthy();
    expect(screen.getByRole('list', { name: 'Relevant skills' })).toBeTruthy();
    expect(screen.getByText('Relevant skills').parentElement?.textContent).toBe(
      'Relevant skills',
    );
    expect(disclosure.closest('.astryx-card')?.querySelectorAll('.astryx-badge')).toHaveLength(0);
  });

  it('starts expanded on a non-compact surface', () => {
    setCompactSurface(false);

    render(<SkillExperienceCard experience={ciCdExperience} />);

    expect(
      screen
        .getByRole('button', {
          name: 'Highlights',
        })
        .getAttribute('aria-expanded'),
    ).toBe('true');
    expect(screen.getByRole('list')).toBeTruthy();
  });

  it('preserves the user choice through a compact-surface round trip', () => {
    setCompactSurface(false);

    const { rerender } = render(
      <SkillExperienceCard experience={ciCdExperience} />,
    );
    const disclosure = screen.getByRole('button', {
      name: 'Highlights',
    });

    fireEvent.click(disclosure);
    expect(disclosure.getAttribute('aria-expanded')).toBe('false');

    setCompactSurface(true);
    rerender(<SkillExperienceCard experience={ciCdExperience} />);

    expect(
      screen
        .getByRole('button', { name: 'Highlights 2' })
        .getAttribute('aria-expanded'),
    ).toBe('false');

    setCompactSurface(false);
    rerender(<SkillExperienceCard experience={ciCdExperience} />);

    expect(
      screen
        .getByRole('button', { name: 'Highlights 2' })
        .getAttribute('aria-expanded'),
    ).toBe('false');
  });

  it('keeps both detail counts visible in the disclosure label', () => {
    setCompactSurface(true);

    render(
      <SkillExperienceCard
        experience={ciCdExperience}
        relevantSkillLabels={['AWS CodePipeline']}
      />,
    );

    expect(
      screen.getByRole('button', {
        name: 'Highlights 2 Relevant skills 1',
      }),
    ).toBeTruthy();
  });

  it('omits the relevant-skills label when the card has no skills', () => {
    setCompactSurface(true);

    render(<SkillExperienceCard experience={ciCdExperience} />);

    expect(
      screen.getByRole('button', { name: 'Highlights 2' }),
    ).toBeTruthy();
    expect(screen.queryByText('Relevant skills')).toBeNull();
  });

  it('omits the highlights label when the card has no highlights', () => {
    setCompactSurface(true);

    render(
      <SkillExperienceCard
        experience={{ ...ciCdExperience, narrative: [] }}
        relevantSkillLabels={['AWS CodePipeline']}
      />,
    );

    const disclosure = screen.getByRole('button', {
      name: 'Relevant skills 1',
    });

    fireEvent.click(disclosure);

    expect(disclosure.getAttribute('aria-expanded')).toBe('true');
    expect(screen.getByRole('button', { name: 'Relevant skills' })).toBe(
      disclosure,
    );
    expect(disclosure.textContent).toBe('Relevant skills');
    expect(disclosure.textContent).not.toContain('Highlights');
    expect(screen.getAllByText('Relevant skills')).toHaveLength(1);
  });

  it('omits the disclosure when the card has no details', () => {
    render(
      <SkillExperienceCard
        experience={{ ...ciCdExperience, narrative: [] }}
      />,
    );

    expect(screen.queryByRole('button')).toBeNull();
    expect(screen.getByText(ciCdExperience.summary)).toBeTruthy();
  });

  it('renders experience text through Astryx typography components', () => {
    render(
      <SkillExperienceCard
        experience={ciCdExperience}
        relevantSkillLabels={['AWS CodePipeline']}
      />,
    );

    const card = screen
      .getByRole('heading', {
        level: 3,
        name: 'Multi-stage AWS CI/CD delivery pipeline',
      })
      .closest('.astryx-card');

    expect(card).not.toBeNull();
    expect(card?.querySelectorAll('.astryx-text')).toHaveLength(5);
  });

  it('presents narrative details as readable key outcomes', () => {
    render(<SkillExperienceCard experience={ciCdExperience} />);

    const outcomes = screen.getByRole('list');

    expect(screen.queryByText('Key outcomes')).toBeNull();
    expect(outcomes.getAttribute('data-density')).toBe('compact');
    expect(outcomes.getAttribute('data-list-style')).toBe('disc');
    expect(within(outcomes).getAllByRole('listitem')).toHaveLength(2);

    ciCdExperience.narrative.forEach((outcome) => {
      const text = within(outcomes).getByText(outcome);

      expect(text.getAttribute('data-type')).toBe('body');
      expect(text.getAttribute('data-color')).toBe('primary');
      expect(text.textContent).toBe(outcome);
    });
  });

  it('keeps role and environment metadata out of the card surface', () => {
    render(<SkillExperienceCard experience={ciCdExperience} />);

    expect(screen.queryByText('Role')).toBeNull();
    expect(screen.queryByText('Platform engineer')).toBeNull();
    expect(screen.queryByText('Environments')).toBeNull();
    expect(screen.queryByText('Staging')).toBeNull();
    expect(screen.queryByText('Production')).toBeNull();
  });

  it('labels relevant skill tokens without metadata chrome', () => {
    render(
      <SkillExperienceCard
        experience={ciCdExperience}
        relevantSkillLabels={['AWS CodePipeline', 'AWS CodeBuild']}
      />,
    );

    const relevantSkills = screen.getByRole('list', {
      name: 'Relevant skills',
    });

    expect(screen.getByText('Relevant skills')).toBeTruthy();
    expect(screen.getAllByText('Relevant skills')).toHaveLength(1);
    expect(within(relevantSkills).getByText('AWS CodePipeline')).toBeTruthy();
    expect(within(relevantSkills).getByText('AWS CodeBuild')).toBeTruthy();
    expect(
      screen.queryByText('AWS CodePipeline', { selector: 'dt' }),
    ).toBeNull();
  });

  it('matches the DORA capability card label and row spacing pattern', () => {
    render(
      <SkillExperienceCard
        experience={ciCdExperience}
        relevantSkillLabels={['AWS CodePipeline', 'AWS CodeBuild']}
      />,
    );

    const label = screen.getByText('Relevant skills');
    const row = screen.getByRole('list', { name: 'Relevant skills' });
    const card = label.closest('.astryx-card');

    expect(card).not.toBeNull();
    expect(label.className).toContain('supporting');
    expect(label.getAttribute('data-type')).toBe('supporting');
    expect(label.getAttribute('data-color')).toBe('secondary');
    expect(row.getAttribute('data-wrap')).toBe('true');
    expect(row.className).not.toContain('gap-1');
  });
});

describe('SkillExperienceCardList', () => {
  it('renders each experience as a titled Astryx Card narrative', () => {
    render(
      <SkillExperienceCardList
        experiences={[ciCdExperience]}
        skills={ciCdSkills}
      />,
    );

    const list = screen.getByRole('list', { name: 'Skill experience' });
    const item = list.firstElementChild as HTMLElement;
    const card = item.querySelector('.astryx-card');

    expect(card).not.toBeNull();
    expect(
      within(item).getByRole('heading', {
        level: 3,
        name: 'Multi-stage AWS CI/CD delivery pipeline',
      }),
    ).toBeTruthy();
    expect(within(item).getByText(ciCdExperience.summary)).toBeTruthy();
    expect(within(item).getByText(ciCdExperience.narrative[0])).toBeTruthy();
    expect(within(item).getByText(ciCdExperience.narrative[1])).toBeTruthy();
  });

  it('resolves relevant skill tokens without nested cards', () => {
    render(
      <SkillExperienceCardList
        experiences={[
          {
            ...ciCdExperience,
            skillIds: ['aws-codepipeline', 'missing-skill'],
          },
        ]}
        skills={ciCdSkills}
      />,
    );

    const list = screen.getByRole('list', { name: 'Skill experience' });
    const item = list.firstElementChild as HTMLElement;
    const relevantSkills = within(item).getByRole('list', {
      name: 'Relevant skills',
    });

    expect(within(item).getByText('Relevant skills')).toBeTruthy();
    expect(within(relevantSkills).getByText('AWS CodePipeline')).toBeTruthy();
    expect(within(relevantSkills).queryByText('AWS CodeBuild')).toBeNull();
    expect(within(item).queryByText('Terraform')).toBeNull();
    expect(item.querySelectorAll('.astryx-card')).toHaveLength(1);
  });

  it('links resolved relevant skill tokens to their detail pages', () => {
    render(
      <SkillExperienceCardList
        experiences={[
          {
            ...ciCdExperience,
            skillIds: ['aws-codepipeline', 'aws-codebuild'],
          },
        ]}
        skills={ciCdSkills}
      />,
    );

    const relevantSkills = screen.getByRole('list', {
      name: 'Relevant skills',
    });
    const tokens = within(relevantSkills).getAllByTestId('skill-token');
    const links = within(relevantSkills).getAllByRole('link');

    expect(tokens).toHaveLength(2);
    expect(tokens.every((token) => token.getAttribute('style') === null)).toBe(
      true,
    );
    expect(links.map((link) => link.getAttribute('href'))).toEqual([
      '/skills/aws-codepipeline',
      '/skills/aws-codebuild',
    ]);
  });
});
