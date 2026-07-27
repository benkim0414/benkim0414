import { render, screen } from '@testing-library/react';

import {
  devOpsCapabilityEvidenceItems,
  doraCapabilityDefinitions,
} from './devops-capability-evidence.data';
import type { CapabilityEvidenceItem } from './devops-capability-evidence.types';
import { DevOpsCertificationCapabilityMap } from './devops-certification-capability-map';

describe('DevOpsCertificationCapabilityMap', () => {
  it('renders certifications mapped to capability labels', () => {
    render(
      <DevOpsCertificationCapabilityMap
        capabilities={doraCapabilityDefinitions}
        evidence={devOpsCapabilityEvidenceItems}
      />,
    );

    expect(
      screen.getByLabelText('DevOps certification capability map'),
    ).toBeTruthy();
    expect(screen.getByText('CNCF Kubernetes certification')).toBeTruthy();
    expect(screen.getByText('Flexible Infrastructure')).toBeTruthy();
    expect(screen.getByText('Monitoring and Observability')).toBeTruthy();
    expect(screen.getByText('Cloud Native Computing Foundation')).toBeTruthy();
  });

  it('does not render private or sensitive certifications', () => {
    const privateCertification = {
      id: 'private-certification',
      title: 'Private certification details',
      type: 'certification',
      capabilityKeys: ['pervasive-security'],
      summary: 'Private certification summary.',
      isPublic: true,
      isSensitive: true,
      strength: 'primary',
    } satisfies CapabilityEvidenceItem;

    render(
      <DevOpsCertificationCapabilityMap
        capabilities={doraCapabilityDefinitions}
        evidence={[...devOpsCapabilityEvidenceItems, privateCertification]}
      />,
    );

    expect(screen.queryByText('Private certification details')).toBeNull();
  });

  it('renders nothing without public certifications', () => {
    const { container } = render(
      <DevOpsCertificationCapabilityMap
        capabilities={doraCapabilityDefinitions}
        evidence={[]}
      />,
    );

    expect(container.childElementCount).toBe(0);
  });
});
