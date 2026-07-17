import { Badge } from '@astryxdesign/core/Badge';

import type { DevOpsRoadmapItem } from './devops-roadmap.types';

interface DevOpsRoadmapNodeProps {
  item: DevOpsRoadmapItem;
}

export function DevOpsRoadmapNode({ item }: DevOpsRoadmapNodeProps) {
  return (
    <article className="devops-roadmap-node" aria-label={item.title}>
      <h3 className="devops-roadmap-node__title">{item.title}</h3>
      {item.skills.length > 0 ? (
        <ul className="devops-roadmap-node__skills" aria-label={`${item.title} skills`}>
          {item.skills.map((skill) => (
            <li className="devops-roadmap-node__skill" key={skill}>
              <Badge label={skill} />
            </li>
          ))}
        </ul>
      ) : null}
    </article>
  );
}
