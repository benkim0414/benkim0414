import type { Skill } from './skill-list.types';

export function getSkillDetailPath(skillId: string): string {
  return `/skills/${encodeURIComponent(skillId)}`;
}

export function getSkillDetailPathForSkillName(
  skillName: string,
  skills: readonly Pick<Skill, 'id' | 'name' | 'keywords'>[],
): string | undefined {
  const normalizedSkillName = normalizeSkillRouteLabel(skillName);
  const exactSkill = skills.find(
    (candidate) =>
      normalizeSkillRouteLabel(candidate.name) === normalizedSkillName ||
      normalizeSkillRouteLabel(candidate.id) === normalizedSkillName,
  );
  const keywordMatches = skills.filter((candidate) =>
    candidate.keywords.some(
      (keyword) => normalizeSkillRouteLabel(keyword) === normalizedSkillName,
    ),
  );
  const skill =
    exactSkill ?? (keywordMatches.length === 1 ? keywordMatches[0] : undefined);

  return skill ? getSkillDetailPath(skill.id) : undefined;
}

function normalizeSkillRouteLabel(label: string): string {
  return label.toLowerCase().replace(/[^a-z0-9]+/g, '');
}
