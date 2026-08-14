import { readFileSync, readdirSync } from 'node:fs';
import { resolve } from 'node:path';
import ts from 'typescript';

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

function assertNoForbiddenCompiledDeclarations(style, label) {
  for (const styleClass of style.matchAll(/`([^`]+)`/g)) {
    const className = styleClass[1];
    const declaration = css.match(
      new RegExp(`\\.${escapeRegExp(className)}\\{([^}]*)\\}`),
    )?.[1];

    if (
      declaration?.startsWith('max-width:') ||
      declaration?.startsWith('margin-inline:') ||
      declaration === 'min-height:100vh'
    ) {
      throw new Error(
        `${label} includes forbidden declaration: ${declaration}`,
      );
    }
  }
}

function jsxTagName(openingElement) {
  return openingElement.tagName.getText();
}

function jsxAttribute(openingElement, name) {
  return openingElement.attributes.properties.find(
    (attribute) =>
      ts.isJsxAttribute(attribute) && attribute.name.getText() === name,
  );
}

function attributeValue(attribute) {
  if (!attribute?.initializer) {
    return undefined;
  }

  if (ts.isStringLiteral(attribute.initializer)) {
    return attribute.initializer.text;
  }

  if (
    ts.isJsxExpression(attribute.initializer) &&
    attribute.initializer.expression
  ) {
    const expression = attribute.initializer.expression;

    if (ts.isStringLiteral(expression)) {
      return expression.text;
    }

    return expression.getText();
  }

  return attribute.initializer.getText();
}

function isFullWidthValue(value) {
  return value === '100%' || value === "'100%'" || value === '"100%"';
}

function stylePropertyName(property) {
  if (!('name' in property) || property.name == null) {
    return undefined;
  }

  return ts.isIdentifier(property.name) ||
    ts.isStringLiteral(property.name) ||
    ts.isNumericLiteral(property.name)
    ? property.name.text
    : property.name.getText();
}

function styleObjectDefinitions(sourceFile) {
  const definitions = new Map();

  function visit(node) {
    if (
      ts.isVariableDeclaration(node) &&
      ts.isIdentifier(node.name) &&
      node.initializer &&
      ts.isCallExpression(node.initializer) &&
      node.initializer.expression.getText(sourceFile) === 'stylex.create' &&
      node.initializer.arguments.length === 1 &&
      ts.isObjectLiteralExpression(node.initializer.arguments[0])
    ) {
      const styleGroup = node.name.text;

      for (const property of node.initializer.arguments[0].properties) {
        if (
          ts.isPropertyAssignment(property) &&
          ts.isObjectLiteralExpression(property.initializer)
        ) {
          definitions.set(
            `${styleGroup}.${stylePropertyName(property)}`,
            property.initializer,
          );
        }
      }
    }

    ts.forEachChild(node, visit);
  }

  visit(sourceFile);
  return definitions;
}

function assertStyleObjectIsFullWidth(styleObject, sourcePath, styleName) {
  for (const property of styleObject.properties) {
    if (!ts.isPropertyAssignment(property)) {
      continue;
    }

    const name = stylePropertyName(property);
    const value = property.initializer.getText();

    if ((name === 'width' || name === 'maxWidth') && !isFullWidthValue(value)) {
      throw new Error(
        `${sourcePath} applies constrained ${name} through ${styleName}: ${value}`,
      );
    }

    if (name?.startsWith('margin') && /['"]auto['"]/.test(value)) {
      throw new Error(
        `${sourcePath} applies centering margin through ${styleName}: ${name}`,
      );
    }
  }
}

function isOpeningElement(node) {
  return ts.isJsxOpeningElement(node) || ts.isJsxSelfClosingElement(node);
}

function parentJsxTag(openingElement) {
  const ownElement = openingElement.parent;
  const parentElement = ownElement?.parent;

  if (!parentElement || !ts.isJsxElement(parentElement)) {
    return undefined;
  }

  return jsxTagName(parentElement.openingElement);
}

function isReturnedRoot(openingElement) {
  let current = openingElement.parent;

  while (current.parent && ts.isParenthesizedExpression(current.parent)) {
    current = current.parent;
  }

  return current.parent != null && ts.isReturnStatement(current.parent);
}

function assertPageRootIsFullWidth(sourcePath) {
  const source = readFileSync(resolve(process.cwd(), sourcePath), 'utf8');
  const sourceFile = ts.createSourceFile(
    sourcePath,
    source,
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.TSX,
  );
  const styleDefinitions = styleObjectDefinitions(sourceFile);

  function visit(node) {
    if (isOpeningElement(node)) {
      const tagName = jsxTagName(node);
      const isPageRoot =
        tagName === 'LayoutContent' ||
        (tagName === 'VStack' && parentJsxTag(node) === 'LayoutContent') ||
        (tagName === 'VStack' &&
          sourcePath !== 'src/app/not-found-page.tsx' &&
          isReturnedRoot(node));

      if (isPageRoot) {
        for (const attributeName of ['width', 'maxWidth']) {
          const attribute = jsxAttribute(node, attributeName);
          const value = attributeValue(attribute);

          if (attribute && !isFullWidthValue(value)) {
            throw new Error(
              `${sourcePath} applies constrained ${attributeName} to ${tagName}: ${value}`,
            );
          }
        }

        if (jsxAttribute(node, 'style')) {
          throw new Error(
            `${sourcePath} applies an unverifiable inline style to ${tagName}.`,
          );
        }

        for (const marginName of [
          'margin',
          'marginInline',
          'marginInlineStart',
          'marginInlineEnd',
        ]) {
          const marginAttribute = jsxAttribute(node, marginName);

          if (/auto/.test(attributeValue(marginAttribute) ?? '')) {
            throw new Error(
              `${sourcePath} centers ${tagName} through ${marginName}.`,
            );
          }
        }

        const xstyle = jsxAttribute(node, 'xstyle');

        if (xstyle) {
          const styleName = attributeValue(xstyle);
          const styleObject = styleDefinitions.get(styleName);

          if (!styleObject) {
            throw new Error(
              `${sourcePath} uses an unverifiable page-root xstyle: ${styleName}`,
            );
          }

          assertStyleObjectIsFullWidth(styleObject, sourcePath, styleName);
        }
      }
    }

    ts.forEachChild(node, visit);
  }

  visit(sourceFile);
}

function assertGlobalLayoutHasNoContentWidth(sourcePath) {
  const source = readFileSync(resolve(process.cwd(), sourcePath), 'utf8');
  const sourceFile = ts.createSourceFile(
    sourcePath,
    source,
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.TSX,
  );

  function visit(node) {
    if (
      isOpeningElement(node) &&
      jsxTagName(node) === 'Layout' &&
      jsxAttribute(node, 'contentWidth')
    ) {
      throw new Error(
        `${sourcePath} constrains the global Layout through contentWidth.`,
      );
    }

    ts.forEachChild(node, visit);
  }

  visit(sourceFile);
}

const frame = assertStyle('frame', [
  'width:100%',
  'height:100dvh',
  'overflow:hidden',
]);

assertNoForbiddenCompiledDeclarations(frame, 'Global frame');

assertGlobalLayoutHasNoContentWidth('src/app/global-navigation-layout.tsx');
for (const sourcePath of [
  'src/app/skills/home-page.tsx',
  'src/app/skills/skills-page.tsx',
  'src/app/skills/skill-detail-page.tsx',
  'src/app/not-found-page.tsx',
]) {
  assertPageRootIsFullWidth(sourcePath);
}

const detailRouteSource = readFileSync(
  resolve(process.cwd(), 'src/app/skills/skill-detail-route.tsx'),
  'utf8',
);
const notFoundSource = readFileSync(
  resolve(process.cwd(), 'src/app/not-found-page.tsx'),
  'utf8',
);

if (!detailRouteSource.includes('<NotFoundPage isFullWidth />')) {
  throw new Error(
    'Unknown skill routes must render the full-width not found page.',
  );
}

if (
  !notFoundSource.includes('if (isFullWidth)') ||
  !notFoundSource.includes('<LayoutContent') ||
  !notFoundSource.includes('xstyle={styles.page}')
) {
  throw new Error(
    'The not found page must use scrollable full-width content and constrain only its standalone branch.',
  );
}

const homePage = assertStyle('page', ['display:flex', 'flex-direction:column']);
assertNoForbiddenCompiledDeclarations(homePage, 'Home page root');
assertStyle('linkedRoot', [
  'padding-block:var(--spacing-0)',
  'padding-inline:var(--spacing-0)',
]);
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
