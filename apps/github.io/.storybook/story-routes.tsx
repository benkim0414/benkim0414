import type { ReactElement, ReactNode } from 'react';
import { Route, Routes } from 'react-router-dom';

import { SkillDetailRoute } from '../src/app/skills/skill-detail-route';

interface StoryRoutesProps {
  children: ReactNode;
}

export function StoryRoutes({ children }: StoryRoutesProps): ReactElement {
  return (
    <Routes>
      <Route path="/*" element={children} />
      <Route path="/skills/:skillId" element={<SkillDetailRoute />} />
    </Routes>
  );
}
