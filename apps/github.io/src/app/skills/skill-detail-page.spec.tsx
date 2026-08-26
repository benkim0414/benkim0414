import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { render, within } from '@testing-library/react';
import { VStack } from '@astryxdesign/core/Layout';

import { devOpsCapabilityEvidenceItems } from '../devops-capability-evidence/devops-capability-evidence.data';
import { experiences } from '../experience/experience.data';
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
  experiences,
};

function getResolvedDetail(skillId: string) {
  const result = resolveSkillDetail(skillId, productionSources);

  if (result.status !== 'found') {
    throw new Error(`Expected ${skillId} to resolve.`);
  }

  return result.value;
}

function readAppSource(relativePath: string): string {
  const appRoot = process.cwd().endsWith('/apps/github.io')
    ? process.cwd()
    : resolve(process.cwd(), 'apps/github.io');

  return readFileSync(resolve(appRoot, relativePath), 'utf8');
}

describe('SkillDetailPage', () => {
  it('renders a non-scrollable main without page-local navigation', () => {
    const detail = getResolvedDetail('kubernetes');
    const { container, getByRole, queryByRole } = render(
      <SkillDetailPage detail={detail} />,
    );
    const { getByTestId } = render(
      <VStack
        as="main"
        data-testid="scrollable-content-control"
        gap={6}
        paddingBlock={6}
        paddingInline={4}
      />,
    );
    const main = getByRole('main', { name: 'Skill detail' });

    expect(queryByRole('navigation', { name: 'Global navigation' })).toBeNull();
    expect(queryByRole('button', { name: 'Search skills' })).toBeNull();
    expect(container.querySelectorAll('.astryx-layout-content')).toHaveLength(
      0,
    );
    expect(main.className).toBe(
      getByTestId('scrollable-content-control').className,
    );
    expect(
      within(main).getByRole('navigation', { name: 'Skill breadcrumb' }),
    ).toBeTruthy();
  });

  it('does not apply a local maximum-width or centering margin to detail content', () => {
    const { getByTestId } = render(
      <SkillDetailPage detail={getResolvedDetail('kubernetes')} />,
    );
    const { getByTestId: getControlByTestId } = render(
      <VStack
        data-testid="detail-content-without-local-style"
        gap={6}
        paddingBlock={6}
        paddingInline={4}
      />,
    );
    const detailContent = getByTestId('skill-detail-content');
    const control = getControlByTestId('detail-content-without-local-style');

    expect(detailContent.className).toBe(control.className);
  });

  it('returns to the dedicated skills collection', () => {
    const { getByRole } = render(
      <SkillDetailPage detail={getResolvedDetail('kubernetes')} />,
    );
    const skillsLink = getByRole('link', { name: 'Skills' });

    expect(skillsLink.getAttribute('href')).toBe('/skills');
  });

  it('does not globally override Astryx link colors outside cascade layers', () => {
    const styles = readAppSource('src/styles.css');
    const unscopedAnchorRule = styles.match(/(?:^|\n)a\s*\{[^}]*\}/)?.[0];

    expect(unscopedAnchorRule).toBeUndefined();
  });

  it('uses the Astryx Basic Metadata defaults without layout overrides', () => {
    const source = readAppSource('src/app/skills/skill-detail-page.tsx');
    const metadataOpeningTag = source.match(/<MetadataList[\s\S]*?>/)?.[0];

    expect(metadataOpeningTag).toBeDefined();
    expect(metadataOpeningTag).not.toMatch(/\bcolumns=/);
    expect(metadataOpeningTag).not.toMatch(/\blabel=/);
    expect(metadataOpeningTag).not.toMatch(/\borientation=/);
  });

  it('places skill metadata in a full-width muted Card with a scoped Astryx surface', () => {
    const source = readAppSource('src/app/skills/skill-detail-page.tsx');
    const metadataCardStyle = source.match(
      /metadataCard:\s*\{[\s\S]*?\n\s*\},/,
    )?.[0];
    const metadataCardOpeningTag = source.match(/<Card[\s\S]*?>/)?.[0];
    const detail = getResolvedDetail('kubernetes');
    const { getByTestId } = render(<SkillDetailPage detail={detail} />);
    const metadata = getByTestId('skill-metadata');
    const card = metadata.closest('.astryx-card');

    expect(metadataCardStyle).toContain(
      "backgroundColor: colorVars['--color-background-surface']",
    );
    expect(metadataCardOpeningTag).toContain('variant="muted"');
    expect(metadataCardOpeningTag).toContain('width="100%"');
    expect(metadataCardOpeningTag).toContain('xstyle={styles.metadataCard}');
    expect(card).not.toBeNull();
    expect(card?.getAttribute('data-variant')).toBe('muted');
    expect((card as HTMLElement).style.getPropertyValue('--x-width')).toBe(
      '100%',
    );
    expect(card?.firstElementChild).toBe(metadata);
  });

  it('renders the enriched Kubernetes detail surface', () => {
    const detail = getResolvedDetail('kubernetes');
    const {
      container,
      getAllByTestId,
      getAllByText,
      getByRole,
      getByTestId,
      getByText,
      queryByRole,
    } = render(<SkillDetailPage detail={detail} />);
    const metadata = getByTestId('skill-metadata');
    const metadataQueries = within(metadata);

    expect(getByRole('main', { name: 'Skill detail' })).toBeTruthy();
    expect(getByRole('navigation', { name: 'Skill breadcrumb' })).toBeTruthy();
    expect(getByRole('heading', { level: 1, name: 'Kubernetes' })).toBeTruthy();
    expect(metadata.querySelector('dl')).toBeTruthy();
    expect(
      metadataQueries.getByText('Categories', { selector: 'dt' }),
    ).toBeTruthy();
    expect(
      metadataQueries.getByText('Rating', { selector: 'dt' }),
    ).toBeTruthy();
    expect(
      metadataQueries.getByText('Certifications', { selector: 'dt' }),
    ).toBeTruthy();
    expect(
      [...metadata.querySelectorAll(':scope > dl > dt')].map(
        ({ textContent }) => textContent,
      ),
    ).toEqual(['Categories', 'Rating', 'Certifications']);
    expect(getAllByText('Container')).toHaveLength(1);
    expect(getAllByText('Cloud')).toHaveLength(1);
    expect(getAllByText('4 out of 5')).toHaveLength(1);
    expect(getAllByTestId('certification-citation')).toHaveLength(
      detail.skill.certifications?.length ?? 0,
    );
    expect(
      getByRole('heading', { level: 2, name: 'In practice' }),
    ).toBeTruthy();
    expect(getByRole('heading', { level: 2, name: 'Experience' })).toBeTruthy();
    expect(
      getByRole('heading', {
        level: 3,
        name: 'Multi-stage AWS CI/CD delivery pipeline',
      }),
    ).toBeTruthy();
    expect(
      getByText(
        'Built AWS CodePipeline and CodeBuild automation for staging and production delivery with build validation, artifact handoff, and controlled promotion.',
      ),
    ).toBeTruthy();
    const relevantSkills = getByRole('list', { name: 'Relevant skills' });

    expect(within(relevantSkills).getByText('AWS CodePipeline')).toBeTruthy();
    expect(within(relevantSkills).getByText('Kubernetes')).toBeTruthy();

    const evidenceBlockquotes = [...container.querySelectorAll('blockquote')];

    expect(evidenceBlockquotes).toHaveLength(detail.experienceEvidence.length);
    evidenceBlockquotes.forEach((blockquote, index) => {
      const evidence = detail.experienceEvidence[index];
      const blockquoteQueries = within(blockquote);

      expect(
        blockquoteQueries.getByRole('heading', {
          level: 3,
          name: evidence.title,
        }),
      ).toBeTruthy();
      expect(
        blockquoteQueries.getByText(evidence.summary, { selector: 'p' }),
      ).toBeTruthy();
    });
    expect(getByRole('heading', { level: 2, name: 'Projects' })).toBeTruthy();
    expect(
      getByRole('heading', { level: 3, name: 'benkim0414/homelab' }),
    ).toBeTruthy();
    expect(
      queryByRole('heading', { level: 2, name: 'Certifications' }),
    ).toBeNull();
  });

  it('renders a basic skill without empty enrichment sections', () => {
    const detail = getResolvedDetail('react');
    const { getByRole, getByText, getByTestId, queryByRole } = render(
      <SkillDetailPage detail={detail} />,
    );
    const metadata = getByTestId('skill-metadata');
    const metadataQueries = within(metadata);

    expect(getByRole('heading', { level: 1, name: 'React' })).toBeTruthy();
    expect(getByText(detail.skill.description)).toBeTruthy();
    expect(getByText('Framework')).toBeTruthy();
    expect(getByText('3 out of 5')).toBeTruthy();
    expect(
      metadataQueries.getByText('Categories', { selector: 'dt' }),
    ).toBeTruthy();
    expect(
      metadataQueries.getByText('Rating', { selector: 'dt' }),
    ).toBeTruthy();
    expect(
      metadataQueries.queryByText('Certifications', { selector: 'dt' }),
    ).toBeNull();
    expect(
      metadataQueries.queryAllByTestId('certification-citation'),
    ).toHaveLength(0);
    expect(
      queryByRole('heading', { level: 2, name: 'In practice' }),
    ).toBeNull();
    expect(queryByRole('heading', { level: 2, name: 'Experience' })).toBeNull();
    expect(queryByRole('heading', { level: 2, name: 'Projects' })).toBeNull();
    expect(
      queryByRole('heading', { level: 2, name: 'Certifications' }),
    ).toBeNull();
  });

  it('focuses the heading on initial detail mount and skill changes only', () => {
    const reactDetail = getResolvedDetail('react');
    const kubernetesDetail = getResolvedDetail('kubernetes');
    const { getByRole, rerender } = render(
      <SkillDetailPage detail={reactDetail} />,
    );
    const reactHeading = getByRole('heading', { level: 1, name: 'React' });
    const skillsLink = getByRole('link', { name: 'Skills' });

    expect(document.activeElement).toBe(reactHeading);

    skillsLink.focus();
    rerender(
      <SkillDetailPage
        detail={{
          ...reactDetail,
          skill: {
            ...reactDetail.skill,
            description: `${reactDetail.skill.description} Updated`,
          },
        }}
      />,
    );

    expect(document.activeElement).toBe(skillsLink);

    rerender(<SkillDetailPage detail={kubernetesDetail} />);

    expect(getByRole('heading', { level: 1, name: 'Kubernetes' })).toBe(
      document.activeElement,
    );
  });
});
