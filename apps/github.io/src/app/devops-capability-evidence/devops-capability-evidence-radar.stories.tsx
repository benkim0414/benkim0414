import type { Meta, StoryObj } from '@storybook/react-vite';

import {
  devOpsCapabilityEvidenceItems,
  doraCapabilityDefinitions,
} from './devops-capability-evidence.data';
import { getCapabilityEvidenceScores } from './devops-capability-evidence.scoring';
import { DevOpsCapabilityEvidenceRadar } from './devops-capability-evidence-radar';

const meta = {
  title: 'GitHub.io/DevOps Capability Evidence/Radar',
  component: DevOpsCapabilityEvidenceRadar,
  args: {
    scores: getCapabilityEvidenceScores(
      devOpsCapabilityEvidenceItems,
      doraCapabilityDefinitions,
    ),
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
