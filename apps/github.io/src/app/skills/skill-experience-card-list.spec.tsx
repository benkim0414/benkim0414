import { render, screen, within } from '@testing-library/react';

import type { Experience } from '../experience/experience.types';
import { SkillExperienceCardList } from './skill-experience-card-list';

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

describe('SkillExperienceCardList', () => {
  it('renders each experience as a titled Astryx Card narrative', () => {
    render(<SkillExperienceCardList experiences={[ciCdExperience]} />);

    const list = screen.getByRole('list', { name: 'Skill experience' });
    const item = within(list).getByRole('listitem');
    const card = item.querySelector('.astryx-card');

    expect(card).not.toBeNull();
    expect(
      within(item).getByRole('heading', {
        level: 3,
        name: 'Multi-stage AWS CI/CD delivery pipeline',
      }),
    ).toBeInTheDocument();
    expect(within(item).getByText(ciCdExperience.summary)).toBeInTheDocument();
    expect(within(item).getByText(ciCdExperience.narrative[0])).toBeInTheDocument();
    expect(within(item).getByText(ciCdExperience.narrative[1])).toBeInTheDocument();
  });

  it('renders metadata and technology tokens without nested cards', () => {
    render(<SkillExperienceCardList experiences={[ciCdExperience]} />);

    const item = screen.getByRole('listitem');

    expect(within(item).getByText('Role')).toBeInTheDocument();
    expect(within(item).getByText('Platform engineer')).toBeInTheDocument();
    expect(within(item).getByText('Environments')).toBeInTheDocument();
    expect(within(item).getByText('Staging')).toBeInTheDocument();
    expect(within(item).getByText('Production')).toBeInTheDocument();
    expect(within(item).getByText('AWS CodePipeline')).toBeInTheDocument();
    expect(within(item).getByText('AWS CodeBuild')).toBeInTheDocument();
    expect(item.querySelectorAll('.astryx-card')).toHaveLength(1);
  });
});
