import type { ReactElement } from 'react';

import { getPublicCapabilityEvidence } from './devops-capability-evidence.scoring';
import type {
  CapabilityEvidenceItem,
  DoraCapabilityDefinition,
} from './devops-capability-evidence.types';

export interface DevOpsCertificationCapabilityMapProps {
  evidence: readonly CapabilityEvidenceItem[];
  capabilities: readonly DoraCapabilityDefinition[];
}

export function DevOpsCertificationCapabilityMap({
  evidence,
  capabilities,
}: DevOpsCertificationCapabilityMapProps): ReactElement | null {
  const capabilitiesByKey = new Map(
    capabilities.map((capability) => [capability.key, capability]),
  );
  const certifications = getPublicCapabilityEvidence(evidence).filter(
    (item) => item.type === 'certification',
  );

  if (certifications.length === 0) {
    return null;
  }

  return (
    <div aria-label="DevOps certification capability map">
      {certifications.map((certification) => (
        <section key={certification.id}>
          <h3>{certification.title}</h3>
          {certification.issuer ? <p>{certification.issuer}</p> : null}
          <ul>
            {certification.capabilityKeys.map((key) => {
              const capability = capabilitiesByKey.get(key);
              return capability ? <li key={key}>{capability.label}</li> : null;
            })}
          </ul>
        </section>
      ))}
    </div>
  );
}
