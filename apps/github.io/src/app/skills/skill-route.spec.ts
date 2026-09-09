import {
  getSkillDetailPath,
  getSkillDetailPathForSkillName,
} from './skill-route';
import type { Skill } from './skill-list.types';

const routeSkills: readonly Pick<Skill, 'id' | 'name' | 'keywords'>[] = [
  { id: 'argo-cd', name: 'Argo CD', keywords: ['gitops', 'argocd'] },
  { id: 'amazon-ecr', name: 'Amazon ECR', keywords: ['aws'] },
  { id: 'github-packages', name: 'GitHub Packages', keywords: ['npm'] },
  { id: 'aws-codepipeline', name: 'AWS CodePipeline', keywords: ['aws'] },
];

describe('getSkillDetailPath', () => {
  it('builds the canonical skill detail path', () => {
    expect(getSkillDetailPath('kubernetes')).toBe('/skills/kubernetes');
  });

  it('encodes a supplied route segment', () => {
    expect(getSkillDetailPath('c sharp')).toBe('/skills/c%20sharp');
  });
});

describe('getSkillDetailPathForSkillName', () => {
  it('builds the canonical detail path for a matching skill name alias', () => {
    expect(getSkillDetailPathForSkillName('ArgoCD', routeSkills)).toBe(
      '/skills/argo-cd',
    );
  });

  it('builds the canonical detail path for GitHub Packages', () => {
    expect(
      getSkillDetailPathForSkillName('GitHub Packages', routeSkills),
    ).toBe('/skills/github-packages');
  });

  it('does not build a detail path for an ambiguous keyword alias', () => {
    expect(getSkillDetailPathForSkillName('AWS', routeSkills)).toBe(undefined);
  });

  it('returns undefined when the label has no matching skill detail page', () => {
    expect(getSkillDetailPathForSkillName('Unknown Skill', routeSkills)).toBe(
      undefined,
    );
  });
});
