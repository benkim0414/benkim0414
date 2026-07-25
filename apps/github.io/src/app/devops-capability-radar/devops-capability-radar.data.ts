export const DEVOPS_CAPABILITY_RADAR_LABEL = 'DevOps capability radar';
export const DEVOPS_CAPABILITY_RADAR_SERIES_LABEL = 'DevOps capability';

export interface DevOpsCapabilityRadarMetric {
  name: string;
  min: number;
  max: number;
}

export const devOpsCapabilityRadarMetrics = [
  { name: 'Automation', min: 1, max: 5 },
  { name: 'Delivery', min: 1, max: 5 },
  { name: 'Cloud', min: 1, max: 5 },
  { name: 'Containers', min: 1, max: 5 },
  { name: 'Reliability', min: 1, max: 5 },
  { name: 'Security', min: 1, max: 5 },
] as const satisfies readonly DevOpsCapabilityRadarMetric[];

export const devOpsCapabilityRadarScores = [4, 5, 4, 4, 4, 3] as const;

export function getDevOpsCapabilityRadarSummary(): string {
  return devOpsCapabilityRadarMetrics
    .map(
      (metric, index) =>
        `${metric.name} ${devOpsCapabilityRadarScores[index]} of ${metric.max}`,
    )
    .join(', ')
    .concat('.');
}
