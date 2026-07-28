import type { Meta, StoryObj } from '@storybook/react-vite';

import { sampleSkills } from './skill-list.data';
import { SkillCarousel } from './skill-carousel';

const meta: Meta<typeof SkillCarousel> = {
  component: SkillCarousel,
  title: 'GitHub.io/Skills/Skill Carousel',
};

export default meta;
type Story = StoryObj<typeof SkillCarousel>;

export const Default: Story = {
  args: {
    skills: sampleSkills,
  },
};

export const Empty: Story = {
  args: {
    skills: [],
  },
};
