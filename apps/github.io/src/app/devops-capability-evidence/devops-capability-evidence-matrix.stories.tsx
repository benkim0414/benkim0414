import type { Meta, StoryObj } from '@storybook/react-vite';

import {
  devOpsCapabilityEvidenceItems,
  doraCapabilityDefinitions,
  evidenceTypeLabels,
} from './devops-capability-evidence.data';
import { getCapabilityEvidenceMatrix } from './devops-capability-evidence.scoring';
import { DevOpsCapabilityEvidenceMatrix } from './devops-capability-evidence-matrix';

const meta = {
  title: 'GitHub.io/DevOps Capability Evidence/Matrix',
  component: DevOpsCapabilityEvidenceMatrix,
  args: {
    evidenceTypeLabels,
    rows: getCapabilityEvidenceMatrix(
      devOpsCapabilityEvidenceItems,
      doraCapabilityDefinitions,
    ),
  },
} satisfies Meta<typeof DevOpsCapabilityEvidenceMatrix>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const Empty: Story = { args: { rows: [] } };
