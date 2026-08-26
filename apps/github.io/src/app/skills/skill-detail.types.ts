import type { CapabilityEvidenceItem } from '../devops-capability-evidence/devops-capability-evidence.types';
import type { Experience } from '../experience/experience.types';
import type { Project } from '../projects/project-list.types';
import type { Skill } from './skill-list.types';

export interface SkillDetailRecord {
  readonly skillId: string;
  readonly experienceIds: readonly string[];
  readonly experienceEvidenceIds: readonly string[];
  readonly projectIds: readonly string[];
}

export interface SkillDetailSources {
  readonly skills: readonly Skill[];
  readonly detailRecords: readonly SkillDetailRecord[];
  readonly evidenceItems: readonly CapabilityEvidenceItem[];
  readonly projects: readonly Project[];
  readonly experiences: readonly Experience[];
}

export interface ResolvedSkillDetail {
  readonly skill: Skill;
  readonly experiences: readonly Experience[];
  readonly experienceEvidence: readonly CapabilityEvidenceItem[];
  readonly projects: readonly Project[];
}

export type SkillDetailResolution =
  | { readonly status: 'found'; readonly value: ResolvedSkillDetail }
  | { readonly status: 'not-found' };
