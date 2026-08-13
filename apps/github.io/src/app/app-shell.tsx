import { useState } from 'react';
import { Theme } from '@astryxdesign/core';
import { neutralTheme } from '@astryxdesign/theme-neutral/built';

import { devOpsCapabilityEvidenceItems } from './devops-capability-evidence/devops-capability-evidence.data';
import { sampleProjects } from './projects/project-list.data';
import { HomePage } from './skills/home-page';
import { skillDetailRecords } from './skills/skill-detail.data';
import { SkillDetailPage } from './skills/skill-detail-page';
import { resolveSkillDetail } from './skills/skill-detail-resolver';
import { skills } from './skills/skill-list.data';
import type { Skill } from './skills/skill-list.types';

function resolveSelectedSkill(skill: Skill) {
  const resolution = resolveSkillDetail(skill.id, {
    skills,
    detailRecords: skillDetailRecords,
    evidenceItems: devOpsCapabilityEvidenceItems,
    projects: sampleProjects,
  });

  if (resolution.status !== 'found') {
    throw new Error(`Selected skill "${skill.id}" must resolve.`);
  }

  return resolution.value;
}

export function AppShell() {
  const [selectedSkill, setSelectedSkill] = useState<Skill>();
  const selectedSkillDetail = selectedSkill
    ? resolveSelectedSkill(selectedSkill)
    : undefined;

  return (
    <Theme theme={neutralTheme}>
      {selectedSkillDetail ? (
        <SkillDetailPage detail={selectedSkillDetail} />
      ) : (
        <HomePage onSkillSelect={setSelectedSkill} />
      )}
    </Theme>
  );
}
