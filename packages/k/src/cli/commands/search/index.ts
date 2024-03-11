import { CommandModule } from 'yargs';
import { SearchPodArguments } from './search';

export const searchCommand: CommandModule<object, SearchPodArguments> = {
  command: 'search <name>',
  aliases: ['sp'],
  describe: 'Search the pod',
  builder: (yargs) => {
    return yargs
      .positional('name', {
        type: 'string',
        describe:
          'The name of the pod to search via approximate string matching',
      })
      .option('namespace', {
        alias: 'n',
        type: 'string',
        describe: 'The namespace of the pod to search',
      })
      .demandOption(['name', 'namespace']);
  },
  handler: async (args) => {
    await (await import('./search')).searchPod(args);
  },
};
