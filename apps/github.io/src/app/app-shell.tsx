import { Theme } from '@astryxdesign/core';
import { VisuallyHidden } from '@astryxdesign/core/VisuallyHidden';
import { neutralTheme } from '@astryxdesign/theme-neutral/built';

import { MobileSkillsPage } from './skills/mobile-skills-page';

export function AppShell() {
  return (
    <Theme theme={neutralTheme}>
      <main
        aria-labelledby="skills-page-title"
        className="mx-auto min-h-screen w-full max-w-md px-4 py-4"
      >
        <VisuallyHidden as="h1" id="skills-page-title">
          Skills
        </VisuallyHidden>

        <MobileSkillsPage />
      </main>
    </Theme>
  );
}
