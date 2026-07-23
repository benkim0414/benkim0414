import type { Meta, StoryObj } from '@storybook/react-vite';

import { CertificationCitation } from './certification-citation';

const meta: Meta<typeof CertificationCitation> = {
  component: CertificationCitation,
  title: 'GitHub.io/Certifications/Certification Citation',
};

export default meta;
type Story = StoryObj<typeof CertificationCitation>;

export const Active: Story = {
  args: {
    currentDate: new Date('2026-07-23T00:00:00+10:00'),
    expiresAt: '2027-04-20T10:00:00+10:00',
    skills: ['Kubernetes'],
    title: 'CKA',
    url: 'https://example.com/cka.pdf',
  },
};

export const Expired: Story = {
  args: {
    currentDate: new Date('2029-01-01T00:00:00+11:00'),
    expiresAt: '2027-04-20T10:00:00+10:00',
    skills: ['Kubernetes'],
    title: 'CKA',
    url: 'https://example.com/cka.pdf',
  },
};

export const MultipleSkills: Story = {
  args: {
    currentDate: new Date('2026-07-23T00:00:00+10:00'),
    expiresAt: '2028-02-25T11:00:00+11:00',
    skills: ['Unknown Skill', 'Kubernetes'],
    title: 'CKAD',
    url: 'https://example.com/ckad.pdf',
  },
};
