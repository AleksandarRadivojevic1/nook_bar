import { describe, expect, it } from 'vitest';
import {
  DAY_ORDER,
  formatClock,
  formatDate,
  groupedHours,
  timeLabel,
  hours,
  minuteOfDayInTz,
  openingHoursSpecification,
  statusAt,
  toMinutes,
  weekdayInTz,
  wrapsMidnight,
} from '../../src/lib/hours';
// The validator lives in its own module so it stays out of the client bundle;
// the guarantee it provides is still worth testing.
import { assertHours, hoursSchema } from '../../src/lib/hours.schema';

const WEEK = hours.week;

describe('toMinutes', () => {
  it('converts HH:MM to minutes past midnight', () => {
    expect(toMinutes('00:00')).toBe(0);
    expect(toMinutes('08:00')).toBe(480);
    expect(toMinutes('24:00')).toBe(1440);
  });
});

describe('wrapsMidnight', () => {
  it('is true when the close is at or before the open', () => {
    expect(wrapsMidnight({ open: '07:00', close: '01:00' })).toBe(true);
  });
  it('is false for a same-day session', () => {
    expect(wrapsMidnight({ open: '07:00', close: '24:00' })).toBe(false);
  });
});

describe('statusAt, same-day sessions', () => {
  it('is shut one minute before opening', () => {
    expect(statusAt('mon', toMinutes('06:59'), WEEK).open).toBe(false);
  });
  it('is open on the dot', () => {
    expect(statusAt('mon', toMinutes('07:00'), WEEK).open).toBe(true);
  });
  it('is open at the last minute of the day', () => {
    expect(statusAt('mon', toMinutes('23:59'), WEEK).open).toBe(true);
  });
  it('reports the closing time', () => {
    expect(statusAt('mon', toMinutes('12:00'), WEEK).closesAt).toBe('24:00');
  });
});

describe('statusAt, sessions running past midnight', () => {
  it('is open late on Friday night', () => {
    const s = statusAt('fri', toMinutes('23:30'), WEEK);
    expect(s.open).toBe(true);
    expect(s.closesAt).toBe('01:00');
  });
  // The whole point of the model: this is Friday's session, not Saturday's.
  it('is still open at 00:30 on Saturday, closing at 01:00', () => {
    const s = statusAt('sat', toMinutes('00:30'), WEEK);
    expect(s.open).toBe(true);
    expect(s.closesAt).toBe('01:00');
  });
  it('is shut at 03:00 on Saturday and opens at 07:00', () => {
    const s = statusAt('sat', toMinutes('03:00'), WEEK);
    expect(s.open).toBe(false);
    expect(s.opensAt).toBe('07:00');
  });
  // Sunday opens two hours later than the rest of the week.
  it('is shut at 03:00 on Sunday and opens at 09:00, not 07:00', () => {
    const s = statusAt('sun', toMinutes('03:00'), WEEK);
    expect(s.open).toBe(false);
    expect(s.opensAt).toBe('09:00');
  });
  // Sunday closes at midnight, so Monday's small hours are shut.
  it('is shut at 00:30 on Monday, and opens later that morning', () => {
    const s = statusAt('mon', toMinutes('00:30'), WEEK);
    expect(s.open).toBe(false);
    expect(s.opensAt).toBe('07:00');
  });
  it('is still open at the last minute before a midnight close', () => {
    expect(statusAt('sun', toMinutes('23:59'), WEEK).open).toBe(true);
  });
  // Past the close with nothing left today, the next opening is tomorrow's.
  it('reports tomorrow opening once today is done', () => {
    const week = { ...WEEK, tue: { open: '07:00', close: '18:00' } };
    const s = statusAt('tue', toMinutes('20:00'), week);
    expect(s.open).toBe(false);
    expect(s.opensAt).toBe(week.wed.open);
  });
});

describe('groupedHours', () => {
  it('collapses runs of identical days', () => {
    expect(groupedHours(WEEK)).toEqual([
      { days: ['mon', 'tue', 'wed', 'thu'], open: '07:00', close: '24:00' },
      { days: ['fri', 'sat'], open: '07:00', close: '01:00' },
      { days: ['sun'], open: '09:00', close: '24:00' },
    ]);
  });
  it('produces one group when every day is the same', () => {
    const flat = Object.fromEntries(
      DAY_ORDER.map((d) => [d, { open: '08:00', close: '24:00' }]),
    ) as typeof WEEK;
    expect(groupedHours(flat)).toHaveLength(1);
  });
  it('does not wrap Sunday into Monday', () => {
    const week = { ...WEEK, sun: { open: '07:00', close: '24:00' } };
    const groups = groupedHours(week);
    expect(groups[groups.length - 1].days).toEqual(['sun']);
  });
});

