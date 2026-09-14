import {
  Avatar,
  type AvatarProps,
  type AvatarSize,
} from '@astryxdesign/core/Avatar';
import { resolveThemeToken, ThemeContext } from '@astryxdesign/core/theme';
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
import { use } from 'react';

import type { Skill } from './skill-list.types';
import { getSkillBrandIconDataUrl } from './skill-brand';

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

function skillAvatarPresentation(
  skill: Skill,
  mode: 'light' | 'dark',
  inverseIconColor: string,
) {
  const brandSource = getSkillBrandIconDataUrl(
    skill.name,
    mode,
    inverseIconColor,
  );

  if (brandSource) {
    return brandSource;
  }

  const simpleIcon = simpleIconSources[skill.iconSlug];

  if (simpleIcon) {
    return simpleIconSource(simpleIcon);
  }

  return undefined;
}

export interface SkillAvatarProps {
  isDecorative?: boolean;
  skill: Skill;
  size?: AvatarSize;
  tooltip?: AvatarProps['tooltip'];
}

export function SkillAvatar({
  isDecorative = false,
  skill,
  size = 'lg',
  tooltip,
}: SkillAvatarProps) {
  const theme = use(ThemeContext);
  const mode = theme?.mode === 'dark' ? 'dark' : 'light';
  const inverseIconColor = resolveThemeToken(
    theme?.theme,
    '--color-icon-primary',
    { mode },
  );

  return (
    <Avatar
      aria-hidden={isDecorative || undefined}
      aria-label={isDecorative ? undefined : skill.name}
      className="flex-none"
      name={skill.name}
      role={isDecorative ? 'presentation' : 'img'}
      size={size}
      src={skillAvatarPresentation(skill, mode, inverseIconColor)}
      tooltip={tooltip}
    />
  );
}
