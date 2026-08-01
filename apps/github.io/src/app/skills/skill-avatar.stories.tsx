import type { Meta, StoryObj } from '@storybook/react-vite';

import { sampleSkills } from './skill-list.data';
import { SkillAvatar } from './skill-avatar';

const meta: Meta<typeof SkillAvatar> = {
  component: SkillAvatar,
  title: 'GitHub.io/Skills/Skill Avatar',
};

export default meta;
type Story = StoryObj<typeof SkillAvatar>;

export const Logo: Story = {
  args: {
    skill: sampleSkills[0],
  },
};

export const InitialsFallback: Story = {
  args: {
    skill: {
      ...sampleSkills[0],
      iconSlug: 'missing-logo',
      name: 'Unknown Skill',
    },
  },
};

export const CardLogoTile: Story = {
  args: {
    skill: sampleSkills[0],
    variant: 'card',
  },
};

export const CardInitialsFallback: Story = {
  args: {
    skill: {
      ...sampleSkills[0],
      iconSlug: 'missing-logo',
      name: 'Unknown Skill',
    },
    variant: 'card',
  },
};
