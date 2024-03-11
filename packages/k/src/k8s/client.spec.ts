import { CoreV1Api } from '@kubernetes/client-node';
import { AggregatedCoreV1Api } from './client';
import { createV1Pod } from './testutil';

describe('AggregatedCoreV1Api', () => {
  describe('searchNamespacedPod', () => {
    it('should search the pod with the given name via the approximate string matching', async () => {
      CoreV1Api.prototype.listNamespacedPod = jest.fn().mockResolvedValue({
        body: {
          items: ['my-pod', 'your-pod', 'my-fancy-pod'].map(createV1Pod),
        },
      });
      const client = new AggregatedCoreV1Api();
      expect(await client.searchNamespacedPod('my-pod', 'default')).toEqual(
        ['my-pod', 'my-fancy-pod'].map(createV1Pod)
      );
      expect(CoreV1Api.prototype.listNamespacedPod).toHaveBeenCalledWith(
        'default',
        undefined,
        undefined,
        undefined,
        undefined,
        undefined
      );
    });
  });
});
