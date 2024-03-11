import { CoreV1Api, V1Pod } from '@kubernetes/client-node';
import Fuse, { IFuseOptions } from 'fuse.js';

export interface SearchPodOptions extends IFuseOptions<V1Pod> {
  fieldSelector?: string;
  labelSelector?: string;
}

const defaultSearchPodOptions: SearchPodOptions = {
  minMatchCharLength: 2,
  threshold: 0.2,
  distance: 100,
  ignoreLocation: true,
  keys: ['metadata.name'],
};

export class AggregatedCoreV1Api extends CoreV1Api {
  constructor(basePath?: string) {
    super();
    if (basePath) {
      this.basePath = basePath;
    }
  }

  async searchNamespacedPod(
    name: string,
    namespace: string,
    options?: SearchPodOptions
  ): Promise<V1Pod[]> {
    const response = await this.listNamespacedPod(
      namespace,
      undefined,
      undefined,
      undefined,
      options?.fieldSelector,
      options?.labelSelector
    );
    const opts = Object.assign(defaultSearchPodOptions, options ?? {});
    const fuse = new Fuse(response.body.items, opts);
    const result = fuse.search(name).map((result) => result.item);
    return result;
  }
}
