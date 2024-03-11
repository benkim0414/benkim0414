import { KubeConfig, V1Pod } from '@kubernetes/client-node';
import { AggregatedCoreV1Api } from '../../../k8s/client';

export interface SearchPodArguments {
  name: string;
  namespace: string;
}

export async function searchPod(args: SearchPodArguments): Promise<V1Pod[]> {
  const { name, namespace } = args;
  const kc = new KubeConfig();
  kc.loadFromDefault();
  const client = kc.makeApiClient(AggregatedCoreV1Api);
  const pods = await client.searchNamespacedPod(name, namespace);
  printPods(pods);
  return pods;
}

function printPods(pods: V1Pod[]): void {
  const names = pods
    .map((pod) => pod.metadata?.name)
    .filter((name): name is string => !!name);
  console.log('NAME');
  names.forEach((name) => console.log(name));
}
