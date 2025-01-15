import { formatISO, isBefore, isEqual } from 'date-fns';
import invariant from 'invariant';

/**
 * The span of time between a specific start date and end date.
 *
 * DateInterval represents a closed date interval in the form of
 * [startDate, endDate]. It is possible for the start and end dates to be the
 * same with a duration of 0. DateInterval does not support reverse intervals
 * i.e. intervals where the duration is less than 0 and the end date occurs
 * earlier in time than the start date.
 */
export class DateInterval {
  readonly start: Date;
  readonly end: Date;

  /**
   * Initializes an interval with the specified start and end date.
   */
  constructor(start: Date, end: Date) {
    invariant(
      isBefore(start, end) || isEqual(start, end),
      `start date ${formatISO(
        start
      )} must be earlier than or equal to end date ${formatISO(end)}`
    );
    this.start = start;
    this.end = end;
  }

  /**
   * Returns a string representation of this interval.
   */
  toString(): string {
    return `[${formatISO(this.start)}, ${formatISO(this.end)}]`;
  }
}
