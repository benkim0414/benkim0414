import type { Meta, StoryObj } from '@storybook/react-vite';

import {
  devOpsCapabilityEvidenceItems,
  doraCapabilityDefinitions,
} from './devops-capability-evidence.data';
import { DevOpsCertificationCapabilityMap } from './devops-certification-capability-map';

const meta = {
  title: 'GitHub.io/DevOps Capability Evidence/Certification Map',
  component: DevOpsCertificationCapabilityMap,
  args: {
    capabilities: doraCapabilityDefinitions,
    evidence: devOpsCapabilityEvidenceItems,
  },
} satisfies Meta<typeof DevOpsCertificationCapabilityMap>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const Empty: Story = { args: { evidence: [] } };
