import yargs from 'yargs';
import { searchCommand } from './search';

export const commands = yargs
  .wrap(yargs.terminalWidth())
  .scriptName('k')
  .demandCommand(1)
  .command(searchCommand)
  .help()
  .version();
