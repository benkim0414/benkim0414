import { spawn } from 'node:child_process';
import { mkdtempSync, rmSync } from 'node:fs';
import { createServer } from 'node:net';
import { tmpdir } from 'node:os';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const HOST = '127.0.0.1';
const READY_TIMEOUT_MS = 15_000;
const COMMAND_TIMEOUT_MS = 10_000;
const SUBPIXEL_TOLERANCE = 0.75;
const appDirectory = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const viewports = [
  { width: 375, height: 667 },
  { width: 820, height: 1180 },
];
const routes = [
  {
    path: '/',
    isInFrame: true,
    readySelector: '[role="main"][aria-label="Home"]',
  },
  {
    path: '/skills',
    isInFrame: true,
    readySelector: '[role="main"][aria-labelledby="skills-page-title"]',
  },
  {
    path: '/skills/kubernetes',
    isInFrame: true,
    readySelector: '[role="main"][aria-label="Skill detail"] h1',
    focusSelector: '[role="main"][aria-label="Skill detail"] h1',
  },
  {
    path: '/skills/not-real',
    isInFrame: true,
    readySelector: '[data-testid="not-found-page"][data-layout="full-width"]',
  },
  {
    path: '/not-a-route',
    isInFrame: false,
    readySelector: '[data-testid="not-found-page"][data-layout="standalone"]',
  },
];

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

function isWithinTolerance(actual, expected) {
  return Math.abs(actual - expected) <= SUBPIXEL_TOLERANCE;
}

function wait(milliseconds) {
  return new Promise((resolvePromise) =>
    setTimeout(resolvePromise, milliseconds),
  );
}

function parseRequestedPort(environmentName) {
  const requested = process.env[environmentName];

  if (requested == null || requested === '') {
    return 0;
  }

  const port = Number(requested);

  if (!Number.isInteger(port) || port < 1024 || port > 65_535) {
    throw new Error(
      `${environmentName} must be an integer from 1024 to 65535.`,
    );
  }

  return port;
}

async function reservePort(environmentName) {
  const server = createServer();
  const requestedPort = parseRequestedPort(environmentName);

  await new Promise((resolvePromise, reject) => {
    server.once('error', reject);
    server.listen(requestedPort, HOST, () => {
      server.off('error', reject);
      resolvePromise();
    });
  });

  const address = server.address();

  if (address == null || typeof address === 'string') {
    server.close();
    throw new Error(`Unable to reserve a dedicated ${environmentName} port.`);
  }

  return { environmentName, port: address.port, server };
}

async function releasePort(reservation) {
  if (!reservation?.server.listening) {
    return;
  }

  await new Promise((resolvePromise, reject) => {
    reservation.server.close((error) => {
      if (error) {
        reject(error);
      } else {
        resolvePromise();
      }
    });
  });
}

function startOwnedProcess(command, arguments_, options = {}) {
  const output = [];
  const child = spawn(command, arguments_, {
    cwd: options.cwd,
    detached: process.platform !== 'win32',
    env: options.env ?? process.env,
    shell: false,
    stdio: ['ignore', 'pipe', 'pipe'],
    windowsHide: true,
  });

  const rememberOutput = (chunk) => {
    output.push(chunk.toString());
    const joined = output.join('');

    if (joined.length > 32_000) {
      output.splice(0, output.length, joined.slice(-32_000));
    }
  };

  child.stdout.on('data', rememberOutput);
  child.stderr.on('data', rememberOutput);
  child.once('error', (error) => {
    child.spawnError = error;
  });
  child.getOutput = () => output.join('').trim();
  return child;
}

function processHasExited(child) {
  return child == null || child.exitCode != null || child.signalCode != null;
}

async function waitForProcessExit(child, timeoutMilliseconds) {
  if (processHasExited(child)) {
    return true;
  }

  return new Promise((resolvePromise) => {
    const timer = setTimeout(() => {
      child.off('exit', onExit);
      resolvePromise(false);
    }, timeoutMilliseconds);
    const onExit = () => {
      clearTimeout(timer);
      resolvePromise(true);
    };

    child.once('exit', onExit);
  });
}

