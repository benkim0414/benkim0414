import type { Meta, StoryObj } from '@storybook/react-vite';
import { Theme } from '@astryxdesign/core';
import { neutralTheme } from '@astryxdesign/theme-neutral/built';

import { sampleSkills, skills } from './skill-list.data';
import { SkillAvatar } from './skill-avatar';

const meta: Meta<typeof SkillAvatar> = {
  component: SkillAvatar,
  title: 'Components/Skills/Skill Avatar',
};

export default meta;
type Story = StoryObj<typeof SkillAvatar>;

export const Logo: Story = {
  args: {
    skill: sampleSkills[0],
  },
};

const github = skills.find((skill) => skill.id === 'github')!;

export const GitHubDark: Story = {
  args: { skill: github },
  render: (args) => (
    <Theme mode="dark" theme={neutralTheme}>
      <SkillAvatar {...args} />
    </Theme>
  ),
};

export const GitHubLight: Story = {
  args: { skill: github },
  render: (args) => (
    <Theme mode="light" theme={neutralTheme}>
      <SkillAvatar {...args} />
    </Theme>
  ),
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
