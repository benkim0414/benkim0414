import { Icon } from '@astryxdesign/core/Icon';
import {
  AcademicCapIcon,
  BookOpenIcon,
  BriefcaseIcon,
  CheckBadgeIcon,
  CodeBracketIcon,
} from '@heroicons/react/24/outline';
import type { ReactNode } from 'react';

import { getSkillBrand } from '../skills/skill-brand';
import type { CapabilityEvidenceItem } from './devops-capability-evidence.types';
import { isGithubRepositoryUrl } from './capability-evidence-url';

function firstKnownTechnologyIcon(
  technologies: readonly string[] | undefined,
): ReactNode | undefined {
  const brand = technologies
    ?.map((technology) => getSkillBrand(technology))
    .find(Boolean);

  return brand?.iconPath ? (
    <svg aria-hidden="true" focusable="false" viewBox="0 0 24 24">
      <path d={brand.iconPath} fill="currentColor" />
    </svg>
  ) : undefined;
}

export function getCapabilityEvidenceIcon(
  evidence: CapabilityEvidenceItem,
): ReactNode | undefined {
  const technologyIcon = firstKnownTechnologyIcon(evidence.technologies);

  if (technologyIcon) {
    return technologyIcon;
  }

  if (evidence.type === 'project' && isGithubRepositoryUrl(evidence.proofUrl)) {
    const githubIcon = getSkillBrand('GitHub');

    return githubIcon?.iconPath ? (
      <svg aria-hidden="true" focusable="false" viewBox="0 0 24 24">
        <path d={githubIcon.iconPath} fill="currentColor" />
      </svg>
    ) : undefined;
  }

  const fallbackIcon = {
    certification: CheckBadgeIcon,
    education: AcademicCapIcon,
    experience: BriefcaseIcon,
    learning: BookOpenIcon,
    project: CodeBracketIcon,
    skill: undefined,
  }[evidence.type];

  return fallbackIcon ? (
    <Icon icon={fallbackIcon} size="sm" color="inherit" />
  ) : undefined;
}
