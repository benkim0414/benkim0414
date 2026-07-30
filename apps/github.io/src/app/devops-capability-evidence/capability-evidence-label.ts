import { getSkillBrand } from '../skills/skill-brand';
import type { CapabilityEvidenceItem } from './devops-capability-evidence.types';
import { getGithubRepositoryLabel } from './capability-evidence-url';

const MAX_COMPACT_TITLE_WORDS = 2;
const MAX_UNCHANGED_TITLE_WORDS = 3;

const titleStopWords = new Set([
  'a',
  'across',
  'an',
  'and',
  'for',
  'from',
  'in',
  'of',
  'operational',
  'the',
  'to',
  'using',
  'with',
]);

const titleWordAliases = new Map([
  ['environments', 'env'],
  ['environment', 'env'],
]);

const titleWordPriority = new Map([
  ['deployment', 0],
  ['delivery', 0],
  ['automation', 1],
  ['integration', 1],
  ['testing', 1],
  ['test', 1],
  ['security', 1],
  ['observability', 1],
  ['infrastructure', 1],
  ['ownership', 2],
  ['env', 3],
]);

function firstKnownTechnology(
  technologies: readonly string[] | undefined,
): string | undefined {
  return technologies?.find((technology) => getSkillBrand(technology));
}

function compactTitleLabel(title: string): string {
  const titleWords = title.split(/\s+/).filter((word) => word.length > 0);

  if (titleWords.length <= MAX_UNCHANGED_TITLE_WORDS) {
    return title;
  }

  const words = titleWords
    .map((word, index) => ({
      index,
      output: word.replace(/^[^\dA-Za-z]+|[^\dA-Za-z]+$/g, ''),
    }))
    .map(({ index, output }) => ({
      index,
      normalized: output.toLowerCase(),
      output,
    }))
    .filter(
      ({ normalized, output }) =>
        output.length > 0 && !titleStopWords.has(normalized),
    )
    .map(({ index, normalized, output }) => ({
      index,
      normalized: titleWordAliases.get(normalized) ?? normalized,
      output: titleWordAliases.get(normalized) ?? output,
    }));

  if (words.length === 0) {
    return title;
  }

  const compactWords = [...words]
    .sort((left, right) => {
      const leftPriority = titleWordPriority.get(left.normalized) ?? 10;
      const rightPriority = titleWordPriority.get(right.normalized) ?? 10;

      return leftPriority - rightPriority || left.index - right.index;
    })
    .slice(0, MAX_COMPACT_TITLE_WORDS)
    .map(({ output }) => output);

  return compactWords
    .map((word, index) =>
      index === 0 ? word[0].toUpperCase() + word.slice(1) : word,
    )
    .join(' ');
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
    compactTitleLabel(evidence.title)
  );
}
