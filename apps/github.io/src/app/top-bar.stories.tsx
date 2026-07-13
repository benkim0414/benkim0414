import type { Meta, StoryObj } from '@storybook/react-vite';

import { TopBar } from './top-bar';

const meta: Meta<typeof TopBar> = {
  component: TopBar,
  title: 'GitHub.io/App Shell/Top Bar',
};

export default meta;
type Story = StoryObj<typeof TopBar>;

export const Default: Story = {
  args: {
    brandLabel: 'App Shell',
    navItems: [
      { label: 'Overview', href: '#overview' },
      { label: 'Work', href: '#work' },
      { label: 'Notes', href: '#notes' },
    ],
  },
};
