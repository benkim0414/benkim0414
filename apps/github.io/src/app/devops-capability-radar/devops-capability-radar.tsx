import * as stylex from '@stylexjs/stylex';
import { VisuallyHidden } from '@astryxdesign/core/VisuallyHidden';
import { RadarChart } from '@mui/x-charts/RadarChart';
import {
  borderVars,
  colorVars,
  radiusVars,
  spacingVars,
  typeScaleVars,
} from '@astryxdesign/core/theme/tokens.stylex';

import {
  DEVOPS_CAPABILITY_RADAR_LABEL,
  DEVOPS_CAPABILITY_RADAR_SERIES_LABEL,
  devOpsCapabilityRadarMetrics,
  devOpsCapabilityRadarScores,
  getDevOpsCapabilityRadarSummary,
} from './devops-capability-radar.data';

const CHART_HEIGHT = 360;

const styles = stylex.create({
  root: {
    display: 'grid',
    gap: spacingVars['--spacing-3'],
    width: '100%',
    maxWidth: `calc(${spacingVars['--spacing-12']} * 9)`,
    padding: spacingVars['--spacing-4'],
    color: colorVars['--color-text-primary'],
    backgroundColor: colorVars['--color-background-surface'],
    borderWidth: borderVars['--border-width'],
    borderStyle: 'solid',
    borderColor: colorVars['--color-border'],
    borderRadius: radiusVars['--radius-element'],
  },
  title: {
    margin: 0,
    fontSize: typeScaleVars['--text-heading-3-size'],
    lineHeight: typeScaleVars['--text-heading-3-leading'],
  },
  chartFrame: {
    width: '100%',
    minWidth: 0,
    minHeight: CHART_HEIGHT,
  },
});

export function DevOpsCapabilityRadar(): JSX.Element {
  const summary = getDevOpsCapabilityRadarSummary();

  return (
    <figure
      {...stylex.props(styles.root)}
      aria-labelledby="devops-capability-radar-title"
    >
      <h2 {...stylex.props(styles.title)} id="devops-capability-radar-title">
        {DEVOPS_CAPABILITY_RADAR_LABEL}
      </h2>
      <VisuallyHidden>{summary}</VisuallyHidden>
      <div {...stylex.props(styles.chartFrame)} aria-hidden="true">
        <RadarChart
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
              label: DEVOPS_CAPABILITY_RADAR_SERIES_LABEL,
              data: [...devOpsCapabilityRadarScores],
              fillArea: true,
            },
          ]}
          shape="circular"
          skipAnimation
          slotProps={{ tooltip: { trigger: 'axis' } }}
        />
      </div>
    </figure>
  );
}
