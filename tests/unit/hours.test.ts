import { describe, expect, it } from 'vitest';
import {
  formatClock,
  formatDate,
  hours,
  hoursSchema,
  isOpenAt,
  minuteOfDayInTz,
  toMinutes,
} from '../../src/lib/hours';

const SAME_DAY = { open: '08:00', close: '24:00', placeholder: true };
const PAST_MIDNIGHT = { open: '20:00', close: '02:00', placeholder: true };

describe('toMinutes', () => {
  it('converts HH:MM to minutes past midnight', () => {
    expect(toMinutes('00:00')).toBe(0);
    expect(toMinutes('08:00')).toBe(480);
    expect(toMinutes('24:00')).toBe(1440);
  });
});

describe('isOpenAt, same-day hours', () => {
  it('is shut one minute before opening', () => {
    expect(isOpenAt(toMinutes('07:59'), SAME_DAY)).toBe(false);
  });
  it('is open on the dot', () => {
    expect(isOpenAt(toMinutes('08:00'), SAME_DAY)).toBe(true);
  });
  it('is open at the last minute of the day', () => {
    expect(isOpenAt(toMinutes('23:59'), SAME_DAY)).toBe(true);
  });
  it('is shut at midnight', () => {
    expect(isOpenAt(toMinutes('00:00'), SAME_DAY)).toBe(false);
  });
});

describe('isOpenAt, hours crossing midnight', () => {
  it('is open before midnight', () => {
    expect(isOpenAt(toMinutes('23:30'), PAST_MIDNIGHT)).toBe(true);
  });
  it('is open after midnight', () => {
    expect(isOpenAt(toMinutes('01:00'), PAST_MIDNIGHT)).toBe(true);
  });
  it('is shut in the gap', () => {
    expect(isOpenAt(toMinutes('03:00'), PAST_MIDNIGHT)).toBe(false);
    expect(isOpenAt(toMinutes('19:59'), PAST_MIDNIGHT)).toBe(false);
  });
});

describe('minuteOfDayInTz', () => {
  it('reads Belgrade wall-clock time in summer (UTC+2)', () => {
    // 2026-07-15T10:00:00Z is 12:00 in Belgrade
    expect(minuteOfDayInTz(new Date('2026-07-15T10:00:00Z'))).toBe(12 * 60);
  });
  it('reads Belgrade wall-clock time in winter (UTC+1)', () => {
    // 2026-01-15T10:00:00Z is 11:00 in Belgrade
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
  it('is still marked as placeholder data', () => {
    // Flip this to false only once the owners confirm real hours.
    expect(hours.placeholder).toBe(true);
  });
  it('rejects malformed times', () => {
    expect(() => hoursSchema.parse({ open: '8:00', close: '24:00' })).toThrow();
    expect(() => hoursSchema.parse({ open: '08:00', close: '25:00' })).toThrow();
  });
});
