import { Avatar } from '@astryxdesign/core/Avatar';

import type { Skill } from './skill-list.types';

interface SkillLogoProps {
  skill: Skill;
}

function svgDataUrl(content: string) {
  return `data:image/svg+xml,${encodeURIComponent(content)}`;
}

const skillLogoSources: Readonly<Record<string, string>> = {
  typescript: svgDataUrl(
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128"><path fill="#3178c6" d="M0 0h128v128H0z"/><path fill="#fff" d="M22 51h57v12H58v53H44V63H22zm64 43c5 6 11 10 18 10 6 0 10-3 10-7 0-5-4-7-13-11-10-4-17-9-17-20 0-11 9-19 23-19 9 0 16 3 21 8l-8 10c-4-4-8-6-13-6-5 0-8 2-8 6 0 4 4 6 13 10 11 4 18 10 18 21 0 12-9 20-25 20-11 0-21-5-27-12z"/></svg>'
  ),
  react: svgDataUrl(
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128"><circle cx="64" cy="64" r="12" fill="#61dafb"/><g fill="none" stroke="#61dafb" stroke-width="6"><ellipse cx="64" cy="64" rx="51" ry="20"/><ellipse cx="64" cy="64" rx="51" ry="20" transform="rotate(60 64 64)"/><ellipse cx="64" cy="64" rx="51" ry="20" transform="rotate(120 64 64)"/></g></svg>'
  ),
  nx: svgDataUrl(
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128"><path fill="#143055" d="M64 4 116 34v60l-52 30L12 94V34z"/><path fill="#00e3b0" d="m32 40 22 36-15 12-20-32zm34 0 30 48-15 12-30-48zm24 48 8 12-28 16-8-12z"/></svg>'
  ),
  amazonaws: svgDataUrl(
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128"><text x="12" y="66" fill="#232f3e" font-family="Arial,sans-serif" font-size="34" font-weight="700">aws</text><path fill="none" stroke="#ff9900" stroke-linecap="round" stroke-width="7" d="M21 82c24 17 59 17 84 1m-8-5 10 4-5 9"/></svg>'
  ),
  terraform: svgDataUrl(
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128"><path fill="#7b42bc" d="M16 30 48 48v36L16 66zm35 19 32 18v36L51 85zm35 18 26-15v36l-26 15z"/></svg>'
  ),
  docker: svgDataUrl(
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128"><g fill="#2496ed"><path d="M16 76h89c-4 20-20 32-42 32-25 0-41-12-47-32Z"/><path d="M20 43h18v15H20zm21 0h18v15H41zm21 0h18v15H62zM31 61h18v15H31zm21 0h18v15H52zm21 0h18v15H73z"/><path d="M97 54c8-3 14 0 17 7-7 5-13 5-19 2z"/></g></svg>'
  ),
  githubactions: svgDataUrl(
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128"><path fill="#2088ff" d="M14 38h35l9 17H23zm41 17h35l9 17H64zm-23 17h35l9 17H41z"/><path fill="#7b61ff" d="m93 24 20 11v23l-20 11-20-11V35z"/></svg>'
  ),
  storybook: svgDataUrl(
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128"><path fill="#ff4785" d="m21 18 85-7v104l-85-7z"/><path fill="#fff" d="M82 47c-3-5-9-8-17-8-10 0-17 5-17 13 0 9 8 12 17 15 7 2 10 4 10 8 0 3-3 5-8 5-6 0-11-3-15-8l-8 10c5 7 13 11 23 11 12 0 20-6 20-16 0-10-8-13-18-16-6-2-9-4-9-7 0-3 3-4 7-4 5 0 9 2 12 6z"/></svg>'
  ),
};

export function SkillLogo({ skill }: SkillLogoProps) {
  return (
    <Avatar
      aria-hidden="true"
      className="skill-logo"
      name={skill.name}
      src={skillLogoSources[skill.iconSlug]}
    />
  );
}
