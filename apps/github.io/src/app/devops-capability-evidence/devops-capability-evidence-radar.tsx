import { VisuallyHidden } from '@astryxdesign/core/VisuallyHidden';
import { colorVars } from '@astryxdesign/core/theme/tokens.stylex';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { RadarChart, radarClasses } from '@mui/x-charts/RadarChart';
import type {} from '@mui/x-charts/themeAugmentation';
import type { ReactElement } from 'react';

import { getCapabilityScoreSummary } from './devops-capability-evidence.summary';
import type { DoraCapabilityScore } from './devops-capability-evidence.types';

const CHART_MAX_WIDTH = 420;
const CHART_MIN_WIDTH = 280;
const CHART_HEIGHT = 420;
const RADAR_FOREGROUND = colorVars['--color-text-purple'];
const RADAR_BACKGROUND = colorVars['--color-background-purple'];

const radarTheme = createTheme({
  palette: {
    background: { paper: colorVars['--color-background-surface'] },
    divider: colorVars['--color-border-emphasized'],
    text: {
      primary: colorVars['--color-text-primary'],
      secondary: colorVars['--color-text-primary'],
    },
  },
});

export interface DevOpsCapabilityEvidenceRadarProps {
  scores: readonly DoraCapabilityScore[];
}

export function DevOpsCapabilityEvidenceRadar({
  scores,
}: DevOpsCapabilityEvidenceRadarProps): ReactElement | null {
  const visibleScores = scores.filter((score) => score.score > 0);

  if (visibleScores.length === 0) {
    return null;
  }

  return (
    <ThemeProvider theme={radarTheme}>
      <VisuallyHidden>
        {getCapabilityScoreSummary(visibleScores)}
      </VisuallyHidden>
      <div
        style={{
          maxWidth: CHART_MAX_WIDTH,
          minWidth: CHART_MIN_WIDTH,
          width: '100%',
        }}
      >
        <RadarChart
          aria-hidden="true"
          colors={[RADAR_BACKGROUND]}
          disableKeyboardNavigation
          divisions={5}
          height={CHART_HEIGHT}
          margin={{ top: 36, right: 72, bottom: 36, left: 72 }}
          radar={{
            metrics: visibleScores.map((score) => ({
              name: score.label,
              min: 0,
              max: score.maxScore,
            })),
          }}
          series={[
            { data: visibleScores.map((score) => score.score), fillArea: true },
          ]}
          shape="circular"
          skipAnimation
          slotProps={{ tooltip: { trigger: 'axis' } }}
          sx={{
            [`& .${radarClasses.axisLabel}`]: {
              fill: colorVars['--color-text-primary'],
              fontFamily: 'inherit !important',
              fontSize: '12px !important',
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
