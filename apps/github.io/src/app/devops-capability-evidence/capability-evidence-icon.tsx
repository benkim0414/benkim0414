import * as stylex from '@stylexjs/stylex';
import { Icon } from '@astryxdesign/core/Icon';
import { spacingVars } from '@astryxdesign/core/theme/tokens.stylex';
import {
  AcademicCapIcon,
  BookOpenIcon,
  BriefcaseIcon,
  CheckBadgeIcon,
  CodeBracketIcon,
  NewspaperIcon,
} from '@heroicons/react/24/outline';
import type { IconType } from '@astryxdesign/core/Icon';
import type { ReactNode } from 'react';

import { getSkillBrand, type SkillBrand } from '../skills/skill-brand';
import type { CapabilityEvidenceItem } from './devops-capability-evidence.types';
import { isGithubRepositoryUrl } from './capability-evidence-url';

const styles = stylex.create({
  brandIcon: {
    flex: '0 0 auto',
    width: spacingVars['--spacing-3'],
    height: spacingVars['--spacing-3'],
  },
});

export type CapabilityEvidenceIconData =
  { kind: 'brand'; brand: SkillBrand } | { kind: 'fallback'; icon: IconType };

function firstKnownTechnologyBrand(
  technologies: readonly string[] | undefined,
): SkillBrand | undefined {
  for (const technology of technologies ?? []) {
    const brand = getSkillBrand(technology);

    if (brand?.iconPath) {
      return brand;
    }
  }

  return undefined;
}

function getUrlHostname(url: string | undefined): string | undefined {
  if (!url) {
    return undefined;
  }

  try {
    return new URL(url).hostname.toLowerCase();
  } catch {
    return undefined;
  }
}

function isUdemyUrl(url: string | undefined): boolean {
  const hostname = getUrlHostname(url);

  return hostname === 'udemy.com' || hostname === 'www.udemy.com';
}

function getLearningProviderBrand(
  evidence: CapabilityEvidenceItem,
): SkillBrand | undefined {
  if (evidence.type !== 'learning' || !isUdemyUrl(evidence.proofUrl)) {
    return undefined;
  }

  const udemyBrand = getSkillBrand('Udemy');

  return udemyBrand?.iconPath ? udemyBrand : undefined;
}

export function getCapabilityEvidenceIconData(
  evidence: CapabilityEvidenceItem,
): CapabilityEvidenceIconData | undefined {
  const learningProviderBrand = getLearningProviderBrand(evidence);

  if (learningProviderBrand) {
    return { kind: 'brand', brand: learningProviderBrand };
  }

  if (evidence.type === 'project' && isGithubRepositoryUrl(evidence.proofUrl)) {
    const githubBrand = getSkillBrand('GitHub');

    if (githubBrand?.iconPath) {
      return { kind: 'brand', brand: githubBrand };
    }
  }

  const canUseTechnologyBrand =
    evidence.type === 'skill' ||
    evidence.type === 'certification' ||
    evidence.type === 'project';
  const technologyBrand = canUseTechnologyBrand
    ? firstKnownTechnologyBrand(evidence.technologies)
    : undefined;

  if (technologyBrand) {
    return { kind: 'brand', brand: technologyBrand };
  }

  const learningFallbackIcon = {
    article: NewspaperIcon,
    book: BookOpenIcon,
    course: AcademicCapIcon,
    docs: BookOpenIcon,
    lab: BookOpenIcon,
  }[evidence.learningKind ?? 'book'];

  const fallbackIcon = {
    certification: CheckBadgeIcon,
    education: AcademicCapIcon,
    experience: BriefcaseIcon,
    learning: learningFallbackIcon,
    project: CodeBracketIcon,
    skill: undefined,
  }[evidence.type];

  return fallbackIcon ? { kind: 'fallback', icon: fallbackIcon } : undefined;
}

export function renderCapabilityEvidenceIcon(
  iconData: CapabilityEvidenceIconData | undefined,
): ReactNode | undefined {
  if (!iconData) {
    return undefined;
  }

  if (iconData.kind === 'brand') {
    return (
      <svg
        aria-hidden="true"
        {...stylex.props(styles.brandIcon)}
        focusable="false"
        viewBox="0 0 24 24"
      >
        <path d={iconData.brand.iconPath} fill={iconData.brand.color} />
      </svg>
    );
  }

  return (
    <Icon
      color="inherit"
      data-testid="capability-evidence-fallback-icon"
      icon={iconData.icon}
      size="sm"
    />
  );
}

export function getCapabilityEvidenceCitationIcon(
  iconData: CapabilityEvidenceIconData | undefined,
): string | undefined {
  return iconData?.kind === 'brand' ? iconData.brand.iconDataUrl : undefined;
}

export function getCapabilityEvidenceIcon(
  evidence: CapabilityEvidenceItem,
): ReactNode | undefined {
  return renderCapabilityEvidenceIcon(getCapabilityEvidenceIconData(evidence));
}
