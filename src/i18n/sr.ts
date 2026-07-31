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
  nav: {
    prostor: 'Prostor',
    dan: 'Jedan dan',
    karta: 'Karta',
    kontakt: 'Kontakt',
    cta: 'Pronađi nas',
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
  recenzije: {
    title: 'Recenzije',
    score: '5,0',
    meta: '20 recenzija · Google',
  },
  kontakt: {
    title: 'Praktično',
    addressLabel: 'Adresa',
    priceLabel: 'Cena',
    nowLabel: 'Sada',
    addressLines: 'Koste Stamenkovića 23|Leskovac 16000',
    hoursValue: 'Svakog dana|08 — 24',
    priceValue: 'RSD 500 — 1.000|po osobi',
    hoursLabel: 'Radno vreme',
    phoneLabel: 'Telefon',
    socialLabel: 'Instagram',
    address: 'Koste Stamenkovića 23, Leskovac',
    phone: '+381 00 000 0000', // PLACEHOLDER — confirm with owners
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
    rating: '5,0 — 20 recenzija',
    boundaries: 'Granice © OpenStreetMap contributors, ODbL',
    concept: 'Koncept — sadržaj ilustrativan',
    legal: 'Sva prava zadržana.',
    madeBy: 'Brending — 134agcy',
  },
};

export type Dictionary = typeof sr;
