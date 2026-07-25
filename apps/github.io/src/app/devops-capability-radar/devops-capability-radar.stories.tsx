import type { Meta, StoryObj } from '@storybook/react-vite';

import { DevOpsCapabilityRadar } from './devops-capability-radar';

const meta: Meta<typeof DevOpsCapabilityRadar> = {
  component: DevOpsCapabilityRadar,
  parameters: {
    layout: 'centered',
  },
  title: 'GitHub.io/DevOps Capability Radar',
};

export default meta;
type Story = StoryObj<typeof DevOpsCapabilityRadar>;

export const Default: Story = {};
