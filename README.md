<p align="center">
  <img src="public/brand/tzero-logo.png" alt="T-Zero orbital monogram" width="160" />
</p>

<h1 align="center">T–ZERO</h1>
<p align="center"><strong>A bigger perspective on space exploration.</strong></p>
<p align="center">Explore upcoming launches, discover the machines behind them, and follow humanity beyond Earth.</p>

<p align="center">
  <a href="#a-look-inside">Screenshots</a> ·
  <a href="#features">Features</a> ·
  <a href="#run-locally">Run locally</a> ·
  <a href="#android">Android</a> ·
  <a href="public/models/ATTRIBUTION.md">Asset credits</a>
</p>

---

T-Zero is a space mission dashboard built around an interactive Earth, source-backed launch schedules, and a hands-on 3D heritage collection. A dark mission-control interface, mint accents, and restrained motion bring the experience together across desktop and mobile.

## A look inside

### Your orbital overview

An interactive Earth connects each mission to its launch site, with mission details, UTC/local time, bookmarks, and countdowns when the source provides sufficient time precision.

![T-Zero overview with interactive Earth and featured mission](docs/images/overview.png)

_Screenshots capture the app at a point in time. Mission schedules, counts, and countdowns will change as the source updates._

### Get closer to the machines

Rotate NASA-sourced models, focus on their upper and lower sections, and explore an educational Saturn V stage-separation diagram.

![NASA heritage collection with the Saturn V model and component controls](docs/images/fleet-explorer.png)

|                                          Friendship 7                                          |                                       Ares I                                        |
| :--------------------------------------------------------------------------------------------: | :---------------------------------------------------------------------------------: |
| ![Friendship 7 capsule with restored visualization materials](public/models/atlas-mercury.png) | ![Ares I with NASA color materials and corrected framing](public/models/ares-i.png) |
|                 NASA capsule geometry with reference-based restored finishes.                  |  NASA's colored historical concept model, with stray duplicate fragments removed.   |

### The moments that brought us here

Browse recent launches or revisit selected milestones, from the beginning of the space age to new views of the universe.

![Mission History showing curated exploration milestones](docs/images/mission-history.png)

## Features

| Experience                 | What you can do                                                                                                                                   |
| -------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Orbital overview**       | Rotate Earth, locate a selected launch site, inspect a mission, switch UTC/local time, and save missions on your device.                          |
| **Launch Center**          | Search missions, filter providers and statuses, view saved missions, and switch between list and monthly calendar views. Filters live in the URL. |
| **Fleet Explorer**         | Browse vehicle photos and specifications, filter manufacturers, and compare two rockets using a specification table and common-scale height bars. |
| **NASA 3D collection**     | Explore Saturn V, the Friendship 7 capsule, and an Ares I concept with rotate, pause, zoom, reset, and component-focus controls.                  |
| **Mission History**        | Filter a recent-launch timeline and explore four curated, NASA-linked historical milestones.                                                      |
| **Analytics**              | Filter a recent sample by provider and date, inspect launch activity and outcomes, read accessible chart data, and export CSV.                    |
| **Mobile & accessibility** | Use responsive bottom navigation, keyboard-accessible controls, reduced-motion support, and static model previews when WebGL is unavailable.      |
| **Android**                | Export the frontend for the existing Capacitor Android project, with a separately deployed API backend.                                           |

### Data, with context

- Launch schedules and modern fleet specifications come from [The Space Devs](https://thespacedevs.com/llapi).
- Schedules can change. Month- or year-only estimates are not pinned to individual calendar days, and precise countdowns require minute or second precision.
- History and analytics use **up to 100 recent records**, not the complete historical archive. Coverage dates and the outcome denominator are displayed in the app.
- Shared normalized caching reduces repeated provider requests. Unavailable, empty, loading, and rate-limited states are explicit.
- Saved missions are stored in the current browser/device; no account is required.
- The 3D collection is a heritage collection. Friendship 7 depicts the capsule, and Ares I is labeled as a historical concept. Models and the staging diagram are visual references, not engineering simulations.

## Built with

**Next.js App Router · React · TypeScript · Tailwind CSS · Three.js · Framer Motion · Recharts · Lucide · Capacitor**

GLB models and the Draco decoder are served locally. WebGL scenes load on demand, cap rendering resolution, and skip rendering while hidden. Reduced-motion preferences disable automatic rotation.

## Run locally

Use Node.js **22.18 or newer** to match the built-in TypeScript test runner.

```bash
git clone https://github.com/AdithyaSM31/T-Zero-Space-Mission-Dashboard.git
cd T-Zero-Space-Mission-Dashboard
npm install
npm run dev
```

Open [localhost:3000](http://localhost:3000). The web app uses its own Next.js API routes by default, so no API URL is needed for ordinary local development. Network access to the launch provider is required for current schedules; the labeled design preview and bundled heritage assets remain available independently.

### Checks and production build

```bash
npm test
npx tsc --noEmit
npm run build
npm start
```

Tests cover outcome calculations, calendar date precision, preserved capsule geometry, distinct model materials, and Ares I scene cleanup.

## Android

The Android frontend runs inside Capacitor and requests schedules from your deployed Next.js backend. Compile an APK with **JDK 21**, **Android SDK API 36**, and Android Studio.

1. Deploy the Next.js app so its `/api` endpoints are reachable over HTTPS.
2. Set your actual backend origin and export the frontend:

   ```powershell
   $env:NEXT_PUBLIC_API_URL = 'https://your-project.vercel.app'
   npm run build:android
   npx cap sync android
   npx cap open android
   ```

3. Build and run the app in Android Studio.

`build:android` temporarily excludes server-only routes from static export and restores them afterward. If a process is forcibly interrupted and leaves `.android-build-api`, restore that directory to `src/app/api` before retrying.

To validate static export without a deployed backend:

```bash
npm run check:android
```

This check uses a deliberately unusable placeholder API origin; its output is **not a release build**. Physical-device GPU performance, TalkBack, and battery usage require device testing.

## Brand & visual assets

The new T-Zero mark combines a **T**, an orbital **zero**, and a navigation star. The app, favicon, README, and Android assets share the same mint-and-ice identity.

- [Production logo](public/brand/tzero-logo.png) · [High-resolution master](public/brand/tzero-logo-master.png)
- [Brand notes and generation prompt](public/brand/README.md)
- [NASA models, Earth imagery, and decoder attribution](public/models/ATTRIBUTION.md)

Regenerate logo sizes and Android artwork from the checked-in master:

```bash
node scripts/generate-brand-assets.cjs
npx capacitor-assets generate --android --iconBackgroundColor '#080c12' --splashBackgroundColor '#080c12'
```

## Project map

```text
src/app/              Routes, shared layout, styles, and API endpoints
src/components/       Mission UI, charts, Earth, and model viewers
src/lib/              Data types, normalized source caching, and metrics
public/brand/         Logo master, app-size exports, and brand notes
public/models/        NASA heritage assets, previews, and attribution
public/draco/         Local model decoder and license
public/textures/      Earth surface texture
docs/images/          Current README screenshots
assets/               Android logo and splash sources
android/              Capacitor Android project
scripts/              Android export, brand generation, and model repairs
tests/                Metrics and model regression tests
```

See [the implementation notes](DESIGN_PLAN.md) for design decisions and validation scope.

---

<p align="center"><strong>One planet. Infinite possibilities.</strong><br/>Built for the curious.</p>