describe('openingHoursSpecification', () => {
  it('emits one specification per group', () => {
    expect(openingHoursSpecification(WEEK)).toHaveLength(3);
  });
  it('uses schema.org day names', () => {
    expect(openingHoursSpecification(WEEK)[0].dayOfWeek).toEqual([
      'Monday',
      'Tuesday',
      'Wednesday',
      'Thursday',
    ]);
  });
  it('renders a 24:00 close as 23:59, which schema.org understands', () => {
    expect(openingHoursSpecification(WEEK)[0].closes).toBe('23:59');
  });
  it('leaves a past-midnight close alone', () => {
    expect(openingHoursSpecification(WEEK)[1].closes).toBe('01:00');
  });
});

describe('timeLabel', () => {
  it('drops the empty minutes a bar never has', () => {
    expect(timeLabel('07:00', 'ponoć')).toBe('07');
    expect(timeLabel('01:00', 'ponoć')).toBe('01');
  });
  it('spells midnight out rather than showing 24h or 00:00', () => {
    // "do 00:00" reads as already-closed at 13:00; "24h" reads as a database
    // value. Both are the same instant and neither is what a person says.
    expect(timeLabel('24:00', 'ponoć')).toBe('ponoć');
    expect(timeLabel('00:00', 'ponoć')).toBe('ponoć');
  });
  it('takes the word so the caller controls the grammatical case', () => {
    // Serbian: nominative in a list, genitive after "do".
    expect(timeLabel('24:00', 'ponoći')).toBe('ponoći');
    expect(timeLabel('24:00', 'midnight')).toBe('midnight');
  });
  it('keeps real minutes when there are any', () => {
    expect(timeLabel('07:30', 'ponoć')).toBe('07:30');
  });
});

describe('weekdayInTz', () => {
  it('reads the Belgrade weekday, not UTC', () => {
    // 2026-08-02 is a Sunday. 22:30 UTC is already Monday in Belgrade (UTC+2).
    expect(weekdayInTz(new Date('2026-08-02T22:30:00Z'))).toBe('mon');
  });
  it('reads a plain midday correctly', () => {
    expect(weekdayInTz(new Date('2026-08-02T10:00:00Z'))).toBe('sun');
  });
});

describe('minuteOfDayInTz', () => {
  it('reads Belgrade wall-clock time in summer (UTC+2)', () => {
    expect(minuteOfDayInTz(new Date('2026-07-15T10:00:00Z'))).toBe(12 * 60);
  });
  it('reads Belgrade wall-clock time in winter (UTC+1)', () => {
    expect(minuteOfDayInTz(new Date('2026-01-15T10:00:00Z'))).toBe(11 * 60);
  });
  it('reports midnight as 0, not 1440', () => {
    expect(minuteOfDayInTz(new Date('2026-07-14T22:00:00Z'))).toBe(0);
  });
});

describe('formatting', () => {
  const noon = new Date('2026-07-15T10:00:00Z');
  it('formats a 24-hour clock', () => {
    expect(formatClock(noon, 'sr')).toMatch(/^12:00:00$/);
    expect(formatClock(noon, 'en')).toMatch(/^12:00:00$/);
  });
  it('writes Serbian dates in Latin script, not Cyrillic', () => {
    const text = formatDate(noon, 'sr');
    expect(text).not.toMatch(/[Ѐ-ӿ]/);
    expect(text).toMatch(/2026/);
  });
  it('writes English dates in English', () => {
    expect(formatDate(noon, 'en')).toMatch(/July|Jul/);
  });
});

describe('the hours singleton', () => {
  it('validates against the schema', () => {
    expect(() => hoursSchema.parse(hours)).not.toThrow();
  });
  it('is exactly what the build-time check returns', () => {
    expect(hours).toEqual(assertHours());
  });
  it('is no longer placeholder data — the owners confirmed these', () => {
    expect(hours.placeholder).toBe(false);
  });
  it('carries all seven days', () => {
    expect(Object.keys(hours.week).sort()).toEqual([
      'fri',
      'mon',
      'sat',
      'sun',
      'thu',
      'tue',
      'wed',
    ]);
  });
  it('has the real hours the owners gave', () => {
    expect(hours.week.mon).toEqual({ open: '07:00', close: '24:00' });
    expect(hours.week.fri).toEqual({ open: '07:00', close: '01:00' });
    expect(hours.week.sun).toEqual({ open: '09:00', close: '24:00' });
  });
  it('rejects a missing day', () => {
    const { sun, ...six } = hours.week;
    expect(() => hoursSchema.parse({ placeholder: false, week: six })).toThrow();
  });
  it('rejects malformed times', () => {
    const bad = (d: unknown) =>
      hoursSchema.parse({ placeholder: false, week: { ...hours.week, mon: d } });
    expect(() => bad({ open: '8:00', close: '24:00' })).toThrow();
    expect(() => bad({ open: '08:00', close: '25:00' })).toThrow();
  });
  it('rejects the old flat shape outright', () => {
    expect(() => hoursSchema.parse({ open: '08:00', close: '24:00' })).toThrow();
  });
});
