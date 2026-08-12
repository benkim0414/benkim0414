import type { Meta, StoryObj } from '@storybook/react-vite';

import { ProjectCard } from './project-card';
import { sampleProjects } from './project-list.data';
import type { Project } from './project-list.types';

const baseProject = sampleProjects[0];
const homelabProject = sampleProjects.find(
  (project) => project.id === 'homelab',
);

if (!homelabProject) {
  throw new Error('Homelab project fixture is required for its visual story.');
}

const manySkillsProject: Project = {
  ...baseProject,
  skills: [
    ...baseProject.skills,
    { label: 'Docker' },
    { label: 'Kubernetes' },
    { label: 'Terraform' },
    { label: 'Prometheus' },
  ],
};

const longCopyProject: Project = {
  ...baseProject,
  id: 'observability-delivery-project',
  title: 'Platform observability and delivery evidence workspace',
  description:
    'A compact public project surface that connects delivery automation, cloud infrastructure, observability, and certification evidence into a scannable engineering portfolio.',
  skills: [
    { label: 'React' },
    { label: 'TypeScript' },
    { label: 'GitHub Actions' },
    { label: 'Prometheus' },
    { label: 'Grafana' },
  ],
};

const meta: Meta<typeof ProjectCard> = {
  component: ProjectCard,
  title: 'GitHub.io/Projects/Project Card',
};

export default meta;
type Story = StoryObj<typeof ProjectCard>;

export const Default: Story = {
  args: {
    project: baseProject,
  },
};

export const Homelab: Story = {
  args: {
    project: homelabProject,
  },
};

export const ManySkills: Story = {
  args: {
    project: manySkillsProject,
  },
};

export const LongCopy: Story = {
  args: {
    project: longCopyProject,
  },
};

export const FullWidth: Story = {
  args: {
    isFullWidth: true,
    project: baseProject,
  },
  parameters: {
    viewport: {
      defaultViewport: 'mobile1',
    },
  },
};
