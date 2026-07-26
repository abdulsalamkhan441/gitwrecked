# GitWrecked 🔥

Paste in a GitHub username, get your profile mercilessly (but accurately) roasted. GitWrecked pulls real stats from the GitHub API — repo count, stars, followers, activity, bio, language spread — and turns them into a single, brutally specific paragraph, complete with a letter grade, a "damage meter," and a shareable receipt card.

## Features

- **Two intensity modes** — `mild` for a gentle ribbing, `deep-fried` for no mercy
- **Rule-based roast engine** — dozens of heuristics (dead repos, fork-only portfolios, empty bios, buzzword-stuffed profiles, follower ratios, etc.) get stitched into one natural-sounding paragraph instead of a bullet list
- **Grading system** — S through F, driven by a normalized "uselessness score"
- **Damage meter** — visual score breakdown per profile
- **Badges** — earned based on profile patterns
- **Narrator** — text-to-speech read-aloud of your roast, plus reactive sound effects
- **Shareable roast card** — a receipt-style image/card you can copy or share
- **Leaderboard** — see how roasted profiles stack up

## Getting Started

Install dependencies and run the dev server:

```bash
npm install
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) to try it out.

### Environment variables

The app calls the GitHub REST API server-side to fetch profile and repo data. Create a `.env.local` file with:

```bash
GITHUB_TOKEN=your_github_personal_access_token
```

A token isn't strictly required for public data, but GitHub's unauthenticated rate limit (60 requests/hour) is easy to hit during development — an authenticated token bumps that to 5,000/hour and helps avoid the "GitHub data looks wrong/stale" issue that unauthenticated rate-limit fallbacks can cause. A token with no extra scopes (just public read access) is enough.

## Project structure

```
app/
  page.tsx                     # landing page — enter a username
  [username]/page.tsx          # roast report page
  api/roast/[username]/route.ts  # server route — fetches GitHub data, generates the roast
  utils/
    roastEngine.ts             # rule engine that scores a profile and composes the roast text
    badges.ts                  # badge definitions/logic
    sounds.ts                  # sound effect playback
    useNarrator.ts             # text-to-speech hook
  components/
    AmbientBackground.tsx
    GlassPanel.tsx
    DamageMeter.tsx
    RoastCard.tsx
    ExcuseButtons.tsx
```

## How a roast is generated

1. `app/api/roast/[username]/route.ts` fetches the user's GitHub profile and repos.
2. `roastEngine.ts` runs that data through a set of rules (e.g. "10+ repos, zero stars", "bio has buzzwords", "70%+ of repos are stale"). Each triggered rule contributes a scored fragment.
3. The fragments are stitched into one paragraph with connective phrasing so it reads like a single voice, not a list.
4. A severity score maps to a letter grade and a 0–100 "uselessness score" shown on the damage meter.

## Tech stack

- [Next.js](https://nextjs.org) (App Router)
- TypeScript
- Tailwind CSS
- [Geist](https://vercel.com/font) font via `next/font`

## Deploy

The easiest way to deploy is [Vercel](https://vercel.com/new), from the creators of Next.js. See the [Next.js deployment docs](https://nextjs.org/docs/app/building-your-application/deploying) for details. Remember to set `GITHUB_TOKEN` in your deployment environment's variables as well.

## Learn more

- [Next.js Documentation](https://nextjs.org/docs)
- [GitHub REST API docs](https://docs.github.com/en/rest) — useful if you're debugging rate limits or pagination on the fetch route