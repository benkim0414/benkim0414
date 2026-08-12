import type { Meta, StoryObj } from '@storybook/react-vite';

import { devOpsCapabilityEvidenceItems } from '../devops-capability-evidence/devops-capability-evidence.data';
import { sampleProjects } from '../projects/project-list.data';
import { skillDetailRecords } from './skill-detail.data';
import { SkillDetailPage } from './skill-detail-page';
import { resolveSkillDetail } from './skill-detail-resolver';
import { skills } from './skill-list.data';

const productionSources = {
  skills,
  detailRecords: skillDetailRecords,
  evidenceItems: devOpsCapabilityEvidenceItems,
  projects: sampleProjects,
};
const kubernetesResolution = resolveSkillDetail('kubernetes', productionSources);
const reactResolution = resolveSkillDetail('react', productionSources);

if (kubernetesResolution.status !== 'found') {
  throw new Error('Kubernetes skill detail must resolve for Storybook.');
}

if (reactResolution.status !== 'found') {
  throw new Error('React skill detail must resolve for Storybook.');
}

const meta: Meta<typeof SkillDetailPage> = {
  component: SkillDetailPage,
  parameters: {
    layout: 'fullscreen',
  },
  title: 'GitHub.io/Skills/Skill Detail Page',
};

export default meta;
type Story = StoryObj<typeof SkillDetailPage>;

export const EnrichedKubernetes: Story = {
  args: {
    detail: kubernetesResolution.value,
  },
  parameters: {
    viewport: {
      defaultViewport: 'responsive',
    },
  },
};

export const BasicSkill: Story = {
  args: {
    detail: reactResolution.value,
  },
};
