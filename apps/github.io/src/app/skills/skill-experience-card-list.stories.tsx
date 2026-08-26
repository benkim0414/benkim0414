import type { Meta, StoryObj } from '@storybook/react-vite';

import { experiences } from '../experience/experience.data';
import {
  SkillExperienceCard,
  SkillExperienceCardList,
} from './skill-experience-card-list';

const meta: Meta<typeof SkillExperienceCardList> = {
  title: 'github.io/skills/SkillExperienceCardList',
  component: SkillExperienceCardList,
};

export default meta;

type Story = StoryObj<typeof SkillExperienceCardList>;

export const AwsCiCdPipeline: Story = {
  args: {
    experiences,
  },
};

export const LongWrappingNarrative: Story = {
  args: {
    experiences: [
      {
        ...experiences[0],
        title:
          'Multi-stage AWS CI/CD delivery pipeline with intentionally long wrapping title',
        technologies: [
          ...experiences[0].technologies,
          'Environment promotion',
          'Build validation',
          'Release automation',
        ],
      },
    ],
  },
};

export const ExperienceCard: StoryObj<typeof SkillExperienceCard> = {
  render: (args) => <SkillExperienceCard {...args} />,
  args: {
    experience: experiences[0],
  },
};
