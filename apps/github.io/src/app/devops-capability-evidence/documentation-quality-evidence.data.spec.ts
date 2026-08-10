import { expectPublicSafeEvidence } from './public-evidence-safety.test-helpers';
import { documentationQualityEvidenceItems } from './documentation-quality-evidence.data';

const expectedIds = [
  'structured-documentation-corpus',
  'indexed-solution-documentation',
  'documentation-frontmatter-contracts',
  'current-documentation-maintenance',
  'documentation-change-integration',
  'cross-verified-documentation-claims',
] as const;

const approvedPublicCatalogText = [
  'Structured engineering documentation corpus',
  'Documentation corpus',
  'A substantial maintained body of engineering and operational prose is managed with the system.',
  'Markdown',
  'Documentation system',
  'Indexed solution documentation',
  'Indexed solutions',
  'Every verified solution document is reachable from a maintained index.',
  'Verified solution index coverage',
  'Structured documentation metadata',
  'Documentation metadata',
  'Verified solution documents carry consistent retrieval metadata.',
  'YAML',
  'Verified solution metadata coverage',
  'Actively maintained documentation',
  'Documentation currency',
  'A high proportion of the verified corpus was updated within the measured window.',
  'Git',
  'Documentation integrated with engineering changes',
  'Docs with changes',
  'Documentation accompanies a meaningful share of engineering changes and is also committed as first-class work.',
  'Cross-verified operational documentation',
  'Verified claims',
  'Operational claims were independently checked by the related capability evidence work.',
] as const;

const isoDate = /^\d{4}-\d{2}-\d{2}$/;
const isIsoCalendarDate = (value: string): boolean => {
  if (!isoDate.test(value)) {
    return false;
  }

  const [year, month, day] = value.split('-').map(Number);
  const daysInMonth = [
    31,
    year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0) ? 29 : 28,
    31,
    30,
    31,
    30,
    31,
    31,
    30,
    31,
    30,
    31,
  ];

  return (
    month >= 1 &&
    month <= 12 &&
    day >= 1 &&
    day <= (daysInMonth[month - 1] ?? 0)
  );
};

const byId = new Map(
  documentationQualityEvidenceItems.map((item) => [item.id, item]),
);

const expectPublicStructuredDocumentationQualityEvidence = (
  items: typeof documentationQualityEvidenceItems,
): void => {
  for (const item of items) {
    expect(item.type).toBe('experience');
    expect(item.capabilityKeys).toEqual(['documentation-quality']);
    expect(item.isPublic).toBe(true);
    expect(item.isSensitive).not.toBe(true);
    expect(item.organization).toBeUndefined();
    expect(item.proofUrl).toBeUndefined();
    expect(item.details).toBeDefined();
    expect(item.details?.period.startedAt).toSatisfy(isIsoCalendarDate);
    if (item.details?.period.endedAt !== undefined) {
      expect(item.details.period.endedAt).toSatisfy(isIsoCalendarDate);
    }
    expect(item.details?.facts.length).toBeGreaterThan(0);
    expect(item.technologies?.length).toBeGreaterThan(0);
    expect(item.details?.metrics).toBeDefined();

    for (const metric of item.details?.metrics ?? []) {
      expect(metric.label.trim().length).toBeGreaterThan(0);
      expect(Number.isFinite(metric.value)).toBe(true);
      expect(metric.value).toBeGreaterThanOrEqual(0);
      expect(metric.measuredAt).toSatisfy(isIsoCalendarDate);

      if (metric.unit === 'percent') {
        expect(metric.value).toBeLessThanOrEqual(100);
      }

      if (metric.denominator !== undefined) {
        expect(Number.isFinite(metric.denominator)).toBe(true);
        expect(metric.denominator).toBeGreaterThan(0);
        expect(metric.value).toBeLessThanOrEqual(metric.denominator);
      }
    }
  }
};

