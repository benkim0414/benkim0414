import { COMPACT_SURFACE_QUERY } from './skills/skill-table-responsive';

export function shouldStartCollapsibleExpanded(): boolean {
  return (
    typeof window === 'undefined' ||
    typeof window.matchMedia !== 'function' ||
    !window.matchMedia(COMPACT_SURFACE_QUERY).matches
  );
}
