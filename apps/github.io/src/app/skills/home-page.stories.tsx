import type { Meta, StoryObj } from '@storybook/react-vite';

import { HomePage } from './home-page';
import { highlightedSkills, skills } from './skill-list.data';

const meta: Meta<typeof HomePage> = {
  component: HomePage,
  parameters: {
    layout: 'fullscreen',
  },
  title: 'GitHub.io/Home/Home Page',
};

export default meta;
type Story = StoryObj<typeof HomePage>;

export const Default: Story = {};

export const SingleSearchSkill: Story = {
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
