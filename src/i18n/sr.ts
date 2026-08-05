/**
 * Deliberately NOT `as const`: Dictionary is derived from this object, and
 * literal types would force en.ts to repeat the Serbian strings verbatim.
 * Widened strings still enforce that both locales define the same keys.
 */
export const sr = {
  meta: {
    title: 'Nook — bar u Leskovcu',
    description:
      'Skriveni bar u Leskovcu. Svratiš na kafu, ostaneš duže nego što si mislio.',
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
    cta: 'Pronađi nas',
    menu: 'Meni',
    menuClose: 'Zatvori meni',
  },
  hero: {
    eyebrow: 'Bar · Leskovac',
    headlineLine1: 'Neka mesta se ne traže.',
    headlineLine2: 'Na njih se naiđe.',
    sub: 'Ovde niko ne gleda na sat.',
    cta: 'Uđi',
    script: 'skriveno mesto',
    over: 'Iza vrata koja lako promašiš. Soba koja te je čekala.',
    readoutInspiration: 'Inspiracija',
    readoutSyros: 'Siros, Kikladi',
    readoutBar: 'Nook',
    readoutCity: 'Leskovac',
  },
  prostor: {
    manifesto:
      'Nook nije mesto kroz koje prolaziš. Ovde se ostane još na jednu kafu. Pa još na jedan koktel.',
    manifesto2:
      'Dođeš da radiš, da se odmoriš ili nešto proslaviš. A vratiš se zbog atmosfere.',
  },
  dan: {
    title: 'Jedan dan',
    sub: 'Jutro pripada kafi, veče koktelu. Ostatak pripada onome ko sedi preko puta tebe.',
    arrive: 'Koste Stamenkovića 23 · Leskovac',
    arriveScript: 'I tu si.',
    pin: 'Leskovac',
  },
  karta: {
    title: 'Karta',
    note: 'Cene su u dinarima. Ako imate alergije ili posebne želje, recite osoblju.',
    currency: 'RSD',
    cardDrinks: 'Piće',
    cardKitchen: 'Kuhinja',
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
    note: 'Karta se menja. Ova tri ostaju.',
  },
  recenzije: {
    title: 'Recenzije',
    /* The figures are filled from site.json. Typed into this file they would
       be two more facts nobody remembers to update, which is how the opening
       hours ended up wrong on all seven days. */
    claim: '{count} ljudi je ostavilo recenziju. Svih {count} je dalo {score}.',
    note: 'Mi bismo mogli da pričamo. Bolje da čuješ njih.',
    google: 'Google recenzija',
    localGuide: 'Local Guide',
    /* Lives here rather than under footer: the noun belongs to reviews, and
       both the footer rating and the Local Guide count inflect it. */
    reviewNoun: { one: 'recenzija', few: 'recenzije', other: 'recenzija' },
  },
  galerija: {
    eyebrow: 'Galerija',
    title: 'Ovako izgleda.',
    note: 'Pre nego što svratiš.',
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
    concept: 'Koncept · sadržaj ilustrativan',
    legal: 'Sva prava zadržana.',
    madeBy: 'Brending — 134agcy',
  },
  press: {
    quote:
      '„Nook je u isto vreme hidden spot, ali i mesto koje će ubrzo svima postati poznato i omiljeno."',
    source: 'Journal.rs',
  },
};

export type Dictionary = typeof sr;
