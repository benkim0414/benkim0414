import { addDays } from 'date-fns';
import { DateInterval } from './date-interval';
import { TZDate } from '@date-fns/tz';

describe('DateInterval', () => {
  it('throws an error when end date is earlier than start date', () => {
    const start = new TZDate(2024, 11, 15, 'Australia/Melbourne');
    const end = addDays(start, -1);

    expect(
      () => new DateInterval(start, end)
    ).toThrowErrorMatchingInlineSnapshot(
      `"start date 2024-12-15T00:00:00+11:00 must be earlier than or equal to end date 2024-12-14T00:00:00+11:00"`
    );
  });

  it('allows initialization with the same start and end dates', () => {
    const start = new TZDate(2024, 11, 15, 'Australia/Melbourne');
    const end = start;

    const interval = new DateInterval(start, end);

    expect(interval.toString()).toBe(
      '[2024-12-15T00:00:00+11:00, 2024-12-15T00:00:00+11:00]'
    );
  });

  describe('toString', () => {
    it('returns a string representation of this DateInterval', () => {
      const start = new TZDate(2024, 11, 15, 'Australia/Melbourne');
      const end = addDays(start, 1);

      expect(new DateInterval(start, end).toString()).toBe(
        '[2024-12-15T00:00:00+11:00, 2024-12-16T00:00:00+11:00]'
      );
    });
  });
});
