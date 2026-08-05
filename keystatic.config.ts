import { collection, config, fields, singleton } from '@keystatic/core';

/**
 * What Anđela and Dimitrije see.
 *
 * Every collection here mirrors `src/content/schemas.ts` field for field. The
 * zod schemas are still the authority: an entry saved here that the schema
 * rejects fails the BUILD rather than reaching the site, which is the safety
 * net that makes handing this over reasonable. `tests/unit/keystatic.test.ts`
 * checks the two lists have not drifted apart.
 *
 * Wired last on purpose. Configuring it before the schemas were final would
 * have meant configuring it twice.
 */

/** The `localized` zod object, as an editor field. Never two parallel folders. */
const localized = (label: string, multiline = false) =>
  fields.object(
    {
      sr: multiline
        ? fields.text({ label: `${label} (srpski)`, multiline: true })
        : fields.text({ label: `${label} (srpski)` }),
      en: multiline
        ? fields.text({ label: `${label} (English)`, multiline: true })
        : fields.text({ label: `${label} (English)` }),
    },
    { label },
  );

const order = fields.integer({
  label: 'Order',
  description: 'Lower numbers come first on the page.',
  validation: { isRequired: true },
});

const dayHours = (label: string) =>
  fields.object(
    {
      open: fields.text({ label: 'Opens', defaultValue: '07:00' }),
      close: fields.text({ label: 'Closes', defaultValue: '24:00' }),
    },
    { label },
  );

