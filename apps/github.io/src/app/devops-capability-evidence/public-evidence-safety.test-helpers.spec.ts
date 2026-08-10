import type { CapabilityEvidenceItem } from './devops-capability-evidence.types';
import {
  expectPublicSafeEvidence,
  expectPublicSafeText,
} from './public-evidence-safety.test-helpers';

const publicEvidenceFixture = {
  id: 'public-evidence-fixture',
  title: 'Public evidence fixture',
  type: 'experience',
  capabilityKeys: ['deployment-automation'],
  summary: 'Automated a repeatable deployment path.',
  isPublic: true,
  strength: 'strong',
} as const satisfies CapabilityEvidenceItem;

const unsafeEvidenceCases = [
  ['non-public evidence', { isPublic: false }],
  ['sensitive evidence', { isSensitive: true }],
  ['organization field', { organization: 'Example organization' }],
  ['proof URL', { proofUrl: 'https://example.test/private-proof' }],
] satisfies readonly [string, Partial<CapabilityEvidenceItem>][];

describe('public evidence safety test helper', () => {
  it.each(unsafeEvidenceCases)('rejects %s', (_category, unsafeFields) => {
    expect(() =>
      expectPublicSafeEvidence([{ ...publicEvidenceFixture, ...unsafeFields }]),
    ).toThrow();
  });

  it.each([
    ['private repository name', 'Private repository name: platform-delivery'],
    ['filesystem path', 'Filesystem path: /workspace/platform/deploy'],
    ['parameter path', 'Parameter path: /platform/production/token'],
    ['employer language', 'Employer deployment platform'],
    ['customer language', 'Customer delivery workflow'],
    ['client language', 'Client infrastructure'],
    ['business domain', 'Business domain: fulfilment'],
    ['account identifier', 'AWS account 123456789012'],
    ['internal service name', 'Internal service name: orders-api'],
    ['internal workflow name', 'Internal workflow name: deploy-production'],
    ['internal module name', 'Internal module name: workload-identity'],
    ['internal image name', 'Internal image name: application-api'],
    ['raw personal identity', 'Raw personal identity: Example Person'],
    ['authorization gap', 'Authorization gap remains'],
    ['failing suite', 'Failing regression suite'],
    ['manual secret creation', 'Manual secret creation remains'],
    ['manual deployment residue', 'Manual deployment residue remains'],
    ['deployment incident', 'Deployment incident affected releases'],
    ['delayed release', 'Delayed release after deployment'],
    ['blast radius', 'Blast radius reached multiple services'],
  ])('rejects %s', (_category, unsafeText) => {
    expect(() => expectPublicSafeText([unsafeText])).toThrow();
  });

  it('permits approved affirmative phrases', () => {
    expectPublicSafeText([
      'Automated deployments completed without manual intervention.',
      'All inspected overlays rendered with zero build failures.',
    ]);
  });
});
