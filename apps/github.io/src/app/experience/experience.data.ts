import type { Experience } from './experience.types';

export const experiences = [
  {
    id: 'aws-codepipeline-codebuild-multistage-delivery',
    title: 'Multi-stage AWS CI/CD delivery pipeline',
    summary:
      'Built AWS CodePipeline and CodeBuild automation for staging and production delivery with build validation, artifact handoff, and controlled promotion.',
    narrative: [
      'Built a delivery pipeline around AWS CodePipeline and AWS CodeBuild so application changes could move through repeatable validation before reaching runtime environments.',
      'Separated staging and production delivery concerns so changes could be exercised in a pre-production stage before production promotion, with the pipeline carrying the same build output through the release path.',
      'Used the pipeline as a reliability boundary: build feedback, deployment ordering, and environment-specific handoff were handled by automation instead of manual release steps.',
    ],
    role: 'Platform engineer',
    environments: [{ label: 'Staging' }, { label: 'Production' }],
    skillIds: [
      'aws-codepipeline',
      'aws-codebuild',
      'terraform',
      'amazon-ecr',
      'amazon-eks',
      'kubernetes',
    ],
    projectIds: ['homelab'],
    capabilityKeys: [
      'continuous-integration',
      'continuous-delivery',
      'deployment-automation',
    ],
    technologies: [
      'AWS CodePipeline',
      'AWS CodeBuild',
      'Terraform',
      'CI/CD',
    ],
    supportingEvidenceIds: [
      'terraform-codepipeline-platform',
      'codebuild-pr-gates',
      'codepipeline-approval-gated-deployment',
    ],
    isPublic: true,
  },
] as const satisfies readonly Experience[];
