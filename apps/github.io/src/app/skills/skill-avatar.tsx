import { Avatar } from '@astryxdesign/core/Avatar';
import { radiusVars } from '@astryxdesign/core/theme/tokens.stylex';
import type { CSSProperties } from 'react';
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

const cardMaskStyle = {
  '--radius-full': radiusVars['--radius-element'],
} as CSSProperties;

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

export function SkillAvatar({ skill, variant = 'list' }: SkillAvatarProps) {
  const isCard = variant === 'card';

  return (
    <Avatar
      className={isCard ? 'flex-none skill-card-logo-tile' : 'flex-none'}
      data-skill-avatar-variant={variant}
      name={skill.name}
      size={isCard ? 'small' : 'xsmall'}
      src={skillAvatarPresentation(skill.iconSlug)}
      style={isCard ? cardMaskStyle : undefined}
    />
  );
}
