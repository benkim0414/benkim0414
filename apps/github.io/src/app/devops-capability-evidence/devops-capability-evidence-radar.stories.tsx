import type { Meta, StoryObj } from '@storybook/react-vite';

import { curatedDevOpsCapabilityRadarScores } from './devops-capability-evidence.data';
import { DevOpsCapabilityEvidenceRadar } from './devops-capability-evidence-radar';

const meta = {
  title: 'Components/DevOps Capability Evidence/Radar',
  component: DevOpsCapabilityEvidenceRadar,
  args: {
    scores: curatedDevOpsCapabilityRadarScores,
  },
  parameters: {
    layout: 'centered',
  },
} satisfies Meta<typeof DevOpsCapabilityEvidenceRadar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const Empty: Story = { args: { scores: [] } };
export const NarrowViewport: Story = {
  parameters: {
    viewport: { defaultViewport: 'mobile1' },
  },
};
