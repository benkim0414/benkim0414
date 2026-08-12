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
  it('renders every evidence summary as an Astryx blockquote', () => {
    expect(experienceFixtures).toHaveLength(2);

    const { container, getAllByRole, getByRole, queryAllByRole } = render(
      <SkillExperienceList evidence={experienceFixtures} />,
    );

    expect(getByRole('list', { name: 'Supporting experience' })).toBeTruthy();
    expect(getAllByRole('listitem')).toHaveLength(2);
    expect(getAllByRole('heading', { level: 3 })).toHaveLength(2);

    const blockquotes = [...container.querySelectorAll('blockquote')];

    expect(blockquotes).toHaveLength(2);
    expect(blockquotes.map(({ textContent }) => textContent)).toEqual(
      experienceFixtures.map(({ summary }) => summary),
    );
    expect(queryAllByRole('separator')).toHaveLength(0);
  });
});