async function stopOwnedProcess(child, label) {
  if (child == null) {
    return;
  }

  const pid = child.pid;

  if (!processHasExited(child)) {
    assert(
      Number.isInteger(pid) && pid > 1,
      `Refusing to stop invalid ${label} PID.`,
    );
    const target = process.platform === 'win32' ? pid : -pid;

    try {
      process.kill(target, 'SIGTERM');
    } catch (error) {
      if (error?.code !== 'ESRCH') {
        throw error;
      }
    }

    if (!(await waitForProcessExit(child, 3_000))) {
      try {
        process.kill(target, 'SIGKILL');
      } catch (error) {
        if (error?.code !== 'ESRCH') {
          throw error;
        }
      }

      assert(
        await waitForProcessExit(child, 3_000),
        `${label} process did not exit after SIGKILL.`,
      );
    }
  }

  console.log(
    `CLEANUP ${label} process stopped (pid ${pid ?? 'not-started'}).`,
  );
}

async function waitForHttpReady(url, child) {
  const deadline = Date.now() + READY_TIMEOUT_MS;
  let lastError;

  while (Date.now() < deadline) {
    if (child.spawnError) {
      throw new Error(
        `Production preview failed to start: ${child.spawnError.message}`,
      );
    }

    if (processHasExited(child)) {
      throw new Error(
        `Production preview exited before readiness.${child.getOutput() ? `\n${child.getOutput()}` : ''}`,
      );
    }

    try {
      const response = await fetch(url, { signal: AbortSignal.timeout(1_000) });

      if (response.ok && (await response.text()).includes('<!doctype html>')) {
        return;
      }

      lastError = new Error(`Preview returned HTTP ${response.status}.`);
    } catch (error) {
      lastError = error;
    }

    await wait(50);
  }

  throw new Error(
    `Production preview did not become ready: ${lastError instanceof Error ? lastError.message : String(lastError)}`,
  );
}

function openWebSocket(url) {
  return new Promise((resolvePromise, reject) => {
    const socket = new WebSocket(url);
    const onOpen = () => {
      socket.removeEventListener('error', onError);
      resolvePromise(socket);
    };
    const onError = () => {
      socket.removeEventListener('open', onOpen);
      socket.close();
      reject(new Error(`Unable to connect to ${url}.`));
    };

    socket.addEventListener('open', onOpen, { once: true });
    socket.addEventListener('error', onError, { once: true });
  });
}

async function webSocketMessageText(data) {
  if (typeof data === 'string') {
    return data;
  }

  if (data instanceof Blob) {
    return data.text();
  }

  return Buffer.from(data).toString('utf8');
}

class BidiClient {
  constructor(socket) {
    this.socket = socket;
    this.nextCommandId = 1;
    this.pendingCommands = new Map();

    socket.addEventListener('message', async (event) => {
      let message;

      try {
        message = JSON.parse(await webSocketMessageText(event.data));
      } catch (error) {
        this.rejectPending(error);
        return;
      }

      if (message.id == null) {
        return;
      }

      const pending = this.pendingCommands.get(message.id);

      if (!pending) {
        return;
      }

      this.pendingCommands.delete(message.id);
      clearTimeout(pending.timer);

      if (message.type === 'success') {
        pending.resolve(message.result);
      } else {
        pending.reject(
          new Error(
            `${pending.method} failed: ${message.error ?? message.type}: ${message.message ?? 'No protocol message'}`,
          ),
        );
      }
    });
    socket.addEventListener('close', () => {
      this.rejectPending(new Error('Firefox closed the BiDi connection.'));
    });
    socket.addEventListener('error', () => {
      this.rejectPending(new Error('Firefox BiDi WebSocket failed.'));
    });
  }

  static async connect(url, child) {
    const deadline = Date.now() + READY_TIMEOUT_MS;
    let lastError;

    while (Date.now() < deadline) {
      if (child.spawnError) {
        throw new Error(`Firefox failed to start: ${child.spawnError.message}`);
      }

      if (processHasExited(child)) {
        throw new Error(
          `Firefox exited before BiDi readiness.${child.getOutput() ? `\n${child.getOutput()}` : ''}`,
        );
      }

      try {
        return new BidiClient(await openWebSocket(url));
      } catch (error) {
        lastError = error;
      }

      await wait(50);
    }

    throw new Error(
      `Firefox BiDi did not become ready: ${lastError instanceof Error ? lastError.message : String(lastError)}`,
    );
  }

