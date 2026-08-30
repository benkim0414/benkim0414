import type { Meta, StoryObj } from '@storybook/react-vite';

import { experiences } from '../experience/experience.data';
import { SkillExperienceCard } from './skill-experience-card-list';
import { skills } from './skill-list.data';

const meta: Meta<typeof SkillExperienceCard> = {
  title: 'Components/Skills/Skill Experience Card',
  component: SkillExperienceCard,
};

export default meta;

type Story = StoryObj<typeof SkillExperienceCard>;

export const AwsCiCdPipeline: Story = {
  args: {
    experience: experiences[0],
    relevantSkillLabels: getRelevantSkillLabels(experiences[0].skillIds),
  },
};

export const LongWrappingNarrative: Story = {
  args: {
    experience: {
      ...experiences[0],
      title:
        'Multi-stage AWS CI/CD delivery pipeline with intentionally long wrapping title',
    },
    relevantSkillLabels: [
      ...getRelevantSkillLabels(experiences[0].skillIds),
      'Environment promotion',
      'Build validation',
      'Release automation',
    ],
  },
};

function getRelevantSkillLabels(
  skillIds: readonly string[],
): readonly string[] {
  const skillById = new Map(skills.map((skill) => [skill.id, skill.name]));

  return skillIds
    .map((skillId) => skillById.get(skillId))
    .filter((skillLabel): skillLabel is string => Boolean(skillLabel));
}
