import type { CertificationCitationProps } from '../certifications/certification-citation';

export type Certification = Omit<
  CertificationCitationProps,
  'number' | 'currentDate'
>;

export interface DevOpsRoadmapItem {
  id: string;
  title: string;
  skills: readonly string[];
  certifications?: readonly Certification[];
}

export interface DevOpsRoadmapProps {
  ariaLabel?: string;
  items?: readonly DevOpsRoadmapItem[];
  isReversed?: boolean;
}
