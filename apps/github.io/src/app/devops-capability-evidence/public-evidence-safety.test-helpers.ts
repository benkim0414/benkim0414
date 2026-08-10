import type { CapabilityEvidenceItem } from './devops-capability-evidence.types';

const prohibitedPublicEvidencePatterns = [
  ['URL', /https?:\/\//i],
  ['12-digit account identifier', /\b\d{12}\b/],
  [
    'private source or repository name',
    /private[- ]?(?:source|repository)|(?:source|repository) name/i,
  ],
  [
    'filesystem or parameter path',
    /filesystem path|parameter[- ]?path|(?:^|[\s"'])\/(?:[a-z0-9._~-]+\/)+[a-z0-9._~-]+|(?:^|[\s"'])[a-z]:\\(?:[^\\\s"']+\\)+[^\\\s"']+/i,
  ],
  [
    'employer, customer, client, organization, or business-domain language',
    /employer|customer|client|organization|business[- ]domain/i,
  ],
  [
    'internal service, workflow, module, or image name',
    /internal (?:service|workflow|module|image)(?: name)?|(?:service|workflow|module|image) name/i,
  ],
  [
    'raw personal identity',
    /raw personal identity|personal identity|person name/i,
  ],
  [
    'negative or limitation wording',
    /unversioned|over-broad authorization|(?:shared|unattributed) release identit(?:y|ies)|(?:failing|unwired) (?:regression )?suite|service-onboarding defect|worktree incompatibility|manual secret creation|manual deployment residue|authorization (?:gap|missing)|requires one manual intervention|remains manual|does not verify successful build completion|not fully measurable|deployment incident|delayed release|blast radius/i,
  ],
] as const;

export const expectPublicSafeText = (
  text: readonly string[],
  approvedText?: readonly string[],
): void => {
  const publicText = JSON.stringify(text);

  for (const [category, pattern] of prohibitedPublicEvidencePatterns) {
    expect(publicText, category).not.toMatch(pattern);
  }

  if (approvedText) {
    const approved = new Set(approvedText);
    const unreviewed = text.filter((value) => !approved.has(value));

    expect(unreviewed, 'unreviewed public catalog text').toEqual([]);
  }
};

export const expectPublicSafeEvidence = (
  items: readonly CapabilityEvidenceItem[],
  approvedText: readonly string[],
): void => {
  for (const item of items) {
    expect(item.isPublic, `${item.id} must be public`).toBe(true);
    expect(item.isSensitive, `${item.id} must not be sensitive`).not.toBe(true);
    expect(item.organization, `${item.id} organization`).toBeUndefined();
    expect(item.proofUrl, `${item.id} proof URL`).toBeUndefined();
  }

  const publicationText = items.flatMap((item) => [
    item.title,
    ...(item.label ? [item.label] : []),
    item.summary,
    ...(item.technologies ?? []),
    ...(item.details
      ? [
          item.details.initiative.label,
          ...item.details.metrics.map(({ label }) => label),
          ...item.details.facts,
        ]
      : []),
  ]);

  expectPublicSafeText(publicationText, approvedText);
};
