import type {
  CapabilityEvidenceItem,
  DoraCapabilityDefinition,
  DoraCapabilityScore,
} from './devops-capability-evidence.types';

export type DoraCapabilityCardEvidenceGroup =
  'applied' | 'certifications' | 'skills' | 'learning';

export interface DoraCapabilityCardEvidenceRow {
  group: DoraCapabilityCardEvidenceGroup;
  evidence: readonly CapabilityEvidenceItem[];
}

export interface DoraCapabilityCardProps {
  capability: DoraCapabilityDefinition;
  description: string;
  evidence: readonly CapabilityEvidenceItem[];
  scores?: readonly DoraCapabilityScore[];
}
