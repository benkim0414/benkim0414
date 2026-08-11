import { VisuallyHidden } from '@astryxdesign/core/VisuallyHidden';
import { colorVars } from '@astryxdesign/core/theme/tokens.stylex';
import * as stylex from '@stylexjs/stylex';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { RadarChart, radarClasses } from '@mui/x-charts/RadarChart';
import type {} from '@mui/x-charts/themeAugmentation';
import { useMemo, type ReactElement } from 'react';

import { getCapabilityScoreSummary } from './devops-capability-evidence.summary';
import type { DoraCapabilityScore } from './devops-capability-evidence.types';

const CHART_WIDTH = 400;
const CHART_HEIGHT = 300;
const RADAR_FOREGROUND = colorVars['--color-text-purple'];
const RADAR_BACKGROUND = colorVars['--color-background-purple'];
const RADAR_COLORS = [RADAR_BACKGROUND];
const RADAR_SLOT_PROPS = { tooltip: { trigger: 'axis' as const } };

const styles = stylex.create({
  root: {
    maxWidth: '100%',
    width: `${CHART_WIDTH}px`,
  },
});

const radarTheme = createTheme({
  colorSchemes: {
    light: {
      palette: {
        background: { paper: 'var(--color-background-surface)' },
        divider: 'var(--color-border-emphasized)',
        text: {
          primary: 'var(--color-text-primary)',
          secondary: 'var(--color-text-secondary)',
        },
      },
    },
    dark: {
      palette: {
        background: { paper: 'var(--color-background-surface)' },
        divider: 'var(--color-border-emphasized)',
        text: {
          primary: 'var(--color-text-primary)',
          secondary: 'var(--color-text-secondary)',
        },
      },
    },
  },
});

export interface DevOpsCapabilityEvidenceRadarProps {
  scores: readonly DoraCapabilityScore[];
}

export function DevOpsCapabilityEvidenceRadar({
  scores,
}: DevOpsCapabilityEvidenceRadarProps): ReactElement | null {
  const visibleScores = useMemo(
    () => scores.filter((score) => score.score > 0),
    [scores],
  );
  const radarMetrics = useMemo(
    () =>
      visibleScores.map((score) => ({
        name: score.label,
        min: 0,
        max: score.maxScore,
      })),
    [visibleScores],
  );
  const series = useMemo(
    () => [{ data: visibleScores.map((score) => score.score), fillArea: true }],
    [visibleScores],
  );

  if (visibleScores.length === 0) {
    return null;
  }

  return (
    <ThemeProvider theme={radarTheme}>
      <VisuallyHidden>
        {getCapabilityScoreSummary(visibleScores)}
      </VisuallyHidden>
      <div {...stylex.props(styles.root)}>
        <RadarChart
          aria-hidden="true"
          colors={RADAR_COLORS}
          disableKeyboardNavigation
          divisions={10}
          height={CHART_HEIGHT}
          radar={{
            metrics: radarMetrics,
          }}
          series={series}
          shape="sharp"
          skipAnimation
          slotProps={RADAR_SLOT_PROPS}
          sx={{
            [`& .${radarClasses.axisLabel}`]: {
              fill: colorVars['--color-text-primary'],
              fontFamily: 'inherit !important',
              fontSize: '13px !important',
              fontWeight: 500,
              letterSpacing: '0 !important',
            },
            [`& .${radarClasses.seriesArea}`]: {
              fill: RADAR_BACKGROUND,
              fillOpacity: 0.64,
              stroke: RADAR_FOREGROUND,
              strokeWidth: 2,
            },
            [`& .${radarClasses.seriesMark}`]: {
              fill: RADAR_FOREGROUND,
              stroke: RADAR_FOREGROUND,
            },
          }}
        />
      </div>
    </ThemeProvider>
  );
}