  command(method, params = {}) {
    const id = this.nextCommandId;
    this.nextCommandId += 1;

    return new Promise((resolvePromise, reject) => {
      const timer = setTimeout(() => {
        this.pendingCommands.delete(id);
        reject(new Error(`${method} timed out after ${COMMAND_TIMEOUT_MS}ms.`));
      }, COMMAND_TIMEOUT_MS);

      this.pendingCommands.set(id, {
        method,
        reject,
        resolve: resolvePromise,
        timer,
      });

      try {
        this.socket.send(JSON.stringify({ id, method, params }));
      } catch (error) {
        clearTimeout(timer);
        this.pendingCommands.delete(id);
        reject(error);
      }
    });
  }

  rejectPending(error) {
    for (const pending of this.pendingCommands.values()) {
      clearTimeout(pending.timer);
      pending.reject(error);
    }

    this.pendingCommands.clear();
  }

  async close() {
    if (this.socket.readyState === WebSocket.CLOSED) {
      return;
    }

    await new Promise((resolvePromise) => {
      const timer = setTimeout(resolvePromise, 1_000);
      this.socket.addEventListener(
        'close',
        () => {
          clearTimeout(timer);
          resolvePromise();
        },
        { once: true },
      );
      this.socket.close();
    });

    if (this.socket.readyState !== WebSocket.CLOSED) {
      throw new Error('Firefox BiDi WebSocket did not close within 1000ms.');
    }
  }
}

async function evaluateJson(bidi, context, expression) {
  const evaluation = await bidi.command('script.evaluate', {
    awaitPromise: true,
    expression: `JSON.stringify((() => { ${expression} })())`,
    target: { context },
  });

  if (evaluation.type !== 'success') {
    throw new Error(
      `Browser evaluation failed: ${evaluation.exceptionDetails?.text ?? evaluation.type}`,
    );
  }

  if (evaluation.result.type !== 'string') {
    throw new Error(
      `Browser evaluation returned ${evaluation.result.type}, expected string.`,
    );
  }

  return JSON.parse(evaluation.result.value);
}

async function waitForSelector(bidi, context, selector) {
  const deadline = Date.now() + READY_TIMEOUT_MS;

  while (Date.now() < deadline) {
    const isReady = await evaluateJson(
      bidi,
      context,
      `return document.readyState === 'complete' && document.querySelector(${JSON.stringify(selector)}) !== null;`,
    );

    if (isReady) {
      return;
    }

    await wait(50);
  }

  const diagnostic = await evaluateJson(
    bidi,
    context,
    `
      return {
        body: document.body?.innerHTML.slice(0, 1000) ?? null,
        location: location.href,
        readyState: document.readyState,
        scripts: [...document.scripts].map((script) => script.src),
        title: document.title,
      };
    `,
  );
  throw new Error(
    `Timed out waiting for route selector: ${selector}\n${JSON.stringify(diagnostic, null, 2)}`,
  );
}

async function inspectRoute(bidi, context, focusSelector) {
  return evaluateJson(
    bidi,
    context,
    `
      const rectangle = (element) => {
        if (!element) return null;
        const { left, right, top, bottom, width, height } = element.getBoundingClientRect();
        return { left, right, top, bottom, width, height };
      };
      const describe = (element) => ({
        tag: element.tagName.toLowerCase(),
        className: element.className,
        role: element.getAttribute('role'),
        testId: element.getAttribute('data-testid'),
      });
      const main = document.querySelector('main, [role="main"]');
      const scrollOwners = main
        ? [main, ...main.querySelectorAll('*')].filter((element) => {
            const style = getComputedStyle(element);
            const rect = element.getBoundingClientRect();
            return (
              (style.overflowY === 'auto' || style.overflowY === 'scroll') &&
              rect.width > 0 &&
              rect.height > 0
            );
          })
        : [];
      const activeElement = document.activeElement;
      const documentWidth = Math.max(
        document.documentElement.scrollWidth,
        document.body?.scrollWidth ?? 0,
      );

      return {
        viewport: { width: innerWidth, height: innerHeight },
        frame: rectangle(main?.closest('.astryx-layout')),
        main: rectangle(main),
        horizontalOverflow: Math.max(0, documentWidth - innerWidth),
        scrollOwners: scrollOwners.map(describe),
        layoutMode: document.querySelector('[data-testid="not-found-page"]')?.getAttribute('data-layout') ?? null,
        focus: activeElement ? describe(activeElement) : null,
        focusMatches: ${focusSelector ? `activeElement?.matches(${JSON.stringify(focusSelector)}) ?? false` : 'true'},
      };
    `,
  );
}

