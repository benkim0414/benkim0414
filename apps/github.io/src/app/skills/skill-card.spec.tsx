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

    expect(getByRole('heading', { name: 'Kubernetes' })).toBeTruthy();
  });

  it('renders the skill description as supporting text', () => {
    const { getByText } = render(<SkillCard skill={baseSkill} />);

    expect(
      getByText(
        'Container orchestration for deploying, scaling, and operating cloud-native workloads.',
      ),
    ).toBeTruthy();
  });

  it('renders the skill rating as accessible star metadata', () => {
    const { getByText } = render(<SkillCard skill={baseSkill} />);

    expect(getByText('4 out of 5')).toBeTruthy();
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

  it('renders compact cards without category badges', () => {
    const { getByRole, getByText, queryByText } = render(
      <SkillCard skill={baseSkill} variant="compact" />,
    );

    expect(getByRole('heading', { name: 'Kubernetes' })).toBeTruthy();
    expect(queryByText('Container')).toBeNull();
    expect(queryByText('Cloud')).toBeNull();
    expect(
      getByText(
        'Container orchestration for deploying, scaling, and operating cloud-native workloads.',
      ),
    ).toBeTruthy();
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
    const { container } = render(<SkillCard skill={baseSkill} />);

    expect(
      container.querySelector('[data-testid="certification-citation"]'),
    ).toBeNull();
  });

  it('renders multiple certification citations at the bottom of the card', () => {
    const { getByRole, getAllByTestId } = render(
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

    expect(getAllByTestId('certification-citation')).toHaveLength(3);
    expect(getByRole('doc-noteref', { name: 'Citation 1: KCNA' })).toBeTruthy();
    expect(getByRole('doc-noteref', { name: 'Citation 2: CKA' })).toBeTruthy();
    expect(getByRole('doc-noteref', { name: 'Citation 3: CKAD' })).toBeTruthy();
  });
});
