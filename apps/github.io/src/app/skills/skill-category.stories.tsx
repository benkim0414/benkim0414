import type { Meta, StoryObj } from '@storybook/react-vite';

import { SkillCategory } from './skill-category';

const meta: Meta<typeof SkillCategory> = {
  component: SkillCategory,
  title: 'Components/Skills/Skill Category',
};

export default meta;
type Story = StoryObj<typeof SkillCategory>;

export const Default: Story = {
  args: {
    name: 'Cloud',
  },
};

export const Language: Story = {
  args: {
    name: 'Language',
  },
};

export const InfrastructureAsCode: Story = {
  args: {
    name: 'IaC',
  },
};
