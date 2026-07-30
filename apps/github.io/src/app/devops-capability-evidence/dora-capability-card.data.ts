import type { DoraCapabilityKey } from './devops-capability-evidence.types';

export const doraCapabilityDescriptions = {
  'continuous-delivery':
    'Keeps software releasable through small changes, repeatable release paths, and fast feedback before production.',
  'deployment-automation':
    'Uses automated deployment paths so releases are repeatable, visible, and less dependent on manual coordination.',
  'continuous-integration':
    'Integrates changes frequently with automated checks that expose quality and compatibility issues early.',
  'test-automation':
    'Builds confidence through repeatable automated tests across important product and delivery workflows.',
  'monitoring-observability':
    'Makes systems understandable in operation through telemetry, alerting, debugging signals, and production feedback.',
  'flexible-infrastructure':
    'Uses adaptable infrastructure practices that support repeatable environments, scaling, recovery, and change.',
  'pervasive-security':
    'Treats security as part of everyday delivery through secure defaults, review, automation, and risk-aware practices.',
  'trunk-based-development':
    'Keeps integration paths short through small changes, shared branches, and fast review or merge feedback.',
  'documentation-quality':
    'Keeps technical context findable and maintainable through accurate docs, decision records, and operational notes.',
  'version-control':
    'Uses source control practices that preserve history, support collaboration, and make changes reviewable.',
} as const satisfies Record<DoraCapabilityKey, string>;
