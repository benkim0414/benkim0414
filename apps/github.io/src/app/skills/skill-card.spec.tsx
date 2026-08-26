import { LinkProvider } from '@astryxdesign/core/Link';
import { render } from '@testing-library/react';
import type { ReactNode } from 'react';
import { MemoryRouter } from 'react-router-dom';

import { RouterLink } from '../router-link';
import { SkillCard } from './skill-card';
import type { Skill } from './skill-list.types';

const baseSkill: Skill = {
  id: 'kubernetes',
  name: 'Kubernetes',
  description:
    'Container orchestration for deploying, scaling, and operating cloud-native workloads.',
  categories: ['Container', 'Cloud'],
  confidence: 4,
  iconSlug: 'kubernetes',
  keywords: ['containers', 'orchestration'],
};

function RouterTestProviders({ children }: { children: ReactNode }) {
  return (
    <MemoryRouter>
      <LinkProvider component={RouterLink}>{children}</LinkProvider>
    </MemoryRouter>
  );
}

function renderSkillCard(ui: ReactNode) {
  return render(ui, { wrapper: RouterTestProviders });
}

describe('SkillCard', () => {
  it('lets standalone Astryx Card usage keep its content-driven default height', () => {
    const { container } = renderSkillCard(<SkillCard skill={baseSkill} />);
    const card = container.querySelector('.astryx-card');
    const style = card?.getAttribute('style') ?? '';

    expect(style).not.toContain('--x-height');
    expect(style).not.toContain('--x-minHeight');
  });

  it('renders the skill name as the title', () => {
    const { getByRole } = renderSkillCard(<SkillCard skill={baseSkill} />);

    expect(getByRole('heading', { name: 'Kubernetes', level: 3 })).toBeTruthy();
  });

  it('does not render a skill logo in the card', () => {
    const { queryByRole } = renderSkillCard(<SkillCard skill={baseSkill} />);

    expect(queryByRole('img', { name: 'Kubernetes' })).toBeNull();
  });

  it('renders the skill description as secondary body text', () => {
    const { getByText } = renderSkillCard(<SkillCard skill={baseSkill} />);

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

  it('renders title, confidence, and description in order without a card header', () => {
    const { getByRole, getByTestId, getByText, queryByTestId } = renderSkillCard(
      <SkillCard skill={baseSkill} />,
    );

    const title = getByRole('heading', { name: 'Kubernetes' });
    const confidence = getByText('Confident');
    const description = getByText(
      'Container orchestration for deploying, scaling, and operating cloud-native workloads.',
    );
    const titleConfidenceGroup = getByTestId('skill-card-title-confidence');

    expect(queryByTestId('skill-card-header')).toBeNull();
    expect(title.compareDocumentPosition(confidence)).toBe(
      Node.DOCUMENT_POSITION_FOLLOWING,
    );
    expect(confidence.compareDocumentPosition(description)).toBe(
      Node.DOCUMENT_POSITION_FOLLOWING,
    );
    expect(titleConfidenceGroup.contains(title)).toBe(true);
    expect(titleConfidenceGroup.contains(confidence)).toBe(true);
    expect(titleConfidenceGroup.contains(description)).toBe(false);
  });

  it('renders the skill confidence as accessible text metadata', () => {
    const { getByText } = renderSkillCard(<SkillCard skill={baseSkill} />);

    expect(getByText('Self-rated confidence: Confident')).toBeTruthy();
  });

  it('renders every skill category before the skill title', () => {
    const { getByText, getByRole } = renderSkillCard(<SkillCard skill={baseSkill} />);

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
    const { getByRole, getByText, queryByText } = renderSkillCard(
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
    const { getByRole, getByTestId } = renderSkillCard(<SkillCard skill={baseSkill} />);

    const title = getByRole('heading', { name: 'Kubernetes', level: 3 });
    const card = getByTestId('skill-card');

    expect(card.getAttribute('aria-labelledby')).toBe(title.id);
  });

  it('gives duplicate skill cards distinct accessible title targets', () => {
    const { getAllByTestId } = renderSkillCard(
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
    const { container, queryByText } = renderSkillCard(<SkillCard skill={baseSkill} />);

    expect(
      container.querySelector('[data-testid="certification-citation"]'),
    ).toBeNull();
    expect(queryByText('Certifications')).toBeNull();
  });

  it('renders multiple certification citations at the bottom of the card', () => {
    const { getAllByTestId, getByRole, queryByText } = renderSkillCard(
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

  it('links the card to its canonical skill detail route', () => {
    const { getByRole } = renderSkillCard(<SkillCard skill={baseSkill} />);

    expect(getByRole('link', { name: 'Kubernetes' }).getAttribute('href')).toBe(
      '/skills/kubernetes',
    );
  });

  it('keeps certification links independent from the card route link', () => {
    const { getByRole } = renderSkillCard(
      <SkillCard
        skill={{
          ...baseSkill,
          certifications: [
            {
              title: 'CKA',
              url: 'https://example.com/cka',
              skills: ['Kubernetes'],
              expiresAt: '2028-02-26T10:59:00+11:00',
            },
          ],
        }}
      />,
    );

    const cardLink = getByRole('link', { name: 'Kubernetes' });
    const citationLink = getByRole('doc-noteref', { name: 'Citation 1: CKA' });

    expect(cardLink.contains(citationLink)).toBe(false);
    expect(cardLink.getAttribute('href')).toBe('/skills/kubernetes');
    expect(citationLink.getAttribute('href')).toBe('https://example.com/cka');
  });
});
