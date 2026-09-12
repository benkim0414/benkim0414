import type { Meta, StoryObj } from '@storybook/react-vite';

import { devOpsCapabilityEvidenceItems } from '../devops-capability-evidence/devops-capability-evidence.data';
import type { CapabilityEvidenceItem } from '../devops-capability-evidence/devops-capability-evidence.types';
import { SkillExperienceList } from './skill-experience-list';
import { skills } from './skill-list.data';

const meta: Meta<typeof SkillExperienceList> = {
  title: 'Components/Skills/Skill Experience List',
  component: SkillExperienceList,
};

export default meta;

type Story = StoryObj<typeof SkillExperienceList>;

const deploymentExperience = devOpsCapabilityEvidenceItems.find(
  (item) => item.id === 'github-actions-gitops-handoff',
);

if (!deploymentExperience?.details) {
  throw new Error('Expected the deployment experience fixture.');
}

const multiFactExperience: CapabilityEvidenceItem = {
  ...deploymentExperience,
  details: {
    ...deploymentExperience.details,
    facts: [
      ...deploymentExperience.details.facts,
      'Kept deployment manifests reviewable before rollout.',
      'Carried the same versioned configuration into Argo CD reconciliation.',
    ],
  },
};

export const MultipleKeyOutcomes: Story = {
  args: {
    evidence: [multiFactExperience],
    skills,
  },
};
