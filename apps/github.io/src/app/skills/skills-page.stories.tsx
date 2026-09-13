import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent } from 'storybook/test';

import { SkillsPage } from './skills-page';
import {
  COMPACT_SURFACE_QUERY,
  TABLE_QUERY,
} from './skill-table-detail-layout';

const meta: Meta<typeof SkillsPage> = {
  component: SkillsPage,
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
  globals: {
    viewport: { value: 'desktop', isRotated: false },
  },
  play: async ({ canvas }) => {
    await userEvent.click(canvas.getByRole('row', { name: /Kubernetes/ }));
    await expect(
      canvas.getByRole('region', { name: 'Kubernetes details' }),
    ).toBeVisible();
  },
};

function createCoarseTabletMatchMedia(
  originalMatchMedia: typeof window.matchMedia,
): typeof window.matchMedia {
  return (query) => {
    if (query !== TABLE_QUERY && query !== COMPACT_SURFACE_QUERY) {
      return originalMatchMedia(query);
    }

    return {
      addEventListener: () => undefined,
      addListener: () => undefined,
      dispatchEvent: () => false,
      matches: true,
      media: query,
      onchange: null,
      removeEventListener: () => undefined,
      removeListener: () => undefined,
    };
  };
}

export const CoarseTabletBottomSheet: Story = {
  beforeEach:
    ({ loaded }) =>
    () => {
      loaded.restoreMatchMedia();
    },
  loaders: [
    () => {
      const originalMatchMedia = window.matchMedia;

      window.matchMedia = createCoarseTabletMatchMedia(originalMatchMedia);

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
