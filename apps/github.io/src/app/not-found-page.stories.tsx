import type { Meta, StoryObj } from '@storybook/react-vite';

import { NotFoundPage } from './not-found-page';

const meta: Meta<typeof NotFoundPage> = {
  component: NotFoundPage,
  parameters: {
    layout: 'fullscreen',
  },
  title: 'Components/Pages/Not Found Page',
};

export default meta;
type Story = StoryObj<typeof NotFoundPage>;

export const Default: Story = {};
