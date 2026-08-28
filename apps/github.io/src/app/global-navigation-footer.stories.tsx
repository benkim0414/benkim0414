import type { Meta, StoryObj } from '@storybook/react-vite';

import { GlobalNavigationFooter } from './global-navigation-footer';

const meta = {
  component: GlobalNavigationFooter,
  parameters: { layout: 'fullscreen' },
  title: 'GitHub.io/Navigation/Footer',
} satisfies Meta<typeof GlobalNavigationFooter>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