function assertRouteMetrics(route, viewport, metrics) {
  const label = `${viewport.width}x${viewport.height} ${route.path}`;

  assert(
    isWithinTolerance(metrics.viewport.width, viewport.width) &&
      isWithinTolerance(metrics.viewport.height, viewport.height),
    `${label} did not use the requested viewport: ${JSON.stringify(metrics.viewport)}`,
  );
  assert(
    metrics.horizontalOverflow <= SUBPIXEL_TOLERANCE,
    `${label} has ${metrics.horizontalOverflow}px document horizontal overflow.`,
  );

  if (!route.isInFrame) {
    assert(
      metrics.layoutMode === 'standalone',
      `${label} did not render the standalone wildcard.`,
    );
    console.log(
      `PASS ${label} standalone=yes horizontal-overflow=${metrics.horizontalOverflow.toFixed(2)}px`,
    );
    return;
  }

  assert(metrics.frame != null, `${label} has no global layout frame.`);
  assert(
    isWithinTolerance(metrics.frame.left, 0) &&
      isWithinTolerance(metrics.frame.right, viewport.width) &&
      isWithinTolerance(metrics.frame.width, viewport.width),
    `${label} frame does not span the viewport: ${JSON.stringify(metrics.frame)}`,
  );
  assert(
    metrics.scrollOwners.length === 1,
    `${label} has ${metrics.scrollOwners.length} intended page scroll owners: ${JSON.stringify(metrics.scrollOwners)}`,
  );

  if (route.focusSelector) {
    assert(
      metrics.focusMatches,
      `${label} did not focus ${route.focusSelector}: ${JSON.stringify(metrics.focus)}`,
    );
  }

  console.log(
    `PASS ${label} frame=${metrics.frame.width.toFixed(2)}px horizontal-overflow=${metrics.horizontalOverflow.toFixed(2)}px scroll-owner=${metrics.scrollOwners[0].tag}${route.focusSelector ? ' focus=detail-heading' : ''}`,
  );
}

async function inspectSkillRows(bidi, context) {
  return evaluateJson(
    bidi,
    context,
    `
      const rectangle = (element) => {
        const { left, right, top, bottom, width, height } = element.getBoundingClientRect();
        return { left, right, top, bottom, width, height };
      };
      const rows = [...document.querySelectorAll('[role="main"] li')].map((row) => {
        const directLinks = [...row.children].filter(
          (child) => child instanceof HTMLAnchorElement,
        );
        return {
          directLinkCount: directLinks.length,
          href: directLinks[0]?.getAttribute('href') ?? null,
          link: directLinks[0] ? rectangle(directLinks[0]) : null,
          row: rectangle(row),
        };
      });
      return rows;
    `,
  );
}

function assertSkillRowGeometry(rows, viewport) {
  const label = `${viewport.width}x${viewport.height} /skills`;
  assert(rows.length > 1, `${label} needs at least two skill rows.`);

  for (const [index, row] of rows.entries()) {
    assert(
      row.directLinkCount === 1 && row.link != null,
      `${label} row ${index} has ${row.directLinkCount} direct native links.`,
    );

    for (const edge of ['left', 'right', 'top', 'bottom']) {
      assert(
        isWithinTolerance(row.link[edge], row.row[edge]),
        `${label} row ${index} ${edge} differs: link=${row.link[edge]}, li=${row.row[edge]}.`,
      );
    }
  }

  const nonFinalRow = rows[0];
  assert(
    nonFinalRow.href != null && nonFinalRow.href.startsWith('/skills/'),
    `${label} non-final row has no local skill href.`,
  );
  assert(
    isWithinTolerance(nonFinalRow.link.bottom, nonFinalRow.row.bottom),
    `${label} non-final row bottom edge does not match.`,
  );

  return nonFinalRow;
}

