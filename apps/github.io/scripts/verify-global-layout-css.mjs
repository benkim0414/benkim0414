import { readFileSync, readdirSync } from 'node:fs';
import { resolve } from 'node:path';

const assetsDirectory = resolve(
  process.cwd(),
  '../../dist/apps/github.io/assets',
);
const assetNames = readdirSync(assetsDirectory);
const cssPath = resolve(
  assetsDirectory,
  assetNames.find((name) => /^main-.*\.css$/.test(name)) ?? '',
);
const javascriptPath = resolve(
  assetsDirectory,
  assetNames.find((name) => /^main-.*\.js$/.test(name)) ?? '',
);
const css = readFileSync(cssPath, 'utf8').replace(/\s+/g, '');
const javascript = readFileSync(javascriptPath, 'utf8');

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function findClass(declaration) {
  return css.match(
    new RegExp(`\\.([a-zA-Z0-9_-]+)\\{${escapeRegExp(declaration)};?\\}`),
  )?.[1];
}

function classFor(declaration) {
  const match = findClass(declaration);

  if (!match) {
    throw new Error(`Missing emitted StyleX declaration: ${declaration}`);
  }

  return match;
}

function compiledStyle(name) {
  const styles = [
    ...javascript.matchAll(
      new RegExp(`${name}:\\{([^{}]+?\\$\\$css:!0)\\}`, 'g'),
    ),
  ];

  if (styles.length === 0) {
    throw new Error(`Missing compiled StyleX object: ${name}`);
  }

  return styles.map((match) => {
    const assignments = [
      ...javascript.slice(0, match.index).matchAll(/([a-zA-Z_$][\w$]*)=\{/g),
    ];
    const binding = assignments.at(-1)?.[1];

    if (!binding) {
      throw new Error(`Missing compiled StyleX binding for: ${name}`);
    }

    return { binding, style: match[1] };
  });
}

function assertStyle(name, declarations) {
  const expectedClasses = declarations.map(classFor);
  const candidate = compiledStyle(name).find(({ style }) =>
    expectedClasses.every((className) => style.includes(`\`${className}\``)),
  );

  if (!candidate) {
    throw new Error(
      `Compiled ${name} style does not reference every expected emitted declaration.`,
    );
  }

  if (!javascript.includes(`xstyle:${candidate.binding}.${name}`)) {
    throw new Error(
      `Compiled ${name} style is emitted but not applied through an xstyle prop.`,
    );
  }

  return candidate.style;
}

const frame = assertStyle('frame', [
  'width:100%',
  'height:100dvh',
  'overflow:hidden',
]);

for (const frameClass of frame.matchAll(/`([^`]+)`/g)) {
  const className = frameClass[1];
  const declaration = css.match(
    new RegExp(`\\.${escapeRegExp(className)}\\{([^}]*)\\}`),
  )?.[1];

  if (
    declaration?.startsWith('max-width:') ||
    declaration?.startsWith('margin-inline:') ||
    declaration === 'min-height:100vh'
  ) {
    throw new Error(
      `Global frame includes forbidden declaration: ${declaration}`,
    );
  }
}

const detailSource = readFileSync(
  resolve(process.cwd(), 'src/app/skills/skill-detail-page.tsx'),
  'utf8',
);

for (const forbiddenSource of [
  'marginInline:',
  'xstyle={styles.page}',
]) {
  if (detailSource.includes(forbiddenSource)) {
    throw new Error(
      `Skill detail retains a page-width constraint: ${forbiddenSource}`,
    );
  }
}

assertStyle('page', ['display:flex', 'flex-direction:column']);
assertStyle('topSkills', [
  'flex-shrink:0',
  'background-color:var(--color-background-surface)',
]);
assertStyle('doraContent', [
  'flex-grow:1',
  'flex-shrink:1',
  'flex-basis:0',
  'min-height:0',
]);

console.log(
  `Verified compiled global frame, Home layout, and detail width rules in ${cssPath}.`,
);
