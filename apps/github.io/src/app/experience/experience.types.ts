import type {
  CapabilityEvidenceItem,
  DoraCapabilityKey,
} from '../devops-capability-evidence/devops-capability-evidence.types';

export interface ExperiencePeriod {
  readonly startedAt: string;
  readonly endedAt?: string;
}

export interface ExperienceEnvironment {
  readonly label: string;
}

export interface Experience {
  readonly id: string;
  readonly kind: 'professional' | 'personal';
  readonly title: string;
  readonly summary: string;
  readonly narrative: readonly string[];
  readonly role?: string;
  readonly organization?: string;
  readonly period?: ExperiencePeriod;
  readonly environments?: readonly ExperienceEnvironment[];
  readonly skillIds: readonly string[];
  readonly projectIds: readonly string[];
  readonly capabilityKeys: readonly DoraCapabilityKey[];
  readonly technologies: readonly string[];
  readonly supportingEvidenceIds?: readonly CapabilityEvidenceItem['id'][];
  readonly proofUrl?: string;
  readonly isPublic: boolean;
  readonly isSensitive?: boolean;
}
