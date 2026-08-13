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

  const detailRecords = sources.detailRecords.filter(
    (candidate) => candidate.skillId === skillId,
  );

  if (detailRecords.length > 1) {
    throw new Error(`Duplicate skill detail record for "${skillId}".`);
  }

  const record = detailRecords[0];

  if (!record) {
    return {
      status: 'found',
      value: {
        skill,
        experienceEvidence: [],
        projects: [],
      },
    };
  }

  const evidenceById = new Map(
    sources.evidenceItems.map((item) => [item.id, item]),
  );
  const projectById = new Map<
    string,
    (typeof sources.projects)[number]
  >();

  for (const project of sources.projects) {
    if (projectById.has(project.id)) {
      throw new Error(`Duplicate project source ID "${project.id}".`);
    }

    projectById.set(project.id, project);
  }

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
    if (evidence.type !== 'experience') {
      throw new Error(
        `Skill detail "${skillId}" must reference experience evidence; received "${evidenceId}" of type "${evidence.type}".`,
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
      experienceEvidence,
      projects,
    },
  };
}
