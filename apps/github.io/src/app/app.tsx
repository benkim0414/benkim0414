import {Theme} from '@astryxdesign/core';
import {neutralTheme} from '@astryxdesign/theme-neutral/built';

const navItems = ['Overview', 'Work', 'Notes'];

const sections = [
  {
    id: 'overview',
    label: 'Section 01',
    title: 'Content Region',
    body: 'Reserved space for future profile content.',
  },
  {
    id: 'work',
    label: 'Section 02',
    title: 'Content Region',
    body: 'Reserved space for future project content.',
  },
  {
    id: 'notes',
    label: 'Section 03',
    title: 'Content Region',
    body: 'Reserved space for future contact content.',
  },
];

export function App() {
  return (
    <Theme theme={neutralTheme}>
      <div className="app-shell">
        <header className="top-bar">
          <a className="brand" href="/" aria-label="Home">
            App Shell
          </a>
          <nav className="nav" aria-label="Primary navigation">
            {navItems.map((item) => (
              <a key={item} href={`#${item.toLowerCase()}`}>
                {item}
              </a>
            ))}
          </nav>
        </header>

        <main className="page">
          <section className="intro" aria-labelledby="intro-title">
            <p className="eyebrow">Page Shell</p>
            <h1 id="intro-title">Generic Layout Skeleton</h1>
            <p>
              A constrained single-page structure for future portfolio content.
            </p>
          </section>

          <div className="section-list" aria-label="Placeholder sections">
            {sections.map((section) => (
              <section
                className="content-section"
                id={section.id}
                key={section.label}
              >
                <p className="eyebrow">{section.label}</p>
                <h2>{section.title}</h2>
                <p>{section.body}</p>
              </section>
            ))}
          </div>
        </main>

        <footer className="footer">Footer Region</footer>
      </div>
    </Theme>
  );
}

export default App;
