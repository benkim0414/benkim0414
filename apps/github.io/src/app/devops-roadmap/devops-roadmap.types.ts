export interface DevOpsRoadmapItem {
  id: string;
  title: string;
  skills: readonly string[];
}

export interface DevOpsRoadmapProps {
  ariaLabel?: string;
  items?: readonly DevOpsRoadmapItem[];
  isReversed?: boolean;
}
