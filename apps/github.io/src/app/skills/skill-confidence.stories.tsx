import type { Meta, StoryObj } from '@storybook/react-vite';

import { SkillConfidence } from './skill-confidence';

const meta: Meta<typeof SkillConfidence> = {
  component: SkillConfidence,
  title: 'GitHub.io/Skills/Skill Confidence',
};

export default meta;
type Story = StoryObj<typeof SkillConfidence>;

export const Proven: Story = {
  args: {
    confidence: 5,
  },
};

export const Working: Story = {
  args: {
    confidence: 3,
  },
};
