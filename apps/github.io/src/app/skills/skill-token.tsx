import * as stylex from '@stylexjs/stylex';
import type { CSSProperties } from 'react';

import { getSkillBrand, type SkillBrand } from './skill-brand';

export interface SkillTokenProps {
  label: string;
  variant?: 'purple';
}

const styles = stylex.create({
  root: {
    display: 'inline-flex',
    alignItems: 'center',
    maxWidth: '100%',
    minHeight: 'var(--spacing-5)',
    gap: 'var(--spacing-1)',
    paddingBlock: 0,
    paddingInline: 'var(--spacing-2)',
    color: 'var(--skill-token-foreground, var(--color-purple-700, #5b2bd6))',
    backgroundColor:
      'var(--skill-token-background, var(--color-purple-100, #eee7ff))',
    borderRadius: 'var(--radius-full, 999px)',
    fontSize: 'var(--text-supporting-size, 0.75rem)',
    fontWeight: 'var(--font-weight-medium, 500)',
    lineHeight: 'var(--text-supporting-leading, 1rem)',
  },
  icon: {
    flex: '0 0 auto',
    width: '0.875rem',
    height: '0.875rem',
  },
  label: {
    minWidth: 0,
    overflowWrap: 'anywhere',
  },
});

function tokenStyle(brand: SkillBrand | undefined): CSSProperties | undefined {
  if (!brand?.iconPath) {
    return undefined;
  }

  return {
    '--skill-token-background': brand.color,
    '--skill-token-foreground': brand.foreground,
  } as CSSProperties;
}

export function SkillToken({ label }: SkillTokenProps): JSX.Element {
  const brand = getSkillBrand(label);
  const hasIcon = Boolean(brand?.iconPath);

  return (
    <span
      {...stylex.props(styles.root)}
      data-has-icon={String(hasIcon)}
      data-testid="skill-token"
      data-token-color={hasIcon ? brand?.color : undefined}
      style={tokenStyle(brand)}
    >
      {brand?.iconPath ? (
        <svg
          aria-hidden="true"
          {...stylex.props(styles.icon)}
          focusable="false"
          viewBox="0 0 24 24"
        >
          <path d={brand.iconPath} fill="currentColor" />
        </svg>
      ) : null}
      <span {...stylex.props(styles.label)}>{label}</span>
    </span>
  );
}
