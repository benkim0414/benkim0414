import type { Meta, StoryObj } from '@storybook/react-vite';
import { HStack } from '@astryxdesign/core/Layout';

import { CapabilityEvidence } from './capability-evidence';
import type { CapabilityEvidenceItem } from './devops-capability-evidence.types';

const baseEvidence = {
  capabilityKeys: ['flexible-infrastructure'],
  summary: 'Public-safe evidence summary for compact display.',
  isPublic: true,
  strength: 'strong',
} as const;

const meta = {
  component: CapabilityEvidence,
  title: 'DevOps Capability Evidence/CapabilityEvidence',
} satisfies Meta<typeof CapabilityEvidence>;

export default meta;

type Story = StoryObj<typeof meta>;

function item(
  evidence: Omit<CapabilityEvidenceItem, keyof typeof baseEvidence>,
): CapabilityEvidenceItem {
  return { ...baseEvidence, ...evidence };
}

export const Skill: Story = {
  args: {
    evidence: item({
      id: 'skill',
      title: 'Kubernetes',
      type: 'skill',
    }),
  },
};

export const Learning: Story = {
  args: {
    evidence: item({
      id: 'learning',
      label: 'Kubernetes',
      proofUrl: 'https://www.cncf.io/training/',
      technologies: ['Kubernetes'],
      title: 'Kubernetes operations learning path',
      type: 'learning',
    }),
  },
};

export const Experience: Story = {
  args: {
    evidence: item({
      id: 'experience',
      label: 'CI/CD workflow',
      technologies: ['GitHub Actions'],
      title: 'CI/CD workflow ownership for a four-developer product team',
      type: 'experience',
    }),
  },
};

export const Education: Story = {
  args: {
    evidence: item({
      id: 'education',
      label: 'Computer Science',
      title: 'Bachelor of Computer Science from University of Example',
      type: 'education',
    }),
  },
};

export const Certification: Story = {
  args: {
    citationNumber: 1,
    evidence: item({
      id: 'certification',
      label: 'CKA',
      proofUrl: 'https://example.com/cka',
      technologies: ['Kubernetes'],
      title: 'Certified Kubernetes Administrator',
      type: 'certification',
    }),
  },
};

export const ActiveCertification: Story = {
  args: {
    citationNumber: 2,
    evidence: item({
      endDate: '2099-01-01T00:00:00+00:00',
      id: 'active-certification',
      label: 'CKA',
      proofUrl: 'https://example.com/cka',
      technologies: ['Kubernetes'],
      title: 'Certified Kubernetes Administrator',
      type: 'certification',
    }),
  },
};

export const ExpiredCertification: Story = {
  args: {
    citationNumber: 3,
    evidence: item({
      endDate: '2020-01-01T00:00:00+00:00',
      id: 'expired-certification',
      label: 'KCNA',
      proofUrl: 'https://example.com/kcna',
      technologies: ['Kubernetes'],
      title: 'Kubernetes and Cloud Native Associate',
      type: 'certification',
    }),
  },
};

export const Project: Story = {
  args: {
    citationNumber: 2,
    evidence: item({
      id: 'project',
      proofUrl: 'https://github.com/benkim0414/benkim0414',
      title:
        'DevOps roadmap portfolio project with React, TypeScript, Nx, and GitHub Pages',
      type: 'project',
    }),
  },
};

export const MixedRow = {
  args: {
    evidence: item({
      id: 'mixed-row',
      label: 'Mixed evidence',
      title: 'Mixed evidence row item',
      type: 'learning',
    }),
  },
  render: () => {
    const evidence = [
      Skill.args.evidence,
      Learning.args.evidence,
      Experience.args.evidence,
      Education.args.evidence,
      Certification.args.evidence,
      ActiveCertification.args.evidence,
      ExpiredCertification.args.evidence,
      Project.args.evidence,
    ].filter(Boolean) as CapabilityEvidenceItem[];

    return (
      <HStack gap={2} wrap="wrap">
        {evidence.map((entry, index) => (
          <CapabilityEvidence
            key={entry.id}
            citationNumber={index + 1}
            evidence={entry}
          />
        ))}
      </HStack>
    );
  },
} satisfies Story;
