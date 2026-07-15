import type { Meta, StoryObj } from '@storybook/react-vite';

import { SkillRating } from './skill-rating';

const meta: Meta<typeof SkillRating> = {
  component: SkillRating,
  title: 'GitHub.io/Skills/Skill Rating',
};

export default meta;
type Story = StoryObj<typeof SkillRating>;

export const Expert: Story = {
  args: {
    level: 5,
  },
};

export const Intermediate: Story = {
  args: {
    level: 3,
  },
};
