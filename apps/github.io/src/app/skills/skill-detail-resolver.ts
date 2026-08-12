import type {
  SkillDetailResolution,
  SkillDetailSources,
} from './skill-detail.types';

export function resolveSkillDetail(
  skillId: string,
  sources: SkillDetailSources,
): SkillDetailResolution {
  const skill = sources.skills.find((candidate) => candidate.id === skillId);

  if (!skill) return { status: 'not-found' };

  const record = sources.detailRecords.find(
    (candidate) => candidate.skillId === skillId,
  );

  if (!record) {
    return {
      status: 'found',
      value: {
        skill,
        experienceSummary: undefined,
        experienceEvidence: [],
        projects: [],
      },
    };
  }

  const evidenceById = new Map(
    sources.evidenceItems.map((item) => [item.id, item]),
  );
  const projectById = new Map(
    sources.projects.map((project) => [project.id, project]),
  );
  const experienceEvidence = record.experienceEvidenceIds.map((evidenceId) => {
    const evidence = evidenceById.get(evidenceId);

    if (!evidence) {
      throw new Error(
        `Skill detail "${skillId}" references missing evidence "${evidenceId}".`,
      );
    }
    if (!evidence.isPublic || evidence.isSensitive) {
      throw new Error(
        `Skill detail "${skillId}" must reference public, non-sensitive evidence; received "${evidenceId}".`,
      );
    }

    return evidence;
  });
  const projects = record.projectIds.map((projectId) => {
    const project = projectById.get(projectId);

    if (!project) {
      throw new Error(
        `Skill detail "${skillId}" references missing project "${projectId}".`,
      );
    }

    return project;
  });

  return {
    status: 'found',
    value: {
      skill,
      experienceSummary: record.experienceSummary,
      experienceEvidence,
      projects,
    },
  };
}
