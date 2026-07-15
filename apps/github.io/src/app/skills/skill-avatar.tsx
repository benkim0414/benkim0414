import { Avatar } from '@astryxdesign/core/Avatar';
import {
  siDocker,
  siGithubactions,
  siNx,
  siReact,
  siStorybook,
  siTerraform,
  siTypescript,
  type SimpleIcon,
} from 'simple-icons';

import type { Skill } from './skill-list.types';
import type { CSSProperties } from 'react';

interface SkillAvatarProps {
  skill: Skill;
}

interface SkillAvatarSource {
  icon: SimpleIcon;
  padding: string;
}

type SkillAvatarStyle = CSSProperties & {
  '--skill-avatar-padding': string;
};

function svgDataUrl(content: string) {
  return `data:image/svg+xml,${encodeURIComponent(content)}`;
}

function simpleIconSource(icon: SimpleIcon) {
  return svgDataUrl(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><title>${icon.title}</title><path fill="#${icon.hex}" d="${icon.path}"/></svg>`
  );
}

const simpleIconSources: Readonly<Record<string, SkillAvatarSource>> = {
  typescript: { icon: siTypescript, padding: '3px' },
  react: { icon: siReact, padding: '2px' },
  nx: { icon: siNx, padding: '3px' },
  terraform: { icon: siTerraform, padding: '4px' },
  docker: { icon: siDocker, padding: '3px' },
  githubactions: { icon: siGithubactions, padding: '2px' },
  storybook: { icon: siStorybook, padding: '4px' },
};

const fallbackAvatarSources: Readonly<Record<string, string>> = {
  amazonaws: svgDataUrl(
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128"><text x="12" y="66" fill="#232f3e" font-family="Arial,sans-serif" font-size="34" font-weight="700">aws</text><path fill="none" stroke="#ff9900" stroke-linecap="round" stroke-width="7" d="M21 82c24 17 59 17 84 1m-8-5 10 4-5 9"/></svg>'
  ),
};

function skillAvatarPresentation(iconSlug: string) {
  const simpleIcon = simpleIconSources[iconSlug];

  if (simpleIcon) {
    return {
      src: simpleIconSource(simpleIcon.icon),
      style: {
        '--skill-avatar-padding': simpleIcon.padding,
      } satisfies SkillAvatarStyle,
    };
  }

  return {
    src: fallbackAvatarSources[iconSlug],
    style: {
      '--skill-avatar-padding': '4px',
    } satisfies SkillAvatarStyle,
  };
}

export function SkillAvatar({ skill }: SkillAvatarProps) {
  const avatar = skillAvatarPresentation(skill.iconSlug);

  return (
    <Avatar
      className="skill-avatar"
      name={skill.name}
      src={avatar.src}
      style={avatar.style}
    />
  );
}
