import { VisuallyHidden } from '@astryxdesign/core/VisuallyHidden';
import { RadarChart } from '@mui/x-charts/RadarChart';
import { colorVars } from '@astryxdesign/core/theme/tokens.stylex';

import {
  devOpsCapabilityRadarMetrics,
  devOpsCapabilityRadarScores,
  getDevOpsCapabilityRadarSummary,
} from './devops-capability-radar.data';

const CHART_WIDTH = 360;
const CHART_HEIGHT = 360;

export function DevOpsCapabilityRadar(): JSX.Element {
  const summary = getDevOpsCapabilityRadarSummary();

  return (
    <>
      <VisuallyHidden>{summary}</VisuallyHidden>
      <RadarChart
        aria-hidden="true"
        colors={[colorVars['--color-text-blue']]}
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
        width={CHART_WIDTH}
      />
    </>
  );
}
