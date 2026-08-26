import { render, screen, within } from '@testing-library/react';

import type { Experience } from '../experience/experience.types';
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

describe('SkillExperienceCard', () => {
  it('renders experience text through Astryx typography components', () => {
    render(<SkillExperienceCard experience={ciCdExperience} />);

    const card = screen
      .getByRole('heading', {
        level: 3,
        name: 'Multi-stage AWS CI/CD delivery pipeline',
      })
      .closest('.astryx-card');

    expect(card).not.toBeNull();
    expect(card?.querySelectorAll('.astryx-text')).toHaveLength(4);
    expect(
      within(card as HTMLElement).getByText('Platform engineer').className,
    ).toContain('astryx-text');
  });
});

describe('SkillExperienceCardList', () => {
  it('renders each experience as a titled Astryx Card narrative', () => {
    render(<SkillExperienceCardList experiences={[ciCdExperience]} />);

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

  it('renders metadata and technology tokens without nested cards', () => {
    render(<SkillExperienceCardList experiences={[ciCdExperience]} />);

    const list = screen.getByRole('list', { name: 'Skill experience' });
    const item = list.firstElementChild as HTMLElement;

    expect(within(item).getByText('Role')).toBeTruthy();
    expect(within(item).getByText('Platform engineer')).toBeTruthy();
    expect(within(item).getByText('Environments')).toBeTruthy();
    expect(within(item).getByText('Staging')).toBeTruthy();
    expect(within(item).getByText('Production')).toBeTruthy();
    expect(within(item).getByText('AWS CodePipeline')).toBeTruthy();
    expect(within(item).getByText('AWS CodeBuild')).toBeTruthy();
    expect(item.querySelectorAll('.astryx-card')).toHaveLength(1);
  });
});
