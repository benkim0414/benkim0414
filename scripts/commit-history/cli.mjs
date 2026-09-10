#!/usr/bin/env node

import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { snapshot } from './inventory.mjs';
import { validateLedger } from './ledger.mjs';
import { prepareRehearsal, rehearse } from './rehearsal.mjs';

const CLI = fileURLToPath(import.meta.url);

const HELP = `Usage:
  commit-history inventory --source PATH
  commit-history check-ledger --inventory FILE --ledger FILE
  commit-history prepare --source PATH --inventory FILE --ledger FILE --run-directory PATH --output FILE [--signature-allowlist FILE]
  commit-history rehearse --backup FILE --destination PATH --inventory FILE --ledger FILE --approval FILE --output FILE [--signature-allowlist FILE]
`;

function options(args, requiredNames, optionalNames = new Set()) {
  const names = new Set([...requiredNames, ...optionalNames]);
  const result = {};
  for (let index = 0; index < args.length; index += 2) {
    const flag = args[index];
    const value = args[index + 1];
    if (!names.has(flag) || value === undefined || value.startsWith('--')) {
      throw new Error(`invalid arguments: ${args.join(' ')}`);
    }
    if (Object.hasOwn(result, flag))
      throw new Error(`duplicate option ${flag}`);
    result[flag] = value;
  }
  for (const name of requiredNames) {
    if (!Object.hasOwn(result, name))
      throw new Error(`missing required option ${name}`);
  }
  return result;
}

function readJson(path, label) {
  try {
    return JSON.parse(readFileSync(path, 'utf8'));
  } catch (error) {
    throw new Error(`cannot read ${label} ${path}: ${error.message}`);
  }
}

function main(args) {
  const [command, ...rest] = args;
  if (command === '--help' || command === '-h' || command === undefined) {
    process.stdout.write(HELP);
    return;
  }
  if (command === 'inventory') {
    const parsed = options(rest, new Set(['--source']));
    process.stdout.write(
      `${JSON.stringify(snapshot(parsed['--source']), null, 2)}\n`,
    );
    return;
  }
  if (command === 'check-ledger') {
    const parsed = options(rest, new Set(['--inventory', '--ledger']));
    const inventory = readJson(parsed['--inventory'], 'inventory');
    const ledger = readJson(parsed['--ledger'], 'ledger');
    const validated = validateLedger(inventory, ledger, {
      requireResolved: true,
    });
    process.stdout.write(`ledger valid: ${validated.size} decisions\n`);
    return;
  }
  if (command === 'prepare') {
    const parsed = options(
      rest,
      new Set([
        '--source',
        '--inventory',
        '--ledger',
        '--run-directory',
        '--output',
      ]),
      new Set(['--signature-allowlist']),
    );
    const inventory = readJson(parsed['--inventory'], 'inventory');
    const ledger = readJson(parsed['--ledger'], 'ledger');
    const hasSignatureAllowlist = Object.hasOwn(
      parsed,
      '--signature-allowlist',
    );
    const signatureAllowlist = hasSignatureAllowlist
      ? readJson(parsed['--signature-allowlist'], 'signature allowlist')
      : [];
    const approval = prepareRehearsal({
      source: parsed['--source'],
      runDirectory: parsed['--run-directory'],
      inventory,
      ledger,
      signaturePolicy: hasSignatureAllowlist ? 'remove-approved' : 'reject',
      signatureAllowlist,
    });
    if (resolve(parsed['--output']) !== approval.approvalPath) {
      throw new Error(
        `prepare output must be the protected approval path ${approval.approvalPath}`,
      );
    }
    process.stdout.write(
      `prepared verified backup and approval package at ${approval.approvalPath}\n`,
    );
    return;
  }
  if (command === 'rehearse') {
    const parsed = options(
      rest,
      new Set([
        '--backup',
        '--destination',
        '--inventory',
        '--ledger',
        '--approval',
        '--output',
      ]),
      new Set(['--signature-allowlist']),
    );
    const inventory = readJson(parsed['--inventory'], 'inventory');
    const ledger = readJson(parsed['--ledger'], 'ledger');
    const approval = readJson(parsed['--approval'], 'approval');
    const signatureAllowlist = Object.hasOwn(parsed, '--signature-allowlist')
      ? readJson(parsed['--signature-allowlist'], 'signature allowlist')
      : [];
    if (resolve(parsed['--output']) !== approval.reportPath) {
      throw new Error(
        `rehearse output must be the approved report path ${approval.reportPath}`,
      );
    }
    const report = rehearse({
      backup: parsed['--backup'],
      destination: parsed['--destination'],
      inventory,
      ledger,
      signatureAllowlist,
      approval,
      invocation: {
        executable: process.execPath,
        argv: [CLI, command, ...rest],
      },
    });
    process.stdout.write(
      `rehearsal verified: ${report.mapping.length} decisions; report at ${approval.reportPath}\n`,
    );
    return;
  }
  throw new Error(`unknown command ${command}`);
}

try {
  main(process.argv.slice(2));
} catch (error) {
  process.stderr.write(`commit-history: ${error.message}\n`);
  process.exitCode = 1;
}
