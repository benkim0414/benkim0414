import { getSkillBrand } from '../skills/skill-brand';
import type { CapabilityEvidenceItem } from './devops-capability-evidence.types';
import { getGithubRepositoryLabel } from './capability-evidence-url';

const MAX_COMPACT_TITLE_LENGTH = 28;

function firstKnownTechnology(
  technologies: readonly string[] | undefined,
): string | undefined {
  return technologies?.find((technology) => getSkillBrand(technology));
}

export function getCapabilityEvidenceLabel(
  evidence: CapabilityEvidenceItem,
): string {
  const technology = firstKnownTechnology(evidence.technologies);
  const repositoryLabel =
    evidence.type === 'project'
      ? getGithubRepositoryLabel(evidence.proofUrl)
      : undefined;

  return (
    evidence.label ??
    technology ??
    repositoryLabel ??
    (evidence.title.length <= MAX_COMPACT_TITLE_LENGTH
      ? evidence.title
      : evidence.title.slice(0, MAX_COMPACT_TITLE_LENGTH - 1).trimEnd() + '…')
  );
}
