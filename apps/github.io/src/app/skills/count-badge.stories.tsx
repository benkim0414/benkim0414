import type { Meta, StoryObj } from '@storybook/react-vite';

import { CountBadge } from './count-badge';

const meta: Meta<typeof CountBadge> = {
  component: CountBadge,
  title: 'Components/Skills/Count Badge',
};

export default meta;
type Story = StoryObj<typeof CountBadge>;

export const Default: Story = {
  args: {
    count: 3,
  },
};

export const Zero: Story = {
  args: {
    count: 0,
  },
};
