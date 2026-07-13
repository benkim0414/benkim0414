import type { Meta, StoryObj } from '@storybook/react-vite';

import { SiteFooter } from './site-footer';

const meta: Meta<typeof SiteFooter> = {
  component: SiteFooter,
  title: 'GitHub.io/App Shell/Site Footer',
};

export default meta;
type Story = StoryObj<typeof SiteFooter>;

export const Default: Story = {
  args: {
    label: 'Footer Region',
  },
};
