import type { Meta, StoryObj } from '@storybook/react-vite';

import { MobileSkillsPage } from './mobile-skills-page';
import { highlightedSkills, skills } from './skill-list.data';

const meta: Meta<typeof MobileSkillsPage> = {
  component: MobileSkillsPage,
  parameters: {
    layout: 'fullscreen',
  },
  title: 'GitHub.io/Skills/Mobile Skills Page',
};

export default meta;
type Story = StoryObj<typeof MobileSkillsPage>;

export const Default: Story = {};

export const SingleListSkill: Story = {
  args: {
    highlightedSkills,
    skills: skills.filter((skill) => skill.id === 'react'),
  },
};

export const Empty: Story = {
  args: {
    highlightedSkills: [],
    skills: [],
  },
};
