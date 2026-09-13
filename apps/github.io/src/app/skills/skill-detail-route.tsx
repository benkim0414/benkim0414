import type { ReactElement } from 'react';
import { useParams } from 'react-router-dom';

import { NotFoundPage } from '../not-found-page';
import { SkillDetailPage } from './skill-detail-page';
import { resolveSkillDetail } from './skill-detail-resolver';
import { skillDetailSources } from './skill-detail-sources';

export function SkillDetailRoute(): ReactElement {
  const { skillId = '' } = useParams<{ skillId: string }>();
  const resolution = resolveSkillDetail(skillId, skillDetailSources);

  if (resolution.status === 'not-found') {
    return <NotFoundPage isFullWidth />;
  }

  return <SkillDetailPage detail={resolution.value} />;
}
