#!/usr/bin/env node
/**
 * control-github-io — verification harness for apps/github.io
 *
 * Launch a disposable production preview, drive it through Chrome CDP, capture
 * evidence, and tear down only processes this run started.
 *
 * Usage (from repo root):
 *   node .cursor/skills/verify-github-io/scripts/control-github-io.mjs <command> ...
 *
 * Environment:
 *   GITHUB_IO_VERIFY_RUN_ID   optional run id (default: timestamp)
 *   GITHUB_IO_VERIFY_RUN_DIR  optional run directory (default: /tmp/github-io-verify-$RUN_ID)
 *   GITHUB_IO_PREVIEW_PORT    optional fixed preview port (default: ephemeral)
 *   GITHUB_IO_CDP_PORT        optional fixed Chrome CDP port (default: ephemeral)
 *   CHROME_BINARY             optional Chrome binary (default: google-chrome)
 */

import { spawn } from 'node:child_process';
import {
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from 'node:fs';
import { createServer } from 'node:net';
import { tmpdir } from 'node:os';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const HOST = '127.0.0.1';
const READY_TIMEOUT_MS = 60_000;
const COMMAND_TIMEOUT_MS = 15_000;
const skillRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const repoRoot = resolve(skillRoot, '../../..');
const appDirectory = resolve(repoRoot, 'apps/github.io');
const distIndex = resolve(repoRoot, 'dist/apps/github.io/index.html');

function usage(exitCode = 1) {
  const text = `control-github-io commands:

  launch [--skip-build]     Build (unless skipped) and start vite preview + Chrome CDP
  doctor                    Read-only health check for the owned instance
  status                    Print run state JSON
  browser navigate --url <path-or-url>
  browser ready --selector <css>
  browser click --selector <css>
  browser click --role <role> --name <accessible-name>
  browser fill --selector <css> --value <text>
  browser press --key <Key>
  browser eval --expression <js-returning-json>
  browser snapshot --aria --path <file>
  browser screenshot --path <file>
  cleanup                   Stop owned processes; keep evidence

Evidence root: <run-dir>/evidence/
State file:    <run-dir>/state.json
`;
  process.stderr.write(text);
  process.exit(exitCode);
}

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

function nowRunId() {
  return (
    process.env.GITHUB_IO_VERIFY_RUN_ID?.trim() ||
    `run-${new Date().toISOString().replace(/[:.]/g, '-')}`
  );
}

function resolveRunDir(runId) {
  return (
    process.env.GITHUB_IO_VERIFY_RUN_DIR?.trim() ||
    resolve(tmpdir(), `github-io-verify-${runId}`)
  );
}

function statePath(runDir) {
  return resolve(runDir, 'state.json');
}

function evidenceRoot(runDir) {
  return resolve(runDir, 'evidence');
}

function readState(runDir) {
  const path = statePath(runDir);
  assert(existsSync(path), `No verification state at ${path}. Run launch first.`);
  return JSON.parse(readFileSync(path, 'utf8'));
}

function writeState(runDir, state) {
  mkdirSync(runDir, { recursive: true });
  mkdirSync(evidenceRoot(runDir), { recursive: true });
  writeFileSync(statePath(runDir), `${JSON.stringify(state, null, 2)}\n`);
}

function wait(ms) {
  return new Promise((resolvePromise) => setTimeout(resolvePromise, ms));
}

function processAlive(pid) {
  if (!Number.isInteger(pid) || pid <= 1) {
    return false;
  }
  try {
    process.kill(pid, 0);
    return true;
  } catch (error) {
    return error?.code !== 'ESRCH';
  }
}

async function reservePort(preferred = 0) {
  const server = createServer();
  await new Promise((resolvePromise, reject) => {
    server.once('error', reject);
    server.listen(preferred, HOST, () => {
      server.off('error', reject);
      resolvePromise();
    });
  });
  const address = server.address();
  assert(address && typeof address !== 'string', 'Unable to reserve port.');
  const port = address.port;
  await new Promise((resolvePromise, reject) => {
    server.close((error) => (error ? reject(error) : resolvePromise()));
  });
  return port;
}

function startOwnedProcess(command, args, options = {}) {
  const output = [];
  const child = spawn(command, args, {
    cwd: options.cwd,
    detached: process.platform !== 'win32',
    env: options.env ?? process.env,
    shell: false,
    stdio: ['ignore', 'pipe', 'pipe'],
    windowsHide: true,
  });
  const remember = (chunk) => {
    output.push(chunk.toString());
    if (output.join('').length > 48_000) {
      const joined = output.join('');
      output.splice(0, output.length, joined.slice(-48_000));
    }
  };
  child.stdout.on('data', remember);
  child.stderr.on('data', remember);
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

async function waitForProcessExit(child, timeoutMs) {
  if (child == null || child.exitCode != null || child.signalCode != null) {
    return true;
  }
  return new Promise((resolvePromise) => {
    const timer = setTimeout(() => {
      child.off('exit', onExit);
      resolvePromise(false);
    }, timeoutMs);
    const onExit = () => {
      clearTimeout(timer);
      resolvePromise(true);
    };
    child.once('exit', onExit);
  });
}

function signalTarget(target, signal) {
  try {
    process.kill(target, signal);
    return true;
  } catch (error) {
    if (error?.code === 'ESRCH') {
      return false;
    }
    throw error;
  }
}

async function stopOwnedProcess(meta, label) {
  if (!meta) {
    return;
  }
  const { pid, pgid } = meta;
  if (process.platform !== 'win32' && Number.isInteger(pgid) && pgid > 1) {
    if (processAlive(pgid)) {
      signalTarget(-pgid, 'SIGTERM');
      const deadline = Date.now() + 3_000;
      while (processAlive(pgid) && Date.now() < deadline) {
        await wait(50);
      }
      if (processAlive(pgid)) {
        signalTarget(-pgid, 'SIGKILL');
        const killDeadline = Date.now() + 3_000;
        while (processAlive(pgid) && Date.now() < killDeadline) {
          await wait(50);
        }
      }
    }
    assert(!processAlive(pgid), `${label} process group ${pgid} still alive.`);
    console.log(`CLEANUP ${label} process group stopped (pgid ${pgid}).`);
    return;
  }
  if (Number.isInteger(pid) && processAlive(pid)) {
    signalTarget(pid, 'SIGTERM');
    const deadline = Date.now() + 3_000;
    while (processAlive(pid) && Date.now() < deadline) {
      await wait(50);
    }
    if (processAlive(pid)) {
      signalTarget(pid, 'SIGKILL');
      const killDeadline = Date.now() + 3_000;
      while (processAlive(pid) && Date.now() < killDeadline) {
        await wait(50);
      }
    }
    assert(!processAlive(pid), `${label} pid ${pid} still alive.`);
  }
  console.log(`CLEANUP ${label} process stopped (pid ${pid ?? 'n/a'}).`);
}

async function waitForHttpReady(url, child) {
  const deadline = Date.now() + READY_TIMEOUT_MS;
  let lastError;
  while (Date.now() < deadline) {
    if (child.spawnError) {
      throw new Error(`Preview failed to start: ${child.spawnError.message}`);
    }
    if (child.exitCode != null || child.signalCode != null) {
      throw new Error(
        `Preview exited before ready.${child.getOutput() ? `\n${child.getOutput()}` : ''}`,
      );
    }
    try {
      const response = await fetch(url, {
        signal: AbortSignal.timeout(1_000),
      });
      const body = await response.text();
      if (response.ok && body.toLowerCase().includes('<!doctype html>')) {
        return;
      }
      lastError = new Error(`HTTP ${response.status}`);
    } catch (error) {
      lastError = error;
    }
    await wait(100);
  }
  throw new Error(
    `Preview not ready: ${lastError instanceof Error ? lastError.message : String(lastError)}`,
  );
}

class CdpClient {
  constructor(socket) {
    this.socket = socket;
    this.nextId = 1;
    this.pending = new Map();
    this.eventWaiters = new Map();

    socket.addEventListener('message', async (event) => {
      const data =
        typeof event.data === 'string'
          ? event.data
          : event.data instanceof Blob
            ? await event.data.text()
            : Buffer.from(event.data).toString('utf8');
      let message;
      try {
        message = JSON.parse(data);
      } catch (error) {
        this.rejectAll(error);
        return;
      }
      this.handleMessage(message);
    });
    socket.addEventListener('close', () =>
      this.rejectAll(new Error('Chrome CDP socket closed.')),
    );
    socket.addEventListener('error', () =>
      this.rejectAll(new Error('Chrome CDP socket error.')),
    );
  }

  static async connect(debuggerUrl) {
    assert(
      typeof globalThis.WebSocket === 'function',
      'Node WebSocket is required for Chrome CDP (Node 22+).',
    );
    const socket = new globalThis.WebSocket(debuggerUrl);
    await new Promise((resolvePromise, reject) => {
      const onOpen = () => {
        cleanup();
        resolvePromise();
      };
      const onError = () => {
        cleanup();
        reject(new Error(`Unable to open CDP websocket ${debuggerUrl}`));
      };
      const cleanup = () => {
        socket.removeEventListener('open', onOpen);
        socket.removeEventListener('error', onError);
      };
      socket.addEventListener('open', onOpen, { once: true });
      socket.addEventListener('error', onError, { once: true });
    });
    return new CdpClient(socket);
  }

  rejectAll(error) {
    for (const pending of this.pending.values()) {
      clearTimeout(pending.timer);
      pending.reject(error);
    }
    this.pending.clear();
    for (const waiters of this.eventWaiters.values()) {
      for (const waiter of waiters) {
        clearTimeout(waiter.timer);
        waiter.reject(error);
      }
    }
    this.eventWaiters.clear();
  }

  waitForEvent(method, timeoutMs = COMMAND_TIMEOUT_MS) {
    return new Promise((resolvePromise, reject) => {
      const timer = setTimeout(() => {
        const waiters = this.eventWaiters.get(method) ?? [];
        this.eventWaiters.set(
          method,
          waiters.filter((waiter) => waiter !== entry),
        );
        reject(new Error(`Timed out waiting for CDP event ${method}`));
      }, timeoutMs);
      const entry = { resolve: resolvePromise, reject, timer };
      const waiters = this.eventWaiters.get(method) ?? [];
      waiters.push(entry);
      this.eventWaiters.set(method, waiters);
    });
  }

  send(method, params = {}) {
    const id = this.nextId;
    this.nextId += 1;
    return new Promise((resolvePromise, reject) => {
      const timer = setTimeout(() => {
        this.pending.delete(id);
        reject(new Error(`${method} timed out after ${COMMAND_TIMEOUT_MS}ms.`));
      }, COMMAND_TIMEOUT_MS);
      this.pending.set(id, { resolve: resolvePromise, reject, timer, method });
      this.socket.send(JSON.stringify({ id, method, params }));
    });
  }

  handleMessage(message) {
    if (message.method) {
      const waiters = this.eventWaiters.get(message.method);
      if (waiters?.length) {
        const waiter = waiters.shift();
        clearTimeout(waiter.timer);
        waiter.resolve(message.params);
      }
      return;
    }
    if (message.id == null) {
      return;
    }
    const pending = this.pending.get(message.id);
    if (!pending) {
      return;
    }
    this.pending.delete(message.id);
    clearTimeout(pending.timer);
    if (message.error) {
      pending.reject(
        new Error(
          `${pending.method} failed: ${message.error.message ?? JSON.stringify(message.error)}`,
        ),
      );
      return;
    }
    pending.resolve(message.result);
  }

  async close() {
    try {
      this.socket.close();
    } catch {
      // ignore
    }
  }
}

async function getChromeWebSocketDebuggerUrl(cdpPort) {
  const deadline = Date.now() + READY_TIMEOUT_MS;
  let lastError;
  while (Date.now() < deadline) {
    try {
      const response = await fetch(`http://${HOST}:${cdpPort}/json/version`, {
        signal: AbortSignal.timeout(1_000),
      });
      if (response.ok) {
        const body = await response.json();
        if (body.webSocketDebuggerUrl) {
          return body.webSocketDebuggerUrl;
        }
      }
      lastError = new Error(`HTTP ${response.status}`);
    } catch (error) {
      lastError = error;
    }
    await wait(100);
  }
  throw new Error(
    `Chrome CDP not ready: ${lastError instanceof Error ? lastError.message : String(lastError)}`,
  );
}

async function openPageClient(state) {
  const listResponse = await fetch(
    `http://${HOST}:${state.cdpPort}/json/list`,
    { signal: AbortSignal.timeout(2_000) },
  );
  assert(listResponse.ok, 'Unable to list Chrome targets.');
  const targets = await listResponse.json();
  let page = targets.find(
    (target) =>
      target.type === 'page' &&
      typeof target.webSocketDebuggerUrl === 'string' &&
      !target.url?.startsWith('devtools://'),
  );
  if (!page) {
    const created = await fetch(`http://${HOST}:${state.cdpPort}/json/new?${encodeURIComponent('about:blank')}`, {
      method: 'PUT',
      signal: AbortSignal.timeout(2_000),
    });
    assert(created.ok, 'Unable to create a Chrome page target.');
    page = await created.json();
  }
  assert(page?.webSocketDebuggerUrl, 'Chrome page has no debugger URL.');
  const client = await CdpClient.connect(page.webSocketDebuggerUrl);
  await client.send('Page.enable');
  await client.send('Runtime.enable');
  await client.send('DOM.enable');
  return client;
}

async function ensureBuild(skipBuild) {
  if (skipBuild) {
    assert(
      existsSync(distIndex),
      `Missing ${distIndex}. Build first or omit --skip-build.`,
    );
    return;
  }
  console.log('BUILD pnpm nx build github.io');
  const child = startOwnedProcess(
    'pnpm',
    ['nx', 'build', 'github.io'],
    { cwd: repoRoot },
  );
  const ok = await waitForProcessExit(child, 10 * 60_000);
  assert(ok, 'Build timed out.');
  assert(
    child.exitCode === 0,
    `Build failed (exit ${child.exitCode}).\n${child.getOutput()}`,
  );
  assert(existsSync(distIndex), `Build did not produce ${distIndex}.`);
}

async function cmdLaunch(args) {
  const skipBuild = args.includes('--skip-build');
  const runId = nowRunId();
  const runDir = resolveRunDir(runId);
  if (existsSync(statePath(runDir))) {
    const existing = JSON.parse(readFileSync(statePath(runDir), 'utf8'));
    if (
      processAlive(existing.preview?.pgid ?? existing.preview?.pid) ||
      processAlive(existing.chrome?.pgid ?? existing.chrome?.pid)
    ) {
      throw new Error(
        `Run directory ${runDir} already owns live processes. Cleanup first or choose a new GITHUB_IO_VERIFY_RUN_ID.`,
      );
    }
  }

  mkdirSync(runDir, { recursive: true });
  mkdirSync(evidenceRoot(runDir), { recursive: true });
  // Also mirror a convenience pointer under the skill artifacts folder.
  mkdirSync(resolve(skillRoot, 'artifacts'), { recursive: true });
  writeFileSync(
    resolve(skillRoot, 'artifacts', 'latest-run-dir.txt'),
    `${runDir}\n`,
  );

  await ensureBuild(skipBuild);

  const previewPort =
    Number(process.env.GITHUB_IO_PREVIEW_PORT) || (await reservePort());
  const cdpPort =
    Number(process.env.GITHUB_IO_CDP_PORT) || (await reservePort());
  const chromeBinary =
    process.env.CHROME_BINARY?.trim() || 'google-chrome';
  const chromeProfile = mkdtempSync(
    resolve(tmpdir(), 'github-io-verify-chrome-'),
  );

  const preview = startOwnedProcess(
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
  const baseUrl = `http://${HOST}:${previewPort}`;
  await waitForHttpReady(baseUrl, preview);
  console.log(`READY preview ${baseUrl} (pid ${preview.pid})`);

  const chrome = startOwnedProcess(
    chromeBinary,
    [
      `--remote-debugging-port=${cdpPort}`,
      `--user-data-dir=${chromeProfile}`,
      '--headless=new',
      '--disable-gpu',
      '--no-first-run',
      '--no-default-browser-check',
      '--disable-background-networking',
      'about:blank',
    ],
    {
      env: {
        ...process.env,
        HOME: chromeProfile,
      },
    },
  );
  const debuggerUrl = await getChromeWebSocketDebuggerUrl(cdpPort);
  console.log(
    `READY Chrome CDP ws on port ${cdpPort} (pid ${chrome.pid}): ${debuggerUrl}`,
  );

  const state = {
    runId,
    runDir,
    evidenceDir: evidenceRoot(runDir),
    baseUrl,
    previewPort,
    cdpPort,
    chromeBinary,
    chromeProfile,
    createdAt: new Date().toISOString(),
    preview: {
      pid: preview.pid,
      pgid: preview.ownedProcessGroupId,
    },
    chrome: {
      pid: chrome.pid,
      pgid: chrome.ownedProcessGroupId,
    },
  };
  writeState(runDir, state);
  // Detach child stdio/handles so this CLI can exit while they keep running.
  for (const child of [preview, chrome]) {
    child.stdout?.removeAllListeners?.();
    child.stderr?.removeAllListeners?.();
    child.stdout?.destroy?.();
    child.stderr?.destroy?.();
    child.unref?.();
  }
  console.log(`STATE ${statePath(runDir)}`);
  console.log(`EVIDENCE ${state.evidenceDir}`);
  console.log(JSON.stringify({ ok: true, runId, baseUrl, evidenceDir: state.evidenceDir }, null, 2));
  // Owned servers keep the event loop alive through open pipes unless we exit.
  process.exit(0);
}

async function cmdDoctor() {
  const runId = nowRunId();
  const runDir = resolveRunDir(runId);
  const state = readState(runDir);
  const previewAlive = processAlive(state.preview?.pgid ?? state.preview?.pid);
  const chromeAlive = processAlive(state.chrome?.pgid ?? state.chrome?.pid);
  let httpOk = false;
  let title = null;
  let homeReady = false;
  let httpError = null;
  try {
    const response = await fetch(state.baseUrl, {
      signal: AbortSignal.timeout(2_000),
    });
    const body = await response.text();
    httpOk = response.ok && body.toLowerCase().includes('<!doctype html>');
  } catch (error) {
    httpError = error instanceof Error ? error.message : String(error);
  }

  if (previewAlive && chromeAlive && httpOk) {
    const client = await openPageClient(state);
    try {
      const loaded = client.waitForEvent('Page.loadEventFired', READY_TIMEOUT_MS);
      await client.send('Page.navigate', { url: state.baseUrl });
      await loaded.catch(() => undefined);
      await waitForSelector(client, 'main[aria-label="Home"]');
      const evaluation = await client.send('Runtime.evaluate', {
        expression: `(() => ({
          title: document.title,
          ready: Boolean(document.querySelector('main[aria-label="Home"]')),
          theme: document.documentElement.getAttribute('data-theme'),
          href: location.href,
        }))()`,
        returnByValue: true,
        awaitPromise: true,
      });
      title = evaluation.result?.value?.title ?? null;
      homeReady = Boolean(evaluation.result?.value?.ready);
    } finally {
      await client.close();
    }
  }

  const report = {
    ok: previewAlive && chromeAlive && httpOk && homeReady,
    runId: state.runId,
    baseUrl: state.baseUrl,
    evidenceDir: state.evidenceDir,
    previewAlive,
    chromeAlive,
    httpOk,
    homeReady,
    title,
    httpError,
  };
  console.log(JSON.stringify(report, null, 2));
  if (!report.ok) {
    process.exitCode = 2;
  }
}

async function withPage(fn) {
  const runId = nowRunId();
  const runDir = resolveRunDir(runId);
  const state = readState(runDir);
  assert(
    processAlive(state.preview?.pgid ?? state.preview?.pid),
    'Preview process is not alive. Relaunch.',
  );
  assert(
    processAlive(state.chrome?.pgid ?? state.chrome?.pid),
    'Chrome process is not alive. Relaunch.',
  );
  const client = await openPageClient(state);
  try {
    return await fn(client, state);
  } finally {
    await client.close();
  }
}

async function evaluate(client, expression) {
  const result = await client.send('Runtime.evaluate', {
    expression,
    returnByValue: true,
    awaitPromise: true,
  });
  if (result.exceptionDetails) {
    throw new Error(
      `Evaluation failed: ${result.exceptionDetails.text ?? JSON.stringify(result.exceptionDetails)}`,
    );
  }
  return result.result?.value;
}

function resolveAbsoluteEvidencePath(state, pathArg) {
  assert(pathArg, 'Missing --path');
  if (pathArg.startsWith('/')) {
    return pathArg;
  }
  const absolute = resolve(state.evidenceDir, pathArg);
  mkdirSync(dirname(absolute), { recursive: true });
  return absolute;
}

function parseFlag(args, name) {
  const index = args.indexOf(name);
  if (index === -1) {
    return undefined;
  }
  return args[index + 1];
}

async function waitForSelector(client, selector, timeoutMs = READY_TIMEOUT_MS) {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    const ready = await evaluate(
      client,
      `document.querySelector(${JSON.stringify(selector)}) !== null`,
    );
    if (ready) {
      return;
    }
    await wait(100);
  }
  throw new Error(`Timed out waiting for selector: ${selector}`);
}

function roleSelectorExpression(role, name) {
  return `(() => {
    const role = ${JSON.stringify(role)};
    const name = ${JSON.stringify(name)};
    const nodes = [...document.querySelectorAll('*')];
    const match = nodes.find((node) => {
      const computedRole = node.getAttribute('role')
        || (node.tagName === 'A' ? 'link'
          : node.tagName === 'BUTTON' ? 'button'
          : node.tagName === 'MAIN' ? 'main'
          : node.tagName === 'NAV' ? 'navigation'
          : node.tagName === 'H1' || node.tagName === 'H2' || node.tagName === 'H3' ? 'heading'
          : null);
      if (computedRole !== role) return false;
      const label = (node.getAttribute('aria-label')
        || node.innerText
        || node.textContent
        || '').replace(/\\s+/g, ' ').trim();
      return label === name || label.includes(name);
    });
    if (!match) return null;
    match.scrollIntoView({ block: 'center', inline: 'nearest' });
    match.click();
    return {
      tag: match.tagName.toLowerCase(),
      label: (match.getAttribute('aria-label') || match.textContent || '').trim().slice(0, 120),
    };
  })()`;
}

async function cmdBrowser(args) {
  const [action, ...rest] = args;
  if (!action) {
    usage();
  }

  await withPage(async (client, state) => {
    if (action === 'navigate') {
      const url = parseFlag(rest, '--url');
      assert(url, 'browser navigate requires --url');
      const target = url.startsWith('http')
        ? url
        : `${state.baseUrl}${url.startsWith('/') ? url : `/${url}`}`;
      const loaded = client.waitForEvent('Page.loadEventFired', READY_TIMEOUT_MS);
      await client.send('Page.navigate', { url: target });
      await loaded.catch(() => undefined);
      await wait(200);
      const href = await evaluate(client, 'location.href');
      console.log(JSON.stringify({ ok: true, href }, null, 2));
      return;
    }

    if (action === 'ready') {
      const selector = parseFlag(rest, '--selector');
      assert(selector, 'browser ready requires --selector');
      await waitForSelector(client, selector);
      console.log(JSON.stringify({ ok: true, selector }, null, 2));
      return;
    }

    if (action === 'click') {
      const selector = parseFlag(rest, '--selector');
      const role = parseFlag(rest, '--role');
      const name = parseFlag(rest, '--name');
      if (selector) {
        await waitForSelector(client, selector);
        const clicked = await evaluate(
          client,
          `(() => {
            const node = document.querySelector(${JSON.stringify(selector)});
            if (!node) return null;
            node.scrollIntoView({ block: 'center', inline: 'nearest' });
            node.click();
            return true;
          })()`,
        );
        assert(clicked, `No element for selector ${selector}`);
        console.log(JSON.stringify({ ok: true, selector }, null, 2));
        return;
      }
      assert(role && name, 'browser click requires --selector or --role/--name');
      const clicked = await evaluate(client, roleSelectorExpression(role, name));
      assert(clicked, `No ${role} named ${JSON.stringify(name)}`);
      console.log(JSON.stringify({ ok: true, role, name, clicked }, null, 2));
      return;
    }

    if (action === 'fill') {
      const selector = parseFlag(rest, '--selector');
      const value = parseFlag(rest, '--value');
      assert(selector && value != null, 'browser fill requires --selector and --value');
      await waitForSelector(client, selector);
      const filled = await evaluate(
        client,
        `(() => {
          const node = document.querySelector(${JSON.stringify(selector)});
          if (!node) return false;
          node.focus();
          const prototype = Object.getOwnPropertyDescriptor(
            node.tagName === 'TEXTAREA' ? HTMLTextAreaElement.prototype : HTMLInputElement.prototype,
            'value',
          );
          prototype?.set?.call(node, ${JSON.stringify(value)});
          node.dispatchEvent(new Event('input', { bubbles: true }));
          node.dispatchEvent(new Event('change', { bubbles: true }));
          return true;
        })()`,
      );
      assert(filled, `Unable to fill ${selector}`);
      console.log(JSON.stringify({ ok: true, selector, value }, null, 2));
      return;
    }

    if (action === 'press') {
      const key = parseFlag(rest, '--key');
      assert(key, 'browser press requires --key');
      await client.send('Input.dispatchKeyEvent', {
        type: 'keyDown',
        key,
        text: key.length === 1 ? key : undefined,
      });
      await client.send('Input.dispatchKeyEvent', {
        type: 'keyUp',
        key,
      });
      console.log(JSON.stringify({ ok: true, key }, null, 2));
      return;
    }

    if (action === 'eval') {
      const expression = parseFlag(rest, '--expression');
      assert(expression, 'browser eval requires --expression');
      const value = await evaluate(client, expression);
      console.log(JSON.stringify({ ok: true, value }, null, 2));
      return;
    }

    if (action === 'snapshot') {
      const path = parseFlag(rest, '--path');
      const absolute = resolveAbsoluteEvidencePath(state, path);
      const aria = rest.includes('--aria');
      const snapshot = await evaluate(
        client,
        aria
          ? `(() => {
              const walk = (node, depth = 0) => {
                if (!node || node.nodeType !== 1) return [];
                const role = node.getAttribute('role')
                  || (node.tagName === 'A' ? 'link'
                    : node.tagName === 'BUTTON' ? 'button'
                    : node.tagName === 'MAIN' ? 'main'
                    : node.tagName === 'NAV' ? 'navigation'
                    : node.tagName === 'H1' || node.tagName === 'H2' || node.tagName === 'H3' ? 'heading'
                    : node.tagName === 'INPUT' ? 'textbox'
                    : null);
                const name = (node.getAttribute('aria-label')
                  || (role === 'heading' || role === 'link' || role === 'button' || role === 'main'
                    ? (node.innerText || node.textContent || '')
                    : '')
                  || '').replace(/\\s+/g, ' ').trim().slice(0, 160);
                const lines = [];
                if (role) {
                  lines.push(\`\${'  '.repeat(depth)}\${role}\${name ? \`: \${name}\` : ''}\`);
                }
                for (const child of node.children) {
                  lines.push(...walk(child, role ? depth + 1 : depth));
                }
                return lines;
              };
              return [
                \`url: \${location.href}\`,
                \`title: \${document.title}\`,
                \`theme: \${document.documentElement.getAttribute('data-theme')}\`,
                ...walk(document.body),
              ].join('\\n');
            })()`
          : `document.body?.innerText ?? ''`,
      );
      writeFileSync(absolute, `${snapshot}\n`);
      // Convenience copy under skill artifacts when path is relative.
      if (!path.startsWith('/')) {
        const mirror = resolve(skillRoot, 'artifacts', path);
        mkdirSync(dirname(mirror), { recursive: true });
        writeFileSync(mirror, `${snapshot}\n`);
      }
      console.log(JSON.stringify({ ok: true, path: absolute }, null, 2));
      return;
    }

    if (action === 'screenshot') {
      const path = parseFlag(rest, '--path');
      const absolute = resolveAbsoluteEvidencePath(state, path);
      const shot = await client.send('Page.captureScreenshot', {
        format: 'png',
        fromSurface: true,
      });
      const buffer = Buffer.from(shot.data, 'base64');
      writeFileSync(absolute, buffer);
      if (!path.startsWith('/')) {
        const mirror = resolve(skillRoot, 'artifacts', path);
        mkdirSync(dirname(mirror), { recursive: true });
        writeFileSync(mirror, buffer);
      }
      console.log(JSON.stringify({ ok: true, path: absolute, bytes: buffer.length }, null, 2));
      return;
    }

    usage();
  });
}

async function cmdCleanup() {
  const runId = nowRunId();
  const runDir = resolveRunDir(runId);
  if (!existsSync(statePath(runDir))) {
    console.log(JSON.stringify({ ok: true, skipped: true, reason: 'no state' }, null, 2));
    return;
  }
  const state = readState(runDir);
  await stopOwnedProcess(state.chrome, 'Chrome');
  await stopOwnedProcess(state.preview, 'preview');
  if (state.chromeProfile && existsSync(state.chromeProfile)) {
    rmSync(state.chromeProfile, { recursive: true, force: true });
    console.log(`CLEANUP Chrome profile removed (${state.chromeProfile}).`);
  }
  // Keep evidence and a tombstone state for inspection.
  const tombstone = {
    ...state,
    cleanedAt: new Date().toISOString(),
    preview: null,
    chrome: null,
    chromeProfile: null,
  };
  writeState(runDir, tombstone);
  console.log(
    JSON.stringify(
      {
        ok: true,
        evidenceDir: state.evidenceDir,
        evidenceSurvived: existsSync(state.evidenceDir),
      },
      null,
      2,
    ),
  );
}

async function cmdStatus() {
  const runId = nowRunId();
  const runDir = resolveRunDir(runId);
  if (!existsSync(statePath(runDir))) {
    console.log(JSON.stringify({ ok: false, reason: 'no state', runDir }, null, 2));
    process.exitCode = 2;
    return;
  }
  const state = readState(runDir);
  console.log(
    JSON.stringify(
      {
        ...state,
        previewAlive: processAlive(state.preview?.pgid ?? state.preview?.pid),
        chromeAlive: processAlive(state.chrome?.pgid ?? state.chrome?.pid),
      },
      null,
      2,
    ),
  );
}

const [command, ...args] = process.argv.slice(2);
if (!command || command === '--help' || command === '-h') {
  usage(command ? 0 : 1);
}

try {
  if (command === 'launch') {
    await cmdLaunch(args);
  } else if (command === 'doctor') {
    await cmdDoctor();
  } else if (command === 'status') {
    await cmdStatus();
  } else if (command === 'browser') {
    await cmdBrowser(args);
  } else if (command === 'cleanup') {
    await cmdCleanup();
  } else {
    usage();
  }
} catch (error) {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
}
