import { CoreV1Api, KubeConfig } from '@kubernetes/client-node';
import { searchPod } from './search';
import { AggregatedCoreV1Api } from '../../../k8s/client';
import { createV1Pod } from '../../../k8s/testutil';

describe('searchPod', () => {
  it('should search the pod with the given name and namespace', async () => {
    KubeConfig.prototype.makeApiClient = jest
      .fn()
      .mockReturnValue(new AggregatedCoreV1Api());
    CoreV1Api.prototype.listNamespacedPod = jest.fn().mockResolvedValue({
      body: {
        items: ['my-pod', 'your-pod', 'your-fancy-pod'].map(createV1Pod),
      },
    });
    const pods = await searchPod({ name: 'my', namespace: 'default' });
    expect(pods).toEqual([createV1Pod('my-pod')]);
  });
});
