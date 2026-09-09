#!/usr/bin/env node

import { readFileSync } from 'node:fs';

import { snapshot } from './inventory.mjs';
import { validateLedger } from './ledger.mjs';

const HELP = `Usage:
  commit-history inventory --source PATH
  commit-history check-ledger --inventory FILE --ledger FILE
`;

function options(args, names) {
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
  for (const name of names) {
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
  throw new Error(`unknown command ${command}`);
}

try {
  main(process.argv.slice(2));
} catch (error) {
  process.stderr.write(`commit-history: ${error.message}\n`);
  process.exitCode = 1;
}
