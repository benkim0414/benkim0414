import { render, screen, within } from '@testing-library/react';

import type { Experience } from '../experience/experience.types';
import type { Skill } from './skill-list.types';
import {
  SkillExperienceCard,
  SkillExperienceCardList,
} from './skill-experience-card-list';

const ciCdExperience: Experience = {
  id: 'aws-codepipeline-codebuild-multistage-delivery',
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
    level: 4,
    iconSlug: 'aws-codepipeline',
    keywords: [],
  },
  {
    id: 'aws-codebuild',
    name: 'AWS CodeBuild',
    description: 'Build automation.',
    categories: ['CI/CD'],
    level: 4,
    iconSlug: 'aws-codebuild',
    keywords: [],
  },
];

describe('SkillExperienceCard', () => {
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
    expect(card?.querySelectorAll('.astryx-text')).toHaveLength(4);
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
});