describe('documentationQualityEvidenceItems', () => {
  it('rejects impossible calendar dates in the catalog contract', () => {
    expect(isIsoCalendarDate('2024-02-29')).toBe(true);
    expect(isIsoCalendarDate('2024-02-30')).toBe(false);
  });

  it('stores the complete approved catalog in display order', () => {
    expect(documentationQualityEvidenceItems.map((item) => item.id)).toEqual(
      expectedIds,
    );
    expect(
      new Set(documentationQualityEvidenceItems.map((item) => item.id)).size,
    ).toBe(6);
  });

  it('keeps every record public, structured, and compatible with Documentation Quality', () => {
    expectPublicStructuredDocumentationQualityEvidence(
      documentationQualityEvidenceItems,
    );
  });

  it('rejects an empty endedAt value in a synthetic catalog record', () => {
    const source = byId.get('structured-documentation-corpus');
    if (!source?.details) {
      throw new Error('Expected documentation corpus evidence details');
    }

    const emptyEndedAtRecord = {
      ...source,
      details: {
        ...source.details,
        period: { ...source.details.period, endedAt: '' },
      },
    };

    expect(() =>
      expectPublicStructuredDocumentationQualityEvidence([emptyEndedAtRecord]),
    ).toThrow();
  });

  it('keeps the six experiences at their reviewed public values', () => {
    expect(
      expectedIds.map((id) => {
        const item = byId.get(id);
        return [
          item?.id,
          item?.title,
          item?.label,
          item?.summary,
          item?.technologies,
          item?.strength,
          item?.details?.initiative,
          item?.details?.period,
          item?.details?.metrics,
          item?.details?.facts,
          item?.capabilityKeys,
        ];
      }),
    ).toEqual([
      [
        'structured-documentation-corpus',
        'Structured engineering documentation corpus',
        'Documentation corpus',
        'A substantial maintained body of engineering and operational prose is managed with the system.',
        ['Markdown'],
        'primary',
        { id: 'documentation-system', label: 'Documentation system' },
        { startedAt: '2024-06-03' },
        [],
        [
          'A substantial maintained body of engineering and operational prose is managed with the system.',
        ],
        ['documentation-quality'],
      ],
      [
        'indexed-solution-documentation',
        'Indexed solution documentation',
        'Indexed solutions',
        'Every verified solution document is reachable from a maintained index.',
        ['Markdown'],
        'strong',
        { id: 'documentation-system', label: 'Documentation system' },
        { startedAt: '2024-06-03' },
        [
          {
            label: 'Verified solution index coverage',
            value: 100,
            unit: 'percent',
            measuredAt: '2026-08-09',
          },
        ],
        [
          'Every verified solution document is reachable from a maintained index.',
        ],
        ['documentation-quality'],
      ],
      [
        'documentation-frontmatter-contracts',
        'Structured documentation metadata',
        'Documentation metadata',
        'Verified solution documents carry consistent retrieval metadata.',
        ['Markdown', 'YAML'],
        'strong',
        { id: 'documentation-system', label: 'Documentation system' },
        { startedAt: '2024-06-03' },
        [
          {
            label: 'Verified solution metadata coverage',
            value: 100,
            unit: 'percent',
            measuredAt: '2026-08-09',
          },
        ],
        ['Verified solution documents carry consistent retrieval metadata.'],
        ['documentation-quality'],
      ],
      [
        'current-documentation-maintenance',
        'Actively maintained documentation',
        'Documentation currency',
        'A high proportion of the verified corpus was updated within the measured window.',
        ['Markdown', 'Git'],
        'strong',
        { id: 'documentation-system', label: 'Documentation system' },
        { startedAt: '2024-06-03' },
        [],
        [
          'A high proportion of the verified corpus was updated within the measured window.',
        ],
        ['documentation-quality'],
      ],
      [
        'documentation-change-integration',
        'Documentation integrated with engineering changes',
        'Docs with changes',
        'Documentation accompanies a meaningful share of engineering changes and is also committed as first-class work.',
        ['Markdown', 'Git'],
        'strong',
        { id: 'documentation-system', label: 'Documentation system' },
        { startedAt: '2024-06-03' },
        [],
        [
          'Documentation accompanies a meaningful share of engineering changes and is also committed as first-class work.',
        ],
        ['documentation-quality'],
      ],
      [
        'cross-verified-documentation-claims',
        'Cross-verified operational documentation',
        'Verified claims',
        'Operational claims were independently checked by the related capability evidence work.',
        ['Markdown'],
        'strong',
        { id: 'documentation-system', label: 'Documentation system' },
        { startedAt: '2024-06-03' },
        [],
        [
          'Operational claims were independently checked by the related capability evidence work.',
        ],
        ['documentation-quality'],
      ],
    ]);
  });

  it('keeps publication text reviewed, affirmative, and public-safe', () => {
    expectPublicSafeEvidence(
      documentationQualityEvidenceItems,
      approvedPublicCatalogText,
    );

    expect(JSON.stringify(documentationQualityEvidenceItems)).not.toMatch(
      /automated (?:documentation )?validation|link checking|required documentation review|perception[- ]survey/i,
    );
  });
});
