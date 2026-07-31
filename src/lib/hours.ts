import { z } from 'astro/zod';
import raw from '../content/hours.json';
import { localeTag, type Locale } from '../i18n';

export const TZ = 'Europe/Belgrade';

export const hoursSchema = z.object({
  open: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/),
  close: z.string().regex(/^(([01]\d|2[0-3]):[0-5]\d|24:00)$/),
  placeholder: z.boolean().default(true),
});

export type Hours = z.infer<typeof hoursSchema>;

export const hours: Hours = hoursSchema.parse(raw);

export function toMinutes(hhmm: string): number {
  const [h, m] = hhmm.split(':').map(Number);
  return h * 60 + m;
}

/**
 * Closing "past midnight" (close <= open) is a real case for a bar and the
 * naive `open <= m < close` comparison reports it shut all night.
 */
export function isOpenAt(minuteOfDay: number, h: Hours): boolean {
  const open = toMinutes(h.open);
  const close = toMinutes(h.close);
  return close > open
    ? minuteOfDay >= open && minuteOfDay < close
    : minuteOfDay >= open || minuteOfDay < close;
}

// hourCycle h23 explicitly: h24 renders midnight as "24", which would land
// outside the 0..1439 range every other function assumes.
const partsFormatter = new Intl.DateTimeFormat('en-GB', {
  timeZone: TZ,
  hour: '2-digit',
  minute: '2-digit',
  hourCycle: 'h23',
});

/** Wall-clock minutes past midnight in Belgrade, independent of display locale. */
export function minuteOfDayInTz(date: Date): number {
  const parts = partsFormatter.formatToParts(date);
  const hour = Number(parts.find((p) => p.type === 'hour')?.value ?? '0');
  const minute = Number(parts.find((p) => p.type === 'minute')?.value ?? '0');
  return hour * 60 + minute;
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

/** "24:00" is not a wall-clock reading anyone recognises — show it as 00:00. */
export function displayTime(hhmm: string): string {
  return hhmm === '24:00' ? '00:00' : hhmm;
}
