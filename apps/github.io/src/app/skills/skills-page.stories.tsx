import type { Meta, StoryObj } from '@storybook/react-vite';
import { VStack } from '@astryxdesign/core/Layout';
import { expect, userEvent } from 'storybook/test';

import { SkillsPage } from './skills-page';
import { TABLE_QUERY } from './skill-table-detail-layout';
import {
  createSkillStoryMatchMedia,
  getSkillStoryCompactOverride,
  getSkillStoryOriginalMatchMedia,
  getSkillStoryViewportKey,
} from './skill-story-match-media';

const meta: Meta<typeof SkillsPage> = {
  component: SkillsPage,
  decorators: [
    (Story) => (
      <VStack height="100vh">
        <Story />
      </VStack>
    ),
  ],
  parameters: {
    layout: 'fullscreen',
  },
  title: 'Components/Skills/Skills Page',
};

export default meta;
type Story = StoryObj<typeof SkillsPage>;

export const Default: Story = {};

export const Empty: Story = {
  args: {
    skills: [],
  },
};

export const FilterControlsOpen: Story = {
  globals: {
    viewport: { value: 'mobile1', isRotated: false },
  },
  play: async ({ canvasElement }) => {
    const filterButton = canvasElement.querySelector<HTMLButtonElement>(
      'button[aria-label="Filter skills"]',
    );

    if (!filterButton) {
      throw new Error('Expected the Skills filter button to render.');
    }

    filterButton.click();
  },
};

export const MobileCards: Story = {
  globals: {
    viewport: { value: 'mobile1', isRotated: false },
  },
};

export const DesktopTableDetail: Story = {
  beforeEach:
    ({ loaded }) =>
    () => {
      loaded.restoreMatchMedia();
    },
  loaders: [
    ({ globals }) => {
      const originalMatchMedia = getSkillStoryOriginalMatchMedia(
        window.matchMedia,
      );
      window.matchMedia = createSkillStoryMatchMedia(
        originalMatchMedia,
        getSkillStoryCompactOverride(globals.viewport),
      );

      return {
        restoreMatchMedia: () => {
          window.matchMedia = originalMatchMedia;
        },
      };
    },
  ],
  render: (args, { globals }) => (
    <SkillsPage
      {...args}
      key={getSkillStoryViewportKey(globals.viewport)}
    />
  ),
  play: async ({ canvas, globals }) => {
    if (!window.matchMedia(TABLE_QUERY).matches) return;

    await userEvent.click(canvas.getByRole('row', { name: /Kubernetes/ }));
    await expect(
      canvas.getByRole(
        getSkillStoryCompactOverride(globals.viewport) ? 'dialog' : 'region',
        { name: 'Kubernetes details' },
      ),
    ).toBeVisible();
  },
};

export const CoarseTabletBottomSheet: Story = {
  beforeEach:
    ({ loaded }) =>
    () => {
      loaded.restoreMatchMedia();
    },
  loaders: [
    () => {
      const originalMatchMedia = getSkillStoryOriginalMatchMedia(
        window.matchMedia,
      );

      window.matchMedia = createSkillStoryMatchMedia(originalMatchMedia, true);

      return {
        restoreMatchMedia: () => {
          window.matchMedia = originalMatchMedia;
        },
      };
    },
  ],
  globals: {
    viewport: { value: 'tablet', isRotated: false },
  },
  play: async ({ canvas }) => {
    await userEvent.click(canvas.getByRole('row', { name: /Kubernetes/ }));
    await expect(
      canvas.getByRole('dialog', { name: 'Kubernetes details' }),
    ).toBeVisible();
  },
};
