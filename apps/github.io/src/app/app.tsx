import NxWelcome from "./nx-welcome";
import { ThemeProvider } from "@/components/theme-provider";
import { ThemeToggle } from "@/components/theme-toggle";

export function App() {
  return (
    <ThemeProvider>
      <main className="min-h-screen bg-background text-foreground">
        <div className="mx-auto flex max-w-6xl justify-end p-4">
          <ThemeToggle />
        </div>
        <NxWelcome title="github.io" />
      </main>
    </ThemeProvider>
  );
}

export default App;

