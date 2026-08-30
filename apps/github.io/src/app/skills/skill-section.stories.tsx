import type { Meta, StoryObj } from '@storybook/react-vite';

import { sampleSkills } from './skill-list.data';
import { SkillSection } from './skill-section';

const meta: Meta<typeof SkillSection> = {
  component: SkillSection,
  title: 'Components/Skills/Skill Section',
};

export default meta;
type Story = StoryObj<typeof SkillSection>;

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

export const EmptyWithCustomCopy: Story = {
  args: {
    emptyMessage: 'No profile skills yet.',
    heading: 'Skills',
    skills: [],
  },
};
