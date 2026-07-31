import type { Dictionary } from './sr';

// Typed as Dictionary on purpose: a missing key is a typecheck error, not a
// blank element at runtime.
export const en: Dictionary = {
  meta: {
    title: 'Nook — a bar in Leskovac',
    description:
      'A hidden spot in Leskovac. Coffee from morning, cocktails until midnight, and no clock on the wall.',
  },
  nav: {
    prostor: 'The room',
    dan: 'One day',
    karta: 'Menu',
    kontakt: 'Visit',
    cta: 'Find us',
  },
  hero: {
    eyebrow: 'Bar · Leskovac',
    headlineLine1: 'Some places are not looked for.',
    headlineLine2: 'You come across them.',
    sub: 'Coffee from morning, cocktails until midnight, and no clock on the wall.',
    cta: 'Step in',
    script: 'hidden spot',
    over: 'Behind a door you could easily miss — a room that was waiting for you.',
    readoutInspiration: 'Inspiration',
    readoutSyros: 'Syros, Cyclades',
    readoutBar: 'Nook',
    readoutCity: 'Leskovac',
  },
  prostor: {
    manifesto:
      'Nook is a small bar in Leskovac. The materials are ordinary — plaster, wood, brass going dark. Nothing pretends to be older than it is. The drinks are honest, the measures are full, and the music is quiet enough to talk over.',
  },
  dan: {
    title: 'One day',
    sub: 'From the first coffee to the last cocktail — the bar changes four times a day.',
    arrive: 'Koste Stamenkovića 23 · Leskovac',
    arriveScript: 'And there you are.',
    pin: 'Leskovac',
  },
  karta: {
    title: 'Menu',
    note: 'Deliberately short. It changes when the season does.',
    currency: 'RSD',
  },
  recenzije: {
    title: 'Reviews',
    score: '5.0',
    meta: '20 reviews · Google',
  },
  kontakt: {
    title: 'Practical',
    addressLabel: 'Address',
    hoursLabel: 'Hours',
    phoneLabel: 'Phone',
    socialLabel: 'Instagram',
    address: 'Koste Stamenkovića 23, Leskovac',
    phone: '+381 00 000 0000', // PLACEHOLDER — confirm with owners
  },
  status: {
    open: 'Open · until {close}',
    closed: 'Closed · opens at {open}',
  },
  footer: {
    legal: 'All rights reserved.',
    madeBy: 'Branding — 134agcy',
  },
};
