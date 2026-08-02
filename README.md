# Nook Bar

The site for Nook, a bar at Koste Stamenkovića 23 in Leskovac.

It's one page, in two languages. Serbian is the default and sits at `/`, English
at `/en`. Both are built from the same components — the only thing that changes
is which strings get pulled in.

## Getting it running

```bash
npm install
npm run dev
```

That's it — http://localhost:4321.

`npm run build` produces the static site, `npm run preview` serves what it built.
Tests are `npm run test:unit` (fast, pure logic) and `npm run test:e2e` (slower,
runs a real browser at desktop, mobile, and reduced-motion settings). `npm run
check` type-checks everything.

## Changing what's on the page

Most edits don't need a developer.

Cocktails and prices live in `src/content/menu/`, one small JSON file per drink.
Reviews are in `src/content/reviews/`, the four "Jedan dan" cards in
`src/content/dan/`, and opening hours in `src/content/hours.json`. Wording that
isn't tied to a specific item — headings, buttons, the manifesto — is in
`src/i18n/sr.ts` and `src/i18n/en.ts`.

All of it is validated when the site builds, so a typo or a forgotten
translation stops the build instead of quietly showing up on the page. If you
add a Serbian string and forget the English one, you'll hear about it
immediately.

Worth knowing: `hours.json` feeds three places at once — the open/closed pill,
the clock in the footer, and the opening hours Google reads. Change it once and
all three follow.

## What's still fake

Anything marked `"placeholder": true` is waiting for the real thing. Right now
that's the menu, the four day cards, and the 08–24 opening hours — those hours
in particular are a guess and should be confirmed before launch.

The reviews are real: trimmed public Google reviews, left in English because
that's how people wrote them. Translating someone's words and still putting
their name under them isn't honest, so they read the same in both languages.

The photography isn't real either. The warm room behind the hero and the four
card images are CSS gradients standing in until there are actual photos of the
bar.

## Before you change the code

A few things here look like they could be tidied up but shouldn't be.

**The map of Serbia includes Kosovo.** That was a deliberate decision, and the
outline is stitched together specifically to render as one landmass with no
internal border. If you regenerate it from the original source without knowing
that, you'll quietly redraw a politically loaded boundary on a Serbian
business's website. Read `src/assets/ASSETS.md` first.

**The animation numbers came from somewhere.** The hero scaling to exactly 14×,
the odd-looking percentages, the route waypoints — those were arrived at by
iteration in a prototype. They look arbitrary because the process that produced
them isn't visible in the code. Changing them is a design call, not cleanup.

**Finished states live in CSS; JavaScript winds them backwards.** Everything
that animates is styled as though it has already finished, and its script only
rewinds it when it's actually going to play. That's what makes the site read as
a complete page for anyone who's asked their system to reduce motion, instead of
a page frozen half-built. There are tests covering this, and they will fail if
someone inverts it.

**`docs/` stays on your machine.** It's gitignored on purpose.

## Deploying

It's a static site with the Vercel adapter attached. Every page is built ahead
of time. The adapter is there so that if something ever genuinely needs to run
per-request, that one route can opt in without rearranging the project. Nothing
does today.

## Editing the content (Keystatic)

Anđela and Dimitrije edit the site themselves at **`/keystatic`** on the
deployed URL. Every collection on the site is there: the story sections, the
people, the questions, the drinks, the photographs, the Instagram posts, the
reviews, the opening hours and the business details.

**An edit is a commit.** Saving in Keystatic writes to this repository and
triggers a rebuild. That means a bad edit can be reverted like any other
commit, and an edit the schemas reject fails the build instead of reaching the
site — `src/content/schemas.ts` is still the authority, not Keystatic.

### What an admin has to set up once

GitHub mode needs a GitHub App, registered once against this repository. It
produces four values, set as environment variables in Vercel and **never
committed**:

| Variable | From |
|---|---|
| `KEYSTATIC_GITHUB_CLIENT_ID` | the GitHub App |
| `KEYSTATIC_GITHUB_CLIENT_SECRET` | the GitHub App |
| `KEYSTATIC_SECRET` | any random string you generate |
| `PUBLIC_KEYSTATIC_GITHUB_APP_SLUG` | the App's URL slug |

Until that exists, production Keystatic cannot authenticate. Local development
does not need any of it: `npm run dev` runs Keystatic in local mode, writing
straight to the working tree.

### The friction, stated up front

**Each owner needs a GitHub account and access to this repository.** That is
the cost of not running a CMS — there is no server, no database and no monthly
bill, and the trade is that editing goes through GitHub's login.

### Why `npm run preview` is not `astro preview`

The Keystatic admin is the only server-rendered route in the project, and the
Vercel adapter does not implement `astro preview` — it fails rather than
serving anything. `npm run preview` therefore runs `scripts/preview-static.mjs`,
a dependency-free static server over `dist/client`, which is exactly the bytes
Vercel serves for the public site. The Playwright suite runs against it. The
admin route is not served there, and no test touches it.
