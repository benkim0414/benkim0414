import { Citation } from '@astryxdesign/core/Citation';
import { Link } from '@astryxdesign/core/Link';
import { Token } from '@astryxdesign/core/Token';
import * as stylex from '@stylexjs/stylex';
import { spacingVars } from '@astryxdesign/core/theme/tokens.stylex';
import type { ReactElement } from 'react';

import { CertificationCitation } from '../certifications/certification-citation';
import { SkillToken } from '../skills/skill-token';
import {
  getCapabilityEvidenceCitationIcon,
  getCapabilityEvidenceIcon,
  getCapabilityEvidenceIconData,
  renderCapabilityEvidenceIcon,
} from './capability-evidence-icon';
import { getCapabilityEvidenceLabel } from './capability-evidence-label';
import type { CapabilityEvidenceItem } from './devops-capability-evidence.types';

export interface CapabilityEvidenceProps {
  evidence: CapabilityEvidenceItem;
  citationNumber?: number;
}

interface EvidenceLeafProps {
  evidence: CapabilityEvidenceItem;
  citationNumber?: number;
}

const styles = stylex.create({
  citationGroup: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: spacingVars['--spacing-1'],
    maxWidth: '100%',
  },
});

function evidenceAriaLabel(evidence: CapabilityEvidenceItem, label: string) {
  return `${evidence.type[0].toUpperCase()}${evidence.type.slice(1)} evidence: ${label}`;
}

export function SkillEvidenceToken({
  evidence,
}: EvidenceLeafProps): ReactElement {
  const iconData = getCapabilityEvidenceIconData(evidence);

  return (
    <SkillToken
      brandLabel={iconData?.kind === 'brand' ? iconData.brand.name : undefined}
      label={getCapabilityEvidenceLabel(evidence)}
    />
  );
}

function EvidenceToken({ evidence }: EvidenceLeafProps): ReactElement {
  const label = getCapabilityEvidenceLabel(evidence);
  const ariaLabel = evidenceAriaLabel(evidence, label);
  const token = (
    <Token
      color="gray"
      icon={getCapabilityEvidenceIcon(evidence)}
      label={label}
      size="sm"
    />
  );

  return evidence.proofUrl ? (
    <Link color="inherit" href={evidence.proofUrl} label={ariaLabel}>
      {token}
    </Link>
  ) : (
    <span aria-label={ariaLabel} role="group">
      {token}
    </span>
  );
}

export function LearningEvidenceToken(props: EvidenceLeafProps): ReactElement {
  return <EvidenceToken {...props} />;
}

export function ExperienceEvidenceToken(
  props: EvidenceLeafProps,
): ReactElement {
  return <EvidenceToken {...props} />;
}

export function EducationEvidenceToken(props: EvidenceLeafProps): ReactElement {
  return <EvidenceToken {...props} />;
}

export function CertificationEvidenceCitation({
  evidence,
  citationNumber = 1,
}: EvidenceLeafProps): ReactElement {
  const iconData = getCapabilityEvidenceIconData(evidence);

  return (
    <CertificationCitation
      citationIcon={getCapabilityEvidenceCitationIcon(iconData)}
      fallbackIcon={
        iconData?.kind === 'fallback'
          ? renderCapabilityEvidenceIcon(iconData)
          : undefined
      }
      number={citationNumber}
      skills={evidence.technologies}
      title={getCapabilityEvidenceLabel(evidence)}
      url={evidence.proofUrl}
    />
  );
}

export function ProjectEvidenceCitation({
  evidence,
  citationNumber = 1,
}: EvidenceLeafProps): ReactElement {
  const label = getCapabilityEvidenceLabel(evidence);
  const iconData = getCapabilityEvidenceIconData(evidence);

  return (
    <span
      aria-label={evidenceAriaLabel(evidence, label)}
      role="group"
      {...stylex.props(styles.citationGroup)}
    >
      {iconData?.kind === 'fallback'
        ? renderCapabilityEvidenceIcon(iconData)
        : null}
      <Citation
        number={citationNumber}
        source={{
          title: label,
          url: evidence.proofUrl,
          icon: getCapabilityEvidenceCitationIcon(iconData),
        }}
        variant="label"
      />
    </span>
  );
}

export function CapabilityEvidence({
  evidence,
  citationNumber,
}: CapabilityEvidenceProps): ReactElement {
  switch (evidence.type) {
    case 'skill':
      return <SkillEvidenceToken evidence={evidence} />;
    case 'learning':
      return <LearningEvidenceToken evidence={evidence} />;
    case 'experience':
      return <ExperienceEvidenceToken evidence={evidence} />;
    case 'education':
      return <EducationEvidenceToken evidence={evidence} />;
    case 'certification':
      return (
        <CertificationEvidenceCitation
          citationNumber={citationNumber}
          evidence={evidence}
        />
      );
    case 'project':
      return (
        <ProjectEvidenceCitation
          citationNumber={citationNumber}
          evidence={evidence}
        />
      );
  }
}
