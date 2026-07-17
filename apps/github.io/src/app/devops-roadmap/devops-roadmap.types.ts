export interface DevOpsRoadmapItem {
  id: string;
  title: string;
  skills: readonly string[];
}

export interface DevOpsRoadmapProps {
  items?: readonly DevOpsRoadmapItem[];
  heading?: string;
  isHeadingHidden?: boolean;
}
