import { render, within } from '@testing-library/react';

import { devOpsCapabilityEvidenceItems } from '../devops-capability-evidence/devops-capability-evidence.data';
import { skills } from './skill-list.data';
import { SkillExperienceList } from './skill-experience-list';

const experienceFixtures = devOpsCapabilityEvidenceItems.filter((item) =>
  [
    'argocd-environment-state-from-version-control',
    'deterministic-kubernetes-overlays',
  ].includes(item.id),
);

describe('SkillExperienceList', () => {
  it('renders every evidence summary as an Astryx Card', () => {
    expect(experienceFixtures).toHaveLength(2);

    const { container, getAllByRole, getByRole, queryAllByRole } = render(
      <SkillExperienceList evidence={experienceFixtures} />,
    );

    expect(getByRole('list', { name: 'Supporting experience' })).toBeTruthy();
    const listItems = getAllByRole('listitem');

    expect(listItems).toHaveLength(experienceFixtures.length);
    expect(getAllByRole('heading', { level: 3 })).toHaveLength(
      experienceFixtures.length,
    );

    expect(container.querySelectorAll('blockquote')).toHaveLength(0);

    const cards = Array.from(container.querySelectorAll('.astryx-card'));

    expect(cards).toHaveLength(experienceFixtures.length);

    cards.forEach((card, index) => {
      const item = experienceFixtures[index];
      const cardQueries = within(card as HTMLElement);
      const spacingWrapper = card.parentElement;

      expect(spacingWrapper).not.toBe(listItems[index]);
      expect(spacingWrapper?.parentElement).toBe(listItems[index]);
      expect(
        spacingWrapper?.querySelectorAll(':scope > .astryx-card'),
      ).toHaveLength(1);

      expect(
        cardQueries.getByRole('heading', {
          level: 3,
          name: item.title,
        }),
      ).toBeTruthy();
      expect(
        cardQueries.getByText(item.summary, { selector: 'p' }),
      ).toBeTruthy();
    });
    expect(queryAllByRole('separator')).toHaveLength(0);
  });

  it('renders evidence facts and relevant skill tokens when skill matches exist', () => {
    const [evidence] = devOpsCapabilityEvidenceItems.filter(
      (item) => item.id === 'github-actions-gitops-handoff',
    );

    expect(evidence).toBeDefined();
    expect(evidence.details?.facts.length).toBeGreaterThan(0);
    expect(evidence.technologies).toContain('GitHub Actions');
    expect(evidence.technologies).toContain('Argo CD');

    const { getByRole, getByText } = render(
      <SkillExperienceList evidence={[evidence]} skills={skills} />,
    );

    expect(
      getByText(evidence.details?.facts[0] ?? '', { selector: 'p' }),
    ).toBeTruthy();

    const relevantSkills = getByRole('list', { name: 'Relevant skills' });

    expect(within(relevantSkills).getByText('GitHub Actions')).toBeTruthy();
    expect(within(relevantSkills).getByText('Argo CD')).toBeTruthy();
  });

  it('does not repeat duplicate evidence facts inside the same card', () => {
    const [evidence] = devOpsCapabilityEvidenceItems.filter(
      (item) => item.id === 'github-actions-gitops-handoff',
    );
    const duplicateFact = 'Argo CD reconciles the version-controlled manifests.';

    expect(evidence).toBeDefined();
    if (!evidence?.details) {
      throw new Error('Expected GitHub Actions evidence details fixture.');
    }

    const { getAllByText } = render(
      <SkillExperienceList
        evidence={[
          {
            ...evidence,
            details: {
              ...evidence.details,
              facts: [
                evidence.summary,
                duplicateFact,
                duplicateFact,
                'Deployment manifests stay reviewable before rollout.',
              ],
            },
          },
        ]}
        skills={skills}
      />,
    );

    expect(getAllByText(evidence.summary, { selector: 'p' })).toHaveLength(1);
    expect(getAllByText(duplicateFact, { selector: 'p' })).toHaveLength(1);
  });
});
