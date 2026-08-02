/**
 * Deliberately NOT `as const`: Dictionary is derived from this object, and
 * literal types would force en.ts to repeat the Serbian strings verbatim.
 * Widened strings still enforce that both locales define the same keys.
 */
export const sr = {
  meta: {
    title: 'Nook — bar u Leskovcu',
    description:
      'Skriveno mesto u Leskovcu. Kafa od jutra, koktel do ponoći, i nijedan sat na zidu.',
  },
  /**
   * One label per section, keyed by the section's id. `src/lib/sections.ts`
   * derives SectionId from these keys, so a section cannot be added to the page
   * without also being labelled in both locales.
   */
  nav: {
    prostor: 'Prostor',
    siros: 'Siros',
    dan: 'Jedan dan',
    karta: 'Karta',
    potpis: 'Potpis',
    galerija: 'Galerija',
    ljudi: 'Ljudi',
    recenzije: 'Recenzije',
    kontakt: 'Kontakt',
    instagram: 'Instagram',
    cta: 'Pronađi nas',
    menu: 'Meni',
    menuClose: 'Zatvori meni',
  },
  hero: {
    eyebrow: 'Bar · Leskovac',
    headlineLine1: 'Neka mesta se ne traže.',
    headlineLine2: 'Na njih se naiđe.',
    sub: 'Kafa od jutra, koktel do ponoći, i nijedan sat na zidu.',
    cta: 'Otkrij',
    script: 'skriveno mesto',
    over: 'Iza vrata koja lako promašiš — soba koja te je čekala.',
    readoutInspiration: 'Inspiracija',
    readoutSyros: 'Siros, Kikladi',
    readoutBar: 'Nook',
    readoutCity: 'Leskovac',
  },
  prostor: {
    manifesto:
      'Nook je mali bar u Leskovcu. Materijali su obični — malter, drvo, mesing koji tamni. Ništa se ne pretvara da je starije nego što jeste. Piće je iskreno, mera je puna, a muzika je taman toliko tiha da se čuje razgovor.',
  },
  dan: {
    title: 'Jedan dan',
    sub: 'Od prve kafe do poslednjeg koktela — bar se menja četiri puta dnevno.',
    arrive: 'Koste Stamenkovića 23 · Leskovac',
    arriveScript: 'I tu si.',
    pin: 'Leskovac',
  },
  karta: {
    title: 'Karta',
    note: 'Kratka namerno. Menja se kad se promeni sezona.',
    currency: 'RSD',
  },
  hours: {
    days: {
      mon: 'Ponedeljak',
      tue: 'Utorak',
      wed: 'Sreda',
      thu: 'Četvrtak',
      fri: 'Petak',
      sat: 'Subota',
      sun: 'Nedelja',
    },
    /** Nominative — a value in the hours list: "07 — ponoć". */
    midnight: 'ponoć',
    /** Genitive — after "do" in the status pill: "Otvoreno · do ponoći". */
    midnightUntil: 'ponoći',
  },
  potpis: {
    eyebrow: 'Potpis',
    title: 'Tri koja pamtiš',
    note: 'Karta se menja. Ova tri ostaju — po njima nas prepoznaju.',
  },
  recenzije: {
    title: 'Recenzije',
    /* The figures are filled from site.json. Typed into this file they would
       be two more facts nobody remembers to update, which is how the opening
       hours ended up wrong on all seven days. */
    claim: '{count} ljudi je ostavilo recenziju. Svih {count} je dalo {score}.',
    note: 'Ostavljene onako kako su napisane.',
  },
  galerija: {
    eyebrow: 'Galerija',
    title: 'Prostor u slikama',
    note: 'Nekoliko trenutaka iz prostora.',
    close: 'Zatvori',
    prev: 'Prethodna',
    next: 'Sledeća',
  },
  kontakt: {
    title: 'Praktično',
    addressLabel: 'Adresa',
    priceLabel: 'Cena',
    nowLabel: 'Sada',
    /* The address is NOT here. It is the same street in both languages, so it
       was never translation — it was one fact stored in three places. It comes
       from site.json now, through addressLines(). A price RANGE per person is
       an editorial statement about the bar rather than a stored fact, and it
       genuinely formats differently per locale, so it stays. */
    priceValue: 'RSD 500 — 1.000|po osobi',
    hoursLabel: 'Radno vreme',
    socialLabel: 'Instagram',
    mapLabel: 'Gde smo',
    mapOpen: 'Otvori mapu',
  },
  instagram: {
    eyebrow: 'Instagram',
    title: 'Odavde nastavljamo',
    follow: 'Zaprati',
  },
  status: {
    open: 'Otvoreno · do {close}',
    closed: 'Zatvoreno · otvara u {open}',
  },
  footer: {
    menuCol: 'Meni',
    socialCol: 'Društvene',
    locationCol: 'Lokacija',
    ratingCol: 'Ocena',
    location: 'Leskovac, Srbija',
    /* Derived from site.json, never typed. The noun is inflected because
       Serbian agreement changes at 22 — see pluralNoun. */
    rating: '{score} — {count} {noun}',
    reviewNoun: { one: 'recenzija', few: 'recenzije', other: 'recenzija' },
    boundaries: 'Granice © OpenStreetMap contributors, ODbL',
    concept: 'Koncept — sadržaj ilustrativan',
    legal: 'Sva prava zadržana.',
    madeBy: 'Brending — 134agcy',
  },
};

export type Dictionary = typeof sr;
