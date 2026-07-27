import type { Meta, StoryObj } from '@storybook/react-vite';

import {
  devOpsCapabilityEvidenceItems,
  doraCapabilityDefinitions,
} from './devops-capability-evidence.data';
import { getCapabilityEvidenceScores } from './devops-capability-evidence.scoring';
import { DevOpsCapabilityBarList } from './devops-capability-bar-list';

const meta = {
  title: 'GitHub.io/DevOps Capability Evidence/Bar List',
  component: DevOpsCapabilityBarList,
  args: {
    evidence: devOpsCapabilityEvidenceItems,
    scores: getCapabilityEvidenceScores(
      devOpsCapabilityEvidenceItems,
      doraCapabilityDefinitions,
    ),
  },
} satisfies Meta<typeof DevOpsCapabilityBarList>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const Empty: Story = { args: { scores: [] } };
