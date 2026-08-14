import { forwardRef, type ComponentProps, type ReactElement } from 'react';
import { Link } from 'react-router-dom';

export interface RouterLinkProps
  extends Omit<ComponentProps<'a'>, 'href' | 'ref'> {
  href: string;
}

export const RouterLink = forwardRef<HTMLAnchorElement, RouterLinkProps>(
  function RouterLink({ href, ...props }, ref): ReactElement {
    return <Link ref={ref} to={href} {...props} />;
  },
);
