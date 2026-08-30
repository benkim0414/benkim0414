import type { Meta, StoryObj } from '@storybook/react-vite';

import type { Experience } from '../experience/experience.types';
import { experiences } from '../experience/experience.data';
import { SkillExperienceCardList } from './skill-experience-card-list';
import { skills } from './skill-list.data';

const meta: Meta<typeof SkillExperienceCardList> = {
  title: 'Components/Skills/Skill Experience Card List',
  component: SkillExperienceCardList,
};

export default meta;

type Story = StoryObj<typeof SkillExperienceCardList>;

const listExperiences: readonly Experience[] = [
  experiences[0],
  {
    id: 'kubernetes-gitops-runtime-operations',
    title: 'Kubernetes GitOps runtime operations',
    summary:
      'Maintained Kubernetes runtime changes through GitOps workflows with reviewed manifests, rollout visibility, and repeatable cluster reconciliation.',
    narrative: [
      'Used Kubernetes and Argo CD to keep application runtime state aligned with reviewed configuration rather than manual cluster changes.',
      'Connected deployment manifests, container images, and observability feedback so operational changes could be understood before and after rollout.',
    ],
    skillIds: ['kubernetes', 'argo-cd', 'docker', 'prometheus'],
    projectIds: ['homelab'],
    capabilityKeys: [
      'deployment-automation',
      'flexible-infrastructure',
      'monitoring-observability',
    ],
    technologies: ['Kubernetes', 'Argo CD', 'Docker', 'Prometheus'],
    isPublic: true,
  },
];

export const MultipleExperiences: Story = {
  args: {
    experiences: listExperiences,
    skills,
  },
};

export const DenseList: Story = {
  args: {
    experiences: [
      ...listExperiences,
      {
        ...experiences[0],
        id: 'long-ci-cd-narrative-list-item',
        title:
          'Multi-stage AWS CI/CD delivery pipeline with intentionally long wrapping title',
      },
    ],
    skills,
  },
};
