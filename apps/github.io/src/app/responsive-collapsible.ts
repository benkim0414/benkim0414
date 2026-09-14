export const SMALL_VIEWPORT_QUERY = '(max-width: 640px)';

export function shouldStartCollapsibleExpanded(): boolean {
  return (
    typeof window === 'undefined' ||
    typeof window.matchMedia !== 'function' ||
    !window.matchMedia(SMALL_VIEWPORT_QUERY).matches
  );
}
