import { describe, expect, it } from 'vitest';
import { readdirSync, readFileSync } from 'node:fs';
import { sr } from '../../src/i18n/sr';
import { en } from '../../src/i18n/en';

describe('the page says enough', () => {
  it('answers eight practical questions', () => {
    const files = readdirSync('src/content/practical').filter((f) => f.endsWith('.json'));
    expect(files).toHaveLength(8);
    for (const f of files) {
      const e = JSON.parse(readFileSync(`src/content/practical/${f}`, 'utf8'));
      expect(e.question.sr.length).toBeGreaterThan(0);
      expect(e.answer.en.length).toBeGreaterThan(0);
    }
  });

  it('no longer calls the card deliberately short', () => {
    expect(sr.karta.note).not.toMatch(/kratka namerno/i);
    expect(sr.karta.note).toMatch(/dinarima/i);
  });

  it('credits the press quote', () => {
    expect(sr.press.source).toMatch(/journal/i);
    expect(en.press.quote.length).toBeGreaterThan(20);
  });
});
