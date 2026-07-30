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
  issuer?: string;
  organization?: string;
  summary: string;
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
