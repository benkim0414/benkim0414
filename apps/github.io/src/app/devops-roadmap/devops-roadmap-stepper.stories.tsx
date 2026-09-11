import type { Meta, StoryObj } from '@storybook/react-vite';

import { devOpsRoadmapSkillInventoryNodes } from './devops-roadmap-skill-inventory.data';
import { DevOpsRoadmapStepper } from './devops-roadmap-stepper';

const meta = {
  title: 'Components/DevOps Roadmap/Stepper',
  component: DevOpsRoadmapStepper,
  parameters: { layout: 'padded' },
  tags: ['autodocs'],
} satisfies Meta<typeof DevOpsRoadmapStepper>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const RepresentativeStates: Story = {
  args: {
    items: devOpsRoadmapSkillInventoryNodes.filter(({ id }) =>
      [
        'container-orchestration',
        'artifact-management',
        'cloud-design-patterns',
      ].includes(id),
    ),
    label: 'Representative DevOps roadmap states',
  },
};
