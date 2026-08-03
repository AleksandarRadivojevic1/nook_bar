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
    siros: 'Syros',
    dan: 'One day',
    karta: 'Menu',
    potpis: 'Signature',
    galerija: 'Gallery',
    ljudi: 'The people',
    recenzije: 'Reviews',
    kontakt: 'Visit',
    instagram: 'Instagram',
    cta: 'Find us',
    menu: 'Menu',
    menuClose: 'Close menu',
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
    manifesto2:
      'The Mediterranean is the reference: stone villages, materials that have always been there, surfaces the sun finds. Beauty without effort — the kind you only notice in small things.',
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
    note: 'From the first coffee of the day to the last drink of the night. Prices in dinars. If you have allergies or other needs, tell the staff.',
    currency: 'RSD',
    cardDrinks: 'Drinks',
    cardKitchen: 'Kitchen',
  },
  hours: {
    days: {
      mon: 'Monday',
      tue: 'Tuesday',
      wed: 'Wednesday',
      thu: 'Thursday',
      fri: 'Friday',
      sat: 'Saturday',
      sun: 'Sunday',
    },
    // English does not inflect these, but the two keys have to exist because
    // Serbian does: nominative "ponoć" in a list, genitive "ponoći" after "do".
    midnight: 'midnight',
    midnightUntil: 'midnight',
  },
  potpis: {
    eyebrow: 'Signature',
    title: 'Three you remember',
    note: 'The menu changes. These three stay — they are how people know us.',
  },
  recenzije: {
    title: 'Reviews',
    claim: '{count} people left a review. All {count} gave it {score}.',
    note: 'Left as they were written.',
    google: 'Google review',
    localGuide: 'Local Guide',
    reviewNoun: { one: 'review', few: 'reviews', other: 'reviews' },
  },
  galerija: {
    eyebrow: 'Gallery',
    title: 'The room in pictures',
    note: 'A few moments from the room.',
    close: 'Close',
    prev: 'Previous',
    next: 'Next',
  },
  kontakt: {
    title: 'Practical',
    addressLabel: 'Address',
    priceLabel: 'Price',
    nowLabel: 'Now',
    priceValue: 'RSD 500 — 1,000|per person',
    hoursLabel: 'Hours',
    socialLabel: 'Instagram',
    mapLabel: 'Where we are',
    mapOpen: 'Open the map',
  },
  instagram: {
    eyebrow: 'Instagram',
    title: 'Where we keep talking',
    follow: 'Follow',
  },
  status: {
    open: 'Open · until {close}',
    closed: 'Closed · opens at {open}',
  },
  footer: {
    menuCol: 'Menu',
    socialCol: 'Social',
    locationCol: 'Location',
    ratingCol: 'Rating',
    location: 'Leskovac, Serbia',
    rating: '{score} — {count} {noun}',
    boundaries: 'Boundaries © OpenStreetMap contributors, ODbL',
    concept: 'Concept — illustrative content',
    legal: 'All rights reserved.',
    madeBy: 'Branding — 134agcy',
  },
  press: {
    quote:
      'Nook is a hidden spot and, at the same time, a place everyone will soon come to know and love.',
    source: 'Journal.rs',
  },
};
