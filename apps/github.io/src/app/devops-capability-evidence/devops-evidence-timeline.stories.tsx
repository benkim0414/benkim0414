import type { Meta, StoryObj } from '@storybook/react-vite';

import {
  devOpsCapabilityEvidenceItems,
  evidenceTypeLabels,
} from './devops-capability-evidence.data';
import { DevOpsEvidenceTimeline } from './devops-evidence-timeline';

const meta = {
  title: 'GitHub.io/DevOps Capability Evidence/Timeline',
  component: DevOpsEvidenceTimeline,
  args: {
    evidence: devOpsCapabilityEvidenceItems,
    evidenceTypeLabels,
  },
} satisfies Meta<typeof DevOpsEvidenceTimeline>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const Empty: Story = { args: { evidence: [] } };
