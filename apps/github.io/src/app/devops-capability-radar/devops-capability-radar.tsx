import { VisuallyHidden } from '@astryxdesign/core/VisuallyHidden';
import { RadarChart, radarClasses } from '@mui/x-charts/RadarChart';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { colorVars } from '@astryxdesign/core/theme/tokens.stylex';
import type {} from '@mui/x-charts/themeAugmentation';
import type { ReactElement } from 'react';

import {
  devOpsCapabilityRadarMetrics,
  devOpsCapabilityRadarScores,
  getDevOpsCapabilityRadarSummary,
} from './devops-capability-radar.data';

const CHART_WIDTH = 360;
const CHART_HEIGHT = 360;
const RADAR_FOREGROUND = colorVars['--color-text-purple'];
const RADAR_BACKGROUND = colorVars['--color-background-purple'];
const radarTheme = createTheme({
  palette: {
    background: {
      paper: colorVars['--color-background-surface'],
    },
    divider: colorVars['--color-border-emphasized'],
    text: {
      primary: colorVars['--color-text-primary'],
      secondary: colorVars['--color-text-primary'],
    },
  },
  components: {
    MuiChartsTooltip: {
      styleOverrides: {
        paper: {
          backgroundColor: colorVars['--color-background-surface'],
          borderColor: colorVars['--color-border-emphasized'],
          color: colorVars['--color-text-primary'],
        },
        cell: {
          color: colorVars['--color-text-primary'],
        },
      },
    },
  },
});

export function DevOpsCapabilityRadar(): ReactElement {
  const summary = getDevOpsCapabilityRadarSummary();

  return (
    <ThemeProvider theme={radarTheme}>
      <VisuallyHidden>{summary}</VisuallyHidden>
      <RadarChart
        aria-hidden="true"
        colors={[RADAR_BACKGROUND]}
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
        stripeColor={(index) =>
          index % 2 === 0
            ? RADAR_BACKGROUND
            : colorVars['--color-background-surface']
        }
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
          [`& .${radarClasses.seriesArea}`]: {
            fill: RADAR_BACKGROUND,
            fillOpacity: 0.64,
            stroke: RADAR_FOREGROUND,
            strokeWidth: 2,
          },
          [`& .${radarClasses.seriesMark}`]: {
            fill: RADAR_FOREGROUND,
            stroke: RADAR_FOREGROUND,
            strokeWidth: 2,
          },
        }}
        width={CHART_WIDTH}
      />
    </ThemeProvider>
  );
}
