#!/usr/bin/env node
import { commands } from '../src/cli/commands';

function main(): void {
  commands.parse(process.argv.slice(2));
}

main();