export default config({
  // Local for a developer, GitHub for the owners. Never hardcoded: local mode
  // in production would silently discard every edit on the next deploy, and
  // github mode in development would commit to the repo every time someone
  // touches content on their own machine.
  //
  // Registering the GitHub App required forcing this to `github` briefly,
  // because Keystatic's created-app callback refuses to run outside
  // development and the setup screen only appears in github mode. If that
  // ever has to happen again, flip it, run /keystatic/setup on localhost,
  // then put this back.
  storage: import.meta.env.DEV
    ? { kind: 'local' }
    : { kind: 'github', repo: { owner: 'AleksandarRadivojevic1', name: 'nook_bar' } },

  ui: {
    brand: { name: 'Nook' },
    navigation: {
      'Tekst na sajtu': ['story', 'people', 'practical'],
      Piće: ['menu', 'signature'],
      Slike: ['gallery'],
      Ostalo: ['reviews', 'dan', 'hours', 'site'],
    },
  },

  collections: {
    story: collection({
      label: 'Sections in words',
      path: 'src/content/story/*',
      slugField: 'id',
      format: { data: 'json' },
      schema: {
        id: fields.slug({
          name: {
            label: 'Id',
            description: 'Must stay "siros" or "ljudi" — the page looks them up by name.',
          },
        }),
        eyebrow: localized('Eyebrow'),
        title: localized('Title'),
        signature: fields.text({
          label: 'Signature',
          description: 'A name written by hand, e.g. "Anđela i Dimitrije". Leave empty for Siros.',
        }),
        body: fields.array(localized('Paragraph', true), {
          label: 'Paragraphs',
          description: 'One entry per paragraph.',
          itemLabel: (item) => item.fields.sr.value.slice(0, 48),
        }),
      },
    }),

    people: collection({
      label: 'The people',
      path: 'src/content/people/*',
      slugField: 'name',
      format: { data: 'json' },
      schema: {
        name: fields.slug({ name: { label: 'Name' } }),
        photo: fields.image({
          label: 'Portrait',
          directory: 'src/assets/people',
          publicPath: '../../assets/people/',
          description: 'Optional. Without it the section is a signed statement, which is finished.',
        }),
        instagram: fields.url({
          label: 'Instagram profile',
          description:
            'Optional, and only with that person’s agreement — this links a personal account from the bar’s page.',
        }),
        order,
      },
    }),

    practical: collection({
      label: 'Questions people ask',
      path: 'src/content/practical/*',
      slugField: 'slug',
      format: { data: 'json' },
      schema: {
        // A separate slug rather than the question itself: slugField has to
        // name a top-level slug field, and a localized question is an object.
        slug: fields.slug({ name: { label: 'Id', description: 'e.g. "hrana", "rezervacije".' } }),
        question: localized('Question'),
        answer: localized('Answer', true),
        order,
      },
    }),

    menu: collection({
      label: 'Karta — grupe',
      path: 'src/content/menu/*',
      slugField: 'slugName',
      format: { data: 'json' },
      schema: {
        slugName: fields.slug({ name: { label: 'Naziv grupe (interno)' } }),
        title: localized('Naslov'),
        card: fields.select({
          label: 'Karta',
          options: [
            { label: 'Piće', value: 'pice' },
            { label: 'Kuhinja', value: 'kuhinja' },
          ],
          defaultValue: 'pice',
        }),
        measures: fields.array(fields.text({ label: 'Mera' }), {
          label: 'Mere',
          description: 'Npr. 0.03, ili 0.15 i 0.75 za vino.',
          itemLabel: (item) => item.value,
        }),
        note: localized('Napomena'),
        order,
        items: fields.array(
          fields.object({
            name: fields.text({ label: 'Naziv' }),
            prices: fields.array(fields.integer({ label: 'Cena' }), { label: 'Cene' }),
            subgroup: fields.text({ label: 'Podgrupa' }),
            desc: localized('Opis'),
            note: localized('Oznaka'),
            photo: fields.image({
              label: 'Fotografija',
              directory: 'src/assets/menu',
              publicPath: '../../assets/menu/',
              description: 'Bez nje se prikazuje logo.',
            }),
          }),
          { label: 'Stavke', itemLabel: (item) => item.fields.name.value },
        ),
      },
    }),

    signature: collection({
      label: 'Signature drinks',
      path: 'src/content/signature/*',
      slugField: 'name',
      format: { data: 'json' },
      schema: {
        name: fields.slug({ name: { label: 'Name' } }),
        tagline: localized('Tagline'),
        spec: localized('What is in it'),
        origin: localized('Origin note'),
        notes: localized('Tasting note', true),
        price: fields.integer({ label: 'Price (RSD)' }),
        photo: fields.image({
          label: 'Photograph',
          directory: 'src/assets/signature',
          publicPath: '../../assets/signature/',
        }),
        order,
      },
    }),

    gallery: collection({
      label: 'Gallery',
      path: 'src/content/gallery/*',
      slugField: 'slug',
      format: { data: 'json' },
      schema: {
        slug: fields.slug({ name: { label: 'Id' } }),
        src: fields.image({
          label: 'Photograph',
          directory: 'src/assets/gallery',
          publicPath: '../../assets/gallery/',
          validation: { isRequired: true },
        }),
        caption: localized('Caption'),
        order,
      },
    }),

    reviews: collection({
      label: 'Reviews',
      path: 'src/content/reviews/*',
      slugField: 'author',
      format: { data: 'json' },
      schema: {
        author: fields.slug({
          name: {
            label: 'Author',
            description: 'First name and last initial only.',
          },
        }),
        quote: localized('Quote', true),
        lang: fields.select({
          label: 'Written in',
          options: [
            { label: 'Serbian', value: 'sr' },
            { label: 'English', value: 'en' },
          ],
          defaultValue: 'sr',
        }),
        featured: fields.checkbox({
          label: 'Set large',
          description: 'Two or three of these across the whole section.',
          defaultValue: false,
        }),
        source: fields.select({
          label: 'Where it is from',
          options: [
            { label: 'Google', value: 'google' },
            { label: 'Google Local Guide', value: 'localGuide' },
          ],
          defaultValue: 'google',
        }),
        guideReviews: fields.integer({
          label: 'Reviews this Local Guide has written',
          description: 'Only for Local Guides. A number, not "45 recenzija" — the site writes the word.',
        }),
        order,
      },
    }),

    dan: collection({
      label: 'One day',
      path: 'src/content/dan/*',
      slugField: 'slug',
      format: { data: 'json' },
      schema: {
        slug: fields.slug({ name: { label: 'Id' } }),
        n: fields.integer({ label: 'Card number (1 to 4)' }),
        title: localized('Title'),
        body: localized('Body', true),
        when: localized('Time of day'),
        photo: fields.image({
          label: 'Photograph',
          directory: 'src/assets/dan',
          publicPath: '../../assets/dan/',
        }),
      },
    }),
  },

  singletons: {
    hours: singleton({
      label: 'Opening hours',
      path: 'src/content/hours',
      format: { data: 'json' },
      schema: {
        placeholder: fields.checkbox({ label: 'Still placeholder', defaultValue: false }),
        week: fields.object(
          {
            mon: dayHours('Monday'),
            tue: dayHours('Tuesday'),
            wed: dayHours('Wednesday'),
            thu: dayHours('Thursday'),
            fri: dayHours('Friday'),
            sat: dayHours('Saturday'),
            sun: dayHours('Sunday'),
          },
          {
            label: 'The week',
            description:
              'HH:MM, 24 hour. A closing time EARLIER than the opening one means it runs past midnight — Friday 07:00 to 01:00 is correct. The build refuses anything malformed.',
          },
        ),
      },
    }),

    site: singleton({
      label: 'Business details',
      path: 'src/content/site',
      format: { data: 'json' },
      schema: {
        streetAddress: fields.text({ label: 'Street address' }),
        addressLocality: fields.text({ label: 'Town' }),
        postalCode: fields.text({ label: 'Postal code' }),
        countryCode: fields.text({ label: 'Country code', defaultValue: 'RS' }),
        mapsUrl: fields.url({ label: 'Google Maps link' }),
        lat: fields.number({ label: 'Latitude' }),
        lng: fields.number({ label: 'Longitude' }),
        instagramUrl: fields.url({ label: 'Instagram profile' }),
        instagramHandle: fields.text({ label: 'Instagram handle', defaultValue: '@nookbar__' }),
        reviewCount: fields.integer({
          label: 'How many reviews',
          description: 'Check this against the live Google listing before launch.',
        }),
        reviewScore: fields.number({
          label: 'Average score',
          description: 'Check this against the live Google listing before launch.',
        }),
      },
    }),
  },
});
