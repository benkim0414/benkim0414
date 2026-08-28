import type { CertificationRecord } from '../certifications/certification.types';
import type { GlobalSearchResult } from './global-search.types';

export function createCertificationSearchResults(
  certifications: readonly CertificationRecord[],
): GlobalSearchResult[] {
  return certifications.map((certification) => ({
    id: `certification:${certification.id}`,
    label: certification.title,
    href: certification.url,
    group: 'Certifications',
    keywords: [
      certification.metadata?.name,
      certification.metadata?.id,
      certification.metadata?.completedAt,
      ...certification.skills,
    ].filter((keyword): keyword is string => Boolean(keyword)),
  }));
}
