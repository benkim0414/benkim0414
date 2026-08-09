import { capabilityEvidenceInitiatives } from './capability-evidence-initiatives';
import type { CapabilityEvidenceItem } from './devops-capability-evidence.types';

const snapshotDate = '2026-08-07';

export const continuousIntegrationEvidenceInitiatives =
  capabilityEvidenceInitiatives;

const awsInitiative =
  continuousIntegrationEvidenceInitiatives.awsCodePipelinePlatform;
const githubInitiative =
  continuousIntegrationEvidenceInitiatives.githubActionsMonorepo;

const continuousIntegrationEvidenceItemCatalog = [
  {
    id: 'terraform-codepipeline-platform',
    label: 'Reusable Terraform CI pipelines',
    title: 'Reusable Terraform delivery platform',
    type: 'experience',
    capabilityKeys: [
      'continuous-integration',
      'continuous-delivery',
      'version-control',
    ],
    isPublic: true,
    strength: 'primary',
    summary:
      'Designed and built reusable Terraform modules that provisioned consistent delivery pipelines, build projects, container repositories, and scoped IAM roles.',
    technologies: [
      'Terraform',
      'AWS CodePipeline',
      'AWS CodeBuild',
      'Amazon ECR',
    ],
    details: {
      initiative: awsInitiative,
      period: { startedAt: '2019-07-05' },
      metrics: [
        {
          label: 'Delivery pipelines',
          value: 47,
          unit: 'count',
          measuredAt: snapshotDate,
        },
        {
          label: 'Build projects',
          value: 105,
          unit: 'count',
          measuredAt: snapshotDate,
        },
        {
          label: 'Services',
          value: 27,
          unit: 'count',
          measuredAt: snapshotDate,
        },
        {
          label: 'Lifetime builds',
          value: 39114,
          unit: 'count',
          measuredAt: snapshotDate,
        },
      ],
      facts: [
        'Designed and built reusable Terraform modules that provisioned consistent delivery pipelines, build projects, container repositories, and scoped IAM roles.',
      ],
    },
  },
  {
    id: 'codebuild-pr-gates',
    label: 'Automated pull-request test gates',
    title: 'Pull-request test gates with AWS CodeBuild',
    type: 'experience',
    capabilityKeys: ['continuous-integration'],
    isPublic: true,
    strength: 'primary',
    summary:
      'Configured pull-request webhooks to run automated builds and tests and report their status directly to GitHub.',
    technologies: ['AWS CodeBuild', 'GitHub'],
    details: {
      initiative: awsInitiative,
      period: { startedAt: '2019-03-06' },
      metrics: [
        {
          label: 'Test projects with webhooks',
          value: 27,
          denominator: 27,
          unit: 'count',
          measuredAt: snapshotDate,
        },
        {
          label: 'Standard PR event filters',
          value: 26,
          denominator: 27,
          unit: 'count',
          measuredAt: snapshotDate,
        },
        {
          label: 'GitHub status reporting',
          value: 26,
          denominator: 27,
          unit: 'count',
          measuredAt: snapshotDate,
        },
        {
          label: 'Lifetime PR test builds',
          value: 24779,
          unit: 'count',
          measuredAt: snapshotDate,
        },
        {
          label: 'Median PR feedback',
          value: 175,
          unit: 'seconds',
          measuredAt: snapshotDate,
        },
      ],
      facts: [
        'Configured pull-request webhooks to run automated builds and tests and report their status directly to GitHub.',
      ],
    },
  },
  {
    id: 'codebuild-postgresql-tests',
    label: 'PostgreSQL gates',
    title: 'Database-backed CodeBuild test gates',
    type: 'experience',
    capabilityKeys: ['continuous-integration'],
    isPublic: true,
    strength: 'strong',
    summary:
      'Ran application test suites against PostgreSQL while resolving test credentials at build time from AWS Systems Manager Parameter Store.',
    technologies: [
      'AWS CodeBuild',
      'PostgreSQL',
      'AWS Systems Manager Parameter Store',
    ],
    details: {
      initiative: awsInitiative,
      period: { startedAt: '2019-03-06' },
      metrics: [],
      facts: [
        'Ran application test suites against PostgreSQL while resolving test credentials at build time from AWS Systems Manager Parameter Store.',
      ],
    },
  },
  {
    id: 'codebuild-feedback-tuning',
    label: 'CodeBuild tuning',
    title: 'Fast feedback through CodeBuild tuning',
    type: 'experience',
    capabilityKeys: ['continuous-integration'],
    isPublic: true,
    strength: 'strong',
    summary:
      'Adjusted compute capacity and build timeouts to match suite size and keep pull-request feedback within minutes.',
    technologies: ['AWS CodeBuild'],
    details: {
      initiative: awsInitiative,
      period: { startedAt: '2019-03-06' },
      metrics: [
        {
          label: 'Median PR feedback',
          value: 175,
          unit: 'seconds',
          measuredAt: snapshotDate,
        },
        {
          label: 'PR feedback p90',
          value: 494,
          unit: 'seconds',
          measuredAt: snapshotDate,
        },
        {
          label: 'Recent PR build success',
          value: 73.8,
          unit: 'percent',
          measuredAt: snapshotDate,
        },
      ],
      facts: [
        'Adjusted compute capacity and build timeouts to match suite size and keep pull-request feedback within minutes.',
      ],
    },
  },
  {
    id: 'ecr-immutable-promotion',
    label: 'ECR promotion',
    title: 'Build-once Amazon ECR promotion',
    type: 'experience',
    capabilityKeys: ['continuous-integration', 'continuous-delivery'],
    isPublic: true,
    strength: 'primary',
    summary:
      'Built container images once, tagged them with the source commit SHA, and promoted the same image manifest without rebuilding per environment.',
    technologies: ['Docker', 'Amazon ECR', 'AWS CodeBuild'],
    details: {
      initiative: awsInitiative,
      period: { startedAt: '2019-07-05' },
      metrics: [
        {
          label: 'Median production promotion',
          value: 91,
          unit: 'seconds',
          measuredAt: snapshotDate,
        },
      ],
      facts: [
        'Built container images once, tagged them with the source commit SHA, and promoted the same image manifest without rebuilding per environment.',
      ],
    },
  },
  {
    id: 'codepipeline-webhook-trunk',
    label: 'Webhook delivery',
    title: 'Webhook-driven trunk delivery',
    type: 'experience',
    capabilityKeys: ['continuous-integration', 'version-control'],
    isPublic: true,
    strength: 'strong',
    summary:
      'Delivered changes from one trunk through webhook-driven pipelines without a long-lived release-branch topology.',
    technologies: ['AWS CodePipeline', 'GitHub', 'Git'],
    details: {
      initiative: awsInitiative,
      period: { startedAt: '2019-01-24' },
      metrics: [],
      facts: [
        'Delivered changes from one trunk through webhook-driven pipelines without a long-lived release-branch topology.',
      ],
    },
  },
  {
    id: 'nx-monorepo-migration',
    label: 'Nx migration',
    title: 'Standalone repository migration to an Nx monorepo',
    type: 'experience',
    capabilityKeys: ['continuous-integration'],
    isPublic: true,
    strength: 'primary',
    summary:
      'Migrated standalone repositories into an Nx monorepo while preserving fast feedback with dependency-aware affected execution.',
    technologies: ['Nx', 'GitHub Actions', 'TypeScript'],
    details: {
      initiative: githubInitiative,
      period: { startedAt: '2024-02-28' },
      metrics: [
        {
          label: 'Services',
          value: 20,
          unit: 'count',
          measuredAt: snapshotDate,
        },
        {
          label: 'End-to-end projects',
          value: 16,
          unit: 'count',
          measuredAt: snapshotDate,
        },
        {
          label: 'Shared packages',
          value: 15,
          unit: 'count',
          measuredAt: snapshotDate,
        },
        {
          label: 'Test files',
          value: 430,
          unit: 'count',
          measuredAt: snapshotDate,
        },
      ],
      facts: [
        'Migrated standalone repositories into an Nx monorepo while preserving fast feedback with dependency-aware affected execution.',
      ],
    },
  },
  {
    id: 'nx-affected-quality-gates',
    label: 'Affected-change quality gates',
    title: 'Nx affected quality gates',
    type: 'experience',
    capabilityKeys: [
      'test-automation',
      'continuous-integration',
      'trunk-based-development',
    ],
    isPublic: true,
    strength: 'primary',
    summary:
      'Configured pull-request and main-branch CI to run affected lint, unit, integration, and build targets from the last successful main-branch baseline.',
    technologies: ['Nx', 'GitHub Actions', 'TypeScript'],
    details: {
      initiative: githubInitiative,
      period: { startedAt: '2024-02-28' },
      metrics: [
        {
          label: 'Workflow runs',
          value: 629,
          unit: 'count',
          measuredAt: snapshotDate,
        },
        {
          label: 'Median affected CI feedback',
          value: 179,
          unit: 'seconds',
          measuredAt: snapshotDate,
        },
        {
          label: 'Affected CI feedback p90',
          value: 1382,
          unit: 'seconds',
          measuredAt: snapshotDate,
        },
      ],
      facts: [
        'Configured pull-request and main-branch CI to run affected lint, unit, integration, and build targets from the last successful main-branch baseline.',
      ],
    },
  },
  {
    id: 'github-actions-container-verification',
    label: 'Container verification',
    title: 'End-to-end and container smoke verification',
    type: 'experience',
    capabilityKeys: ['continuous-integration'],
    isPublic: true,
    strength: 'strong',
    summary:
      'Added dedicated end-to-end projects and container health-check smoke tests that retain logs on failure and always clean up.',
    technologies: ['GitHub Actions', 'Nx', 'Docker'],
    details: {
      initiative: githubInitiative,
      period: { startedAt: '2024-02-28' },
      metrics: [
        {
          label: 'Container-smoke coverage',
          value: 2,
          denominator: 20,
          unit: 'count',
          measuredAt: snapshotDate,
        },
      ],
      facts: [
        'Added dedicated end-to-end projects and container health-check smoke tests that retain logs on failure and always clean up.',
      ],
    },
  },
  {
    id: 'github-actions-oidc-ecr-publishing',
    label: 'OIDC image publishing',
    title: 'OIDC-based Amazon ECR publishing',
    type: 'experience',
    capabilityKeys: ['continuous-integration'],
    isPublic: true,
    strength: 'strong',
    summary:
      'Published commit-SHA container images from GitHub Actions through an OIDC-assumed AWS role without static cloud credentials.',
    technologies: ['GitHub Actions', 'OIDC', 'Docker', 'Amazon ECR'],
    details: {
      initiative: githubInitiative,
      period: { startedAt: '2024-05-10' },
      metrics: [],
      facts: [
        'Published commit-SHA container images from GitHub Actions through an OIDC-assumed AWS role without static cloud credentials.',
      ],
    },
  },
  {
    id: 'github-actions-gitops-handoff',
    label: 'Automated deployment process',
    title: 'Automated deployment process',
    type: 'experience',
    capabilityKeys: [
      'continuous-integration',
      'continuous-delivery',
      'version-control',
    ],
    isPublic: true,
    strength: 'primary',
    summary:
      'Automated the affected-service deployment process through GitHub Actions, Nx, version-controlled Kustomize configuration, and Argo CD reconciliation.',
    technologies: [
      'GitHub',
      'GitHub Actions',
      'OpenID Connect',
      'Nx',
      'Amazon ECR',
      'Kustomize',
      'Argo CD',
    ],
    details: {
      initiative: githubInitiative,
      period: { startedAt: '2024-05-10' },
      metrics: [
        {
          label: 'Deployment runs',
          value: 249,
          unit: 'count',
          measuredAt: snapshotDate,
        },
        {
          label: 'Deployment success',
          value: 85.9,
          unit: 'percent',
          measuredAt: snapshotDate,
        },
        {
          label: 'Median deployment handoff',
          value: 103,
          unit: 'seconds',
          measuredAt: snapshotDate,
        },
        {
          label: 'Tag-update runs',
          value: 251,
          unit: 'count',
          measuredAt: snapshotDate,
        },
        {
          label: 'Median tag update',
          value: 15,
          unit: 'seconds',
          measuredAt: snapshotDate,
        },
        {
          label: 'Environment tag-update events created by automation',
          value: 448,
          denominator: 513,
          unit: 'count',
          measuredAt: '2026-08-09',
        },
        {
          label: 'Automated demo deployments',
          value: 259,
          unit: 'count',
          measuredAt: '2026-08-09',
        },
        {
          label: 'Median merge-to-demo lead time',
          value: 317,
          unit: 'seconds',
          measuredAt: '2026-08-09',
        },
        {
          label: 'P90 merge-to-demo lead time',
          value: 1689,
          unit: 'seconds',
          measuredAt: '2026-08-09',
        },
      ],
      facts: [
        'Dispatched affected deployments to an operations monorepo, updated Kustomize image references, and let Argo CD reconcile the desired state.',
        'Deployment automation does not verify successful build completion before dispatch.',
        'Production synchronization remains manual.',
      ],
    },
  },
  {
    id: 'kustomize-tag-update-reliability',
    label: 'Reliable Kustomize tag updates',
    title: 'Reliable Kustomize batch tag updates',
    type: 'experience',
    capabilityKeys: ['continuous-integration', 'continuous-delivery'],
    isPublic: true,
    strength: 'primary',
    summary:
      'Reworked batch image-tag updates with validated inputs, pinned tooling, compatibility handling, and safe skipping for projects without deployment overlays.',
    technologies: ['GitHub Actions', 'Kustomize', 'yq'],
    details: {
      initiative: githubInitiative,
      period: { startedAt: '2026-06-15' },
      metrics: [
        {
          label: 'March 2026 success',
          value: 30.4,
          unit: 'percent',
          measuredAt: '2026-03-31',
        },
        {
          label: 'April 2026 success',
          value: 44.2,
          unit: 'percent',
          measuredAt: '2026-04-30',
        },
        {
          label: 'May 2026 success',
          value: 61.8,
          unit: 'percent',
          measuredAt: '2026-05-31',
        },
        {
          label: 'June 2026 success',
          value: 95.2,
          unit: 'percent',
          measuredAt: '2026-06-30',
        },
        {
          label: 'July 2026 success',
          value: 100,
          unit: 'percent',
          measuredAt: '2026-07-31',
        },
        {
          label: 'August 2026 success to date',
          value: 100,
          unit: 'percent',
          measuredAt: snapshotDate,
        },
      ],
      facts: [
        'Reworked batch image-tag updates with validated inputs, pinned tooling, compatibility handling, and safe skipping for projects without deployment overlays.',
      ],
    },
  },
  {
    id: 'github-actions-failure-notifications',
    label: 'Failure notifications',
    title: 'Deployment automation failure notifications',
    type: 'experience',
    capabilityKeys: ['continuous-integration'],
    isPublic: true,
    strength: 'strong',
    summary:
      'Added Slack notification with the workflow-run link and deployment consequence when container publishing or deployment dispatch fails.',
    technologies: ['GitHub Actions', 'Slack'],
    details: {
      initiative: githubInitiative,
      period: { startedAt: '2026-08-05' },
      metrics: [],
      facts: [
        'Added Slack notification with the workflow-run link and deployment consequence when container publishing or deployment dispatch fails.',
      ],
    },
  },
  {
    id: 'tested-ci-automation',
    label: 'Tested CI code',
    title: 'Tests for CI support code and reconciled configuration',
    type: 'experience',
    capabilityKeys: ['continuous-integration'],
    isPublic: true,
    strength: 'strong',
    summary:
      'Added unit tests for cross-repository dispatch support and containerized rule tests for monitoring configuration that is automatically reconciled.',
    technologies: ['GitHub Actions', 'JavaScript', 'Prometheus', 'Docker'],
    details: {
      initiative: githubInitiative,
      period: { startedAt: '2024-02-28' },
      metrics: [],
      facts: [
        'Added unit tests for cross-repository dispatch support and containerized rule tests for monitoring configuration that is automatically reconciled.',
      ],
    },
  },
  {
    id: 'commitlint-small-batches',
    label: 'Commit conventions',
    title: 'Mechanically enforced commit conventions',
    type: 'experience',
    capabilityKeys: ['continuous-integration'],
    isPublic: true,
    strength: 'supporting',
    summary:
      'Enforced conventional, reviewable commits through commitlint and Husky in both monorepos.',
    technologies: ['commitlint', 'Husky', 'Git'],
    details: {
      initiative: githubInitiative,
      period: { startedAt: '2024-02-28' },
      metrics: [],
      facts: [
        'Enforced conventional, reviewable commits through commitlint and Husky in both monorepos.',
      ],
    },
  },
  {
    id: 'reusable-helm-deployment-image',
    label: 'Reusable Helm image',
    title: 'Reusable Docker and Helm deployment image',
    type: 'experience',
    capabilityKeys: [
      'continuous-integration',
      'continuous-delivery',
      'version-control',
    ],
    isPublic: true,
    strength: 'strong',
    summary:
      'Maintained a reusable Docker and Helm build image used by AWS CodeBuild projects to deploy applications to Amazon EKS.',
    technologies: [
      'AWS CodeBuild',
      'Amazon ECR',
      'Docker',
      'Helm',
      'Amazon EKS',
    ],
    details: {
      initiative: awsInitiative,
      period: { startedAt: '2019-07-05' },
      metrics: [
        {
          label: 'Build projects using reusable image',
          value: 44,
          denominator: 105,
          unit: 'count',
          measuredAt: snapshotDate,
        },
        {
          label: 'Contributed image changes',
          value: 24,
          denominator: 51,
          unit: 'count',
          measuredAt: snapshotDate,
        },
      ],
      facts: [
        'Maintained one reusable CI build image consumed by many build projects without implying public distribution.',
      ],
    },
  },
  {
    id: 'codebuild-status-visibility',
    label: 'Build status visibility',
    title: 'CodeBuild status visibility',
    type: 'experience',
    capabilityKeys: ['continuous-integration'],
    isPublic: true,
    strength: 'strong',
    summary:
      'Made CI results visible through build badges and GitHub commit statuses configured by the reusable Terraform platform.',
    technologies: ['Terraform', 'AWS CodeBuild', 'GitHub'],
    details: {
      initiative: awsInitiative,
      period: { startedAt: '2019-07-05' },
      metrics: [
        {
          label: 'Projects with build badges',
          value: 98,
          denominator: 105,
          unit: 'count',
          measuredAt: snapshotDate,
        },
        {
          label: 'Projects reporting GitHub status',
          value: 91,
          denominator: 105,
          unit: 'count',
          measuredAt: snapshotDate,
        },
      ],
      facts: [
        'Made CI outcomes visible across the build fleet through badges and source-control status reporting.',
      ],
    },
  },
  {
    id: 'codebuild-runtime-upgrades',
    label: 'Runtime upgrades',
    title: 'AWS CodeBuild runtime upgrades',
    type: 'experience',
    capabilityKeys: ['continuous-integration'],
    isPublic: true,
    strength: 'supporting',
    summary:
      'Maintained the CI platform through successive AWS CodeBuild standard-image generations and associated delivery-platform updates.',
    technologies: ['AWS CodeBuild', 'Terraform'],
    details: {
      initiative: awsInitiative,
      period: { startedAt: '2019-07-05', endedAt: '2025-03-18' },
      metrics: [],
      facts: [
        'Upgraded the AWS CodeBuild standard image from generation 5 to 6 in March 2023.',
        'Upgraded the AWS CodeBuild standard image from generation 6 to 7 in March 2025.',
      ],
    },
  },
] as const satisfies readonly CapabilityEvidenceItem[];

export const continuousIntegrationEvidenceItems: readonly CapabilityEvidenceItem[] =
  continuousIntegrationEvidenceItemCatalog;
