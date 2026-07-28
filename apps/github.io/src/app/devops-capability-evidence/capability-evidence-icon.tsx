import * as stylex from '@stylexjs/stylex';
import { Icon } from '@astryxdesign/core/Icon';
import { spacingVars } from '@astryxdesign/core/theme/tokens.stylex';
import {
  AcademicCapIcon,
  BookOpenIcon,
  BriefcaseIcon,
  CheckBadgeIcon,
  CodeBracketIcon,
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

export function getCapabilityEvidenceIconData(
  evidence: CapabilityEvidenceItem,
): CapabilityEvidenceIconData | undefined {
  const technologyBrand = firstKnownTechnologyBrand(evidence.technologies);

  if (technologyBrand) {
    return { kind: 'brand', brand: technologyBrand };
  }

  if (evidence.type === 'project' && isGithubRepositoryUrl(evidence.proofUrl)) {
    const githubBrand = getSkillBrand('GitHub');

    if (githubBrand?.iconPath) {
      return { kind: 'brand', brand: githubBrand };
    }
  }

  const fallbackIcon = {
    certification: CheckBadgeIcon,
    education: AcademicCapIcon,
    experience: BriefcaseIcon,
    learning: BookOpenIcon,
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
        <path d={iconData.brand.iconPath} fill="currentColor" />
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
