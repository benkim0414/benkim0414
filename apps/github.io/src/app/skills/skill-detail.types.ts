import type { CapabilityEvidenceItem } from '../devops-capability-evidence/devops-capability-evidence.types';
import type { Project } from '../projects/project-list.types';
import type { Skill } from './skill-list.types';

export interface SkillDetailRecord {
  readonly skillId: string;
  readonly experienceSummary: string;
  readonly experienceEvidenceIds: readonly string[];
  readonly projectIds: readonly string[];
}

export interface SkillDetailSources {
  readonly skills: readonly Skill[];
  readonly detailRecords: readonly SkillDetailRecord[];
  readonly evidenceItems: readonly CapabilityEvidenceItem[];
  readonly projects: readonly Project[];
}

export interface ResolvedSkillDetail {
  readonly skill: Skill;
  readonly experienceSummary?: string;
  readonly experienceEvidence: readonly CapabilityEvidenceItem[];
  readonly projects: readonly Project[];
}

export type SkillDetailResolution =
  | { readonly status: 'found'; readonly value: ResolvedSkillDetail }
  | { readonly status: 'not-found' };
