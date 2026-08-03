import { describe, expect, it } from 'vitest';

import { sampleProjects } from './project-list.data';

describe('project data', () => {
  it('provides stable project data for ProjectCard surfaces', () => {
    expect(sampleProjects).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: 'github-io-portfolio',
          title: 'GitHub.io portfolio',
          githubUrl: 'https://github.com/benkim0414/benkim0414',
          skills: expect.arrayContaining([
            expect.objectContaining({ label: 'React' }),
            expect.objectContaining({ label: 'TypeScript' }),
            expect.objectContaining({ label: 'GitHub' }),
          ]),
        }),
      ]),
    );
  });

  it('keeps future evidence linkage as optional project metadata', () => {
    const project = sampleProjects.find(
      (item) => item.id === 'github-io-portfolio',
    );

    expect(project?.evidenceIds).toEqual(
      expect.arrayContaining(['devops-roadmap-project']),
    );
    expect(project?.capabilityKeys).toEqual(
      expect.arrayContaining(['deployment-automation']),
    );
  });
});
