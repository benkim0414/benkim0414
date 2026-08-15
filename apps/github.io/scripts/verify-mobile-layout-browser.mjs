import { spawn } from 'node:child_process';
import { existsSync, mkdtempSync, rmSync } from 'node:fs';
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
const shellScrollOwnerSelector = '.astryx-layout-content:has(> main)';
const routes = [
  {
    path: '/',
    isInFrame: true,
    pageRootSelector: 'main[aria-label="Home"]',
    readySelector: 'main[aria-label="Home"]',
    scrollOwnerSelector: shellScrollOwnerSelector,
    scrollMotion: {
      doraSelector: '#dora-capabilities-title',
      topSkillsSelector: '#top-skills-title',
    },
  },
  {
    path: '/roadmap',
    isInFrame: true,
    pageRootSelector: 'main',
    readySelector: 'main h1',
    scrollOwnerSelector: shellScrollOwnerSelector,
  },
  {
    path: '/skills',
    isInFrame: true,
    pageRootSelector: 'main[aria-labelledby="skills-page-title"]',
    readySelector: 'main[aria-labelledby="skills-page-title"]',
    scrollOwnerSelector: shellScrollOwnerSelector,
  },
  {
    path: '/skills/kubernetes',
    isInFrame: true,
    pageRootSelector: 'main[aria-label="Skill detail"]',
    readySelector: 'main[aria-label="Skill detail"] h1',
    focusSelector: 'main[aria-label="Skill detail"] h1',
    scrollOwnerSelector: shellScrollOwnerSelector,
  },
  {
    path: '/skills/not-real',
    isInFrame: true,
    pageRootSelector:
      'main[data-testid="not-found-page"][data-layout="full-width"]',
    readySelector: '[data-testid="not-found-page"][data-layout="full-width"]',
    scrollOwnerSelector: shellScrollOwnerSelector,
  },
  {
    path: '/not-a-route',
    isInFrame: false,
    pageRootSelector:
      'main[data-testid="not-found-page"][data-layout="standalone"]',
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

function throwIfCancelled(signal) {
  signal?.throwIfAborted();
}

function wait(milliseconds, signal) {
  throwIfCancelled(signal);

  if (!signal) {
    return new Promise((resolvePromise) =>
      setTimeout(resolvePromise, milliseconds),
    );
  }

  return new Promise((resolvePromise, reject) => {
    const timer = setTimeout(() => {
      signal.removeEventListener('abort', onAbort);
      resolvePromise();
    }, milliseconds);
    const onAbort = () => {
      clearTimeout(timer);
      reject(signal.reason);
    };

    signal.addEventListener('abort', onAbort, { once: true });
  });
}

async function acquireOwnedResource(signal, acquire, remember) {
  throwIfCancelled(signal);
  const resource = await acquire();
  remember(resource);
  throwIfCancelled(signal);
  return resource;
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

async function verifyPortReleased(port, label) {
  if (!Number.isInteger(port)) {
    return;
  }

  const server = createServer();

  try {
    await new Promise((resolvePromise, reject) => {
      server.once('error', reject);
      server.listen(port, HOST, () => {
        server.off('error', reject);
        resolvePromise();
      });
    });
  } finally {
    if (server.listening) {
      await new Promise((resolvePromise, reject) => {
        server.close((error) => {
          if (error) {
            reject(error);
          } else {
            resolvePromise();
          }
        });
      });
    }
  }

  console.log(`CLEANUP ${label} port ${port} released (bind probe passed).`);
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
  child.ownedProcessGroupId =
    process.platform !== 'win32' && Number.isInteger(child.pid)
      ? child.pid
      : undefined;
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

function processGroupIsAlive(processGroupId, killProcess = process.kill) {
  assert(
    Number.isInteger(processGroupId) && processGroupId > 1,
    'Refusing to probe an invalid process group ID.',
  );

  try {
    killProcess(-processGroupId, 0);
    return true;
  } catch (error) {
    if (error?.code === 'ESRCH') {
      return false;
    }

    if (error?.code === 'EPERM') {
      return true;
    }

    throw error;
  }
}

async function waitForProcessGroupExit(
  processGroupId,
  timeoutMilliseconds,
  options = {},
) {
  const isProcessGroupAlive =
    options.isProcessGroupAlive ?? processGroupIsAlive;
  const waitFor = options.waitFor ?? wait;
  const deadline = Date.now() + timeoutMilliseconds;

  while (isProcessGroupAlive(processGroupId)) {
    if (Date.now() >= deadline) {
      return false;
    }

    await waitFor(Math.min(50, Math.max(1, deadline - Date.now())));
  }

  return true;
}

function signalProcess(target, signal, killProcess) {
  try {
    killProcess(target, signal);
    return true;
  } catch (error) {
    if (error?.code === 'ESRCH') {
      return false;
    }

    throw error;
  }
}

async function stopOwnedProcess(child, label, options = {}) {
  if (child == null) {
    return;
  }

  const pid = child.pid;
  const platform = options.platform ?? process.platform;
  const killProcess = options.killProcess ?? process.kill;
  const isProcessGroupAlive =
    options.isProcessGroupAlive ??
    ((processGroupId) => processGroupIsAlive(processGroupId, killProcess));
  const waitForOwnedProcessGroupExit =
    options.waitForProcessGroupExit ??
    ((processGroupId, timeoutMilliseconds) =>
      waitForProcessGroupExit(processGroupId, timeoutMilliseconds, {
        isProcessGroupAlive,
        waitFor: options.waitFor,
      }));
  const log = options.log ?? console.log;

  if (platform !== 'win32' && child.ownedProcessGroupId != null) {
    const processGroupId = child.ownedProcessGroupId;
    assert(
      Number.isInteger(processGroupId) && processGroupId > 1,
      `Refusing to stop invalid ${label} process group.`,
    );

    if (isProcessGroupAlive(processGroupId)) {
      signalProcess(-processGroupId, 'SIGTERM', killProcess);

      if (!(await waitForOwnedProcessGroupExit(processGroupId, 3_000))) {
        signalProcess(-processGroupId, 'SIGKILL', killProcess);
        assert(
          await waitForOwnedProcessGroupExit(processGroupId, 3_000),
          `${label} process group ${processGroupId} remained alive after SIGKILL.`,
        );
      }
    }

    assert(
      !isProcessGroupAlive(processGroupId),
      `${label} process group ${processGroupId} is still alive.`,
    );
    log(
      `CLEANUP ${label} process group stopped (pgid ${processGroupId}; verified absent).`,
    );
    return;
  }

  if (!processHasExited(child)) {
    assert(
      Number.isInteger(pid) && pid > 1,
      `Refusing to stop invalid ${label} PID.`,
    );
    const target = pid;

    signalProcess(target, 'SIGTERM', killProcess);

    if (!(await waitForProcessExit(child, 3_000))) {
      signalProcess(target, 'SIGKILL', killProcess);

      assert(
        await waitForProcessExit(child, 3_000),
        `${label} process did not exit after SIGKILL.`,
      );
    }
  }

  log(`CLEANUP ${label} process stopped (pid ${pid ?? 'not-started'}).`);
}

async function waitForHttpReady(url, child, signal) {
  const deadline = Date.now() + READY_TIMEOUT_MS;
  let lastError;

  while (Date.now() < deadline) {
    throwIfCancelled(signal);

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
      const timeoutSignal = AbortSignal.timeout(1_000);
      const response = await fetch(url, {
        signal: signal
          ? AbortSignal.any([signal, timeoutSignal])
          : timeoutSignal,
      });

      if (response.ok && (await response.text()).includes('<!doctype html>')) {
        return;
      }

      lastError = new Error(`Preview returned HTTP ${response.status}.`);
    } catch (error) {
      lastError = error;
    }

    await wait(50, signal);
  }

  throw new Error(
    `Production preview did not become ready: ${lastError instanceof Error ? lastError.message : String(lastError)}`,
  );
}

function openWebSocket(url, signal) {
  throwIfCancelled(signal);

  return new Promise((resolvePromise, reject) => {
    const socket = new WebSocket(url);
    let settled = false;
    const cleanupListeners = () => {
      socket.removeEventListener('open', onOpen);
      socket.removeEventListener('error', onError);
      signal?.removeEventListener('abort', onAbort);
    };
    const onOpen = () => {
      if (settled) return;
      settled = true;
      cleanupListeners();
      resolvePromise(socket);
    };
    const onError = () => {
      if (settled) return;
      settled = true;
      cleanupListeners();
      socket.close();
      reject(new Error(`Unable to connect to ${url}.`));
    };
    const onAbort = () => {
      if (settled) return;
      settled = true;
      cleanupListeners();
      socket.close();
      reject(signal.reason);
    };

    socket.addEventListener('open', onOpen, { once: true });
    socket.addEventListener('error', onError, { once: true });
    signal?.addEventListener('abort', onAbort, { once: true });
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

  static async connect(url, child, signal) {
    const deadline = Date.now() + READY_TIMEOUT_MS;
    let lastError;

    while (Date.now() < deadline) {
      throwIfCancelled(signal);

      if (child.spawnError) {
        throw new Error(`Firefox failed to start: ${child.spawnError.message}`);
      }

      if (processHasExited(child)) {
        throw new Error(
          `Firefox exited before BiDi readiness.${child.getOutput() ? `\n${child.getOutput()}` : ''}`,
        );
      }

      try {
        return new BidiClient(await openWebSocket(url, signal));
      } catch (error) {
        throwIfCancelled(signal);
        lastError = error;
      }

      await wait(50, signal);
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

async function waitForSelector(bidi, context, selector, signal) {
  const deadline = Date.now() + READY_TIMEOUT_MS;

  while (Date.now() < deadline) {
    throwIfCancelled(signal);
    const isReady = await evaluateJson(
      bidi,
      context,
      `return document.readyState === 'complete' && document.querySelector(${JSON.stringify(selector)}) !== null;`,
    );

    if (isReady) {
      return;
    }

    await wait(50, signal);
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

async function inspectRoute(bidi, context, route) {
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
        className: typeof element.className === 'string' ? element.className : null,
        role: element.getAttribute('role'),
        testId: element.getAttribute('data-testid'),
        isExpected: element === expectedScrollOwner,
      });
      const pageRootSelector = ${JSON.stringify(route.pageRootSelector)};
      const main = document.querySelector(pageRootSelector);
      const pageRootMatches = document.querySelectorAll(pageRootSelector).length;
      const expectedScrollOwnerSelector = ${JSON.stringify(route.scrollOwnerSelector ?? null)};
      const expectedScrollOwner = expectedScrollOwnerSelector
        ? document.querySelector(expectedScrollOwnerSelector)
        : null;
      const expectedScrollOwnerMatches = expectedScrollOwnerSelector
        ? document.querySelectorAll(expectedScrollOwnerSelector).length
        : 0;
      // Audit the entire document, including html/body, the global frame,
      // layout siblings, and descendants. Restricting this search to main
      // lets an unrelated descendant mask a missing page owner and misses a
      // second document or frame scroll container.
      const scrollOwners = [...document.querySelectorAll('*')].filter((element) => {
        const style = getComputedStyle(element);
        const rect = element.getBoundingClientRect();
        const hasScrollableOverflowStyle =
          style.overflowY === 'auto' || style.overflowY === 'scroll';
        const isScrollingDocumentRoot =
          element === document.scrollingElement &&
          element.scrollHeight > element.clientHeight + ${SUBPIXEL_TOLERANCE};
        return (
          (hasScrollableOverflowStyle || isScrollingDocumentRoot) &&
          style.display !== 'none' &&
          style.visibility !== 'hidden' &&
          rect.width > 0 &&
          rect.height > 0
        );
      });
      const activeElement = document.activeElement;
      const documentWidth = Math.max(
        document.documentElement.scrollWidth,
        document.body?.scrollWidth ?? 0,
      );

      return {
        viewport: { width: innerWidth, height: innerHeight },
        frame: rectangle(main?.closest('.astryx-layout')),
        main: rectangle(main),
        scrollOwner: rectangle(expectedScrollOwner),
        scrollOwnerClientWidth: expectedScrollOwner?.clientWidth ?? null,
        pageRootMatches,
        path: location.pathname,
        horizontalOverflow: Math.max(0, documentWidth - innerWidth),
        scrollOwners: scrollOwners.map(describe),
        expectedScrollOwnerMatches,
        layoutMode: document.querySelector('[data-testid="not-found-page"]')?.getAttribute('data-layout') ?? null,
        focus: activeElement ? describe(activeElement) : null,
        focusMatches: ${route.focusSelector ? `activeElement?.matches(${JSON.stringify(route.focusSelector)}) ?? false` : 'true'},
      };
    `,
  );
}

function assertRouteMetrics(route, viewport, metrics, navigationPath) {
  const label = `${viewport.width}x${viewport.height} ${route.path}`;

  assert(
    navigationPath === route.path,
    `${label} navigation result pathname was ${navigationPath}, expected ${route.path}.`,
  );
  assert(
    metrics.path === route.path,
    `${label} evaluated pathname was ${metrics.path}, expected ${route.path}.`,
  );
  assert(
    isWithinTolerance(metrics.viewport.width, viewport.width) &&
      isWithinTolerance(metrics.viewport.height, viewport.height),
    `${label} did not use the requested viewport: ${JSON.stringify(metrics.viewport)}`,
  );
  assert(
    metrics.horizontalOverflow <= SUBPIXEL_TOLERANCE,
    `${label} has ${metrics.horizontalOverflow}px document horizontal overflow.`,
  );
  assert(
    metrics.pageRootMatches === 1,
    `${label} page root selector ${route.pageRootSelector} matched ${metrics.pageRootMatches} elements.`,
  );

  if (!route.isInFrame) {
    assert(
      metrics.layoutMode === 'standalone',
      `${label} did not render the standalone wildcard.`,
    );
    console.log(
      `PASS ${label} pathname=${metrics.path} standalone=yes horizontal-overflow=${metrics.horizontalOverflow.toFixed(2)}px`,
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
  assert(metrics.main != null, `${label} has no active page main.`);
  assert(metrics.scrollOwner != null, `${label} has no shell scroll owner.`);
  assert(
    typeof metrics.scrollOwnerClientWidth === 'number',
    `${label} has no shell scroll viewport width.`,
  );
  assert(
    isWithinTolerance(metrics.main.left, metrics.scrollOwner.left) &&
      isWithinTolerance(
        metrics.main.right,
        metrics.scrollOwner.left + metrics.scrollOwnerClientWidth,
      ) &&
      isWithinTolerance(metrics.main.width, metrics.scrollOwnerClientWidth),
    `${label} active page main does not span the shell scroll viewport: ${JSON.stringify({ main: metrics.main, scrollOwner: metrics.scrollOwner, scrollOwnerClientWidth: metrics.scrollOwnerClientWidth })}`,
  );
  assert(
    metrics.expectedScrollOwnerMatches === 1,
    `${label} expected scroll owner selector ${route.scrollOwnerSelector} matched ${metrics.expectedScrollOwnerMatches} elements.`,
  );
  const expectedScrollOwners = metrics.scrollOwners.filter(
    (owner) => owner.isExpected,
  );
  assert(
    expectedScrollOwners.length === 1,
    `${label} expected scroll owner is not an active shell scroll container: ${JSON.stringify(metrics.scrollOwners)}`,
  );
  assert(
    metrics.scrollOwners.length === 1,
    `${label} expected scroll owner is not the sole shell scroll container; found ${metrics.scrollOwners.length}: ${JSON.stringify(metrics.scrollOwners)}`,
  );

  if (route.focusSelector) {
    assert(
      metrics.focusMatches,
      `${label} did not focus ${route.focusSelector}: ${JSON.stringify(metrics.focus)}`,
    );
  }

  console.log(
    `PASS ${label} pathname=${metrics.path} frame=${metrics.frame.width.toFixed(2)}px main=${metrics.main.width.toFixed(2)}px horizontal-overflow=${metrics.horizontalOverflow.toFixed(2)}px scroll-owner=${route.scrollOwnerSelector}${route.focusSelector ? ' focus=detail-heading' : ''}`,
  );
}

async function inspectHomeScrollMotion(bidi, context, route, signal) {
  const selectors = route.scrollMotion;
  const readState = () =>
    evaluateJson(
      bidi,
      context,
      `
        const owner = document.querySelector(${JSON.stringify(route.scrollOwnerSelector)});
        const topSkills = document.querySelector(${JSON.stringify(selectors.topSkillsSelector)});
        const dora = document.querySelector(${JSON.stringify(selectors.doraSelector)});
        const pinnedAncestors = [];
        for (let element = topSkills; element && element !== owner; element = element.parentElement) {
          const position = getComputedStyle(element).position;
          if (position === 'fixed' || position === 'sticky') {
            pinnedAncestors.push({
              tag: element.tagName.toLowerCase(),
              id: element.id || null,
              position,
            });
          }
        }
        return {
          clientHeight: owner?.clientHeight ?? null,
          doraTop: dora?.getBoundingClientRect().top ?? null,
          pinnedAncestors,
          scrollHeight: owner?.scrollHeight ?? null,
          scrollTop: owner?.scrollTop ?? null,
          topSkillsTop: topSkills?.getBoundingClientRect().top ?? null,
        };
      `,
    );

  const before = await readState();
  const targetScrollTop = Math.min(
    160,
    Math.max(0, (before.scrollHeight ?? 0) - (before.clientHeight ?? 0)),
  );
  await evaluateJson(
    bidi,
    context,
    `
      const owner = document.querySelector(${JSON.stringify(route.scrollOwnerSelector)});
      if (owner) owner.scrollTop = ${targetScrollTop};
      return owner?.scrollTop ?? null;
    `,
  );
  await wait(50, signal);
  const after = await readState();
  await evaluateJson(
    bidi,
    context,
    `
      const owner = document.querySelector(${JSON.stringify(route.scrollOwnerSelector)});
      if (owner) owner.scrollTop = 0;
      return owner?.scrollTop ?? null;
    `,
  );

  return { after, before, targetScrollTop };
}

function assertHomeScrollMotion(viewport, motion) {
  const label = `${viewport.width}x${viewport.height} /`;
  const { after, before, targetScrollTop } = motion;

  for (const [name, value] of Object.entries({
    afterDoraTop: after.doraTop,
    afterScrollTop: after.scrollTop,
    afterTopSkillsTop: after.topSkillsTop,
    beforeClientHeight: before.clientHeight,
    beforeDoraTop: before.doraTop,
    beforeScrollHeight: before.scrollHeight,
    beforeScrollTop: before.scrollTop,
    beforeTopSkillsTop: before.topSkillsTop,
  })) {
    assert(typeof value === 'number', `${label} has no numeric ${name}.`);
  }
  assert(
    before.scrollHeight > before.clientHeight + SUBPIXEL_TOLERANCE,
    `${label} Home shell content has no vertical overflow to exercise.`,
  );
  assert(
    targetScrollTop > SUBPIXEL_TOLERANCE &&
      after.scrollTop > before.scrollTop + SUBPIXEL_TOLERANCE,
    `${label} Home shell content did not advance its scrollTop: ${JSON.stringify(motion)}`,
  );
  assert(
    before.pinnedAncestors.length === 0,
    `${label} Top skills has sticky or fixed positioning: ${JSON.stringify(before.pinnedAncestors)}`,
  );

  const scrollDelta = after.scrollTop - before.scrollTop;
  const topSkillsDelta = before.topSkillsTop - after.topSkillsTop;
  const doraDelta = before.doraTop - after.doraTop;
  assert(
    isWithinTolerance(topSkillsDelta, scrollDelta),
    `${label} Top skills did not move with Home scroll: ${JSON.stringify({ scrollDelta, topSkillsDelta })}`,
  );
  assert(
    isWithinTolerance(doraDelta, scrollDelta) &&
      isWithinTolerance(doraDelta, topSkillsDelta),
    `${label} DORA and Top skills did not move together: ${JSON.stringify({ doraDelta, scrollDelta, topSkillsDelta })}`,
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
      const rows = [...document.querySelectorAll('main li')].map((row) => {
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

async function tapSkillRowBottomEdge(bidi, context, row, signal) {
  throwIfCancelled(signal);
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
      'main[aria-label="Skill detail"] h1',
      signal,
    );
  } finally {
    await bidi.command('input.releaseActions', { context });
  }

  const navigation = await evaluateJson(
    bidi,
    context,
    `
      const heading = document.querySelector('main[aria-label="Skill detail"] h1');
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

function assertTopNavScrollReset(viewport, destinationPath, transition) {
  const label = `${viewport.width}x${viewport.height} top-nav transition to ${destinationPath}`;

  assert(
    transition.path === destinationPath,
    `${label} reached ${transition.path}, expected ${destinationPath}.`,
  );
  assert(
    typeof transition.scrollTop === 'number',
    `${label} did not expose the shell scroll position.`,
  );
  assert(
    transition.sentinelSurvived === true,
    `${label} did not preserve the in-document sentinel.`,
  );
  assert(
    isWithinTolerance(transition.scrollTop, 0),
    `${label} did not reset shell scroll: ${transition.scrollTop}.`,
  );
}

async function verifyTopNavScrollReset(
  bidi,
  context,
  viewport,
  destinationPath,
  destinationReadySelector,
  signal,
) {
  const sentinelKey = '__githubIoTopNavScrollResetSentinel__';
  const sentinel = `${Date.now()}-${Math.random()}`;
  const setup = await evaluateJson(
    bidi,
    context,
    `
      const owner = document.querySelector(${JSON.stringify(shellScrollOwnerSelector)});
      const link = [...document.querySelectorAll('nav a')].find(
        (candidate) => candidate.getAttribute('href') === ${JSON.stringify(destinationPath)},
      );
      const maxScrollTop = Math.max(0, (owner?.scrollHeight ?? 0) - (owner?.clientHeight ?? 0));
      const targetScrollTop = Math.min(160, maxScrollTop);
      if (owner) owner.scrollTop = targetScrollTop;
      globalThis[${JSON.stringify(sentinelKey)}] = ${JSON.stringify(sentinel)};
      const rectangle = link?.getBoundingClientRect();
      return {
        link: rectangle
          ? { left: rectangle.left, top: rectangle.top, width: rectangle.width, height: rectangle.height }
          : null,
        scrollTop: owner?.scrollTop ?? null,
      };
    `,
  );

  assert(
    typeof setup.scrollTop === 'number' && setup.scrollTop > SUBPIXEL_TOLERANCE,
    `${viewport.width}x${viewport.height} top-nav transition could not set a nonzero shell scroll position: ${JSON.stringify(setup)}.`,
  );
  assert(
    setup.link != null && setup.link.width > 0 && setup.link.height > 0,
    `${viewport.width}x${viewport.height} has no visible top-nav link for ${destinationPath}.`,
  );

  const x = Math.round(setup.link.left + setup.link.width / 2);
  const y = Math.round(setup.link.top + setup.link.height / 2);
  await bidi.command('input.performActions', {
    actions: [
      {
        actions: [
          { duration: 0, origin: 'viewport', type: 'pointerMove', x, y },
          { button: 0, type: 'pointerDown' },
          { button: 0, type: 'pointerUp' },
        ],
        id: 'top-nav-scroll-reset-pointer',
        parameters: { pointerType: 'mouse' },
        type: 'pointer',
      },
    ],
    context,
  });

  try {
    await waitForSelector(bidi, context, destinationReadySelector, signal);
  } finally {
    await bidi.command('input.releaseActions', { context });
  }

  const transition = await evaluateJson(
    bidi,
    context,
    `
      const owner = document.querySelector(${JSON.stringify(shellScrollOwnerSelector)});
      const sentinelSurvived = globalThis[${JSON.stringify(sentinelKey)}] === ${JSON.stringify(sentinel)};
      delete globalThis[${JSON.stringify(sentinelKey)}];
      return {
        path: location.pathname,
        scrollTop: owner?.scrollTop ?? null,
        sentinelSurvived,
      };
    `,
  );

  assertTopNavScrollReset(viewport, destinationPath, transition);
  console.log(
    `PASS ${viewport.width}x${viewport.height} top-nav transition pathname=${transition.path} shell-scroll=${transition.scrollTop.toFixed(2)}px`,
  );
}

async function verifyRoutes(bidi, context, baseUrl, signal) {
  for (const viewport of viewports) {
    throwIfCancelled(signal);
    await bidi.command('browsingContext.setViewport', {
      context,
      devicePixelRatio: 1,
      viewport,
    });

    for (const route of routes) {
      throwIfCancelled(signal);
      const navigationResult = await bidi.command('browsingContext.navigate', {
        context,
        url: `${baseUrl}${route.path}`,
        wait: 'complete',
      });
      throwIfCancelled(signal);
      await waitForSelector(bidi, context, route.readySelector, signal);

      const navigationPath = new URL(navigationResult.url).pathname;
      const metrics = await inspectRoute(bidi, context, route);
      throwIfCancelled(signal);

      if (route.scrollMotion) {
        const motion = await inspectHomeScrollMotion(
          bidi,
          context,
          route,
          signal,
        );
        assertHomeScrollMotion(viewport, motion);
      }

      assertRouteMetrics(route, viewport, metrics, navigationPath);

      if (route.path === '/') {
        await verifyTopNavScrollReset(
          bidi,
          context,
          viewport,
          '/roadmap',
          'main h1',
          signal,
        );
      }

      if (route.path === '/skills') {
        const rows = await inspectSkillRows(bidi, context);
        const nonFinalRow = assertSkillRowGeometry(rows, viewport);
        const navigation = await tapSkillRowBottomEdge(
          bidi,
          context,
          nonFinalRow,
          signal,
        );
        console.log(
          `PASS ${viewport.width}x${viewport.height} /skills rows=${rows.length} four-edge-geometry=yes bottom-edge-navigation=${navigation.path} focus=detail-heading`,
        );
      }
    }
  }
}

function selfTestRoute(overrides = {}) {
  return {
    path: '/skills',
    isInFrame: true,
    pageRootSelector: 'main[aria-labelledby="skills-page-title"]',
    readySelector: 'main[aria-labelledby="skills-page-title"]',
    scrollOwnerSelector: shellScrollOwnerSelector,
    ...overrides,
  };
}

function selfTestMetrics(overrides = {}) {
  return {
    viewport: { width: 375, height: 667 },
    frame: { left: 0, right: 375, width: 375 },
    main: { left: 0, right: 375, width: 375 },
    scrollOwner: { left: 0, right: 375, width: 375 },
    scrollOwnerClientWidth: 375,
    pageRootMatches: 1,
    horizontalOverflow: 0,
    layoutMode: null,
    expectedScrollOwnerMatches: 1,
    focusMatches: true,
    focus: null,
    path: '/skills',
    scrollOwners: [
      {
        className: 'astryx-layout-content',
        isExpected: true,
        role: null,
        tag: 'div',
        testId: null,
      },
    ],
    ...overrides,
  };
}

async function runSelfTests() {
  const failures = [];
  const test = async (name, operation) => {
    try {
      await operation();
      console.log(`PASS self-test: ${name}`);
    } catch (error) {
      failures.push(
        `${name}: ${error instanceof Error ? error.message : String(error)}`,
      );
      console.error(`FAIL self-test: ${failures.at(-1)}`);
    }
  };
  const expectFailure = async (name, operation, messagePattern) => {
    await test(name, async () => {
      let actualError;

      try {
        await operation();
      } catch (error) {
        actualError = error;
      }

      assert(actualError instanceof Error, `${name} was not rejected.`);
      assert(
        messagePattern.test(actualError.message),
        `${name} produced an unexpected error: ${actualError.message}`,
      );
    });
  };

  await test('framed routes assign scrolling to the shared layout content', () => {
    const framedRoutes = routes.filter((route) => route.isInFrame);

    assert(
      framedRoutes.length > 0,
      'The route matrix has no framed routes to audit.',
    );
    assert(
      shellScrollOwnerSelector === '.astryx-layout-content:has(> main)',
      `The shell scroll owner must exclude nested layout content: ${shellScrollOwnerSelector}.`,
    );
    assert(
      framedRoutes.every(
        (route) => route.scrollOwnerSelector === shellScrollOwnerSelector,
      ),
      `Framed routes must use the shell scroll owner: ${JSON.stringify(framedRoutes.map(({ path, scrollOwnerSelector }) => ({ path, scrollOwnerSelector })))}.`,
    );
    assert(
      framedRoutes.every((route) => route.pageRootSelector.startsWith('main')),
      `Framed routes must select their semantic main landmark: ${JSON.stringify(framedRoutes.map(({ path, pageRootSelector }) => ({ path, pageRootSelector })))}.`,
    );
    assert(
      framedRoutes.some((route) => route.path === '/roadmap'),
      'The route matrix must include the Roadmap route.',
    );
  });

  await expectFailure(
    'sticky Top skills cannot pass the shared Home scroll check',
    () =>
      assertHomeScrollMotion(
        { width: 375, height: 667 },
        {
          before: {
            clientHeight: 667,
            doraTop: 420,
            pinnedAncestors: [{ id: null, position: 'sticky', tag: 'div' }],
            scrollHeight: 1600,
            scrollTop: 0,
            topSkillsTop: 64,
          },
          after: {
            clientHeight: 667,
            doraTop: 260,
            pinnedAncestors: [{ id: null, position: 'sticky', tag: 'div' }],
            scrollHeight: 1600,
            scrollTop: 160,
            topSkillsTop: 64,
          },
          targetScrollTop: 160,
        },
      ),
    /sticky or fixed positioning/i,
  );
  await expectFailure(
    'Top skills must move by the Home scroll delta',
    () =>
      assertHomeScrollMotion(
        { width: 375, height: 667 },
        {
          before: {
            clientHeight: 667,
            doraTop: 420,
            pinnedAncestors: [],
            scrollHeight: 1600,
            scrollTop: 0,
            topSkillsTop: 64,
          },
          after: {
            clientHeight: 667,
            doraTop: 260,
            pinnedAncestors: [],
            scrollHeight: 1600,
            scrollTop: 160,
            topSkillsTop: 64,
          },
          targetScrollTop: 160,
        },
      ),
    /Top skills did not move with Home scroll/i,
  );
  await expectFailure(
    'an unrelated descendant cannot stand in for the intended scroll owner',
    () =>
      assertRouteMetrics(
        selfTestRoute(),
        { width: 375, height: 667 },
        selfTestMetrics({
          scrollOwners: [
            {
              className: 'nested-overflow',
              isExpected: false,
              role: null,
              tag: 'div',
              testId: 'unrelated-scroll-owner',
            },
          ],
        }),
        '/skills',
      ),
    /expected scroll owner/i,
  );
  await expectFailure(
    'an extra root scroll owner is rejected',
    () =>
      assertRouteMetrics(
        selfTestRoute(),
        { width: 375, height: 667 },
        selfTestMetrics({
          scrollOwners: [
            selfTestMetrics().scrollOwners[0],
            {
              className: '',
              isExpected: false,
              role: null,
              tag: 'html',
              testId: null,
            },
          ],
        }),
        '/skills',
      ),
    /sole shell scroll container/i,
  );
  await expectFailure(
    'a full-width frame cannot mask a constrained active page main',
    () =>
      assertRouteMetrics(
        selfTestRoute(),
        { width: 375, height: 667 },
        selfTestMetrics({
          main: { left: 48, right: 327, width: 279 },
        }),
        '/skills',
      ),
    /active page main does not span the shell scroll viewport/i,
  );
  await test('a page main spans the shell scroll viewport', () =>
    assertRouteMetrics(
      selfTestRoute(),
      { width: 375, height: 667 },
      selfTestMetrics({
        main: { left: 0, right: 363, width: 363 },
        scrollOwner: { left: 0, right: 375, width: 375 },
        scrollOwnerClientWidth: 363,
      }),
      '/skills',
    ));
  await expectFailure(
    'a navigation-result pathname mismatch is rejected before PASS',
    () =>
      assertRouteMetrics(
        selfTestRoute(),
        { width: 375, height: 667 },
        selfTestMetrics(),
        '/redirected',
      ),
    /navigation result pathname/i,
  );
  await expectFailure(
    'an evaluated pathname mismatch is rejected before PASS',
    () =>
      assertRouteMetrics(
        selfTestRoute(),
        { width: 375, height: 667 },
        selfTestMetrics({ path: '/redirected' }),
        '/skills',
      ),
    /evaluated pathname/i,
  );
  await expectFailure(
    'a top-nav transition retaining shell scroll is rejected',
    () =>
      assertTopNavScrollReset({ width: 375, height: 667 }, '/roadmap', {
        path: '/roadmap',
        scrollTop: 160,
        sentinelSurvived: true,
      }),
    /did not reset shell scroll/i,
  );
  await expectFailure(
    'a top-nav document reload is rejected',
    () =>
      assertTopNavScrollReset({ width: 375, height: 667 }, '/roadmap', {
        path: '/roadmap',
        scrollTop: 0,
        sentinelSurvived: false,
      }),
    /in-document sentinel/i,
  );

  await test('a resource acquired during cancellation is registered before unwind', async () => {
    const controller = new AbortController();
    const resource = { id: 'late-resource' };
    let finishAcquisition;
    let ownedResource;
    const pending = acquireOwnedResource(
      controller.signal,
      () =>
        new Promise((resolvePromise) => {
          finishAcquisition = resolvePromise;
        }),
      (value) => {
        ownedResource = value;
      },
    );

    controller.abort(new Error('self-test cancellation'));
    finishAcquisition(resource);
    let actualError;
    try {
      await pending;
    } catch (error) {
      actualError = error;
    }

    assert(ownedResource === resource, 'Late resource was not registered.');
    assert(
      actualError === controller.signal.reason,
      'Acquisition did not unwind with the cancellation reason.',
    );
  });
  await test('cancellation prevents a later acquisition', async () => {
    const controller = new AbortController();
    let acquisitionStarted = false;
    controller.abort(new Error('self-test cancellation'));

    let actualError;
    try {
      await acquireOwnedResource(
        controller.signal,
        async () => {
          acquisitionStarted = true;
          return {};
        },
        () => {},
      );
    } catch (error) {
      actualError = error;
    }

    assert(!acquisitionStarted, 'A resource was acquired after cancellation.');
    assert(
      actualError === controller.signal.reason,
      'Cancelled acquisition did not use the cancellation reason.',
    );
  });
  await test('process-group liveness treats ESRCH as stopped', () => {
    const alive = processGroupIsAlive(41_001, () => {
      const error = new Error('missing group');
      error.code = 'ESRCH';
      throw error;
    });
    assert(!alive, 'An absent process group was reported alive.');
  });
  await test('process-group liveness treats EPERM as alive', () => {
    const alive = processGroupIsAlive(41_002, () => {
      const error = new Error('permission denied');
      error.code = 'EPERM';
      throw error;
    });
    assert(
      alive,
      'An existing inaccessible process group was reported stopped.',
    );
  });
  await test('an owned process group is stopped after its leader exits', async () => {
    const signals = [];
    let alive = true;
    const child = {
      exitCode: 0,
      ownedProcessGroupId: 41_003,
      pid: 41_003,
      signalCode: null,
    };

    await stopOwnedProcess(child, 'self-test', {
      isProcessGroupAlive: () => alive,
      killProcess: (target, signal) => {
        signals.push({ signal, target });
        alive = false;
      },
      log: () => {},
    });

    assert(
      signals.some(
        ({ signal, target }) => signal === 'SIGTERM' && target === -41_003,
      ),
      'The living process group did not receive SIGTERM.',
    );
    assert(!alive, 'The owned process group remained alive.');
  });
  await test('a process group receives SIGKILL after SIGTERM times out', async () => {
    const signals = [];
    let alive = true;
    let exitChecks = 0;
    const child = {
      exitCode: null,
      ownedProcessGroupId: 41_004,
      pid: 41_004,
      signalCode: null,
    };

    await stopOwnedProcess(child, 'self-test', {
      isProcessGroupAlive: () => alive,
      killProcess: (target, signal) => {
        signals.push({ signal, target });
      },
      log: () => {},
      waitFor: async () => {
        throw new Error('Used real polling instead of the liveness test seam.');
      },
      waitForProcessGroupExit: async () => {
        exitChecks += 1;
        if (exitChecks === 1) return false;
        alive = false;
        return true;
      },
    });

    assert(
      JSON.stringify(signals) ===
        JSON.stringify([
          { signal: 'SIGTERM', target: -41_004 },
          { signal: 'SIGKILL', target: -41_004 },
        ]),
      `Unexpected process-group escalation: ${JSON.stringify(signals)}.`,
    );
    assert(!alive, 'The process group remained alive after SIGKILL.');
  });

  if (failures.length > 0) {
    throw new Error(
      `Mobile layout browser verifier self-tests failed:\n- ${failures.join('\n- ')}`,
    );
  }
}

async function main() {
  const cancellationController = new AbortController();
  const cancellationSignal = cancellationController.signal;
  let bidi;
  let bidiSessionStarted = false;
  let bidiPort;
  let firefoxProcess;
  let previewProcess;
  let previewPort;
  let profileDirectory;
  let previewReservation;
  let bidiReservation;
  let cleanupPromise;
  let receivedSignal;

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
      await attemptCleanup(
        'BiDi port release verification',
        () => verifyPortReleased(bidiPort, 'Firefox BiDi'),
        errors,
      );
      await attemptCleanup(
        'preview port release verification',
        () => verifyPortReleased(previewPort, 'production preview'),
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
          assert(
            !existsSync(ownedProfileDirectory),
            `Temporary Firefox profile still exists: ${ownedProfileDirectory}`,
          );
          console.log(
            `CLEANUP temporary Firefox profile removed (${ownedProfileDirectory}; verified absent).`,
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
    if (cancellationSignal.aborted) {
      return;
    }

    receivedSignal = signal;
    const cancellationError = new Error(
      `Received ${signal}; cancelling verification before cleanup.`,
    );
    cancellationError.name = 'AbortError';
    console.error(cancellationError.message);
    cancellationController.abort(cancellationError);
  };

  process.on('SIGINT', handleSignal);
  process.on('SIGTERM', handleSignal);

  let operationError;

  try {
    await acquireOwnedResource(
      cancellationSignal,
      () => reservePort('MOBILE_LAYOUT_PREVIEW_PORT'),
      (reservation) => {
        previewReservation = reservation;
        previewPort = reservation.port;
      },
    );
    await acquireOwnedResource(
      cancellationSignal,
      () => reservePort('MOBILE_LAYOUT_BIDI_PORT'),
      (reservation) => {
        bidiReservation = reservation;
        bidiPort = reservation.port;
      },
    );
    const baseUrl = `http://${HOST}:${previewPort}`;

    await releasePort(previewReservation);
    await acquireOwnedResource(
      cancellationSignal,
      async () =>
        startOwnedProcess(
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
        ),
      (child) => {
        previewProcess = child;
      },
    );
    await waitForHttpReady(baseUrl, previewProcess, cancellationSignal);
    console.log(
      `READY production preview ${baseUrl} (pid ${previewProcess.pid}).`,
    );

    await acquireOwnedResource(
      cancellationSignal,
      async () =>
        mkdtempSync(resolve(tmpdir(), 'github-io-mobile-layout-firefox-')),
      (directory) => {
        profileDirectory = directory;
      },
    );
    await releasePort(bidiReservation);
    await acquireOwnedResource(
      cancellationSignal,
      async () =>
        startOwnedProcess(
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
        ),
      (child) => {
        firefoxProcess = child;
      },
    );
    await acquireOwnedResource(
      cancellationSignal,
      () =>
        BidiClient.connect(
          `ws://${HOST}:${bidiPort}/session`,
          firefoxProcess,
          cancellationSignal,
        ),
      (client) => {
        bidi = client;
      },
    );
    const session = await acquireOwnedResource(
      cancellationSignal,
      () =>
        bidi.command('session.new', {
          capabilities: { alwaysMatch: { browserName: 'firefox' } },
        }),
      () => {
        bidiSessionStarted = true;
      },
    );
    console.log(
      `READY Firefox ${session.capabilities.browserVersion} WebDriver BiDi session ${session.sessionId}.`,
    );

    throwIfCancelled(cancellationSignal);
    const tree = await bidi.command('browsingContext.getTree', { maxDepth: 0 });
    throwIfCancelled(cancellationSignal);
    assert(
      tree.contexts.length > 0,
      'Firefox did not expose a browsing context.',
    );
    const context = tree.contexts[0].context;

    await verifyRoutes(bidi, context, baseUrl, cancellationSignal);
    console.log(
      `Verified ${routes.length} routes at ${viewports.length} viewports with production Firefox WebDriver BiDi.`,
    );
  } catch (error) {
    operationError = error;
  } finally {
    try {
      await cleanup();
    } finally {
      process.off('SIGINT', handleSignal);
      process.off('SIGTERM', handleSignal);
    }
  }

  if (cancellationSignal.aborted) {
    if (operationError && operationError !== cancellationSignal.reason) {
      throw operationError;
    }

    console.error(`Verification cancelled by ${receivedSignal} after cleanup.`);
    return receivedSignal === 'SIGINT' ? 130 : 143;
  }

  if (operationError) {
    throw operationError;
  }

  return 0;
}

export {
  acquireOwnedResource,
  assertRouteMetrics,
  processGroupIsAlive,
  runSelfTests,
  stopOwnedProcess,
  waitForProcessGroupExit,
};

if (
  process.argv[1] &&
  resolve(process.argv[1]) === fileURLToPath(import.meta.url)
) {
  if (process.argv.includes('--self-test')) {
    await runSelfTests();
  } else {
    process.exitCode = await main();
  }
}
