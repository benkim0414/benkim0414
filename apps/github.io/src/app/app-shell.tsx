import { Theme } from '@astryxdesign/core';
import { VisuallyHidden } from '@astryxdesign/core/VisuallyHidden';
import { neutralTheme } from '@astryxdesign/theme-neutral/built';

import { sampleSkills } from './skills/skill-list.data';
import { SkillSection } from './skills/skill-section';

export function AppShell() {
  return (
    <Theme theme={neutralTheme}>
      <main
        aria-labelledby="skills-page-title"
        className="mx-auto w-full max-w-5xl px-4 py-8"
      >
        <VisuallyHidden as="h1" id="skills-page-title">
          Skills
        </VisuallyHidden>

        <SkillSection heading="Skills" isHeadingHidden skills={sampleSkills} />
      </main>
    </Theme>
  );
}
