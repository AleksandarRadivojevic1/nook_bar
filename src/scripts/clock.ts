import { fill, useTranslations, type Locale } from '../i18n';
import {
  formatClock,
  formatDate,
  hourLabel,
  hours,
  minuteOfDayInTz,
  statusAt,
  weekdayInTz,
} from '../lib/hours';

/**
 * Keeps the clock, date and open/closed pill current.
 *
 * The build already rendered these, so there is no blank first paint — but the
 * page is prerendered, so what it rendered is the moment of the BUILD, not the
 * visitor's. This is what makes it actually correct, and it is why the pill is
 * only trustworthy with JS enabled.
 *
 * Runs regardless of reduced motion: a clock is information, not decoration.
 */
export function startClock(root: ParentNode, locale: Locale): () => void {
  const t = useTranslations(locale);
  const clockEl = root.querySelector<HTMLElement>('#fclock');
  const dateEl = root.querySelector<HTMLElement>('#fdate');
  const statusEl = root.querySelector<HTMLElement>('#status');

  const tick = () => {
    const now = new Date();
    if (clockEl) clockEl.textContent = formatClock(now, locale);
    if (dateEl) dateEl.textContent = formatDate(now, locale);
    if (statusEl) {
      const session = statusAt(weekdayInTz(now), minuteOfDayInTz(now), hours.week);
      statusEl.className = 'status ' + (session.open ? 'is-open' : 'is-shut');
      const label = statusEl.lastElementChild ?? statusEl;
      label.textContent = session.open
        ? fill(t.status.open, { close: hourLabel(session.closesAt!) })
        : fill(t.status.closed, { open: hourLabel(session.opensAt!) });
    }
  };

  tick();
  const id = setInterval(tick, 1000);
  return () => clearInterval(id);
}
