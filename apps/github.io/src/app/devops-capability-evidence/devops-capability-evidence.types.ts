export type DoraCapabilityKey =
  | 'continuous-delivery'
  | 'deployment-automation'
  | 'continuous-integration'
  | 'test-automation'
  | 'monitoring-observability'
  | 'flexible-infrastructure'
  | 'pervasive-security'
  | 'trunk-based-development'
  | 'documentation-quality'
  | 'version-control';

export type EvidenceType =
  | 'skill'
  | 'learning'
  | 'experience'
  | 'education'
  | 'certification'
  | 'project';

export type LearningEvidenceKind =
  | 'course'
  | 'article'
  | 'book'
  | 'docs'
  | 'lab';

export type EvidenceStrength = 'supporting' | 'strong' | 'primary';

export type CapabilityEvidenceInitiativeId =
  'aws-codepipeline-platform' | 'github-actions-monorepo';

export interface CapabilityEvidenceInitiative {
  readonly id: CapabilityEvidenceInitiativeId;
  readonly label: string;
}

export interface CapabilityEvidencePeriod {
  readonly startedAt: string;
  readonly endedAt?: string;
}

export interface CapabilityEvidenceMetric {
  readonly label: string;
  readonly value: number;
  readonly unit: 'count' | 'percent' | 'seconds';
  readonly measuredAt: string;
  readonly denominator?: number;
}

export interface CapabilityEvidenceDetails {
  readonly initiative: CapabilityEvidenceInitiative;
  readonly period: CapabilityEvidencePeriod;
  readonly metrics: readonly CapabilityEvidenceMetric[];
  readonly facts: readonly string[];
}

export interface DoraCapabilityDefinition {
  key: DoraCapabilityKey;
  label: string;
  shortLabel: string;
}

export interface CapabilityEvidenceItem {
  id: string;
  title: string;
  label?: string;
  type: EvidenceType;
  capabilityKeys: readonly DoraCapabilityKey[];
  date?: string;
  endDate?: string;
  citationIcon?: string;
  issuer?: string;
  organization?: string;
  summary: string;
  details?: CapabilityEvidenceDetails;
  technologies?: readonly string[];
  learningKind?: LearningEvidenceKind;
  proofUrl?: string;
  isPublic: boolean;
  isSensitive?: boolean;
  strength: EvidenceStrength;
  supportingEvidenceIds?: readonly string[];
}

export interface DoraCapabilityScore {
  capabilityKey: DoraCapabilityKey;
  label: string;
  score: number;
  maxScore: 5;
  evidenceIds: readonly string[];
  strongestEvidenceId?: string;
  evidenceCounts: Partial<Record<EvidenceType, number>>;
}
