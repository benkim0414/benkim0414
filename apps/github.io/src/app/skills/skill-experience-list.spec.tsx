import { render } from '@testing-library/react';

import { devOpsCapabilityEvidenceItems } from '../devops-capability-evidence/devops-capability-evidence.data';
import { SkillExperienceList } from './skill-experience-list';

const experienceFixtures = devOpsCapabilityEvidenceItems.filter((item) =>
  [
    'argocd-environment-state-from-version-control',
    'deterministic-kubernetes-overlays',
  ].includes(item.id),
);

describe('SkillExperienceList', () => {
  it('renders public evidence as divided semantic rows', () => {
    expect(experienceFixtures).toHaveLength(2);

    const { getAllByRole, getByRole, getByText, queryByTestId } = render(
      <SkillExperienceList evidence={experienceFixtures} />,
    );

    expect(getByRole('list', { name: 'Supporting experience' })).toBeTruthy();
    expect(getAllByRole('listitem')).toHaveLength(2);
    expect(
      getByRole('heading', {
        level: 3,
        name: 'Environment state from version control',
      }),
    ).toBeTruthy();
    expect(getByText(experienceFixtures[0].summary)).toBeTruthy();
    expect(getByText(experienceFixtures[1].summary)).toBeTruthy();
    expect(queryByTestId('skill-card')).toBeNull();
    expect(queryByTestId('project-card')).toBeNull();
  });
});
