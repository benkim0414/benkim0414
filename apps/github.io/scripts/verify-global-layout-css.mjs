import {
  mkdtempSync,
  readFileSync,
  readdirSync,
  rmSync,
  writeFileSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import ts from 'typescript';

const appDirectory = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const assetsDirectory = resolve(
  appDirectory,
  '../../dist/apps/github.io/assets',
);
let css = '';
let javascript = '';

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

function namedImportLocalNames(sourceFile, moduleName, importedName) {
  const localNames = new Set();

  for (const statement of sourceFile.statements) {
    if (
      !ts.isImportDeclaration(statement) ||
      !ts.isStringLiteral(statement.moduleSpecifier) ||
      statement.moduleSpecifier.text !== moduleName ||
      !statement.importClause?.namedBindings ||
      !ts.isNamedImports(statement.importClause.namedBindings)
    ) {
      continue;
    }

    for (const importSpecifier of statement.importClause.namedBindings
      .elements) {
      if (
        (importSpecifier.propertyName ?? importSpecifier.name).text ===
        importedName
      ) {
        localNames.add(importSpecifier.name.text);
      }
    }
  }

  return localNames;
}

function isImportedComponent(openingElement, localNames) {
  return (
    openingElement != null &&
    ts.isIdentifier(openingElement.tagName) &&
    localNames.has(openingElement.tagName.text)
  );
}

function requiredImportLocalNames(
  sourceFile,
  sourcePath,
  moduleName,
  importedName,
) {
  const localNames = namedImportLocalNames(
    sourceFile,
    moduleName,
    importedName,
  );

  if (localNames.size === 0) {
    throw new Error(
      `${sourcePath} must import ${importedName} from ${moduleName}.`,
    );
  }

  return localNames;
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

  if (attribute.initializer && ts.isStringLiteral(attribute.initializer)) {
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

function isReturnedRoot(openingElement) {
  let current = openingElement.parent;

  while (current.parent && ts.isParenthesizedExpression(current.parent)) {
    current = current.parent;
  }

  return current.parent != null && ts.isReturnStatement(current.parent);
}

function isNotFoundPageSource(sourcePath) {
  return (
    resolve(appDirectory, sourcePath) ===
    resolve(appDirectory, 'src/app/not-found-page.tsx')
  );
}

function baseClassUtility(classToken) {
  let bracketDepth = 0;
  let lastVariantSeparator = -1;

  for (const [index, character] of [...classToken].entries()) {
    if (character === '[' || character === '(') {
      bracketDepth += 1;
    } else if (character === ']' || character === ')') {
      bracketDepth = Math.max(0, bracketDepth - 1);
    } else if (character === ':' && bracketDepth === 0) {
      lastVariantSeparator = index;
    }
  }

  return classToken
    .slice(lastVariantSeparator + 1)
    .replace(/^!/, '')
    .replace(/!$/, '');
}

function assertPageRootClassName(attribute, sourcePath, tagName) {
  if (!attribute) {
    return;
  }

  let className;

  if (attribute.initializer && ts.isStringLiteral(attribute.initializer)) {
    className = attribute.initializer.text;
  } else if (
    ts.isJsxExpression(attribute.initializer) &&
    (ts.isStringLiteral(attribute.initializer.expression) ||
      ts.isNoSubstitutionTemplateLiteral(attribute.initializer.expression))
  ) {
    className = attribute.initializer.expression.text;
  } else {
    throw new Error(
      `${sourcePath} applies an unverifiable className to ${tagName}.`,
    );
  }

  const constrainedClass = className
    .split(/\s+/)
    .map(baseClassUtility)
    .find(
      (classToken) =>
        classToken === 'mx-auto' ||
        classToken === 'w-fit' ||
        classToken?.startsWith('max-w-') ||
        (classToken?.startsWith('w-') && classToken !== 'w-full'),
    );

  if (constrainedClass) {
    throw new Error(
      `${sourcePath} applies constrained className ${constrainedClass} to ${tagName}.`,
    );
  }
}

export function auditPageRoots(sourcePath) {
  const source = readFileSync(resolve(appDirectory, sourcePath), 'utf8');
  const sourceFile = ts.createSourceFile(
    sourcePath,
    source,
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.TSX,
  );
  const styleDefinitions = styleObjectDefinitions(sourceFile);
  const layoutContentNames = namedImportLocalNames(
    sourceFile,
    '@astryxdesign/core/Layout',
    'LayoutContent',
  );
  let recognizedRoots = 0;
  let pageOwnedLayoutContents = 0;

  function visit(node) {
    if (isOpeningElement(node)) {
      const tagName = jsxTagName(node);
      const isPageRoot =
        (tagName === 'main' ||
          attributeValue(jsxAttribute(node, 'as')) === 'main') &&
        isReturnedRoot(node) &&
        (!isNotFoundPageSource(sourcePath) ||
          attributeValue(jsxAttribute(node, 'data-layout')) === 'full-width');

      if (isImportedComponent(node, layoutContentNames)) {
        pageOwnedLayoutContents += 1;
      }

      if (isPageRoot) {
        recognizedRoots += 1;

        if (
          node.attributes.properties.some((attribute) =>
            ts.isJsxSpreadAttribute(attribute),
          )
        ) {
          throw new Error(
            `${sourcePath} applies unverifiable spread attributes to ${tagName}.`,
          );
        }

        assertPageRootClassName(
          jsxAttribute(node, 'className'),
          sourcePath,
          tagName,
        );

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

  if (pageOwnedLayoutContents > 0) {
    throw new Error(`${sourcePath} must not render LayoutContent.`);
  }

  if (recognizedRoots === 0) {
    throw new Error(`${sourcePath} has no semantic main landmark.`);
  }

  if (recognizedRoots !== 1) {
    throw new Error(
      `${sourcePath} has ${recognizedRoots} semantic main landmarks, expected one.`,
    );
  }

  return recognizedRoots;
}

function jsxElementContainsImportedComponent(node, localNames) {
  let isPresent = false;

  function visit(child) {
    if (isPresent) {
      return;
    }

    if (isOpeningElement(child) && isImportedComponent(child, localNames)) {
      isPresent = true;
      return;
    }

    ts.forEachChild(child, visit);
  }

  ts.forEachChild(node, visit);
  return isPresent;
}

function exportedGlobalNavigationLayout(sourceFile, sourcePath) {
  const components = sourceFile.statements.filter(
    (statement) =>
      ts.isFunctionDeclaration(statement) &&
      statement.name?.text === 'GlobalNavigationLayout' &&
      statement.modifiers?.some(
        (modifier) => modifier.kind === ts.SyntaxKind.ExportKeyword,
      ),
  );

  if (components.length !== 1 || !components[0].body) {
    throw new Error(
      `${sourcePath} must export exactly one GlobalNavigationLayout function.`,
    );
  }

  return components[0];
}

function returnedExpression(component, sourcePath) {
  const returns = [];

  function visit(node) {
    if (node !== component.body && ts.isFunctionLike(node)) {
      return;
    }

    if (ts.isReturnStatement(node)) {
      if (node.expression) {
        returns.push(node.expression);
      }
      return;
    }

    ts.forEachChild(node, visit);
  }

  visit(component.body);

  if (returns.length !== 1) {
    throw new Error(
      `${sourcePath} GlobalNavigationLayout must have exactly one returned layout tree.`,
    );
  }

  return returns[0];
}

function unwrapParenthesizedExpression(expression) {
  let current = expression;

  while (ts.isParenthesizedExpression(current)) {
    current = current.expression;
  }

  return current;
}

function openingElementForExpression(expression) {
  const unwrapped = unwrapParenthesizedExpression(expression);

  if (ts.isJsxElement(unwrapped)) {
    return unwrapped.openingElement;
  }

  return ts.isJsxSelfClosingElement(unwrapped) ? unwrapped : undefined;
}

export function auditGlobalLayout(sourcePath) {
  const source = readFileSync(resolve(appDirectory, sourcePath), 'utf8');
  const sourceFile = ts.createSourceFile(
    sourcePath,
    source,
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.TSX,
  );
  const layoutNames = requiredImportLocalNames(
    sourceFile,
    sourcePath,
    '@astryxdesign/core/Layout',
    'Layout',
  );
  const layoutContentNames = requiredImportLocalNames(
    sourceFile,
    sourcePath,
    '@astryxdesign/core/Layout',
    'LayoutContent',
  );
  const outletNames = requiredImportLocalNames(
    sourceFile,
    sourcePath,
    'react-router-dom',
    'Outlet',
  );
  const component = exportedGlobalNavigationLayout(sourceFile, sourcePath);
  const returnedTree = returnedExpression(component, sourcePath);
  const layouts = [];
  const layoutContents = [];

  function visit(node) {
    if (isOpeningElement(node)) {
      if (isImportedComponent(node, layoutNames)) {
        layouts.push(node);
      }

      if (isImportedComponent(node, layoutContentNames)) {
        layoutContents.push(node);
      }
    }

    ts.forEachChild(node, visit);
  }

  visit(returnedTree);

  if (layouts.length !== 1) {
    throw new Error(
      `${sourcePath} GlobalNavigationLayout must return exactly one Layout, found ${layouts.length}.`,
    );
  }

  const [layout] = layouts;

  if (jsxAttribute(layout, 'contentWidth')) {
    throw new Error(
      `${sourcePath} constrains the global Layout through contentWidth.`,
    );
  }

  if (layoutContents.length !== 1) {
    const content = jsxAttribute(layout, 'content');
    const contentOpening =
      content?.initializer &&
      ts.isJsxExpression(content.initializer) &&
      content.initializer.expression
        ? openingElementForExpression(content.initializer.expression)
        : undefined;

    if (content && !isImportedComponent(contentOpening, layoutContentNames)) {
      throw new Error(
        `${sourcePath} returned Layout content prop must be owned by LayoutContent.`,
      );
    }

    throw new Error(
      `${sourcePath} must render exactly one LayoutContent shell owner, found ${layoutContents.length}.`,
    );
  }

  const [layoutContent] = layoutContents;

  const content = jsxAttribute(layout, 'content');
  const contentOpening =
    content?.initializer &&
    ts.isJsxExpression(content.initializer) &&
    content.initializer.expression
      ? openingElementForExpression(content.initializer.expression)
      : undefined;

  if (contentOpening !== layoutContent) {
    throw new Error(
      `${sourcePath} returned Layout content prop must be owned by LayoutContent.`,
    );
  }

  if (
    layoutContent.attributes.properties.some((attribute) =>
      ts.isJsxSpreadAttribute(attribute),
    )
  ) {
    throw new Error(
      `${sourcePath} must not spread props into the LayoutContent shell owner.`,
    );
  }

  if (attributeValue(jsxAttribute(layoutContent, 'padding')) !== '0') {
    throw new Error(
      `${sourcePath} LayoutContent shell owner must use padding={0}.`,
    );
  }

  if (!jsxElementContainsImportedComponent(layoutContent.parent, outletNames)) {
    throw new Error(
      `${sourcePath} LayoutContent shell owner must contain the routed Outlet.`,
    );
  }
}

function assertRejects(failures, label, operation, messagePattern) {
  try {
    operation();
  } catch (error) {
    if (!(error instanceof Error) || !messagePattern.test(error.message)) {
      failures.push(
        `${label} failed for the wrong reason: ${error instanceof Error ? error.message : String(error)}`,
      );
      return;
    }

    console.log(`PASS ${label}: ${error.message}`);
    return;
  }

  failures.push(`${label} was not rejected.`);
}

function assertAccepts(failures, label, operation) {
  try {
    operation();
  } catch (error) {
    failures.push(
      `${label} was rejected: ${error instanceof Error ? error.message : String(error)}`,
    );
    return;
  }

  console.log(`PASS ${label}`);
}

function runSelfTests() {
  const failures = [];
  const fixtureDirectory = mkdtempSync(
    resolve(tmpdir(), 'verify-global-layout-css-'),
  );

  try {
    const fixture = (name, source) => {
      const sourcePath = resolve(fixtureDirectory, name);
      writeFileSync(sourcePath, source);
      return sourcePath;
    };

    const recognizedRoots = auditPageRoots(
      fixture(
        'recognized-roots.tsx',
        `import { VStack } from '@astryxdesign/core/Layout';\nexport function Page() { return <VStack as="main" aria-label="Page" className="w-full">Page</VStack>; }`,
      ),
    );

    if (recognizedRoots !== 1) {
      failures.push(
        `recognized page roots returned ${recognizedRoots}, expected 1.`,
      );
    } else {
      console.log('PASS recognized page-root count: 1');
    }

    const notFoundRoots = auditPageRoots('src/app/not-found-page.tsx');

    if (notFoundRoots !== 1) {
      failures.push(
        `full-width not found page roots returned ${notFoundRoots}, expected 1.`,
      );
    } else {
      console.log('PASS full-width not found page-root count: 1');
    }

    assertRejects(
      failures,
      'page root without a semantic main landmark',
      () =>
        auditPageRoots(
          fixture(
            'aliased-root.tsx',
            `import { VStack } from '@astryxdesign/core/Layout';\nexport function Page() { return <VStack aria-label="Page">Page</VStack>; }`,
          ),
        ),
      /semantic main landmark/,
    );
    assertRejects(
      failures,
      'constrained page-root className',
      () =>
        auditPageRoots(
          fixture(
            'constrained-class.tsx',
            `import { VStack } from '@astryxdesign/core/Layout';\nexport function Page() { return <VStack as="main" className="max-w-md mx-auto">Page</VStack>; }`,
          ),
        ),
      /constrained className/,
    );
    assertRejects(
      failures,
      'dynamic page-root className',
      () =>
        auditPageRoots(
          fixture(
            'dynamic-class.tsx',
            `import { VStack } from '@astryxdesign/core/Layout';\nexport function Page({ rootClass }) { return <VStack as="main" className={rootClass}>Page</VStack>; }`,
          ),
        ),
      /unverifiable className/,
    );
    for (const constrainedClassName of ['mx-auto', 'w-fit', 'max-w-[28rem]']) {
      assertRejects(
        failures,
        `constrained page-root className ${constrainedClassName}`,
        () =>
          auditPageRoots(
            fixture(
              `constrained-class-${constrainedClassName.replaceAll(/[^a-z0-9]/g, '-')}.tsx`,
              `import { VStack } from '@astryxdesign/core/Layout';\nexport function Page() { return <VStack as="main" className="${constrainedClassName}">Page</VStack>; }`,
            ),
          ),
        /constrained className/,
      );
    }
    for (const widthClassName of ['w-96', 'w-1/2', 'w-[448px]', 'md:w-96']) {
      assertRejects(
        failures,
        `constrained page-root width className ${widthClassName}`,
        () =>
          auditPageRoots(
            fixture(
              `constrained-width-class-${widthClassName.replaceAll(/[^a-z0-9]/g, '-')}.tsx`,
              `import { VStack } from '@astryxdesign/core/Layout';\nexport function Page() { return <VStack as="main" className="${widthClassName}">Page</VStack>; }`,
            ),
          ),
        /constrained className/,
      );
    }
    assertRejects(
      failures,
      'page-root spread attributes',
      () =>
        auditPageRoots(
          fixture(
            'spread-attributes.tsx',
            `import { VStack } from '@astryxdesign/core/Layout';\nexport function Page({ rootProps }) { return <VStack as="main" {...rootProps}>Page</VStack>; }`,
          ),
        ),
      /unverifiable spread attributes/,
    );
    assertRejects(
      failures,
      'global Layout contentWidth',
      () =>
        auditGlobalLayout(
          fixture(
            'global-layout.tsx',
            `import { Layout, LayoutContent } from '@astryxdesign/core/Layout';\nimport { Outlet } from 'react-router-dom';\nexport function GlobalNavigationLayout() { return <Layout content={<LayoutContent padding={0}><Outlet /></LayoutContent>} contentWidth={448} />; }`,
          ),
        ),
      /contentWidth/,
    );
    assertAccepts(failures, 'aliased global shell imports', () =>
      auditGlobalLayout(
        fixture(
          'aliased-global-shell-imports.tsx',
          `import { Layout as ShellLayout, LayoutContent as ShellContent } from '@astryxdesign/core/Layout';\nimport { Outlet as RoutedOutlet } from 'react-router-dom';\nexport function GlobalNavigationLayout() { return <ShellLayout content={<ShellContent padding={0}><RoutedOutlet /></ShellContent>} />; }`,
        ),
      ),
    );
    assertRejects(
      failures,
      'global shell without a LayoutContent owner',
      () =>
        auditGlobalLayout(
          fixture(
            'missing-shell-owner.tsx',
            `import { Layout, LayoutContent } from '@astryxdesign/core/Layout';\nimport { Outlet } from 'react-router-dom';\nexport function GlobalNavigationLayout() { return <Layout />; }`,
          ),
        ),
      /exactly one LayoutContent/,
    );
    assertRejects(
      failures,
      'malformed global shell owner',
      () =>
        auditGlobalLayout(
          fixture(
            'malformed-shell-owner.tsx',
            `import { Layout, LayoutContent } from '@astryxdesign/core/Layout';\nimport { Outlet } from 'react-router-dom';\nexport function GlobalNavigationLayout() { return <Layout content={<LayoutContent padding={4}><Outlet /></LayoutContent>} />; }`,
          ),
        ),
      /padding=\{0\}/,
    );
    assertRejects(
      failures,
      'global shell owner without the routed Outlet',
      () =>
        auditGlobalLayout(
          fixture(
            'shell-owner-without-outlet.tsx',
            `import { Layout, LayoutContent } from '@astryxdesign/core/Layout';\nimport { Outlet } from 'react-router-dom';\nexport function GlobalNavigationLayout() { return <Layout content={<LayoutContent padding={0}>Content</LayoutContent>} />; }`,
          ),
        ),
      /contain the routed Outlet/,
    );
    assertRejects(
      failures,
      'off-shell LayoutContent decoy',
      () =>
        auditGlobalLayout(
          fixture(
            'off-shell-layout-content.tsx',
            `import { Layout, LayoutContent, VStack } from '@astryxdesign/core/Layout';\nimport { Outlet } from 'react-router-dom';\nexport function GlobalNavigationLayout() { return <Layout content={<VStack />}><LayoutContent padding={0}><Outlet /></LayoutContent></Layout>; }`,
          ),
        ),
      /content prop/,
    );
    assertRejects(
      failures,
      'unused valid global shell decoy',
      () =>
        auditGlobalLayout(
          fixture(
            'unused-valid-shell-decoy.tsx',
            `import { Layout, LayoutContent, VStack } from '@astryxdesign/core/Layout';\nimport { Outlet } from 'react-router-dom';\nconst decoy = <Layout content={<LayoutContent padding={0}><Outlet /></LayoutContent>} />;\nexport function GlobalNavigationLayout() { return <Layout content={<VStack />} />; }`,
          ),
        ),
      /returned Layout content prop/,
    );
    assertRejects(
      failures,
      'page-owned LayoutContent',
      () =>
        auditPageRoots(
          fixture(
            'page-owned-layout-content.tsx',
            `import { LayoutContent, VStack } from '@astryxdesign/core/Layout';\nexport function Page() { return <VStack as="main" aria-label="Page" padding={4}><LayoutContent /></VStack>; }`,
          ),
        ),
      /must not render LayoutContent/,
    );
    assertRejects(
      failures,
      'aliased page-owned LayoutContent',
      () =>
        auditPageRoots(
          fixture(
            'aliased-page-owned-layout-content.tsx',
            `import { LayoutContent as PageContent, VStack } from '@astryxdesign/core/Layout';\nexport function Page() { return <VStack as="main" aria-label="Page" padding={4}><PageContent /></VStack>; }`,
          ),
        ),
      /must not render LayoutContent/,
    );
    assertRejects(
      failures,
      'Roadmap root without a semantic main landmark',
      () =>
        auditPageRoots(
          fixture(
            'roadmap-root-contract.tsx',
            `import { VStack } from '@astryxdesign/core/Layout';\nexport function RoadmapPage() { return <VStack aria-label="Roadmap" padding={4}>Roadmap</VStack>; }`,
          ),
        ),
      /semantic main landmark/,
    );
    assertRejects(
      failures,
      'page-root maxWidth',
      () =>
        auditPageRoots(
          fixture(
            'constrained-prop.tsx',
            `import { VStack } from '@astryxdesign/core/Layout';\nexport function Page() { return <VStack as="main" maxWidth={448}>Page</VStack>; }`,
          ),
        ),
      /constrained maxWidth/,
    );
  } finally {
    rmSync(fixtureDirectory, { recursive: true, force: true });
  }

  if (failures.length > 0) {
    throw new Error(`Self-test failures:\n- ${failures.join('\n- ')}`);
  }

  console.log('Verified fail-closed page-root audit self-tests.');
}

function verifyBuiltLayout() {
  const assetNames = readdirSync(assetsDirectory);
  const cssPath = resolve(
    assetsDirectory,
    assetNames.find((name) => /^main-.*\.css$/.test(name)) ?? '',
  );
  const javascriptPath = resolve(
    assetsDirectory,
    assetNames.find((name) => /^main-.*\.js$/.test(name)) ?? '',
  );
  css = readFileSync(cssPath, 'utf8').replace(/\s+/g, '');
  javascript = readFileSync(javascriptPath, 'utf8');

  const frame = assertStyle('frame', [
    'width:100%',
    'height:100dvh',
    'overflow:hidden',
  ]);

  assertNoForbiddenCompiledDeclarations(frame, 'Global frame');

  auditGlobalLayout('src/app/global-navigation-layout.tsx');
  for (const sourcePath of [
    'src/app/skills/home-page.tsx',
    'src/app/skills/skills-page.tsx',
    'src/app/skills/skill-detail-page.tsx',
    'src/app/devops-roadmap/roadmap-page.tsx',
    'src/app/not-found-page.tsx',
  ]) {
    auditPageRoots(sourcePath);
  }

  const detailRouteSource = readFileSync(
    resolve(appDirectory, 'src/app/skills/skill-detail-route.tsx'),
    'utf8',
  );
  const notFoundSource = readFileSync(
    resolve(appDirectory, 'src/app/not-found-page.tsx'),
    'utf8',
  );

  if (!detailRouteSource.includes('<NotFoundPage isFullWidth />')) {
    throw new Error(
      'Unknown skill routes must render the full-width not found page.',
    );
  }

  if (
    !notFoundSource.includes('if (isFullWidth)') ||
    !notFoundSource.includes('<VStack') ||
    !notFoundSource.includes('data-layout="full-width"') ||
    !notFoundSource.includes('xstyle={styles.page}')
  ) {
    throw new Error(
      'The not found page must use a full-width semantic root and constrain only its standalone branch.',
    );
  }

  assertStyle('linkedRoot', [
    'padding-block:var(--spacing-0)',
    'padding-inline:var(--spacing-0)',
  ]);

  console.log(
    `Verified compiled global frame and detail width rules in ${cssPath}.`,
  );
}

if (
  process.argv[1] &&
  resolve(process.argv[1]) === fileURLToPath(import.meta.url)
) {
  if (process.argv.includes('--self-test')) {
    runSelfTests();
  } else {
    verifyBuiltLayout();
  }
}
