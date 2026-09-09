import type { CertificationCitationProps } from '../certifications/certification-citation';

export type Certification = Omit<
  CertificationCitationProps,
  'number' | 'currentDate'
>;

export interface DevOpsRoadmapItem {
  id: string;
  title: string;
  description: string;
  skills?: readonly string[];
  certifications?: readonly Certification[];
  evidenceSkillTokens?: readonly string[];
  coveredRoadmapConcepts?: readonly string[];
}

export interface DevOpsRoadmapSkillInventoryNode extends Omit<
  DevOpsRoadmapItem,
  'evidenceSkillTokens'
> {
  evidenceSkillTokens: readonly string[];
}

export interface DevOpsRoadmapSkillInventoryGap {
  nodeId: string;
  recommendedItems: readonly string[];
}

export interface DevOpsRoadmapProps {
  ariaLabel?: string;
  items?: readonly DevOpsRoadmapItem[];
  isReversed?: boolean;
}
