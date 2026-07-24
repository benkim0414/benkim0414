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

interface SkillAvatarProps {
  skill: Skill;
}

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
  githubactions: siGithubactions,
  storybook: siStorybook,
};

function skillAvatarPresentation(iconSlug: string) {
  const simpleIcon = simpleIconSources[iconSlug];

  if (simpleIcon) {
    return simpleIconSource(simpleIcon);
  }

  return undefined;
}

export function SkillAvatar({ skill }: SkillAvatarProps) {
  return (
    <Avatar
      className="flex-none"
      name={skill.name}
      src={skillAvatarPresentation(skill.iconSlug)}
    />
  );
}
