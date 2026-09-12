import type { Meta, StoryObj } from '@storybook/react-vite';

import { skills } from './skill-list.data';
import { SkillTable } from './skill-table';

const meta: Meta<typeof SkillTable> = {
  component: SkillTable,
  title: 'Components/Skills/Skill Table',
};

export default meta;
type Story = StoryObj<typeof SkillTable>;

export const AllSkills: Story = {
  args: {
    skills,
  },
};

export const FilterControlsOpen: Story = {
  args: {
    skills,
  },
  play: async ({ canvasElement }) => {
    const categorySelector = canvasElement.querySelector<HTMLButtonElement>(
      'button[role="combobox"]',
    );

    if (!categorySelector) {
      throw new Error('Expected the category selector to render.');
    }

    categorySelector.click();
  },
};
