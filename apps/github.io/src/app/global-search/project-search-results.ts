import type { Project } from '../projects/project-list.types';
import type { GlobalSearchResult } from './global-search.types';

export function createProjectSearchResults(
  projects: readonly Project[],
): GlobalSearchResult[] {
  return projects.map((project) => ({
    id: `project:${project.id}`,
    label: project.title,
    href: project.githubUrl,
    group: 'Projects',
    keywords: [
      project.description,
      ...project.skills.flatMap((skill) =>
        skill.brandLabel ? [skill.label, skill.brandLabel] : [skill.label],
      ),
    ],
  }));
}