async function tapSkillRowBottomEdge(bidi, context, row) {
  const x = Math.round(row.link.left + row.link.width / 2);
  // BiDi pointer coordinates are dispatched at integer CSS pixels in Firefox.
  // This is the closest representable point inside the row's bottom edge.
  const y = Math.ceil(row.link.bottom) - 1;
  const hitTest = await evaluateJson(
    bidi,
    context,
    `
      const target = document.elementFromPoint(${JSON.stringify(x)}, ${JSON.stringify(y)});
      return {
        anchorHref: target?.closest('a')?.getAttribute('href') ?? null,
        targetClass: target?.className ?? null,
        targetTag: target?.tagName.toLowerCase() ?? null,
      };
    `,
  );

  assert(
    hitTest.anchorHref === row.href,
    `Bottom-edge point (${x}, ${y}) hit ${JSON.stringify(hitTest)}, expected ${row.href}.`,
  );

  await bidi.command('input.performActions', {
    actions: [
      {
        actions: [
          { duration: 0, origin: 'viewport', type: 'pointerMove', x, y },
          { button: 0, type: 'pointerDown' },
          { button: 0, type: 'pointerUp' },
        ],
        id: 'skill-row-bottom-edge-pointer',
        parameters: { pointerType: 'mouse' },
        type: 'pointer',
      },
    ],
    context,
  });

  try {
    await waitForSelector(
      bidi,
      context,
      '[role="main"][aria-label="Skill detail"] h1',
    );
  } finally {
    await bidi.command('input.releaseActions', { context });
  }

  const navigation = await evaluateJson(
    bidi,
    context,
    `
      const heading = document.querySelector('[role="main"][aria-label="Skill detail"] h1');
      return {
        path: location.pathname,
        focusIsHeading: document.activeElement === heading,
      };
    `,
  );

  assert(
    navigation.path === row.href,
    `Bottom-edge pointer navigated to ${navigation.path}, expected ${row.href}.`,
  );
  assert(
    navigation.focusIsHeading,
    `Bottom-edge navigation to ${row.href} did not focus the detail heading.`,
  );
  return navigation;
}

async function verifyRoutes(bidi, context, baseUrl) {
  for (const viewport of viewports) {
    await bidi.command('browsingContext.setViewport', {
      context,
      devicePixelRatio: 1,
      viewport,
    });

    for (const route of routes) {
      await bidi.command('browsingContext.navigate', {
        context,
        url: `${baseUrl}${route.path}`,
        wait: 'complete',
      });
      await waitForSelector(bidi, context, route.readySelector);

      const metrics = await inspectRoute(bidi, context, route.focusSelector);
      assertRouteMetrics(route, viewport, metrics);

      if (route.path === '/skills') {
        const rows = await inspectSkillRows(bidi, context);
        const nonFinalRow = assertSkillRowGeometry(rows, viewport);
        const navigation = await tapSkillRowBottomEdge(
          bidi,
          context,
          nonFinalRow,
        );
        console.log(
          `PASS ${viewport.width}x${viewport.height} /skills rows=${rows.length} four-edge-geometry=yes bottom-edge-navigation=${navigation.path} focus=detail-heading`,
        );
      }
    }
  }
}

