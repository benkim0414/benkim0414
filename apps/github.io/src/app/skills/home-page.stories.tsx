import type { Meta, StoryObj } from '@storybook/react-vite';

import { HomePage } from './home-page';

const meta: Meta<typeof HomePage> = {
  component: HomePage,
  parameters: {
    layout: 'fullscreen',
  },
  title: 'Components/Skills/Home Page',
};

export default meta;
type Story = StoryObj<typeof HomePage>;

export const Default: Story = {};

export const Empty: Story = {
  args: {
    highlightedSkills: [],
  },
};
