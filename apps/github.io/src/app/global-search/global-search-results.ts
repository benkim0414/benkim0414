import type { CertificationRecord } from '../certifications/certification.types';
import type { Project } from '../projects/project-list.types';
import type { Skill } from '../skills/skill-list.types';
import type { GlobalSearchResult } from './global-search.types';
import { createCertificationSearchResults } from './certification-search-results';
import { createProjectSearchResults } from './project-search-results';
import { createSkillSearchResults } from './skill-search-results';

export interface GlobalSearchResultSources {
  readonly certifications: readonly CertificationRecord[];
  readonly projects: readonly Project[];
  readonly skills: readonly Skill[];
}

export function createGlobalSearchResults({
  certifications,
  projects,
  skills,
}: GlobalSearchResultSources): GlobalSearchResult[] {
  return [
    ...createCertificationSearchResults(certifications),
    ...createSkillSearchResults(skills),
    ...createProjectSearchResults(projects),
  ];
}
