import type { NavItem } from './app-shell.types';

export interface TopBarProps {
  brandLabel: string;
  navItems: NavItem[];
}

export function TopBar({ brandLabel, navItems }: TopBarProps) {
  return (
    <header className="top-bar">
      <a className="brand" href="/" aria-label="Home">
        {brandLabel}
      </a>
      <nav className="nav" aria-label="Primary navigation">
        {navItems.map((item) => (
          <a key={item.href} href={item.href}>
            {item.label}
          </a>
        ))}
      </nav>
    </header>
  );
}
