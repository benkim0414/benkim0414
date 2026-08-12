import { render } from '@testing-library/react';

import { devOpsCapabilityEvidenceItems } from '../devops-capability-evidence/devops-capability-evidence.data';
import { sampleProjects } from '../projects/project-list.data';
import { skillDetailRecords } from './skill-detail.data';
import { SkillDetailPage } from './skill-detail-page';
import { resolveSkillDetail } from './skill-detail-resolver';
import { skills } from './skill-list.data';

const productionSources = {
  skills,
  detailRecords: skillDetailRecords,
  evidenceItems: devOpsCapabilityEvidenceItems,
  projects: sampleProjects,
};

function getResolvedDetail(skillId: string) {
  const result = resolveSkillDetail(skillId, productionSources);

  if (result.status !== 'found') {
    throw new Error(`Expected ${skillId} to resolve.`);
  }

  return result.value;
}

describe('SkillDetailPage', () => {
  it('renders the enriched Kubernetes detail surface', () => {
    const detail = getResolvedDetail('kubernetes');
    const { container, getByRole, getByText } = render(
      <SkillDetailPage detail={detail} />,
    );

    expect(getByRole('main')).toBeTruthy();
    expect(getByRole('navigation', { name: 'Skill breadcrumb' })).toBeTruthy();
    expect(getByRole('heading', { level: 1, name: 'Kubernetes' })).toBeTruthy();
    expect(getByText('Container')).toBeTruthy();
    expect(getByText('Cloud')).toBeTruthy();
    expect(getByText('4 out of 5')).toBeTruthy();
    expect(
      getByRole('heading', { level: 2, name: 'In practice' }),
    ).toBeTruthy();
    const evidenceBlockquotes = [...container.querySelectorAll('blockquote')];

    expect(evidenceBlockquotes).toHaveLength(detail.experienceEvidence.length);
    expect(evidenceBlockquotes.map(({ textContent }) => textContent)).toEqual(
      detail.experienceEvidence.map(({ summary }) => summary),
    );
    expect(getByRole('heading', { level: 2, name: 'Projects' })).toBeTruthy();
    expect(
      getByRole('heading', { level: 3, name: 'benkim0414/homelab' }),
    ).toBeTruthy();
    expect(
      getByRole('heading', { level: 2, name: 'Certifications' }),
    ).toBeTruthy();
  });

  it('renders a basic skill without empty enrichment sections', () => {
    const detail = getResolvedDetail('react');
    const { getByRole, getByText, queryByRole } = render(
      <SkillDetailPage detail={detail} />,
    );

    expect(getByRole('heading', { level: 1, name: 'React' })).toBeTruthy();
    expect(getByText(detail.skill.description)).toBeTruthy();
    expect(getByText('Framework')).toBeTruthy();
    expect(getByText('3 out of 5')).toBeTruthy();
    expect(
      queryByRole('heading', { level: 2, name: 'In practice' }),
    ).toBeNull();
    expect(
      queryByRole('heading', { level: 2, name: 'Projects' }),
    ).toBeNull();
    expect(
      queryByRole('heading', { level: 2, name: 'Certifications' }),
    ).toBeNull();
  });

  it('focuses the new page heading after an in-place skill change', () => {
    const reactDetail = getResolvedDetail('react');
    const kubernetesDetail = getResolvedDetail('kubernetes');
    const { getByRole, rerender } = render(
      <SkillDetailPage detail={reactDetail} />,
    );
    const reactHeading = getByRole('heading', { level: 1, name: 'React' });

    expect(document.activeElement).not.toBe(reactHeading);

    rerender(<SkillDetailPage detail={kubernetesDetail} />);

    expect(
      getByRole('heading', { level: 1, name: 'Kubernetes' }),
    ).toBe(document.activeElement);
  });
});
