import { kubernetesCertifications } from '../certifications/kubernetes-certifications.data';
import { sampleProjects } from '../projects/project-list.data';
import { skills } from '../skills/skill-list.data';
import { createGlobalSearchResults } from './global-search-results';

describe('createGlobalSearchResults', () => {
  it('orders result groups as certifications, skills, and projects', () => {
    const results = createGlobalSearchResults({
      certifications: Object.values(kubernetesCertifications),
      projects: sampleProjects,
      skills,
    });

    expect([...new Set(results.map((result) => result.group))]).toEqual([
      'Certifications',
      'Skills',
      'Projects',
    ]);
  });
});
