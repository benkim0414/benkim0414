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
  'max-width:448px',
  'height:100dvh',
  'overflow:hidden',
  'margin-inline:auto',
]);
const viewportMinHeightClass = findClass('min-height:100vh');

if (viewportMinHeightClass && frame.includes(`\`${viewportMinHeightClass}\``)) {
  throw new Error('Global frame combines 100dvh with min-height: 100vh.');
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
  `Verified compiled global frame and Home layout StyleX rules in ${cssPath}.`,
);
