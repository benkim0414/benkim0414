import type { Meta, StoryObj } from '@storybook/react-vite';

import { RoadmapPage } from './roadmap-page';

const meta: Meta<typeof RoadmapPage> = {
  component: RoadmapPage,
  parameters: {
    layout: 'fullscreen',
  },
  title: 'Components/DevOps Roadmap/Roadmap Page',
};

export default meta;
type Story = StoryObj<typeof RoadmapPage>;

export const Default: Story = {};
