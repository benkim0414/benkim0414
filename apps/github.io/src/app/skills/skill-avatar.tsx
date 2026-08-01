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

export type SkillAvatarShape = 'circle' | 'rectangle';

const rectangleMaskStyle = {
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

export function SkillAvatar({
  shape = 'circle',
  skill,
}: {
  shape?: SkillAvatarShape;
  skill: Skill;
}) {
  const isRectangle = shape === 'rectangle';

  return (
    <Avatar
      className={isRectangle ? 'flex-none skill-avatar-rectangle' : 'flex-none'}
      data-skill-avatar-shape={shape}
      name={skill.name}
      size="xsmall"
      src={skillAvatarPresentation(skill.iconSlug)}
      style={isRectangle ? rectangleMaskStyle : undefined}
    />
  );
}
