import type { CapabilityEvidenceItem } from './devops-capability-evidence.types';

const testAutomationSkillDefinitions = [
  {
    id: 'test-automation-skill-aws-codebuild',
    name: 'AWS CodeBuild',
    supports: ['codebuild-postgresql-tests'],
  },
  {
    id: 'test-automation-skill-postgresql',
    name: 'PostgreSQL',
    supports: ['codebuild-postgresql-tests', 'jest-testcontainers-postgres'],
  },
  {
    id: 'test-automation-skill-parameter-store',
    name: 'AWS Systems Manager Parameter Store',
    supports: ['codebuild-postgresql-tests'],
  },
  {
    id: 'test-automation-skill-jest',
    name: 'Jest',
    supports: [
      'jest-testcontainers-postgres',
      'regression-gates',
      'service-generator-unit-tests',
    ],
  },
  {
    id: 'test-automation-skill-testcontainers',
    name: 'Testcontainers',
    supports: ['jest-testcontainers-postgres'],
  },
  {
    id: 'test-automation-skill-nx',
    name: 'Nx',
    supports: ['nx-affected-quality-gates'],
  },
  {
    id: 'test-automation-skill-github-actions',
    name: 'GitHub Actions',
    supports: ['nx-affected-quality-gates', 'container-health-smoke-tests'],
  },
  {
    id: 'test-automation-skill-docker',
    name: 'Docker',
    supports: ['container-health-smoke-tests'],
  },
  {
    id: 'test-automation-skill-typescript',
    name: 'TypeScript',
    supports: ['service-generator-unit-tests'],
  },
  {
    id: 'test-automation-skill-prometheus',
    name: 'Prometheus',
    supports: ['prometheus-alert-rule-tests'],
  },
  {
    id: 'test-automation-skill-promtool',
    name: 'promtool',
    supports: ['prometheus-alert-rule-tests'],
  },
] as const;

export const testAutomationSkillEvidenceItems: readonly CapabilityEvidenceItem[] =
  testAutomationSkillDefinitions.map(({ id, name, supports }) => ({
    id,
    title: name,
    label: name,
    type: 'skill',
    capabilityKeys: ['test-automation'],
    summary: `Evidence-backed Test Automation capability with ${name}.`,
    technologies: [name],
    isPublic: true,
    strength: 'supporting',
    supportingEvidenceIds: supports,
  }));
