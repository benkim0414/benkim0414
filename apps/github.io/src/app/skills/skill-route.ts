export function getSkillDetailPath(skillId: string): string {
  return `/skills/${encodeURIComponent(skillId)}`;
}
