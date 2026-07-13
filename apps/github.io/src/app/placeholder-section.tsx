import type { PlaceholderSectionData } from './app-shell.types';

export function PlaceholderSection({
  id,
  label,
  title,
  body,
}: PlaceholderSectionData) {
  return (
    <section className="content-section" id={id}>
      <p className="eyebrow">{label}</p>
      <h2>{title}</h2>
      <p>{body}</p>
    </section>
  );
}
