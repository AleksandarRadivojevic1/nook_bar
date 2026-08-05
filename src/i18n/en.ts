import type { Dictionary } from './sr';

// Typed as Dictionary on purpose: a missing key is a typecheck error, not a
// blank element at runtime.
export const en: Dictionary = {
  meta: {
    title: 'Nook — a bar in Leskovac',
    description:
      'A hidden bar in Leskovac. You come in for a coffee and stay longer than you meant to.',
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
    cta: 'Find us',
    menu: 'Menu',
    menuClose: 'Close menu',
  },
  hero: {
    eyebrow: 'Bar · Leskovac',
    headlineLine1: "Some places you don't look for.",
    headlineLine2: 'You come across them.',
    sub: 'Nobody here watches the clock.',
    cta: 'Step in',
    script: 'hidden spot',
    over: 'Behind a door you could easily miss. The room that was waiting for you.',
    readoutInspiration: 'Inspiration',
    readoutSyros: 'Syros, Cyclades',
    readoutBar: 'Nook',
    readoutCity: 'Leskovac',
  },
  prostor: {
    manifesto:
      "Nook isn't somewhere you simply pass through. It's the place where one coffee turns into two, and one drink becomes an evening.",
    manifesto2:
      "Whether you're here to work, unwind or celebrate, the atmosphere keeps people coming back.",
  },
  dan: {
    title: 'One day',
    sub: "Morning belongs to coffee, evening to cocktails. The rest belongs to whoever's sitting across from you.",
    arrive: 'Koste Stamenkovića 23 · Leskovac',
    arriveScript: 'And there you are.',
    pin: 'Leskovac',
  },
  karta: {
    title: 'Menu',
    note: 'Prices are in dinars. Allergies or anything else, just tell the staff.',
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
    note: "The menu changes. These three don't.",
  },
  recenzije: {
    title: 'Reviews',
    claim: '{count} people left a review. All {count} gave it {score}.',
    note: 'We could talk. Better you hear them.',
    google: 'Google review',
    localGuide: 'Local Guide',
    reviewNoun: { one: 'review', few: 'reviews', other: 'reviews' },
  },
  galerija: {
    eyebrow: 'Gallery',
    title: 'This is what it looks like.',
    note: 'Before you drop by.',
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
    concept: 'Concept · illustrative content',
    legal: 'All rights reserved.',
    madeBy: 'Branding — 134agcy',
  },
  press: {
    quote:
      'Nook is a hidden spot and, at the same time, a place everyone will soon come to know and love.',
    source: 'Journal.rs',
  },
};
