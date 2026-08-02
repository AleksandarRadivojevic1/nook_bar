import raw from '../content/hours.json';
import { localeTag, type Locale } from '../i18n';

export const TZ = 'Europe/Belgrade';

export type DayKey = 'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat' | 'sun';

/** Monday first: Serbian and English business convention both start the week there. */
export const DAY_ORDER: readonly DayKey[] = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'];

export interface DayHours {
  open: string;
  close: string;
}

export interface Hours {
  placeholder: boolean;
  week: Record<DayKey, DayHours>;
}

/**
 * The shape is enforced at build time by `hours.schema.ts`, which Base.astro
 * imports. Deliberately no zod here: the footer clock imports this module into
 * the browser, and pulling the validator along would ship ~60 KB to every
 * visitor to re-check a file that cannot change after the build.
 */
export const hours: Hours = raw;

export function toMinutes(hhmm: string): number {
  const [h, m] = hhmm.split(':').map(Number);
  return h * 60 + m;
}

/**
 * A close at or before the open means the session runs into the next day.
 * `24:00` is 1440, so a midnight close is NOT a wrap.
 */
export function wrapsMidnight(d: DayHours): boolean {
  return toMinutes(d.close) <= toMinutes(d.open);
}

// hourCycle h23 explicitly: h24 renders midnight as "24", which would land
// outside the 0..1439 range every other function assumes.
const partsFormatter = new Intl.DateTimeFormat('en-GB', {
  timeZone: TZ,
  hour: '2-digit',
  minute: '2-digit',
  hourCycle: 'h23',
});

const weekdayFormatter = new Intl.DateTimeFormat('en-GB', {
  timeZone: TZ,
  weekday: 'short',
});

const WEEKDAY_KEYS: Record<string, DayKey> = {
  Mon: 'mon',
  Tue: 'tue',
  Wed: 'wed',
  Thu: 'thu',
  Fri: 'fri',
  Sat: 'sat',
  Sun: 'sun',
};

/** Wall-clock weekday in Belgrade — near midnight this differs from UTC. */
export function weekdayInTz(date: Date): DayKey {
  const short = weekdayFormatter.format(date).slice(0, 3);
  return WEEKDAY_KEYS[short] ?? 'mon';
}

/** Wall-clock minutes past midnight in Belgrade, independent of display locale. */
export function minuteOfDayInTz(date: Date): number {
  const parts = partsFormatter.formatToParts(date);
  const hour = Number(parts.find((p) => p.type === 'hour')?.value ?? '0');
  const minute = Number(parts.find((p) => p.type === 'minute')?.value ?? '0');
  return hour * 60 + minute;
}

function shift(day: DayKey, by: number): DayKey {
  const i = DAY_ORDER.indexOf(day);
  return DAY_ORDER[(i + by + DAY_ORDER.length) % DAY_ORDER.length];
}

export interface Session {
  open: boolean;
  /** Present when open — the time this session ends. */
  closesAt?: string;
  /** Present when shut — the next time the bar opens. */
  opensAt?: string;
}

/**
 * Is the bar open, and until or from when.
 *
 * The non-obvious case is the small hours. At 00:30 on Saturday the bar IS
 * open, but that is FRIDAY's session still running — Saturday's has not
 * started. So yesterday is checked first, and only then today. Getting this
 * wrong is invisible at 3pm on a Tuesday and wrong every weekend.
 */
export function statusAt(
  day: DayKey,
  minute: number,
  week: Record<DayKey, DayHours>,
): Session {
  const yesterday = week[shift(day, -1)];
  if (wrapsMidnight(yesterday) && minute < toMinutes(yesterday.close)) {
    return { open: true, closesAt: yesterday.close };
  }

  const today = week[day];
  const opensAt = toMinutes(today.open);
  const closesAt = toMinutes(today.close);
  const openNow = wrapsMidnight(today)
    ? minute >= opensAt
    : minute >= opensAt && minute < closesAt;

  if (openNow) return { open: true, closesAt: today.close };
  if (minute < opensAt) return { open: false, opensAt: today.open };
  return { open: false, opensAt: week[shift(day, 1)].open };
}

export interface HoursGroup {
  days: DayKey[];
  open: string;
  close: string;
}

/**
 * Collapses runs of identical days so the display reads "Pon — čet  07 — 24"
 * instead of seven lines. Derived rather than hand-typed: a hand-typed hours
 * string is exactly how the old 08-24 drifted out of sync with reality.
 */
export function groupedHours(week: Record<DayKey, DayHours>): HoursGroup[] {
  const groups: HoursGroup[] = [];
  for (const day of DAY_ORDER) {
    const { open, close } = week[day];
    const last = groups[groups.length - 1];
    if (last && last.open === open && last.close === close) last.days.push(day);
    else groups.push({ days: [day], open, close });
  }
  return groups;
}

const SCHEMA_DAYS: Record<DayKey, string> = {
  mon: 'Monday',
  tue: 'Tuesday',
  wed: 'Wednesday',
  thu: 'Thursday',
  fri: 'Friday',
  sat: 'Saturday',
  sun: 'Sunday',
};

/**
 * schema.org has no 24:00; 23:59 is the conventional stand-in. A `closes`
 * earlier than `opens` is the accepted way to express a past-midnight close
 * and Google reads it correctly, so Friday and Saturday pass through as-is.
 */
export function openingHoursSpecification(week: Record<DayKey, DayHours>) {
  return groupedHours(week).map((g) => ({
    '@type': 'OpeningHoursSpecification',
    dayOfWeek: g.days.map((d) => SCHEMA_DAYS[d]),
    opens: g.open,
    closes: g.close === '24:00' ? '23:59' : g.close,
  }));
}

/**
 * "24:00" and "00:00" are the same instant but not the same statement: the old
 * code rendered a midnight close as "do 00:00", which reads as already-closed
 * to anyone looking at it in the afternoon. Bars close at 24h, not at 00:00.
 */
export function hourLabel(hhmm: string): string {
  return hhmm.endsWith(':00') ? `${hhmm.slice(0, 2)}h` : hhmm;
}

const clockFormatters = new Map<string, Intl.DateTimeFormat>();
const dateFormatters = new Map<string, Intl.DateTimeFormat>();

export function formatClock(date: Date, locale: Locale): string {
  const tag = localeTag(locale);
  if (!clockFormatters.has(tag)) {
    clockFormatters.set(
      tag,
      new Intl.DateTimeFormat(tag, {
        timeZone: TZ,
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hourCycle: 'h23',
      }),
    );
  }
  return clockFormatters.get(tag)!.format(date);
}

export function formatDate(date: Date, locale: Locale): string {
  const tag = localeTag(locale);
  if (!dateFormatters.has(tag)) {
    dateFormatters.set(
      tag,
      new Intl.DateTimeFormat(tag, {
        timeZone: TZ,
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      }),
    );
  }
  return dateFormatters.get(tag)!.format(date);
}
