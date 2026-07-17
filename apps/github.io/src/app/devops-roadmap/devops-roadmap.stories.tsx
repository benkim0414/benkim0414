import type { Meta, StoryObj } from '@storybook/react-vite';

import { DevOpsRoadmap } from './devops-roadmap';
import type { DevOpsRoadmapItem } from './devops-roadmap.types';

const compactItems: readonly DevOpsRoadmapItem[] = [
  { id: 'language', title: 'Learn a Programming Language', skills: ['Python', 'Go'] },
  { id: 'containers', title: 'Containers', skills: ['Docker'] },
  { id: 'provisioning', title: 'Provisioning', skills: ['Terraform'] },
];

const meta: Meta<typeof DevOpsRoadmap> = {
  component: DevOpsRoadmap,
  title: 'GitHub.io/DevOps Roadmap/Timeline',
};

export default meta;
type Story = StoryObj<typeof DevOpsRoadmap>;

export const Default: Story = {};

export const CompactFixture: Story = {
  args: {
    items: compactItems,
    heading: 'DevOps Roadmap Fixture',
  },
};

export const HiddenHeading: Story = {
  args: {
    items: compactItems,
    heading: 'DevOps Roadmap',
    isHeadingHidden: true,
  },
};

export const Reversed: Story = {
  args: {
    isReversed: true,
  },
};
