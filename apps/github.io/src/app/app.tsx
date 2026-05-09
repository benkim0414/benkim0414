import { ThemeProvider } from "@/components/theme-provider";
import { ThemeToggle } from "@/components/theme-toggle";
import { SkillSearchPanel } from "@/features/search/skill-search-panel";

export function App() {
  return (
    <ThemeProvider>
      <main className="min-h-screen bg-background text-foreground">
        <header className="border-b border-border">
          <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4">
            <a className="text-sm font-semibold" href="/">
              github.io
            </a>
            <div className="flex items-center gap-2">
              <a
                className="rounded-md px-3 py-2 text-sm text-muted-foreground hover:text-foreground"
                href="mailto:benkim0414@gmail.com"
              >
                Email
              </a>
              <a
                className="rounded-md px-3 py-2 text-sm text-muted-foreground hover:text-foreground"
                href="https://www.linkedin.com/in/gunwoobenkim0414"
              >
                LinkedIn
              </a>
              <ThemeToggle />
            </div>
          </div>
        </header>

        <section className="mx-auto grid max-w-6xl gap-6 px-4 pb-8 pt-10 md:grid-cols-[minmax(0,1fr)_18rem] md:items-end">
          <div className="space-y-4">
            <p className="text-sm font-medium text-muted-foreground">DevOps engineer</p>
            <h1 className="max-w-3xl text-4xl font-semibold tracking-normal md:text-5xl">
              Gunwoo Ben Kim
            </h1>
            <p className="max-w-2xl text-base leading-7 text-muted-foreground">
              A searchable skills showcase for recruiters and fellow developers, focused
              on infrastructure, delivery workflows, and developer-facing tooling.
            </p>
          </div>

          <div className="rounded-md border border-border bg-card p-4 text-sm text-card-foreground">
            <p className="font-medium">Primary focus</p>
            <p className="mt-2 text-muted-foreground">
              Search by skill, level, category, project, tag, or usage context.
            </p>
          </div>
        </section>

        <div className="border-t border-border">
          <SkillSearchPanel />
        </div>
      </main>
    </ThemeProvider>
  );
}

export default App;
