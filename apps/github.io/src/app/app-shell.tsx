import { useState } from 'react';
import { Theme } from '@astryxdesign/core';
import { neutralTheme } from '@astryxdesign/theme-neutral/built';

import { HomePage } from './skills/home-page';
import { SkillDetailPage } from './skills/skill-detail-page';
import type { Skill } from './skills/skill-list.types';

export function AppShell() {
  const [selectedSkill, setSelectedSkill] = useState<Skill>();

  return (
    <Theme theme={neutralTheme}>
      {selectedSkill ? (
        <SkillDetailPage skill={selectedSkill} />
      ) : (
        <HomePage onSkillSelect={setSelectedSkill} />
      )}
    </Theme>
  );
}
