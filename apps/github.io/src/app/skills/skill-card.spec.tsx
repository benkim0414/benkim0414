import { render } from '@testing-library/react';

import { SkillCard } from './skill-card';
import type { Skill } from './skill-list.types';

const baseSkill: Skill = {
  id: 'kubernetes',
  name: 'Kubernetes',
  description:
    'Container orchestration for deploying, scaling, and operating cloud-native workloads.',
  categories: ['Container', 'Cloud'],
  level: 4,
  iconSlug: 'kubernetes',
  keywords: ['containers', 'orchestration'],
};

describe('SkillCard', () => {
  it('lets standalone Astryx Card usage keep its content-driven default height', () => {
    const { container } = render(<SkillCard skill={baseSkill} />);
    const card = container.querySelector('.astryx-card');
    const style = card?.getAttribute('style') ?? '';

    expect(style).not.toContain('--x-height');
    expect(style).not.toContain('--x-minHeight');
  });

  it('renders the skill name as the title', () => {
    const { getByRole } = render(<SkillCard skill={baseSkill} />);

    expect(getByRole('heading', { name: 'Kubernetes', level: 3 })).toBeTruthy();
  });

  it('renders the skill description as secondary body text', () => {
    const { getByText } = render(<SkillCard skill={baseSkill} />);

    const description = getByText(
      'Container orchestration for deploying, scaling, and operating cloud-native workloads.',
    );

    expect(description.closest('.astryx-text')?.getAttribute('data-type')).toBe(
      'body',
    );
    expect(description.closest('.astryx-text')?.getAttribute('data-color')).toBe(
      'secondary',
    );
  });

  it('renders the skill rating after the title and before the description', () => {
    const { getByRole, getByTestId, getByText } = render(
      <SkillCard skill={baseSkill} />,
    );

    const title = getByRole('heading', { name: 'Kubernetes' });
    const rating = getByText('4 out of 5');
    const description = getByText(
      'Container orchestration for deploying, scaling, and operating cloud-native workloads.',
    );
    const titleRatingGroup = getByTestId('skill-card-title-rating');

    expect(title.compareDocumentPosition(rating)).toBe(
      Node.DOCUMENT_POSITION_FOLLOWING,
    );
    expect(rating.compareDocumentPosition(description)).toBe(
      Node.DOCUMENT_POSITION_FOLLOWING,
    );
    expect(titleRatingGroup.contains(title)).toBe(true);
    expect(titleRatingGroup.contains(rating)).toBe(true);
    expect(titleRatingGroup.contains(description)).toBe(false);
  });

  it('renders every skill category before the skill title', () => {
    const { getByText, getByRole } = render(<SkillCard skill={baseSkill} />);

    const containerCategory = getByText('Container');
    const cloudCategory = getByText('Cloud');
    const title = getByRole('heading', { name: 'Kubernetes' });

    expect(containerCategory.compareDocumentPosition(title)).toBe(
      Node.DOCUMENT_POSITION_FOLLOWING,
    );
    expect(cloudCategory.compareDocumentPosition(title)).toBe(
      Node.DOCUMENT_POSITION_FOLLOWING,
    );
  });

  it('keeps the compact title as the accessible card label', () => {
    const { getByRole, getByTestId } = render(<SkillCard skill={baseSkill} />);

    const title = getByRole('heading', { name: 'Kubernetes', level: 3 });
    const card = getByTestId('skill-card');

    expect(card.getAttribute('aria-labelledby')).toBe(title.id);
  });

  it('gives duplicate skill cards distinct accessible title targets', () => {
    const { getAllByTestId } = render(
      <>
        <SkillCard skill={baseSkill} />
        <SkillCard skill={baseSkill} />
      </>,
    );

    const titleIds = getAllByTestId('skill-card').map((card) => {
      const titleId = card.getAttribute('aria-labelledby');

      expect(titleId).toBeTruthy();
      expect(card.ownerDocument.getElementById(titleId ?? '')?.textContent).toBe(
        'Kubernetes',
      );

      return titleId;
    });

    expect(new Set(titleIds).size).toBe(2);
  });

  it('omits certification citations when the skill has no certifications', () => {
    const { container, queryByText } = render(<SkillCard skill={baseSkill} />);

    expect(
      container.querySelector('[data-testid="certification-citation"]'),
    ).toBeNull();
    expect(queryByText('Certifications')).toBeNull();
  });

  it('renders multiple certification citations at the bottom of the card', () => {
    const { getAllByTestId, getByRole, queryByText } = render(
      <SkillCard
        skill={{
          ...baseSkill,
          certifications: [
            {
              title: 'KCNA',
              url: 'https://example.com/kcna',
              skills: ['Kubernetes'],
              expiresAt: '2028-02-26T10:59:00+11:00',
            },
            {
              title: 'CKA',
              url: 'https://example.com/cka',
              skills: ['Kubernetes'],
              expiresAt: '2028-02-26T10:59:00+11:00',
            },
            {
              title: 'CKAD',
              url: 'https://example.com/ckad',
              skills: ['Kubernetes'],
              expiresAt: '2028-02-26T10:59:00+11:00',
            },
          ],
        }}
      />,
    );

    expect(queryByText('Certifications')).toBeNull();
    expect(getAllByTestId('certification-citation')).toHaveLength(3);
    expect(getByRole('doc-noteref', { name: 'Citation 1: KCNA' })).toBeTruthy();
    expect(getByRole('doc-noteref', { name: 'Citation 2: CKA' })).toBeTruthy();
    expect(getByRole('doc-noteref', { name: 'Citation 3: CKAD' })).toBeTruthy();
  });
});
