import type { Project } from './project-list.types';

export const sampleProjects: readonly Project[] = [
  {
    id: 'github-io-portfolio',
    title: 'GitHub.io portfolio',
    description:
      'Personal portfolio built with React, TypeScript, Nx, Astryx, StyleX, and GitHub Pages to present skills, certifications, and DevOps capability evidence.',
    skills: [
      { label: 'React' },
      { label: 'TypeScript' },
      { label: 'Nx' },
      { label: 'Astryx' },
      { label: 'StyleX' },
      { label: 'GitHub' },
      { label: 'GitHub Actions' },
    ],
    githubUrl: 'https://github.com/benkim0414/benkim0414',
    evidenceIds: ['devops-roadmap-project'],
    capabilityKeys: ['deployment-automation'],
  },
];
