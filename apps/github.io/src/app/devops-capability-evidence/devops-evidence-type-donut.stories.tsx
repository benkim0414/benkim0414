import type { Meta, StoryObj } from '@storybook/react-vite';

import {
  devOpsCapabilityEvidenceItems,
  evidenceTypeLabels,
} from './devops-capability-evidence.data';
import { getEvidenceTypeCounts } from './devops-capability-evidence.scoring';
import { DevOpsEvidenceTypeDonut } from './devops-evidence-type-donut';

const meta = {
  title: 'GitHub.io/DevOps Capability Evidence/Evidence Type Donut',
  component: DevOpsEvidenceTypeDonut,
  args: {
    counts: getEvidenceTypeCounts(devOpsCapabilityEvidenceItems),
    evidenceTypeLabels,
  },
} satisfies Meta<typeof DevOpsEvidenceTypeDonut>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const Empty: Story = { args: { counts: {} } };
