import { capabilityEvidenceInitiatives } from './capability-evidence-initiatives';
import type { CapabilityEvidenceItem } from './devops-capability-evidence.types';

const documentationSystem = capabilityEvidenceInitiatives.documentationSystem;
const snapshotDate = '2026-08-09';

export const documentationQualityEvidenceItems: readonly CapabilityEvidenceItem[] =
  [
    {
      id: 'structured-documentation-corpus',
      title: 'Structured engineering documentation corpus',
      label: 'Documentation corpus',
      type: 'experience',
      capabilityKeys: ['documentation-quality'],
      summary:
        'A substantial maintained body of engineering and operational prose is managed with the system.',
      technologies: ['Markdown'],
      details: {
        initiative: documentationSystem,
        period: { startedAt: '2024-06-03' },
        metrics: [],
        facts: [
          'A substantial maintained body of engineering and operational prose is managed with the system.',
        ],
      },
      isPublic: true,
      strength: 'primary',
    },
    {
      id: 'indexed-solution-documentation',
      title: 'Indexed solution documentation',
      label: 'Indexed solutions',
      type: 'experience',
      capabilityKeys: ['documentation-quality'],
      summary:
        'Every verified solution document is reachable from a maintained index.',
      technologies: ['Markdown'],
      details: {
        initiative: documentationSystem,
        period: { startedAt: '2024-06-03' },
        metrics: [
          {
            label: 'Verified solution index coverage',
            value: 100,
            unit: 'percent',
            measuredAt: snapshotDate,
          },
        ],
        facts: [
          'Every verified solution document is reachable from a maintained index.',
        ],
      },
      isPublic: true,
      strength: 'strong',
    },
    {
      id: 'documentation-frontmatter-contracts',
      title: 'Structured documentation metadata',
      label: 'Documentation metadata',
      type: 'experience',
      capabilityKeys: ['documentation-quality'],
      summary:
        'Verified solution documents carry consistent retrieval metadata.',
      technologies: ['Markdown', 'YAML'],
      details: {
        initiative: documentationSystem,
        period: { startedAt: '2024-06-03' },
        metrics: [
          {
            label: 'Verified solution metadata coverage',
            value: 100,
            unit: 'percent',
            measuredAt: snapshotDate,
          },
        ],
        facts: [
          'Verified solution documents carry consistent retrieval metadata.',
        ],
      },
      isPublic: true,
      strength: 'strong',
    },
    {
      id: 'current-documentation-maintenance',
      title: 'Actively maintained documentation',
      label: 'Documentation currency',
      type: 'experience',
      capabilityKeys: ['documentation-quality'],
      summary:
        'A high proportion of the verified corpus was updated within the measured window.',
      technologies: ['Markdown', 'Git'],
      details: {
        initiative: documentationSystem,
        period: { startedAt: '2024-06-03' },
        metrics: [],
        facts: [
          'A high proportion of the verified corpus was updated within the measured window.',
        ],
      },
      isPublic: true,
      strength: 'strong',
    },
    {
      id: 'documentation-change-integration',
      title: 'Documentation integrated with engineering changes',
      label: 'Docs with changes',
      type: 'experience',
      capabilityKeys: ['documentation-quality'],
      summary:
        'Documentation accompanies a meaningful share of engineering changes and is also committed as first-class work.',
      technologies: ['Markdown', 'Git'],
      details: {
        initiative: documentationSystem,
        period: { startedAt: '2024-06-03' },
        metrics: [],
        facts: [
          'Documentation accompanies a meaningful share of engineering changes and is also committed as first-class work.',
        ],
      },
      isPublic: true,
      strength: 'strong',
    },
    {
      id: 'cross-verified-documentation-claims',
      title: 'Cross-verified operational documentation',
      label: 'Verified claims',
      type: 'experience',
      capabilityKeys: ['documentation-quality'],
      summary:
        'Operational claims were independently checked by the related capability evidence work.',
      technologies: ['Markdown'],
      details: {
        initiative: documentationSystem,
        period: { startedAt: '2024-06-03' },
        metrics: [],
        facts: [
          'Operational claims were independently checked by the related capability evidence work.',
        ],
      },
      isPublic: true,
      strength: 'strong',
    },
  ];
