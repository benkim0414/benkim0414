import type { NavItem, PlaceholderSectionData } from './app-shell.types';

export const navItems: NavItem[] = [
  { label: 'Overview', href: '#overview' },
  { label: 'Work', href: '#work' },
  { label: 'Notes', href: '#notes' },
];

export const placeholderSections: PlaceholderSectionData[] = [
  {
    id: 'overview',
    label: 'Section 01',
    title: 'Content Region',
    body: 'Reserved space for future profile content.',
  },
  {
    id: 'work',
    label: 'Section 02',
    title: 'Content Region',
    body: 'Reserved space for future project content.',
  },
  {
    id: 'notes',
    label: 'Section 03',
    title: 'Content Region',
    body: 'Reserved space for future contact content.',
  },
];
