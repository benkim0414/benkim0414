import type { Meta, StoryObj } from '@storybook/react-vite';

import { PlaceholderSection } from './placeholder-section';

const meta: Meta<typeof PlaceholderSection> = {
  component: PlaceholderSection,
  title: 'GitHub.io/App Shell/Placeholder Section',
};

export default meta;
type Story = StoryObj<typeof PlaceholderSection>;

export const Default: Story = {
  args: {
    id: 'overview',
    label: 'Section 01',
    title: 'Content Region',
    body: 'Reserved space for future profile content.',
  },
};
