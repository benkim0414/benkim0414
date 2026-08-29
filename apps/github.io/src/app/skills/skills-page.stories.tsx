import type { Meta, StoryObj } from '@storybook/react-vite';

import { SkillsPage } from './skills-page';

const meta: Meta<typeof SkillsPage> = {
  component: SkillsPage,
  parameters: {
    layout: 'fullscreen',
  },
  title: 'GitHub.io/Skills/Skills Page',
};

export default meta;
type Story = StoryObj<typeof SkillsPage>;

export const Default: Story = {};

export const Empty: Story = {
  args: {
    skills: [],
  },
};

export const FilterControlsOpen: Story = {
  play: async ({ canvasElement }) => {
    const filterButton = canvasElement.querySelector<HTMLButtonElement>(
      'button[aria-label="Filter skills"]',
    );

    if (!filterButton) {
      throw new Error('Expected the Skills filter button to render.');
    }

    filterButton.click();
  },
};
