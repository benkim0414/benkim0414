import type { Meta, StoryObj } from '@storybook/react-vite';

import { HomeGreeting } from './home-greeting';

const meta: Meta<typeof HomeGreeting> = {
  component: HomeGreeting,
  parameters: {
    layout: 'fullscreen',
  },
  title: 'GitHub.io/Home/Home Greeting',
};

export default meta;
type Story = StoryObj<typeof HomeGreeting>;

export const Default: Story = {
  args: {
    isPreview: true,
  },
};
