import * as stylex from '@stylexjs/stylex';
import { Avatar } from '@astryxdesign/core/Avatar';
import { radiusVars } from '@astryxdesign/core/theme/tokens.stylex';
import { useState } from 'react';
import {
  siArgo,
  siClaudecode,
  siDocker,
  siExpo,
  siGithubactions,
  siGo,
  siGrafana,
  siKubernetes,
  siNeovim,
  siNx,
  siReact,
  siStorybook,
  siSwift,
  siTerraform,
  siTmux,
  siTypescript,
  siZsh,
  type SimpleIcon,
} from 'simple-icons';

import type { Skill } from './skill-list.types';

export type SkillAvatarVariant = 'list' | 'card';

interface SkillAvatarProps {
  skill: Skill;
  variant?: SkillAvatarVariant;
}

const styles = stylex.create({
  cardTile: {
    alignItems: 'center',
    borderRadius: radiusVars['--radius-element'],
    display: 'flex',
    flexShrink: 0,
    height: '36px',
    justifyContent: 'center',
    overflow: 'hidden',
    width: '36px',
  },
  cardImage: {
    height: '100%',
    objectFit: 'cover',
    width: '100%',
  },
  cardFallback: {
    alignItems: 'center',
    display: 'flex',
    height: '100%',
    justifyContent: 'center',
    width: '100%',
  },
});

function svgDataUrl(content: string) {
  return `data:image/svg+xml,${encodeURIComponent(content)}`;
}

function simpleIconSource(icon: SimpleIcon) {
  return svgDataUrl(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><title>${icon.title}</title><path fill="#${icon.hex}" d="${icon.path}"/></svg>`,
  );
}

const simpleIconSources: Readonly<Record<string, SimpleIcon>> = {
  typescript: siTypescript,
  react: siReact,
  nx: siNx,
  terraform: siTerraform,
  docker: siDocker,
  kubernetes: siKubernetes,
  githubactions: siGithubactions,
  storybook: siStorybook,
  claudecode: siClaudecode,
  neovim: siNeovim,
  zsh: siZsh,
  tmux: siTmux,
  grafana: siGrafana,
  go: siGo,
  argo: siArgo,
  swift: siSwift,
  expo: siExpo,
};

function skillAvatarPresentation(iconSlug: string) {
  const simpleIcon = simpleIconSources[iconSlug];

  if (simpleIcon) {
    return simpleIconSource(simpleIcon);
  }

  return undefined;
}

function skillInitials(name: string) {
  const words = name.trim().split(/\s+/);

  if (words.length === 1) {
    return words[0].charAt(0).toUpperCase();
  }

  return (words[0].charAt(0) + words[words.length - 1].charAt(0)).toUpperCase();
}

export function SkillAvatar({ skill, variant = 'list' }: SkillAvatarProps) {
  const isCard = variant === 'card';
  const source = skillAvatarPresentation(skill.iconSlug);
  const [imageFailed, setImageFailed] = useState(false);

  if (isCard) {
    const cardTileProps = stylex.props(styles.cardTile);

    return (
      <div
        {...cardTileProps}
        aria-label={skill.name}
        className={`${cardTileProps.className ?? ''} flex-none skill-card-logo-tile`}
        data-skill-avatar-variant={variant}
        role="img"
      >
        {source && !imageFailed ? (
          <img
            {...stylex.props(styles.cardImage)}
            alt=""
            onError={() => setImageFailed(true)}
            src={source}
          />
        ) : (
          <span {...stylex.props(styles.cardFallback)}>
            {skillInitials(skill.name)}
          </span>
        )}
      </div>
    );
  }

  return (
    <Avatar
      className="flex-none"
      data-skill-avatar-variant={variant}
      name={skill.name}
      size="xsmall"
      src={source}
    />
  );
}
