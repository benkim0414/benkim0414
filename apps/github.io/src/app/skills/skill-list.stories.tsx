import type { Meta, StoryObj } from '@storybook/react-vite';

import { sampleSkills } from './skill-list.data';
import { SkillList } from './skill-list';

const meta: Meta<typeof SkillList> = {
  component: SkillList,
  title: 'GitHub.io/Skills/Skill List',
};

export default meta;
type Story = StoryObj<typeof SkillList>;

export const Default: Story = {
  args: {
    heading: 'Skills',
    skills: sampleSkills,
  },
};

export const Empty: Story = {
  args: {
    heading: 'Skills',
    skills: [],
  },
};

export const FocusedResults: Story = {
  args: {
    heading: 'Infrastructure Skills',
    skills: sampleSkills.filter((skill) =>
      ['Cloud', 'Container', 'CI/CD', 'IaC'].includes(skill.category),
    ),
  },
};
