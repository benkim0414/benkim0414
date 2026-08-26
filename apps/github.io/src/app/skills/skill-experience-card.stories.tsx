import type { Meta, StoryObj } from '@storybook/react-vite';

import { experiences } from '../experience/experience.data';
import { SkillExperienceCard } from './skill-experience-card-list';

const meta: Meta<typeof SkillExperienceCard> = {
  title: 'github.io/skills/SkillExperienceCard',
  component: SkillExperienceCard,
};

export default meta;

type Story = StoryObj<typeof SkillExperienceCard>;

export const AwsCiCdPipeline: Story = {
  args: {
    experience: experiences[0],
  },
};

export const LongWrappingNarrative: Story = {
  args: {
    experience: {
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
  },
};
