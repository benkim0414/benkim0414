import { devOpsCapabilityEvidenceItems } from '../devops-capability-evidence/devops-capability-evidence.data';
import { experiences } from '../experience/experience.data';
import { sampleProjects } from '../projects/project-list.data';
import { skillDetailRecords } from './skill-detail.data';
import { resolveSkillDetail } from './skill-detail-resolver';
import { skills } from './skill-list.data';

describe('skillDetailRecords', () => {
  const sources = {
    skills,
    detailRecords: skillDetailRecords,
    evidenceItems: devOpsCapabilityEvidenceItems,
    experiences,
    projects: sampleProjects,
  };

  it('resolves every record without errors', () => {
    for (const record of skillDetailRecords) {
      const resolution = resolveSkillDetail(record.skillId, sources);

      expect(resolution.status).toBe('found');
    }
  });

  it('surfaces every experience through at least one skill detail record', () => {
    const linkedExperienceIds = new Set(
      skillDetailRecords.flatMap((record) => record.experienceIds),
    );

    for (const experience of experiences) {
      expect(linkedExperienceIds.has(experience.id)).toBe(true);
    }
  });

  it('links each skill only to experiences that declare the skill', () => {
    const experienceById = new Map(
      experiences.map((experience) => [experience.id, experience]),
    );

    for (const record of skillDetailRecords) {
      for (const experienceId of record.experienceIds) {
        const experience = experienceById.get(experienceId);

        expect(experience).toBeDefined();
        expect(experience?.skillIds).toContain(record.skillId);
      }
    }
  });
});
