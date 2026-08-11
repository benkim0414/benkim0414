import type { CertificationRecord } from '../certifications/certification.types';

export type Certification = Omit<CertificationRecord, 'id'>;

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
