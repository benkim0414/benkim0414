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

export const TextTooltipOpen: Story = {
  args: {
    confidence: 4,
    isTooltipOpen: true,
  },
};

export const Token: Story = {
  args: {
    confidence: 4,
    variant: 'token',
  },
};

export const TokenTooltipOpen: Story = {
  args: {
    confidence: 4,
    isTooltipOpen: true,
    variant: 'token',
  },
};
