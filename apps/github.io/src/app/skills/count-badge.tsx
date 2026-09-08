import { Badge } from '@astryxdesign/core/Badge';

export interface CountBadgeProps {
  count: number;
}

export function CountBadge({ count }: CountBadgeProps) {
  return <Badge label={count} variant="neutral" />;
}
