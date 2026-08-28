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
  const evidenceById = new Map(
    sources.evidenceItems.map((item) => [item.id, item]),
  );

  const experienceById = new Map<
    string,
    (typeof sources.experiences)[number]
  >();

  for (const experience of sources.experiences) {
    if (experienceById.has(experience.id)) {
      throw new Error(`Duplicate experience source ID "${experience.id}".`);
    }

    experienceById.set(experience.id, experience);
  }

  if (!record) {
    const experienceEvidence = getDerivedExperienceEvidence(skill.name, {
      evidenceById,
      evidenceItems: sources.evidenceItems,
    });
    const relatedSkills = getRelatedSkillsFromEvidence(
      experienceEvidence,
      sources.skills,
    );

    return {
      status: 'found',
      value: {
        skill,
        experiences: [],
        relatedSkills,
        experienceEvidence,
        projects: [],
      },
    };
  }

  const projectById = new Map<string, (typeof sources.projects)[number]>();

  for (const project of sources.projects) {
    if (projectById.has(project.id)) {
      throw new Error(`Duplicate project source ID "${project.id}".`);
    }

    projectById.set(project.id, project);
  }

  const experiences = record.experienceIds.map((experienceId) => {
    const experience = experienceById.get(experienceId);

    if (!experience) {
      throw new Error(
        `Skill detail "${skillId}" references missing experience "${experienceId}".`,
      );
    }
    if (!experience.isPublic || experience.isSensitive) {
      throw new Error(
        `Skill detail "${skillId}" must reference public, non-sensitive experience; received "${experienceId}".`,
      );
    }
    if (!experience.skillIds.includes(skillId)) {
      throw new Error(
        `Skill detail "${skillId}" references experience "${experienceId}" that is not linked to the skill.`,
      );
    }

    return experience;
  });
  const explicitExperienceEvidence = resolveExperienceEvidenceIds({
    evidenceById,
    evidenceIds: record.experienceEvidenceIds,
    missingMessage: (evidenceId) =>
      `Skill detail "${skillId}" references missing evidence "${evidenceId}".`,
    invalidVisibilityMessage: (evidenceId) =>
      `Skill detail "${skillId}" must reference public, non-sensitive evidence; received "${evidenceId}".`,
    invalidTypeMessage: (evidenceId, type) =>
      `Skill detail "${skillId}" must reference experience evidence; received "${evidenceId}" of type "${type}".`,
  });
  const experienceEvidence = mergeEvidenceById([
    ...explicitExperienceEvidence,
    ...getDerivedExperienceEvidence(skill.name, {
      evidenceById,
      evidenceItems: sources.evidenceItems,
    }),
  ]);
  const projects = record.projectIds.map((projectId) => {
    const project = projectById.get(projectId);

    if (!project) {
      throw new Error(
        `Skill detail "${skillId}" references missing project "${projectId}".`,
      );
    }

    return project;
  });
  const skillById = new Map(
    sources.skills.map((candidate) => [candidate.id, candidate]),
  );
  const relatedSkillIds = new Set<string>();

  for (const experience of experiences) {
    for (const relatedSkillId of experience.skillIds) {
      relatedSkillIds.add(relatedSkillId);
    }
  }

  const explicitRelatedSkills = [...relatedSkillIds].map((relatedSkillId) => {
    const relatedSkill = skillById.get(relatedSkillId);

    if (!relatedSkill) {
      throw new Error(
        `Skill detail "${skillId}" references experience skill "${relatedSkillId}" that is missing from skills.`,
      );
    }

    return relatedSkill;
  });
  const relatedSkills = mergeSkillsById([
    ...explicitRelatedSkills,
    ...getRelatedSkillsFromEvidence(experienceEvidence, sources.skills),
  ]);

  return {
    status: 'found',
    value: {
      skill,
      experiences,
      relatedSkills,
      experienceEvidence,
      projects,
    },
  };
}

function getDerivedExperienceEvidence(
  skillName: string,
  sources: {
    readonly evidenceItems: SkillDetailSources['evidenceItems'];
    readonly evidenceById: Map<string, SkillDetailSources['evidenceItems'][number]>;
  },
): SkillDetailSources['evidenceItems'] {
  const evidenceIds = sources.evidenceItems.flatMap((item) => {
    if (
      item.type !== 'skill' ||
      !item.isPublic ||
      item.isSensitive ||
      !evidenceMatchesSkill(item, skillName)
    ) {
      return [];
    }

    return [...(item.supportingEvidenceIds ?? [])];
  });

  return mergeEvidenceById(
    evidenceIds.flatMap((evidenceId) => {
      const evidence = sources.evidenceById.get(evidenceId);

      if (
        !evidence ||
        evidence.type !== 'experience' ||
        !evidence.isPublic ||
        evidence.isSensitive
      ) {
        return [];
      }

      return [evidence];
    }),
  );
}

function resolveExperienceEvidenceIds({
  evidenceById,
  evidenceIds,
  missingMessage,
  invalidVisibilityMessage,
  invalidTypeMessage,
}: {
  readonly evidenceById: Map<string, SkillDetailSources['evidenceItems'][number]>;
  readonly evidenceIds: readonly string[];
  readonly missingMessage: (evidenceId: string) => string;
  readonly invalidVisibilityMessage: (evidenceId: string) => string;
  readonly invalidTypeMessage: (evidenceId: string, type: string) => string;
}): SkillDetailSources['evidenceItems'] {
  return evidenceIds.map((evidenceId) => {
    const evidence = evidenceById.get(evidenceId);

    if (!evidence) {
      throw new Error(missingMessage(evidenceId));
    }
    if (!evidence.isPublic || evidence.isSensitive) {
      throw new Error(invalidVisibilityMessage(evidenceId));
    }
    if (evidence.type !== 'experience') {
      throw new Error(invalidTypeMessage(evidenceId, evidence.type));
    }

    return evidence;
  });
}

function mergeEvidenceById(
  evidenceItems: SkillDetailSources['evidenceItems'],
): SkillDetailSources['evidenceItems'] {
  const seen = new Set<string>();

  return evidenceItems.filter((item) => {
    if (seen.has(item.id)) return false;

    seen.add(item.id);
    return true;
  });
}

function evidenceMatchesSkill(
  evidence: SkillDetailSources['evidenceItems'][number],
  skillName: string,
): boolean {
  return [evidence.label, evidence.title, ...(evidence.technologies ?? [])].some(
    (candidate) => candidate === skillName,
  );
}

function getRelatedSkillsFromEvidence(
  evidenceItems: SkillDetailSources['evidenceItems'],
  skills: SkillDetailSources['skills'],
): SkillDetailSources['skills'] {
  const skillByName = new Map(skills.map((skill) => [skill.name, skill]));

  return mergeSkillsById(
    evidenceItems.flatMap((evidence) =>
      (evidence.technologies ?? []).flatMap((technology) => {
        const skill = skillByName.get(technology);

        return skill ? [skill] : [];
      }),
    ),
  );
}

function mergeSkillsById(
  skills: SkillDetailSources['skills'],
): SkillDetailSources['skills'] {
  const seen = new Set<string>();

  return skills.filter((skill) => {
    if (seen.has(skill.id)) return false;

    seen.add(skill.id);
    return true;
  });
}