async function main() {
  let bidi;
  let bidiSessionStarted = false;
  let firefoxProcess;
  let previewProcess;
  let profileDirectory;
  let previewReservation;
  let bidiReservation;
  let cleanupPromise;

  const attemptCleanup = async (label, operation, errors) => {
    try {
      await operation();
      return true;
    } catch (error) {
      errors.push(error);
      console.error(
        `CLEANUP ${label} warning: ${error instanceof Error ? error.message : String(error)}`,
      );
      return false;
    }
  };

  const cleanup = () => {
    cleanupPromise ??= (async () => {
      const errors = [];

      if (bidiSessionStarted) {
        const sessionEnded = await attemptCleanup(
          'BiDi session end',
          () => bidi.command('session.end'),
          errors,
        );
        bidiSessionStarted = false;
        if (sessionEnded) {
          console.log('CLEANUP BiDi session ended.');
        }
      }

      if (bidi) {
        const socketClosed = await attemptCleanup(
          'BiDi socket close',
          () => bidi.close(),
          errors,
        );
        bidi = undefined;
        if (socketClosed) {
          console.log('CLEANUP BiDi socket closed.');
        }
      }

      await attemptCleanup(
        'Firefox process stop',
        () => stopOwnedProcess(firefoxProcess, 'Firefox'),
        errors,
      );
      firefoxProcess = undefined;
      await attemptCleanup(
        'production preview process stop',
        () => stopOwnedProcess(previewProcess, 'production preview'),
        errors,
      );
      previewProcess = undefined;
      await attemptCleanup(
        'BiDi port reservation release',
        () => releasePort(bidiReservation),
        errors,
      );
      await attemptCleanup(
        'preview port reservation release',
        () => releasePort(previewReservation),
        errors,
      );

      if (profileDirectory) {
        const ownedProfileDirectory = profileDirectory;
        const profileRemoved = await attemptCleanup(
          'temporary Firefox profile removal',
          () => rmSync(ownedProfileDirectory, { recursive: true, force: true }),
          errors,
        );
        if (profileRemoved) {
          console.log(
            `CLEANUP temporary Firefox profile removed (${ownedProfileDirectory}).`,
          );
        }
        profileDirectory = undefined;
      }

      if (errors.length > 0) {
        throw new AggregateError(
          errors,
          'One or more cleanup operations failed.',
        );
      }
    })();

    return cleanupPromise;
  };
  const handleSignal = (signal) => {
    console.error(`Received ${signal}; cleaning up owned resources.`);
    void cleanup().then(
      () => process.exit(signal === 'SIGINT' ? 130 : 143),
      () => process.exit(signal === 'SIGINT' ? 130 : 143),
    );
  };

  process.once('SIGINT', handleSignal);
  process.once('SIGTERM', handleSignal);

  try {
    previewReservation = await reservePort('MOBILE_LAYOUT_PREVIEW_PORT');
    bidiReservation = await reservePort('MOBILE_LAYOUT_BIDI_PORT');
    const previewPort = previewReservation.port;
    const bidiPort = bidiReservation.port;
    const baseUrl = `http://${HOST}:${previewPort}`;

    await releasePort(previewReservation);
    previewProcess = startOwnedProcess(
      'pnpm',
      [
        'exec',
        'vite',
        'preview',
        '--config',
        'vite.config.ts',
        '--host',
        HOST,
        '--port',
        String(previewPort),
        '--strictPort',
      ],
      { cwd: appDirectory },
    );
    await waitForHttpReady(baseUrl, previewProcess);
    console.log(
      `READY production preview ${baseUrl} (pid ${previewProcess.pid}).`,
    );

    profileDirectory = mkdtempSync(
      resolve(tmpdir(), 'github-io-mobile-layout-firefox-'),
    );
    await releasePort(bidiReservation);
    firefoxProcess = startOwnedProcess(
      process.env.FIREFOX_BINARY || 'firefox',
      [
        '--headless',
        '--no-remote',
        '--new-instance',
        '--profile',
        profileDirectory,
        '--remote-debugging-port',
        String(bidiPort),
      ],
      { env: { ...process.env, MOZ_HEADLESS: '1' } },
    );
    bidi = await BidiClient.connect(
      `ws://${HOST}:${bidiPort}/session`,
      firefoxProcess,
    );
    const session = await bidi.command('session.new', {
      capabilities: { alwaysMatch: { browserName: 'firefox' } },
    });
    bidiSessionStarted = true;
    console.log(
      `READY Firefox ${session.capabilities.browserVersion} WebDriver BiDi session ${session.sessionId}.`,
    );

    const tree = await bidi.command('browsingContext.getTree', { maxDepth: 0 });
    assert(
      tree.contexts.length > 0,
      'Firefox did not expose a browsing context.',
    );
    const context = tree.contexts[0].context;

    await verifyRoutes(bidi, context, baseUrl);
    console.log(
      `Verified ${routes.length} routes at ${viewports.length} viewports with production Firefox WebDriver BiDi.`,
    );
  } finally {
    process.off('SIGINT', handleSignal);
    process.off('SIGTERM', handleSignal);
    await cleanup();
  }
}

await main();
