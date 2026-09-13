import { devOpsCapabilityEvidenceItems } from '../devops-capability-evidence/devops-capability-evidence.data';
import { experiences } from '../experience/experience.data';
import { sampleProjects } from '../projects/project-list.data';
import { skillDetailRecords } from './skill-detail.data';
import type { SkillDetailSources } from './skill-detail.types';
import { skills } from './skill-list.data';

export const skillDetailSources: SkillDetailSources = {
  skills,
  detailRecords: skillDetailRecords,
  evidenceItems: devOpsCapabilityEvidenceItems,
  projects: sampleProjects,
  experiences,
};
