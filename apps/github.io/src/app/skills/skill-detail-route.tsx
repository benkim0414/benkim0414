import type { ReactElement } from 'react';
import { useParams } from 'react-router-dom';

import { devOpsCapabilityEvidenceItems } from '../devops-capability-evidence/devops-capability-evidence.data';
import { NotFoundPage } from '../not-found-page';
import { sampleProjects } from '../projects/project-list.data';
import { SkillDetailPage } from './skill-detail-page';
import { skillDetailRecords } from './skill-detail.data';
import { resolveSkillDetail } from './skill-detail-resolver';
import { skills } from './skill-list.data';

export function SkillDetailRoute(): ReactElement {
  const { skillId = '' } = useParams<{ skillId: string }>();
  const resolution = resolveSkillDetail(skillId, {
    skills,
    detailRecords: skillDetailRecords,
    evidenceItems: devOpsCapabilityEvidenceItems,
    projects: sampleProjects,
  });

  if (resolution.status === 'not-found') {
    return <NotFoundPage />;
  }

  return <SkillDetailPage detail={resolution.value} />;
}
