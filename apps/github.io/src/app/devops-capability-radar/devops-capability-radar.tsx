import { VisuallyHidden } from '@astryxdesign/core/VisuallyHidden';
import { RadarChart, radarClasses } from '@mui/x-charts/RadarChart';
import { colorVars } from '@astryxdesign/core/theme/tokens.stylex';

import {
  devOpsCapabilityRadarMetrics,
  devOpsCapabilityRadarScores,
  getDevOpsCapabilityRadarSummary,
} from './devops-capability-radar.data';

const CHART_WIDTH = 360;
const CHART_HEIGHT = 360;
const RADAR_COLOR = colorVars['--color-text-blue'];

export function DevOpsCapabilityRadar(): JSX.Element {
  const summary = getDevOpsCapabilityRadarSummary();

  return (
    <>
      <VisuallyHidden>{summary}</VisuallyHidden>
      <RadarChart
        aria-hidden="true"
        colors={[RADAR_COLOR]}
        disableKeyboardNavigation
        divisions={5}
        height={CHART_HEIGHT}
        margin={{ top: 32, right: 56, bottom: 32, left: 56 }}
        radar={{
          metrics: devOpsCapabilityRadarMetrics.map((metric) => ({
            name: metric.name,
            min: metric.min,
            max: metric.max,
          })),
        }}
        series={[
          {
            data: [...devOpsCapabilityRadarScores],
            fillArea: true,
          },
        ]}
        shape="circular"
        skipAnimation
        slotProps={{ tooltip: { trigger: 'axis' } }}
        sx={{
          color: colorVars['--color-text-primary'],
          [`& .${radarClasses.axisLabel}`]: {
            fill: colorVars['--color-text-primary'],
            fontFamily: 'inherit !important',
            fontSize: '12px !important',
            fontWeight: 500,
            letterSpacing: '0 !important',
          },
          [`& .${radarClasses.axisLine}`]: {
            stroke: colorVars['--color-border'],
            strokeOpacity: 1,
          },
          [`& .${radarClasses.gridRadial}, & .${radarClasses.gridDivider}`]: {
            stroke: colorVars['--color-border-emphasized'],
            strokeOpacity: 1,
          },
          [`& .${radarClasses.gridStripe}`]: {
            fill: 'transparent',
          },
          [`& .${radarClasses.seriesArea}`]: {
            fill: RADAR_COLOR,
            fillOpacity: 0.24,
            stroke: RADAR_COLOR,
            strokeWidth: 2,
          },
          [`& .${radarClasses.seriesMark}`]: {
            fill: colorVars['--color-background-surface'],
            stroke: RADAR_COLOR,
            strokeWidth: 2,
          },
        }}
        width={CHART_WIDTH}
      />
    </>
  );
}
