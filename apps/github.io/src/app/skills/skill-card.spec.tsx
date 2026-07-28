import { render } from '@testing-library/react';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { SkillCard } from './skill-card';
import type { Skill } from './skill-list.types';

const baseSkill: Skill = {
  id: 'kubernetes',
  name: 'Kubernetes',
  description:
    'Container orchestration for deploying, scaling, and operating cloud-native workloads.',
  category: 'Container',
  level: 4,
  iconSlug: 'kubernetes',
  keywords: ['containers', 'orchestration'],
};

describe('SkillCard', () => {
  it('lets Astryx Card use its content-driven default height', () => {
    const source = readFileSync(
      join(process.cwd(), 'src/app/skills/skill-card.tsx'),
      'utf8',
    );

    expect(source).not.toContain('minHeight');
    expect(source).not.toContain('height=');
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
