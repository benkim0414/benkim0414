import type { Meta, StoryObj } from '@storybook/react-vite';

import { AppShell } from './app-shell';

const meta: Meta<typeof AppShell> = {
  component: AppShell,
  parameters: {
    layout: 'fullscreen',
  },
  title: 'GitHub.io/App Shell/Skills Page',
};

export default meta;
type Story = StoryObj<typeof AppShell>;

export const Default: Story = {};
