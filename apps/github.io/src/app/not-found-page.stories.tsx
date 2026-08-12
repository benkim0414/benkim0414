import type { Meta, StoryObj } from '@storybook/react-vite';

import { NotFoundPage } from './not-found-page';

const meta: Meta<typeof NotFoundPage> = {
  component: NotFoundPage,
  parameters: {
    layout: 'fullscreen',
  },
  title: 'GitHub.io/Pages/Not Found',
};

export default meta;
type Story = StoryObj<typeof NotFoundPage>;

export const Default: Story = {};
