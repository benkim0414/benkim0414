import type { Meta, StoryObj } from '@storybook/react-vite';

import { HomePage } from './home-page';

const meta: Meta<typeof HomePage> = {
  component: HomePage,
  parameters: {
    layout: 'fullscreen',
  },
  title: 'Components/Home/Home Page',
};

export default meta;
type Story = StoryObj<typeof HomePage>;

export const Default: Story = {};

export const DoraCapabilityGrid: Story = {
  globals: {
    viewport: { value: 'desktop', isRotated: false },
  },
};

export const Empty: Story = {
  args: {
    highlightedSkills: [],
  },
};
