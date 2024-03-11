import { V1Pod } from '@kubernetes/client-node';

export function createV1Pod(name: string): V1Pod {
  return {
    metadata: {
      name,
    },
  } as V1Pod;
}
