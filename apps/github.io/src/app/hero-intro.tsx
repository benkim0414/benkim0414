export interface HeroIntroProps {
  eyebrow: string;
  title: string;
  body: string;
}

export function HeroIntro({ eyebrow, title, body }: HeroIntroProps) {
  return (
    <section className="intro" aria-labelledby="intro-title">
      <p className="eyebrow">{eyebrow}</p>
      <h1 id="intro-title">{title}</h1>
      <p>{body}</p>
    </section>
  );
}
