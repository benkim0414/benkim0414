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
const deploymentAutomation = capability('deployment-automation');
const continuousIntegration = capability('continuous-integration');
const continuousDelivery = capability('continuous-delivery');
const testAutomation = capability('test-automation');
const monitoringObservability = capability('monitoring-observability');
const pervasiveSecurity = capability('pervasive-security');
const documentationQuality = capability('documentation-quality');
const versionControl = capability('version-control');
const trunkBasedDevelopment = capability('trunk-based-development');

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

export const DeploymentAutomation: Story = {
  args: {
    capability: deploymentAutomation,
    description: doraCapabilityDescriptions['deployment-automation'],
  },
};

export const ContinuousIntegration: Story = {
  args: {
    capability: continuousIntegration,
    description: doraCapabilityDescriptions['continuous-integration'],
  },
};

export const ContinuousDelivery: Story = {
  args: {
    capability: continuousDelivery,
    description: doraCapabilityDescriptions['continuous-delivery'],
  },
};

export const TestAutomation: Story = {
  args: {
    capability: testAutomation,
    description: doraCapabilityDescriptions['test-automation'],
  },
};

export const MonitoringAndObservability: Story = {
  args: {
    capability: monitoringObservability,
    description: doraCapabilityDescriptions['monitoring-observability'],
  },
};

export const PervasiveSecurity: Story = {
  args: {
    capability: pervasiveSecurity,
    description: doraCapabilityDescriptions['pervasive-security'],
  },
};

export const DocumentationQuality: Story = {
  args: {
    capability: documentationQuality,
    description: doraCapabilityDescriptions['documentation-quality'],
  },
};

export const VersionControl: Story = {
  args: {
    capability: versionControl,
    description: doraCapabilityDescriptions['version-control'],
  },
};

export const TrunkBasedDevelopment: Story = {
  args: {
    capability: trunkBasedDevelopment,
    description: doraCapabilityDescriptions['trunk-based-development'],
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
