# DormDesign

**See your dorm room in 3D before move-in day — then fill it with furniture that actually fits.**

Type in your building and room number and DormDesign renders a true-to-life,
navigable 3D model of your actual space — real dimensions, real windows, real
corners. Style it to a vibe you love, then shop real products from IKEA and
Target, filtered to only what physically fits.

> Now live for Columbia's Broadway dorms.

## What you can do

- **Find your room** — Pick your building and room number. Broadway Hall has real
  floor plans and live 3D wired up today.
- **Walk it in 3D** — A model generated from real floor plans and photos, accurate
  to the centimeter. Rotate it, walk it, tap any object to swap or measure it.
- **Style with the agent** — Drop in a few inspiration pics or pick a vibe; the
  agent turns them into design directions and restyles your room to match.
- **Shop what fits** — Real IKEA and Target products, filtered against your room's
  true dimensions. No measuring tape, no returns.

## Getting started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

Want to skip the setup and just look around? The fastest path:

- `/` — the landing page
- `/onboarding` — the find-your-room flow
- `/room/B1207` — a fully baked demo room you can tour right now

## Configuration

3D worlds are generated through the [World Labs Marble API](https://docs.worldlabs.ai/api).
To generate new rooms, add a key to `.env.local`:

```bash
WORLDLABS_API_KEY=your_key_here
```

Without a key, the baked demo room (`/room/B1207`) still works end to end.

## Scripts

| Command | What it does |
| --- | --- |
| `npm run dev` | Start the dev server |
| `npm run build` | Production build |
| `npm run start` | Serve the production build |
| `npm run lint` | Lint the codebase |
| `npm run scrape:broadway` | Refresh Broadway room/floor-plan data |
| `npm run scrape:floorplans` | Download floor-plan images |

## Built with

Next.js 16 · React 19 · Three.js (React Three Fiber) · Tailwind CSS · Zustand ·
World Labs Marble
