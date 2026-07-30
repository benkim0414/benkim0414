import type { Meta, StoryObj } from '@storybook/react-vite';

import { DoraCapabilityCard } from './dora-capability-card';
import { doraCapabilityDescriptions } from './dora-capability-card.evidence';
import {
  curatedDevOpsCapabilityRadarScores,
  devOpsCapabilityEvidenceItems,
  doraCapabilityDefinitions,
} from './devops-capability-evidence.data';
import type {
  DoraCapabilityDefinition,
  DoraCapabilityKey,
} from './devops-capability-evidence.types';

function capability(key: DoraCapabilityKey): DoraCapabilityDefinition {
  const definition = doraCapabilityDefinitions.find(
    (entry) => entry.key === key,
  );

  if (!definition) {
    throw new Error(`Missing DORA capability definition: ${key}`);
  }

  return definition;
}

const flexibleInfrastructure = capability('flexible-infrastructure');
const continuousIntegration = capability('continuous-integration');
const monitoringObservability = capability('monitoring-observability');
const documentationQuality = capability('documentation-quality');

const meta = {
  component: DoraCapabilityCard,
  title: 'GitHub.io/DevOps Capability Evidence/DORA Capability Card',
  args: {
    capability: flexibleInfrastructure,
    description: doraCapabilityDescriptions['flexible-infrastructure'],
    evidence: devOpsCapabilityEvidenceItems,
    scores: curatedDevOpsCapabilityRadarScores,
  },
  parameters: {
    layout: 'centered',
  },
} satisfies Meta<typeof DoraCapabilityCard>;

export default meta;

type Story = StoryObj<typeof meta>;

export const FlexibleInfrastructure: Story = {};

export const ContinuousIntegration: Story = {
  args: {
    capability: continuousIntegration,
    description: doraCapabilityDescriptions['continuous-integration'],
  },
};

export const MonitoringAndObservability: Story = {
  args: {
    capability: monitoringObservability,
    description: doraCapabilityDescriptions['monitoring-observability'],
  },
};

export const DocumentationQuality: Story = {
  args: {
    capability: documentationQuality,
    description: doraCapabilityDescriptions['documentation-quality'],
  },
};

export const WrappingStress: Story = {
  args: {
    capability: flexibleInfrastructure,
    description: doraCapabilityDescriptions['flexible-infrastructure'],
    evidence: [
      ...devOpsCapabilityEvidenceItems,
      {
        id: 'storybook-extra-platform-automation',
        title: 'Platform automation review practice',
        label: 'Platform automation',
        type: 'experience',
        organization: 'Storybook fixture',
        capabilityKeys: ['flexible-infrastructure'],
        summary:
          'Storybook-only evidence item that creates a wider wrapping row for visual review.',
        technologies: ['Kubernetes', 'Terraform'],
        isPublic: true,
        strength: 'supporting',
      },
    ],
    scores: undefined,
  },
};
