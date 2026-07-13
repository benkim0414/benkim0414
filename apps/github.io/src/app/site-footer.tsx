export interface SiteFooterProps {
  label: string;
}

export function SiteFooter({ label }: SiteFooterProps) {
  return <footer className="footer">{label}</footer>;
}
